$ErrorActionPreference = "Stop"
if ($PSVersionTable.PSVersion.Major -ge 7) {
  $PSNativeCommandUseErrorActionPreference = $true
}

$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -LiteralPath $ProjectRoot

if ($PSVersionTable.PSVersion.Major -lt 7) {
  $pwsh = Get-Command pwsh.exe -ErrorAction SilentlyContinue
  if (-not $pwsh) {
    $pwshPath = "C:\Program Files\PowerShell\7\pwsh.exe"
    if (Test-Path -LiteralPath $pwshPath) {
      $pwsh = [pscustomobject]@{ Source = $pwshPath }
    }
  }

  if ($pwsh) {
    Write-Host "Windows PowerShell $($PSVersionTable.PSVersion) can hang before Next.js build startup." -ForegroundColor Yellow
    Write-Host "Relaunching this runner with PowerShell 7..." -ForegroundColor Yellow
    & $pwsh.Source -NoProfile -ExecutionPolicy Bypass -File $PSCommandPath
    exit $LASTEXITCODE
  }

  Write-Host "This runner needs PowerShell 7 for reliable Next.js startup." -ForegroundColor Red
  Write-Host "Install PowerShell 7 or run this from an existing PowerShell 7 window with:"
  Write-Host "  pwsh -NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`""
  exit 1
}

Write-Host ""
Write-Host "Scorched Silver Dex local runner" -ForegroundColor Yellow
Write-Host "Project: $ProjectRoot"
Write-Host "QA build marker: Scorched Silver Dex QA build: 2026-05-29 13:16 PDT"
Write-Host ""

if (-not (Test-Path -LiteralPath "node_modules/next/dist/bin/next")) {
  Write-Host "Missing node_modules. Run this once first:" -ForegroundColor Red
  Write-Host "  npm install"
  exit 1
}

if (-not (Test-Path -LiteralPath "public/data")) {
  Write-Host "Missing public/data. This is not the expected clean frontend root." -ForegroundColor Red
  exit 1
}

$existing = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
if ($existing) {
  $existingProcess = Get-CimInstance Win32_Process -Filter "ProcessId=$($existing.OwningProcess)" -ErrorAction SilentlyContinue
  $commandLine = $existingProcess.CommandLine ?? ""

  if ($commandLine -match "node_modules[\\/]+next[\\/]+dist[\\/]+bin[\\/]+next" -and $commandLine -match "--port 3000") {
    Write-Host "Stopping previous local Next server on port 3000 (PID $($existing.OwningProcess))..." -ForegroundColor Cyan
    Stop-Process -Id $existing.OwningProcess -Force
    Start-Sleep -Seconds 1
  } else {
    Write-Host "Port 3000 is already in use by process $($existing.OwningProcess)." -ForegroundColor Red
    Write-Host "That process does not look like this app's local Next server, so it was not stopped."
    Write-Host "Close it manually or change ports before running this script."
    exit 1
  }
}

if (Test-Path -LiteralPath ".next") {
  Write-Host "Clearing stale .next build output..." -ForegroundColor Cyan
  Remove-Item -LiteralPath ".next" -Recurse -Force
}

Write-Host "Building production app..." -ForegroundColor Cyan
node node_modules/next/dist/bin/next build

Write-Host ""
Write-Host "Build complete." -ForegroundColor Green
Write-Host "Starting local server..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Open this URL in your browser:" -ForegroundColor Yellow
Write-Host "  http://127.0.0.1:3000/"
Write-Host "Look for this footer marker:" -ForegroundColor Yellow
Write-Host "  Scorched Silver Dex QA build: 2026-05-29 13:16 PDT"
Write-Host ""
Write-Host "Keep this PowerShell window open while you QA. Press Ctrl+C here to stop the site." -ForegroundColor Yellow
Write-Host ""

node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3000
