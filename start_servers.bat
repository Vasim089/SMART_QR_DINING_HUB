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
echo Both servers are launching!
echo.
echo Local AI Model: Ollama + Qwen 2.5 3B (http://localhost:11434)
echo Tip: To activate local LLM, in another terminal run:
echo      ollama run qwen2.5:3b
echo.
echo Customer Dining Hub (Table 1): http://localhost:5173/?restaurant=1&table=1
echo Customer Dining Hub (Table 5): http://localhost:5173/?restaurant=1&table=5
echo Owner Dashboard:              http://localhost:5173/?mode=owner
echo Backend Swagger API Docs:     http://localhost:8000/docs
echo ========================================================
pause
