@echo off
chcp 65001 >nul
cd /d "%~dp0"
set ROOT=%CD%

echo ============================================
echo   معهد دار الحديث بتريم - نظام الإدارة
echo ============================================
echo.

echo [1/2] Starting Server...
start "Server" /B "%ROOT%\server\node_modules\.bin\nodemon.cmd" -- "%ROOT%\server\index.js"
if %ERRORLEVEL% NEQ 0 (
  echo Starting server with node directly...
  start "Server" /B "C:\Program Files\nodejs\node.exe" "%ROOT%\server\index.js"
)
timeout /t 4 /nobreak >nul

echo [2/2] Starting Client...
start "Client" /B "C:\Program Files\nodejs\npm.cmd" run dev --prefix "%ROOT%\client"
timeout /t 2 /nobreak >nul

echo.
echo Server: http://localhost:5000
echo Client: http://localhost:3000
echo Login: admin / admin123
echo.
echo Close this window when you want to stop.
pause

taskkill /f /im node.exe >nul 2>&1
