# TikTok Shop Partner Backend API Documentation

## 目录
1. [快速开始](#快速开始)
2. [授权模块 API](#授权模块-api)
3. [店铺管理 API](#店铺管理-api)
4. [产品管理 API](#产品管理-api)
5. [订单管理 API](#订单管理-api)
6. [错误处理](#错误处理)

---

## 快速开始

### 环境配置

1. 复制 `.env.example` 为 `.env`
2. 填写你的 TikTok Shop 凭证：

```env
TIKTOK_APP_KEY=your_app_key_here
TIKTOK_APP_SECRET=your_app_secret_here
TIKTOK_SANDBOX=false
PORT=3000
NODE_ENV=development
```

### 安装依赖

```bash
pnpm install
```

### 启动服务

```bash
# 开发模式
pnpm run start:dev

# 生产模式
pnpm run build
pnpm run start:prod
```

---

## 授权模块 API

### 1. 获取授权链接

**GET** `/auth/authorization-url`

获取TikTok Shop的OAuth授权链接，引导用户进行授权。

**响应示例：**
```json
{
  "success": true,
  "data": {
    "authorization_url": "https://services.tiktokshop.com/open/authorize?service_id=YOUR_APP_KEY"
  }
}
```

---

### 2. OAuth回调处理

**GET** `/auth/callback?code=xxx`

处理TikTok的OAuth回调，通过授权码获取Access Token。

**查询参数：**
- `code` (string, required): 授权码

**响应示例：**
```json
{
  "success": true,
  "message": "Authorization successful",
  "data": {
    "access_token": "xxx",
    "refresh_token": "xxx",
    "access_token_expire_in": 1234567890,
    "refresh_token_expire_in": 1234567890,
    "open_id": "seller_open_id",
    "seller_name": "Shop Name",
    "seller_base_region": "US",
    "user_type": 0
  }
}
```

**重要提示：**
- `access_token` 有效期为 **7天**
- 需要将token信息保存到数据库
- `open_id` 是卖家的唯一标识

---

### 3. 刷新Access Token

**POST** `/auth/refresh`

刷新过期的Access Token。

**请求体：**
```json
{
  "refresh_token": "your_refresh_token"
}
```

**响应示例：**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "access_token": "new_access_token",
    "refresh_token": "new_refresh_token",
    "access_token_expire_in": 1234567890,
    "refresh_token_expire_in": 1234567890
  }
}
```

---

### 4. 验证Token是否过期

**POST** `/auth/validate`

验证Token是否需要刷新。

**请求体：**
```json
{
  "expire_time": 1234567890
}
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "is_expired": false,
    "needs_refresh": false
  }
}
```

---

## 店铺管理 API

所有店铺管理API需要在请求头中携带Access Token：
```
Authorization: Bearer <access_token>
```

### 1. 获取已授权的店铺列表

**GET** `/shops/authorized`

获取当前用户已授权的所有店铺。

**响应示例：**
```json
{
  "success": true,
  "data": {
    "shops": [
      {
        "shop_id": "123456",
        "shop_name": "My Shop",
        "cipher": "shop_cipher_xxx",
        "code": "shop_code",
        "region": "US",
        "seller_type": "LOCAL"
      }
    ],
    "count": 1
  }
}
```

**重要提示：**
- `cipher` 字段非常重要，后续所有产品相关API都需要使用此值

---

### 2. 获取店铺详细信息

**GET** `/shops/details`

获取店铺的详细信息。

**响应示例：**
```json
{
  "success": true,
  "data": {
    "shops": [
      {
        "id": "123456",
        "name": "My Shop",
        "code": "shop_code",
        "region": "US",
        "seller_type": "LOCAL",
        "status": 1
      }
    ],
    "count": 1
  }
}
```

---

### 3. 获取店铺权限

**GET** `/shops/permissions`

获取当前应用对店铺的权限列表。

**响应示例：**
```json
{
  "success": true,
  "data": {
    "permissions": [
      {
        "permission": "PRODUCT_READ",
        "granted": true
      },
      {
        "permission": "ORDER_READ",
        "granted": true
      }
    ]
  }
}
```

---

### 4. 取消店铺授权

**DELETE** `/shops/:shopId/authorization`

取消应用对指定店铺的授权。

**查询参数：**
- `shopId` (string, required): 店铺ID

**响应示例：**
```json
{
  "success": true,
  "message": "Shop authorization removed successfully"
}
```

---

### 5. 获取Widget Token

**GET** `/shops/widget-token`

获取用于前端集成的Widget Token。

**查询参数：**
- `shop_id` (string, optional): 店铺ID

**响应示例：**
```json
{
  "success": true,
  "data": {
    "widget_token": "widget_token_xxx"
  }
}
```

---

## 产品管理 API

所有产品管理API需要在请求头中携带：
```
Authorization: Bearer <access_token>
X-Shop-Cipher: <shop_cipher>
```

### 1. 搜索产品

**POST** `/products/search`

根据条件搜索产品。

**请求体：**
```json
{
  "page_number": 1,
  "page_size": 20,
  "search_status": 4,
  "title": "T-Shirt",
  "product_ids": ["prod_123", "prod_456"]
}
```

**参数说明：**
- `search_status`: 产品状态
  - `2`: 草稿
  - `3`: 待激活
  - `4`: 已激活
  - `5`: 已停用
  - `6`: 已冻结
  - `7`: 已删除

**响应示例：**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "prod_123",
        "title": "Cotton T-Shirt",
        "status": 4,
        "main_images": [
          {
            "url": "https://...",
            "width": 800,
            "height": 800
          }
        ],
        "skus": [
          {
            "id": "sku_123",
            "price": {
              "amount": "19.99",
              "currency": "USD"
            },
            "available_stock": 100
          }
        ]
      }
    ],
    "total": 50,
    "page_info": {
      "page": 1,
      "page_size": 20,
      "total_count": 50
    }
  }
}
```

---

### 2. 获取产品详情

**GET** `/products/:productId`

获取指定产品的详细信息。

**响应示例：**
```json
{
  "success": true,
  "data": {
    "product": {
      "id": "prod_123",
      "title": "Cotton T-Shirt",
      "description": "High quality cotton t-shirt",
      "status": 4,
      "category_id": "cat_123",
      "brand_id": "brand_123",
      "main_images": [...],
      "skus": [...],
      "create_time": 1234567890,
      "update_time": 1234567890
    }
  }
}
```

---

### 3. 创建产品

**POST** `/products`

创建新产品。

**请求体：**
```json
{
  "title": "Cotton T-Shirt",
  "description": "High quality cotton t-shirt",
  "category_id": "cat_123",
  "brand_id": "brand_123",
  "main_images": [
    {
      "uri": "image_uri_from_upload"
    }
  ],
  "skus": [
    {
      "seller_sku": "SKU-001",
      "price": {
        "amount": "19.99",
        "currency": "USD"
      },
      "available_stock": 100,
      "sales_attributes": [
        {
          "attribute_id": "color",
          "attribute_name": "Color",
          "value_id": "red",
          "value_name": "Red"
        }
      ]
    }
  ],
  "package_dimensions": {
    "length": "10",
    "width": "10",
    "height": "2",
    "unit": "CM"
  },
  "package_weight": {
    "value": "0.5",
    "unit": "KG"
  },
  "is_cod_open": false
}
```

**响应示例：**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "product_id": "prod_123",
    "warnings": []
  }
}
```

---

### 4. 更新产品（全量更新）

**PUT** `/products/:productId`

全量更新产品信息。

**请求体：** 与创建产品相同

**响应示例：**
```json
{
  "success": true,
  "message": "Product updated successfully"
}
```

---

### 5. 部分编辑产品

**POST** `/products/:productId/partial-edit`

只更新产品的部分字段。

**请求体：**
```json
{
  "title": "Updated Title",
  "description": "Updated Description"
}
```

**响应示例：**
```json
{
  "success": true,
  "message": "Product partially edited successfully"
}
```

---

### 6. 激活产品（上架）

**POST** `/products/activate`

批量激活产品。

**请求体：**
```json
{
  "product_ids": ["prod_123", "prod_456"]
}
```

**响应示例：**
```json
{
  "success": true,
  "message": "Products activation completed",
  "data": {
    "success_count": 2,
    "failed_count": 0,
    "failed_list": []
  }
}
```

---

### 7. 停用产品（下架）

**POST** `/products/deactivate`

批量停用产品。

**请求体：** 与激活产品相同

**响应示例：** 与激活产品相同

---

### 8. 删除产品

**DELETE** `/products`

批量删除产品。

**请求体：**
```json
{
  "product_ids": ["prod_123", "prod_456"]
}
```

**响应示例：**
```json
{
  "success": true,
  "message": "Products deleted successfully"
}
```

---

### 9. 更新产品库存

**POST** `/products/:productId/inventory`

更新产品SKU的库存。

**请求体：**
```json
{
  "skus": [
    {
      "id": "sku_123",
      "available_stock": 150
    }
  ]
}
```

**响应示例：**
```json
{
  "success": true,
  "message": "Inventory updated successfully"
}
```

---

### 10. 更新产品价格

**POST** `/products/:productId/price`

更新产品SKU的价格。

**请求体：**
```json
{
  "skus": [
    {
      "id": "sku_123",
      "price": {
        "amount": "24.99",
        "currency": "USD"
      }
    }
  ]
}
```

**响应示例：**
```json
{
  "success": true,
  "message": "Price updated successfully"
}
```

---

### 11. 获取分类列表

**GET** `/products/metadata/categories`

获取TikTok Shop的产品分类列表。

**查询参数：**
- `locale` (string, optional): 语言代码，如 `en-US`, `zh-CN`

**响应示例：**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "cat_123",
        "parent_id": "0",
        "local_name": "Clothing",
        "is_leaf": false
      }
    ]
  }
}
```

---

### 12. 获取分类属性

**GET** `/products/metadata/categories/:categoryId/attributes`

获取指定分类的属性列表。

**响应示例：**
```json
{
  "success": true,
  "data": {
    "attributes": [
      {
        "id": "attr_123",
        "name": "Color",
        "is_required": true,
        "type": "SINGLE_SELECT",
        "values": [
          {
            "id": "red",
            "name": "Red"
          }
        ]
      }
    ]
  }
}
```

---

### 13. 获取品牌列表

**GET** `/products/metadata/brands`

获取可用的品牌列表。

**查询参数：**
- `page_number` (number, optional): 页码
- `page_size` (number, optional): 每页数量
- `brand_name` (string, optional): 品牌名称搜索
- `category_id` (string, optional): 分类ID筛选

**响应示例：**
```json
{
  "success": true,
  "data": {
    "brands": [
      {
        "id": "brand_123",
        "name": "Nike",
        "status": "ACTIVE"
      }
    ],
    "total": 100
  }
}
```

---

### 14. 上传产品图片

**POST** `/products/images/upload`

上传产品图片（multipart/form-data）。

**请求：**
- Content-Type: `multipart/form-data`
- 字段名: `file`

**响应示例：**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "url": "https://...",
    "uri": "image_uri_xxx",
    "width": 800,
    "height": 800
  }
}
```

---

## 订单管理 API

所有订单管理API需要在请求头中携带：
```
Authorization: Bearer <access_token>
X-Shop-Cipher: <shop_cipher> (部分接口需要)
```

### 1. 搜索订单

**POST** `/orders/search`

根据条件搜索订单。

**请求体：**
```json
{
  "shop_cipher": "shop_cipher_xxx",
  "sort_by": "CREATE_TIME",
  "sort_order": "DESC",
  "order_status": [111, 112],
  "page_number": 1,
  "page_size": 20,
  "create_time_ge": 1234567890,
  "create_time_lt": 1234567900
}
```

**订单状态说明：**
- `100`: 未付款
- `111`: 待发货
- `112`: 部分发货
- `114`: 已发货待揽收
- `121`: 运输中
- `122`: 已送达
- `130`: 已完成
- `140`: 已取消

**响应示例：**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "order_123",
        "status": 111,
        "create_time": 1234567890,
        "update_time": 1234567890,
        "payment": {
          "currency": "USD",
          "total_amount": "29.99",
          "sub_total": "25.99",
          "shipping_fee": "4.00",
          "tax": "0.00"
        },
        "line_items": [
          {
            "product_id": "prod_123",
            "product_name": "Cotton T-Shirt",
            "quantity": 2,
            "sale_price": {
              "amount": "12.99",
              "currency": "USD"
            }
          }
        ],
        "recipient_address": {
          "name": "John Doe",
          "phone": "+1234567890",
          "full_address": "123 Main St, City, State 12345",
          "region_code": "US"
        }
      }
    ],
    "total": 100,
    "page_info": {
      "page": 1,
      "page_size": 20,
      "total_count": 100
    }
  }
}
```

---

### 2. 获取订单详情

**GET** `/orders/:orderId`

获取指定订单的详细信息。

**响应示例：**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "order_123",
      "status": 111,
      "create_time": 1234567890,
      "update_time": 1234567890,
      "payment": {...},
      "line_items": [...],
      "recipient_address": {...},
      "tracking_number": "TRACK123",
      "fulfillment_type": 1,
      "buyer_email": "buyer@example.com",
      "buyer_message": "Please pack carefully"
    }
  }
}
```

---

### 3. 获取待发货订单

**GET** `/orders/status/pending-shipment`

获取所有待发货的订单（包括待发货和部分发货状态）。

**查询参数：**
- `page` (number, optional): 页码，默认1
- `page_size` (number, optional): 每页数量，默认20

**响应示例：** 与搜索订单相同

---

### 4. 获取运输中订单

**GET** `/orders/status/in-transit`

获取所有运输中的订单。

**查询参数：** 与待发货订单相同

**响应示例：** 与搜索订单相同

---

### 5. 获取已完成订单

**GET** `/orders/status/completed`

获取所有已完成的订单。

**查询参数：** 与待发货订单相同

**响应示例：** 与搜索订单相同

---

### 6. 根据时间范围获取订单

**GET** `/orders/filters/by-time-range`

根据创建时间范围获取订单。

**查询参数：**
- `start_time` (number, required): 开始时间（Unix时间戳）
- `end_time` (number, required): 结束时间（Unix时间戳）
- `page` (number, optional): 页码
- `page_size` (number, optional): 每页数量

**响应示例：** 与搜索订单相同

---

### 7. 获取最近更新的订单

**GET** `/orders/filters/recently-updated`

获取最近N分钟内更新的订单。

**查询参数：**
- `minutes` (number, optional): 分钟数，默认30
- `page` (number, optional): 页码
- `page_size` (number, optional): 每页数量

**响应示例：** 与搜索订单相同

---

## 错误处理

所有API在发生错误时返回统一的错误格式：

```json
{
  "statusCode": 400,
  "message": "Error message here",
  "error": "Bad Request"
}
```

### 常见错误码

- `400 Bad Request`: 请求参数错误
- `401 Unauthorized`: 未授权或Token失效
- `403 Forbidden`: 权限不足
- `404 Not Found`: 资源不存在
- `500 Internal Server Error`: 服务器内部错误

### TikTok API错误码

TikTok API返回的错误会在响应中包含：
```json
{
  "code": 10001,
  "message": "Invalid access token",
  "request_id": "xxx"
}
```

---

## 最佳实践

### 1. Token管理

- 实现Token自动刷新机制
- 在Token过期前5分钟进行刷新
- 将Token安全存储在数据库中

### 2. 错误处理

- 实现重试机制（特别是网络错误）
- 记录所有API调用日志
- 监控API调用失败率

### 3. 性能优化

- 使用分页查询避免一次性加载大量数据
- 实现缓存机制（如分类、品牌列表）
- 批量操作优于单个操作（如批量上架产品）

### 4. 安全性

- 不要在客户端暴露 `app_secret`
- 使用HTTPS传输数据
- 实现请求频率限制

---

## 技术支持

如有问题，请参考：
- [TikTok Shop官方文档](https://partner.tiktokshop.com/docv2)
- 项目GitHub Issues

---

**版本**: v1.0.0
**最后更新**: 2026-01-12
