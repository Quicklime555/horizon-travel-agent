<div align="center">

# 🌍 Horizon Travel AI

**AI 驱动的智能旅行行程规划平台**

基于 DeepSeek 大语言模型，自动生成结构化、可执行的多日旅行行程方案。

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646cff?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20DB-3ecf8e?logo=supabase)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## 项目简介

Horizon Travel AI 是一个全栈 AI 旅行规划应用，用户输入出发地、目的地、日期、预算和偏好后，系统通过 DeepSeek API 生成详细的逐日行程方案，包含景点、餐饮、交通和住宿安排，并自动进行预算分配。

本项目以开源形式发布，旨在为开发者提供一个可参考的 **AI Agent + 全栈应用** 实践模板，你可以在此基础上：
- 替换为其他 LLM 提供商（OpenAI、Claude、通义千问等）
- 扩展更多旅行相关功能（酒店预订、机票查询、地图集成）
- 学习 AI 结构化输出、重试机制、Prompt Engineering 的工程实践

---

## 核心功能

| 功能 | 描述 |
|------|------|
| 🤖 AI 行程生成 | 基于 DeepSeek API，通过精密 Prompt + JSON Schema 约束生成结构化行程 |
| 🔄 智能重试 | 内置双层校验（JSON 解析 + 字段完整性），失败自动重试，指数退避策略 |
| 📅 逐日规划 | 按天生成 4-7 个活动，包含时间、地点、费用估算、活动类型 |
| 💰 预算管理 | 自动按比例分配住宿/餐饮/交通预算，确保总额一致 |
| 🔐 用户认证 | 基于 Supabase Auth，支持邮箱注册/登录，内置 RBAC 角色管理 |
| 📊 行程历史 | 持久化存储所有生成的行程，支持查看历史记录 |
| 🎨 现代 UI | React 19 + TailwindCSS 4 + Framer Motion 动画，响应式设计 |
| 📤 行程导出 | 支持行程海报分享与导出预览 |
| 🛡️ 管理后台 | Admin Dashboard 查看 AI Agent 运行日志与系统状态 |

---

## 技术架构

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend                            │
│  React 19 · Vite 6 · TailwindCSS 4 · TanStack Query    │
│  React Router 7 · Framer Motion · Recharts              │
└────────────────────────┬────────────────────────────────┘
                         │ REST API
┌────────────────────────▼────────────────────────────────┐
│                      Backend                             │
│  Express.js · TypeScript · JWT Auth Middleware           │
└────────────────────────┬────────────────────────────────┘
                         │
          ┌──────────────┼──────────────┐
          ▼                             ▼
┌──────────────────┐          ┌──────────────────┐
│   DeepSeek API   │          │    Supabase      │
│  (AI 行程生成)    │          │  (Auth + DB)     │
└──────────────────┘          └──────────────────┘
```

### 技术栈详情

**前端**
- React 19 + TypeScript 5.8
- Vite 6（构建工具）
- TailwindCSS 4（样式）
- TanStack Query（服务端状态管理）
- React Router 7（路由）
- Framer Motion（动画）
- Recharts（数据可视化）
- Lucide React（图标）

**后端**
- Express.js + TypeScript
- Supabase JS SDK（数据库 + 认证）
- DeepSeek API（AI 行程生成）

**基础设施**
- Supabase（PostgreSQL + Auth + RLS）
- Docker + Docker Compose
- GitHub Actions CI

---

## 项目结构

```
horizon-travel-ai/
├── src/                        # 前端源码
│   ├── ai/                     # AI Agent 配置
│   │   ├── agent.ts            # 行程生成编排层（核心）
│   │   └── deepseekConfig.ts   # DeepSeek API 配置
│   ├── components/             # React 组件
│   │   ├── ui/                 # 通用 UI 组件（Button, DatePicker, Select）
│   │   ├── ActivityCard.tsx    # 活动卡片
│   │   ├── AgentLoader.tsx     # AI 生成加载动画
│   │   ├── ExportPreviewModal.tsx  # 导出预览
│   │   ├── FeedbackForm.tsx    # 用户反馈表单
│   │   ├── Navbar.tsx          # 导航栏
│   │   ├── SharePoster.tsx     # 分享海报
│   │   ├── TripCard.tsx        # 行程卡片
│   │   └── TripDetails.tsx     # 行程详情
│   ├── contexts/               # React Context
│   │   └── AuthContext.tsx     # 认证上下文
│   ├── services/               # API 服务层
│   │   ├── api.ts              # Axios 实例
│   │   └── tripService.ts     # 行程相关 API
│   ├── views/                  # 页面视图
│   │   ├── LandingPage.tsx     # 首页
│   │   ├── LoginPage.tsx       # 登录页
│   │   ├── PlannerPage.tsx     # 行程规划页（核心交互）
│   │   ├── ItineraryPage.tsx   # 行程详情页
│   │   ├── HistoryPage.tsx     # 历史记录页
│   │   └── DashboardPage.tsx   # 管理后台
│   ├── App.tsx                 # 应用入口 + 路由配置
│   └── types.ts                # TypeScript 类型定义
├── server/                     # 后端源码
│   ├── routes/
│   │   ├── tripRoutes.ts       # 行程 API 路由
│   │   └── authRoutes.ts       # 认证路由
│   ├── services/
│   │   ├── aiService.ts        # AI 服务桥接层
│   │   └── tripTransformer.ts  # 数据转换
│   ├── middleware/auth.ts      # JWT 认证中间件
│   ├── lib/supabase.ts         # Supabase 客户端
│   └── index.ts                # Express 服务入口
├── tests/                      # 测试文件
├── supabase_schema.sql         # 数据库 Schema（含 RLS 策略）
├── docker-compose.yml          # Docker 编排配置
├── Dockerfile                  # 多阶段构建
├── .env.example                # 环境变量模板
└── package.json                # 依赖与脚本
```

---

## 快速开始

### 前置要求

- Node.js >= 18
- npm >= 9
- [Supabase](https://supabase.com/) 账号（免费即可）
- [DeepSeek](https://platform.deepseek.com/) API Key

### 1. 克隆项目

```bash
git clone https://github.com/Quicklime555/horizon-travel-agent.git
cd horizon-travel-agent
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入你的配置：

```env
# DeepSeek API
DEEPSEEK_API_KEY="your_deepseek_api_key"
DEEPSEEK_MODEL="deepseek-chat"
DEEPSEEK_BASE_URL="https://api.deepseek.com"

# Supabase
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your_anon_key"

# 服务端口
PORT=3001
VITE_API_BASE_URL="http://localhost:3001/api"
```

### 4. 初始化数据库

在 Supabase 控制台的 SQL Editor 中执行 `supabase_schema.sql` 文件内容，创建所需的表和 RLS 策略。

### 5. 启动开发服务

```bash
# 启动后端（端口 3001）
npm run server

# 新终端，启动前端（端口 3000）
npm run dev
```

访问 http://localhost:3000 即可使用。

### Docker 部署（可选）

```bash
docker-compose up -d
```

将自动启动 PostgreSQL、后端和前端三个服务。

---

## API 接口

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| POST | `/api/trips/plan` | 创建 AI 行程规划 | ✅ |
| GET | `/api/trips/:id` | 获取行程详情 | ✅ |
| GET | `/api/trips/agent-logs` | 获取 AI Agent 日志 | ✅ |
| POST | `/api/auth/signup` | 用户注册 | ❌ |
| POST | `/api/auth/login` | 用户登录 | ❌ |
| GET | `/health` | 健康检查 | ❌ |

### 行程规划请求示例

```json
{
  "origin": "上海",
  "destination": "东京",
  "startDate": "2025-03-01",
  "endDate": "2025-03-05",
  "budget": 15000,
  "preferences": ["美食", "文化", "购物"],
  "pace": "standard",
  "travelers": 2
}
```

---

## AI Agent 设计详解

本项目的核心亮点在于 AI Agent 的工程化实现（`src/ai/agent.ts`），以下是关键设计决策：

### Prompt Engineering

- **System Prompt**：定义 AI 角色、输出 Schema、关键规则（预算完整性、日期完整性、节奏控制）
- **JSON Schema 约束**：通过 `response_format: { type: 'json_object' }` 强制 LLM 输出 JSON
- **多语言适配**：根据目的地语言自动切换输出语言

### 容错与重试

```
请求 → JSON 解析 → 字段校验 → 后处理 → 返回
         ↓ 失败        ↓ 失败
    尝试提取 {}     自动修复/重试
         ↓ 失败        ↓ 超过重试次数
      重试(指数退避)   降级返回
```

- 最多重试 2 次，指数退避（1s → 2s）
- JSON 解析失败时尝试从 markdown 代码块或最外层 `{}` 提取
- 天数不匹配时自动截断修复
- 预算子项不一致时按比例调整

### 替换 LLM 提供商

修改 `src/ai/deepseekConfig.ts` 和 `.env` 即可切换到其他兼容 OpenAI API 格式的提供商：

```env
DEEPSEEK_API_KEY="your_other_api_key"
DEEPSEEK_MODEL="gpt-4o"
DEEPSEEK_BASE_URL="https://api.openai.com/v1"
```

---

## 数据库设计

项目使用 Supabase（PostgreSQL）作为数据层，包含以下核心表：

| 表名 | 用途 |
|------|------|
| `trip_plans` | 行程规划主表，存储用户请求和状态 |
| `itinerary_days` | 每日行程，关联 trip_plans |
| `itinerary_items` | 具体活动项，关联 itinerary_days |
| `planner_runs` | AI 调用监控日志（延迟、状态、错误） |
| `trip_feedback` | 用户对行程的评分与反馈 |
| `profiles` | 用户扩展信息（角色、头像等） |

所有表均启用 Row Level Security (RLS)，确保用户只能访问自己的数据。完整 Schema 见 `supabase_schema.sql`。

---

## 开发指南

### 可用脚本

```bash
npm run dev        # 启动前端开发服务器（端口 3000）
npm run server     # 启动后端 Express 服务（端口 3001）
npm run build      # 构建前端生产版本
npm run test       # 运行测试
npm run lint       # TypeScript 类型检查
npm run preview    # 预览构建产物
```

### 二次开发建议

1. **添加新的 AI 功能**：在 `src/ai/` 目录下创建新的 Agent 模块，参考 `agent.ts` 的 Prompt + Schema + 重试模式
2. **新增页面**：在 `src/views/` 下创建组件，在 `App.tsx` 中添加路由
3. **新增 API**：在 `server/routes/` 下创建路由文件，在 `server/index.ts` 中注册
4. **修改数据模型**：更新 `supabase_schema.sql` 并在 Supabase 控制台执行迁移

### 测试

```bash
npm run test
```

测试文件位于 `tests/` 目录，使用 Node.js 内置 test runner。

---

## 部署

### Vercel + Railway（推荐）

- **前端**：部署到 Vercel，设置 `VITE_*` 环境变量
- **后端**：部署到 Railway，设置服务端环境变量
- **数据库**：使用 Supabase 托管 PostgreSQL

### Docker 自托管

```bash
docker-compose up -d
```

---

## 贡献指南

欢迎提交 Pull Request！参与贡献前请注意：

1. Fork 本仓库并创建你的分支 (`git checkout -b feature/amazing-feature`)
2. 提交你的修改 (`git commit -m 'feat: add amazing feature'`)
3. 推送到分支 (`git push origin feature/amazing-feature`)
4. 创建 Pull Request

### 代码规范

- 使用 TypeScript 严格模式
- 遵循现有代码风格和目录结构
- 新功能需附带基本测试
- Commit Message 遵循 [Conventional Commits](https://www.conventionalcommits.org/)

---

## 许可证

本项目基于 [MIT License](LICENSE) 开源。

---

## 致谢

- [DeepSeek](https://www.deepseek.com/) — AI 行程生成能力
- [Supabase](https://supabase.com/) — 后端即服务（Auth + Database）
- [React](https://react.dev/) + [Vite](https://vitejs.dev/) — 前端框架与构建工具
- [TailwindCSS](https://tailwindcss.com/) — 实用优先的 CSS 框架
