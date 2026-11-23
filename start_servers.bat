@echo off
echo ========================================================
echo        SMART QR DINING HUB - STARTUP SCRIPT
echo ========================================================
echo.

echo Starting FastAPI Backend on http://localhost:8000 ...
start "Smart QR Backend" cmd /k "cd backend && ..\backend_venv\Scripts\python.exe main.py"

timeout /t 2 /nobreak >nul

echo Starting Vite React Frontend on http://localhost:5173 ...
start "Smart QR Frontend" cmd /k "npm --prefix frontend run dev"

echo.
echo ========================================================
echo Servers are launching!
echo.
echo 👑 OWNER / ADMIN DASHBOARD (Where all QR codes are managed):
echo    URL:         http://localhost:5173/?mode=owner
echo    Credentials: admin@dininghub.com / admin123
echo    Features:    Generate & Print Table QR Codes, Daily Menu Availability, Analytics
echo.
echo 🍽️ CUSTOMER DINING VIEW (Mobile-friendly only, no QR codes):
echo    Table 1:     http://localhost:5173/?restaurant=1&table=1
echo    Table 5:     http://localhost:5173/?restaurant=1&table=5
echo.
echo 🤖 Local AI Model: Ollama + Qwen 2.5 3B (http://localhost:11434)
echo    Run command: ollama run qwen2.5:3b
echo.
echo 📖 Swagger API Docs: http://localhost:8000/docs
echo ========================================================
pause
