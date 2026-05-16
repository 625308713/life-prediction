# 寿命预测 (Life Predictor)

一个面向中文用户的专业寿命预测工具，基于多维度健康数据分析，通过科学算法和大模型生成个性化的寿命预测报告。

## 功能特性

- **多维度问卷**：11个维度，约55个参数，分层展示
- **科学评分算法**：基于流行病学研究的加减分模型
- **AI 个性化报告**：调用大模型生成专业分析报告
- **双语支持**：中文为主，支持切换英文
- **响应式设计**：兼容手机和 PC
- **后台管理**：数据查询、统计报表、CSV 导出

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18 + TypeScript + Tailwind CSS + Vite |
| 后端 | Node.js + Express + TypeScript |
| 数据库 | PostgreSQL |
| ORM | Prisma |
| 图表 | Recharts |
| AI | OpenAI 兼容接口（支持 Claude、GPT 等） |

## 本地开发

### 前置要求

- Node.js 18+
- PostgreSQL 数据库
- 可选：AI API Key（用于生成分析报告）

### 1. 克隆项目

```bash
git clone <repository-url>
cd life-predictor
```

### 2. 配置环境变量

```bash
cp backend/.env.example backend/.env
```

编辑 `backend/.env`：

```env
DATABASE_URL=postgresql://user:password@localhost:5432/lifepredictor
ADMIN_PASSWORD=your_admin_password_here
AI_API_BASE_URL=https://api.anthropic.com
AI_API_KEY=your_api_key_here
AI_MODEL=claude-sonnet-4-20250514
PORT=3001
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### 3. 安装依赖

```bash
# 后端
cd backend
npm install
npx prisma generate

# 前端
cd ../frontend
npm install
```

### 4. 初始化数据库

```bash
cd backend
npx prisma migrate dev --name init
```

### 5. 启动开发服务

```bash
# 终端 1：启动后端
cd backend
npm run dev

# 终端 2：启动前端
cd frontend
npm run dev
```

访问 http://localhost:5173 使用应用。

### Docker 部署

```bash
docker compose up -d
```

这将启动 PostgreSQL 和应用服务，访问 http://localhost:3001。

## 环境变量

| 变量名 | 说明 | 必填 |
|--------|------|------|
| `DATABASE_URL` | PostgreSQL 连接字符串 | 是 |
| `ADMIN_PASSWORD` | 后台管理密码 | 是 |
| `AI_API_BASE_URL` | AI API 地址 | 否（不填则跳过 AI 报告） |
| `AI_API_KEY` | AI API 密钥 | 否 |
| `AI_MODEL` | AI 模型名称 | 否 |
| `PORT` | 服务端口（默认 3001） | 否 |
| `FRONTEND_URL` | 前端地址（用于 CORS） | 否 |
| `NODE_ENV` | 运行环境（development/production） | 否 |

## API 接口

### 公开接口

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/api/predictions` | 提交问卷数据，返回预测结果 |
| `GET` | `/api/predictions/:id` | 获取预测详情和 AI 报告 |
| `POST` | `/api/admin/login` | 后台登录 |
| `GET` | `/api/health` | 健康检查 |

### 后台接口（需 Bearer Token）

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/admin/stats` | 统计数据 |
| `GET` | `/api/admin/predictions` | 预测列表（支持筛选分页） |
| `GET` | `/api/admin/predictions/:id` | 预测详情 |
| `GET` | `/api/admin/predictions/export/csv` | 导出 CSV |
| `POST` | `/api/admin/logout` | 退出登录 |

## 评分算法

基于中国 2023 年期望寿命数据（男性 75.0 岁，女性 80.0 岁），通过 11 个维度的加减分规则计算个性化寿命预测。总调整范围为 -20 ~ +20 年。

详情见 `backend/src/services/algorithm.ts`。

## 部署

### Railway

1. 将项目推送到 GitHub
2. 在 Railway 中新建项目并关联仓库
3. 添加 PostgreSQL 插件
4. 设置环境变量（参考 `.env.example`）
5. Railway 会自动使用 `railway.toml` 配置部署

### Render

1. 创建 Web Service，选择 Docker 部署
2. 添加 PostgreSQL 数据库
3. 设置环境变量
4. 部署

## 项目结构

```
life-predictor/
├── backend/
│   ├── src/
│   │   ├── index.ts              # 入口文件
│   │   ├── routes/               # API 路由
│   │   ├── services/             # 业务逻辑
│   │   └── middleware/           # 中间件
│   └── prisma/                   # 数据库 Schema
├── frontend/
│   └── src/
│       ├── pages/                # 页面
│       ├── components/           # 组件
│       ├── hooks/                # 自定义 Hooks
│       ├── i18n/                 # 国际化
│       └── types/                # 类型定义
├── Dockerfile
├── docker-compose.yml
└── railway.toml
```

## License

MIT
