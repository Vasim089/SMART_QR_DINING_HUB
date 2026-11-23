import io
import base64
import qrcode
from app.config import settings

def generate_table_qr_code(restaurant_id: int, table_number: int, qr_identifier: str = None) -> str:
    """
    Generates a base64 encoded PNG data URL for the table QR code.
    URL pattern: {FRONTEND_URL}/?restaurant={restaurant_id}&table={table_number}
    """
    target_url = f"{settings.FRONTEND_URL}/?restaurant={restaurant_id}&table={table_number}"
    
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=3,
    )
    qr.add_data(target_url)
    qr.make(fit=True)

    img = qr.make_image(fill_color="#0F172A", back_color="#FFFFFF")
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    img_bytes = buffered.getvalue()
    
    base64_encoded = base64.b64encode(img_bytes).decode("utf-8")
    return f"data:image/png;base64,{base64_encoded}"
