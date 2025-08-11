#!/bin/bash

echo "🚀 启动Toastmasters后端服务器..."

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ Node.js未安装，请先安装Node.js"
    echo "访问 https://nodejs.org/ 下载并安装"
    exit 1
fi

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo "❌ npm未安装，请先安装npm"
    exit 1
fi

echo "✅ Node.js版本: $(node --version)"
echo "✅ npm版本: $(npm --version)"

# 安装后端依赖
echo "📦 安装后端依赖..."
npm install --prefix . express cors

# 启动服务器
echo "🌐 启动服务器在端口3001..."
node server.js

echo "✅ 服务器已启动！"
echo "📱 前端应用可以访问 http://localhost:3001"
echo "🔌 API端点: http://localhost:3001/api/*"
echo "⏹️  按 Ctrl+C 停止服务器"
