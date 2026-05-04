# 梦境AI短剧平台 (AI Comic Studio)

全栈 AI 短剧创作平台 — 剧本导入、AI 分镜拆解、多模型图片/视频生成、资产管理、分集预览。

## 技术栈

| 层 | 技术 |
|----|------|
| **前端** | React 19, TypeScript, Vite 6, Tailwind CSS, React Router 7 |
| **后台管理** | antd 6 (AdminLayout 侧栏导航) |
| **后端** | Express 4, TypeScript, Drizzle ORM, SQLite (libsql) |
| **实时通信** | Socket.IO 4 (任务状态推送) |
| **认证** | JWT + bcryptjs, 24h 滑动刷新, 角色鉴权 |
| **AI 接入** | 8 个适配器 — Gemini, GPT Image, Nanobanana, 即梦, Seedance, Sora, Grok Video, Grok Image |
| **文件解析** | mammoth (.docx), multer (multipart) |
| **状态管理** | Zustand (auth store) |
| **HTTP 客户端** | Axios (拦截器自动续 token) |

## 快速开始

```bash
# 安装依赖
npm install

# 初始化数据库
npx drizzle-kit migrate

# 种子数据（11 套风格模板 + 8 个 AI 模型配置）
npx tsx server/seed.ts

# 启动开发环境
npm run dev        # 前端 :3000 + 后端 :3001

# 单独启动
npm run dev:client # 仅前端
npm run dev:server # 仅后端
```

## 环境变量

复制 `.env.example` 为 `.env.local`：

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `PORT` | 后端端口 | `3001` |
| `DATABASE_URL` | SQLite 数据库路径 | `./data/aics.db` |
| `JWT_SECRET` | JWT 签名密钥 | 生产必换 |
| `GEMINI_API_KEY` | Gemini API Key | 用于剧本分析 |

> AI 模型 Key 在后台 `/admin/models` 配置，无需写进 .env。

## 项目结构

```
├── src/                          # 前端
│   ├── App.tsx                   # 路由 + 工作区
│   ├── main.tsx                  # 入口
│   ├── lib/api.ts                # Axios 实例 (拦截器)
│   ├── styles/globals.css        # Tailwind 入口
│   ├── components/layout/
│   │   ├── AppLayout.tsx         # 登录鉴权守卫
│   │   └── AdminLayout.tsx       # 后台侧栏布局
│   └── features/
│       ├── auth/                 # 登录页 + Zustand store
│       └── admin/                # 用户/模板/模型管理页
├── components/                   # 前台视图
│   ├── Home.tsx                  # 项目列表 (首页)
│   ├── Sidebar.tsx               # 侧栏导航
│   ├── AssetSelectorModal.tsx    # 资源选择器
│   └── views/
│       ├── ScriptBreakdown.tsx   # 剧本编辑 + AI 拆解
│       ├── ScriptCreate.tsx      # 剧本创作
│       ├── CreationTasks.tsx     # 分集 + 分镜任务
│       ├── EpisodePreview.tsx    # 分集预览
│       ├── AssetManager.tsx      # 角色管理
│       ├── ItemManager.tsx       # 物品管理
│       ├── SceneManager.tsx      # 场景管理
│       └── CreatureManager.tsx   # 生物管理
├── server/                       # 后端
│   ├── index.ts                  # HTTP + WebSocket 启动
│   ├── app.ts                    # Express 路由注册
│   ├── db/schema.ts              # Drizzle 表定义
│   ├── middleware/                # auth + error
│   ├── routes/                   # 10 个路由文件
│   │   ├── auth.routes.ts        # 注册/登录
│   │   ├── projects.routes.ts    # 项目 + 分集 CRUD
│   │   ├── scripts.routes.ts     # 剧本上传 + AI 拆解
│   │   ├── panels.routes.ts      # 分镜 + 角色 + 场景
│   │   ├── tasks.routes.ts       # 生成任务 + 手动上传
│   │   ├── models.routes.ts      # AI 模型配置
│   │   ├── templates.routes.ts   # 风格模板
│   │   ├── assets.routes.ts      # 物品 + 生物
│   │   ├── me.routes.ts          # 个人中心
│   │   └── users.routes.ts       # 用户管理
│   ├── services/
│   │   ├── auth.service.ts       # JWT + bcrypt
│   │   ├── breakdown.service.ts  # Gemini 剧本拆解
│   │   ├── task.service.ts       # 任务状态机 + 轮询
│   │   └── adapters/             # 8 个 AI 适配器
│   ├── socket/index.ts           # WebSocket 推送
│   └── seed.ts                   # 种子数据脚本
├── shared/types/                 # 前后端共享类型
├── types.ts                      # 前端类型定义
└── _bmad-output/                 # 需求/架构/Epic 文档
```

## API 端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/v1/auth/register` | POST | 用户注册 |
| `/api/v1/auth/login` | POST | 用户登录 |
| `/api/v1/projects` | GET/POST | 项目列表/创建 |
| `/api/v1/projects/:id` | PATCH/DELETE | 项目归档/删除 |
| `/api/v1/projects/:id/episodes` | GET/POST | 分集列表/创建 |
| `/api/v1/projects/:id/episodes/:eid/scripts` | GET/POST | 剧本上传(.txt/.docx) |
| `/api/v1/projects/:id/episodes/:eid/breakdown` | POST | AI 分镜拆解 |
| `/api/v1/projects/:id/episodes/:eid/panels` | GET | 分镜列表 |
| `/api/v1/projects/:id/episodes/:eid/preview` | GET | 分集预览 |
| `/api/v1/projects/:id/characters` | GET/POST | 角色管理 |
| `/api/v1/projects/:id/scenes` | GET/POST | 场景管理 |
| `/api/v1/projects/:id/items` | GET/POST | 物品管理 |
| `/api/v1/projects/:id/creatures` | GET/POST | 生物管理 |
| `/api/v1/panels/:id` | PATCH | 分镜编辑 |
| `/api/v1/panels/merge` | POST | 合并分镜 |
| `/api/v1/panels/:id/split` | POST | 拆分分镜 |
| `/api/v1/panels/:id/upload` | POST | 手动上传素材 |
| `/api/v1/tasks` | GET/POST | 生成任务提交/列表 |
| `/api/v1/tasks/:id/retry` | POST | 重试失败任务 |
| `/api/v1/models` | GET | 模型列表 |
| `/api/v1/admin/models` | CRUD | 模型配置（admin） |
| `/api/v1/admin/users` | CRUD | 用户管理（admin） |
| `/api/v1/templates` | CRUD | 风格模板管理 |
| `/api/v1/health` | GET | 健康检查 |

## 内置风格模板

| # | 模板 | 适用题材 |
|---|------|---------|
| 1 | 国风水墨仙侠 | 修仙玄幻、古装言情 |
| 2 | 吉卜力治愈风 | 日常温馨、自然奇幻、少儿 |
| 3 | 赛博朋克科幻 | 末日异能、悬疑推理 |
| 4 | 日系二次元 | 热血甜宠、异世界穿越 |
| 5 | AI仿真人写实 | 都市言情、豪门商战 |
| 6 | 韩系唯美甜宠 | 恋爱契约、娱乐圈 |
| 7 | 暗黑末世废土 | 丧尸求生、暗黑奇幻 |
| 8 | 新海诚电影风 | 青春恋爱、奇幻穿越 |
| 9 | Q版萌系可爱 | 宠物拟人、少儿亲子 |
| 10 | 美漫超级英雄 | 超英动作、海外市场 |

每套模板包含**中文分镜拆解提示词 + 英文图片生成提示词 + 英文视频提示词**。

## 已接入 AI 模型

| 类型 | 模型 | 供应商 Key | 方式 |
|------|------|-----------|------|
| 图片 | Nanobanana Pro | `nanobanana` | 异步轮询 |
| 图片 | 即梦 4.0 | `jimeng` | 异步轮询 |
| 图片 | Nanobanana2 (Gemini) | `gemini-image` | 同步 (data URL) |
| 图片 | GPT Image 2 | `gpt-image` | 同步 (URL) |
| 图片 | Grok Image | `grok-image` | 同步 (FormData) |
| 视频 | Seedance 2.0 | `seedance` | 异步轮询 |
| 视频 | Sora 2 | `sora` | 异步轮询 (JSON) |
| 视频 | Grok Video | `grok-video` | 异步轮询 (FormData) |

> 所有 Key 在后台 → AI 模型管理页面配置。同步适配器直接返回结果，异步适配器轮询直到完成。

## 后台管理

访问 `http://localhost:3000/admin`（需 admin 权限）：

| 页面 | 功能 |
|------|------|
| 用户管理 | 创建/编辑/禁用用户，角色升降 |
| 风格模板 | 管理 11 套模板的分镜/图片/视频提示词 |
| AI 模型 | 配置 API 地址和 Key，启用/禁用，设默认 |

## 业务流程

```
创建项目 → 选择风格模板 → 创建分集 → 上传剧本(.txt/.docx)
       → AI 分镜拆解 → 分镜列表生成
       → 选择模型 → 提交图片/视频生成任务
       → WebSocket 实时推送状态 → 素材入库
       → 分集预览 → 导出
```

## 许可协议

本项目采用**双许可模式**（Dual Licensing），根据使用场景适用不同条款。

### 个人许可（免费）

在满足以下全部条件时，可免费使用本项目：

1. **个人学习与研究** — 以自然人身份用于自身学习、技术研究、非商业作品创作
2. **非商业用途** — 不直接或间接产生经济收入，包括但不限于：
   - 个人兴趣项目、学习笔记、技术博客示例
   - 未投放广告、未接入付费功能、未接受赞助的个人网站
   - 非营利教育机构内部教学使用
3. **保留标识** — 保留本项目版权声明与作者署名

### 商业许可（付费）

以下情形需取得书面商业授权：

1. **企业使用** — 任何法人、非法人组织、个体工商户在其业务中使用本项目的全部或部分代码
2. **商业用途** — 包括但不限于：
   - 用于商业短剧制作、内容生产、AI 生成服务
   - 集成于 SaaS 平台、API 服务、商业软件产品
   - 用于为客户提供技术开发、代建、外包服务
   - 任何直接或间接产生经济收入的使用方式
3. **再分发** — 将本项目或修改后的版本作为独立产品进行销售、许可或分发

> 商业授权费用根据使用规模、部署方式协商确定。已授权的商业用户享有优先技术支持。

### 免责声明

本软件按"现状"提供，不附带任何形式的明示或默示保证，包括但不限于适销性、特定用途适用性及非侵权的保证。在任何情况下，作者或版权持有人均不对因使用本软件而产生的任何索赔、损害或其他责任承担责任。

### 联系

商业授权 / 合作开发：**QQ 858323707**

Copyright (c) 2026 Minos3.
