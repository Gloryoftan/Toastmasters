# 南京ET俱乐部管理系统

> Nanjing Student Elite Toastmasters Club Management System

这是南京ET俱乐部的会员管理系统，用于管理俱乐部会员信息、会议记录、角色分配和统计分析。

## 🌟 特性

- 📊 **会员管理** - 完整的会员信息管理，支持正式会员和访客
- 📅 **会议管理** - 会议记录和角色分配管理
- 📈 **统计分析** - 出勤率统计和成长轨迹分析
- 💾 **数据持久化** - 使用 localStorage 本地存储数据
- 📱 **响应式设计** - 完美支持桌面和移动设备

## 🚀 快速开始

### 开发环境

启动本地开发服务器：

```bash
npm install
npm start
```

访问 `http://localhost:4200/` 查看应用。

### 生产构建

构建生产版本：

```bash
npm run build:prod
```

### 部署到 GitHub Pages

```bash
npm run deploy
```

## 🛠️ 技术栈

- **前端框架**: Angular 20
- **样式**: SCSS
- **状态管理**: RxJS + BehaviorSubject
- **数据存储**: localStorage
- **部署**: GitHub Pages

## 📁 项目结构

```
src/app/
├── core/                    # 核心功能
│   ├── models/             # 数据模型
│   └── services/           # 服务层
├── features/               # 功能模块
│   ├── dashboard/          # 仪表板
│   ├── members/            # 会员管理
│   ├── meetings/           # 会议管理
│   ├── statistics/         # 统计分析
│   └── reports/            # 报告功能
└── shared/                 # 共享模块
```

## 🎯 主要功能

### 会员管理
- 添加、编辑、查看会员信息
- 支持 Toastmasters ID 和临时 ID
- 区分正式会员和访客
- Pathways 学习路径追踪

### 会议管理
- 创建和管理会议记录
- 12种预定义角色分配
- 演讲题目和级别记录
- 出勤状态管理

### 统计分析
- 会员出勤率统计
- 角色担任次数分析
- 成长轨迹可视化
- 多维度数据报告

## 📝 开发指南

### 生成新组件

```bash
ng generate component component-name
```

### 运行测试

```bash
ng test
```

### 代码风格

项目使用 Prettier 进行代码格式化。

## 🌐 在线访问

部署后的应用地址：`https://[username].github.io/nanjing-et-club/`

## 📄 许可证

本项目基于 MIT 许可证开源。

---

**南京ET俱乐部** - 助力每一位成员成为更好的演讲者和领导者
