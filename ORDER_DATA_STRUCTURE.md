# TikTok Shop 订单数据结构说明

## 📊 订单数据概览

TikTok Shop的订单数据结构包含三个主要层级:
1. **订单列表响应** (Order List)
2. **订单详情** (Order Detail)
3. **订单项** (Line Items)

## 1. 订单列表响应 (Order List Response)

### API响应结构
```typescript
{
  code: number,              // 响应码,0表示成功
  message: string,           // 响应消息
  data: {
    next_page_token: string, // 下一页的分页token
    orders: Array<Order>,    // 订单数组
    total_count: number      // 总订单数
  }
}
```

### 核心字段说明
| 字段 | 类型 | 说明 |
|------|------|------|
| `next_page_token` | string | 用于获取下一页的token |
| `orders` | Array<Order> | 订单列表数组 |
| `total_count` | number | 符合条件的订单总数 |

## 2. 订单详情 (Order Detail)

### 完整订单对象结构

```typescript
{
  // ========== 基本信息 ==========
  id: string,                          // 订单ID ✅ 必需
  status: string,                      // 订单状态 ✅ 重要
  orderType: string,                   // 订单类型
  createTime: number,                  // 创建时间(Unix时间戳)
  updateTime: number,                  // 更新时间(Unix时间戳)
  paidTime: number,                    // 支付时间(Unix时间戳)

  // ========== 买家信息 ==========
  userId: string,                      // 买家用户ID
  buyerEmail: string,                  // 买家邮箱(匿名化)
  buyerMessage: string,                // 买家留言

  // ========== 订单金额 ==========
  payment: {                           // 支付信息对象
    payment_method: string,            // 支付方式
    payment_method_code: string,       // 支付方式代码
    payment_method_name: string,       // 支付方式名称(显示用)
    payment_card_type: string,         // 卡类型(借记卡/信用卡)
    payment_auth_code: string,         // 交易授权码
    // ...更多支付字段
  },

  // ========== 商品信息 ==========
  lineItems: Array<LineItem>,         // 订单项列表 ✅ 重要

  // ========== 收货地址 ==========
  recipientAddress: {                  // 收货地址对象
    country: string,                   // 国家
    province: string,                  // 省/州
    city: string,                      // 城市
    district: string,                  // 区
    address_line: string,              // 详细地址
    zip_code: string,                  // 邮编
    recipient_name: string,            // 收货人姓名
    recipient_phone: string,           // 收货人电话
    // ...更多地址字段
  },

  // ========== 包裹信息 ==========
  packages: Array<Package>,           // 包裹列表

  // ========== 物流信息 ==========
  shippingType: string,                // 配送方式(TIKTOK/SELLER)
  shippingProvider: string,            // 物流商名称
  shippingProviderId: string,          // 物流商ID
  trackingNumber: string,              // 追踪号码
  deliveryType: string,                // 配送类型(HOME_DELIVERY/COLLECTION_POINT)
  deliveryOptionId: string,            // 配送选项ID
  deliveryOptionName: string,          // 配送选项名称

  // ========== 时间节点 ==========
  collectionTime: number,              // 待揽收时间
  deliveryTime: number,                // 送达时间
  rtsTime: number,                     // 发货时间(卖家调用Ship Order成功)
  cancelTime: number,                  // 取消时间
  requestCancelTime: number,           // 请求取消时间

  // ========== SLA时间 ==========
  deliveryDueTime: number,             // 应送达时间
  shippingDueTime: number,             // 应发货时间
  collectionDueTime: number,           // 应揽收时间
  rtsSlaTime: number,                  // 最晚发货时间
  ttsSlaTime: number,                  // 最晚揽收时间
  deliverySlaTime: number,             // 送达SLA时间

  // ========== 订单标记 ==========
  isCod: boolean,                      // 是否货到付款
  isBuyerRequestCancel: boolean,       // 买家是否请求取消
  isExchangeOrder: boolean,            // 是否换货订单
  isReplacementOrder: boolean,         // 是否换货订单
  isSampleOrder: boolean,              // 是否样品订单
  isOnHoldOrder: boolean,              // 是否暂停订单
  hasUpdatedRecipientAddress: boolean, // 收货地址是否更新过

  // ========== 履约信息 ==========
  fulfillmentType: string,             // 履约类型
  fulfillmentPriorityLevel: number,   // 履约优先级
  warehouseId: string,                 // 仓库ID

  // ========== 其他信息 ==========
  sellerNote: string,                  // 卖家备注
  cancelReason: string,                // 取消原因
  cancellationInitiator: string,       // 取消发起人(SELLER/BUYER/SYSTEM)
  commercePlatform: string,            // 下单平台(TIKTOK_SHOP/TOKOPEDIA)

  // ========== 地区特定字段 ==========
  cpf: string,                         // CPF号码(巴西)
  cpfName: string,                     // CPF姓名(巴西)
  needUploadInvoice: string,           // 是否需要上传发票(巴西)

  // ========== 更多字段... ==========
  // 包含约70+个字段,详细见SDK定义
}
```

## 3. 订单项 (Line Items)

每个订单包含一个或多个订单项:

```typescript
{
  // ========== 基本信息 ==========
  id: string,                          // 订单项ID
  productId: string,                   // 产品ID
  skuId: string,                       // SKU ID ✅ 重要
  sellerSku: string,                   // 卖家SKU
  productName: string,                 // 产品名称
  skuName: string,                     // SKU名称(如"黑色, 26码")
  skuImage: string,                    // SKU图片URL

  // ========== 状态信息 ==========
  displayStatus: string,               // 显示状态
  packageStatus: string,               // 包裹状态
  packageId: string,                   // 包裹ID
  cancelReason: string,                // 取消原因
  cancelUser: string,                  // 取消用户

  // ========== 价格信息 ==========
  currency: string,                    // 货币代码
  originalPrice: string,               // 原价
  salePrice: string,                   // 售价
  platformDiscount: string,            // 平台折扣
  sellerDiscount: string,              // 卖家折扣
  giftRetailPrice: string,             // 礼品零售价

  // ========== 物流信息 ==========
  shippingProviderId: string,          // 物流商ID
  shippingProviderName: string,        // 物流商名称
  trackingNumber: string,              // 追踪号码
  rtsTime: number,                     // 发货时间
  isDangerousGood: boolean,            // 是否危险品

  // ========== 标记 ==========
  isGift: boolean,                     // 是否礼物
  needsPrescription: boolean,          // 是否需要处方

  // ========== 税费 ==========
  itemTax: Array<ItemTax>,            // 商品税费

  // ========== 虚拟组合SKU ==========
  combinedListingSkus: Array<{        // 组合SKU
    sku_id: string,
    quantity: number
  }>,

  // ========== 其他费用 ==========
  buyerServiceFee: string,             // 买家服务费(印尼)
  pfandFee: string,                    // 押金费(德国)
  retailDeliveryFee: string,          // 零配送费(美国)
  smallOrderFee: string,               // 小额订单费(泰国)
}
```

## 4. 包裹信息 (Package)

```typescript
{
  packageId: string,                   // 包裹ID
  trackingNumber: string,              // 追踪号码
  packageStatus: string,               // 包裹状态
  shippingProviderId: string,          // 物流商ID
  shippingProviderName: string,        // 物流商名称
  width: number,                       // 宽度(cm)
  height: number,                      // 高度(cm)
  length: number,                      // 长度(cm)
  weight: number,                      // 重量(g)
  // ...更多包裹字段
}
```

## 5. 收货地址 (Recipient Address)

```typescript
{
  country: string,                     // 国家代码
  province: string,                    // 省/州
  city: string,                        // 城市
  district: string,                    // 区
  address_line: string,                // 详细地址
  zip_code: string,                    // 邮编
  recipient_name: string,              // 收货人姓名
  recipient_phone: string,             // 收货人电话
  // ...更多地址字段
}
```

## 6. 订单状态 (Order Status)

### 状态列表
| 状态 | 说明 |
|------|------|
| `UNPAID` | 未支付 - 订单已下单但未完成支付 |
| `ON_HOLD` | 暂停 - 等待履约,买家仍可取消 |
| `AWAITING_SHIPMENT` | 待发货 - 订单已准备好,等待发货 |
| `PARTIALLY_SHIPPING` | 部分发货 - 部分商品已发货 |
| `AWAITING_COLLECTION` | 待揽收 - 已安排物流,等待揽收 |
| `IN_TRANSIT` | 运输中 - 包裹已被揽收,正在配送 |
| `DELIVERED` | 已送达 - 包裹已送达买家 |
| `COMPLETED` | 已完成 - 订单完成,不允许退货退款 |
| `CANCELLED` | 已取消 - 订单已取消 |

### 包裹状态 (Package Status)
| 状态 | 说明 |
|------|------|
| `TO_FULFILL` | 待履约 - 等待卖家安排发货 |
| `PROCESSING` | 处理中 - 已安排发货,等待揽收 |
| `FULFILLING` | 履约中 - 已被揽收,运输中 |
| `COMPLETED` | 已完成 - 已送达 |
| `CANCELLED` | 已取消 - 包裹已取消 |

## 7. 订单类型 (Order Type)

### 全球通用
| 类型 | 说明 |
|------|------|
| `NORMAL` | 常规订单 - 现货,立即购买和履约 |
| `ZERO_LOTTERY` | 直播抽奖订单 - TikTok直播抽奖活动 |

### 美国市场
| 类型 | 说明 |
|------|------|
| `PRE_ORDER` | 预购订单 - 尚未发布或发售的商品 |
| `MADE_TO_ORDER` | 按需生产 - 收到订单后才生产 |
| `BACK_ORDER` | 缺货订单 - 已缺货但预计会补货 |

## 8. 履约类型 (Fulfillment Type)

| 类型 | 说明 |
|------|------|
| `FULFILLMENT_BY_SELLER` | 卖家履约 - 卖家从自己的库存发货 |
| `FULFILLMENT_BY_TIKTOK` | TikTok履约 - 使用TikTok的履约中心 |
| `FULFILLMENT_BY_DILAYANI_TOKOPEDIA` | Tokopedia履约 - Tokopedia物流服务(印尼) |

## 9. 时间字段说明

所有时间字段都是**Unix时间戳**(秒级),需要转换:

```javascript
// Unix时间戳转换为日期
const timestamp = 1704067200;
const date = new Date(timestamp * 1000);
// 输出: 2024-01-01T00:00:00.000Z
```

### 重要时间字段
| 字段 | 说明 | 用途 |
|------|------|------|
| `createTime` | 创建时间 | 订单下单时间 |
| `paidTime` | 支付时间 | 付款完成时间 |
| `rtsTime` | 发货时间 | 卖家发货时间 |
| `deliveryTime` | 送达时间 | 送达买家时间 |
| `deliverySlaTime` | 送达SLA | 应在最晚此时间前送达 |
| `rtsSlaTime` | 发货SLA | 应在最晚此时间前发货 |

## 10. 示例订单数据

### 最小化订单对象
```json
{
  "id": "123456789",
  "status": "IN_TRANSIT",
  "createTime": 1704067200,
  "paidTime": 1704067300,
  "lineItems": [{
    "id": "item_001",
    "productId": "prod_123",
    "skuId": "sku_456",
    "productName": "测试商品",
    "skuName": "黑色, L码",
    "salePrice": "19.99",
    "currency": "USD",
    "quantity": 2
  }],
  "recipientAddress": {
    "recipient_name": "张三",
    "recipient_phone": "+1234567890",
    "country": "US",
    "province": "California",
    "city": "Los Angeles",
    "address_line": "123 Main St",
    "zip_code": "90001"
  },
  "payment": {
    "payment_method_name": "Credit Card"
  },
  "trackingNumber": "TN123456789"
}
```

## 11. 常见使用场景

### 场景1: 获取订单列表
```typescript
// API调用
POST /orders/search
Body: {
  page_size: 20,
  order_status: [111, 112]  // IN_TRANSIT状态码
}

// 响应
{
  data: {
    orders: [...],
    total_count: 150,
    next_page_token: "token_abc123"
  }
}
```

### 场景2: 获取订单详情
```typescript
// API调用
GET /orders/{orderId}

// 响应
{
  data: {
    order: {
      id: "123456",
      status: "IN_TRANSIT",
      lineItems: [...],
      recipientAddress: {...},
      // ...更多字段
    }
  }
}
```

### 场景3: 筛选待发货订单
```typescript
// 待发货订单状态
const status = "AWAITING_SHIPMENT";

// 或使用状态码
const statusCode = 111;  // UNPAID
// 111: UNPAID
// 112: ON_HOLD
// 113: AWAITING_SHIPMENT  ← 待发货
// 114: PARTIALLY_SHIPPING
// 115: AWAITING_COLLECTION
// 116: IN_TRANSIT
// 117: DELIVERED
// 118: COMPLETED
// 119: CANCELLED
```

## 12. SDK类型定义位置

完整的类型定义在以下文件:
```
sdk/model/order/V202309/
├── GetOrderDetailResponseDataOrders.ts          # 订单详情
├── GetOrderListResponseDataOrders.ts            # 订单列表项
├── GetOrderDetailResponseDataOrdersLineItems.ts # 订单项
├── GetOrderDetailResponseDataOrdersPackages.ts  # 包裹
├── GetOrderDetailResponseDataOrdersPayment.ts   # 支付信息
└── GetOrderDetailResponseDataOrdersRecipientAddress.ts # 收货地址
```

## 13. 重要提示

### ✅ 必需字段
每个订单对象必须包含:
- `id` - 订单ID
- `status` - 订单状态
- `createTime` - 创建时间
- `lineItems` - 至少一个订单项

### ⚠️ 可选字段
某些字段可能为`null`或`undefined`:
- `buyerEmail` - 可能为空
- `trackingNumber` - 发货前为空
- `cancelReason` - 未取消时为空
- 地区特定字段 - 仅在特定市场返回

### 💡 最佳实践
1. **时间处理**: 始终将Unix时间戳转换为可读日期
2. **状态检查**: 使用`status`字符串而非数字码
3. **分页**: 使用`next_page_token`处理大量订单
4. **地址验证**: 收货地址字段可能为空,需要验证
5. **金额处理**: 价格字段是字符串,需要正确解析

## 14. 相关API端点

### 订单查询
- `POST /orders/search` - 搜索订单列表
- `GET /orders/:orderId` - 获取订单详情
- `GET /orders/status/:status` - 按状态获取订单

### 订单筛选
- `GET /orders/by-time-range` - 按时间范围查询
- `GET /orders/recently-updated` - 获取最近更新订单

---

**文档版本**: V1.0
**最后更新**: 2026-01-13
**API版本**: Order V202309
**SDK路径**: `sdk/model/order/V202309/`
