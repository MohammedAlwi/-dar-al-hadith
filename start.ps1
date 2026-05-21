Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  معهد دار الحديث بتريم - نظام الإدارة" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Start Server
Write-Host "[1/2] Starting Server (port 5000)..." -ForegroundColor Yellow
$serverJob = Start-Job -ScriptBlock {
    Set-Location -LiteralPath $args[0]
    & "C:\Program Files\nodejs\node.exe" index.js
} -ArgumentList "$rootDir\server"
Start-Sleep -Seconds 3

# Start Client
Write-Host "[2/2] Starting Client (port 3000)..." -ForegroundColor Yellow
$clientJob = Start-Job -ScriptBlock {
    Set-Location -LiteralPath $args[0]
    & "C:\Program Files\nodejs\npm.cmd" run dev
} -ArgumentList "$rootDir\client"
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "Server: http://localhost:5000" -ForegroundColor Green
Write-Host "Client: http://localhost:3000" -ForegroundColor Green
Write-Host "Login: admin / admin123" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to stop both servers..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Stop-Job $serverJob
Stop-Job $clientJob
Remove-Job $serverJob
Remove-Job $clientJob
