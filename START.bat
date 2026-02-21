@echo off
REM ShoeStore Quick Start Script for Windows

echo.
echo ====================================
echo    ShoeStore E-Commerce Platform
echo ====================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please download and install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js is installed: 
node --version
echo.

echo Starting Backend Setup...
echo ====================================
cd backend

if not exist "node_modules" (
    echo Installing backend dependencies...
    call npm install
    echo.
)

echo.
echo ====================================
echo Starting Backend Server...
echo ====================================
echo Backend will run on: http://localhost:5000
echo.
start cmd /k "npm start"

timeout /t 3 /nobreak

echo.
echo ====================================
echo Backend started! Now starting Frontend...
echo ====================================
echo.

cd ..\frontend

echo.
echo Frontend server options:
echo.
echo 1. Using Python (if installed)
echo    python -m http.server 3000
echo.
echo 2. Using Node http-server
echo    npx http-server -p 3000
echo.
echo 3. Using VS Code Live Server extension
echo    Right-click index.html and select "Open with Live Server"
echo.
echo ====================================
echo.
echo Starting Frontend with http-server...
echo Frontend will run on: http://localhost:3000
echo.

start cmd /k "npx http-server -p 3000"

timeout /t 2 /nobreak

echo.
echo ====================================
echo Startup Complete!
echo ====================================
echo.
echo Open your browser and visit:
echo http://localhost:3000
echo.
echo If you see connection errors:
echo 1. Make sure backend is running (http://localhost:5000)
echo 2. Make sure frontend is serving on port 3000
echo 3. Check browser console for errors
echo.
pause
