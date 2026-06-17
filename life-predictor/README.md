# LifeScore

一个轻量健康寿命评分 Web 应用。LifeScore 通过一组高信号健康问题，生成健康寿命画像、优势、优先风险、7 天行动挑战和可分享结果卡。结果用于健康教育和自我观察，不提供医学诊断。

## 功能特性

- **高信号问卷**：6 个核心步骤可生成结果，进阶问题可选
- **LifeScore 结果卡**：展示健康寿命画像、结果区间、优势、优先风险和可信度
- **行动挑战**：把结果转成 7 天小挑战，降低用户行动门槛
- **分享页**：公开分享页只展示安全摘要，不暴露完整问卷和敏感细节
- **双语支持**：支持中文和英文切换
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
# Optional. Must be an OpenAI-compatible chat completions endpoint.
# Leave these blank to skip AI report generation.
AI_API_BASE_URL=
AI_API_KEY=
AI_MODEL=
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
| `ADMIN_PASSWORD` | 后台管理密码（未设置时后台登录直接禁用，不再有默认密码） | 是 |
| `AI_API_BASE_URL` | OpenAI 兼容 AI API 地址 | 否（不填则跳过 AI 报告） |
| `AI_API_KEY` | AI API 密钥 | 否 |
| `AI_MODEL` | AI 模型名称 | 否（不填则跳过 AI 报告） |
| `PORT` | 服务端口（默认 3001） | 否 |
| `FRONTEND_URL` | 前端地址（用于 CORS） | 否 |
| `PUBLIC_SITE_URL` | 站点公开地址（用于邮件里的结果找回链接） | 否 |
| `NODE_ENV` | 运行环境（development/production） | 否 |
| `EMAIL_SMTP_HOST` | SMTP 主机（任意支持 SMTP 的服务商：Resend / 阿里云邮件推送 / SES / SendGrid 等） | 否（不填则不发邮件） |
| `EMAIL_SMTP_PORT` | SMTP 端口（465=SMTPS，587=STARTTLS，默认 587） | 否 |
| `EMAIL_SMTP_USER` | SMTP 用户名 | 否 |
| `EMAIL_SMTP_PASS` | SMTP 密码 / API Key | 否 |
| `EMAIL_FROM` | 发件人，如 `LifeScore <noreply@your-domain>` | 否 |

> 邮件为可选能力：不配置 SMTP 时留资仍可正常保存，只是不会给用户发送结果找回邮件。要启用，填好上面 5 个 `EMAIL_*` 变量即可，无需改代码。

## API 接口

### 公开接口

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/api/predictions` | 提交问卷数据，返回 LifeScore 结果（含健康年龄） |
| `GET` | `/api/predictions/:id` | 获取私有结果详情和 AI 分析 |
| `GET` | `/api/predictions/:id/share` | 获取公开分享页安全摘要（仅健康年龄差，不含真实年龄） |
| `POST` | `/api/leads` | 结果页邮箱留资（解锁 AI 深度解读） |
| `POST` | `/api/events` | 第一方转化埋点（类型白名单） |
| `GET` | `/api/stats/public` | 公开完测计数（首页信任徽章） |
| `POST` | `/api/admin/login` | 后台登录 |
| `GET` | `/api/health` | 健康检查 |

### 后台接口（需 Bearer Token）

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/admin/stats` | 统计数据（含 30 天转化漏斗和 leads 计数） |
| `GET` | `/api/admin/predictions` | 结果列表（支持筛选分页） |
| `GET` | `/api/admin/predictions/:id` | 结果详情（含完整问卷 rawAnswers） |
| `GET` | `/api/admin/predictions/export/csv` | 导出结果 CSV |
| `GET` | `/api/admin/leads/export/csv` | 导出邮箱 CSV |
| `POST` | `/api/admin/logout` | 退出登录 |

### 本地开发数据库（无 Docker 时）

```bash
cd backend
npm run dev:db   # 启动内嵌 Postgres（端口 5433）并自动应用迁移
# 另开终端：
$env:DATABASE_URL="postgresql://postgres:devpass@localhost:5433/lifescore_dev"; npm run dev
```

## 评分算法

LifeScore 以基准寿命表和问卷健康信号为基础，计算一个结果区间、健康寿命估计、同龄百分位、可信度和优先行动空间。它不是在预测一个确定日期，而是把可观察信号整理成一张可行动的优先级地图。

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
