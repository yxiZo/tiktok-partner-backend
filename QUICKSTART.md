# 🚀 快速启动指南

## 启动步骤

### 1. 启动后端服务

```bash
# 进入项目目录
cd D:\selfWorkDir\tiktok-partner-backend

# 启动开发服务器
pnpm run start:dev
```

### 2. 访问页面

服务启动后，在浏览器中打开以下任意页面：

#### 主入口页面（推荐）
```
http://localhost:3000/index.html
```

或使用局域网IP访问（其他设备可访问）：
```
http://192.168.5.153:3000/index.html
```

#### 直接访问各步骤页面
```
http://localhost:3000/step1-auth-code.html      # 步骤1：获取授权码
http://localhost:3000/step2-access-token.html   # 步骤2：换取访问令牌
http://localhost:3000/step3-shop-cipher.html    # 步骤3：获取店铺标识
http://localhost:3000/dashboard.html            # API测试仪表板
```

## 使用流程

### 方式1：完整流程（推荐新手）

1. 打开 `http://localhost:3000/index.html`
2. 查看3个步骤的说明
3. 点击"开始步骤1"按钮
4. 按照页面提示完成每个步骤
5. 自动进入API测试仪表板

### 方式2：直接访问步骤页面（推荐有经验用户）

你可以直接访问任何步骤页面，手动输入所需的参数：

**步骤1 - 获取授权码：**
- 访问 `http://localhost:3000/step1-auth-code.html`
- 点击"获取授权链接"
- 完成TikTok授权后，复制授权码
- 粘贴到输入框，点击"保存并进入下一步"

**步骤2 - 换取访问令牌：**
- 访问 `http://localhost:3000/step2-access-token.html`
- 如果从步骤1过来，授权码会自动填充
- 或者手动输入授权码
- 点击"换取访问令牌"
- 查看返回的token信息
- 点击"进入下一步"

**步骤3 - 获取店铺标识：**
- 访问 `http://localhost:3000/step3-shop-cipher.html`
- 如果从步骤2过来，access_token会自动填充
- 或者手动输入access_token
- 点击"获取已授权店铺列表"
- 选择一个店铺
- 点击"进入API测试仪表板"

### 方式3：直接进入仪表板（推荐已有Token的用户）

如果你已经有 `access_token` 和 `shop_cipher`：

访问 `http://localhost:3000/dashboard.html?access_token=YOUR_TOKEN&shop_cipher=YOUR_CIPHER`

或者在页面打开后手动输入：
1. 访问 `http://localhost:3000/dashboard.html`
2. 在配置表单中手动输入：
   - API Base URL: `http://192.168.5.153:3000`
   - Access Token: 你的token
   - Shop Cipher: 你的cipher
3. 开始测试API

## 参数说明

### API Base URL
默认值：`http://192.168.5.153:3000`
- 可以在任意页面的配置区域修改
- 本地开发用 `http://localhost:3000`
- 局域网访问用 `http://192.168.5.153:3000`

### Access Token
- 有效期：7天
- 用途：调用TikTok Shop API的凭证
- 获取方式：通过授权码换取

### Shop Cipher
- 用途：标识要操作的店铺
- 获取方式：通过access_token获取店铺列表
- 必需参数：产品和订单API需要

## 常见问题

### Q: 页面无法访问？
A: 确保后端服务已启动（运行 `pnpm run start:dev`）

### Q: API调用失败？
A: 检查以下几点：
1. API Base URL是否正确
2. Access Token是否有效（未过期）
3. Shop Cipher是否正确
4. 后端服务是否正常运行

### Q: Token过期怎么办？
A: 在步骤2页面，使用Refresh Token刷新，或重新开始授权流程

### Q: 可以跳过某些步骤吗？
A: 可以！每个页面都支持手动输入参数，直接访问需要的页面即可

## 文件结构

```
public/
├── index.html                 # 主入口（推荐从这里开始）
├── step1-auth-code.html       # 步骤1：获取授权码
├── step2-access-token.html    # 步骤2：换取访问令牌
├── step3-shop-cipher.html     # 步骤3：获取店铺标识
├── dashboard.html             # API测试仪表板
├── test-api.html              # 旧版单页面工具
└── README.md                  # 详细文档
```

## 技术栈

- **后端**: NestJS
- **前端**: 纯HTML + JavaScript（无框架依赖）
- **静态文件**: 通过NestJS的Express静态文件服务

## 端口配置

默认端口：3000

如需修改，设置环境变量：
```bash
# Windows
set PORT=8080
pnpm run start:dev

# Linux/Mac
PORT=8080 pnpm run start:dev
```

## 注意事项

1. **开发环境**：使用 `pnpm run start:dev` 启动
2. **生产环境**：使用 `pnpm run build && pnpm run start:prod` 启动
3. **热重载**：开发模式下修改代码会自动重启
4. **跨域**：如果遇到CORS问题，可能需要配置CORS中间件

## 下一步

完成授权后，你可以在仪表板中测试以下功能：

- 🏪 店铺管理：获取店铺信息、权限等
- 📦 产品管理：搜索、创建、更新产品
- 📋 订单管理：查询订单、获取详情等

祝使用愉快！ 🎉
