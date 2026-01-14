# TikTok Shop Partner Backend

基于NestJS的TikTok Shop API完整后端实现，支持店铺授权、产品管理、订单管理等核心功能。

## 功能特性

- ✅ **店铺授权** - 完整的OAuth 2.0流程，自动Token刷新
- ✅ **店铺管理** - 获取店铺信息、权限管理
- ✅ **产品管理** - 产品CRUD、库存管理、价格管理、分类品牌查询
- ✅ **订单管理** - 订单查询、状态筛选、时间范围查询
- 🔒 **安全性** - HMAC-SHA256签名、Token自动管理
- 📦 **模块化设计** - 清晰的代码结构，易于扩展
- 🎯 **TypeScript** - 完整的类型定义和类型安全

## 项目结构

```
tiktok-partner-backend/
├── src/
│   ├── config/                      # 配置文件
│   │   ├── tiktok.config.ts         # TikTok配置
│   │   └── tiktok-client.provider.ts # SDK客户端提供者
│   │
│   ├── modules/                      # 业务模块
│   │   ├── auth/                     # 授权模块
│   │   ├── shop/                     # 店铺管理模块
│   │   ├── product/                  # 产品管理模块
│   │   └── order/                    # 订单管理模块
│   │
│   ├── types/                        # TypeScript类型定义
│   │   └── tiktok.types.ts
│   │
│   ├── app.module.ts                 # 根模块
│   └── main.ts                       # 应用入口
│
├── sdk/                              # TikTok Shop Node.js SDK
│   ├── api/                          # API定义（41个API文件）
│   ├── model/                        # 数据模型（1156个模型）
│   └── client/                       # 客户端实现
│
├── .env.example                      # 环境变量示例
├── API_DOCUMENTATION.md              # 完整API文档
├── USAGE_EXAMPLES.md                 # 使用示例
└── README.md                         # 本文件
```

## 快速开始

### 1. 环境要求

- Node.js 16+
- pnpm (推荐) / yarn / npm

### 2. 安装依赖

```bash
pnpm install
```

### 3. 配置环境变量

复制 `.env.example` 为 `.env` 并填写配置：

```env
# TikTok Shop API Configuration
TIKTOK_APP_KEY=your_app_key_here
TIKTOK_APP_SECRET=your_app_secret_here
TIKTOK_SERVICE_ID=your_service_id_here
TIKTOK_SANDBOX=false

# Proxy Configuration (代理配置，用于访问TikTok API)
USE_PROXY=true              # 是否启用代理（默认true）
PROXY_HOST=127.0.0.1        # 代理服务器地址
PROXY_PORT=20122            # 代理服务器端口

# Server Configuration
PORT=3000
NODE_ENV=development
```

**代理说明：**
- 如果需要通过代理访问 TikTok API（例如在中国大陆），保持 `USE_PROXY=true`
- 代理默认配置为 `http://127.0.0.1:20122`，可根据实际情况修改
- 如果不需要代理，设置 `USE_PROXY=false`

### 4. 启动服务

```bash
# 开发模式
pnpm run start:dev

# 生产模式
pnpm run build
pnpm run start:prod
```

服务将在 `http://localhost:3000` 启动

## API概览

### 授权模块
- `GET /auth/authorization-url` - 获取授权链接
- `GET /auth/callback` - OAuth回调处理
- `POST /auth/refresh` - 刷新Access Token

### 店铺管理
- `GET /shops/authorized` - 获取已授权店铺列表
- `GET /shops/details` - 获取店铺详细信息
- `GET /shops/permissions` - 获取店铺权限

### 产品管理
- `POST /products/search` - 搜索产品
- `POST /products` - 创建产品
- `POST /products/activate` - 激活产品（上架）
- `POST /products/:productId/inventory` - 更新库存
- `POST /products/:productId/price` - 更新价格

### 订单管理
- `POST /orders/search` - 搜索订单
- `GET /orders/:orderId` - 获取订单详情
- `GET /orders/status/pending-shipment` - 获取待发货订单

完整API文档请查看 [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## 使用示例

### OAuth授权流程

```typescript
// 1. 获取授权链接
const response = await fetch('http://localhost:3000/auth/authorization-url');
const data = await response.json();

// 2. 用户授权后获取Token
const tokenResponse = await fetch(`http://localhost:3000/auth/callback?code=${code}`);
const tokenData = await tokenResponse.json();
```

更多示例请查看 [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md)

## 测试

```bash
# 单元测试
pnpm run test

# e2e测试
pnpm run test:e2e

# 测试覆盖率
pnpm run test:cov
```

## 技术栈

- **框架**: NestJS 11.x
- **语言**: TypeScript 5.x
- **SDK**: TikTok Shop Node.js SDK
- **HTTP客户端**: Request 2.88.x

## 文档

### API文档
- 📘 [API完整文档](./API_DOCUMENTATION.md) - 所有API的详细说明
- 📗 [使用示例](./USAGE_EXAMPLES.md) - 实际业务场景的完整代码示例
- 📙 [TikTok Shop官方文档](https://partner.tiktokshop.com/docv2)

### 测试工具文档
- 🚀 [快速开始指南](./QUICK_START.md) - 5分钟快速上手测试工具 ⭐
- 📊 [API版本分析](./API_VERSION_ANALYSIS.md) - 详细的API版本对比分析
- 📝 [项目改动说明](./CHANGES.md) - HTML改造和功能实现说明
- 📦 [功能特性说明](./test-api-features.md) - 新功能详细介绍
- 📋 [项目总结](./PROJECT_SUMMARY.md) - 完整的项目改造总结

### 测试页面
- 🎯 [test-api.html](./test-api.html) - 完整的API测试工具(支持自动授权)
- 🧪 [test-auth-flow.html](./test-auth-flow.html) - 授权流程测试页面

## 新功能特性 ✨

### 测试工具增强
- ✅ **自动处理授权码** - URL包含code时自动换取Token
- ✅ **LocalStorage持久化** - 所有认证信息自动保存
- ✅ **状态自动恢复** - 页面刷新后无需重新授权
- ✅ **数据管理功能** - 查看和清除存储的认证数据
- ✅ **Token过期检查** - 提前5分钟提醒Token过期

### API版本说明
当前项目使用 **V202309** 版本的API,该版本功能最完整、最稳定。
- ❌ 不建议升级到V202509(新版本功能反而更少)
- ✅ 详见: [API_VERSION_ANALYSIS.md](./API_VERSION_ANALYSIS.md)

## License

MIT Licensed
