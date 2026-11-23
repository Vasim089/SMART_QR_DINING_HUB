from datetime import date, timedelta
from sqlalchemy.orm import Session
from app.database import engine, Base, SessionLocal
from app import models
from app.auth import get_password_hash

def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # Check if already seeded
        if db.query(models.Restaurant).first():
            print("Database already contains data. Skipping initial seeding.")
            return

        print("Seeding database with restaurant data...")

        # 1. Restaurant
        restaurant = models.Restaurant(
            name="The Royal Spice Bistro",
            location="742 Evergreen Terrace, Downtown District",
            settings={
                "currency": "$",
                "phone": "+1 (555) 382-4468",
                "review_url": "https://maps.google.com/?cid=101",
                "welcome_message": "Welcome to The Royal Spice Bistro! Scan, talk to our AI waiter, or browse our chef-crafted menu.",
                "theme_color": "#EA580C"
            }
        )
        db.add(restaurant)
        db.flush()

        # 2. Admin User
        admin = models.AdminUser(
            restaurant_id=restaurant.id,
            name="Chef Vikram & Team",
            email="admin@dininghub.com",
            password_hash=get_password_hash("admin123"),
            role="owner"
        )
        db.add(admin)

        # 3. Tables (1 to 8)
        tables = []
        for i in range(1, 9):
            tbl = models.RestaurantTable(
                restaurant_id=restaurant.id,
                table_number=i,
                qr_identifier=f"bistro-table-{i}",
                is_active=True
            )
            tables.append(tbl)
            db.add(tbl)
        db.flush()

        # 4. Languages
        languages_data = [
            ("en", "English"),
            ("hi", "हिन्दी (Hindi)"),
            ("es", "Español"),
            ("fr", "Français"),
        ]
        for code, name in languages_data:
            db.add(models.Language(language_code=code, language_name=name, is_active=True))
        db.flush()

        # 5. Categories
        cat_starters = models.MenuCategory(restaurant_id=restaurant.id, name="Starters & Appetizers", description="Crispy, savory delights to kickstart your meal")
        cat_mains = models.MenuCategory(restaurant_id=restaurant.id, name="Main Course Curries", description="Authentic rich curries and royal specialties")
        cat_rice_breads = models.MenuCategory(restaurant_id=restaurant.id, name="Breads & Biryanis", description="Clay oven baked flatbreads & aromatic basmati rice")
        cat_desserts = models.MenuCategory(restaurant_id=restaurant.id, name="Artisanal Desserts", description="Sweet traditional & fusion treats")
        cat_drinks = models.MenuCategory(restaurant_id=restaurant.id, name="Beverages & Mocktails", description="Refreshing coolers, shakes, and spiced teas")
        cat_kids = models.MenuCategory(restaurant_id=restaurant.id, name="Kids Corner", description="Mild, yummy, fun meals for young foodies")

        for c in [cat_starters, cat_mains, cat_rice_breads, cat_desserts, cat_drinks, cat_kids]:
            db.add(c)
        db.flush()

        # 6. Menu Items & Tags
        menu_items_raw = [
            # Starters
            {
                "category": cat_starters,
                "name": "Paneer Tikka",
                "description": "Succulent cubes of cottage cheese marinated in spiced yogurt and grilled in the tandoor with bell peppers.",
                "price": 12.99,
                "ingredients": "Paneer, bell peppers, yogurt, garam masala, chili, lemon",
                "image_url": "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500&auto=format&fit=crop&q=60",
                "tags": [("Vegetarian", "dietary"), ("Spicy", "spice_level"), ("Gluten-Free", "allergen")]
            },
            {
                "category": cat_starters,
                "name": "Chicken Wings",
                "description": "Crispy roasted tandoori chicken wings tossed in hot tangy glaze.",
                "price": 11.99,
                "ingredients": "Chicken wings, peri-peri spice, garlic, butter",
                "image_url": "https://images.unsplash.com/photo-1527477378378-fc74e0d9bdbe?w=500&auto=format&fit=crop&q=60",
                "tags": [("Spicy", "spice_level"), ("Non-Vegetarian", "dietary")],
                "sold_out": True # Example from PDF: Chicken Wings -> Sold Out
            },
            {
                "category": cat_starters,
                "name": "Crispy Corn & Water Chestnut",
                "description": "Golden fried sweet corn kernels tossed with black pepper, scallions, and herbs.",
                "price": 9.99,
                "ingredients": "Sweet corn, water chestnut, spring onion, crushed pepper",
                "image_url": "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=60",
                "tags": [("Vegetarian", "dietary"), ("Vegan", "dietary"), ("Mild", "spice_level")]
            },
            # Mains
            {
                "category": cat_mains,
                "name": "Paneer Butter Masala",
                "description": "Soft cottage cheese simmered in a silky, buttery tomato sauce infused with fenugreek leaves.",
                "price": 13.49,
                "ingredients": "Paneer, ripe tomatoes, fresh cream, butter, kasuri methi",
                "image_url": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60",
                "tags": [("Vegetarian", "dietary"), ("Mild", "spice_level"), ("Contains Dairy", "allergen")]
            },
            {
                "category": cat_mains,
                "name": "Veggie Burger",
                "description": "Crisp spiced potato and vegetable patty served with lettuce, tomatoes, and house sauce.",
                "price": 10.49,
                "ingredients": "Potatoes, peas, carrots, sesame bun, herb mayo",
                "image_url": "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500&auto=format&fit=crop&q=60",
                "tags": [("Vegetarian", "dietary"), ("Kids Friendly", "audience"), ("Mild", "spice_level")],
                "is_special": True,
                "special_price": 8.99 # Example from PDF: Veggie Burger -> Today's Special
            },
            {
                "category": cat_mains,
                "name": "Paneer Curry",
                "description": "Traditional North Indian homestyle paneer curry cooked with onions, ginger, and rich ground spices.",
                "price": 15.99,
                "ingredients": "Paneer, onion, ginger-garlic paste, coriander, whole spices",
                "image_url": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&auto=format&fit=crop&q=60",
                "tags": [("Vegetarian", "dietary"), ("Spicy", "spice_level")],
                "is_special": True,
                "special_price": 14.99 # Example from PDF: Paneer Curry -> Special price $14.99 today
            },
            {
                "category": cat_mains,
                "name": "Butter Chicken",
                "description": "Char-grilled marinated chicken cooked in a velvety tomato, honey, and fresh cream gravy.",
                "price": 16.99,
                "ingredients": "Boneless chicken, tomato reduction, cream, butter, mild spices",
                "image_url": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&auto=format&fit=crop&q=60",
                "tags": [("Non-Vegetarian", "dietary"), ("Mild", "spice_level"), ("Popular", "category")]
            },
            {
                "category": cat_mains,
                "name": "Jain Moong Dal Khichdi",
                "description": "Pure sattvic yellow moong lentils and basmati rice tempered gently with cumin and pure desi ghee.",
                "price": 11.49,
                "ingredients": "Yellow moong dal, aged basmati rice, cumin, pure ghee, rock salt",
                "image_url": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60",
                "tags": [("Vegetarian", "dietary"), ("Jain", "dietary"), ("Mild", "spice_level"), ("Gluten-Free", "allergen")]
            },
            # Breads & Rice
            {
                "category": cat_rice_breads,
                "name": "Garlic Butter Naan",
                "description": "Tandoor baked leavened flatbread brushed with crushed garlic and melted herb butter.",
                "price": 3.99,
                "ingredients": "Refined flour, garlic, butter, fresh cilantro",
                "image_url": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=60",
                "tags": [("Vegetarian", "dietary"), ("Contains Dairy", "allergen")]
            },
            {
                "category": cat_rice_breads,
                "name": "Dum Royal Veg Biryani",
                "description": "Layers of fragrant long-grain basmati rice and marinated seasonal vegetables slow-cooked in a sealed clay pot.",
                "price": 13.99,
                "ingredients": "Basmati rice, seasonal vegetables, saffron, mint, fried onions, whole spices",
                "image_url": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60",
                "tags": [("Vegetarian", "dietary"), ("Spicy", "spice_level"), ("Gluten-Free", "allergen")]
            },
            # Desserts
            {
                "category": cat_desserts,
                "name": "Gulab Jamun with Ice Cream",
                "description": "Warm caramelized milk dough dumplings soaked in rose-cardamom syrup paired with vanilla ice cream.",
                "price": 6.49,
                "ingredients": "Khoya milk solids, saffron, green cardamom, vanilla ice cream",
                "image_url": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=60",
                "tags": [("Vegetarian", "dietary"), ("Dessert", "category"), ("Contains Dairy", "allergen")]
            },
            # Drinks
            {
                "category": cat_drinks,
                "name": "Mango Lassi",
                "description": "Traditional thick chilled yogurt smoothie blended with ripe Alphonso mango puree and crushed pistachios.",
                "price": 4.99,
                "ingredients": "Yogurt, Alphonso mango pulp, sugar, pistachio dust",
                "image_url": "https://images.unsplash.com/photo-1556881286-fc6915169721?w=500&auto=format&fit=crop&q=60",
                "tags": [("Vegetarian", "dietary"), ("Beverage", "category"), ("Kids Friendly", "audience")]
            },
            {
                "category": cat_drinks,
                "name": "Masala Chai",
                "description": "Freshly brewed full-bodied Assam black tea simmered with milk, fresh ginger, cardamom, and cinnamon.",
                "price": 3.49,
                "ingredients": "Assam tea leaves, whole milk, crushed ginger, cardamom pods, cinnamon",
                "image_url": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=60",
                "tags": [("Vegetarian", "dietary"), ("Beverage", "category")]
            },
            # Kids
            {
                "category": cat_kids,
                "name": "Kids Cheesy Smiles & Fries",
                "description": "Golden crispy potato smiles and shoestring fries sprinkled with mild cheddar cheese dip.",
                "price": 5.99,
                "ingredients": "Potatoes, vegetable oil, mild cheese sauce",
                "image_url": "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=500&auto=format&fit=crop&q=60",
                "tags": [("Vegetarian", "dietary"), ("Kids", "audience"), ("Mild", "spice_level")]
            }
        ]

        today = date.today()

        for item_data in menu_items_raw:
            m_item = models.MenuItem(
                restaurant_id=restaurant.id,
                category_id=item_data["category"].id,
                name=item_data["name"],
                description=item_data["description"],
                price=item_data["price"],
                ingredients=item_data["ingredients"],
                image_url=item_data["image_url"],
                is_active=True
            )
            db.add(m_item)
            db.flush()

            # Add tags
            for tag_name, tag_type in item_data["tags"]:
                db.add(models.MenuItemTag(
                    menu_item_id=m_item.id,
                    tag_name=tag_name,
                    tag_type=tag_type
                ))

            # Add daily menu availability
            is_available = not item_data.get("sold_out", False)
            is_special = item_data.get("is_special", False)
            special_price = item_data.get("special_price", None)

            db.add(models.DailyMenuAvailability(
                menu_item_id=m_item.id,
                menu_date=today,
                is_available=is_available,
                is_today_special=is_special,
                special_price=special_price
            ))

        # 7. Offers
        offer1 = models.Offer(
            restaurant_id=restaurant.id,
            title="Weekend Feast 20% OFF",
            description="Enjoy flat 20% discount on all orders above $40. Auto-applied during checkout!",
            discount_value=20.0,
            start_date=today - timedelta(days=2),
            end_date=today + timedelta(days=14),
            is_active=True
        )
        offer2 = models.Offer(
            restaurant_id=restaurant.id,
            title="Free Mango Lassi with 2 Mains",
            description="Order any two chef main course curries and receive a complimentary chilled Mango Lassi.",
            discount_value=4.99,
            start_date=today - timedelta(days=5),
            end_date=today + timedelta(days=20),
            is_active=True
        )
        db.add(offer1)
        db.add(offer2)

        # 8. Sample Analytics Events
        events = [
            ("qr_scan", {"table_number": 1, "source": "camera"}),
            ("qr_scan", {"table_number": 3, "source": "camera"}),
            ("menu_view", {"category": "Main Course Curries"}),
            ("ai_conversation", {"query": "Suggest something spicy and vegetarian under $14"}),
            ("voice_interaction", {"duration_seconds": 6}),
            ("game_play", {"game": "Memory Match", "score": 120}),
            ("offer_click", {"offer_id": 1}),
            ("review_click", {"target": "Google Reviews"})
        ]
        for ev_type, ev_data in events:
            db.add(models.AnalyticsEvent(
                restaurant_id=restaurant.id,
                table_id=tables[0].id,
                event_type=ev_type,
                event_data=ev_data
            ))

        db.commit()
        print("Database successfully seeded!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
