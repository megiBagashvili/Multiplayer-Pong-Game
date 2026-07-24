# Stops everything started by start-dev.ps1

$root = $PSScriptRoot
$pidFile = "$root\.dev-pids.txt"

if (-not (Test-Path $pidFile)) {
    Write-Host "No running dev session found ($pidFile missing)."
    exit 0
}

Get-Content $pidFile | Where-Object { $_ -match '\S' } | ForEach-Object {
    $procId = $_.Trim()
    # /T kills the whole process tree (npm/nodemon/node spawn children cmd.exe doesn't track otherwise)
    taskkill /PID $procId /T /F 2>$null | Out-Null
    Write-Host "Stopped process tree $procId"
}

Remove-Item $pidFile, "$root\.backend-tunnel.log", "$root\.frontend-tunnel.log" -ErrorAction SilentlyContinue
Write-Host "Done."
