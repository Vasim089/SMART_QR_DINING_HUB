# Smart QR Dining Hub

> **Concept:** Scan → Talk → Get help  
> An AI-powered, mobile-first dining assistant web app accessible by scanning table QR codes without needing any app installation.

---

## 🌟 Key Features

### 1. Customer Web Application (Mobile-First)
- **Table QR Entry:** Customers scan table QR codes (e.g., `/?restaurant=1&table=5`) to immediately access their personalized table session.
- **AI Voice Assistant (Primary Interface):**
  - **Voice Interaction:** Tap-to-speak via Web Speech API (`webkitSpeechRecognition`).
  - **Voice Feedback:** Text-to-speech voice response via browser `window.speechSynthesis`.
  - **Context-Aware Recommendations:** Understands dietary restrictions (Vegetarian, Jain, Vegan), budgets (e.g. *"under $14"*), spice levels (*"is it spicy?"*, *"suggest something milder"*), kids items, and chef specials.
  - **Zero Hallucination:** Constrained to strictly recommend items available on the restaurant's daily menu.
- **Multilingual Support:** English, Hindi, Spanish, French with instant language switcher and welcome language modal.
- **Interactive Digital Menu:** Category browsing, dietary filter chips (Pure Veg, Jain, Spicy, Today's Special), price displays, and search.
- **Kids Fun Zone:** Lightweight entertainment games while waiting (Memory Food Match, Emoji Tic-Tac-Toe vs Robot Chef) with automatic analytics tracking.
- **Restaurant Offers & Promotions:** Claimable discounts and special combo deals.
- **Customer Reviews:** 5-star rating modal with direct Google Reviews link.
- **Order Cart:** Real-time dish counter and table order submission.

---

### 2. Restaurant Owner Dashboard
- **Daily Menu Availability Manager:**
  - One-click toggles for **Available** / **Sold Out** (e.g., Chicken Wings marked Sold Out).
  - **Today's Special** toggle and custom **Special Price** editor (e.g., Veggie Burger special at $8.99).
  - The AI assistant dynamically queries this status before recommending dishes.
- **Live Analytics & Engagement Metrics (Recharts):**
  - Total QR Scans
  - Menu Views
  - AI Conversations
  - Voice Interactions
  - Kids Zone Activity
  - Offer & Review Clicks
  - Popular Category distribution
- **Table QR Code Generator:**
  - View and download printable high-resolution QR codes for tabletop stands.
  - Add new tables dynamically with auto-generated QR identifiers.
- **Customer AI Session Inspector:**
  - Real-time transcripts of what diners at tables are asking the AI waiter.

---

## 🛠️ Tech Stack

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React.js (Vite) + Tailwind CSS | Mobile-first customer UI & Owner Dashboard |
| **Voice Agent** | Web Speech API + SpeechSynthesis | Speech-to-text input & natural voice replies |
| **Charts** | Recharts | Owner dashboard analytics visualizations |
| **Backend** | Python 3.12 + FastAPI | REST APIs, daily menu filtering, AI orchestration |
| **Database & ORM** | SQLite / PostgreSQL + SQLAlchemy | 12 relational database tables |
| **Data Validation** | Pydantic v2 | Request/response schemas |
| **QR Generation** | Python `qrcode` + Pillow | Dynamic table QR code generation |
| **AI Model Layer** | Ollama + Qwen 2.5 3B / Gemini / Smart Local Engine | Intent parsing, menu reasoning, and dialogue context |
| **Authentication** | JWT (OAuth2) | Secure restaurant owner dashboard login |

---

## 📁 Database Schema (12 Tables)

1. `restaurants`: Restaurant name, location, settings.
2. `restaurant_tables`: Table numbers and QR code identifiers.
3. `admin_users`: Restaurant owner login credentials.
4. `menu_categories`: Starters, mains, breads & rice, desserts, beverages, kids.
5. `menu_items`: Food item details, base prices, ingredients, photos.
6. `menu_item_tags`: Vegetarian, Spicy, Jain, Mild, Gluten-Free, Kids.
7. `daily_menu_availability`: Date-specific stock availability, today's special, and special prices.
8. `offers`: Restaurant promotions, discount values, and valid date ranges.
9. `languages`: Supported languages (en, hi, es, fr).
10. `chat_sessions`: Table AI conversation sessions.
11. `chat_messages`: Conversation message history (Customer & AI).
12. `analytics_events`: QR scans, menu views, voice talks, game plays, offer & review clicks.

---

## 🚀 Getting Started

### 0. Local AI Model: Ollama + Qwen 2.5 3B (Recommended)
1. Download & install Ollama from [https://ollama.com](https://ollama.com).
2. Pull and run the local Qwen 2.5 3B model:
   ```bash
   ollama run qwen2.5:3b
   ```
   *Note: If Ollama is not running, the system will seamlessly use its built-in standby restaurant reasoning engine without interrupting the dining experience.*

### 1. Automatic Startup (Windows)
Double click `start_servers.bat` in the project root to start both backend and frontend servers automatically.

### 2. Manual Startup

#### Backend (FastAPI)
```bash
# Run backend server
.\backend_venv\Scripts\python.exe -m uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port 8000 --reload
```
- Swagger API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

#### Frontend (React + Vite)
```bash
npm --prefix frontend run dev
```
- Customer Dining Hub (Table 1): [http://localhost:5173/?restaurant=1&table=1](http://localhost:5173/?restaurant=1&table=1)
- Customer Dining Hub (Table 5): [http://localhost:5173/?restaurant=1&table=5](http://localhost:5173/?restaurant=1&table=5)
- Owner Dashboard: [http://localhost:5173/?mode=owner](http://localhost:5173/?mode=owner)

---

## 🔑 Default Owner Credentials
- **Email:** `admin@dininghub.com`
- **Password:** `admin123`

---

## 🧪 Testing the Complete System
Run the automated test suite verifying all 10 modules:
```bash
$env:PYTHONPATH="backend"
.\backend_venv\Scripts\python.exe backend\test_api.py
```
All tests verify root health, digital menu querying, daily availability controls, AI conversational context, table QR generation, and analytics logging.
