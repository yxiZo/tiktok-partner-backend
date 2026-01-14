# 产品搜索API 500错误修复

## 🐛 问题描述

调用 `POST /products/search` 时返回500错误:
```json
{
  "error": "Internal Server Error",
  "message": "Failed to search products: HTTP request failed",
  "statusCode": 500
}
```

## 🔍 问题原因

在 `src/modules/product/product.service.ts` 的 `searchProducts` 方法中,调用 `ProductsSearchPost` API时缺少了 `categoryVersion` 参数。

### 错误的调用代码
```typescript
const result = await this.tikTokClient.api.ProductV202309Api.ProductsSearchPost(
  searchRequest.page_size || 20,
  accessToken,
  'application/json',
  undefined, // pageToken
  shopCipher,  // ❌ 参数位置错误!
  searchRequest as any,
);
```

### API方法签名
根据 `sdk/api/productV202309Api.ts`:
```typescript
public async ProductsSearchPost (
  pageSize: number,
  xTtsAccessToken: string,
  contentType: string,
  pageToken?: string,
  categoryVersion?: string,  // ← 这个参数被遗漏了!
  shopCipher?: string,
  SearchProductsRequestBody?: Product202309SearchProductsRequestBody,
  options: {headers: {[name: string]: string}} = {headers: {}}
)
```

## ✅ 修复方案

### 修复后的代码
```typescript
const result = await this.tikTokClient.api.ProductV202309Api.ProductsSearchPost(
  searchRequest.page_size || 20,
  accessToken,
  'application/json',
  undefined, // pageToken
  undefined, // categoryVersion ✅ 已添加
  shopCipher,
  searchRequest as any,
);
```

## 📝 修改文件

- `src/modules/product/product.service.ts` (第48-56行)

## 🧪 测试步骤

1. **重启后端服务**
   ```bash
   # 停止当前服务
   # 重新启动
   pnpm run start:dev
   ```

2. **在test-api.html中测试**
   - 打开 test-api.html
   - 确保已经完成授权(有Access Token和Shop Cipher)
   - 点击"📦 产品管理" tab
   - 点击"搜索所有产品"按钮

3. **预期结果**
   ```json
   {
     "success": true,
     "data": {
       "products": [...],
       "total": 0,
       "page_info": "..."
     }
   }
   ```

## 🔍 其他API检查

已检查以下API调用,确认参数正确:
- ✅ `ProductsPost` - 创建产品
- ✅ `ProductsProductIdGet` - 获取产品详情
- ✅ `ProductsProductIdPut` - 更新产品
- ✅ `ProductsProductIdPartialEditPost` - 部分编辑产品
- ✅ `ProductsActivatePost` - 激活产品
- ✅ `ProductsDeactivatePost` - 停用产品
- ✅ `ProductsDelete` - 删除产品
- ✅ `ProductsProductIdInventoryUpdatePost` - 更新库存
- ✅ `ProductsProductIdPricesUpdatePost` - 更新价格
- ✅ `CategoriesGet` - 获取分类
- ✅ `CategoriesCategoryIdAttributesGet` - 获取分类属性
- ✅ `BrandsGet` - 获取品牌
- ✅ `ImagesUploadPost` - 上传图片

## 💡 经验教训

1. **API方法签名很重要**
   - 当调用SDK的方法时,必须严格按照方法签名传递参数
   - 即使某些参数是可选的,也需要传递`undefined`来占位

2. **TypeScript的优势**
   - 如果使用严格的TypeScript配置,编译器会在编译时发现这个错误
   - 建议启用更严格的TypeScript检查

3. **SDK版本管理**
   - SDK方法是自动生成的,签名会根据API规范变化
   - 升级SDK时需要仔细检查方法签名的变化

## 📚 相关文档

- [TikTok Shop API文档](https://partner.tiktokshop.com/docv2)
- [SDK代码](sdk/api/productV202309Api.ts)
- [产品服务代码](src/modules/product/product.service.ts)

## 🎯 后续建议

1. **启用严格TypeScript检查**
   ```json
   // tsconfig.json
   {
     "compilerOptions": {
       "strict": true,
       "noImplicitAny": true,
       "strictNullChecks": true
     }
   }
   ```

2. **添加单元测试**
   - 为每个API调用添加单元测试
   - 确保参数传递正确

3. **API调用封装**
   - 考虑创建API调用的封装层
   - 统一处理参数和错误

## ✅ 修复状态

- [x] 问题定位
- [x] 代码修复
- [ ] 服务重启
- [ ] 功能测试
- [ ] 验证修复效果

---

**修复时间**: 2026-01-13
**修复人**: Claude
**影响范围**: 产品搜索功能
**严重程度**: High (导致核心功能不可用)
