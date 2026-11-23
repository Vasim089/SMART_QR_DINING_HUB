from typing import Optional, List
from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/public", tags=["Public Customer Endpoints"])

@router.get("/languages", response_model=List[schemas.LanguageSchema])
def get_languages(db: Session = Depends(get_db)):
    return db.query(models.Language).filter(models.Language.is_active == True).all()

@router.get("/restaurant/{restaurant_id}", response_model=schemas.RestaurantSchema)
def get_restaurant_info(restaurant_id: int, db: Session = Depends(get_db)):
    restaurant = db.query(models.Restaurant).filter(models.Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return restaurant

@router.get("/restaurant/{restaurant_id}/table/{table_number}", response_model=schemas.RestaurantTableSchema)
def get_table_info(restaurant_id: int, table_number: int, db: Session = Depends(get_db)):
    table = (
        db.query(models.RestaurantTable)
        .filter(
            models.RestaurantTable.restaurant_id == restaurant_id,
            models.RestaurantTable.table_number == table_number,
            models.RestaurantTable.is_active == True
        )
        .first()
    )
    if not table:
        raise HTTPException(status_code=404, detail=f"Table {table_number} not found for this restaurant")
    return table

@router.get("/restaurant/{restaurant_id}/menu", response_model=List[schemas.MenuCategorySchema])
def get_restaurant_menu(
    restaurant_id: int,
    dietary: Optional[str] = None,
    max_price: Optional[float] = None,
    db: Session = Depends(get_db)
):
    today = date.today()
    categories = (
        db.query(models.MenuCategory)
        .filter(models.MenuCategory.restaurant_id == restaurant_id)
        .all()
    )

    result = []
    for cat in categories:
        cat_items = []
        for item in cat.items:
            if not item.is_active:
                continue

            # Check daily menu availability
            daily_rec = (
                db.query(models.DailyMenuAvailability)
                .filter(
                    models.DailyMenuAvailability.menu_item_id == item.id,
                    models.DailyMenuAvailability.menu_date == today
                )
                .first()
            )

            is_available = daily_rec.is_available if daily_rec else True
            is_today_special = daily_rec.is_today_special if daily_rec else False
            special_price = daily_rec.special_price if daily_rec else None
            effective_price = special_price if (is_today_special and special_price is not None) else item.price

            # Apply filters if provided
            if max_price and effective_price > max_price:
                continue

            item_tag_names = [t.tag_name.lower() for t in item.tags]
            if dietary:
                diet_lower = dietary.lower()
                if diet_lower == "vegetarian" and not any("veg" in t and "non" not in t for t in item_tag_names):
                    continue
                elif diet_lower == "jain" and not any("jain" in t for t in item_tag_names):
                    continue
                elif diet_lower == "spicy" and not any("spic" in t for t in item_tag_names):
                    continue

            # Convert tags
            tag_schemas = [
                schemas.MenuItemTagSchema(id=t.id, tag_name=t.tag_name, tag_type=t.tag_type)
                for t in item.tags
            ]

            cat_items.append(
                schemas.MenuItemSchema(
                    id=item.id,
                    restaurant_id=item.restaurant_id,
                    category_id=item.category_id,
                    name=item.name,
                    description=item.description,
                    price=item.price,
                    ingredients=item.ingredients,
                    image_url=item.image_url,
                    is_active=item.is_active,
                    tags=tag_schemas,
                    is_available=is_available,
                    is_today_special=is_today_special,
                    special_price=special_price,
                    effective_price=effective_price
                )
            )

        if cat_items or not dietary:
            result.append(
                schemas.MenuCategorySchema(
                    id=cat.id,
                    name=cat.name,
                    description=cat.description,
                    items=cat_items
                )
            )

    return result

@router.get("/restaurant/{restaurant_id}/offers", response_model=List[schemas.OfferSchema])
def get_restaurant_offers(restaurant_id: int, db: Session = Depends(get_db)):
    today = date.today()
    return (
        db.query(models.Offer)
        .filter(
            models.Offer.restaurant_id == restaurant_id,
            models.Offer.is_active == True,
            models.Offer.start_date <= today,
            models.Offer.end_date >= today
        )
        .all()
    )
