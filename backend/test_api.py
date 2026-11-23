from starlette.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app import models

client = TestClient(app)

def test_full_system():
    print("Testing Smart QR Dining Hub System Endpoints...\n")

    # 1. Health check
    resp = client.get("/")
    assert resp.status_code == 200, f"Root failed: {resp.text}"
    print("✓ GET / (Root health check): OK")

    # 2. Public restaurant details
    resp = client.get("/api/public/restaurant/1")
    assert resp.status_code == 200
    restaurant_data = resp.json()
    assert restaurant_data["name"] == "The Royal Spice Bistro"
    print(f"✓ GET /api/public/restaurant/1: Loaded '{restaurant_data['name']}'")

    # 3. Table verification
    resp = client.get("/api/public/restaurant/1/table/1")
    assert resp.status_code == 200
    table_data = resp.json()
    assert table_data["table_number"] == 1
    print(f"✓ GET /api/public/restaurant/1/table/1: Table {table_data['table_number']} OK")

    # 4. Digital menu with daily availability
    resp = client.get("/api/public/restaurant/1/menu")
    assert resp.status_code == 200
    categories = resp.json()
    assert len(categories) > 0
    all_items = [item for c in categories for item in c["items"]]
    print(f"✓ GET /api/public/restaurant/1/menu: Loaded {len(categories)} categories with {len(all_items)} items")

    # Check that sold out item (Chicken Wings) has is_available == False
    chicken_wings = next((i for i in all_items if i["name"] == "Chicken Wings"), None)
    assert chicken_wings is not None
    assert chicken_wings["is_available"] == False, "Chicken Wings should be marked Sold Out today"
    print(f"✓ Daily Availability Verification: 'Chicken Wings' correctly marked as Sold Out={not chicken_wings['is_available']}")

    # Check today's special (Veggie Burger) has is_today_special == True
    veggie_burger = next((i for i in all_items if i["name"] == "Veggie Burger"), None)
    assert veggie_burger is not None
    assert veggie_burger["is_today_special"] == True
    print(f"✓ Daily Specials Verification: 'Veggie Burger' marked as Today's Special at ${veggie_burger['effective_price']}")

    # 5. AI Voice / Chat Assistant test
    # "Suggest something spicy and vegetarian under $14"
    chat_payload = {
        "restaurant_id": 1,
        "table_id": 1,
        "message": "Suggest something spicy and vegetarian under $14",
        "language_code": "en"
    }
    resp = client.post("/api/chat/message", json=chat_payload)
    assert resp.status_code == 200
    chat_res = resp.json()
    session_token = chat_res["session_token"]
    print("\n✓ AI Conversation Step 1:")
    print("  Customer: Suggest something spicy and vegetarian under $14")
    print(f"  AI Response: {chat_res['response_text']}")
    print(f"  Recommended Dishes: {[d['name'] for d in chat_res['recommended_dishes']]}")
    assert any("Paneer Tikka" in d["name"] for d in chat_res["recommended_dishes"])

    # Step 2: Context follow up ("Is it spicy?")
    chat_payload_2 = {
        "restaurant_id": 1,
        "table_id": 1,
        "session_token": session_token,
        "message": "Is it spicy?",
        "language_code": "en"
    }
    resp2 = client.post("/api/chat/message", json=chat_payload_2)
    assert resp2.status_code == 200
    chat_res_2 = resp2.json()
    print("\n✓ AI Conversation Step 2 (Context Follow-Up):")
    print("  Customer: Is it spicy?")
    print(f"  AI Response: {chat_res_2['response_text']}")

    # Step 3: Context follow up ("Suggest something less spicy")
    chat_payload_3 = {
        "restaurant_id": 1,
        "table_id": 1,
        "session_token": session_token,
        "message": "Suggest something less spicy",
        "language_code": "en"
    }
    resp3 = client.post("/api/chat/message", json=chat_payload_3)
    assert resp3.status_code == 200
    chat_res_3 = resp3.json()
    print("\n✓ AI Conversation Step 3 (Context Follow-Up):")
    print("  Customer: Suggest something less spicy")
    print(f"  AI Response: {chat_res_3['response_text']}")

    # 6. Admin Login
    login_resp = client.post("/api/admin/json-login", json={"email": "admin@dininghub.com", "password": "admin123"})
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]
    auth_header = {"Authorization": f"Bearer {token}"}
    print(f"\n✓ Admin Authentication: Signed in successfully as '{login_resp.json()['admin_name']}'")

    # 7. Admin Tables with QR generation
    tables_resp = client.get("/api/admin/restaurant/1/tables", headers=auth_header)
    assert tables_resp.status_code == 200
    tables = tables_resp.json()
    assert len(tables) >= 8
    assert tables[0]["qr_code_image"].startswith("data:image/png;base64,")
    print(f"✓ Table QR Code Generator: Generated {len(tables)} table QR codes successfully")

    # 8. Admin Analytics
    analytics_resp = client.get("/api/admin/restaurant/1/analytics", headers=auth_header)
    assert analytics_resp.status_code == 200
    analytics_data = analytics_resp.json()
    print(f"✓ Owner Dashboard Analytics:")
    print(f"  - Total QR Scans: {analytics_data['total_qr_scans']}")
    print(f"  - AI Conversations: {analytics_data['total_ai_conversations']}")
    print(f"  - Voice Interactions: {analytics_data['total_voice_interactions']}")
    print(f"  - Kids Game Activity: {analytics_data['total_game_activity']}")
    print(f"  - Offer Clicks: {analytics_data['total_offer_clicks']}")
    print(f"  - Review Clicks: {analytics_data['total_review_clicks']}")

    # 9. Daily Availability Update (Owner marks Paneer Tikka Sold Out)
    paneer_tikka_item = next(i for i in all_items if i["name"] == "Paneer Tikka")
    update_resp = client.post(
        "/api/admin/daily-menu/update",
        json={"menu_item_id": paneer_tikka_item["id"], "is_available": False, "is_today_special": False},
        headers=auth_header
    )
    assert update_resp.status_code == 200
    print(f"✓ Daily Menu Availability Update: Successfully changed Paneer Tikka to Sold Out")

    # 10. Verify that Paneer Tikka is now excluded from AI recommendations
    resp_ai_after_sold_out = client.post(
        "/api/chat/message",
        json={
            "restaurant_id": 1,
            "table_id": 1,
            "message": "Suggest something spicy and vegetarian under $14",
            "language_code": "en"
        }
    )
    chat_after = resp_ai_after_sold_out.json()
    assert not any(d["id"] == paneer_tikka_item["id"] for d in chat_after["recommended_dishes"]), "Sold out item should not be recommended"
    print(f"✓ AI Menu Verification: Sold out dish was automatically excluded by the AI agent")

    # Revert Paneer Tikka back to available
    client.post(
        "/api/admin/daily-menu/update",
        json={"menu_item_id": paneer_tikka_item["id"], "is_available": True, "is_today_special": False},
        headers=auth_header
    )

    print("\n🎉 ALL 10 TEST SUITES PASSED PERFECTLY!\n")

if __name__ == "__main__":
    test_full_system()
