# TikTok Shop API 测试工具 - 改造总结

## 📋 改造内容

### 1. 自动处理授权码(Code) ✅
**功能**: 页面会自动检测URL中的`code`参数并换取Token

**实现**:
- 添加了`checkUrlCode()`函数,在页面加载时自动检测URL参数
- 添加了`getTokenWithCode(code)`函数,统一的Token获取逻辑
- 自动清除URL中的code参数,保持URL整洁

**使用场景**:
- 用户完成授权后,如果回调URL指向本页面,会自动处理
- 无需手动复制粘贴授权码

### 2. LocalStorage持久化存储 ✅
**功能**: 所有认证信息自动保存到浏览器localStorage

**存储的数据**:
```javascript
{
    'tiktok_api_base_url': 'http://192.168.5.153:3000',
    'tiktok_access_token': 'xxx',
    'tiktok_refresh_token': 'xxx',
    'tiktok_shop_cipher': 'xxx',
    'tiktok_token_expire_time': '1234567890',
    'tiktok_auth_info': '{"seller_name":"...","open_id":"..."}'
}
```

**核心函数**:
- `saveToLocalStorage(key, value)` - 保存数据
- `loadFromLocalStorage(key, defaultValue)` - 读取数据
- `saveAuthInfo(authData)` - 保存完整认证信息
- `isTokenExpired()` - 检查Token是否过期

### 3. 自动恢复认证状态 ✅
**功能**: 页面刷新后自动恢复所有认证信息

**实现**:
- `loadStoredData()` - 页面加载时恢复数据
- `syncFormData()` - 表单与localStorage双向同步
- 自动填充所有输入框

**用户体验**:
- 关闭浏览器后重新打开,无需重新授权
- 所有配置自动恢复

### 4. 数据管理UI ✅
**新增按钮**:
1. **查看存储的认证信息** - 显示当前保存的所有认证数据
2. **清除所有认证数据** - 删除localStorage中的所有认证信息

**显示信息**:
- 卖家名称、Open ID、地区
- Access Token状态(前20个字符)
- Refresh Token状态
- Shop Cipher状态
- Token过期时间(剩余分钟数)

### 5. Token过期检查 ✅
**功能**: 自动检查Token是否即将过期

**实现**:
- 提前5分钟判定为过期
- 显示剩余有效时间
- 提醒用户刷新Token

## 🔧 代码改动详情

### 新增工具函数
```javascript
// localStorage管理
- saveToLocalStorage()
- loadFromLocalStorage()
- removeFromLocalStorage()
- clearAuthData()

// 认证管理
- saveAuthInfo()
- isTokenExpired()
- syncFormData()
- loadStoredData()

// URL处理
- checkUrlCode()
- getTokenWithCode()

// 数据管理
- clearStoredAuthData()
- showStoredAuthInfo()
```

### 修改的现有函数
```javascript
// getAccessToken() - 添加了syncFormData()调用
// getShopCipher() - 添加了syncFormData()调用
// getBaseUrl() - 添加了syncFormData()调用
// getToken() - 重构为调用getTokenWithCode()
// refreshToken() - 添加了localStorage自动读取和保存
// getAuthorizedShops() - 添加了shop_cipher自动保存
```

### UI改动
1. 配置区域新增两个按钮
2. 授权管理tab的使用说明更新,强调自动处理code功能
3. 响应消息中增加了存储状态信息

## 📁 新增文件

1. **test-api-features.md** - 详细功能说明文档
2. **test-auth-flow.html** - 授权流程测试页面

## 🔍 测试建议

### 测试场景1: 自动处理授权码
1. 打开 `test-auth-flow.html`
2. 点击"模拟授权回调"按钮
3. 观察URL自动变化和Token自动保存
4. 刷新页面,验证数据自动恢复

### 测试场景2: 手动输入授权码
1. 打开 `test-api.html`
2. 点击"获取授权链接"
3. 完成授权后复制code
4. 粘贴到输入框并点击"获取Token"
5. 验证Token自动保存到localStorage

### 测试场景3: Token刷新
1. 等待Token即将过期
2. 点击"刷新Token"
3. 验证新Token自动保存
4. 查看存储的认证信息

### 测试场景4: 数据清除
1. 点击"查看存储的认证信息"
2. 查看所有保存的数据
3. 点击"清除所有认证数据"
4. 刷新页面,验证数据已清空

## 📊 API版本分析

### 重要结论: 保持V202309版本 ✅

**经过详细分析,强烈建议保持当前使用的V202309版本**

详细分析请查看: [API_VERSION_ANALYSIS.md](./API_VERSION_ANALYSIS.md)

### 为什么不升级?

**关键发现**: 新版本API并非功能升级,而是功能拆分

| API模块 | V202309功能 | V202509功能 | 结论 |
|---------|------------|------------|------|
| Product | 20+ 方法 | 3-4 方法 | ❌ 新版本功能更少 |
| Order | 2 方法 | 1 方法 | ❌ 新版本功能更少 |
| Authorization | 1 方法 | 1 方法(不同) | ⚠️ 功能不同 |

如果升级到V202509,会**失去**:
- ❌ 创建产品
- ❌ 搜索产品
- ❌ 删除产品
- ❌ 更新库存
- ❌ 更新价格
- ❌ 获取分类
- ❌ 获取品牌
- ...等核心功能

### 当前使用的API版本 ✅

| 模块 | 版本 | 功能数 | 状态 |
|------|------|--------|------|
| 授权 | V202309 | 完整 | ✅ 保持 |
| 店铺 | V202309 | 完整 | ✅ 保持 |
| 产品 | V202309 | 20+ 方法 | ✅ 保持 |
| 订单 | V202309 | 完整 | ✅ 保持 |

### 可选:多版本并存方案

如需特定新功能,可**额外添加**(不替换V202309):

```typescript
// 核心功能保持V202309
AuthorizationV202309Api ✅
SellerV202309Api ✅
ProductV202309Api ✅
OrderV202309Api ✅

// 可选添加
AuthorizationV202312Api // Widget Token
AuthorizationV202403Api // 取消授权
```

### 详细分析文档

请查看 `API_VERSION_ANALYSIS.md` 了解:
- 每个版本的详细功能列表
- 版本功能对比
- 升级风险评估
- 最佳实践建议

## 🎯 实现的功能清单

- ✅ 自动检测URL中的code参数
- ✅ 自动调用换取Token的API
- ✅ Token自动保存到localStorage
- ✅ Refresh Token自动保存
- ✅ Shop Cipher自动保存
- ✅ 认证信息(卖家名称等)自动保存
- ✅ Token过期时间自动保存
- ✅ 页面刷新后自动恢复所有认证信息
- ✅ 表单与localStorage双向同步
- ✅ Token过期自动检查(提前5分钟)
- ✅ 查看存储的认证信息按钮
- ✅ 清除所有认证数据按钮
- ✅ 控制台详细日志输出

## 🚀 使用流程

### 首次授权
1. 打开 `test-api.html`
2. 点击"获取授权链接"
3. 复制链接到浏览器打开
4. 完成TikTok授权
5. 如果回调URL包含code,自动处理
6. Token自动保存

### 后续使用
1. 打开 `test-api.html`
2. 所有认证信息自动恢复
3. 直接测试各种API

### Token刷新
1. 当Token即将过期时
2. 点击"刷新Token"按钮
3. 新Token自动保存

## 💡 注意事项

1. **安全性**: Token存储在浏览器localStorage中,仅限本地使用
2. **过期时间**: Token默认7天有效期,过期前5分钟会提示
3. **清除数据**: 在公共设备上使用后,记得清除认证数据
4. **API版本**: 当前使用V202309版本,如需升级需修改后端代码

## 📞 问题排查

### Token未自动保存
- 检查浏览器是否支持localStorage
- 检查浏览器控制台是否有错误
- 确认API返回的数据格式正确

### 数据未自动恢复
- 打开浏览器控制台,查看是否有错误日志
- 检查localStorage中是否有数据
- 确认页面加载时调用了`loadStoredData()`

### Token过期提示不准确
- 检查系统时间是否正确
- 确认`access_token_expire_in`值是否正确
- 查看localStorage中的过期时间戳
