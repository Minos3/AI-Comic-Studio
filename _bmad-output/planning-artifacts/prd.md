---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-02b-vision', 'step-02c-executive-summary', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish', 'step-12-complete']
status: complete
completedAt: '2026-02-18'
inputDocuments: ['product-brief-AI-Comic-Studio-2026-02-18.md']
workflowType: 'prd'
documentCounts:
  briefs: 1
  research: 0
  brainstorming: 0
  projectDocs: 0
classification:
  projectType: 'Web App + Task Orchestration Platform'
  domain: 'Creative/Media Production'
  complexity: 'Medium-High'
  projectContext: 'brownfield'
  developmentMode: 'Solo + AI-assisted'
  techConstraints: 'Full TypeScript monolith, SQLite, minimal stack, incremental frontend refactor'
  p0Milestones: 'alpha (backend+auth+script+storyboard) → beta (image models) → release (video models)'
---

# Product Requirements Document - AI-Comic-Studio

**Author:** M
**Date:** 2026-02-18

## Executive Summary

AI-Comic-Studio（梦境AI短剧平台）是一个面向短剧工作室内部使用的全栈 Web 应用 + 异步任务编排平台。平台将剧本导入、AI 分镜拆解与提示词生成、多模型图片生成、多模型视频生成整合为一条完整的生产流水线，通过自有后端服务代理所有 AI 模型 API 调用，让工作室完全掌控模型选择和成本。

目标用户为工作室内部 5 人全流程制作团队（未来扩展到几十人），分为老手（自主调优提示词）和新手（依赖平台自动生成的提示词）两个层级，以及兼任管理职责的工作室负责人。核心目标是将人均日产能从 1 分钟成片提升到 2 分钟，消除跨平台工具碎片化带来的效率损失。

### What Makes This Special

现有一站式平台（橙星梦工厂、星月梦AI）覆盖了全流程但无法接入自有 API；自行组合工具可以自由选择模型但效率极低。AI-Comic-Studio 用自有后端 + 统一模型适配层同时解决"流程便利"和"模型自由"的矛盾——这是市面上没有的组合。

作为工作室内部工具而非市场化 SaaS，平台可以完全按实际工作流定制，不需要兼顾通用性。技术栈极简（全 TypeScript 单体架构 + SQLite），由负责人 + AI 辅助开发和维护，零运维负担。

## Project Classification

- **Project Type:** Web App + Task Orchestration Platform（React 前端 + Node.js 后端单体架构）
- **Domain:** Creative/Media Production
- **Complexity:** Medium-High（4个外部 AI 模型 API 集成、异步任务状态管理、前端 brownfield 改造）
- **Project Context:** Brownfield（已有前端 UI 原型，保留风格，增量完善功能 + 新增后端服务）
- **Development Mode:** Solo + AI-assisted
- **Tech Stack:** TypeScript / React + Vite / Node.js + Express / SQLite / Prisma or Drizzle
- **P0 Milestones:** alpha（后端骨架+登录+剧本导入+分镜拆解）→ beta（Nanobanana+即梦图片生成）→ release（Seedance+Sora视频生成，5人上线）

## Success Criteria

### User Success

- **无缝切换：** 生成结果不满意时，用户可立即切换模型或手动上传替代素材，零等待
- **快速反馈：** 提交生成任务后 10 秒内看到"已提交"状态反馈
- **提示词开箱即用：** 新手直接使用平台自动生成的提示词即可开始工作
- **老手效率提升：** 调优后的提示词可沉淀复用，不用每次从零开始

### Business Success

- **P0-alpha 2周跑通：** 后端骨架+登录+剧本导入+分镜拆解（含 Gemini API 后端代理）
- **P0-beta 再2周：** 图片生成模型接入
- **P0-release 再2周：** 视频生成模型接入，5人全部迁移上线
- **总计约6周完成 MVP 上线**
- **6个月人均日产能达到 2 分钟成片**

### Technical Success

- **API 容错机制：** 第三方 API 频繁报错时自动提醒，后台可手动切换到其他平台，前台同时展示多个模型供用户自选
- **模型适配层可扩展：** 新增第三方 API 只需编写适配器，新模型接入时间 ≤ 1天
- **多模型接入：** 持续接入更多第三方图片/视频生成 API，不局限于初始 4 个
- **任务状态可见：** 所有异步任务状态实时可见（待处理/生成中/已完成/失败）
- **现有代码真实接入：** `breakdownScriptToPanels` 函数在 P0-alpha 阶段真实接入 Gemini 后端代理，替换模拟数据

### Measurable Outcomes

| 指标 | 目标值 | 衡量方式 |
|------|--------|---------|
| 人均日产能 | ≥2分钟成片 | 平台内统计 |
| 平台内流程完成率 | 100% | 全流程无需跳转外部工具 |
| 分镜提示词可用率 | ≥80% | AI 自动生成的提示词可直接使用或仅需微调 |
| 任务提交反馈时间 | ≤10秒 | 从点击生成到看到状态反馈 |
| 模型切换/上传替代 | 即时 | 生成失败后零等待切换方案 |
| 新模型接入时间 | ≤1天 | 编写适配器到可用的时间 |

## User Journeys

### Journey 1：老手制作者 — 小王的一天（Success Path）

**Opening Scene：** 早上9点，小王打开 AI-Comic-Studio，登录自己的账号。今天要完成《重生之都市逆袭》第5-8集的分镜图片和视频。他进入项目页面，看到负责人 M 昨天已经导入了剧本并完成了分镜拆解，每个分镜都带着 AI 自动生成的提示词。

**Rising Action：** 小王从第5集第1个分镜开始。他扫了一眼自动生成的提示词——描述的是男主角在办公室里被嘲笑的场景。提示词大体可用，但他觉得"办公室"的描述不够具体，手动加了"现代简约风格的开放式办公区，落地窗，城市天际线背景"。选择即梦模型，点击生成，不等结果，直接跳到第2个分镜继续调提示词。

几分钟后，第1个分镜的图片生成完成，通知弹出。小王回来检查——人物表情不对，太夸张了。他微调提示词，这次换 Nanobanana 试试。第二次生成的效果满意，他确认这张图，继续用它生成视频。视频提交给 Seedance，又继续处理下一个分镜。

**Climax：** 到了第7集有一个高难度场景——男主角在雨中奔跑的慢镜头。AI 连续三次生成的效果都不理想。小王果断切换到 Sora 试了一次，效果好了很多。他把这个场景的提示词保存到知识库，标注"雨中慢镜头用 Sora 效果最好"。

**Resolution：** 下午5点，小王完成了4集共48个分镜的图片和视频。比以前用多个平台跳转快了将近一倍。他在平台内粗剪预览了一遍，标记全部完成。

### Journey 2：新手制作者 — 小林的第一周（Onboarding Path）

**Opening Scene：** 小林刚加入工作室，今天是第一天用 AI-Comic-Studio。M 给他分配了一个简单项目——《甜蜜陷阱》第1-3集。他登录后看到项目已经建好，剧本已导入，分镜已拆解，每个分镜都有 AI 自动生成的提示词。

**Rising Action：** 小林不太懂提示词，但他发现自动生成的提示词已经很详细了——角色描述、场景描述、镜头角度都有。他直接点击"生成图片"，选了默认推荐的模型。第一张图出来了，效果还不错，他松了一口气。

第3个分镜生成的图片里，女主角的发型和前两个分镜不一样。小林不知道怎么调，问了旁边的老手小王。小王告诉他："你在提示词里加上'黑色长直发，齐刘海'就行。"小林照做，重新生成，这次一致了。

**Climax：** 到了一个室外场景，AI 怎么都生成不出满意的效果。小林有点慌，但他发现平台有"上传替代"按钮。他用手机拍了一张参考照片上传，流水线没有中断，继续往下走。

**Resolution：** 第一天小林完成了2集，虽然比老手慢，但整个流程他一个人走通了，没有被卡住。他觉得"这个平台比想象的好上手"。

### Journey 3：工作室负责人 M — 管理与制作的双重角色

**Opening Scene：** 早上8点半，M 先处理管理工作。他打开平台，查看昨天的整体进度——5个人各自负责的项目进展如何。（P2 功能，MVP 阶段通过项目列表手动查看）

**Rising Action：** M 收到一个新剧本《穿越之医妃天下》，他在平台里创建新项目，上传 txt 格式的剧本文件。点击"分镜拆解"，AI 一步生成了完整的分镜表和提示词。M 快速浏览了一遍拆解结果，调整了几个分镜的切分点——有两个地方 AI 把一个长镜头拆成了三个快切，不符合他的叙事意图。

调整完毕后，M 把第1-5集分配给小王，第6-10集分配给小林。（MVP 阶段通过口头/消息分配，P2 阶段平台内分配）

**Climax：** 下午 M 自己也要做制作。他进入自己负责的《都市修仙》项目，发现 Nanobanana 的 API 从中午开始频繁报错。平台弹出了提醒。M 进入后台，临时把默认图片模型切换到即梦，通知团队先用即梦。

**Resolution：** 晚上 M 检查了一下今天的产出——5个人总共完成了约7分钟成片，比上个月用多平台跳转时的5分钟提升了40%。

### Journey 4：系统管理员 — M 的后台管理（Admin Path）

**Opening Scene：** 周末，M 需要接入一个新的图片生成模型——团队发现了一个效果不错的新平台。

**Rising Action：** M 进入后台管理页面，在"模型管理"里配置新模型的 API 地址、API Key 和调用参数。然后 M + AI 编写该模型的适配器代码，实现统一接口。

**Climax：** 适配器代码部署后，M 在后台用一个测试提示词验证新模型是否正常工作。生成成功，效果不错。他把新模型设为"可用"，前台用户立即可以在模型列表中看到并选择它。

**Resolution：** 整个过程不到1天。团队第二天就开始用新模型了。

### Journey 5：外部合作方/兼职导演 — 受限访问（Edge Case）

**Opening Scene：** M 聘请了一位兼职导演老赵来指导一个新项目的分镜风格。老赵需要查看分镜拆解结果并提出修改意见。

**Rising Action：** M 为老赵创建了一个 user 角色账号（无法访问后台管理页面）。老赵登录后进入指定项目，查看分镜表和已生成的图片。

**Climax：** 老赵觉得第3集的镜头节奏太快，建议合并两个分镜。他直接在平台里调整了分镜拆解，修改了提示词描述。

**Resolution：** 制作者看到老赵的修改后，按新的分镜重新生成图片。整个沟通在平台内完成，不需要来回发微信截图。

### Journey 6：系统故障恢复（Failure Recovery Path）

**Opening Scene：** 下午3点，后端服务因为内存溢出意外重启。此时有3个制作者正在使用平台，共有12个图片生成任务和5个视频生成任务在进行中。

**Rising Action：** 服务重启后，用户刷新页面重新登录。所有项目数据、分镜数据、已生成的图片和视频都完好——因为数据存在 SQLite 数据库和本地文件系统中，不受进程重启影响。

**Climax：** 重启前正在进行中的17个生成任务状态显示为"失败"（因为回调丢失）。用户可以一键重新提交这些失败的任务。

**Resolution：** 5分钟内所有人恢复正常工作，没有数据丢失，只需要重新提交中断的任务。

### Journey Requirements Summary

#### MVP 必须有（没有就跑不通）

- 文件上传组件（剧本导入 txt/docx）
- 分镜拆解真实渲染（替换模拟数据）
- 异步任务状态展示（待处理/生成中/已完成/失败）
- 多模型选择（前台展示多个模型供用户自选）
- admin/user 角色区分 + 后台权限守卫
- 数据持久化（SQLite + 本地文件系统，重启不丢失）
- 文件存储抽象层（MVP 用本地文件系统 `uploads/`，代码抽象成接口）
- 后端 HTTP 请求支持代理配置

#### MVP 应该有（体验明显更好）

- 分镜状态筛选和快速跳转
- API 错误基础分类（超时/报错/成功）
- 项目内分镜历史可见（支持项目交接）

#### P1 再做（锦上添花）

- 精确错误提示（余额不足/模型繁忙等细分）
- 提示词角色描述高亮
- 知识库沉淀

#### 技术需求

- 关键架构决策和接口规范文档化（`docs/architecture.md`），支撑 AI 辅助开发

## Innovation & Novel Patterns

### Detected Innovation Areas

**智能项目初始化：** 导入剧本后，AI 一步完成分镜拆解 + 提示词生成 + 角色外貌描述提取 + 场景风格板生成。相比竞品仅做分镜拆解，AI-Comic-Studio 的初始化深度更深，自动完成了"前期策划"的工作，减少制作者手动整理角色和场景信息的时间。

### Validation Approach

- P0-alpha 阶段验证：分镜拆解时同步提取角色和场景信息，检查提取准确率
- 用户反馈：制作者是否减少了手动补充角色/场景描述的次数

### Risk Mitigation

- AI 提取的角色/场景信息可能不准确 → 支持手动编辑修正
- 不增加额外的 API 调用成本 → 复用分镜拆解的同一次 AI 调用，在 prompt 中要求同时输出角色和场景信息

## Web App Specific Requirements

### Project-Type Overview

全栈单体 Web 应用，SPA 架构（React + Vite），纯桌面使用。内部工具优先，后续可能需要 SEO 支持。

### Technical Architecture Considerations

**前端架构：**
- SPA（Single Page Application），保留现有 React + Vite 架构
- 浏览器支持：Chrome、Edge（最新2个主版本）
- 纯桌面端，不需要响应式移动端适配
- 引入 Zustand 做轻量全局状态管理
- 引入 shadcn/ui 组件库（基于 Tailwind，和现有代码风格一致，AI 生成质量高）
- 后续可能需要 SEO → 架构预留 SSR/SSG 迁移空间（但 MVP 不做）

**实时通信：**
- 使用 socket.io（自带断线重连 + fallback to long polling）
- WebSocket 事件发布/订阅通过 EventEmitter 解耦，预留未来 Redis pub/sub 迁移
- WebSocket 连接在 App 层建立，通过 Zustand store 分发状态更新
- 所有状态变更同时提供 REST 轮询接口作为 fallback（`GET /api/v1/tasks/:id/status`）

**后端架构：**
- Node.js + Express + TypeScript 单体服务
- SQLite + Drizzle ORM（轻量、AI 友好、SQLite 原生支持）
- 本地文件系统存储（抽象接口，未来可迁移到对象存储）
- 统一模型适配层（适配器模式）
- HTTP 请求代理配置支持

**认证系统：**
- JWT 或 Session 基础认证
- admin / user 两个角色
- admin 可访问后台管理（模型配置、API Key、用户管理）
- user 只能访问制作功能

**预留扩展：**
- 数据库用户表预留 `organization_id` 字段，未来支持多工作室
- API 路由统一使用版本号前缀 `/api/v1/`

**技术栈确定：**
- 前端：React + Vite + Zustand + Tailwind CSS + shadcn/ui + TypeScript
- 后端：Node.js + Express + socket.io + TypeScript
- 数据库：SQLite + Drizzle ORM
- 部署：单机，单进程

### Implementation Considerations

**MVP 前端改造策略：**
- 增量改造，不大规模重构现有组件
- 新功能加新文件，旧功能逐步替换模拟数据
- 新增：文件上传组件、WebSocket 状态推送、分镜状态筛选

**部署方式：**
- 单机部署，一条命令启动
- MVP 不需要 Docker/K8s

**docs/architecture.md 内容清单（支撑 AI 辅助开发）：**
1. 技术栈清单
2. 目录结构约定（前端 `src/`，后端 `server/`，共享类型 `shared/`）
3. API 路由约定（`/api/v1/` 前缀，RESTful 风格）
4. 数据库 schema 概览（核心表：users, projects, episodes, panels, tasks）
5. 模型适配器接口定义（输入/输出格式）

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Problem-Solving MVP — 用最短路径跑通"剧本→分镜→图片→视频"的完整链路，让5人团队迁移到平台内工作，验证产能提升假设。

**Resource Requirements:** 1人（M）+ AI 辅助开发，6周交付。

### MVP Feature Set (Phase 1)

**Core User Journeys Supported：**
- Journey 1（老手 Success Path）：完整支持
- Journey 2（新手 Onboarding）：基本支持（无知识库，但提示词开箱即用）
- Journey 3（负责人双重角色）：部分支持（项目创建/剧本导入/分镜拆解/API 切换，无仪表盘）
- Journey 4（系统管理员）：基本支持（后台模型配置+风格模板管理，适配器需开发者编写）
- Journey 5（外部合作方）：基本支持（user 角色账号，无细粒度权限）
- Journey 6（故障恢复）：完整支持（数据持久化，任务可重新提交）

**Must-Have Capabilities：**

| 阶段 | 时间 | 交付内容 |
|------|------|---------|
| P0-alpha | 第1-2周 | 后端骨架 + Drizzle/SQLite + JWT认证(admin/user) + 后台风格模板管理（动漫风、真人电影等，每套含各步骤提示词）+ 剧本导入(txt/docx) + AI分镜拆解+提示词+角色提取+场景风格板(Gemini后端代理，非流式) + 创建项目时选择风格模板 + 前端对接API替换mock + 文件上传组件 + API可用性预验证（4个API手动验证） |
| P0-beta | 第3-4周 | Nanobanana适配器 + 即梦适配器 + 异步任务状态管理 + socket.io实时推送 + REST轮询fallback + 前台多模型选择 |
| P0-release | 第5-6周 | Seedance适配器 + Sora适配器 + API报错提醒+后台模型切换 + 手动上传替代素材 + 分镜状态筛选 + 5人上线 |

**MVP Should-Have（尽量在6周内完成）：**
- 分镜状态筛选和快速跳转
- API 错误基础分类（超时/报错/成功）
- 项目内分镜历史可见

**MVP 验收标准：**
- 5人全部迁移到平台内工作
- 剧本→分镜+提示词→图片→视频完整链路跑通
- 4个模型全部可正常调用
- 角色/场景自动提取准确率 ≥ 70%
- 分镜提示词可用率 ≥ 80%

### Post-MVP Features

**Phase 2 — Growth（第7-16周，按优先级排序）：**

| 优先级 | 功能 | 价值 |
|--------|------|------|
| 1 | 批量任务队列 | 规模化生产，架构级改动 |
| 2 | 接入更多第三方 API | 扩展模型选择 |
| 3 | 角色一致性锁定 | 解决核心痛点 |
| 4 | 提示词知识库 | 老带新，经验沉淀 |
| 5 | 多模型对比生成 | 快速试错 |
| 6 | 平台内粗剪预览 | 减少导出环节 |
| 7 | AI 辅助剧本创作 | 扩展上游能力 |
| 8 | Gemini 流式响应优化 | 分镜拆解体验提升 |
| - | 精确错误提示 | 用户自助排障 |
| - | 提示词角色描述高亮 | 新手体验 |

**Phase 3 — Expansion（第17周+）：**
- 项目仪表盘（进度追踪、成本统计、团队产出可视化）
- 细粒度权限管理（按角色分配）
- 多工作室支持（`organization_id`）
- SSR/SSG 迁移（SEO 支持）
- 支撑团队扩展到几十人

### Risk Mitigation Strategy

**Technical Risks：**

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| 第三方 API 不稳定/频繁改接口 | 生成功能中断 | 模型适配层隔离变更；多模型可切换；API 报错提醒 |
| WebSocket 连接不稳定 | 状态更新延迟 | REST 轮询 fallback；socket.io 自动重连 |
| AI 生成代码质量不稳定 | 开发进度受阻 | docs/architecture.md 提供上下文；极简技术栈；增量改造 |
| 前端 brownfield 改造踩坑 | 改造工作量超预期 | 增量添加不重构；新功能新文件；Zustand 解耦状态 |
| API 可用性问题（企业认证/地区限制） | 无法接入某个模型 | P0-alpha 末尾预验证4个API；提前发现问题 |

**Resource Risks：**

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| 6周时间不够 | MVP 延期 | P0 三阶段各自可独立交付；alpha 跑通即可内部试用 |
| M 精力有限 | 开发速度慢 | AI 辅助开发提效；极简架构降低维护成本 |

## Functional Requirements

### 用户管理

- FR1: 用户可以注册账号并登录平台
- FR2: 管理员可以创建、编辑、禁用用户账号
- FR3: 系统区分 admin 和 user 两种角色，限制 user 访问后台管理功能
- FR4: 用户可以修改自己的密码

### 项目管理

- FR5: 用户可以创建新项目，选择风格模板，并在项目内创建和管理集数（episodes）
- FR6: 用户可以查看自己参与的所有项目列表
- FR7: 用户可以进入项目的某一集，查看该集所有分镜及其当前状态（待处理/生成中/已完成/失败）
- FR8: 用户可以按状态筛选和快速跳转分镜
- FR9: 项目内所有分镜的状态和生成历史对任何项目成员可见
- FR38: 管理员可以删除项目，用户可以归档项目

### 剧本管理

- FR10: 用户可以上传 txt 或 docx 格式的剧本文件到项目中
- FR11: 用户可以在平台内查看和编辑已导入的剧本内容

### 智能分镜拆解

- FR12: 用户可以对某一集执行 AI 分镜拆解，一步生成分镜表、图片提示词、视频提示词
- FR13: AI 分镜拆解时自动提取角色外貌描述和场景风格板
- FR14: 分镜拆解使用项目所选风格模板中的对应提示词
- FR15: 用户可以手动调整分镜的拆分点（合并/拆分分镜）
- FR16: 用户可以手动编辑任意分镜的提示词
- FR17: 用户可以手动编辑 AI 提取的角色描述和场景信息

### 图片生成

- FR18: 用户可以为任意分镜选择图片生成模型（Nanobanana、即梦等）
- FR19: 用户可以提交分镜图片生成任务，10秒内看到"已提交"状态反馈
- FR20: 图片生成任务异步执行，状态实时推送到前端（待处理/生成中/已完成/失败）
- FR21: 用户可以查看已生成的图片结果
- FR22: 用户可以对不满意的结果立即切换模型重新生成
- FR23: 用户可以手动上传图片替代 AI 生成失败的分镜

### 视频生成

- FR24: 用户可以为任意分镜选择视频生成模型（Seedance、Sora 等）
- FR25: 用户可以基于分镜图片和提示词提交视频生成任务
- FR26: 视频生成任务异步执行，状态实时推送到前端
- FR27: 用户可以查看已生成的视频结果
- FR28: 用户可以对不满意的结果立即切换模型重新生成
- FR29: 用户可以手动上传视频替代 AI 生成失败的分镜

### 预览

- FR39: 用户可以按分镜顺序预览一集内所有已生成的图片和视频（顺序播放）

### 后台管理

- FR30: 管理员可以管理风格模板（创建、编辑、删除），每套模板包含分镜拆解、图片生成、视频生成的提示词
- FR31: 管理员可以管理 AI 模型配置（添加、编辑、启用/禁用模型，配置 API 地址和 Key）
- FR32: 管理员可以在模型频繁报错时切换默认模型
- FR33: 系统在第三方 API 频繁报错时自动提醒管理员

### 任务与状态管理

- FR34: 所有异步生成任务的状态通过 WebSocket 实时推送，同时提供 REST 轮询接口作为 fallback
- FR35: 用户可以对失败的任务一键重新提交
- FR36: 系统重启后所有任务状态和已生成素材不丢失
- FR37: 系统对 API 错误进行基础分类（超时/报错/成功），展示给用户

## Non-Functional Requirements

> NFR 按主要关注领域分类，部分 NFR 可能跨越多个领域。

### Performance

- NFR1: 用户提交生成任务后，≤10秒内收到"已提交"状态反馈 [MVP]
- NFR2: WebSocket 状态推送延迟 ≤3秒（从后端收到第三方回调到前端展示）[MVP]
- NFR3: 分镜列表页面加载 ≤2秒（含状态渲染，100个分镜以内）[MVP]
- NFR4: 剧本导入和分镜拆解的 AI 调用，前端需展示加载状态，不阻塞其他操作 [MVP]
- NFR5: 5个用户同时操作时，页面响应时间不超过单用户时的2倍 [MVP]

### Security

- NFR6: 所有 API Key 存储在后端，不暴露给前端 [MVP]
- NFR7: 用户密码使用 bcrypt 或同等强度算法加密存储 [MVP]
- NFR8: JWT token 设置合理过期时间，支持刷新 [MVP]
- NFR9: 后台管理页面仅 admin 角色可访问，路由级别拦截 [MVP]
- NFR10: 第三方 API 调用通过后端代理，前端无法直接访问外部 API [MVP]

### Integration

- NFR11: 模型适配层提供统一接口，新模型接入 ≤1天（编写适配器代码）[MVP]
- NFR12: 第三方 API 调用支持 HTTP 代理配置 [MVP]
- NFR13: 第三方 API 提交请求的超时阈值可配置（默认30秒），生成结果通过异步回调获取，无超时限制 [MVP]
- NFR14: 第三方 API 调用失败时，系统记录错误日志，支持排查 [MVP]
- NFR15: 文件存储通过抽象接口实现，MVP 使用本地文件系统，未来可迁移到对象存储 [MVP]

### Reliability

- NFR16: 系统重启后所有数据不丢失（SQLite + 本地文件持久化）[MVP]
- NFR17: WebSocket 断线后自动重连，同时 REST 轮询接口可用作 fallback [MVP]
- NFR18: 失败的生成任务可一键重新提交，不需要重新填写参数 [MVP]
- NFR19: SQLite 数据库文件每日自动备份，保留最近7天 [P1，MVP手动备份]

### Observability

- NFR20: 系统关键操作（用户登录、任务提交、API 调用、错误）记录到日志文件，按天轮转，保留最近30天 [P1，MVP先写日志文件]

### Scalability

- NFR21: 当并发用户超过20人且出现写入瓶颈时，Drizzle ORM 支持无缝迁移到 PostgreSQL [P1，预留]

### UX Consistency

- NFR22: 所有异步操作使用统一的加载状态组件和反馈模式（loading spinner、success toast、error toast）[MVP]
