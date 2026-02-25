$ErrorActionPreference = 'Stop'

$backendPath = Join-Path $PSScriptRoot 'Server(Backend)'
$frontendPath = Join-Path $PSScriptRoot 'Client(Frontend)'

if (-not (Test-Path -LiteralPath $backendPath)) {
    throw "Backend path not found: $backendPath"
}

if (-not (Test-Path -LiteralPath $frontendPath)) {
    throw "Frontend path not found: $frontendPath"
}

Start-Process powershell -ArgumentList @(
    '-NoExit',
    '-Command',
    "Set-Location -LiteralPath '$backendPath'; npm run dev"
)

Start-Process powershell -ArgumentList @(
    '-NoExit',
    '-Command',
    "Set-Location -LiteralPath '$frontendPath'; npm run dev"
)

Write-Host 'Started backend and frontend in separate PowerShell windows.'
Write-Host 'Backend:  http://127.0.0.1:5000'
Write-Host 'Frontend: http://localhost:3000'
