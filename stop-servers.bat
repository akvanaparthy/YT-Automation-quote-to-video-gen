@echo off
echo Stopping servers on ports 5000 and 3000...

REM Find and kill process on port 5000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
    taskkill /PID %%a /F 2>nul
    if not errorlevel 1 echo Killed process on port 5000 (PID: %%a)
)

REM Find and kill process on port 3000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    taskkill /PID %%a /F 2>nul
    if not errorlevel 1 echo Killed process on port 3000 (PID: %%a)
)

echo.
echo Done!
pause
