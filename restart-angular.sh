#!/bin/bash

echo "🔄 重启Angular应用以应用代理配置..."

# 查找并停止Angular开发服务器
echo "🛑 停止现有的Angular开发服务器..."
pkill -f "ng serve" || true
pkill -f "node.*4200" || true

# 等待进程完全停止
sleep 2

# 启动Angular开发服务器
echo "🚀 启动Angular开发服务器..."
ng serve --proxy-config src/proxy.conf.json

echo "✅ Angular应用已重启！"
echo "📱 访问 http://localhost:4200"
echo "🔌 API请求将通过代理转发到 http://localhost:3001"
