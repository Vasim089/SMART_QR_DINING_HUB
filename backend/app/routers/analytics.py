from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/analytics", tags=["Analytics Tracking"])

@router.post("/track")
def track_event(payload: schemas.AnalyticsEventCreate, db: Session = Depends(get_db)):
    event = models.AnalyticsEvent(
        restaurant_id=payload.restaurant_id,
        table_id=payload.table_id,
        event_type=payload.event_type,
        event_data=payload.event_data or {}
    )
    db.add(event)
    db.commit()
    return {"status": "recorded", "event_id": event.id}
