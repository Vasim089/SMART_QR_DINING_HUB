-- ============================================================================
-- SMART QR DINING HUB - PostgreSQL Complete Database Schema & Seed Data
-- ============================================================================
-- You can run this directly in pgAdmin (Query Tool) or via psql command:
-- psql -U postgres -d postgres -f database_setup.sql
-- ============================================================================

-- Optional: Create Database (run if database doesn't exist yet)
-- CREATE DATABASE smart_qr_dining_hub;
-- \c smart_qr_dining_hub;

-- Enable pgcrypto extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables if re-initializing (in reverse dependency order)
DROP TABLE IF EXISTS analytics_events CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS chat_sessions CASCADE;
DROP TABLE IF EXISTS daily_menu_availability CASCADE;
DROP TABLE IF EXISTS menu_item_tags CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS menu_categories CASCADE;
DROP TABLE IF EXISTS offers CASCADE;
DROP TABLE IF EXISTS languages CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS restaurant_tables CASCADE;
DROP TABLE IF EXISTS restaurants CASCADE;

-- ============================================================================
-- 1. restaurants
-- ============================================================================
CREATE TABLE restaurants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location TEXT,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 2. restaurant_tables
-- ============================================================================
CREATE TABLE restaurant_tables (
    id SERIAL PRIMARY KEY,
    restaurant_id INT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    table_number INT NOT NULL,
    qr_identifier VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);
CREATE INDEX idx_tables_restaurant ON restaurant_tables(restaurant_id);
CREATE INDEX idx_tables_qr ON restaurant_tables(qr_identifier);

-- ============================================================================
-- 3. admin_users
-- ============================================================================
CREATE TABLE admin_users (
    id SERIAL PRIMARY KEY,
    restaurant_id INT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) DEFAULT 'owner'
);
CREATE INDEX idx_admin_email ON admin_users(email);

-- ============================================================================
-- 4. menu_categories
-- ============================================================================
CREATE TABLE menu_categories (
    id SERIAL PRIMARY KEY,
    restaurant_id INT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT
);
CREATE INDEX idx_categories_restaurant ON menu_categories(restaurant_id);

-- ============================================================================
-- 5. menu_items
-- ============================================================================
CREATE TABLE menu_items (
    id SERIAL PRIMARY KEY,
    restaurant_id INT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    category_id INT NOT NULL REFERENCES menu_categories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    ingredients TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE
);
CREATE INDEX idx_menu_items_name ON menu_items(name);
CREATE INDEX idx_menu_items_category ON menu_items(category_id);

-- ============================================================================
-- 6. menu_item_tags
-- ============================================================================
CREATE TABLE menu_item_tags (
    id SERIAL PRIMARY KEY,
    menu_item_id INT NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    tag_name VARCHAR(100) NOT NULL,
    tag_type VARCHAR(50) DEFAULT 'dietary'
);
CREATE INDEX idx_tags_menu_item ON menu_item_tags(menu_item_id);
CREATE INDEX idx_tags_name ON menu_item_tags(tag_name);

-- ============================================================================
-- 7. daily_menu_availability (Roadmap Pages 5 & 6)
-- ============================================================================
CREATE TABLE daily_menu_availability (
    id SERIAL PRIMARY KEY,
    menu_item_id INT NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    menu_date DATE DEFAULT CURRENT_DATE,
    is_available BOOLEAN DEFAULT TRUE,
    is_today_special BOOLEAN DEFAULT FALSE,
    special_price DECIMAL(10, 2)
);
CREATE INDEX idx_daily_avail_date ON daily_menu_availability(menu_date);
CREATE INDEX idx_daily_avail_item ON daily_menu_availability(menu_item_id);

-- ============================================================================
-- 8. offers
-- ============================================================================
CREATE TABLE offers (
    id SERIAL PRIMARY KEY,
    restaurant_id INT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    discount_value DECIMAL(10, 2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- ============================================================================
-- 9. languages
-- ============================================================================
CREATE TABLE languages (
    id SERIAL PRIMARY KEY,
    language_code VARCHAR(10) UNIQUE NOT NULL,
    language_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- ============================================================================
-- 10. chat_sessions
-- ============================================================================
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id INT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    table_id INT REFERENCES restaurant_tables(id) ON DELETE SET NULL,
    language_id INT REFERENCES languages(id) ON DELETE SET NULL,
    session_token UUID DEFAULT gen_random_uuid(),
    started_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_sessions_token ON chat_sessions(session_token);

-- ============================================================================
-- 11. chat_messages
-- ============================================================================
CREATE TABLE chat_messages (
    id BIGSERIAL PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    sender VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_messages_session ON chat_messages(session_id);

-- ============================================================================
-- 12. analytics_events
-- ============================================================================
CREATE TABLE analytics_events (
    id BIGSERIAL PRIMARY KEY,
    restaurant_id INT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    table_id INT REFERENCES restaurant_tables(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_analytics_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_restaurant ON analytics_events(restaurant_id);


-- ============================================================================
-- SEED SAMPLE DATA (Immediate Testing)
-- ============================================================================

-- 1. Restaurant
INSERT INTO restaurants (id, name, location, settings) VALUES 
(1, 'The Royal Spice Bistro', '742 Evergreen Terrace, Downtown District', 
 '{"currency": "$", "phone": "+1 (555) 382-4468", "review_url": "https://maps.google.com/?cid=101", "welcome_message": "Welcome to The Royal Spice Bistro! Scan, talk to our AI waiter, or browse our menu.", "theme_color": "#EA580C"}'::jsonb);

-- 2. Admin User (Password: admin123)
INSERT INTO admin_users (id, restaurant_id, name, email, password_hash, role) VALUES 
(1, 1, 'Chef Vikram & Team', 'admin@dininghub.com', '$2b$12$PoZDQQpWJHrF4NhzMx/ovesKR2PPwbWZggNCWwgxfIp6hYzrg0kDW', 'owner');

-- 3. Restaurant Tables
INSERT INTO restaurant_tables (restaurant_id, table_number, qr_identifier, is_active) VALUES 
(1, 1, 'bistro-table-1', TRUE),
(1, 2, 'bistro-table-2', TRUE),
(1, 3, 'bistro-table-3', TRUE),
(1, 4, 'bistro-table-4', TRUE),
(1, 5, 'bistro-table-5', TRUE),
(1, 6, 'bistro-table-6', TRUE),
(1, 7, 'bistro-table-7', TRUE),
(1, 8, 'bistro-table-8', TRUE);

-- 4. Languages
INSERT INTO languages (language_code, language_name, is_active) VALUES 
('en', 'English', TRUE),
('hi', 'हिन्दी (Hindi)', TRUE),
('es', 'Español', TRUE),
('fr', 'Français', TRUE);

-- 5. Menu Categories
INSERT INTO menu_categories (id, restaurant_id, name, description) VALUES 
(1, 1, 'Starters & Appetizers', 'Crispy, savory delights to kickstart your meal'),
(2, 1, 'Main Course Curries', 'Authentic rich curries and royal specialties'),
(3, 1, 'Breads & Biryanis', 'Clay oven baked flatbreads & aromatic basmati rice'),
(4, 1, 'Artisanal Desserts', 'Sweet traditional & fusion treats'),
(5, 1, 'Beverages & Mocktails', 'Refreshing coolers, shakes, and spiced teas'),
(6, 1, 'Kids Corner', 'Mild, yummy, fun meals for young foodies');

-- 6. Menu Items
INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, ingredients, image_url, is_active) VALUES 
(101, 1, 1, 'Paneer Tikka', 'Succulent cubes of cottage cheese marinated in spiced yogurt and grilled in the tandoor with bell peppers.', 12.99, 'Paneer, bell peppers, yogurt, garam masala, chili, lemon', 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500&auto=format&fit=crop&q=60', TRUE),
(102, 1, 1, 'Chicken Wings', 'Crispy roasted tandoori chicken wings tossed in hot tangy glaze.', 11.99, 'Chicken wings, peri-peri spice, garlic, butter', 'https://images.unsplash.com/photo-1527477378378-fc74e0d9bdbe?w=500&auto=format&fit=crop&q=60', TRUE),
(103, 1, 1, 'Crispy Corn & Water Chestnut', 'Golden fried sweet corn kernels tossed with black pepper, scallions, and herbs.', 9.99, 'Sweet corn, water chestnut, spring onion, crushed pepper', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=60', TRUE),
(104, 1, 2, 'Paneer Butter Masala', 'Soft cottage cheese simmered in a silky, buttery tomato sauce infused with fenugreek leaves.', 13.49, 'Paneer, ripe tomatoes, fresh cream, butter, kasuri methi', 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60', TRUE),
(105, 1, 2, 'Veggie Burger', 'Crisp spiced potato and vegetable patty served with lettuce, tomatoes, and house sauce.', 10.49, 'Potatoes, peas, carrots, sesame bun, herb mayo', 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500&auto=format&fit=crop&q=60', TRUE),
(106, 1, 2, 'Paneer Curry', 'Traditional North Indian homestyle paneer curry cooked with onions, ginger, and rich ground spices.', 15.99, 'Paneer, onion, ginger-garlic paste, coriander, whole spices', 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&auto=format&fit=crop&q=60', TRUE),
(107, 1, 2, 'Butter Chicken', 'Char-grilled marinated chicken cooked in a velvety tomato, honey, and fresh cream gravy.', 16.99, 'Boneless chicken, tomato reduction, cream, butter, mild spices', 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&auto=format&fit=crop&q=60', TRUE),
(108, 1, 2, 'Jain Moong Dal Khichdi', 'Pure sattvic yellow moong lentils and basmati rice tempered gently with cumin and pure desi ghee.', 11.49, 'Yellow moong dal, aged basmati rice, cumin, pure ghee, rock salt', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60', TRUE),
(109, 1, 3, 'Garlic Butter Naan', 'Tandoor baked leavened flatbread brushed with crushed garlic and melted herb butter.', 3.99, 'Refined flour, garlic, butter, fresh cilantro', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=60', TRUE),
(110, 1, 3, 'Dum Royal Veg Biryani', 'Layers of fragrant long-grain basmati rice and marinated seasonal vegetables slow-cooked in a sealed clay pot.', 13.99, 'Basmati rice, seasonal vegetables, saffron, mint, fried onions, whole spices', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60', TRUE),
(111, 1, 4, 'Gulab Jamun with Ice Cream', 'Warm caramelized milk dough dumplings soaked in rose-cardamom syrup paired with vanilla ice cream.', 6.49, 'Khoya milk solids, saffron, green cardamom, vanilla ice cream', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=60', TRUE),
(112, 1, 5, 'Mango Lassi', 'Traditional thick chilled yogurt smoothie blended with ripe Alphonso mango puree and crushed pistachios.', 4.99, 'Yogurt, Alphonso mango pulp, sugar, pistachio dust', 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=500&auto=format&fit=crop&q=60', TRUE),
(113, 1, 6, 'Kids Cheesy Smiles & Fries', 'Golden crispy potato smiles and shoestring fries sprinkled with mild cheddar cheese dip.', 5.99, 'Potatoes, vegetable oil, mild cheese sauce', 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=500&auto=format&fit=crop&q=60', TRUE);

-- 7. Menu Item Tags
INSERT INTO menu_item_tags (menu_item_id, tag_name, tag_type) VALUES 
(101, 'Vegetarian', 'dietary'), (101, 'Spicy', 'spice_level'), (101, 'Gluten-Free', 'allergen'),
(102, 'Non-Vegetarian', 'dietary'), (102, 'Spicy', 'spice_level'),
(103, 'Vegetarian', 'dietary'), (103, 'Vegan', 'dietary'), (103, 'Mild', 'spice_level'),
(104, 'Vegetarian', 'dietary'), (104, 'Mild', 'spice_level'), (104, 'Contains Dairy', 'allergen'),
(105, 'Vegetarian', 'dietary'), (105, 'Kids Friendly', 'audience'), (105, 'Mild', 'spice_level'),
(106, 'Vegetarian', 'dietary'), (106, 'Spicy', 'spice_level'),
(107, 'Non-Vegetarian', 'dietary'), (107, 'Mild', 'spice_level'),
(108, 'Vegetarian', 'dietary'), (108, 'Jain', 'dietary'), (108, 'Mild', 'spice_level'),
(109, 'Vegetarian', 'dietary'),
(110, 'Vegetarian', 'dietary'), (110, 'Spicy', 'spice_level'),
(111, 'Vegetarian', 'dietary'), (111, 'Dessert', 'category'),
(112, 'Vegetarian', 'dietary'), (112, 'Beverage', 'category'), (112, 'Kids Friendly', 'audience'),
(113, 'Vegetarian', 'dietary'), (113, 'Kids', 'audience'), (113, 'Mild', 'spice_level');

-- 8. Daily Menu Availability (Examples from Roadmap: Paneer Tikka=Available, Chicken Wings=Sold Out, Veggie Burger=Special, Paneer Curry=Special Price)
INSERT INTO daily_menu_availability (menu_item_id, menu_date, is_available, is_today_special, special_price) VALUES 
(101, CURRENT_DATE, TRUE, FALSE, NULL),
(102, CURRENT_DATE, FALSE, FALSE, NULL),                     -- Chicken Wings: Sold Out today!
(103, CURRENT_DATE, TRUE, FALSE, NULL),
(104, CURRENT_DATE, TRUE, FALSE, NULL),
(105, CURRENT_DATE, TRUE, TRUE, 8.99),                       -- Veggie Burger: Today's Special $8.99
(106, CURRENT_DATE, TRUE, TRUE, 14.99),                      -- Paneer Curry: Special price $14.99 today
(107, CURRENT_DATE, TRUE, FALSE, NULL),
(108, CURRENT_DATE, TRUE, FALSE, NULL),
(109, CURRENT_DATE, TRUE, FALSE, NULL),
(110, CURRENT_DATE, TRUE, FALSE, NULL),
(111, CURRENT_DATE, TRUE, FALSE, NULL),
(112, CURRENT_DATE, TRUE, FALSE, NULL),
(113, CURRENT_DATE, TRUE, FALSE, NULL);

-- 9. Offers
INSERT INTO offers (restaurant_id, title, description, discount_value, start_date, end_date, is_active) VALUES 
(1, 'Weekend Feast 20% OFF', 'Enjoy flat 20% discount on all orders above $40. Auto-applied during checkout!', 20.0, CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE + INTERVAL '14 days', TRUE),
(1, 'Free Mango Lassi with 2 Mains', 'Order any two chef main course curries and receive a complimentary chilled Mango Lassi.', 4.99, CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '20 days', TRUE);

-- 10. Sample Analytics Events
INSERT INTO analytics_events (restaurant_id, table_id, event_type, event_data) VALUES 
(1, 1, 'qr_scan', '{"table_number": 1, "source": "camera"}'::jsonb),
(1, 5, 'qr_scan', '{"table_number": 5, "source": "camera"}'::jsonb),
(1, 1, 'menu_view', '{"category": "Main Course Curries"}'::jsonb),
(1, 1, 'ai_conversation', '{"query": "Suggest something spicy and vegetarian under $14"}'::jsonb),
(1, 1, 'voice_interaction', '{"duration_seconds": 6}'::jsonb),
(1, 1, 'game_play', '{"game": "Memory Match", "score": 120}'::jsonb),
(1, 1, 'offer_click', '{"offer_id": 1}'::jsonb),
(1, 1, 'review_click', '{"target": "Google Reviews"}'::jsonb);

-- Fix sequences
SELECT setval('restaurants_id_seq', (SELECT MAX(id) FROM restaurants));
SELECT setval('restaurant_tables_id_seq', (SELECT MAX(id) FROM restaurant_tables));
SELECT setval('admin_users_id_seq', (SELECT MAX(id) FROM admin_users));
SELECT setval('menu_categories_id_seq', (SELECT MAX(id) FROM menu_categories));
SELECT setval('menu_items_id_seq', (SELECT MAX(id) FROM menu_items));
SELECT setval('menu_item_tags_id_seq', (SELECT MAX(id) FROM menu_item_tags));
SELECT setval('daily_menu_availability_id_seq', (SELECT MAX(id) FROM daily_menu_availability));
SELECT setval('offers_id_seq', (SELECT MAX(id) FROM offers));
SELECT setval('languages_id_seq', (SELECT MAX(id) FROM languages));

-- Done!
SELECT 'Database schema & sample seed data created successfully!' AS status;
