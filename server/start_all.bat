@echo off
cd /d "%~dp0"

REM Start server
start /B node.exe index.js
timeout /t 5 /nobreak >nul

REM Start SSH tunnel and save URL
ssh -o StrictHostKeyChecking=accept-new -o ServerAliveInterval=30 -R 80:localhost:5000 serveo.net > tunnel-url.txt 2>&1
