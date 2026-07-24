# Starts the Pong backend + frontend and exposes both via free Cloudflare quick tunnels.
# Run this from the project root: .\start-dev.ps1
# Stop everything with: .\stop-dev.ps1

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$cloudflared = "$env:USERPROFILE\cloudflared\cloudflared.exe"
$pidFile = "$root\.dev-pids.txt"
$backendTunnelLog = "$root\.backend-tunnel.log"
$frontendTunnelLog = "$root\.frontend-tunnel.log"

if (-not (Test-Path $cloudflared)) {
    Write-Host "cloudflared.exe not found at $cloudflared" -ForegroundColor Red
    Write-Host "Download it from https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
    exit 1
}

if (Test-Path $pidFile) {
    Write-Host "A dev session already looks like it's running (found $pidFile)." -ForegroundColor Yellow
    Write-Host "Run .\stop-dev.ps1 first if you want to restart cleanly."
    exit 1
}

Remove-Item $backendTunnelLog, $frontendTunnelLog -ErrorAction SilentlyContinue
"" | Set-Content $pidFile

function Wait-ForTunnelUrl($logPath, $label) {
    Write-Host "Waiting for $label tunnel URL..."
    for ($i = 0; $i -lt 30; $i++) {
        Start-Sleep -Seconds 1
        if (Test-Path $logPath) {
            $match = Select-String -Path $logPath -Pattern "https://[a-zA-Z0-9-]+\.trycloudflare\.com" | Select-Object -First 1
            if ($match) { return $match.Matches[0].Value }
        }
    }
    Write-Host "Timed out waiting for $label tunnel URL. Check $logPath" -ForegroundColor Red
    exit 1
}

# 1. Backend
Write-Host "Starting backend (port 3001)..."
$backend = Start-Process -FilePath "cmd.exe" -ArgumentList "/c cd /d `"$root\backend`" && npm run dev" -PassThru -WindowStyle Normal
"$($backend.Id)" | Add-Content $pidFile

# 2. Backend tunnel
$backendTunnel = Start-Process -FilePath $cloudflared -ArgumentList "tunnel --url http://localhost:3001" -PassThru -WindowStyle Hidden -RedirectStandardError $backendTunnelLog
"$($backendTunnel.Id)" | Add-Content $pidFile
$backendUrl = Wait-ForTunnelUrl $backendTunnelLog "backend"
Write-Host "Backend tunnel: $backendUrl"

# 3. Point the frontend at the backend tunnel (quick tunnel URLs are random each run)
"REACT_APP_SOCKET_SERVER_URL=$backendUrl" | Set-Content "$root\frontend\.env.local" -Encoding utf8

# 4. Frontend
Write-Host "Starting frontend (port 3000)..."
$frontend = Start-Process -FilePath "cmd.exe" -ArgumentList "/c cd /d `"$root\frontend`" && npm start" -PassThru -WindowStyle Normal
"$($frontend.Id)" | Add-Content $pidFile

Write-Host "Waiting for frontend dev server to boot..."
Start-Sleep -Seconds 10

# 5. Frontend tunnel
$frontendTunnel = Start-Process -FilePath $cloudflared -ArgumentList "tunnel --url http://localhost:3000" -PassThru -WindowStyle Hidden -RedirectStandardError $frontendTunnelLog
"$($frontendTunnel.Id)" | Add-Content $pidFile
$frontendUrl = Wait-ForTunnelUrl $frontendTunnelLog "frontend"

Write-Host ""
Write-Host "=================================================="
Write-Host " Share this link to test-play: $frontendUrl"
Write-Host "=================================================="
Write-Host ""
Write-Host "Run .\stop-dev.ps1 when you're done."
