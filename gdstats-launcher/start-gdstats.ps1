#Requires -Version 5.1

$ErrorActionPreference = "Stop"

# ==========================================
# CONFIG
# ==========================================
$BackendPath  = "C:\Users\elias\Desktop\GITHUB\gdstats\gds-backend"
$FrontendPath = "C:\Users\elias\Desktop\GITHUB\gdstats\gdstats"
$Cloudflared  = "C:\tools\cloudflared-windows-amd64.exe"
$VercelUrl    = "https://gdstats-theta.vercel.app"

$BackendPidFile = "$env:TEMP\gdstats-backend.pid"
$TunnelPidFile  = "$env:TEMP\gdstats-tunnel.pid"
$TunnelLogFile  = "$env:TEMP\gdstats-tunnel.log"

# ==========================================
# FUNCTIONS
# ==========================================

function Stop-Existing {
    Write-Host "`n[Cleanup] Stopping old processes..." -ForegroundColor Yellow

    if (Test-Path $BackendPidFile) {
        $pidVal = Get-Content $BackendPidFile
        try {
            Stop-Process -Id $pidVal -Force -ErrorAction SilentlyContinue
            Write-Host "  Killed backend process $pidVal" -ForegroundColor Green
        } catch {}
        Remove-Item $BackendPidFile -Force
    }

    if (Test-Path $TunnelPidFile) {
        $pidVal = Get-Content $TunnelPidFile
        try {
            Stop-Process -Id $pidVal -Force -ErrorAction SilentlyContinue
            Write-Host "  Killed tunnel process $pidVal" -ForegroundColor Green
        } catch {}
        Remove-Item $TunnelPidFile -Force
    }

    $conns = netstat -ano | Select-String ":8080"
    foreach ($conn in $conns) {
        $parts = $conn -split "\s+"
        $pid = $parts[-1]
        if ($pid -match "^\d+$") {
            try {
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                Write-Host "  Killed port 8080 process $pid" -ForegroundColor Green
            } catch {}
        }
    }

    Get-Process | Where-Object { $_.Name -in @("server","cloudflared-windows-amd64") } | 
        Stop-Process -Force -ErrorAction SilentlyContinue

    if (Test-Path $TunnelLogFile) { Remove-Item $TunnelLogFile -Force }

    Start-Sleep -Seconds 2
}

function Start-Backend {
    Write-Host "`n[1/5] Building && starting Go backend..." -ForegroundColor Cyan

    Set-Location $BackendPath

    if (-not (Test-Path "$BackendPath\server.exe")) {
        Write-Host "  Compiling backend (first time only)..." -ForegroundColor DarkGray
        go build -o server.exe .
        Write-Host "  Compiled!" -ForegroundColor Green
    } else {
        Write-Host "  Using existing server.exe" -ForegroundColor DarkGray
    }

    $proc = Start-Process -FilePath "$BackendPath\server.exe" `
        -WorkingDirectory $BackendPath `
        -WindowStyle Minimized -PassThru
    $proc.Id | Set-Content $BackendPidFile

    $ready = $false
    $tries = 0
    while (-not $ready -and $tries -lt 30) {
        Start-Sleep -Seconds 1
        $tries++
        try {
            $resp = Invoke-WebRequest -Uri "http://localhost:8080/api/search?query=RobTop" `
                -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
            if ($resp.StatusCode -eq 200) { $ready = $true }
        } catch {}
        if ($tries % 5 -eq 0) {
            Write-Host "  Waiting for backend... ($tries/30)" -ForegroundColor DarkGray
        }
    }

    if (-not $ready) { throw "Backend failed to start. Check the backend window for errors." }
    Write-Host "  Backend is live on localhost:8080!" -ForegroundColor Green
}

function Read-TunnelLog {
    param($path)
    try {
        $fs = [System.IO.File]::Open($path, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::ReadWrite)
        $reader = New-Object System.IO.StreamReader($fs)
        $content = $reader.ReadToEnd()
        $reader.Close()
        $fs.Close()
        return $content
    } catch {
        return $null
    }
}

function Start-Tunnel {
    Write-Host "`n[2/5] Starting Cloudflare Tunnel..." -ForegroundColor Cyan
    Write-Host "  (This may take 10-30 seconds)" -ForegroundColor DarkGray

    if (Test-Path $TunnelLogFile) { Remove-Item $TunnelLogFile -Force }

    # Write a temp .bat file — avoids all PowerShell escaping hell
    $tempBat = "$env:TEMP\gdstats-tunnel.bat"
    $batContent = "@echo off`n`"$Cloudflared`" tunnel --url http://localhost:8080 > `"$TunnelLogFile`" 2>&1"
    [System.IO.File]::WriteAllText($tempBat, $batContent, [System.Text.Encoding]::ASCII)

    # Run the .bat file
    $proc = Start-Process -FilePath "cmd.exe" `
        -ArgumentList "/c", "`"$tempBat`"" `
        -WindowStyle Hidden -PassThru
    
    $proc.Id | Set-Content $TunnelPidFile

    $tunnelUrl = $null
    $tries = 0
    while (-not $tunnelUrl -and $tries -lt 120) {
        Start-Sleep -Seconds 1
        $tries++

        if (Test-Path $TunnelLogFile) {
            $content = Read-TunnelLog -path $TunnelLogFile
            if ($content) {
                $cleanContent = $content -replace '\x1b\[[0-9;]*m', ''
                if ($cleanContent -match 'https://[a-z0-9-]+\.trycloudflare\.com') {
                    $tunnelUrl = $matches[0]
                }
            }
        }

        if ($tries % 10 -eq 0) {
            Write-Host "  Waiting for tunnel URL... ($tries/120)" -ForegroundColor DarkGray
        }
    }

    if (-not $tunnelUrl) { 
        $content = Read-TunnelLog -path $TunnelLogFile
        Write-Host "`n  Tunnel log (last 20 lines):" -ForegroundColor Yellow
        if ($content) {
            $content -split "`n" | Select-Object -Last 20 | ForEach-Object { 
                Write-Host "    $_" -ForegroundColor DarkGray 
            }
        } else {
            Write-Host "    (log file empty or unreadable)" -ForegroundColor DarkGray
        }
        throw "Failed to get tunnel URL within 120s." 
    }

    Write-Host "  Tunnel URL: $tunnelUrl" -ForegroundColor Green
    return $tunnelUrl
}

function Update-Frontend($url) {
    Write-Host "`n[3/5] Updating frontend API URLs..." -ForegroundColor Cyan

    $files = @(
        "$FrontendPath\src\hooks\usePlayerData.ts",
        "$FrontendPath\src\components\PlayerIcon.tsx",
        "$FrontendPath\src\components\SearchBar.tsx",
        "$FrontendPath\src\pages\ProfilePage.tsx"
    )

    foreach ($file in $files) {
        if (-not (Test-Path $file)) {
            Write-Host "  SKIP: $file not found" -ForegroundColor Yellow
            continue
        }

        $content = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)
        $content = $content -replace 'https://[a-z0-9-]+\.trycloudflare\.com', $url
        $content = $content -replace 'http://localhost:8080', $url
        [System.IO.File]::WriteAllText($file, $content, [System.Text.Encoding]::UTF8)
        Write-Host "  Updated: $(Split-Path $file -Leaf)" -ForegroundColor Green
    }
}

function Push-Git {
    Write-Host "`n[4/5] Committing && pushing to GitHub..." -ForegroundColor Cyan
    Set-Location $FrontendPath

    git add . | Out-Null
    $date = Get-Date -Format "yyyy-MM-dd HH:mm"
    git commit -m "auto: update tunnel $date" --quiet | Out-Null
    git push --quiet

    Write-Host "  Pushed! Vercel will redeploy in ~30s." -ForegroundColor Green
}

function Open-Site {
    Write-Host "`n[5/5] Opening browser..." -ForegroundColor Cyan
    Start-Process $VercelUrl
}

# ==========================================
# MAIN
# ==========================================
Clear-Host
Write-Host @"
==========================================
     GD Stats - Auto Start Script
==========================================
"@ -ForegroundColor Magenta

$doPush = Read-Host "Push to GitHub so Vercel updates? (Y/n)"
if ($doPush -eq "" -or $doPush -eq "Y" -or $doPush -eq "y") {
    $push = $true
} else {
    $push = $false
    Write-Host "`nSkipping GitHub push. Only updating local files." -ForegroundColor Yellow
}

try {
    Stop-Existing
    Start-Backend
    $url = Start-Tunnel
    Update-Frontend $url

    if ($push) {
        Push-Git
    }

    Write-Host @"
`n==========================================
            ALL SYSTEMS GO

    Local Backend:  http://localhost:8080
    Public Tunnel:  $url
    Vercel Site:    $VercelUrl

    Backend && Tunnel running in background.
    Run stop-gdstats.bat to shut everything down.
==========================================
"@ -ForegroundColor Green

    Open-Site

    while ($true) {
        Start-Sleep -Seconds 30
        Write-Host "$(Get-Date -Format 'HH:mm:ss') - Still running..." -ForegroundColor DarkGray
    }

} catch {
    Write-Host "`nERROR: $_" -ForegroundColor Red
    Read-Host "`nPress Enter to exit"
}