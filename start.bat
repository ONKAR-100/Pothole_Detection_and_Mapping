@echo off
echo.
echo  =================================================
echo   PotholeWatch v3 - Starting Both Servers
echo  =================================================
echo.

echo  Starting Flask backend on port 8000...
start "PotholeWatch Backend" cmd /k "cd /d "%~dp0backend" && python main.py"

timeout /t 4 /nobreak > nul

echo  Starting React frontend on port 5173...
start "PotholeWatch Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo  =================================================
echo   PotholeWatch is starting up!
echo.
echo   Frontend : http://localhost:5173
echo   Backend  : http://localhost:8000
echo   Health   : http://localhost:8000/health
echo  =================================================
echo.
