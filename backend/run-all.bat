@echo off
echo ========================================
echo Re-Route - Starting All Services
echo ========================================
echo.

echo [1] Generating Prisma Client...
cd /d "%~dp0"
call npx prisma generate
if errorlevel 1 (
    echo ERROR: Prisma generate failed
    pause
    exit /b 1
)
echo.

echo [2] Starting Backend Server...
start "Re-Route Backend" cmd /k "node src\index.js"
timeout /t 3 /nobreak >nul
echo Backend started on http://localhost:3001
echo.

echo [3] Starting Frontend...
cd /d "%~dp0..\frontend"
start "Re-Route Frontend" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul
echo Frontend started on http://localhost:5173
echo.

echo ========================================
echo All services started!
echo.
echo Backend: http://localhost:3001
echo Frontend: http://localhost:5173
echo.
echo Press any key to exit this window...
echo (Services will keep running in background)
echo ========================================
pause >nul
