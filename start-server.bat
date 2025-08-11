@echo off
echo 🚀 启动Toastmasters后端服务器...

REM 检查Node.js是否安装
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js未安装，请先安装Node.js
    echo 访问 https://nodejs.org/ 下载并安装
    pause
    exit /b 1
)

REM 检查npm是否安装
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm未安装，请先安装npm
    pause
    exit /b 1
)

echo ✅ Node.js版本: 
node --version
echo ✅ npm版本: 
npm --version

REM 安装后端依赖
echo 📦 安装后端依赖...
npm install --prefix . express cors

REM 启动服务器
echo 🌐 启动服务器在端口3001...
node server.js

echo ✅ 服务器已启动！
echo 📱 前端应用可以访问 http://localhost:3001
echo 🔌 API端点: http://localhost:3001/api/*
echo ⏹️  按 Ctrl+C 停止服务器
pause
