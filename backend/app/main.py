from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.seed import seed_database
from app.auth import get_password_hash, verify_password
from app import models
from app.routers import public, chat, admin, analytics

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure tables exist and seed demo data
    Base.metadata.create_all(bind=engine)
    try:
        seed_database()
    except Exception as e:
        print(f"Database seed note: {e}")

    try:
        db = SessionLocal()
        admin_user = db.query(models.AdminUser).filter(models.AdminUser.email == "admin@dininghub.com").first()
        if not admin_user:
            admin_user = models.AdminUser(
                restaurant_id=1,
                name="Chef Vikram & Team",
                email="admin@dininghub.com",
                password_hash=get_password_hash("admin123"),
                role="owner"
            )
            db.add(admin_user)
            db.commit()
        elif not verify_password("admin123", admin_user.password_hash):
            admin_user.password_hash = get_password_hash("admin123")
            db.commit()
        db.close()
    except Exception as e:
        print(f"Admin verification note: {e}")

    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Smart QR Dining Hub API with AI Voice Assistant and Real-Time Daily Availability",
    version="1.0.0",
    lifespan=lifespan
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(public.router, prefix=settings.API_V1_STR)
app.include_router(chat.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "project": "Smart QR Dining Hub API",
        "status": "online",
        "docs": "/docs",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
