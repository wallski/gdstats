@echo off
echo Stopping GD Stats...

powershell -Command "if (Test-Path '$env:TEMP\gdstats-backend.pid') { $pid = Get-Content '$env:TEMP\gdstats-backend.pid'; Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue; Remove-Item '$env:TEMP\gdstats-backend.pid'; Write-Host 'Stopped backend' }"

powershell -Command "if (Test-Path '$env:TEMP\gdstats-tunnel.pid') { $pid = Get-Content '$env:TEMP\gdstats-tunnel.pid'; Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue; Remove-Item '$env:TEMP\gdstats-tunnel.pid'; Write-Host 'Stopped tunnel' }"

taskkill /F /IM "server.exe" >nul 2>&1
taskkill /F /IM "cloudflared-windows-amd64.exe" >nul 2>&1

if exist "%TEMP%\gdstats-tunnel.log" del "%TEMP%\gdstats-tunnel.log" >nul 2>&1

echo Done.
pause