---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments: ['prd.md', 'product-brief-AI-Comic-Studio-2026-02-18.md']
workflowType: 'architecture'
lastStep: 8
status: 'complete'
completedAt: '2026-02-23'
project_name: 'AI-Comic-Studio'
user_name: 'M'
date: '2026-02-18'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
39 条 FR，覆盖 8 个能力领域：

| 能力领域 | FR 数量 | 架构影响 |
|---------|--------|---------|
| 用户管理 | 4 | JWT 认证 + admin/user 角色 |
| 项目管理 | 6 | 核心数据模型：项目→集数→分镜层级 |
| 剧本管理 | 2 | 文件上传 + 文本存储 |
| 智能分镜拆解 | 6 | Gemini API 后端代理 + 结构化输出解析 |
| 图片生成 | 6 | 模型适配层 + 异步任务系统 |
| 视频生成 | 6 | 同上，但超时更长 |
| 预览 | 1 | 前端媒体播放 |
| 后台管理 | 4 | 风格模板 CRUD + 模型配置 |
| 任务与状态管理 | 4 | WebSocket + 任务状态机 |

核心架构挑战：
1. **模型适配层** — 4个不同 API 的统一抽象（FR18-29, FR31）
2. **异步任务系统** — 任务提交、状态流转、回调处理、失败重试（FR19-20, FR25-26, FR34-37）
3. **风格模板系统** — 模板管理 + 项目绑定 + 提示词注入到各步骤（FR14, FR30）

**Non-Functional Requirements:**
22 条 NFR，驱动架构决策的关键项：

| NFR | 架构决策影响 |
|-----|------------|
| NFR1: 任务提交 ≤10秒反馈 | 异步提交，立即返回 task_id |
| NFR2: WebSocket 推送 ≤3秒 | socket.io 直接推送 |
| NFR5: 5用户并发 | 单进程 SQLite 够用 |
| NFR6-10: 安全 | API Key 后端存储，JWT，路由守卫 |
| NFR11: 新模型 ≤1天接入 | 适配器模式，统一接口 |
| NFR12: HTTP 代理支持 | 后端 HTTP client 代理配置 |
| NFR13: 异步回调无超时 | 任务状态机：submitted→processing→completed/failed |
| NFR15: 文件存储抽象 | Storage interface，MVP 本地实现 |
| NFR16: 重启不丢数据 | SQLite 持久化 + 本地文件 |
| NFR22: 统一 UX 反馈 | 前端统一 toast/spinner 组件 |

**Scale & Complexity:**

- Primary domain: Full-stack Web App + Task Orchestration
- Complexity level: Medium-High
- 预估架构组件数: ~12
- 并发规模: 5人（MVP），20+人（P1）

### Technical Constraints & Dependencies

- **技术栈已确定：** React + Vite + Zustand + shadcn/ui / Node.js + Express + socket.io / SQLite + Drizzle ORM
- **单体架构：** 前后端同一 TypeScript 代码库，单进程部署
- **开发模式：** Solo + AI 辅助，极简架构优先
- **网络环境：** 需要 HTTP 代理才能访问外部 API
- **Brownfield：** 已有前端 UI 原型，增量改造不重构
- **Gemini 迁移：** 现有 `geminiService.ts` 需从前端迁移到后端，MVP 用非流式
- **前端路由迁移：** 从 AppView 枚举迁移到 React Router，路由结构与后端 API 对齐
- **抽象原则：** 只在模型适配层和文件存储做接口抽象，WebSocket（socket.io）和数据库（Drizzle）直接使用不额外包装

### Cross-Cutting Concerns Identified

1. **认证与授权** — 所有 API 路由需要 JWT 验证，admin/user 角色区分贯穿前后端
2. **错误处理** — 第三方 API 错误需要分类（超时/报错/成功），统一错误响应格式
3. **文件存储** — 剧本、图片、视频都需要存储，统一抽象接口
4. **代理配置** — 所有外部 HTTP 请求需要走代理
5. **异步任务状态** — 图片和视频生成共享同一套任务状态机和 WebSocket 推送机制
6. **风格模板注入** — 分镜拆解、图片生成、视频生成三个步骤都需要从模板获取提示词
7. **任务超时机制** — 异步任务设置最大等待时间（图片10分钟，视频30分钟），超时自动标记失败
8. **并发控制** — 每个模型限制同时进行中的任务数（如最多5个并发），防止触发第三方限流
9. **WebSocket 重连同步** — 断线重连后前端主动拉取一次全量状态，确保一致性
10. **Gemini 单点风险** — 分镜拆解预留备选文本模型配置，不硬绑定 Gemini
11. **文件命名策略** — UUID 命名 + `uploads/{projectId}/{episodeId}/{panelId}/` 目录结构隔离
12. **服务重启恢复** — 重启后扫描"生成中"状态任务，超时的标记为失败
13. **第三方素材下载** — 第三方返回临时 URL 时，后端主动下载存储到本地文件系统，更新数据库路径，再推送前端
14. **部署模式** — 开发模式 concurrently 启动前后端；生产模式 Express 同时 serve 静态文件和 API，单端口
15. **健康检查端点** — `GET /api/v1/health` 返回数据库连接状态、各模型 API 最近调用状态、磁盘剩余空间

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:** 命名 5 项、结构 4 项、格式 3 项、通信 3 项、流程 3 项，共 18 处潜在冲突

### Naming Patterns

**Database Naming Conventions**
- 表：全部小写复数，`users`, `projects`, `style_templates`
- 列：snake_case，外键使用 `{entity}_id` 形式（如 `project_id`）
- 索引：`idx_<table>_<columns>`（如 `idx_projects_name`）
- Drizzle schema 中的表常量命名为 `usersTable`

**API Naming Conventions**
- REST 资源使用复数：`/projects`, `/projects/:projectId/episodes`
- 路径参数统一 `:camelCaseId`（`projectId`, `episodeId`, `panelId`）
- 查询参数 camelCase：`?status=processing`
- 自定义 Header 使用 `X-AICS-*` 前缀

**Code Naming Conventions**
- 前端组件文件 `PascalCase.tsx`，导出同名组件
- Zustand store 文件 `useSomethingStore.ts`
- 后端路由 `something.routes.ts`
- 常量 `SCREAMING_SNAKE_CASE`，变量/函数 `camelCase`

### Structure Patterns

**Project Organization**
- `src/` 以 feature 目录组织：`features/projects`, `features/tasks`
- 组件按 UI 层级：`components/ui`, `components/business`
- 测试文件与实现同目录，以 `*.test.ts` 结尾
- `server/` 以层划分：`routes/`, `services/`, `adapters/`, `db/`, `storage/`

**File Structure Patterns**
- 配置文件集中在项目根：`vite.config.ts`, `drizzle.config.ts`
- 静态资源位于 `public/`
- 文档放在 `docs/`，如 `docs/architecture.md`
- `.env.example` 与 `.env` 同级

### Format Patterns

**API Response Formats**
- 成功：`{ success: true, data }`
- 失败：`{ success: false, error: { code, message, details? } }`
- 日期一律 ISO UTC 字符串
- 列表响应始终用数组

**Data Exchange Formats**
- JSON 字段 camelCase
- 布尔值使用 `true/false`
- 空字段使用 `null`

### Communication Patterns

**Event System Patterns**
- WebSocket 事件命名 `<domain>:<action>`，全小写
- 事件 payload 必含 `version` 字段（任务使用 `taskVersion`）
- 升级事件需新增 `...V2` 版本，不在原事件混入新字段

**State Management Patterns**
- Zustand store 仅暴露 hook，内部 state 使用 immutable 更新
- Action 命名 `verbNoun`（如 `setTaskStatus`）
- Selector 与 store 同文件导出，避免组件依赖内部结构

### Process Patterns

**Error Handling Patterns**
- Express `errorMiddleware` 统一日志与响应
- 前端 `ErrorBoundary` 包裹核心路由并展示友好消息
- 模型调用失败日志必须包含 `modelId`, `taskId`, `error.code`

**Loading State Patterns**
- 异步函数返回 `{ data, error, isLoading }`
- Loading UI：列表使用 skeleton，局部按钮使用 spinner
- Loading key 命名 `loading.<domain>.<action>`，对应 `uiStore`

### Enforcement Guidelines

**All AI Agents MUST:**
- 遵循命名/格式规则，例外需在 PR 说明
- 所有 API handler 返回统一 `{ success, data/error }` 格式
- 所有 WebSocket 事件附带 version，断线后必须触发 REST 全量刷新

**Pattern Enforcement:**
- Code review 检查命名与响应格式
- ESLint/Prettier 配置统一；禁止自定义破坏默认规则
- Pattern 变更需更新本节并通知贡献者

### Pattern Examples

**Good Examples**
- API：`return res.json({ success: true, data: project });`
- WebSocket：`io.emit('task:status', { taskId, taskVersion, status });`
- Zustand：`const useTaskStore = create((set) => ({ tasks: {}, setTaskStatus: (taskId, status) => set((state) => ({ tasks: { ...state.tasks, [taskId]: { ...state.tasks[taskId], status } } })) }));`

**Anti-Patterns**
- 返回 `{ data }` 无 `success`
- WebSocket 事件命名 `TaskStatus` 或缺失 version
- 直接可变更新 Zustand state

## Project Structure & Boundaries

### Complete Project Directory Structure

```
AI-Comic-Studio/
├── .env                              # 生产环境变量
├── .env.example                      # 环境变量模板
├── .env.local                        # 本地开发环境变量（已有）
├── .gitignore
├── package.json                      # 根 package.json
├── tsconfig.json                     # 基础 TS 配置
├── tsconfig.server.json              # 后端 TS 配置（extends base）
├── vite.config.ts                    # 前端构建配置
├── drizzle.config.ts                 # Drizzle ORM 迁移配置
├── index.html                        # SPA 入口（已有）
├── README.md
│
├── src/                              # ===== 前端源码 =====
│   ├── main.tsx                      # React 入口（从 index.tsx 迁移）
│   ├── App.tsx                       # 根组件 + React Router
│   ├── routes.tsx                    # 路由定义
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn/ui 基础组件
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── spinner.tsx
│   │   │   └── ...
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── AppLayout.tsx         # 认证 + 侧边栏 + 内容区布局
│   │   └── common/                   # 跨 feature 复用的业务组件
│   │       ├── FileUpload.tsx
│   │       ├── TaskStatusBadge.tsx
│   │       ├── ModelSelector.tsx
│   │       └── MediaPreview.tsx
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   └── useAuthStore.ts
│   │   ├── projects/
│   │   │   ├── ProjectListPage.tsx
│   │   │   ├── ProjectDetailPage.tsx
│   │   │   ├── ProjectCreateDialog.tsx
│   │   │   └── useProjectStore.ts
│   │   ├── episodes/
│   │   │   ├── EpisodeListPage.tsx
│   │   │   ├── EpisodePreviewPage.tsx  # 预览归属集数维度
│   │   │   └── useEpisodeStore.ts
│   │   ├── scripts/
│   │   │   ├── ScriptEditorPage.tsx
│   │   │   ├── ScriptBreakdownPage.tsx
│   │   │   └── useScriptStore.ts
│   │   ├── panels/
│   │   │   ├── PanelListPage.tsx       # 含状态筛选 UI (FR8)
│   │   │   ├── PanelDetailPage.tsx     # 内部 tab 拆分：提示词/图片/视频
│   │   │   ├── PanelPromptEditor.tsx
│   │   │   ├── PanelHistorySection.tsx # 分镜生成历史 (FR9)
│   │   │   └── usePanelStore.ts
│   │   ├── tasks/
│   │   │   ├── TaskListPage.tsx
│   │   │   └── useTaskStore.ts
│   │   ├── assets/
│   │   │   ├── CharacterManager.tsx
│   │   │   ├── SceneManager.tsx
│   │   │   └── useAssetStore.ts
│   │   └── admin/
│   │       ├── ModelManagementPage.tsx
│   │       ├── StyleTemplateManagementPage.tsx
│   │       ├── UserManagementPage.tsx
│   │       └── useAdminStore.ts
│   │
│   ├── lib/
│   │   ├── api.ts                    # axios/fetch 实例 + 拦截器（仅配置）
│   │   ├── socket.ts                 # socket.io 客户端初始化 + 事件分发
│   │   └── utils.ts                  # 通用工具函数
│   │
│   └── styles/
│       └── globals.css               # Tailwind 指令 + 全局样式
│
├── server/                           # ===== 后端源码 =====
│   ├── index.ts                      # Express 启动入口
│   ├── app.ts                        # Express app 配置（中间件注册）
│   │
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── projects.routes.ts
│   │   ├── episodes.routes.ts
│   │   ├── panels.routes.ts
│   │   ├── scripts.routes.ts
│   │   ├── tasks.routes.ts
│   │   ├── models.routes.ts          # admin: 模型管理
│   │   ├── templates.routes.ts       # admin: 风格模板管理
│   │   ├── users.routes.ts           # admin: 用户管理
│   │   └── health.routes.ts          # GET /api/v1/health
│   │
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── project.service.ts
│   │   ├── episode.service.ts
│   │   ├── panel.service.ts
│   │   ├── script.service.ts         # 剧本导入解析
│   │   ├── breakdown.service.ts      # 分镜拆解编排（调用 AI 适配器 + 模板注入）
│   │   ├── task.service.ts           # 任务状态机 + 超时管理
│   │   ├── template.service.ts       # 风格模板 CRUD
│   │   ├── model.service.ts          # 模型配置 CRUD
│   │   └── alert.service.ts          # API 错误频率统计 + admin 告警推送 (FR33)
│   │
│   ├── adapters/
│   │   ├── base.adapter.ts           # 统一适配器接口定义
│   │   ├── gemini.adapter.ts         # Gemini（分镜拆解）
│   │   ├── nanobanana.adapter.ts     # Nanobanana（图片）
│   │   ├── jimeng.adapter.ts         # 即梦（图片）
│   │   ├── seedance.adapter.ts       # Seedance（视频）
│   │   ├── sora.adapter.ts           # Sora（视频）
│   │   └── adapter.registry.ts       # 适配器查找表（仅路由，不含业务逻辑）
│   │
│   ├── db/
│   │   ├── schema.ts                 # Drizzle schema 定义（所有表）
│   │   ├── index.ts                  # 数据库连接初始化
│   │   └── migrations/               # Drizzle 迁移文件
│   │
│   ├── storage/
│   │   ├── storage.interface.ts      # 文件存储抽象接口
│   │   └── local.storage.ts          # 本地文件系统实现
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts        # JWT 验证 + 角色守卫
│   │   └── error.middleware.ts       # 统一错误处理
│   │
│   ├── socket/
│   │   └── index.ts                  # socket.io 服务端初始化 + 事件处理
│   │
│   └── utils/
│       ├── logger.ts                 # 日志工具
│       └── http-client.ts            # 带代理配置的 HTTP 客户端封装
│
├── shared/                           # ===== 前后端共享 =====
│   └── types/
│       ├── index.ts                  # 统一导出
│       ├── auth.types.ts             # 认证相关类型
│       ├── project.types.ts          # 项目/集数/分镜
│       ├── task.types.ts             # 任务状态、事件
│       ├── model.types.ts            # 模型配置、适配器接口
│       ├── template.types.ts         # 风格模板
│       └── api.types.ts              # 统一请求/响应格式、错误码
│
├── uploads/                          # 文件存储根目录（gitignore）
│   └── {projectId}/
│       └── {episodeId}/
│           └── {panelId}/
│               ├── {uuid}.png
│               └── {uuid}.mp4
│
├── data/                             # SQLite 数据库文件目录（gitignore）
│   └── aics.db
│
└── public/                           # 静态资源
    └── favicon.ico
```

### Architectural Boundaries

**API Boundaries:**

| 边界 | 入口 | 职责 |
|------|------|------|
| REST API | `/api/v1/*` | 所有前后端数据交互 |
| WebSocket | `socket.io` 连接 | 任务状态实时推送 + admin 告警推送 |
| 外部 AI API | `server/adapters/*` | 所有第三方模型调用，前端不直接访问 |
| 文件服务 | `/api/v1/files/*` | 上传/下载文件，通过 storage 接口 |

- 前端 → REST API → service → DB/adapter/storage
- 前端 ← WebSocket ← task.service / alert.service
- 后端 → http-client（带代理）→ 第三方 AI API

**Component Boundaries（前端）:**

| 层 | 通信方式 | 规则 |
|----|---------|------|
| Page 组件 | 调用 Zustand store actions | Page 负责布局和组合 |
| Common 组件 | 接收 props | 跨 feature 复用，无直接 store 依赖 |
| UI 组件 | 纯 props | shadcn/ui，无业务逻辑 |
| Zustand stores | 调用 `lib/api.ts` 实例 | 每个 feature 一个 store，API 调用在 store action 内 |
| `lib/socket.ts` | 分发事件到对应 store | App 层初始化，store 订阅 |

**Service Boundaries（后端）:**

| 层 | 调用关系 | 规则 |
|----|---------|------|
| Routes | → Services | 参数校验、调用 service、返回统一格式 |
| Services | → DB / Adapters / Storage | 业务逻辑，事务管理 |
| Adapters | → http-client → 外部 API | 统一接口，隔离第三方差异 |
| adapter.registry | 仅查找 | 根据 modelId 返回适配器实例，不含业务逻辑 |
| Storage | → 文件系统 | 抽象接口，MVP 本地实现 |
| Middleware | 横切 Routes | 认证、错误处理 |

**Data Boundaries:**

| 数据域 | 存储 | 访问方式 |
|--------|------|---------|
| 用户/项目/集数/分镜/任务 | SQLite (Drizzle) | service → db |
| API Key / 模型配置 | SQLite (加密存储) | admin service → db |
| 风格模板 | SQLite | template.service → db |
| 剧本文件 / 图片 / 视频 | 本地文件系统 | service → storage interface |
| JWT token | 内存（前端 Zustand） | auth store |
| 任务实时状态 | 内存 + DB 持久化 | task.service + socket |
| API 错误统计 | 内存（滑动窗口） | alert.service |

### Requirements to Structure Mapping

**FR Category → 目录映射:**

| FR 类别 | 前端 | 后端 | 数据库表 |
|---------|------|------|---------|
| 用户管理 (FR1-4) | `features/auth/`, `features/admin/UserManagement` | `routes/auth`, `routes/users`, `services/auth` | `users` |
| 项目管理 (FR5-9,38) | `features/projects/`, `features/episodes/` | `routes/projects`, `routes/episodes`, `services/project`, `services/episode` | `projects`, `episodes` |
| 剧本管理 (FR10-11) | `features/scripts/` | `routes/scripts`, `services/script` | `scripts` |
| 智能分镜拆解 (FR12-17) | `features/panels/`, `features/scripts/ScriptBreakdown` | `routes/panels`, `services/breakdown`, `adapters/gemini` | `panels`, `characters`, `scenes` |
| 图片生成 (FR18-23) | `features/panels/PanelDetail`, `features/tasks/` | `routes/tasks`, `services/task`, `adapters/nanobanana`, `adapters/jimeng` | `tasks`, `generated_assets` |
| 视频生成 (FR24-29) | 同上 | `routes/tasks`, `services/task`, `adapters/seedance`, `adapters/sora` | `tasks`, `generated_assets` |
| 预览 (FR39) | `features/episodes/EpisodePreviewPage` | `routes/episodes`（资源列表） | — |
| 后台管理 (FR30-33) | `features/admin/` | `routes/models`, `routes/templates`, `services/model`, `services/template`, `services/alert` | `ai_models`, `style_templates` |
| 任务状态 (FR34-37) | `features/tasks/`, `lib/socket.ts` | `socket/`, `services/task` | `tasks` |

**Cross-Cutting Concerns → 位置映射:**

| 关注点 | 位置 |
|--------|------|
| 认证与授权 | `server/middleware/auth.middleware.ts`, `src/features/auth/useAuthStore.ts`, `src/lib/api.ts`（拦截器自动附加 token） |
| 统一错误处理 | `server/middleware/error.middleware.ts`, `src/lib/api.ts`（统一 catch + toast） |
| 文件存储 | `server/storage/storage.interface.ts` + `local.storage.ts` |
| HTTP 代理 | `server/utils/http-client.ts`（代理配置内聚于 HTTP 客户端） |
| 风格模板注入 | `server/services/breakdown.service.ts`（拆解时）→ `server/services/task.service.ts`（生成时）；模板数据通过 `template.service` 查询，由调用方 service 注入到适配器参数 |
| WebSocket 重连 | `src/lib/socket.ts`（重连后触发 REST 全量刷新） |
| 任务超时 | `server/services/task.service.ts`（定时扫描 + 重启恢复） |
| API 错误告警 | `server/services/alert.service.ts`（滑动窗口统计错误频率，超阈值通过 WebSocket 推送 admin） |

### Integration Points

**Internal Communication:**

```
[React Page] → useXxxStore.action() → lib/api.ts → HTTP → Express Route → Service → DB
                                                                                    ↓
[React Page] ← useTaskStore.onEvent() ← lib/socket.ts ← socket.io ← task.service ←┘
```

**External Integrations:**

| 集成点 | 协议 | 适配器 | 超时 |
|--------|------|--------|------|
| Gemini (分镜拆解) | HTTPS REST | `gemini.adapter.ts` | 30s |
| Nanobanana (图片) | HTTPS REST | `nanobanana.adapter.ts` | 提交30s, 回调10min |
| 即梦 (图片) | HTTPS REST | `jimeng.adapter.ts` | 提交30s, 回调10min |
| Seedance (视频) | HTTPS REST | `seedance.adapter.ts` | 提交30s, 回调30min |
| Sora (视频) | HTTPS REST | `sora.adapter.ts` | 提交30s, 回调30min |

**Data Flow（核心链路 + 模板注入）:**

```
剧本上传 → script.service(解析存储)
    → breakdown.service(查询项目绑定的 style_template → 注入模板提示词 → Gemini 拆解)
        → panels + characters + scenes 写入 DB
            → 用户选择模型 → task.service(查询 style_template → 注入模板提示词 → 调用适配器)
                → 适配器提交 → 轮询/回调获取结果
                    → storage 下载保存 → DB 更新 → WebSocket 推送前端
                    → alert.service 记录调用结果 → 超阈值时推送 admin
```

### File Organization Patterns

**Configuration Files:** 根目录集中：`vite.config.ts`, `drizzle.config.ts`, `tsconfig*.json`, `.env*`

**Source Organization:** 前端 `src/` 按 feature 组织；后端 `server/` 按层组织；共享类型 `shared/types/` 按领域拆分

**Test Organization:** 测试文件与实现同目录，`*.test.ts` 后缀。MVP 测试优先级：`server/services/` > `server/adapters/` > 其他

**Asset Organization:** 用户上传 `uploads/{projectId}/{episodeId}/{panelId}/{uuid}.ext`；静态资源 `public/`

### Development Workflow Integration

**Development Mode:**
- `concurrently` 同时启动 Vite dev server（:3000）和 `tsx watch server/index.ts`（:3001）
- Vite proxy `/api` 和 `/socket.io` 到后端 :3001

**Build & Production:**
- `vite build` → `dist/`
- Express 生产模式 serve `dist/` + API，单端口
- 启动：`tsx server/index.ts` 或编译后 `node server/index.js`

**Database:**
- `drizzle-kit generate` 生成迁移
- `drizzle-kit migrate` 执行迁移
- 数据库文件 `data/aics.db`

### Migration Notes（现有文件迁移计划）

| 现有文件 | 目标位置 | 操作 |
|---------|---------|------|
| `index.tsx` | `src/main.tsx` | 迁移，更新 ReactDOM 入口 |
| `App.tsx` | `src/App.tsx` | 迁移，重构为 React Router |
| `types.ts` | `shared/types/` + `src/` 各 feature | 拆分，按领域分配 |
| `components/Login.tsx` | `src/features/auth/LoginPage.tsx` | 迁移 |
| `components/Sidebar.tsx` | `src/components/layout/Sidebar.tsx` | 迁移 |
| `components/views/Home.tsx` | `src/features/projects/ProjectListPage.tsx` | 迁移 |
| `components/views/ScriptBreakdown.tsx` | `src/features/scripts/ScriptBreakdownPage.tsx` | 迁移 |
| `components/views/ScriptCreate.tsx` | `src/features/scripts/ScriptEditorPage.tsx` | 迁移 |
| `components/views/CreationTasks.tsx` | `src/features/panels/PanelListPage.tsx` | 迁移，拆分 |
| `components/views/AssetManager.tsx` | `src/features/assets/CharacterManager.tsx` | 迁移 |
| `components/views/SceneManager.tsx` | `src/features/assets/SceneManager.tsx` | 迁移 |
| `components/views/ItemManager.tsx` | 评估是否保留（MVP 非必需） | 待定 |
| `components/views/CreatureManager.tsx` | 评估是否保留（MVP 非必需） | 待定 |
| `services/geminiService.ts` | `server/adapters/gemini.adapter.ts` | 迁移到后端 |
| `index.html` | 保持根目录 | 更新 script src 指向 `src/main.tsx`，移除 CDN Tailwind |

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**

| 检查项 | 状态 | 说明 |
|--------|------|------|
| React + Vite + TypeScript | ✅ | 标准组合，无兼容性问题 |
| Express + socket.io + TypeScript | ✅ | 成熟组合 |
| Drizzle ORM + SQLite | ✅ | Drizzle 原生支持 SQLite，迁移 PostgreSQL 路径清晰 |
| Zustand 状态管理 | ✅ | 轻量，与 React 19 兼容 |
| shadcn/ui + Tailwind CSS | ✅ | shadcn/ui 基于 Tailwind，一致 |
| 前后端同仓库 TypeScript | ✅ | `shared/types/` 实现类型共享，`tsconfig.server.json` extends base |
| socket.io 客户端 + 服务端 | ✅ | 同一库的两端，版本锁定即可 |

**Pattern Consistency:**

| 检查项 | 状态 | 说明 |
|--------|------|------|
| 命名规范跨前后端一致 | ✅ | DB snake_case → API camelCase → 前端 camelCase，Drizzle 自动转换 |
| API 响应格式统一 | ✅ | `{ success, data/error }` 贯穿所有 route |
| WebSocket 事件命名 | ✅ | `<domain>:<action>` 全小写 + version 字段 |
| Zustand store 命名 | ✅ | `useXxxStore.ts`，action 命名 `verbNoun` |
| 文件命名前后端分离 | ✅ | 前端 PascalCase.tsx，后端 xxx.routes.ts / xxx.service.ts |

**Structure Alignment:**

| 检查项 | 状态 | 说明 |
|--------|------|------|
| feature 目录 vs 层目录 | ✅ | 前端按 feature，后端按层——符合各自最佳实践 |
| 适配器模式 vs 目录结构 | ✅ | `server/adapters/` 独立目录，`base.adapter.ts` 定义接口 |
| 存储抽象 vs 目录结构 | ✅ | `server/storage/` 独立目录，interface + 实现分离 |
| 共享类型 vs 目录结构 | ✅ | `shared/types/` 按领域拆分，前后端均可 import |

### Requirements Coverage Validation ✅

**Functional Requirements Coverage (39/39):**

| FR | 描述 | 架构支撑 | 状态 |
|----|------|---------|------|
| FR1-4 | 用户管理 | `auth.service` + `auth.middleware` + JWT + bcrypt | ✅ |
| FR5 | 创建项目+选模板 | `project.service` + `template.service` 关联 | ✅ |
| FR6 | 项目列表 | `projects.routes` + `ProjectListPage` | ✅ |
| FR7 | 分镜列表+状态 | `panels.routes` + `PanelListPage` + `TaskStatusBadge` | ✅ |
| FR8 | 状态筛选 | `PanelListPage` 含筛选 UI | ✅ |
| FR9 | 分镜历史可见 | `PanelHistorySection` 组件 | ✅ |
| FR10-11 | 剧本上传/编辑 | `script.service` + `FileUpload` + `ScriptEditorPage` | ✅ |
| FR12-14 | AI 分镜拆解+模板注入 | `breakdown.service` → `gemini.adapter` + `template.service` | ✅ |
| FR15-17 | 手动调整分镜/提示词/角色 | `PanelPromptEditor` + `panels.routes` PATCH | ✅ |
| FR18-23 | 图片生成全流程 | `task.service` + `nanobanana/jimeng.adapter` + `ModelSelector` + `FileUpload` | ✅ |
| FR24-29 | 视频生成全流程 | `task.service` + `seedance/sora.adapter` | ✅ |
| FR30 | 风格模板管理 | `templates.routes` + `template.service` + `StyleTemplateManagementPage` | ✅ |
| FR31 | 模型配置管理 | `models.routes` + `model.service` + `ModelManagementPage` | ✅ |
| FR32 | 切换默认模型 | `model.service` 更新默认标记 | ✅ |
| FR33 | API 报错自动提醒 | `alert.service`（滑动窗口）→ WebSocket 推送 admin | ✅ |
| FR34 | WebSocket + REST fallback | `socket/` + `tasks.routes` GET status | ✅ |
| FR35 | 失败任务重新提交 | `task.service` 重建任务 | ✅ |
| FR36 | 重启不丢数据 | SQLite 持久化 + 本地文件 + 重启扫描 | ✅ |
| FR37 | 错误分类展示 | `alert.service` 分类 + 前端 toast | ✅ |
| FR38 | 删除/归档项目 | `project.service` soft delete/archive | ✅ |
| FR39 | 集数预览 | `EpisodePreviewPage` | ✅ |

**Non-Functional Requirements Coverage (19/22 MVP, 3 P1):**

| NFR | 描述 | 架构支撑 | 状态 |
|-----|------|---------|------|
| NFR1 | 任务提交 ≤10s 反馈 | 异步提交立即返回 task_id | ✅ |
| NFR2 | WebSocket ≤3s 推送 | socket.io 直推 | ✅ |
| NFR3 | 分镜列表 ≤2s | SQLite 本地查询 + 前端 skeleton | ✅ |
| NFR4 | AI 调用不阻塞 | 异步任务，前端 loading 状态 | ✅ |
| NFR5 | 5 用户并发 | 单进程 SQLite WAL 模式 | ✅ |
| NFR6 | API Key 后端存储 | `server/db` 加密存储 | ✅ |
| NFR7 | bcrypt 密码加密 | `auth.service` | ✅ |
| NFR8 | JWT 过期+刷新 | `auth.service` + 滑动过期 | ✅ |
| NFR9 | admin 路由守卫 | `auth.middleware` 角色检查 | ✅ |
| NFR10 | 后端代理外部 API | `http-client.ts` | ✅ |
| NFR11 | 新模型 ≤1天接入 | 适配器模式 + `adapter.registry` | ✅ |
| NFR12 | HTTP 代理支持 | `http-client.ts` | ✅ |
| NFR13 | 异步回调无超时 | 任务状态机 | ✅ |
| NFR14 | API 错误日志 | `logger.ts` + `alert.service` | ✅ |
| NFR15 | 文件存储抽象 | `storage.interface.ts` + `local.storage.ts` | ✅ |
| NFR16 | 重启不丢数据 | SQLite + 本地文件 | ✅ |
| NFR17 | WebSocket 重连 | socket.io 自动重连 + 全量刷新 | ✅ |
| NFR18 | 失败任务一键重提 | `task.service` | ✅ |
| NFR19 | 数据库备份 | ⏳ P1 | ⏳ |
| NFR20 | 日志轮转 | ⏳ P1 | ⏳ |
| NFR21 | 迁移 PostgreSQL | ⏳ P1（Drizzle 支持） | ⏳ |
| NFR22 | 统一 UX 反馈 | `ui/toast` + `ui/spinner` + `ui/skeleton` | ✅ |

### Implementation Readiness Validation ✅

**Decision Completeness:**

| 检查项 | 状态 | 说明 |
|--------|------|------|
| 技术栈版本 | ⚠️ | 未锁定具体版本号，在 `package.json` 初始化时锁定，不阻塞架构 |
| 实现模式有示例 | ✅ | API 响应、WebSocket 事件、Zustand store 均有 good/anti-pattern |
| 一致性规则可执行 | ✅ | 命名、格式、通信模式均有明确规则 |
| 数据库 schema | ⚠️ | 表名+关系已定义，字段级细节属于 Story/Tech Spec 阶段 |

**Structure Completeness:**

| 检查项 | 状态 |
|--------|------|
| 目录树完整 | ✅ |
| 集成点明确 | ✅ |
| 组件边界清晰 | ✅ |
| 迁移计划完整 | ✅ |

**Pattern Completeness:**

| 检查项 | 状态 |
|--------|------|
| 命名冲突点（18处） | ✅ |
| 错误处理模式 | ✅ |
| Loading 状态模式 | ✅ |
| 认证流程 | ✅ |

### Gap Analysis Results

**Critical Gaps: 无**

**Important Gaps:**

| # | Gap | 影响 | 处置 |
|---|-----|------|------|
| 1 | 技术栈未锁定具体版本号 | AI agent 可能选择不兼容版本 | 实现阶段 `package.json` 初始化时锁定 |
| 2 | 数据库 schema 未定义字段级细节 | 实现时需要额外设计 | 属于 Story/Tech Spec 阶段产出 |
| 3 | JWT 刷新机制 | 需明确实现方案 | 已解决：单 token + 滑动过期（见下方） |

**Nice-to-Have Gaps:**

| # | Gap | 说明 |
|---|-----|------|
| 1 | ESLint/Prettier 具体配置 | 实现时按团队习惯配置 |
| 2 | CI/CD pipeline | Solo 开发 MVP 不需要 |
| 3 | Docker 部署 | MVP 不需要，P1 考虑 |

### Validation Issues Addressed

**JWT 滑动刷新方案：**
- 签发时设置 24h 过期
- 每次成功请求时，如果 token 剩余有效期 < 4h，自动在响应 header 中返回新 token
- Header 名称：`X-AICS-New-Token`
- 后端 `auth.middleware.ts`：验证 token 时检查剩余有效期，< 4h 时签发新 token 写入响应 header
- 前端 `lib/api.ts` response interceptor：检测到 `X-AICS-New-Token` 时调用 `useAuthStore.getState().setToken(newToken)`

**DB Entity vs DTO 类型分离：**
- DB entity 类型从 Drizzle schema 自动推导（`$inferSelect` / `$inferInsert`），仅 `server/` 内部使用
- `shared/types/` 只放 API 请求/响应的 DTO 类型，前后端共享
- Service 层负责 entity → DTO 转换

**路径别名配置：**
- `tsconfig.json` paths: `"@/*": ["./*"]`, `"@shared/*": ["./shared/*"]`
- `tsconfig.server.json` paths: 同上
- `vite.config.ts` resolve.alias: `@` → 项目根, `@shared` → `./shared`
- 确保前后端 import `@shared/types` 解析到同一目录

**任务状态机转换图：**

```
                    ┌─────────────┐
                    │   created   │
                    └──────┬──────┘
                           │ 用户提交生成
                           ▼
                    ┌─────────────┐
              ┌─────│  submitted  │
              │     └──────┬──────┘
              │            │ 适配器确认接收
              │            ▼
              │     ┌─────────────┐
              │     │ processing  │──────────────┐
              │     └──────┬──────┘              │
              │            │                     │ 超时（图片10min/视频30min）
              │            │ 回调/轮询返回结果     │
              │     ┌──────┴──────┐              │
              │     ▼             ▼              ▼
        ┌───────────┐     ┌───────────┐   ┌───────────┐
        │ completed  │     │  failed   │◄──│  timeout  │
        └───────────┘     └─────┬─────┘   └───────────┘
                                │
                                │ 用户一键重试 (FR35)
                                ▼
                         ┌─────────────┐
                         │  submitted  │ (新任务，保留原参数)
                         └─────────────┘

特殊转换：
- 服务重启 → 扫描所有 processing 状态任务 → 超时的标记 failed
- submitted 阶段适配器调用失败 → 直接标记 failed（不经过 processing）
```

### Architecture Completeness Checklist

**✅ Requirements Analysis**

- [x] 项目上下文深入分析（39 FR + 22 NFR）
- [x] 规模与复杂度评估（Medium-High，5→20+ 用户）
- [x] 技术约束识别（brownfield、代理、单体、SQLite）
- [x] 15 项跨切关注点映射

**✅ Architectural Decisions**

- [x] 技术栈完整指定（React/Vite/Zustand/shadcn + Express/socket.io/Drizzle/SQLite）
- [x] 集成模式定义（适配器模式、存储抽象、HTTP 代理）
- [x] 性能考量（异步任务、WebSocket、SQLite WAL）
- [x] 安全考量（JWT、bcrypt、API Key 后端存储、角色守卫）

**✅ Implementation Patterns**

- [x] 命名规范（DB/API/Code 三层）
- [x] 结构模式（feature 目录 + 层目录）
- [x] 通信模式（WebSocket 事件、Zustand store）
- [x] 流程模式（错误处理、Loading 状态）

**✅ Project Structure**

- [x] 完整目录树（前端 src/ + 后端 server/ + 共享 shared/）
- [x] 组件边界（前端三层、后端四层）
- [x] 集成点映射（内部通信流 + 外部 API 表 + 数据流图）
- [x] 需求到结构的完整映射（39 FR → 具体目录）
- [x] 现有文件迁移计划（15 个文件）

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** HIGH

**Key Strengths:**
- 极简技术栈，所有组件成熟稳定，AI 生成代码质量高
- 适配器模式隔离第三方差异，新模型接入成本低
- 前端 feature 目录 + 后端层目录的混合组织，兼顾开发体验和关注点分离
- 完整的迁移计划，brownfield 改造路径清晰
- 39 FR + 22 NFR 全部有明确的架构落点
- 任务状态机转换图明确，边界条件已覆盖

**Areas for Future Enhancement:**
- 数据库 schema 字段级设计（Story/Tech Spec 阶段）
- 技术栈版本锁定（`package.json` 初始化时）
- CI/CD pipeline（P1 阶段）
- Docker 部署（P1 阶段）

### Implementation Handoff

**AI Agent Guidelines:**

- 严格遵循本文档所有架构决策
- 所有 API handler 返回 `{ success, data/error }` 格式
- 所有 WebSocket 事件附带 version 字段
- 前端组件按 Page/Common/UI 三层组织
- 后端按 Route → Service → Adapter/Storage 调用链
- 新增文件必须放在本文档定义的目录位置
- 命名遵循本文档的命名规范
- DB entity 类型从 Drizzle schema 推导，`shared/types/` 只放 API DTO
- 路径别名：`@/*` → 项目根，`@shared/*` → `./shared/*`（tsconfig + vite 均需配置）

**First Implementation Priority:**

1. 项目脚手架（目录结构 + 配置文件 + dev 脚本 + 路径别名）
2. Express 骨架 + Drizzle + SQLite 连接
3. JWT 认证全流程（注册/登录/滑动刷新/角色守卫）
4. 第一个 CRUD（projects）端到端验证
5. 按 P0-alpha 里程碑推进后续功能
