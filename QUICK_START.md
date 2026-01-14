# 快速开始指南

## 🎯 5分钟快速测试

### 方式1: 使用测试页面(推荐)

1. **启动后端服务**
   ```bash
   cd D:\selfWorkDir\tiktok-partner-backend
   pnpm run start:dev
   ```

2. **打开测试页面**
   - 在浏览器中打开: `test-auth-flow.html`
   - 这是专门用于测试授权流程的页面

3. **测试自动处理授权码**
   - 点击"模拟授权回调"按钮
   - URL会自动添加 `?code=test_code_xxx`
   - 页面会自动检测并处理
   - Token自动保存到localStorage

4. **测试数据恢复**
   - 刷新页面
   - 所有认证信息自动恢复
   - 查看"当前状态"区域

5. **查看日志**
   - 滚动到页面底部的"日志"区域
   - 查看所有操作的详细日志

### 方式2: 使用完整API测试工具

1. **打开主测试页面**
   - 在浏览器中打开: `test-api.html`

2. **首次授权**
   - 点击"🔐 授权管理" tab
   - 点击"获取授权链接"
   - 复制链接到浏览器打开
   - 完成TikTok授权
   - 如果回调URL指向此页面,会自动处理

3. **获取店铺信息**
   - 点击"🏪 店铺管理" tab
   - 点击"获取已授权店铺"
   - Shop Cipher会自动保存

4. **测试产品API**
   - 点击"📦 产品管理" tab
   - 所有认证信息已自动填充
   - 直接点击按钮测试

5. **测试订单API**
   - 点击"📋 订单管理" tab
   - 直接测试各种订单查询

## 🎨 页面功能

### 配置区域
- **API Base URL**: 后端服务地址
- **Access Token**: 自动填充,无需手动输入
- **Shop Cipher**: 自动填充,无需手动输入
- **查看存储的认证信息**: 查看当前保存的数据
- **清除所有认证数据**: 清除所有本地存储的认证信息

### 授权管理Tab
1. 获取授权链接
2. 通过授权码获取Token(支持URL自动检测)
3. 刷新Token

### 店铺管理Tab
1. 获取已授权店铺(自动保存Shop Cipher)
2. 获取店铺详细信息
3. 获取店铺权限
4. 获取Widget Token

### 产品管理Tab
1. 搜索产品
2. 获取产品详情
3. 创建产品
4. 激活/停用/删除产品
5. 更新库存和价格
6. 获取分类和品牌

### 订单管理Tab
1. 按状态获取订单
2. 获取订单详情
3. 高级搜索订单
4. 获取最近更新的订单

## 🔧 开发调试

### 查看控制台日志
打开浏览器开发者工具(F12),查看控制台输出:

```
[Storage] Saved: tiktok_access_token
[Auth] Authorization successful
[Init] Page loading, initializing...
```

### 手动测试localStorage
在浏览器控制台输入:

```javascript
// 查看所有存储的数据
localStorage

// 查看特定数据
localStorage.getItem('tiktok_access_token')
localStorage.getItem('tiktok_auth_info')

// 清除所有数据
localStorage.clear()

// 清除特定数据
localStorage.removeItem('tiktok_access_token')
```

### 模拟授权回调
在浏览器地址栏添加参数:
```
file:///D:/selfWorkDir/tiktok-partner-backend/test-api.html?code=test_code_12345
```

或者使用控制台:
```javascript
// 手动添加code参数并刷新
window.location.href = window.location.pathname + '?code=test_12345';
```

## 📊 数据存储结构

### localStorage中的数据
```javascript
{
    // API配置
    'tiktok_api_base_url': 'http://192.168.5.153:3000',

    // Token信息
    'tiktok_access_token': 'access_token_xxx',
    'tiktok_refresh_token': 'refresh_token_xxx',
    'tiktok_token_expire_time': '1704067200', // Unix时间戳

    // 店铺信息
    'tiktok_shop_cipher': 'shop_cipher_xxx',

    // 认证信息(JSON字符串)
    'tiktok_auth_info': '{
        "open_id": "xxx",
        "seller_name": "卖家名称",
        "seller_base_region": "CN",
        "user_type": 1,
        "created_at": "2024-01-01T00:00:00.000Z"
    }'
}
```

## ⚡ 常见问题

### Q: Token没有自动保存?
A: 检查以下几点:
1. 打开浏览器控制台,查看是否有错误
2. 确认API返回的数据格式正确
3. 检查浏览器是否支持localStorage(现代浏览器都支持)

### Q: 刷新页面后数据丢失?
A: 可能的原因:
1. 使用了无痕/隐私模式
2. 浏览器设置了清除localStorage
3. 手动点击了"清除所有认证数据"

### Q: Token过期时间不准确?
A: 检查:
1. 系统时间是否正确
2. API返回的`access_token_expire_in`值是否正确
3. 查看localStorage中的`tiktok_token_expire_time`值

### Q: 如何清除所有数据?
A: 有三种方式:
1. 点击页面上的"清除所有认证数据"按钮
2. 在控制台执行: `localStorage.clear()`
3. 在浏览器设置中清除网站数据

## 🎯 最佳实践

### 开发环境
- 使用 `test-auth-flow.html` 快速测试授权流程
- 使用 `test-api.html` 测试完整API功能
- 时刻关注控制台日志

### 生产环境
- 建议使用HTTPS
- Token存储在localStorage中,注意安全性
- 在公共设备上使用后及时清除数据
- 定期检查Token是否即将过期

### 测试流程
1. 先在测试页面验证授权流程
2. 再在完整页面测试所有API
3. 最后在实际应用中集成

## 📚 相关文档

- `CHANGES.md` - 详细的改动说明
- `test-api-features.md` - 功能特性说明
- `test-api.html` - 完整的API测试工具
- `test-auth-flow.html` - 授权流程测试页面

## 🚀 下一步

1. **测试授权流程**: 使用 `test-auth-flow.html` 测试
2. **测试完整功能**: 使用 `test-api.html` 测试
3. **集成到应用**: 参考代码集成到你的应用
4. **升级API版本**: 如果需要,升级到最新API版本

## 💡 提示

- 所有Token和认证信息都存储在浏览器本地
- 页面刷新或关闭浏览器后重新打开,数据会自动恢复
- Token有效期7天,过期前会自动提醒
- 建议在Token过期前主动刷新

祝你使用愉快! 🎉
