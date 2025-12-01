@echo off
REM Safe startup script that checks Docker before running commands

call check-docker.bat
if %errorlevel% neq 0 exit /b 1

echo Starting application...
echo.
docker-compose up --build -d

if %errorlevel% equ 0 (
    echo.
    echo [SUCCESS] Application started!
    echo.
    echo Frontend: http://localhost:3000
    echo Backend:  http://localhost:5000
    echo.
    echo To view logs:    docker-compose logs -f
    echo To stop:         docker-compose down
    echo.
) else (
    echo.
    echo [ERROR] Failed to start application
    echo.
)

pause
