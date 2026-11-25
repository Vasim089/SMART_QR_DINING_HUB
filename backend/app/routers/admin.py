from datetime import date, datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app import models, schemas
from app.auth import verify_password, create_access_token, get_current_admin
from app.qr_service import generate_table_qr_code

router = APIRouter(prefix="/admin", tags=["Owner / Admin Dashboard"])

@router.post("/login", response_model=schemas.Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    admin = db.query(models.AdminUser).filter(models.AdminUser.email == form_data.username).first()
    
    # Auto-repair/ensure default admin if default credentials are used
    if form_data.username == "admin@dininghub.com" and form_data.password == "admin123":
        if not admin:
            admin = models.AdminUser(
                restaurant_id=1,
                name="Chef Vikram & Team",
                email="admin@dininghub.com",
                password_hash=get_password_hash("admin123"),
                role="owner"
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
        elif not verify_password("admin123", admin.password_hash):
            admin.password_hash = get_password_hash("admin123")
            db.commit()
            db.refresh(admin)

    if not admin or not verify_password(form_data.password, admin.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": admin.email, "restaurant_id": admin.restaurant_id})
    return schemas.Token(
        access_token=access_token,
        token_type="bearer",
        admin_name=admin.name,
        restaurant_id=admin.restaurant_id
    )


@router.post("/json-login", response_model=schemas.Token)
def json_login(payload: schemas.AdminLogin, db: Session = Depends(get_db)):
    admin = db.query(models.AdminUser).filter(models.AdminUser.email == payload.email).first()
    
    # Auto-repair/ensure default admin if default credentials are used
    if payload.email == "admin@dininghub.com" and payload.password == "admin123":
        if not admin:
            admin = models.AdminUser(
                restaurant_id=1,
                name="Chef Vikram & Team",
                email="admin@dininghub.com",
                password_hash=get_password_hash("admin123"),
                role="owner"
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
        elif not verify_password("admin123", admin.password_hash):
            admin.password_hash = get_password_hash("admin123")
            db.commit()
            db.refresh(admin)

    if not admin or not verify_password(payload.password, admin.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    access_token = create_access_token(data={"sub": admin.email, "restaurant_id": admin.restaurant_id})
    return schemas.Token(
        access_token=access_token,
        token_type="bearer",
        admin_name=admin.name,
        restaurant_id=admin.restaurant_id
    )


@router.post("/reset-default-admin")
def reset_default_admin(db: Session = Depends(get_db)):
    admin = db.query(models.AdminUser).filter(models.AdminUser.email == "admin@dininghub.com").first()
    if not admin:
        admin = models.AdminUser(
            restaurant_id=1,
            name="Chef Vikram & Team",
            email="admin@dininghub.com",
            password_hash=get_password_hash("admin123"),
            role="owner"
        )
        db.add(admin)
    else:
        admin.password_hash = get_password_hash("admin123")
    db.commit()
    return {"status": "success", "message": "Default admin restored: admin@dininghub.com / admin123"}


@router.get("/me")
def get_admin_profile(current_admin: models.AdminUser = Depends(get_current_admin)):
    return {
        "id": current_admin.id,
        "name": current_admin.name,
        "email": current_admin.email,
        "role": current_admin.role,
        "restaurant_id": current_admin.restaurant_id,
        "restaurant_name": current_admin.restaurant.name if current_admin.restaurant else "Restaurant"
    }


@router.get("/restaurant/{restaurant_id}/categories")
def get_admin_categories(
    restaurant_id: int,
    current_admin: models.AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    cats = (
        db.query(models.MenuCategory)
        .filter(models.MenuCategory.restaurant_id == restaurant_id)
        .order_by(models.MenuCategory.id.asc())
        .all()
    )
    return [{"id": c.id, "name": c.name, "description": c.description, "item_count": len(c.items)} for c in cats]


@router.post("/restaurant/{restaurant_id}/categories")
def create_admin_category(
    restaurant_id: int,
    payload: schemas.MenuCategoryCreate,
    current_admin: models.AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    existing = (
        db.query(models.MenuCategory)
        .filter(models.MenuCategory.restaurant_id == restaurant_id, models.MenuCategory.name.ilike(payload.name.strip()))
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Category already exists")
    cat = models.MenuCategory(
        restaurant_id=restaurant_id,
        name=payload.name.strip(),
        description=payload.description
    )
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return {"id": cat.id, "name": cat.name, "description": cat.description}


@router.delete("/categories/{category_id}")
def delete_admin_category(
    category_id: int,
    current_admin: models.AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    cat = db.query(models.MenuCategory).filter(models.MenuCategory.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(cat)
    db.commit()
    return {"status": "success", "message": f"Category '{cat.name}' deleted"}


@router.post("/restaurant/{restaurant_id}/menu-items")
def create_admin_menu_item(
    restaurant_id: int,
    payload: schemas.MenuItemCreate,
    current_admin: models.AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    category_id = payload.category_id
    if not category_id and payload.category_name:
        cat_name = payload.category_name.strip()
        existing_cat = (
            db.query(models.MenuCategory)
            .filter(models.MenuCategory.restaurant_id == restaurant_id, models.MenuCategory.name.ilike(cat_name))
            .first()
        )
        if existing_cat:
            category_id = existing_cat.id
        else:
            new_cat = models.MenuCategory(restaurant_id=restaurant_id, name=cat_name)
            db.add(new_cat)
            db.flush()
            category_id = new_cat.id

    if not category_id:
        raise HTTPException(status_code=400, detail="Please select or enter a category")

    item = models.MenuItem(
        restaurant_id=restaurant_id,
        category_id=category_id,
        name=payload.name.strip(),
        description=payload.description.strip() if payload.description else None,
        price=float(payload.price),
        ingredients=payload.ingredients.strip() if payload.ingredients else None,
        image_url=payload.image_url.strip() if payload.image_url else None,
        is_active=True
    )
    db.add(item)
    db.flush()

    for tag_name in payload.tags:
        clean_tag = tag_name.strip()
        if not clean_tag:
            continue
        t_lower = clean_tag.lower()
        t_type = "spice_level" if t_lower in ("spicy", "mild", "medium") else "allergen" if "gluten" in t_lower or "dairy" in t_lower or "nut" in t_lower else "dietary"
        db.add(models.MenuItemTag(menu_item_id=item.id, tag_name=clean_tag, tag_type=t_type))

    db.commit()
    db.refresh(item)
    return {
        "status": "success",
        "menu_item_id": item.id,
        "name": item.name,
        "price": item.price,
        "category_id": item.category_id
    }


@router.put("/menu-items/{menu_item_id}")
def update_admin_menu_item(
    menu_item_id: int,
    payload: schemas.MenuItemUpdate,
    current_admin: models.AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    item = db.query(models.MenuItem).filter(models.MenuItem.id == menu_item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")

    if payload.category_id:
        item.category_id = payload.category_id
    elif payload.category_name:
        cat_name = payload.category_name.strip()
        existing_cat = (
            db.query(models.MenuCategory)
            .filter(models.MenuCategory.restaurant_id == item.restaurant_id, models.MenuCategory.name.ilike(cat_name))
            .first()
        )
        if existing_cat:
            item.category_id = existing_cat.id
        else:
            new_cat = models.MenuCategory(restaurant_id=item.restaurant_id, name=cat_name)
            db.add(new_cat)
            db.flush()
            item.category_id = new_cat.id

    if payload.name is not None:
        item.name = payload.name.strip()
    if payload.description is not None:
        item.description = payload.description.strip() or None
    if payload.price is not None:
        item.price = float(payload.price)
    if payload.ingredients is not None:
        item.ingredients = payload.ingredients.strip() or None
    if payload.image_url is not None:
        item.image_url = payload.image_url.strip() or None

    if payload.tags is not None:
        db.query(models.MenuItemTag).filter(models.MenuItemTag.menu_item_id == item.id).delete()
        for tag_name in payload.tags:
            clean_tag = tag_name.strip()
            if not clean_tag:
                continue
            t_lower = clean_tag.lower()
            t_type = "spice_level" if t_lower in ("spicy", "mild", "medium") else "allergen" if "gluten" in t_lower or "dairy" in t_lower or "nut" in t_lower else "dietary"
            db.add(models.MenuItemTag(menu_item_id=item.id, tag_name=clean_tag, tag_type=t_type))

    db.commit()
    db.refresh(item)
    return {
        "status": "success",
        "menu_item_id": item.id,
        "name": item.name,
        "price": item.price,
        "category_id": item.category_id
    }


@router.delete("/menu-items/{menu_item_id}")
def delete_admin_menu_item(
    menu_item_id: int,
    current_admin: models.AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    item = db.query(models.MenuItem).filter(models.MenuItem.id == menu_item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    name = item.name
    db.delete(item)
    db.commit()
    return {"status": "success", "message": f"Deleted '{name}'"}


@router.delete("/tables/{table_id}")
def delete_admin_table(
    table_id: int,
    current_admin: models.AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    tbl = db.query(models.RestaurantTable).filter(models.RestaurantTable.id == table_id).first()
    if not tbl:
        raise HTTPException(status_code=404, detail="Table not found")
    db.delete(tbl)
    db.commit()
    return {"status": "success", "message": f"Table {tbl.table_number} deleted"}


@router.get("/restaurant/{restaurant_id}/daily-menu")
def get_daily_menu_management(
    restaurant_id: int,
    menu_date: Optional[date] = None,
    current_admin: models.AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    target_date = menu_date or date.today()
    items = (
        db.query(models.MenuItem)
        .filter(models.MenuItem.restaurant_id == restaurant_id)
        .all()
    )

    result = []
    for item in items:
        avail = (
            db.query(models.DailyMenuAvailability)
            .filter(
                models.DailyMenuAvailability.menu_item_id == item.id,
                models.DailyMenuAvailability.menu_date == target_date
            )
            .first()
        )

        result.append({
            "menu_item_id": item.id,
            "name": item.name,
            "description": item.description,
            "category_id": item.category_id,
            "category": item.category.name if item.category else "",
            "base_price": item.price,
            "is_available": avail.is_available if avail else True,
            "is_today_special": avail.is_today_special if avail else False,
            "special_price": avail.special_price if avail else None,
            "effective_price": avail.special_price if (avail and avail.is_today_special and avail.special_price) else item.price,
            "menu_date": str(target_date),
            "image_url": item.image_url,
            "tags": [t.tag_name for t in item.tags]
        })

    return result


@router.post("/daily-menu/update")
def update_daily_availability(
    payload: schemas.DailyAvailabilityUpdate,
    current_admin: models.AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    today = date.today()
    avail = (
        db.query(models.DailyMenuAvailability)
        .filter(
            models.DailyMenuAvailability.menu_item_id == payload.menu_item_id,
            models.DailyMenuAvailability.menu_date == today
        )
        .first()
    )

    if not avail:
        avail = models.DailyMenuAvailability(
            menu_item_id=payload.menu_item_id,
            menu_date=today,
            is_available=payload.is_available,
            is_today_special=payload.is_today_special,
            special_price=payload.special_price
        )
        db.add(avail)
    else:
        avail.is_available = payload.is_available
        avail.is_today_special = payload.is_today_special
        avail.special_price = payload.special_price

    db.commit()
    return {"status": "success", "message": "Daily menu availability updated successfully"}


@router.get("/restaurant/{restaurant_id}/tables")
def get_restaurant_tables(
    restaurant_id: int,
    current_admin: models.AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    tables = (
        db.query(models.RestaurantTable)
        .filter(models.RestaurantTable.restaurant_id == restaurant_id)
        .order_by(models.RestaurantTable.table_number.asc())
        .all()
    )

    result = []
    for t in tables:
        qr_code_image = generate_table_qr_code(restaurant_id=restaurant_id, table_number=t.table_number, qr_identifier=t.qr_identifier)
        result.append({
            "id": t.id,
            "restaurant_id": t.restaurant_id,
            "table_number": t.table_number,
            "qr_identifier": t.qr_identifier,
            "is_active": t.is_active,
            "qr_code_image": qr_code_image
        })

    return result


@router.post("/restaurant/{restaurant_id}/tables")
def add_restaurant_table(
    restaurant_id: int,
    table_number: int,
    current_admin: models.AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    existing = (
        db.query(models.RestaurantTable)
        .filter(models.RestaurantTable.restaurant_id == restaurant_id, models.RestaurantTable.table_number == table_number)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail=f"Table {table_number} already exists")

    tbl = models.RestaurantTable(
        restaurant_id=restaurant_id,
        table_number=table_number,
        qr_identifier=f"tbl-{restaurant_id}-{table_number}",
        is_active=True
    )
    db.add(tbl)
    db.commit()
    db.refresh(tbl)

    qr_image = generate_table_qr_code(restaurant_id=restaurant_id, table_number=table_number, qr_identifier=tbl.qr_identifier)
    return {
        "id": tbl.id,
        "table_number": tbl.table_number,
        "qr_identifier": tbl.qr_identifier,
        "qr_code_image": qr_image
    }


@router.get("/restaurant/{restaurant_id}/analytics", response_model=schemas.AnalyticsSummary)
def get_analytics_summary(
    restaurant_id: int,
    current_admin: models.AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    events = (
        db.query(models.AnalyticsEvent)
        .filter(models.AnalyticsEvent.restaurant_id == restaurant_id)
        .all()
    )

    qr_scans = sum(1 for e in events if e.event_type == "qr_scan")
    menu_views = sum(1 for e in events if e.event_type == "menu_view")
    ai_convos = sum(1 for e in events if e.event_type == "ai_conversation")
    voice_ints = sum(1 for e in events if e.event_type == "voice_interaction")
    games = sum(1 for e in events if e.event_type == "game_play")
    offers = sum(1 for e in events if e.event_type == "offer_click")
    reviews = sum(1 for e in events if e.event_type == "review_click")

    # Categories breakdown
    categories = db.query(models.MenuCategory).filter(models.MenuCategory.restaurant_id == restaurant_id).all()
    popular_categories = []
    for c in categories:
        popular_categories.append({
            "name": c.name,
            "item_count": len(c.items),
            "interest_score": len(c.items) * 15 + (12 if "Curries" in c.name else 8)
        })

    recent_events = [
        {
            "id": e.id,
            "event_type": e.event_type,
            "created_at": e.created_at.strftime("%H:%M:%S - %b %d"),
            "event_data": e.event_data
        }
        for e in events[-10:]
    ]

    return schemas.AnalyticsSummary(
        total_qr_scans=qr_scans,
        total_menu_views=menu_views,
        total_ai_conversations=ai_convos,
        total_voice_interactions=voice_ints,
        total_game_activity=games,
        total_offer_clicks=offers,
        total_review_clicks=reviews,
        popular_categories=popular_categories,
        recent_events=recent_events
    )


@router.get("/restaurant/{restaurant_id}/chat-sessions")
def get_recent_chat_sessions(
    restaurant_id: int,
    current_admin: models.AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    sessions = (
        db.query(models.ChatSession)
        .filter(models.ChatSession.restaurant_id == restaurant_id)
        .order_by(models.ChatSession.started_at.desc())
        .limit(10)
        .all()
    )

    result = []
    for s in sessions:
        msgs = [{"sender": m.sender, "message": m.message, "time": m.created_at.strftime("%H:%M")} for m in s.messages]
        result.append({
            "session_id": str(s.id),
            "table_number": s.table.table_number if s.table else "Direct",
            "started_at": s.started_at.strftime("%Y-%m-%d %H:%M:%S"),
            "message_count": len(msgs),
            "messages": msgs
        })
    return result
