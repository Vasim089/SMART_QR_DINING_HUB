from sqlalchemy.orm import Session
from app.database import engine, Base, SessionLocal
from app import models
from app.auth import get_password_hash


def seed_database():
    """Ensure schema exists and initialize only the default restaurant & admin user."""
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        restaurant = db.query(models.Restaurant).first()
        if not restaurant:
            restaurant = models.Restaurant(
                name="Bawarchi Indian Cuisine",
                location="Decatur",
                settings={},
            )
            db.add(restaurant)
            db.flush()

        admin = db.query(models.AdminUser).filter(
            models.AdminUser.email == "admin@dininghub.com"
        ).first()
        if not admin:
            admin = models.AdminUser(
                restaurant_id=restaurant.id,
                name="Chef Vikram & Team",
                email="admin@dininghub.com",
                password_hash=get_password_hash("admin123"),
                role="owner",
            )
            db.add(admin)

        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error during seed: {e}")
        raise
    finally:
        db.close()
