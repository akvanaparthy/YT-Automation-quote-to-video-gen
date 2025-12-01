@echo off
REM Check if Docker Desktop is running

echo Checking Docker status...
docker info >nul 2>&1

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Docker Desktop is not running!
    echo.
    echo Please start Docker Desktop first:
    echo 1. Open Docker Desktop from Start Menu
    echo 2. Wait for it to finish starting (watch system tray icon)
    echo 3. Run this script again
    echo.
    pause
    exit /b 1
)

echo [OK] Docker is running!
echo.
