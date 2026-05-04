---
stepsCompleted: [1, 2, 3, 4]
inputDocuments: ['prd.md', 'architecture.md']
workflowType: 'epics'
status: 'complete'
completedAt: '2026-02-23'
project_name: 'AI-Comic-Studio'
user_name: 'M'
date: '2026-02-23'
---

# AI-Comic-Studio - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for AI-Comic-Studio, decomposing the requirements from the PRD and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

- FR1: 用户可以注册账号并登录平台
- FR2: 管理员可以创建、编辑、禁用用户账号
- FR3: 系统区分 admin 和 user 两种角色，限制 user 访问后台管理功能
- FR4: 用户可以修改自己的密码
- FR5: 用户可以创建新项目，选择风格模板，并在项目内创建和管理集数（episodes）
- FR6: 用户可以查看自己参与的所有项目列表
- FR7: 用户可以进入项目的某一集，查看该集所有分镜及其当前状态（待处理/生成中/已完成/失败）
- FR8: 用户可以按状态筛选和快速跳转分镜
- FR9: 项目内所有分镜的状态和生成历史对任何项目成员可见
- FR10: 用户可以上传 txt 或 docx 格式的剧本文件到项目中
- FR11: 用户可以在平台内查看和编辑已导入的剧本内容
- FR12: 用户可以对某一集执行 AI 分镜拆解，一步生成分镜表、图片提示词、视频提示词
- FR13: AI 分镜拆解时自动提取角色外貌描述和场景风格板
- FR14: 分镜拆解使用项目所选风格模板中的对应提示词
- FR15: 用户可以手动调整分镜的拆分点（合并/拆分分镜）
- FR16: 用户可以手动编辑任意分镜的提示词
- FR17: 用户可以手动编辑 AI 提取的角色描述和场景信息
- FR18: 用户可以为任意分镜选择图片生成模型（Nanobanana、即梦等）
- FR19: 用户可以提交分镜图片生成任务，10秒内看到"已提交"状态反馈
- FR20: 图片生成任务异步执行，状态实时推送到前端（待处理/生成中/已完成/失败）
- FR21: 用户可以查看已生成的图片结果
- FR22: 用户可以对不满意的结果立即切换模型重新生成
- FR23: 用户可以手动上传图片替代 AI 生成失败的分镜
- FR24: 用户可以为任意分镜选择视频生成模型（Seedance、Sora 等）
- FR25: 用户可以基于分镜图片和提示词提交视频生成任务
- FR26: 视频生成任务异步执行，状态实时推送到前端
- FR27: 用户可以查看已生成的视频结果
- FR28: 用户可以对不满意的结果立即切换模型重新生成
- FR29: 用户可以手动上传视频替代 AI 生成失败的分镜
- FR30: 管理员可以管理风格模板（创建、编辑、删除），每套模板包含分镜拆解、图片生成、视频生成的提示词
- FR31: 管理员可以管理 AI 模型配置（添加、编辑、启用/禁用模型，配置 API 地址和 Key）
- FR32: 管理员可以在模型频繁报错时切换默认模型
- FR33: 系统在第三方 API 频繁报错时自动提醒管理员
- FR34: 所有异步生成任务的状态通过 WebSocket 实时推送，同时提供 REST 轮询接口作为 fallback
- FR35: 用户可以对失败的任务一键重新提交
- FR36: 系统重启后所有任务状态和已生成素材不丢失
- FR37: 系统对 API 错误进行基础分类（超时/报错/成功），展示给用户
- FR38: 管理员可以删除项目，用户可以归档项目
- FR39: 用户可以按分镜顺序预览一集内所有已生成的图片和视频（顺序播放）

### NonFunctional Requirements

- NFR1: 用户提交生成任务后，≤10秒内收到"已提交"状态反馈 [MVP]
- NFR2: WebSocket 状态推送延迟 ≤3秒 [MVP]
- NFR3: 分镜列表页面加载 ≤2秒（100个分镜以内）[MVP]
- NFR4: 剧本导入和分镜拆解的 AI 调用，前端需展示加载状态，不阻塞其他操作 [MVP]
- NFR5: 5个用户同时操作时，页面响应时间不超过单用户时的2倍 [MVP]
- NFR6: 所有 API Key 存储在后端，不暴露给前端 [MVP]
- NFR7: 用户密码使用 bcrypt 或同等强度算法加密存储 [MVP]
- NFR8: JWT token 设置合理过期时间，支持刷新 [MVP]
- NFR9: 后台管理页面仅 admin 角色可访问，路由级别拦截 [MVP]
- NFR10: 第三方 API 调用通过后端代理，前端无法直接访问外部 API [MVP]
- NFR11: 模型适配层提供统一接口，新模型接入 ≤1天 [MVP]
- NFR12: 第三方 API 调用支持 HTTP 代理配置 [MVP]
- NFR13: 第三方 API 提交请求超时可配置，生成结果通过异步回调获取 [MVP]
- NFR14: 第三方 API 调用失败时，系统记录错误日志 [MVP]
- NFR15: 文件存储通过抽象接口实现，MVP 使用本地文件系统 [MVP]
- NFR16: 系统重启后所有数据不丢失 [MVP]
- NFR17: WebSocket 断线后自动重连，REST 轮询接口可用作 fallback [MVP]
- NFR18: 失败的生成任务可一键重新提交 [MVP]
- NFR19: SQLite 数据库文件每日自动备份 [P1]
- NFR20: 系统关键操作记录到日志文件，按天轮转 [P1]
- NFR21: Drizzle ORM 支持无缝迁移到 PostgreSQL [P1]
- NFR22: 所有异步操作使用统一的加载状态组件和反馈模式 [MVP]

### Additional Requirements

- **Brownfield 项目:** 无外部 starter，从现有前端原型增量改造
- **项目脚手架:** 创建 `src/`, `server/`, `shared/` 目录结构 + 配置文件
- **路径别名:** `@/*` → 项目根, `@shared/*` → `./shared/*`
- **DB Entity vs DTO 分离:** Drizzle schema 推导 entity 类型，`shared/types/` 只放 API DTO
- **JWT 滑动刷新:** 单 token + 24h 过期 + `X-AICS-New-Token` header 自动续期
- **任务状态机:** created → submitted → processing → completed/failed，含超时和重启恢复
- **HTTP 代理:** 所有外部 API 请求通过 `http-client.ts` 带代理配置
- **文件存储:** `uploads/{projectId}/{episodeId}/{panelId}/{uuid}.ext`
- **开发模式:** concurrently 启动前端 :3000 + 后端 :3001，Vite proxy 转发
- **生产模式:** Express serve 静态文件 + API，单端口
- **现有文件迁移:** 15 个文件需按 Migration Notes 迁移到新目录结构
- **并发控制:** 每个模型限制同时进行中的任务数
- **第三方素材下载:** 后端主动下载临时 URL 到本地存储
- **健康检查:** `GET /api/v1/health` 返回数据库/API/磁盘状态

### FR Coverage Map

| FR | Epic | 简述 |
|----|------|------|
| FR1 | Epic 2 | 注册登录 |
| FR2 | Epic 2 | 管理员管理用户 |
| FR3 | Epic 2 | 角色权限 |
| FR4 | Epic 2 | 修改密码 |
| FR5 | Epic 3 | 创建项目+选模板+管理集数 |
| FR6 | Epic 3 | 项目列表 |
| FR7 | Epic 5 | 分镜列表+状态 |
| FR8 | Epic 5 | 状态筛选 |
| FR9 | Epic 5 | 分镜历史可见 |
| FR10 | Epic 4 | 剧本上传 |
| FR11 | Epic 4 | 剧本编辑 |
| FR12 | Epic 4 | AI 分镜拆解 |
| FR13 | Epic 4 | 角色/场景提取 |
| FR14 | Epic 4 | 模板提示词注入 |
| FR15 | Epic 4 | 手动调整分镜 |
| FR16 | Epic 4 | 编辑提示词 |
| FR17 | Epic 4 | 编辑角色/场景 |
| FR18 | Epic 5 | 选择图片模型 |
| FR19 | Epic 5 | 提交图片任务 |
| FR20 | Epic 5 | 图片任务状态推送 |
| FR21 | Epic 5 | 查看图片结果 |
| FR22 | Epic 5 | 切换模型重试 |
| FR23 | Epic 5 | 手动上传图片 |
| FR24 | Epic 6 | 选择视频模型 |
| FR25 | Epic 6 | 提交视频任务 |
| FR26 | Epic 6 | 视频任务状态推送 |
| FR27 | Epic 6 | 查看视频结果 |
| FR28 | Epic 6 | 切换模型重试 |
| FR29 | Epic 6 | 手动上传视频 |
| FR30 | Epic 7 | 风格模板管理 |
| FR31 | Epic 7 | 模型配置管理 |
| FR32 | Epic 7 | 切换默认模型 |
| FR33 | Epic 7 | API 错误告警 |
| FR34 | Epic 5 | WebSocket + REST fallback |
| FR35 | Epic 5 | 失败任务重试 |
| FR36 | Epic 7 | 重启不丢数据 |
| FR37 | Epic 5 | 错误分类展示 |
| FR38 | Epic 3 | 删除/归档项目 |
| FR39 | Epic 8 | 集数预览 |

## Epic List

### Epic 1: 项目脚手架与基础设施
用户可以访问一个可运行的全栈应用骨架，前后端开发环境就绪，数据库连接正常。
**FRs covered:** 架构附加需求（目录结构、配置、dev 脚本、Drizzle+SQLite、Vite proxy）
**NFRs addressed:** NFR12, NFR15, NFR16

### Epic 2: 用户认证与权限管理
用户可以注册、登录、管理密码；管理员可以管理用户账号；系统根据角色限制访问权限。
**FRs covered:** FR1, FR2, FR3, FR4
**NFRs addressed:** NFR6, NFR7, NFR8, NFR9, NFR10

### Epic 3: 项目与集数管理
用户可以创建项目（选择风格模板）、管理集数、查看项目列表、删除/归档项目。
**FRs covered:** FR5, FR6, FR38

### Epic 4: 剧本导入与 AI 分镜拆解
用户可以上传剧本、编辑剧本内容、执行 AI 分镜拆解生成分镜表+提示词+角色+场景，并手动调整拆解结果。
**FRs covered:** FR10, FR11, FR12, FR13, FR14, FR15, FR16, FR17
**NFRs addressed:** NFR4, NFR11

### Epic 5: 图片生成与任务管理
用户可以为分镜选择图片模型、提交生成任务、实时查看任务状态、查看结果、切换模型重试、手动上传替代。
**FRs covered:** FR7, FR8, FR9, FR18, FR19, FR20, FR21, FR22, FR23, FR34, FR35, FR37
**NFRs addressed:** NFR1, NFR2, NFR3, NFR5, NFR13, NFR14, NFR17, NFR18, NFR22

### Epic 6: 视频生成
用户可以基于分镜图片提交视频生成任务、查看结果、切换模型重试、手动上传替代。
**FRs covered:** FR24, FR25, FR26, FR27, FR28, FR29
**NFRs addressed:** NFR1, NFR2

### Epic 7: 后台管理与运维
管理员可以管理风格模板、管理模型配置、切换默认模型；系统自动告警 API 错误；重启后数据不丢失。
**FRs covered:** FR30, FR31, FR32, FR33, FR36
**NFRs addressed:** NFR11, NFR16

### Epic 8: 预览与体验优化
用户可以按分镜顺序预览一集的所有图片和视频。
**FRs covered:** FR39

## Epic 1: 项目脚手架与基础设施

用户可以访问一个可运行的全栈应用骨架，前后端开发环境就绪，数据库连接正常。

### Story 1.1: 项目目录结构与开发环境初始化

As a 开发者,
I want 一个完整的前后端目录结构和开发脚本,
So that 我可以立即开始编写业务代码。

**Acceptance Criteria:**

**Given** 项目根目录存在现有前端原型代码
**When** 执行 `npm install && npm run dev`
**Then** Vite 前端 dev server 在 :3000 启动，Express 后端在 :3001 启动
**And** Vite proxy 将 `/api` 和 `/socket.io` 请求转发到 :3001
**And** `src/`, `server/`, `shared/types/` 目录结构已创建
**And** `tsconfig.json` 和 `tsconfig.server.json` 配置完成，`@/*` 和 `@shared/*` 路径别名可用
**And** `drizzle.config.ts` 配置完成
**And** `package.json` 包含 `dev`, `build`, `preview` 脚本
**And** `.env.example` 包含所有必需环境变量模板

### Story 1.2: 数据库连接与基础 Schema

As a 开发者,
I want SQLite 数据库通过 Drizzle ORM 连接就绪,
So that 后续 Story 可以直接定义表并操作数据。

**Acceptance Criteria:**

**Given** Story 1.1 的开发环境已就绪
**When** 后端启动时
**Then** Drizzle 自动连接 `data/aics.db`（不存在则创建）
**And** `server/db/index.ts` 导出可用的 db 实例
**And** `server/db/schema.ts` 存在（空 schema，后续 Story 增量添加表）
**And** `drizzle-kit generate` 和 `drizzle-kit migrate` 命令可正常执行
**And** `data/` 目录已加入 `.gitignore`

### Story 1.3: Express 骨架与统一中间件

As a 开发者,
I want Express 应用骨架和统一的错误处理/响应格式,
So that 后续所有 API 路由遵循一致的模式。

**Acceptance Criteria:**

**Given** 后端启动
**When** 访问 `GET /api/v1/health`
**Then** 返回 `{ success: true, data: { status: "ok", db: "connected" } }`
**And** `server/app.ts` 注册了 JSON body parser、CORS、error middleware
**And** `server/middleware/error.middleware.ts` 捕获所有未处理错误，返回 `{ success: false, error: { code, message } }`
**And** 所有未匹配路由返回 404 统一格式
**And** `server/utils/logger.ts` 提供基础日志功能（console + 文件写入预留）
**And** `server/utils/http-client.ts` 提供带 HTTP 代理配置的 axios/fetch 实例

### Story 1.4: 文件存储抽象层

As a 开发者,
I want 文件存储通过抽象接口实现,
So that MVP 使用本地文件系统，未来可迁移到对象存储。

**Acceptance Criteria:**

**Given** 后端启动
**When** 调用 storage 接口的 `save(path, buffer)` 方法
**Then** 文件保存到 `uploads/` 目录下对应路径
**And** `storage.interface.ts` 定义 `save`, `get`, `delete`, `exists` 方法
**And** `local.storage.ts` 实现本地文件系统版本
**And** `uploads/` 目录已加入 `.gitignore`
**And** 文件服务路由 `GET /api/v1/files/*` 可访问已存储的文件

## Epic 2: 用户认证与权限管理

用户可以注册、登录、管理密码；管理员可以管理用户账号；系统根据角色限制访问权限。

### Story 2.1: 用户注册与登录

As a 用户,
I want 注册账号并登录平台,
So that 我可以访问平台功能。

**Acceptance Criteria:**

**Given** 用户访问登录页面
**When** 输入用户名、密码并提交注册
**Then** 系统创建用户记录（密码 bcrypt 加密），角色默认为 user
**And** 注册成功后自动登录，返回 JWT token
**And** `users` 表包含 `id`, `username`, `password_hash`, `role`, `status`, `created_at`, `updated_at` 字段
**And** `role` 枚举为 `admin` / `user`，`status` 枚举为 `active` / `disabled`
**And** 用户名重复时返回 `{ success: false, error: { code: "USERNAME_EXISTS", message } }`

**Given** 已注册用户
**When** 输入正确的用户名和密码登录
**Then** 返回 `{ success: true, data: { token, user: { id, username, role } } }`
**And** JWT token 有效期 24h

**Given** 已注册用户
**When** 输入错误密码登录
**Then** 返回 `{ success: false, error: { code: "INVALID_CREDENTIALS" } }`

### Story 2.2: JWT 认证中间件与滑动刷新

As a 用户,
I want 登录后所有请求自动携带认证信息且 token 自动续期,
So that 我不需要频繁重新登录。

**Acceptance Criteria:**

**Given** 用户已登录持有有效 JWT
**When** 发送任何 `/api/v1/*` 请求（除 auth 路由外）
**Then** `auth.middleware.ts` 验证 `Authorization: Bearer <token>` header
**And** 验证通过后将 `{ userId, role }` 注入 `req.user`
**And** token 无效或过期时返回 `{ success: false, error: { code: "UNAUTHORIZED" } }` 401

**Given** 用户 token 剩余有效期 < 4h
**When** 发送任何成功请求
**Then** 响应 header 包含 `X-AICS-New-Token` 携带新签发的 24h token
**And** 前端 `lib/api.ts` response interceptor 检测到该 header 时自动更新 `useAuthStore` 中的 token

**Given** 用户 token 剩余有效期 >= 4h
**When** 发送请求
**Then** 响应 header 不包含 `X-AICS-New-Token`

### Story 2.3: 角色权限守卫与前端路由保护

As a 管理员,
I want 后台管理页面仅 admin 可访问,
So that 普通用户无法操作敏感配置。

**Acceptance Criteria:**

**Given** `auth.middleware.ts` 已提供 `requireRole('admin')` 守卫函数
**When** user 角色用户访问 admin 路由（`/api/v1/admin/*`）
**Then** 返回 `{ success: false, error: { code: "FORBIDDEN" } }` 403

**Given** admin 角色用户访问 admin 路由
**When** 请求发送
**Then** 正常通过，进入 route handler

**Given** 前端 React Router 配置
**When** user 角色用户尝试导航到 `/admin/*` 路径
**Then** 前端路由守卫重定向到首页
**And** `src/App.tsx` 使用 React Router，`AppLayout` 组件包裹认证检查
**And** 未登录用户访问任何受保护路由时重定向到 `/login`

### Story 2.4: 用户管理（Admin）与修改密码

As a 管理员,
I want 创建、编辑、禁用用户账号,
So that 我可以管理工作室成员的平台访问。

**Acceptance Criteria:**

**Given** admin 用户访问用户管理页面
**When** 创建新用户（用户名、初始密码、角色）
**Then** 系统创建用户记录，返回用户信息（不含密码）
**And** `POST /api/v1/admin/users` 接受 `{ username, password, role }`

**Given** admin 用户
**When** 编辑用户信息（角色、状态）
**Then** `PATCH /api/v1/admin/users/:userId` 更新对应字段
**And** 禁用用户（`status: disabled`）后该用户的 JWT 验证失败

**Given** 任意已登录用户
**When** 修改自己的密码
**Then** `PATCH /api/v1/users/me/password` 接受 `{ oldPassword, newPassword }`
**And** 旧密码验证通过后更新密码
**And** 旧密码错误时返回 `{ success: false, error: { code: "INVALID_PASSWORD" } }`

**Given** 前端
**When** admin 访问 `/admin/users`
**Then** `UserManagementPage.tsx` 展示用户列表，支持创建/编辑/禁用操作
**And** 所有用户可在个人设置中修改密码

## Epic 3: 项目与集数管理

用户可以创建项目（选择风格模板）、管理集数、查看项目列表、删除/归档项目。

### Story 3.1: 项目 CRUD 与风格模板选择

As a 用户,
I want 创建新项目并选择风格模板,
So that 后续分镜拆解和生成可以使用对应风格的提示词。

**Acceptance Criteria:**

**Given** 已登录用户
**When** 创建新项目
**Then** `POST /api/v1/projects` 接受 `{ name, templateId, remark? }`
**And** `projects` 表包含 `id`, `name`, `template_id`, `remark`, `status`, `created_by`, `created_at`, `updated_at`
**And** `status` 枚举为 `active` / `archived` / `deleted`
**And** 返回 `{ success: true, data: project }`

**Given** 已登录用户
**When** 访问项目列表
**Then** `GET /api/v1/projects` 返回该用户可见的所有 active 项目
**And** 前端 `ProjectListPage.tsx` 展示项目卡片列表

**Given** admin 用户
**When** 删除项目
**Then** `DELETE /api/v1/projects/:projectId` 将 status 设为 `deleted`（软删除）

**Given** 任意用户
**When** 归档项目
**Then** `PATCH /api/v1/projects/:projectId` 将 status 设为 `archived`

### Story 3.2: 集数管理

As a 用户,
I want 在项目内创建和管理集数,
So that 我可以按集组织剧本和分镜。

**Acceptance Criteria:**

**Given** 用户进入某个项目
**When** 创建新集数
**Then** `POST /api/v1/projects/:projectId/episodes` 接受 `{ title, sortOrder }`
**And** `episodes` 表包含 `id`, `project_id`, `title`, `sort_order`, `created_at`, `updated_at`
**And** 返回创建的集数信息

**Given** 用户进入某个项目
**When** 查看集数列表
**Then** `GET /api/v1/projects/:projectId/episodes` 返回按 `sort_order` 排序的集数列表
**And** 前端 `ProjectDetailPage.tsx` 展示集数列表，支持创建/编辑/删除/排序

**Given** 用户
**When** 编辑集数标题或排序
**Then** `PATCH /api/v1/projects/:projectId/episodes/:episodeId` 更新对应字段

**Given** 用户
**When** 删除集数
**Then** `DELETE /api/v1/projects/:projectId/episodes/:episodeId` 删除集数及其关联的分镜数据

## Epic 4: 剧本导入与 AI 分镜拆解

用户可以上传剧本、编辑剧本内容、执行 AI 分镜拆解生成分镜表+提示词+角色+场景，并手动调整拆解结果。

### Story 4.1: 剧本上传与编辑

As a 用户,
I want 上传 txt/docx 剧本文件并在平台内编辑,
So that 我可以准备好剧本内容用于分镜拆解。

**Acceptance Criteria:**

**Given** 用户进入某一集
**When** 上传 txt 或 docx 文件
**Then** `POST /api/v1/projects/:projectId/episodes/:episodeId/scripts` 接受 multipart 文件上传
**And** 后端解析文件内容为纯文本，存入 `scripts` 表
**And** `scripts` 表包含 `id`, `episode_id`, `content`, `original_filename`, `created_at`, `updated_at`
**And** 原始文件通过 storage 接口保存到 `uploads/{projectId}/{episodeId}/`
**And** 前端 `FileUpload` 组件支持拖拽和点击上传

**Given** 用户已上传剧本
**When** 在平台内编辑剧本内容
**Then** `PATCH /api/v1/projects/:projectId/episodes/:episodeId/scripts/:scriptId` 更新 `content` 字段
**And** 前端 `ScriptEditorPage.tsx` 提供文本编辑区域

### Story 4.2: AI 分镜拆解（Gemini 后端代理）

As a 用户,
I want 对某一集执行 AI 分镜拆解，一步生成分镜表、提示词、角色和场景信息,
So that 我可以快速获得可用的分镜和提示词开始制作。

**Acceptance Criteria:**

**Given** 某一集已有剧本内容，项目已绑定风格模板
**When** 用户点击"分镜拆解"
**Then** `POST /api/v1/projects/:projectId/episodes/:episodeId/breakdown` 触发后端分镜拆解
**And** `breakdown.service.ts` 查询项目绑定的 `style_template`，注入模板中的分镜拆解提示词
**And** `gemini.adapter.ts` 调用 Gemini API（非流式），通过 `http-client.ts` 带代理发送请求
**And** 前端展示 loading 状态，不阻塞其他操作（NFR4）
**And** 返回结构化结果：分镜列表（含图片提示词、视频提示词）+ 角色列表 + 场景列表

**Given** 分镜拆解成功
**When** 结果返回
**Then** `panels` 表写入所有分镜：`id`, `episode_id`, `panel_number`, `description`, `dialogue`, `image_prompt`, `video_prompt`, `status`, `created_at`, `updated_at`
**And** `characters` 表写入提取的角色：`id`, `project_id`, `name`, `appearance_description`, `created_at`, `updated_at`
**And** `scenes` 表写入提取的场景：`id`, `project_id`, `name`, `description`, `style_keywords`, `created_at`, `updated_at`
**And** 分镜 `status` 初始为 `pending`

**Given** Gemini API 调用失败
**When** 超时或返回错误
**Then** 返回 `{ success: false, error: { code: "BREAKDOWN_FAILED", message } }`
**And** 错误日志记录 modelId + error.code

### Story 4.3: 分镜手动调整与提示词编辑

As a 用户,
I want 手动调整分镜拆分点、编辑提示词、编辑角色和场景信息,
So that 我可以修正 AI 拆解不准确的地方。

**Acceptance Criteria:**

**Given** 某一集已完成分镜拆解
**When** 用户合并两个相邻分镜
**Then** `POST /api/v1/panels/merge` 接受 `{ panelIds: [id1, id2] }`，合并为一个分镜，重新编号

**Given** 用户
**When** 拆分一个分镜为两个
**Then** `POST /api/v1/panels/:panelId/split` 接受 `{ splitPoint }`，创建两个新分镜，重新编号

**Given** 用户
**When** 编辑分镜的图片提示词或视频提示词
**Then** `PATCH /api/v1/panels/:panelId` 更新 `image_prompt` 或 `video_prompt`
**And** 前端 `PanelPromptEditor.tsx` 提供提示词编辑区域

**Given** 用户
**When** 编辑角色外貌描述
**Then** `PATCH /api/v1/characters/:characterId` 更新 `appearance_description`

**Given** 用户
**When** 编辑场景信息
**Then** `PATCH /api/v1/scenes/:sceneId` 更新 `description` 或 `style_keywords`

**And** 前端 `PanelListPage.tsx` 展示分镜列表，支持合并/拆分/编辑操作

## Epic 5: 图片生成与任务管理

用户可以为分镜选择图片模型、提交生成任务、实时查看任务状态、查看结果、切换模型重试、手动上传替代。

### Story 5.1: 任务状态机与 WebSocket 实时推送

As a 用户,
I want 所有异步生成任务的状态实时推送到前端,
So that 我可以随时知道任务进展而不需要手动刷新。

**Acceptance Criteria:**

**Given** 后端启动
**When** socket.io 服务初始化
**Then** `server/socket/index.ts` 监听客户端连接，验证 JWT token
**And** `tasks` 表包含 `id`, `panel_id`, `type`(image/video), `model_id`, `status`, `prompt`, `result_url`, `error_message`, `error_code`, `created_at`, `updated_at`
**And** `status` 枚举为 `created`, `submitted`, `processing`, `completed`, `failed`

**Given** 任务状态发生变更
**When** `task.service.ts` 更新任务状态
**Then** 通过 socket.io 发送 `task:status` 事件：`{ taskId, taskVersion, status, panelId, resultUrl? }`
**And** 推送延迟 ≤3s（NFR2）

**Given** 前端 WebSocket 断线后重连
**When** 重连成功
**Then** `lib/socket.ts` 自动触发 `GET /api/v1/tasks?episodeId=xxx` 全量刷新任务状态
**And** `useTaskStore` 更新所有任务状态

**Given** WebSocket 不可用
**When** 前端检测到连接失败
**Then** 自动降级为 REST 轮询 `GET /api/v1/tasks/:taskId/status`（每 5s）

### Story 5.2: 图片生成适配器（Nanobanana + 即梦）

As a 用户,
I want 选择 Nanobanana 或即梦模型生成分镜图片,
So that 我可以根据效果选择最合适的模型。

**Acceptance Criteria:**

**Given** `base.adapter.ts` 定义统一适配器接口
**When** 实现 Nanobanana 和即梦适配器
**Then** `nanobanana.adapter.ts` 实现 `submitTask(prompt, options)` 和 `queryResult(taskId)` 方法
**And** `jimeng.adapter.ts` 实现相同接口
**And** `adapter.registry.ts` 根据 `modelId` 返回对应适配器实例
**And** 所有外部 API 调用通过 `http-client.ts`（带代理）
**And** 提交超时 30s，回调/轮询超时 10min
**And** 超时后 `task.service.ts` 将任务标记为 `failed`

**Given** `ai_models` 表存储模型配置
**When** 查询可用图片模型
**Then** `GET /api/v1/models?type=image` 返回所有 `enabled` 的图片模型列表
**And** `ai_models` 表包含 `id`, `name`, `type`(image/video/text), `provider`, `api_url`, `api_key`(加密), `enabled`, `is_default`, `config_json`, `created_at`, `updated_at`

### Story 5.3: 图片生成任务提交与结果展示

As a 用户,
I want 为分镜提交图片生成任务并查看结果,
So that 我可以获得分镜对应的 AI 生成图片。

**Acceptance Criteria:**

**Given** 用户在分镜详情页选择了图片模型
**When** 点击"生成图片"
**Then** `POST /api/v1/tasks` 接受 `{ panelId, type: "image", modelId, prompt }`
**And** `task.service.ts` 创建任务（status: created），查询 style_template 注入模板提示词
**And** 调用适配器提交任务，状态更新为 `submitted`
**And** ≤10s 内前端收到"已提交"状态反馈（NFR1）
**And** 前端 `ModelSelector` 组件展示可用图片模型列表

**Given** 图片生成完成
**When** 适配器轮询/回调返回结果 URL
**Then** `task.service.ts` 通过 `http-client.ts` 下载图片到本地 storage
**And** 更新 `tasks.result_url` 为本地路径
**And** 更新分镜 `panels.status` 为对应状态
**And** WebSocket 推送 `task:status` 事件（status: completed, resultUrl）

**Given** 用户查看分镜详情
**When** 分镜有已完成的图片任务
**Then** `PanelDetailPage.tsx` 展示生成的图片
**And** `PanelHistorySection.tsx` 展示该分镜所有历史生成记录（FR9）

**Given** 用户在分镜列表页
**When** 查看分镜列表
**Then** `PanelListPage.tsx` 展示每个分镜的当前状态（FR7）
**And** 支持按状态筛选分镜（FR8）

### Story 5.4: 模型切换重试、手动上传与错误处理

As a 用户,
I want 对不满意的结果切换模型重试或手动上传替代图片,
So that 生成失败不会阻断我的工作流。

**Acceptance Criteria:**

**Given** 用户对图片结果不满意
**When** 选择另一个模型并点击"重新生成"
**Then** 创建新的图片生成任务（保留原 panelId，新 modelId）
**And** 历史任务记录保留，新任务独立追踪

**Given** 用户
**When** 点击"上传替代"并选择本地图片文件
**Then** `POST /api/v1/panels/:panelId/upload` 接受 multipart 图片上传
**And** 图片通过 storage 接口保存
**And** 分镜 status 更新为 `completed`
**And** 不创建 task 记录（手动上传不走任务系统）

**Given** 任务失败
**When** 用户点击"重新提交"
**Then** `POST /api/v1/tasks/:taskId/retry` 创建新任务，复制原任务的 panelId、modelId、prompt（FR35）

**Given** API 调用失败
**When** 错误返回
**Then** `alert.service.ts` 记录错误，分类为超时/报错（FR37）
**And** 前端展示分类后的错误信息（toast）
**And** 统一 loading/error/success 反馈模式（NFR22）

## Epic 6: 视频生成

用户可以基于分镜图片提交视频生成任务、查看结果、切换模型重试、手动上传替代。

### Story 6.1: 视频生成适配器（Seedance + Sora）

As a 用户,
I want 选择 Seedance 或 Sora 模型生成分镜视频,
So that 我可以将静态分镜图片转化为动态视频。

**Acceptance Criteria:**

**Given** `base.adapter.ts` 统一接口已定义（Epic 5）
**When** 实现 Seedance 和 Sora 适配器
**Then** `seedance.adapter.ts` 实现 `submitTask(prompt, options)` 和 `queryResult(taskId)`
**And** `sora.adapter.ts` 实现相同接口
**And** `options` 包含 `imageUrl`（分镜图片作为视频生成的输入）
**And** `adapter.registry.ts` 注册新适配器
**And** 提交超时 30s，回调/轮询超时 30min
**And** `GET /api/v1/models?type=video` 返回所有 enabled 的视频模型

### Story 6.2: 视频生成任务提交与结果展示

As a 用户,
I want 基于分镜图片和提示词提交视频生成任务并查看结果,
So that 我可以获得分镜对应的 AI 生成视频。

**Acceptance Criteria:**

**Given** 分镜已有 completed 状态的图片
**When** 用户选择视频模型并点击"生成视频"
**Then** `POST /api/v1/tasks` 接受 `{ panelId, type: "video", modelId, prompt, imageUrl }`
**And** `task.service.ts` 查询 style_template 注入视频生成模板提示词
**And** 调用视频适配器，传入图片 URL 和提示词

**Given** 视频生成完成
**When** 适配器返回结果
**Then** 后端下载视频到本地 storage（`.mp4`）
**And** 更新 task 状态和 result_url
**And** WebSocket 推送前端

**Given** 用户对视频不满意
**When** 切换模型重试或手动上传视频
**Then** 复用 Epic 5 的重试和上传逻辑（`POST /api/v1/tasks/:taskId/retry`, `POST /api/v1/panels/:panelId/upload`）
**And** 上传接受视频文件格式（mp4）

**And** `PanelDetailPage.tsx` 在视频 tab 展示生成的视频，支持播放

## Epic 7: 后台管理与运维

管理员可以管理风格模板、管理模型配置、切换默认模型；系统自动告警 API 错误；重启后数据不丢失。

### Story 7.1: 风格模板管理

As a 管理员,
I want 创建和管理风格模板,
So that 制作者创建项目时可以选择预设的风格，自动获得对应的提示词。

**Acceptance Criteria:**

**Given** admin 用户访问风格模板管理页面
**When** 创建新模板
**Then** `POST /api/v1/admin/templates` 接受 `{ name, description, breakdownPrompt, imagePrompt, videoPrompt }`
**And** `style_templates` 表包含 `id`, `name`, `description`, `breakdown_prompt`, `image_prompt`, `video_prompt`, `created_at`, `updated_at`
**And** 返回创建的模板信息

**Given** admin 用户
**When** 编辑模板
**Then** `PATCH /api/v1/admin/templates/:templateId` 更新对应字段

**Given** admin 用户
**When** 删除模板
**Then** `DELETE /api/v1/admin/templates/:templateId`
**And** 已绑定该模板的项目不受影响（保留已有提示词）

**Given** 前端
**When** admin 访问 `/admin/templates`
**Then** `StyleTemplateManagementPage.tsx` 展示模板列表，支持 CRUD 操作

**Given** 任意用户创建项目时
**When** 选择风格模板
**Then** `GET /api/v1/templates` 返回所有可用模板列表（非 admin 路由）

### Story 7.2: 模型配置管理与默认模型切换

As a 管理员,
I want 管理 AI 模型配置并在模型出问题时快速切换默认模型,
So that 团队的生成工作不会因为单个模型故障而中断。

**Acceptance Criteria:**

**Given** admin 用户访问模型管理页面
**When** 添加新模型
**Then** `POST /api/v1/admin/models` 接受 `{ name, type, provider, apiUrl, apiKey, configJson? }`
**And** `apiKey` 加密存储
**And** 返回模型信息（apiKey 脱敏）

**Given** admin 用户
**When** 编辑模型配置
**Then** `PATCH /api/v1/admin/models/:modelId` 更新对应字段

**Given** admin 用户
**When** 启用/禁用模型
**Then** `PATCH /api/v1/admin/models/:modelId` 更新 `enabled` 字段
**And** 禁用的模型不出现在前台模型选择列表中

**Given** admin 用户
**When** 设置某模型为默认
**Then** `PATCH /api/v1/admin/models/:modelId/default` 将该类型（image/video）的其他模型 `is_default` 设为 false
**And** 前台模型选择器默认选中该模型

**Given** 前端
**When** admin 访问 `/admin/models`
**Then** `ModelManagementPage.tsx` 展示模型列表，支持添加/编辑/启用禁用/设默认

### Story 7.3: API 错误告警与重启恢复

As a 管理员,
I want 系统在 API 频繁报错时自动提醒我，且重启后数据不丢失,
So that 我可以及时处理问题，团队工作不受影响。

**Acceptance Criteria:**

**Given** 某个模型的 API 调用
**When** 在 5 分钟滑动窗口内连续失败 >= 3 次
**Then** `alert.service.ts` 通过 WebSocket 推送 `alert:model-error` 事件给所有 admin 用户：`{ modelId, modelName, errorCount, windowMinutes, lastError }`
**And** 前端 admin 页面弹出 toast 告警
**And** 同一模型在告警后 10 分钟内不重复告警

**Given** 后端服务重启
**When** 服务启动完成
**Then** `task.service.ts` 扫描所有 `status = processing` 的任务
**And** 创建时间超过超时阈值（图片 10min，视频 30min）的任务标记为 `failed`
**And** `status = submitted` 且创建时间超过 5 分钟的任务也标记为 `failed`
**And** 所有 SQLite 数据和 `uploads/` 文件完好（NFR16）

## Epic 8: 预览与体验优化

用户可以按分镜顺序预览一集的所有图片和视频。

### Story 8.1: 集数分镜预览

As a 用户,
I want 按分镜顺序预览一集内所有已生成的图片和视频,
So that 我可以快速检查整集的视觉效果和连贯性。

**Acceptance Criteria:**

**Given** 用户进入某一集
**When** 点击"预览"
**Then** `EpisodePreviewPage.tsx` 按 `panel_number` 顺序展示所有分镜
**And** 每个分镜展示最新的 completed 图片和视频（如有）
**And** 未完成的分镜显示占位符（灰色区域 + 状态标签）

**Given** 预览页面
**When** 分镜有视频
**Then** 展示视频播放器，用户点击播放
**And** 分镜仅有图片时展示图片

**Given** 预览页面
**When** 用户滚动浏览
**Then** 分镜按顺序排列，图片/视频自适应宽度
**And** 每个分镜显示编号、描述文字、当前状态

**Given** 后端
**When** 前端请求预览数据
**Then** `GET /api/v1/projects/:projectId/episodes/:episodeId/preview` 返回按顺序排列的分镜列表，每个分镜包含最新的 completed 任务的 resultUrl
