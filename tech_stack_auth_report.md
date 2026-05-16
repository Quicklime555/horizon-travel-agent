# Horizon Travel Agent - 技术选型与鉴权现状报告

本文档旨在为后续 AI 助手提供本项目的技术栈背景及身份验证（Auth）功能的当前实现状态，以便进行更深入的登录功能开发或调整。

## 1. 项目概览与技术选型

本项目是一个名为 **Horizon Travel Agent** 的 AI 驱动智能旅行规划平台，采用前后端分离架构，核心技术栈如下：

### 1.1 前端 (Frontend)
- **核心框架**: React 19 + TypeScript + Vite 6
- **路由管理**: React Router DOM v7
- **样式与UI**: TailwindCSS v4 + `clsx`/`tailwind-merge` + Lucide React (图标)
- **动画库**: Framer Motion (`motion/react` v12)
- **状态管理与数据请求**: TanStack React Query v5 + Axios
- **构建目标**: SPA (单页应用)

### 1.2 后端 (Backend)
- **运行环境**: Node.js + Express
- **语言**: TypeScript (`tsx` 运行)
- **主要职责**: 处理 AI Agent 编排任务（对接大模型），以及处理第三方 OAuth（如微信）的定制化回调。

### 1.3 数据库与鉴权 (BaaS)
- **核心服务**: **Supabase** (涵盖 PostgreSQL 数据库、行级安全 RLS、以及 Auth 身份验证)

---

## 2. 鉴权 (Auth) 现状分析

目前项目已通过 Supabase Auth 建立了一套基础且可扩展的身份验证闭环。

### 2.1 数据库架构设计 (`supabase_schema.sql`)
1. **基础用户表**: 依赖 Supabase 托管的 `auth.users` 表。
2. **扩展信息表 (`profiles`)**: 
   - 在 `public` 架构下建立 `profiles` 表，通过 `id` 外键关联 `auth.users(id)`。
   - 包含字段：`email`, `full_name`, `avatar_url`, `wechat_openid`, `wechat_unionid`, `role` (默认 'user')。
   - **自动化同步**: 部署了 PostgreSQL Trigger (`handle_new_user`)，当 `auth.users` 插入新数据时，自动向 `profiles` 写入对应记录。

### 2.2 前端状态管理 (`src/contexts/AuthContext.tsx`)
- 封装了 `<AuthProvider>`，提供全局共享的 `user`, `session`, `loading`, `userRole` 状态。
- **角色获取**: 登录成功后，会自动查询 `profiles` 表获取该用户的真实 `role` (如 `user` 或 `admin`)。
- **状态监听**: 依赖 `supabase.auth.onAuthStateChange` 自动捕获登录、登出及 URL Hash 中的 Token（用于处理 Magic Link 回调）。

### 2.3 登录页与基础流程 (`src/views/LoginPage.tsx`)
- **常规登录/注册**: 已通过 Supabase 提供的 `signInWithPassword` 和 `signUp` 实现完整的邮箱/密码体系。
- **游客模式**: 规划页 (`/planner`) 允许未登录用户访问，但在触发“生成行程”操作时，会弹出自定义的 Login Prompt Modal 引导用户前往 `/login`。

### 2.4 第三方登录（微信接入状态）
目前已为微信登录做好了前后端基础链路：
- **前端发起**: 点击微信按钮会请求 Node.js 后端获取微信扫码 URL，并进行 `window.location.href` 重定向。
- **后端回调 (`server/routes/authRoutes.ts`)**:
  - 提供 `/api/auth/wechat/callback` 接收微信的 `code`。
  - 后端通过 axios 换取微信的 `access_token` 和 `openid`。
  - 使用 Supabase Admin SDK (`SUPABASE_SERVICE_ROLE_KEY`) 在后端查询 `profiles`。
  - 如果是新用户，后端直接调用 `admin.createUser` 注册，并更新 `profiles` 表。
  - **会话转移**: 后端最终调用 `admin.generateLink({ type: 'magiclink' })` 生成登录链接，并将浏览器重定向回前端，前端由 Supabase SDK 接管并确立登录态。

---

## 3. 核心环境变量配置 (`.env`)

```env
# Supabase 前端使用
VITE_SUPABASE_URL=xxx
VITE_SUPABASE_ANON_KEY=xxx
VITE_API_URL=http://localhost:3001

# Supabase 后端特权使用
SUPABASE_URL=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# 微信 OAuth (待填入真实数据)
WECHAT_APP_ID=xxx
WECHAT_APP_SECRET=xxx
WECHAT_REDIRECT_URI=http://localhost:3001/api/auth/wechat/callback
FRONTEND_URL=http://localhost:3000
```

---

## 4. 后续 AI 开发指南（提供给 AI 的建议）

如果您是接手后续登录功能优化的 AI，请注意以下几点：
1. **UI 一致性**: `LoginPage` 使用了强烈的玻璃拟物 (Glassmorphism) 和流光背景动画，请在添加新元素时保持 Tailwind 类的风格统一。
2. **Supabase 优先**: 尽量使用前端 Supabase JS SDK 解决问题。对于微信这种国内特有且 Supabase 官方暂未直接支持的服务，请继续完善 `server/routes/authRoutes.ts` 中的定制化 OAuth 桥接逻辑。
3. **角色鉴权**: `RequireAuth` 组件已被用于保护敏感路由（如 `/history` 和 `/admin`）。如需控制视图权限，请使用 `useAuth` 中的 `userRole`。
4. **异常处理**: 处理 Auth 时，务必捕获 Supabase 返回的 `Error` 对象，并翻译为友好的中文提示给到前端。
