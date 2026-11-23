from typing import List, Optional, Any, Dict, Union
from uuid import UUID
from datetime import datetime, date
from pydantic import BaseModel

# Base & Auth
class Token(BaseModel):
    access_token: str
    token_type: str
    admin_name: str
    restaurant_id: int

class AdminLogin(BaseModel):
    email: str
    password: str

# Language
class LanguageSchema(BaseModel):
    id: int
    language_code: str
    language_name: str
    is_active: bool

    class Config:
        from_attributes = True

# Tags
class MenuItemTagSchema(BaseModel):
    id: int
    tag_name: str
    tag_type: str

    class Config:
        from_attributes = True

# Daily Availability
class DailyAvailabilitySchema(BaseModel):
    id: int
    menu_item_id: int
    menu_date: date
    is_available: bool
    is_today_special: bool
    special_price: Optional[float] = None

    class Config:
        from_attributes = True

class DailyAvailabilityUpdate(BaseModel):
    menu_item_id: int
    is_available: bool
    is_today_special: bool = False
    special_price: Optional[float] = None

# Menu Items
class MenuItemSchema(BaseModel):
    id: int
    restaurant_id: int
    category_id: int
    name: str
    description: Optional[str] = None
    price: float
    ingredients: Optional[str] = None
    image_url: Optional[str] = None
    is_active: bool
    tags: List[MenuItemTagSchema] = []
    
    # Resolved daily status
    is_available: bool = True
    is_today_special: bool = False
    special_price: Optional[float] = None
    effective_price: float

    class Config:
        from_attributes = True

class MenuItemCreate(BaseModel):
    category_id: int
    name: str
    description: Optional[str] = None
    price: float
    ingredients: Optional[str] = None
    image_url: Optional[str] = None
    tags: List[str] = []

# Category
class MenuCategorySchema(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    items: List[MenuItemSchema] = []

    class Config:
        from_attributes = True

# Offers
class OfferSchema(BaseModel):
    id: int
    restaurant_id: int
    title: str
    description: Optional[str] = None
    discount_value: float
    start_date: date
    end_date: date
    is_active: bool

    class Config:
        from_attributes = True

# Restaurant Table
class RestaurantTableSchema(BaseModel):
    id: int
    restaurant_id: int
    table_number: int
    qr_identifier: str
    is_active: bool
    qr_code_image: Optional[str] = None

    class Config:
        from_attributes = True

# Restaurant
class RestaurantSchema(BaseModel):
    id: int
    name: str
    location: Optional[str] = None
    settings: Dict[str, Any] = {}
    created_at: datetime

    class Config:
        from_attributes = True

# Chat
class ChatMessageSchema(BaseModel):
    id: int
    sender: str
    message: str
    created_at: datetime

    class Config:
        from_attributes = True

class ChatSessionCreate(BaseModel):
    restaurant_id: int
    table_id: Optional[int] = None
    language_code: Optional[str] = "en"

class ChatRequest(BaseModel):
    restaurant_id: int
    table_id: Optional[int] = None
    session_token: Optional[str] = None
    message: str
    language_code: Optional[str] = "en"

class DishRecommendation(BaseModel):
    id: int
    name: str
    price: float
    effective_price: float
    is_today_special: bool
    is_vegetarian: bool
    is_spicy: bool
    is_jain: bool
    description: Optional[str] = None
    image_url: Optional[str] = None

class ChatResponse(BaseModel):
    session_token: Union[str, UUID]
    response_text: str
    speech_text: str
    detected_language: str
    model_used: Optional[str] = "Ollama (qwen2.5:3b)"
    recommended_dishes: List[DishRecommendation] = []
    messages: List[ChatMessageSchema] = []

# Analytics
class AnalyticsEventCreate(BaseModel):
    restaurant_id: int
    table_id: Optional[int] = None
    event_type: str
    event_data: Optional[Dict[str, Any]] = None

class AnalyticsSummary(BaseModel):
    total_qr_scans: int
    total_menu_views: int
    total_ai_conversations: int
    total_voice_interactions: int
    total_game_activity: int
    total_offer_clicks: int
    total_review_clicks: int
    popular_categories: List[Dict[str, Any]]
    recent_events: List[Dict[str, Any]]
