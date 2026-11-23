import os
import qrcode
from PIL import Image, ImageDraw, ImageFont

def generate_table_qr_images(base_url="http://localhost:5173", output_dir="table_qr_codes"):
    os.makedirs(output_dir, exist_ok=True)
    print(f"Generating Table QR Codes in '{output_dir}/'...")

    for table_num in range(1, 9):
        target_url = f"{base_url}/?restaurant=1&table={table_num}"
        
        # Generate QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_H,
            box_size=12,
            border=3,
        )
        qr.add_data(target_url)
        qr.make(fit=True)
        
        qr_img = qr.make_image(fill_color="#0F172A", back_color="#FFFFFF").convert("RGB")
        
        # Create a nice tabletop placard card with title
        card_w = qr_img.width + 60
        card_h = qr_img.height + 140
        card = Image.new("RGB", (card_w, card_h), "#FFFFFF")
        draw = ImageDraw.Draw(card)
        
        # Border
        draw.rectangle([(2, 2), (card_w - 3, card_h - 3)], outline="#EA580C", width=3)
        
        # Header text
        header_text = "The Royal Spice Bistro"
        table_text = f"TABLE #{table_num}"
        sub_text = "Scan -> Talk to AI Waiter"
        
        # Paste QR
        card.paste(qr_img, (30, 85))
        
        # Simple text drawing
        draw.text((card_w // 2 - 80, 20), header_text, fill="#0F172A")
        draw.text((card_w // 2 - 45, 45), table_text, fill="#EA580C")
        draw.text((card_w // 2 - 85, card_h - 35), sub_text, fill="#64748B")
        
        file_path = os.path.join(output_dir, f"Table_{table_num}_QR.png")
        card.save(file_path, "PNG")
        print(f"  ✓ Saved: {file_path} -> {target_url}")

    print(f"\nAll table QR codes are ready in '{os.path.abspath(output_dir)}'!")

if __name__ == "__main__":
    generate_table_qr_images()
