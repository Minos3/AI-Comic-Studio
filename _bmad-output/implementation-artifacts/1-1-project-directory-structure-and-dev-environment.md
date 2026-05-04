# Story 1.1: Project Directory Structure and Dev Environment

Status: ready-for-dev

## Story

As a 开发者,
I want 一个完整的前后端目录结构和开发脚本,
so that 我可以立即开始编写业务代码。

## Acceptance Criteria

1. 执行 `npm install && npm run dev` 后，Vite 前端 dev server 在 :3000 启动，Express 后端在 :3001 启动
2. Vite proxy 将 `/api` 和 `/socket.io` 请求转发到 :3001
3. `src/`, `server/`, `shared/types/` 目录结构已创建
4. `tsconfig.json` 和 `tsconfig.server.json` 配置完成，`@/*` 和 `@shared/*` 路径别名可用
5. `drizzle.config.ts` 配置完成
6. `package.json` 包含 `dev`, `build`, `preview` 脚本
7. `.env.example` 包含所有必需环境变量模板

## Tasks / Subtasks

- [ ] Task 1: 安装后端依赖和开发工具 (AC: #1, #6)
  - [ ] 1.1 安装 Express + socket.io + Drizzle + SQLite + bcrypt + jsonwebtoken 等运行时依赖
  - [ ] 1.2 安装 tsx + concurrently + @types/* 等开发依赖
  - [ ] 1.3 安装 Tailwind CSS + PostCSS + autoprefixer（替换 CDN）
  - [ ] 1.4 安装 shadcn/ui 依赖（tailwind-merge, clsx, class-variance-authority, lucide-react）
  - [ ] 1.5 安装 zustand, react-router-dom, axios, socket.io-client 前端依赖
- [ ] Task 2: 创建目录结构 (AC: #3)
  - [ ] 2.1 创建 `src/` 及子目录：`components/ui/`, `components/layout/`, `components/common/`, `features/`, `lib/`, `styles/`
  - [ ] 2.2 创建 `server/` 及子目录：`routes/`, `services/`, `adapters/`, `db/`, `storage/`, `middleware/`, `socket/`, `utils/`
  - [ ] 2.3 创建 `shared/types/`
  - [ ] 2.4 创建 `data/`, `uploads/`, `public/`
- [ ] Task 3: 迁移前端入口文件 (AC: #1)
  - [ ] 3.1 移动 `index.tsx` → `src/main.tsx`，更新 import 路径
  - [ ] 3.2 移动 `App.tsx` → `src/App.tsx`（保留现有内容，仅更新 import 路径）
  - [ ] 3.3 更新 `index.html`：script src 改为 `/src/main.tsx`，移除 CDN Tailwind script 和 importmap，移除 inline tailwind config 和 style
  - [ ] 3.4 创建 `src/styles/globals.css`（Tailwind 指令 + 自定义滚动条样式 + 暗色主题基础样式）
  - [ ] 3.5 创建 `tailwind.config.ts`（迁移 index.html 中的 inline tailwind config：primary, secondary, dark 颜色，Inter 字体）
  - [ ] 3.6 创建 `postcss.config.js`
- [ ] Task 4: TypeScript 配置 (AC: #4)
  - [ ] 4.1 更新 `tsconfig.json`：添加 `@shared/*` 路径别名，更新 include 范围
  - [ ] 4.2 创建 `tsconfig.server.json`：extends base，target Node，include `server/**/*` 和 `shared/**/*`
- [ ] Task 5: Vite 配置更新 (AC: #2, #4)
  - [ ] 5.1 更新 `vite.config.ts`：添加 `@shared` alias，添加 proxy 配置（`/api` → :3001, `/socket.io` → :3001 ws），移除 `process.env.API_KEY` define（API key 将迁移到后端）
  - [ ] 5.2 配置 CSS 入口指向 `src/styles/globals.css`
- [ ] Task 6: Drizzle 配置 (AC: #5)
  - [ ] 6.1 创建 `drizzle.config.ts`：driver sqlite，schema `server/db/schema.ts`，out `server/db/migrations`，dbCredentials 指向 `data/aics.db`
- [ ] Task 7: 后端入口骨架 (AC: #1)
  - [ ] 7.1 创建 `server/index.ts`：最小 Express 启动，监听 :3001，console.log 启动信息
  - [ ] 7.2 创建 `server/app.ts`：空 Express app 配置（JSON body parser, CORS），挂载一个 placeholder `GET /api/v1/health` 返回 `{ success: true, data: { status: "ok" } }`
- [ ] Task 8: package.json 脚本更新 (AC: #1, #6)
  - [ ] 8.1 更新 `dev` 脚本为 `concurrently "vite" "tsx watch server/index.ts"`
  - [ ] 8.2 更新 `build` 脚本为 `vite build`（不变）
  - [ ] 8.3 添加 `dev:server` 脚本为 `tsx watch server/index.ts`
  - [ ] 8.4 添加 `dev:client` 脚本为 `vite`
  - [ ] 8.5 添加 `db:generate` 脚本为 `drizzle-kit generate`
  - [ ] 8.6 添加 `db:migrate` 脚本为 `drizzle-kit migrate`
- [ ] Task 9: 环境变量与 gitignore (AC: #7)
  - [ ] 9.1 创建 `.env.example`：列出 `PORT=3001`, `DATABASE_URL=./data/aics.db`, `JWT_SECRET=`, `GEMINI_API_KEY=`, `HTTP_PROXY=`
  - [ ] 9.2 更新 `.gitignore`：添加 `data/`, `uploads/`
- [ ] Task 10: 创建 shared types 骨架
  - [ ] 10.1 创建 `shared/types/index.ts`（空导出）
  - [ ] 10.2 创建 `shared/types/api.types.ts`（统一响应格式类型：`ApiResponse<T>`, `ApiError`）
- [ ] Task 11: 验证
  - [ ] 11.1 运行 `npm install` 无报错
  - [ ] 11.2 运行 `npm run dev` 前后端同时启动
  - [ ] 11.3 浏览器访问 `http://localhost:3000` 看到现有前端页面（可能有样式差异，因为 Tailwind 从 CDN 迁移到本地）
  - [ ] 11.4 访问 `http://localhost:3000/api/v1/health` 通过 proxy 返回 health 响应
  - [ ] 11.5 TypeScript 编译无错误

## Dev Notes

### Critical Migration Points

1. **index.html 改动最敏感：** 移除 CDN Tailwind + importmap 后，现有组件的样式依赖全部转移到本地 Tailwind。必须确保 `tailwind.config.ts` 完整迁移了 inline config 中的自定义颜色（primary: #6366f1, secondary: #a855f7, dark.900/800/700）和字体（Inter）。

2. **importmap 必须移除：** 当前 `index.html` 有 importmap 将 react/react-dom/@google/genai 指向 esm.sh CDN。这与 node_modules 冲突。移除后 Vite 会从 node_modules 解析这些包。

3. **`process.env.API_KEY` define 必须移除：** 当前 vite.config.ts 将 GEMINI_API_KEY 注入到客户端 bundle。这是安全隐患（NFR6）。移除后，geminiService.ts 会暂时无法工作——这是预期的，将在 Story 4.2 迁移到后端。

4. **现有组件暂不迁移：** `components/`, `services/`, `types.ts` 保留在根目录。`src/App.tsx` 暂时 import 根目录的组件（`@/components/...`）。文件迁移在后续 Story 中按需进行。

5. **路径别名变更：** `@/*` 当前指向项目根（`.`），保持不变。新增 `@shared/*` 指向 `./shared/*`。

### Architecture Compliance

- **统一响应格式：** `{ success: true, data }` / `{ success: false, error: { code, message } }` [Source: architecture.md#Format Patterns]
- **命名规范：** 后端文件 `xxx.routes.ts`, `xxx.service.ts`；前端 PascalCase.tsx [Source: architecture.md#Naming Patterns]
- **开发模式：** concurrently 前端 :3000 + 后端 :3001，Vite proxy 转发 [Source: architecture.md#Development Workflow Integration]
- **路径别名：** `@/*` → 项目根, `@shared/*` → `./shared/*` [Source: architecture.md#Validation Issues Addressed]

### Package Versions (pin these)

```json
{
  "dependencies": {
    "react": "^19.2.3",
    "react-dom": "^19.2.3",
    "react-router-dom": "^7.5.0",
    "zustand": "^5.0.0",
    "axios": "^1.7.0",
    "socket.io-client": "^4.8.0",
    "express": "^4.21.0",
    "socket.io": "^4.8.0",
    "drizzle-orm": "^0.38.0",
    "better-sqlite3": "^11.7.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "cors": "^2.8.5",
    "multer": "^1.4.5-lts.1",
    "dotenv": "^16.4.0",
    "lucide-react": "^0.460.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.6.0",
    "class-variance-authority": "^0.7.0"
  },
  "devDependencies": {
    "typescript": "~5.8.2",
    "vite": "^6.2.0",
    "@vitejs/plugin-react": "^5.0.0",
    "@types/node": "^22.14.0",
    "@types/express": "^5.0.0",
    "@types/better-sqlite3": "^7.6.0",
    "@types/bcryptjs": "^2.4.0",
    "@types/jsonwebtoken": "^9.0.0",
    "@types/cors": "^2.8.0",
    "@types/multer": "^1.4.0",
    "tsx": "^4.19.0",
    "concurrently": "^9.1.0",
    "drizzle-kit": "^0.30.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

### Project Structure Notes

After this story, the project structure will be:

```
AI-Comic-Studio/
├── index.html                    # Updated: removed CDN, importmap; script → src/main.tsx
├── package.json                  # Updated: new deps + scripts
├── tsconfig.json                 # Updated: @shared/* alias
├── tsconfig.server.json          # NEW
├── vite.config.ts                # Updated: proxy, @shared alias, removed API_KEY define
├── drizzle.config.ts             # NEW
├── tailwind.config.ts            # NEW
├── postcss.config.js             # NEW
├── .env.example                  # NEW
├── .env.local                    # Existing (add new vars)
├── .gitignore                    # Updated: data/, uploads/
│
├── src/                          # NEW
│   ├── main.tsx                  # Migrated from index.tsx
│   ├── App.tsx                   # Migrated from root App.tsx
│   └── styles/
│       └── globals.css           # NEW: Tailwind directives + custom styles
│
├── server/                       # NEW (skeleton)
│   ├── index.ts
│   ├── app.ts
│   ├── routes/
│   ├── services/
│   ├── adapters/
│   ├── db/
│   ├── storage/
│   ├── middleware/
│   ├── socket/
│   └── utils/
│
├── shared/                       # NEW
│   └── types/
│       ├── index.ts
│       └── api.types.ts
│
├── data/                         # NEW (gitignored)
├── uploads/                      # NEW (gitignored)
├── public/                       # NEW
│
├── components/                   # EXISTING (not moved yet)
├── services/                     # EXISTING (not moved yet)
├── types.ts                      # EXISTING (not moved yet)
└── ...
```

### References

- [Source: architecture.md#Complete Project Directory Structure]
- [Source: architecture.md#Development Workflow Integration]
- [Source: architecture.md#Migration Notes]
- [Source: architecture.md#Validation Issues Addressed - 路径别名配置]
- [Source: epics.md#Story 1.1]

## Dev Agent Record

### Agent Model Used

(to be filled by dev agent)

### Debug Log References

### Completion Notes List

### File List
