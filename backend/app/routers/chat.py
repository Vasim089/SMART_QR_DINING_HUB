import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Response, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.ai_service import generate_ai_response, check_ollama_status
from app.tts_service import generate_neural_speech

router = APIRouter(prefix="/chat", tags=["AI Dining Assistant"])

@router.get("/tts")
async def get_neural_tts(
    text: str = Query(..., description="Text to synthesize for Waiter Venky"),
    language: str = Query("en", description="Language code (en, hi, es, fr)")
):
    """Generates natural studio-grade audio for Waiter Venky via Edge-TTS (100% Free)."""
    try:
        audio = await generate_neural_speech(text, language)
        return Response(
            content=audio,
            media_type="audio/mpeg",
            headers={
                "Cache-Control": "public, max-age=86400",
                "Content-Disposition": "inline; filename=venky_voice.mp3"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS generation error: {e}")

@router.get("/ollama-status")
async def get_ollama_status():
    """Returns the live connection state of Ollama and Qwen 2.5 3B."""
    return await check_ollama_status()

@router.post("/session")
def start_chat_session(payload: schemas.ChatSessionCreate, db: Session = Depends(get_db)):
    lang = None
    if payload.language_code:
        lang = db.query(models.Language).filter(models.Language.language_code == payload.language_code).first()

    session = models.ChatSession(
        restaurant_id=payload.restaurant_id,
        table_id=payload.table_id,
        language_id=lang.id if lang else None,
        session_token=str(uuid.uuid4())
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return {"session_token": str(session.session_token), "session_id": str(session.id)}


@router.post("/message", response_model=schemas.ChatResponse)
async def send_chat_message(payload: schemas.ChatRequest, db: Session = Depends(get_db)):
    # 1. Resolve or create chat session
    session = None
    if payload.session_token:
        session = (
            db.query(models.ChatSession)
            .filter(models.ChatSession.session_token == payload.session_token)
            .first()
        )

    if not session:
        lang = db.query(models.Language).filter(models.Language.language_code == payload.language_code).first()
        session = models.ChatSession(
            restaurant_id=payload.restaurant_id,
            table_id=payload.table_id,
            language_id=lang.id if lang else None,
            session_token=str(uuid.uuid4())
        )
        db.add(session)
        db.commit()
        db.refresh(session)

    # 2. Store customer message
    user_msg = models.ChatMessage(
        session_id=session.id,
        sender="customer",
        message=payload.message
    )
    db.add(user_msg)
    db.commit()

    # 3. Fetch past messages for conversation context (Step 9 of spec)
    past_messages = (
        db.query(models.ChatMessage)
        .filter(models.ChatMessage.session_id == session.id)
        .order_by(models.ChatMessage.created_at.asc())
        .all()
    )

    # 4. Generate AI response strictly querying available menu items
    response_text, speech_text, recommended_raw, model_used = await generate_ai_response(
        db=db,
        restaurant_id=payload.restaurant_id,
        user_query=payload.message,
        conversation_history=past_messages,
        language_code=payload.language_code or "en"
    )

    # 5. Store AI response in chat_messages
    ai_msg = models.ChatMessage(
        session_id=session.id,
        sender="ai",
        message=response_text
    )
    db.add(ai_msg)

    # 6. Record analytics event (Step 11 of spec)
    db.add(models.AnalyticsEvent(
        restaurant_id=payload.restaurant_id,
        table_id=payload.table_id,
        event_type="ai_conversation",
        event_data={
            "query": payload.message,
            "model_used": model_used,
            "dishes_recommended": [d["name"] for d in recommended_raw]
        }
    ))
    db.commit()

    # 7. Convert dishes to schema
    recommended_dishes = [
        schemas.DishRecommendation(
            id=d["id"],
            name=d["name"],
            price=d["price"],
            effective_price=d["effective_price"],
            is_today_special=d["is_today_special"],
            is_vegetarian=d["is_vegetarian"],
            is_spicy=d["is_spicy"],
            is_jain=d["is_jain"],
            description=d.get("description"),
            image_url=d.get("image_url")
        )
        for d in recommended_raw
    ]

    # Refresh message list for frontend display
    all_msgs = (
        db.query(models.ChatMessage)
        .filter(models.ChatMessage.session_id == session.id)
        .order_by(models.ChatMessage.created_at.asc())
        .all()
    )

    msg_schemas = [
        schemas.ChatMessageSchema(
            id=m.id,
            sender=m.sender,
            message=m.message,
            created_at=m.created_at
        )
        for m in all_msgs
    ]

    return schemas.ChatResponse(
        session_token=str(session.session_token),
        response_text=response_text,
        speech_text=speech_text,
        detected_language=payload.language_code or "en",
        model_used=model_used,
        recommended_dishes=recommended_dishes,
        messages=msg_schemas
    )
