# LifeScore 本地一键启动
# 依次拉起：嵌入式数据库(5433) → 后端(3001) → 前端(5173)，各占一个窗口，最后打开浏览器。
# 用法：在本文件所在目录右键 "用 PowerShell 运行"，或双击 start-dev.cmd。

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$backend = Join-Path $root "life-predictor\backend"
$frontend = Join-Path $root "life-predictor\frontend"
$dbUrl = "postgresql://postgres:devpass@localhost:5433/lifescore_dev"

function Test-Port($port) {
  $null -ne (Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue)
}

function Wait-Port($port, $name, $timeoutSec = 90) {
  $deadline = (Get-Date).AddSeconds($timeoutSec)
  while ((Get-Date) -lt $deadline) {
    if (Test-Port $port) { Write-Host "  $name 就绪 (端口 $port)" -ForegroundColor Green; return $true }
    Start-Sleep -Seconds 2
  }
  Write-Host "  $name 在 $timeoutSec 秒内未就绪，请查看它的窗口排查" -ForegroundColor Yellow
  return $false
}

Write-Host "LifeScore 本地启动中..." -ForegroundColor Cyan

# 1) 数据库
if (Test-Port 5433) {
  Write-Host "数据库已在运行 (5433)，跳过" -ForegroundColor DarkGray
} else {
  Write-Host "[1/3] 启动数据库..." -ForegroundColor Cyan
  Start-Process powershell -ArgumentList @(
    "-NoExit", "-Command",
    "Set-Location '$backend'; Write-Host '=== LifeScore 数据库 (Ctrl+C 停止) ===' -ForegroundColor Magenta; npm run dev:db"
  )
  Wait-Port 5433 "数据库" 120 | Out-Null
}

# 2) 后端
if (Test-Port 3001) {
  Write-Host "后端已在运行 (3001)，跳过" -ForegroundColor DarkGray
} else {
  Write-Host "[2/3] 启动后端..." -ForegroundColor Cyan
  Start-Process powershell -ArgumentList @(
    "-NoExit", "-Command",
    "Set-Location '$backend'; `$env:DATABASE_URL='$dbUrl'; Write-Host '=== LifeScore 后端 :3001 (Ctrl+C 停止) ===' -ForegroundColor Magenta; npm run dev"
  )
  Wait-Port 3001 "后端" 60 | Out-Null
}

# 3) 前端
if (Test-Port 5173) {
  Write-Host "前端已在运行 (5173)，跳过" -ForegroundColor DarkGray
} else {
  Write-Host "[3/3] 启动前端..." -ForegroundColor Cyan
  Start-Process powershell -ArgumentList @(
    "-NoExit", "-Command",
    "Set-Location '$frontend'; Write-Host '=== LifeScore 前端 :5173 (Ctrl+C 停止) ===' -ForegroundColor Magenta; npm run dev"
  )
  Wait-Port 5173 "前端" 60 | Out-Null
}

Write-Host ""
Write-Host "全部就绪 → http://localhost:5173" -ForegroundColor Green
Write-Host "后台管理 → http://localhost:5173/admin (密码见 backend\.env 的 ADMIN_PASSWORD)" -ForegroundColor Green
Write-Host "三个服务窗口请保持开启；关掉哪个对应服务即停止。" -ForegroundColor DarkGray
Start-Process "http://localhost:5173"
