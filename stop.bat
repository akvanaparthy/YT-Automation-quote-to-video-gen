@echo off
REM Safe stop script

call check-docker.bat
if %errorlevel% neq 0 (
    echo Warning: Docker not running, but will attempt to clean up...
    echo.
)

echo Stopping application...
docker-compose down

if %errorlevel% equ 0 (
    echo.
    echo [SUCCESS] Application stopped
    echo.
) else (
    echo.
    echo [ERROR] Failed to stop cleanly
    echo You may need to restart Docker Desktop
    echo.
)

pause
