# 梦境AI短剧平台 (AI Comic Studio)

全栈 AI 短剧创作平台，支持剧本导入、AI 分镜拆解、图片/视频生成与资产管理。

## 技术栈

- **前端**: React 19 + TypeScript + Vite + Tailwind CSS + React Router
- **后端**: Express + TypeScript + Drizzle ORM + SQLite
- **认证**: JWT + bcrypt + 滑动刷新
- **AI**: Gemini API（分镜拆解）、可扩展多模型适配器

## 快速开始

**前置要求:** Node.js 18+

```bash
# 安装依赖
npm install

# 初始化数据库
npx drizzle-kit migrate

# 启动开发环境（前端 :3000 + 后端 :3001）
npm run dev
```

## 环境变量

复制 `.env.example` 为 `.env.local` 并配置：

| 变量 | 说明 |
|------|------|
| `PORT` | 后端端口，默认 3001 |
| `DATABASE_URL` | SQLite 数据库路径 |
| `JWT_SECRET` | JWT 签名密钥 |
| `GEMINI_API_KEY` | Google Gemini API 密钥 |

## 项目结构

```
├── src/                    # 前端源码
│   ├── components/layout/  # 布局组件
│   ├── features/auth/      # 认证模块
│   ├── features/admin/     # 后台管理
│   ├── lib/                # API 客户端
│   └── styles/             # 全局样式
├── server/                 # 后端源码
│   ├── db/                 # 数据库 schema & 迁移
│   ├── middleware/         # 中间件（auth, error）
│   ├── routes/             # API 路由
│   ├── services/           # 业务逻辑
│   └── storage/            # 文件存储抽象层
├── shared/types/           # 前后端共享类型
├── components/             # 核心视图组件
└── _bmad-output/           # 项目规划文档
```

## API 概览

| 端点 | 说明 |
|------|------|
| `POST /api/v1/auth/register` | 用户注册 |
| `POST /api/v1/auth/login` | 用户登录 |
| `GET/POST /api/v1/projects` | 项目列表/创建 |
| `PATCH/DELETE /api/v1/projects/:id` | 项目更新/删除 |
| `GET/POST /api/v1/projects/:id/episodes` | 集数管理 |
| `GET/POST /api/v1/templates` | 风格模板 |
| `GET /api/v1/admin/users` | 用户管理（admin） |

## 开发进度

- [x] Epic 1: 项目脚手架与基础设施
- [x] Epic 2: 用户认证与权限管理
- [x] Epic 3: 项目与集数管理
- [ ] Epic 4: 剧本导入与 AI 分镜拆解（进行中）
- [ ] Epic 5: 图片生成与任务管理
- [ ] Epic 6: 视频生成
- [x] Story 7.1: 风格模板管理
- [ ] Story 7.2-7.3: 模型配置/错误告警
- [ ] Epic 8: 预览与体验优化
