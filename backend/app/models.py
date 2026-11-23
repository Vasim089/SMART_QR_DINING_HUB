import uuid
from datetime import datetime, date
from sqlalchemy import (
    Column, Integer, String, Text, Float, Boolean, Date, DateTime,
    ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from app.database import Base

class Restaurant(Base):
    __tablename__ = "restaurants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    location = Column(Text, nullable=True)
    settings = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    tables = relationship("RestaurantTable", back_populates="restaurant", cascade="all, delete-orphan")
    admin_users = relationship("AdminUser", back_populates="restaurant", cascade="all, delete-orphan")
    categories = relationship("MenuCategory", back_populates="restaurant", cascade="all, delete-orphan")
    menu_items = relationship("MenuItem", back_populates="restaurant", cascade="all, delete-orphan")
    offers = relationship("Offer", back_populates="restaurant", cascade="all, delete-orphan")
    chat_sessions = relationship("ChatSession", back_populates="restaurant")
    analytics_events = relationship("AnalyticsEvent", back_populates="restaurant")


class RestaurantTable(Base):
    __tablename__ = "restaurant_tables"

    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False)
    table_number = Column(Integer, nullable=False)
    qr_identifier = Column(String(255), unique=True, nullable=False, index=True)
    is_active = Column(Boolean, default=True)

    # Relationships
    restaurant = relationship("Restaurant", back_populates="tables")
    chat_sessions = relationship("ChatSession", back_populates="table")
    analytics_events = relationship("AnalyticsEvent", back_populates="table")


class AdminUser(Base):
    __tablename__ = "admin_users"

    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(Text, nullable=False)
    role = Column(String(50), default="owner")

    restaurant = relationship("Restaurant", back_populates="admin_users")


class MenuCategory(Base):
    __tablename__ = "menu_categories"

    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)

    restaurant = relationship("Restaurant", back_populates="categories")
    items = relationship("MenuItem", back_populates="category", cascade="all, delete-orphan")


class MenuItem(Base):
    __tablename__ = "menu_items"

    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("menu_categories.id"), nullable=False)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    ingredients = Column(Text, nullable=True)
    image_url = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)

    restaurant = relationship("Restaurant", back_populates="menu_items")
    category = relationship("MenuCategory", back_populates="items")
    tags = relationship("MenuItemTag", back_populates="menu_item", cascade="all, delete-orphan")
    daily_availabilities = relationship("DailyMenuAvailability", back_populates="menu_item", cascade="all, delete-orphan")


class MenuItemTag(Base):
    __tablename__ = "menu_item_tags"

    id = Column(Integer, primary_key=True, index=True)
    menu_item_id = Column(Integer, ForeignKey("menu_items.id"), nullable=False)
    tag_name = Column(String(100), nullable=False, index=True) # e.g., Vegetarian, Spicy, Jain, Vegan
    tag_type = Column(String(50), default="dietary") # dietary, spice_level, allergen, audience

    menu_item = relationship("MenuItem", back_populates="tags")


class DailyMenuAvailability(Base):
    __tablename__ = "daily_menu_availability"

    id = Column(Integer, primary_key=True, index=True)
    menu_item_id = Column(Integer, ForeignKey("menu_items.id"), nullable=False)
    menu_date = Column(Date, default=date.today, index=True)
    is_available = Column(Boolean, default=True)
    is_today_special = Column(Boolean, default=False)
    special_price = Column(Float, nullable=True)

    menu_item = relationship("MenuItem", back_populates="daily_availabilities")


class Offer(Base):
    __tablename__ = "offers"

    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    discount_value = Column(Float, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    is_active = Column(Boolean, default=True)

    restaurant = relationship("Restaurant", back_populates="offers")


class Language(Base):
    __tablename__ = "languages"

    id = Column(Integer, primary_key=True, index=True)
    language_code = Column(String(10), unique=True, nullable=False)
    language_name = Column(String(100), nullable=False)
    is_active = Column(Boolean, default=True)

    chat_sessions = relationship("ChatSession", back_populates="language")


class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False)
    table_id = Column(Integer, ForeignKey("restaurant_tables.id"), nullable=True)
    language_id = Column(Integer, ForeignKey("languages.id"), nullable=True)
    session_token = Column(String(36), default=lambda: str(uuid.uuid4()), unique=True, index=True)
    started_at = Column(DateTime, default=datetime.utcnow)

    restaurant = relationship("Restaurant", back_populates="chat_sessions")
    table = relationship("RestaurantTable", back_populates="chat_sessions")
    language = relationship("Language", back_populates="chat_sessions")
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan", order_by="ChatMessage.created_at")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(36), ForeignKey("chat_sessions.id"), nullable=False)
    sender = Column(String(20), nullable=False) # 'customer' or 'ai'
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("ChatSession", back_populates="messages")


class AnalyticsEvent(Base):
    __tablename__ = "analytics_events"

    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False)
    table_id = Column(Integer, ForeignKey("restaurant_tables.id"), nullable=True)
    event_type = Column(String(100), nullable=False, index=True)
    event_data = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

    restaurant = relationship("Restaurant", back_populates="analytics_events")
    table = relationship("RestaurantTable", back_populates="analytics_events")
