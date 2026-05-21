@echo off
chcp 1256 >nul
echo.
echo ============================================
echo   Upload code to GitHub
echo ============================================
echo.

set /p URL="Enter GitHub repository URL (e.g. https://github.com/username/repo.git): "

git add -A
git commit -m "Dar Al-Hadith Institute Management System - full project"
git branch -M main
git remote add origin %URL%
git push -u origin main

echo.
echo Done! Code uploaded to GitHub.
echo.
pause
