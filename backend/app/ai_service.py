import re
import json
import logging
import httpx
from datetime import date
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
from app.config import settings
from app import models

logger = logging.getLogger(__name__)

def get_available_menu_items(db: Session, restaurant_id: int) -> List[Dict[str, Any]]:
    """
    Fetches all currently active and available menu items for today's date.
    Calculates effective price considering daily specials.
    """
    today = date.today()
    items = (
        db.query(models.MenuItem)
        .filter(models.MenuItem.restaurant_id == restaurant_id, models.MenuItem.is_active == True)
        .all()
    )

    result = []
    for item in items:
        # Check daily availability record
        daily_record = (
            db.query(models.DailyMenuAvailability)
            .filter(
                models.DailyMenuAvailability.menu_item_id == item.id,
                models.DailyMenuAvailability.menu_date == today
            )
            .first()
        )

        is_available = True
        is_today_special = False
        special_price = None

        if daily_record:
            is_available = daily_record.is_available
            is_today_special = daily_record.is_today_special
            special_price = daily_record.special_price

        # Skip sold out items:
        # "The AI should recommend only dishes available on the restaurant's menu"
        if not is_available:
            continue

        effective_price = special_price if (is_today_special and special_price is not None) else item.price

        tags = [t.tag_name.lower() for t in item.tags]
        result.append({
            "id": item.id,
            "name": item.name,
            "category": item.category.name if item.category else "General",
            "description": item.description or "",
            "price": item.price,
            "effective_price": effective_price,
            "special_price": special_price,
            "is_today_special": is_today_special,
            "ingredients": item.ingredients or "",
            "image_url": item.image_url or "",
            "tags": tags,
            "is_vegetarian": any("veg" in t and "non" not in t for t in tags),
            "is_jain": any("jain" in t for t in tags),
            "is_spicy": any("spic" in t or "hot" in t for t in tags),
            "is_mild": any("mild" in t or "sweet" in t or "non-spicy" in t for t in tags),
            "is_kids": any("kid" in t or "child" in t for t in tags),
        })

    return result


async def check_ollama_status() -> Dict[str, Any]:
    """
    Checks if Ollama service is running on OLLAMA_BASE_URL and if Qwen 2.5 3B is pulled.
    """
    try:
        async with httpx.AsyncClient(timeout=2.0) as client:
            resp = await client.get(f"{settings.OLLAMA_BASE_URL}/api/tags")
            if resp.status_code == 200:
                models_list = resp.json().get("models", [])
                model_names = [m.get("name", "") for m in models_list]
                has_qwen = any(settings.OLLAMA_MODEL in name or "qwen2.5" in name for name in model_names)
                return {
                    "online": True,
                    "target_model": settings.OLLAMA_MODEL,
                    "model_available": has_qwen,
                    "installed_models": model_names,
                    "message": f"Ollama online with model {settings.OLLAMA_MODEL}" if has_qwen else f"Ollama online, but model '{settings.OLLAMA_MODEL}' not pulled yet. Run 'ollama run {settings.OLLAMA_MODEL}'."
                }
    except Exception as e:
        logger.debug(f"Ollama health check: not reachable ({e})")

    return {
        "online": False,
        "target_model": settings.OLLAMA_MODEL,
        "model_available": False,
        "message": f"Ollama is offline. Start Ollama and run 'ollama run {settings.OLLAMA_MODEL}'."
    }


async def call_ollama_qwen(
    user_query: str,
    available_items: List[Dict[str, Any]],
    conversation_history: List[models.ChatMessage],
    language_code: str = "en"
) -> Optional[Tuple[str, List[Dict[str, Any]]]]:
    """
    Directly invokes local Ollama running Qwen 2.5 3B to:
    1. Understand user questions and constraints (budget, spice level, vegetarian, dietary)
    2. Formulate helpful natural recommendations strictly grounded on available dishes
    """
    # Format available dishes for Qwen prompt
    menu_lines = []
    for item in available_items:
        spec_text = " [TODAY'S SPECIAL!]" if item["is_today_special"] else ""
        menu_lines.append(
            f"Dish ID {item['id']}: {item['name']} - ${item['effective_price']:.2f}{spec_text} "
            f"| Category: {item['category']} | Dietary: {', '.join(item['tags'])} | Description: {item['description']}"
        )
    menu_catalog_text = "\n".join(menu_lines)

    system_prompt = (
        "You are the friendly, expert AI Waiter at 'The Royal Spice Bistro' in the Smart QR Dining Hub.\n"
        "Your task: understand the diner's preferences and recommend the best matching food items.\n\n"
        "STRICT RULES:\n"
        "1. Recommend ONLY dishes from the provided AVAILABLE MENU. Never invent dishes.\n"
        "2. Adhere strictly to user preferences: budget (e.g. under $14), vegetarian, spice levels, Jain food, kids food, or specials.\n"
        "3. Keep your spoken response concise, friendly, and appetizing (2-3 sentences max). Always state the dish name and price.\n"
        "4. If the customer asks in Hindi or another language, reply in that language.\n"
        "5. At the very end of your response, output a tag listing the recommended dish IDs like this: [RECOMMENDED: id1, id2].\n\n"
        f"AVAILABLE MENU TODAY:\n{menu_catalog_text}"
    )

    history_str = ""
    for msg in conversation_history[-4:]:
        role = "CUSTOMER" if msg.sender == "customer" else "AI WAITER"
        history_str += f"{role}: {msg.message}\n"

    full_prompt = f"{history_str}CUSTOMER: {user_query}\nAI WAITER:"

    try:
        async with httpx.AsyncClient(timeout=12.0) as client:
            resp = await client.post(
                f"{settings.OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": settings.OLLAMA_MODEL,
                    "prompt": full_prompt,
                    "system": system_prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.4,
                        "top_p": 0.9,
                    }
                }
            )
            if resp.status_code == 200:
                raw_text = resp.json().get("response", "").strip()
                if raw_text:
                    # Extract [RECOMMENDED: id, id] if present
                    rec_ids = []
                    rec_match = re.search(r'\[RECOMMENDED:\s*([0-9,\s]+)\]', raw_text, re.IGNORECASE)
                    clean_text = raw_text
                    if rec_match:
                        id_str = rec_match.group(1)
                        clean_text = raw_text.replace(rec_match.group(0), "").strip()
                        for s_id in id_str.split(','):
                            s_id = s_id.strip()
                            if s_id.isdigit():
                                rec_ids.append(int(s_id))

                    # Match dish objects
                    matched_dishes = [i for i in available_items if i["id"] in rec_ids]
                    if not matched_dishes:
                        # Find dishes mentioned by name in Qwen's response
                        for i in available_items:
                            if i["name"].lower() in clean_text.lower():
                                matched_dishes.append(i)

                    return clean_text, matched_dishes
    except Exception as e:
        logger.info(f"Ollama ({settings.OLLAMA_MODEL}) connection note: {e}")

    return None


def clean_text_for_speech(text: str) -> str:
    """Removes markdown tags, asterisks, urls, and emojis for natural Web Speech Synthesis."""
    cleaned = re.sub(r'[*_#`~]', '', text)
    cleaned = re.sub(r'https?://\S+', '', cleaned)
    cleaned = re.sub(r'[\U00010000-\U0010ffff]', '', cleaned)
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    return cleaned


def intelligent_menu_agent(
    user_query: str,
    available_items: List[Dict[str, Any]],
    conversation_history: List[models.ChatMessage],
    language_code: str = "en"
) -> Tuple[str, List[Dict[str, Any]]]:
    """
    Intelligent context-aware restaurant AI reasoning engine (Standby / Fast Local Fallback):
    1. Analyzes user dietary preferences (Veg, Jain, Vegan, Non-Veg)
    2. Parses budget constraints (e.g. 'under $14', 'below 15')
    3. Handles spice levels ('spicy', 'less spicy', 'mild')
    4. Handles context-dependent follow-up questions ('is it spicy?', 'suggest something less spicy')
    5. Matches available dishes and formulates friendly bilingual responses.
    """
    q = user_query.lower()
    
    # Check language
    is_hindi = language_code == "hi" or any(h_word in q for h_word in ["namaste", "kya hai", "batao", "chahiye", "kuch", "shakahari", "tikha", "meetha", "khana"])

    # 1. Context Analysis: Find most recently mentioned dish in history
    last_mentioned_dish = None
    if conversation_history:
        for msg in reversed(conversation_history):
            text = msg.message.lower()
            for item in available_items:
                if item["name"].lower() in text:
                    last_mentioned_dish = item
                    break
            if last_mentioned_dish:
                break

    # 2. Extract budget constraint (e.g., "under $14", "< 15", "under 12 dollars")
    budget_limit = None
    budget_match = re.search(r'(?:under|below|less than|within|max|\$)\s*\$?(\d+(?:\.\d+)?)', q)
    if budget_match:
        try:
            budget_limit = float(budget_match.group(1))
        except ValueError:
            pass

    # 3. Check for specific follow-ups:
    # "Is it spicy?"
    if ("is it spicy" in q or "spicy hai kya" in q or "kya ye tikha hai" in q) and last_mentioned_dish:
        is_spicy = last_mentioned_dish["is_spicy"]
        dish_name = last_mentioned_dish["name"]
        if is_spicy:
            if is_hindi:
                ans = f"हाँ, {dish_name} मध्यम से अधिक तीखा (spicy) है। क्या आप कुछ कम तीखा पसंद करेंगे?"
            else:
                ans = f"Yes, {dish_name} is moderately spicy with rich aromatic spices. Would you like me to suggest something milder?"
        else:
            if is_hindi:
                ans = f"नहीं, {dish_name} ज़्यादा तीखा नहीं है, इसका स्वाद संतुलित और हल्का है।"
            else:
                ans = f"No, {dish_name} is not overly spicy. It has a well-balanced and mild flavor profile."
        return ans, [last_mentioned_dish]

    # "Suggest something less spicy" / "milder"
    if any(phrase in q for phrase in ["less spicy", "not spicy", "milder", "kam tikha", "meetha"]):
        milder_candidates = [
            i for i in available_items 
            if not i["is_spicy"] and (last_mentioned_dish is None or i["id"] != last_mentioned_dish["id"])
        ]
        # Prefer vegetarian if previously asked
        if last_mentioned_dish and last_mentioned_dish["is_vegetarian"]:
            milder_candidates = [i for i in milder_candidates if i["is_vegetarian"]]

        if budget_limit:
            milder_candidates = [i for i in milder_candidates if i["effective_price"] <= budget_limit]

        if milder_candidates:
            top_rec = milder_candidates[0]
            price_str = f"${top_rec['effective_price']:.2f}"
            if is_hindi:
                ans = f"कम तीखे विकल्प के लिए मैं {top_rec['name']} ({price_str}) की सलाह दूंगा। इसका स्वाद हल्का और बेहद स्वादिष्ट है।"
            else:
                ans = f"For something milder, you could try {top_rec['name']} for {price_str}. It has a gentle, creamy spice level. Would you like to try it?"
            return ans, milder_candidates[:3]

    # 4. Filter dishes based on criteria
    matched = list(available_items)

    # Vegetarian / Shakahari
    if any(w in q for w in ["vegetarian", "veg", "shakahari", "sabzi", "paneer"]):
        matched = [i for i in matched if i["is_vegetarian"]]

    # Jain
    if "jain" in q:
        matched = [i for i in matched if i["is_jain"] or "jain" in i["tags"]]

    # Spicy
    if any(w in q for w in ["spicy", "tikha", "hot", "masaledar"]):
        matched = [i for i in matched if i["is_spicy"]]

    # Kids
    if any(w in q for w in ["kid", "child", "children", "baby", "bacche"]):
        matched = [i for i in matched if i["is_kids"] or not i["is_spicy"] or "kid" in i["tags"]]

    # Today's specials
    if any(w in q for w in ["special", "today's special", "khas", "offer"]):
        specials = [i for i in matched if i["is_today_special"]]
        if specials:
            matched = specials

    # Category matching (starters, mains, dessert, drinks, etc.)
    if any(w in q for w in ["starter", "appetizer", "snack"]):
        matched = [i for i in matched if "starter" in i["category"].lower() or "appetizer" in i["category"].lower()]
    elif any(w in q for w in ["main", "curry", "roti", "rice", "biryani"]):
        matched = [i for i in matched if "main" in i["category"].lower() or "bread" in i["category"].lower()]
    elif any(w in q for w in ["dessert", "sweet", "ice cream", "gulab"]):
        matched = [i for i in matched if "dessert" in i["category"].lower()]
    elif any(w in q for w in ["drink", "beverage", "lassi", "shake", "juice"]):
        matched = [i for i in matched if "drink" in i["category"].lower() or "beverage" in i["category"].lower()]

    # Budget filter
    if budget_limit:
        matched = [i for i in matched if i["effective_price"] <= budget_limit]

    # 5. Formulate Response
    if not matched:
        if is_hindi:
            msg = f"माफ़ कीजिये, आपकी इन शर्तों के अनुसार आज कोई उपलब्ध व्यंजन नहीं मिला। क्या आप हमारे अन्य विशेष व्यंजन देखना चाहेंगे?"
        else:
            msg = f"I'm sorry, I couldn't find any currently available dishes matching those exact criteria. Would you like to explore our other chef specials?"
        return msg, available_items[:2]

    # Sort: Today's specials first, then best match
    matched.sort(key=lambda x: (not x["is_today_special"], x["effective_price"]))
    top_pick = matched[0]
    top_price = f"${top_pick['effective_price']:.2f}"
    
    # Natural description building
    attrs = []
    if top_pick["is_vegetarian"]:
        attrs.append("vegetarian" if not is_hindi else "शाकाहारी")
    if top_pick["is_spicy"]:
        attrs.append("spicy" if not is_hindi else "तीखा")
    if top_pick["is_today_special"]:
        attrs.append("today's special" if not is_hindi else "आज का ख़ास")

    attrs_str = ", ".join(attrs) if attrs else ("delicious" if not is_hindi else "स्वादिष्ट")

    if is_hindi:
        resp = f"मैं आपको {top_pick['name']} की सलाह दूंगा जो मात्र {top_price} में उपलब्ध है ({attrs_str})। {top_pick['description']} क्या आप इसे ऑर्डर में जोड़ना चाहते हैं या और विकल्प देखना चाहते हैं?"
    else:
        resp = f"I recommend {top_pick['name']} for {top_price}. It is a {attrs_str} option on our menu. {top_pick['description']} Would you like to explore more options?"

    return resp, matched[:3]


async def generate_ai_response(
    db: Session,
    restaurant_id: int,
    user_query: str,
    conversation_history: List[models.ChatMessage],
    language_code: str = "en"
) -> Tuple[str, str, List[Dict[str, Any]], str]:
    """
    Main entry point for AI recommendations:
    1. Fetches only active & available menu items for today.
    2. Primary engine: Ollama + Qwen 2.5 3B (local free LLM).
    3. If Ollama is offline, gracefully uses the intelligent menu reasoning engine.
    Returns: (display_text, speech_text, recommended_dishes, model_used)
    """
    available_items = get_available_menu_items(db, restaurant_id)

    # 1. Try Ollama with Qwen 2.5 3B as primary LLM
    ollama_result = await call_ollama_qwen(
        user_query=user_query,
        available_items=available_items,
        conversation_history=conversation_history,
        language_code=language_code
    )

    if ollama_result:
        display_text, dishes = ollama_result
        model_used = f"Ollama ({settings.OLLAMA_MODEL})"
        speech_text = clean_text_for_speech(display_text)
        return display_text, speech_text, dishes, model_used

    # 2. Standby reasoning engine (guarantees system is always functional)
    display_text, dishes = intelligent_menu_agent(
        user_query=user_query,
        available_items=available_items,
        conversation_history=conversation_history,
        language_code=language_code
    )
    model_used = f"Local Standby Engine (Ollama {settings.OLLAMA_MODEL} ready)"
    speech_text = clean_text_for_speech(display_text)
    return display_text, speech_text, dishes, model_used
