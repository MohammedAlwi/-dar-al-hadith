@echo off
chcp 65001 >nul
echo ============================================
echo   رفع الموقع إلى Firebase Hosting
echo ============================================
echo.

:: تعيين رابط API - غير هذا الرابط عند النشر
set VITE_API_URL=https://your-api.onrender.com/api

:: بناء الواجهة
echo [1/3] Building client...
cd /d "%~dp0client"
call npm run build
if %ERRORLEVEL% NEQ 0 (
  echo ❌ Build failed
  pause
  exit /b 1
)

:: رفع إلى Firebase
echo [2/3] Deploying to Firebase...
cd /d "%~dp0"
call npx firebase-tools deploy --only hosting
if %ERRORLEVEL% NEQ 0 (
  echo.
  echo ❌ فشل الرفع. تأكد من:
  echo  1. تم تثبيت Firebase CLI: npm install -g firebase-tools
  echo  2. تم تسجيل الدخول: firebase login
  echo  3. تم تعيين المشروع: firebase use --add
  pause
  exit /b 1
)

echo.
echo ✅ تم الرفع بنجاح!
echo.
pause
