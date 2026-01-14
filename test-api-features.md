# TikTok Shop API 测试工具 - 新功能说明

## 🎉 新增功能

### 1. 自动处理授权码(Code)
- ✅ 当授权回调URL包含 `?code=xxx` 参数时,页面会自动检测并调用换取Token的API
- ✅ 无需手动复制粘贴授权码,提升用户体验
- ✅ 自动清除URL中的code参数,保持URL整洁

### 2. 本地存储(LocalStorage)集成
所有认证信息会自动保存到浏览器的localStorage中:
- ✅ API Base URL
- ✅ Access Token
- ✅ Refresh Token
- ✅ Shop Cipher
- ✅ Token过期时间
- ✅ 认证信息(卖家名称、地区等)

### 3. 自动恢复认证状态
- ✅ 页面刷新后自动加载已保存的认证信息
- ✅ 自动填充表单字段
- ✅ 自动检查Token是否过期

### 4. 数据管理功能
- ✅ 查看存储的认证信息按钮
- ✅ 清除所有认证数据按钮
- ✅ Token过期提醒

## 📝 使用说明

### 标准授权流程
1. 点击"获取授权链接"按钮
2. 复制授权链接到浏览器打开
3. 在TikTok授权页面完成授权
4. 如果回调URL指向本页面,会自动处理code并换取Token
5. Token会自动保存到localStorage

### 手动输入授权码
1. 从授权回调URL中复制code参数
2. 粘贴到"输入授权码"输入框
3. 点击"获取Token"按钮
4. Token会自动保存

### 自动恢复
- 关闭浏览器标签页后重新打开,所有认证信息会自动恢复
- 无需重新授权,直接使用已保存的Token

### Token刷新
- 当Token即将过期时,使用"刷新Token"功能
- 新Token会自动保存,覆盖旧Token

### 查看和清除数据
- 点击"查看存储的认证信息"查看当前保存的数据
- 点击"清除所有认证数据"删除所有本地存储的认证信息

## 🔧 API版本说明

### 当前使用的API版本
后端目前使用的API版本:
- **授权API**: Authorization V202309
- **店铺API**: Seller V202309
- **产品API**: Product V202309
- **订单API**: Order V202309

### 可用的更新版本
SDK中包含更新的API版本:
- **授权API**: V202403 (最新)
- **店铺API**: V202309
- **产品API**: V202509 (最新)
- **订单API**: V202507 (最新)

### 建议
如需使用最新API版本,需要更新后端Service代码:
1. `src/modules/auth/auth.service.ts` - 已使用最新工具方法
2. `src/modules/shop/shop.service.ts` - 可升级到 V202403
3. `src/modules/product/product.service.ts` - 可升级到 V202509
4. `src/modules/order/order.service.ts` - 可升级到 V202507

## 💾 数据存储键名
```javascript
const STORAGE_KEYS = {
    API_BASE_URL: 'tiktok_api_base_url',
    ACCESS_TOKEN: 'tiktok_access_token',
    REFRESH_TOKEN: 'tiktok_refresh_token',
    SHOP_CIPHER: 'tiktok_shop_cipher',
    TOKEN_EXPIRE_TIME: 'tiktok_token_expire_time',
    AUTH_INFO: 'tiktok_auth_info'
};
```

## 🔒 安全说明
- 所有数据存储在浏览器的localStorage中
- 仅在客户端本地存储,不会上传到服务器
- 建议在公共/共享设备上使用后清除认证数据
- Token默认7天有效期,过期前会自动提醒

## 🐛 调试信息
打开浏览器控制台可查看详细日志:
- `[Storage]` - 本地存储操作日志
- `[Auth]` - 认证相关日志
- `[Init]` - 页面初始化日志
