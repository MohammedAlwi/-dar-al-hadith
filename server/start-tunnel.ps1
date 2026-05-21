$logFile = "$PSScriptRoot\tunnel-url.txt"
$serverDir = $PSScriptRoot

# Start server
$server = Start-Process -FilePath "C:\Program Files\nodejs\node.exe" -ArgumentList "index.js" -WorkingDirectory $serverDir -WindowStyle Hidden -PassThru

Start-Sleep -Seconds 4

# Start SSH tunnel and capture output
$output = & "C:\Windows\System32\OpenSSH\ssh.exe" -o StrictHostKeyChecking=accept-new -o ServerAliveInterval=30 -R 80:localhost:5000 serveo.net 2>&1 | Tee-Object -FilePath $logFile

# Extract URL
foreach ($line in $output) {
  if ($line -match 'https?://[^\s]+') {
    $url = $matches[0]
    Set-Content -Path $logFile -Value "URL: $url`r`nLogin: admin / admin123"
    break
  }
}

# Keep running
Wait-Process -Id $server.Id
