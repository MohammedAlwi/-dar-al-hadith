@echo off
chcp 65001 >nul
echo ============================================
echo   رفع API إلى Railway
echo ============================================
echo.
echo الخطوات:
echo.
echo 1. اذهب إلى https://railway.app
echo 2. اضغط "Start a New Project"
echo 3. اختر "Deploy from GitHub repo"
echo 4. اختر المستودع الذي رفعته
echo 5. Railway سيكتشف تلقائياً railway.json
echo.
echo بعد النشر:
echo - سيظهر رابط مثل: https://dar-al-hadith-production.up.railway.app
echo - أضف PostgreSQL: Project Settings ^> Databases ^> Add PostgreSQL
echo - المتغير DATABASE_URL سيضاف تلقائياً
echo.
echo ثم عد إلى هنا وشغّل:
echo   deploy-finish.bat
echo.
pause
