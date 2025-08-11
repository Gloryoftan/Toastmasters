@echo off
echo 🔄 重启Angular应用以应用代理配置...

REM 查找并停止Angular开发服务器
echo 🛑 停止现有的Angular开发服务器...
taskkill /f /im node.exe >nul 2>&1

REM 等待进程完全停止
timeout /t 2 /nobreak >nul

REM 启动Angular开发服务器
echo 🚀 启动Angular开发服务器...
ng serve --proxy-config src/proxy.conf.json

echo ✅ Angular应用已重启！
echo 📱 访问 http://localhost:4200
echo 🔌 API请求将通过代理转发到 http://localhost:3001
pause
