# LifeScore 本地一键停止
# 关掉占用 5433(数据库) / 3001(后端) / 5173(前端) 的进程。
# 用法：双击 stop-dev.cmd，或右键 "用 PowerShell 运行"。

$services = @(
  @{ Port = 5173; Name = "前端" },
  @{ Port = 3001; Name = "后端" },
  @{ Port = 5433; Name = "数据库" }
)

Write-Host "LifeScore 本地停止中..." -ForegroundColor Cyan

foreach ($svc in $services) {
  $conns = Get-NetTCPConnection -LocalPort $svc.Port -State Listen -ErrorAction SilentlyContinue
  if (-not $conns) {
    Write-Host "  $($svc.Name) (端口 $($svc.Port)) 未在运行" -ForegroundColor DarkGray
    continue
  }
  $pids = $conns | Select-Object -ExpandProperty OwningProcess -Unique
  foreach ($procId in $pids) {
    try {
      Stop-Process -Id $procId -Force -ErrorAction Stop
      Write-Host "  已停止 $($svc.Name) (PID $procId)" -ForegroundColor Green
    } catch {
      Write-Host "  停止 $($svc.Name) (PID $procId) 失败: $($_.Exception.Message)" -ForegroundColor Yellow
    }
  }
}

Write-Host ""
Write-Host "完成。若仍有遗留的服务窗口，可直接关闭。" -ForegroundColor DarkGray
Start-Sleep -Seconds 2
