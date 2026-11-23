import os
import sys
import subprocess

# 1. Auto-switch to virtual environment if running outside backend_venv
backend_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(backend_dir)
venv_python = os.path.join(root_dir, "backend_venv", "Scripts", "python.exe")

if os.path.exists(venv_python) and os.path.normpath(sys.executable).lower() != os.path.normpath(venv_python).lower():
    print(f"[*] Detected global python. Auto-switching to project virtual environment: {venv_python}")
    result = subprocess.run([venv_python, os.path.abspath(__file__)] + sys.argv[1:])
    sys.exit(result.returncode)

# 2. Ensure backend directory is in sys.path
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

import uvicorn

if __name__ == "__main__":
    print("=" * 60)
    print("Starting Smart QR Dining Hub Backend Server...")
    print("API URL:          http://localhost:8000")
    print("Swagger Docs:     http://localhost:8000/docs")
    print("=" * 60)
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
