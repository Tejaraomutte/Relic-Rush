@echo off
setlocal

set "ROOT=%~dp0"

start "Relic Rush Backend" powershell -NoExit -Command "Set-Location -LiteralPath '%ROOT%Server(Backend)'; npm run dev"
start "Relic Rush Frontend" powershell -NoExit -Command "Set-Location -LiteralPath '%ROOT%Client(Frontend)'; npm run dev"

echo Started backend and frontend in separate PowerShell windows.
echo Backend:  http://127.0.0.1:5000
echo Frontend: http://localhost:3000
