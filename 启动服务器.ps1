# AI对话助手 - PowerShell 启动脚本
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   AI对话助手 - 本地服务器启动" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "正在启动本地服务器..." -ForegroundColor Yellow
Write-Host ""
Write-Host "服务器地址: http://localhost:8000" -ForegroundColor Green
Write-Host ""
Write-Host "按 Ctrl+C 停止服务器" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查 Python 是否可用
try {
    python -m http.server 8000
} catch {
    Write-Host ""
    Write-Host "Python 未安装或未添加到 PATH！" -ForegroundColor Red
    Write-Host "请尝试以下方法之一：" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "方法1: 安装 Python" -ForegroundColor Cyan
    Write-Host "  从 https://www.python.org 下载并安装 Python" -ForegroundColor White
    Write-Host ""
    Write-Host "方法2: 使用 Node.js" -ForegroundColor Cyan
    Write-Host "  运行: npx http-server -p 8000" -ForegroundColor White
    Write-Host ""
    Write-Host "方法3: 使用 VS Code Live Server 插件" -ForegroundColor Cyan
    Write-Host "  右键点击 index.html -> Open with Live Server" -ForegroundColor White
    Write-Host ""
    Read-Host "按 Enter 键退出"
}

