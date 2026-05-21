@echo off
chcp 65001 >nul
echo ============================================
echo   إكمال النشر - ربط Firebase + Railway
echo ============================================
echo.

set /p API_URL="أدخل رابط Railway API (مثل https://dar-al-hadith-production.up.railway.app): "

:: بناء الواجهة مع رابط API الجديد
echo [1/2] Building client with API URL: %API_URL%
set VITE_API_URL=%API_URL%/api
cd /d "%~dp0client"
call npm run build

:: رفع إلى Firebase
echo [2/2] Deploying to Firebase...
cd /d "%~dp0"
call firebase deploy --only hosting

echo.
echo ✅ تم الانتهاء!
echo الواجهة: https://dar-alhadith-tarim.web.app
echo API: %API_URL%
echo.
pause
