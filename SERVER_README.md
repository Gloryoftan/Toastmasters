# Toastmasters 会议管理系统 - 后端服务器

这个后端服务器允许你将会议编辑后的数据直接保存到JSON文件中。

## 🚀 快速开始

### 1. 安装依赖

确保你的系统已安装：
- Node.js (版本 14 或更高)
- npm (通常随Node.js一起安装)

### 2. 启动后端服务器

#### macOS/Linux:
```bash
chmod +x start-server.sh
./start-server.sh
```

#### Windows:
```cmd
start-server.bat
```

#### 手动启动:
```bash
npm install express cors
node server.js
```

### 3. 访问应用

- 后端服务器: http://localhost:3001
- 前端应用: 在另一个终端运行 `ng serve`
- API端点: http://localhost:3001/api/*

## 📁 文件结构

```
Toastmasters/
├── server.js              # 后端服务器主文件
├── server-package.json    # 后端依赖配置
├── start-server.sh        # macOS/Linux启动脚本
├── start-server.bat       # Windows启动脚本
├── public/
│   └── data/             # JSON数据文件目录
│       ├── meeting.json   # 会议数据
│       ├── member.json    # 会员数据
│       ├── role.json      # 角色数据
│       ├── project.json   # 项目数据
│       └── venue.json     # 场地数据
└── src/                   # Angular前端代码
```

## 🔌 API端点

### 会议管理
- `GET /api/meetings` - 获取所有会议
- `GET /api/meetings/:id` - 根据ID获取会议
- `POST /api/meetings` - 创建或更新会议
- `DELETE /api/meetings/:id` - 删除会议

### 会议类型
系统支持以下会议类型：
- `regular` - 常规会议
- `special` - 特别会议
- `contest` - 比赛
- `training` - 培训
- `joint` - 联合会议（新增）

### 其他数据
- `GET /api/members` - 获取所有会员
- `GET /api/roles` - 获取所有角色
- `GET /api/projects` - 获取所有项目
- `GET /api/venues` - 获取所有场地

## 💾 数据保存

当你编辑会议并点击保存时：

1. 前端将会议数据发送到 `/api/meetings` 端点
2. 后端服务器将数据写入 `public/data/meeting.json` 文件
3. 同时更新内存中的数据缓存
4. 返回成功消息给前端

## 🔄 故障排除

### 端口冲突
如果3001端口被占用，修改 `server.js` 中的 `PORT` 变量：
```javascript
const PORT = 3002; // 或其他可用端口
```

### 权限问题
确保服务器有权限读写 `public/data/` 目录。

### 数据丢失
服务器会自动备份数据到JSON文件，如果出现问题，检查：
- JSON文件是否完整
- 文件权限是否正确
- 磁盘空间是否充足

## 🛡️ 安全注意事项

⚠️ **重要**: 这个服务器仅用于开发环境，不要在生产环境中使用！

- 没有身份验证
- 没有输入验证
- 没有HTTPS
- 直接暴露文件系统

## 🔧 自定义配置

你可以修改 `server.js` 来：
- 更改端口号
- 添加数据验证
- 实现用户认证
- 添加日志记录
- 配置CORS策略

## 📝 日志

服务器会在控制台输出详细的操作日志：
- ✅ 成功操作
- ❌ 错误信息
- 🔄 操作状态
- 📁 文件操作

## 🆘 获取帮助

如果遇到问题：
1. 检查控制台错误信息
2. 确认JSON文件格式正确
3. 验证文件权限
4. 重启服务器
