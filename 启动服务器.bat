@echo off
chcp 65001 >nul
echo ========================================
echo    AI对话助手 - 本地服务器启动
echo ========================================
echo.
echo 正在启动本地服务器...
echo.
echo 服务器地址: http://localhost:8000
echo.
echo 按 Ctrl+C 停止服务器
echo ========================================
echo.

python -m http.server 8000

if errorlevel 1 (
    echo.
    echo Python 未安装或未添加到 PATH！
    echo 请尝试以下方法之一：
    echo.
    echo 方法1: 安装 Python
    echo   从 https://www.python.org 下载并安装 Python
    echo.
    echo 方法2: 使用 Node.js
    echo   运行: npx http-server -p 8000
    echo.
    echo 方法3: 使用 VS Code Live Server 插件
    echo   右键点击 index.html -^> Open with Live Server
    echo.
    pause
)

