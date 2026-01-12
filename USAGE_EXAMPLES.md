# TikTok Shop API 使用示例

本文档提供了完整的使用示例，展示如何集成TikTok Shop API到你的应用中。

## 目录

1. [完整的OAuth授权流程](#完整的oauth授权流程)
2. [店铺管理示例](#店铺管理示例)
3. [产品管理示例](#产品管理示例)
4. [订单管理示例](#订单管理示例)
5. [实际业务场景](#实际业务场景)

---

## 完整的OAuth授权流程

### 场景：用户首次授权店铺

```typescript
// 1. 前端：引导用户到授权页面
async function initiateAuthorization() {
  const response = await fetch('http://localhost:3000/auth/authorization-url');
  const data = await response.json();

  // 跳转到TikTok授权页面
  window.location.href = data.data.authorization_url;
}

// 2. 后端：处理OAuth回调
// 用户授权后，TikTok会重定向到你的回调URL，携带code参数
// 例如: https://your-domain.com/callback?code=xxx

// 3. 前端：接收回调并获取Token
async function handleCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  const authCode = urlParams.get('code');

  const response = await fetch(`http://localhost:3000/auth/callback?code=${authCode}`);
  const data = await response.json();

  if (data.success) {
    // 保存Token到localStorage或状态管理
    localStorage.setItem('access_token', data.data.access_token);
    localStorage.setItem('refresh_token', data.data.refresh_token);
    localStorage.setItem('token_expire_time', data.data.access_token_expire_in);
    localStorage.setItem('open_id', data.data.open_id);

    console.log('授权成功！卖家：', data.data.seller_name);

    // 跳转到主页面
    window.location.href = '/dashboard';
  }
}

// 4. Token自动刷新机制
async function ensureValidToken() {
  const accessToken = localStorage.getItem('access_token');
  const refreshToken = localStorage.getItem('refresh_token');
  const expireTime = parseInt(localStorage.getItem('token_expire_time'));

  const now = Math.floor(Date.now() / 1000);

  // 如果Token在5分钟内过期，则刷新
  if (now >= expireTime - 300) {
    const response = await fetch('http://localhost:3000/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    const data = await response.json();

    if (data.success) {
      localStorage.setItem('access_token', data.data.access_token);
      localStorage.setItem('refresh_token', data.data.refresh_token);
      localStorage.setItem('token_expire_time', data.data.access_token_expire_in);
      return data.data.access_token;
    }
  }

  return accessToken;
}
```

---

## 店铺管理示例

### 场景1：获取店铺列表并选择店铺

```typescript
async function loadShopsAndSelectFirst() {
  const accessToken = await ensureValidToken();

  // 获取已授权的店铺列表
  const response = await fetch('http://localhost:3000/shops/authorized', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();

  if (data.success) {
    const shops = data.data.shops;
    console.log('已授权店铺数量：', shops.length);

    // 保存第一个店铺的cipher（后续产品API需要）
    const firstShop = shops[0];
    localStorage.setItem('shop_cipher', firstShop.cipher);
    localStorage.setItem('shop_id', firstShop.shop_id);
    localStorage.setItem('shop_name', firstShop.shop_name);

    console.log('当前店铺：', firstShop.shop_name);
    return shops;
  }
}
```

### 场景2：检查店铺权限

```typescript
async function checkShopPermissions() {
  const accessToken = await ensureValidToken();

  const response = await fetch('http://localhost:3000/shops/permissions', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();

  if (data.success) {
    const permissions = data.data.permissions;

    permissions.forEach(perm => {
      console.log(`${perm.permission}: ${perm.granted ? '✓' : '✗'}`);
    });

    return permissions;
  }
}
```

---

## 产品管理示例

### 场景1：创建新产品

```typescript
async function createNewProduct() {
  const accessToken = await ensureValidToken();
  const shopCipher = localStorage.getItem('shop_cipher');

  // 1. 先上传产品图片
  const imageFile = document.getElementById('productImage').files[0];
  const formData = new FormData();
  formData.append('file', imageFile);

  const uploadResponse = await fetch('http://localhost:3000/products/images/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'X-Shop-Cipher': shopCipher,
    },
    body: formData,
  });

  const uploadData = await uploadResponse.json();
  const imageUri = uploadData.data.uri;

  // 2. 创建产品
  const productData = {
    title: "Cotton T-Shirt",
    description: "High quality 100% cotton t-shirt, comfortable and breathable.",
    category_id: "703",  // 需要先获取分类ID
    brand_id: "12345",    // 需要先获取品牌ID
    main_images: [
      {
        uri: imageUri
      }
    ],
    skus: [
      {
        seller_sku: "TSHIRT-RED-M",
        price: {
          amount: "19.99",
          currency: "USD"
        },
        available_stock: 100,
        sales_attributes: [
          {
            attribute_id: "100000",
            attribute_name: "Color",
            value_id: "100001",
            value_name: "Red"
          },
          {
            attribute_id: "100002",
            attribute_name: "Size",
            value_id: "100003",
            value_name: "M"
          }
        ]
      },
      {
        seller_sku: "TSHIRT-BLUE-M",
        price: {
          amount: "19.99",
          currency: "USD"
        },
        available_stock: 50,
        sales_attributes: [
          {
            attribute_id: "100000",
            attribute_name: "Color",
            value_id: "100004",
            value_name: "Blue"
          },
          {
            attribute_id: "100002",
            attribute_name: "Size",
            value_id: "100003",
            value_name: "M"
          }
        ]
      }
    ],
    package_dimensions: {
      length: "30",
      width: "20",
      height: "5",
      unit: "CM"
    },
    package_weight: {
      value: "0.3",
      unit: "KG"
    },
    is_cod_open: false
  };

  const response = await fetch('http://localhost:3000/products', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'X-Shop-Cipher': shopCipher,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(productData),
  });

  const data = await response.json();

  if (data.success) {
    console.log('产品创建成功！产品ID：', data.data.product_id);
    return data.data.product_id;
  }
}
```

### 场景2：获取分类和品牌信息

```typescript
async function getProductMetadata() {
  const accessToken = await ensureValidToken();
  const shopCipher = localStorage.getItem('shop_cipher');

  // 1. 获取分类列表
  const categoriesResponse = await fetch(
    'http://localhost:3000/products/metadata/categories?locale=en-US',
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Shop-Cipher': shopCipher,
      },
    }
  );

  const categoriesData = await categoriesResponse.json();
  const categories = categoriesData.data.categories;

  console.log('可用分类数量：', categories.length);

  // 2. 获取特定分类的属性
  const categoryId = categories[0].id;
  const attributesResponse = await fetch(
    `http://localhost:3000/products/metadata/categories/${categoryId}/attributes`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Shop-Cipher': shopCipher,
      },
    }
  );

  const attributesData = await attributesResponse.json();
  const attributes = attributesData.data.attributes;

  console.log('分类属性：', attributes);

  // 3. 获取品牌列表
  const brandsResponse = await fetch(
    'http://localhost:3000/products/metadata/brands?page_number=1&page_size=50',
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Shop-Cipher': shopCipher,
      },
    }
  );

  const brandsData = await brandsResponse.json();
  const brands = brandsData.data.brands;

  console.log('可用品牌数量：', brands.length);

  return { categories, attributes, brands };
}
```

### 场景3：批量管理产品

```typescript
async function batchManageProducts() {
  const accessToken = await ensureValidToken();
  const shopCipher = localStorage.getItem('shop_cipher');

  // 1. 搜索所有草稿状态的产品
  const searchResponse = await fetch('http://localhost:3000/products/search', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'X-Shop-Cipher': shopCipher,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      search_status: 2,  // 草稿
      page_number: 1,
      page_size: 100
    }),
  });

  const searchData = await searchResponse.json();
  const draftProducts = searchData.data.products;

  console.log('草稿产品数量：', draftProducts.length);

  // 2. 批量激活产品
  if (draftProducts.length > 0) {
    const productIds = draftProducts.map(p => p.id);

    const activateResponse = await fetch('http://localhost:3000/products/activate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Shop-Cipher': shopCipher,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ product_ids: productIds }),
    });

    const activateData = await activateResponse.json();

    console.log('激活成功：', activateData.data.success_count);
    console.log('激活失败：', activateData.data.failed_count);

    if (activateData.data.failed_list.length > 0) {
      console.log('失败列表：', activateData.data.failed_list);
    }
  }
}
```

### 场景4：更新库存和价格

```typescript
async function updateProductInventoryAndPrice(productId: string) {
  const accessToken = await ensureValidToken();
  const shopCipher = localStorage.getItem('shop_cipher');

  // 1. 先获取产品详情，了解SKU信息
  const detailResponse = await fetch(`http://localhost:3000/products/${productId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'X-Shop-Cipher': shopCipher,
    },
  });

  const detailData = await detailResponse.json();
  const product = detailData.data.product;

  console.log('产品SKU数量：', product.skus.length);

  // 2. 更新库存
  const inventoryUpdates = product.skus.map(sku => ({
    id: sku.id,
    available_stock: sku.available_stock + 50  // 增加50个库存
  }));

  const inventoryResponse = await fetch(
    `http://localhost:3000/products/${productId}/inventory`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Shop-Cipher': shopCipher,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ skus: inventoryUpdates }),
    }
  );

  const inventoryData = await inventoryResponse.json();
  console.log('库存更新成功：', inventoryData.success);

  // 3. 更新价格（降价10%）
  const priceUpdates = product.skus.map(sku => ({
    id: sku.id,
    price: {
      amount: (parseFloat(sku.price.amount) * 0.9).toFixed(2),
      currency: sku.price.currency
    }
  }));

  const priceResponse = await fetch(
    `http://localhost:3000/products/${productId}/price`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Shop-Cipher': shopCipher,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ skus: priceUpdates }),
    }
  );

  const priceData = await priceResponse.json();
  console.log('价格更新成功：', priceData.success);
}
```

---

## 订单管理示例

### 场景1：获取待发货订单并显示

```typescript
async function displayPendingShipmentOrders() {
  const accessToken = await ensureValidToken();
  const shopCipher = localStorage.getItem('shop_cipher');

  const response = await fetch(
    'http://localhost:3000/orders/status/pending-shipment?page=1&page_size=20',
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Shop-Cipher': shopCipher,
      },
    }
  );

  const data = await response.json();

  if (data.success) {
    const orders = data.data.orders;

    console.log('待发货订单数量：', orders.length);
    console.log('总订单数：', data.data.total);

    orders.forEach(order => {
      console.log(`订单 ${order.id}:`);
      console.log(`  - 状态: ${getOrderStatusName(order.status)}`);
      console.log(`  - 总金额: ${order.payment.currency} ${order.payment.total_amount}`);
      console.log(`  - 商品数量: ${order.line_items.length}`);
      console.log(`  - 收货人: ${order.recipient_address.name}`);
      console.log(`  - 地址: ${order.recipient_address.full_address}`);
    });

    return orders;
  }
}

function getOrderStatusName(status: number): string {
  const statusMap = {
    100: '未付款',
    111: '待发货',
    112: '部分发货',
    114: '已发货待揽收',
    121: '运输中',
    122: '已送达',
    130: '已完成',
    140: '已取消'
  };
  return statusMap[status] || '未知状态';
}
```

### 场景2：搜索特定时间段的订单

```typescript
async function searchOrdersByDateRange(startDate: Date, endDate: Date) {
  const accessToken = await ensureValidToken();
  const shopCipher = localStorage.getItem('shop_cipher');

  const startTime = Math.floor(startDate.getTime() / 1000);
  const endTime = Math.floor(endDate.getTime() / 1000);

  const response = await fetch(
    `http://localhost:3000/orders/filters/by-time-range?start_time=${startTime}&end_time=${endTime}&page=1&page_size=100`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Shop-Cipher': shopCipher,
      },
    }
  );

  const data = await response.json();

  if (data.success) {
    const orders = data.data.orders;

    // 计算统计信息
    const stats = {
      total_orders: orders.length,
      total_revenue: 0,
      average_order_value: 0,
      by_status: {}
    };

    orders.forEach(order => {
      stats.total_revenue += parseFloat(order.payment.total_amount);

      const statusName = getOrderStatusName(order.status);
      if (!stats.by_status[statusName]) {
        stats.by_status[statusName] = 0;
      }
      stats.by_status[statusName]++;
    });

    stats.average_order_value = stats.total_revenue / stats.total_orders;

    console.log('订单统计：', stats);

    return { orders, stats };
  }
}
```

### 场景3：获取订单详情并导出

```typescript
async function exportOrderDetails(orderId: string) {
  const accessToken = await ensureValidToken();

  const response = await fetch(`http://localhost:3000/orders/${orderId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();

  if (data.success) {
    const order = data.data.order;

    // 生成订单报表
    const report = {
      order_info: {
        order_id: order.id,
        status: getOrderStatusName(order.status),
        create_time: new Date(order.create_time * 1000).toLocaleString(),
        update_time: new Date(order.update_time * 1000).toLocaleString(),
      },
      payment_info: {
        currency: order.payment.currency,
        subtotal: order.payment.sub_total,
        shipping_fee: order.payment.shipping_fee,
        tax: order.payment.tax,
        total: order.payment.total_amount,
      },
      items: order.line_items.map(item => ({
        product_name: item.product_name,
        sku_name: item.sku_name,
        quantity: item.quantity,
        unit_price: item.sale_price.amount,
        total: (parseFloat(item.sale_price.amount) * item.quantity).toFixed(2),
      })),
      shipping_info: {
        recipient: order.recipient_address.name,
        phone: order.recipient_address.phone,
        address: order.recipient_address.full_address,
        tracking_number: order.tracking_number,
      },
      buyer_info: {
        email: order.buyer_email,
        message: order.buyer_message,
      }
    };

    console.log('订单报表：', JSON.stringify(report, null, 2));

    // 可以保存为JSON或CSV文件
    return report;
  }
}
```

---

## 实际业务场景

### 场景1：完整的产品上架流程

```typescript
async function completeProductListingWorkflow() {
  console.log('开始产品上架流程...');

  // Step 1: 确保Token有效
  const accessToken = await ensureValidToken();
  const shopCipher = localStorage.getItem('shop_cipher');

  // Step 2: 获取必要的元数据
  console.log('获取分类和品牌信息...');
  const { categories, brands } = await getProductMetadata();

  // Step 3: 选择分类并获取属性
  const selectedCategory = categories.find(c => c.local_name === 'Clothing');

  // Step 4: 上传产品图片
  console.log('上传产品图片...');
  const imageUris = [];
  // ... 上传多张图片的逻辑

  // Step 5: 创建产品
  console.log('创建产品...');
  const productId = await createNewProduct();

  // Step 6: 激活产品
  console.log('激活产品...');
  await fetch('http://localhost:3000/products/activate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'X-Shop-Cipher': shopCipher,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ product_ids: [productId] }),
  });

  console.log('产品上架完成！产品ID：', productId);
  return productId;
}
```

### 场景2：订单处理工作流

```typescript
async function orderFulfillmentWorkflow() {
  const accessToken = await ensureValidToken();
  const shopCipher = localStorage.getItem('shop_cipher');

  // 1. 获取待发货订单
  console.log('获取待发货订单...');
  const response = await fetch(
    'http://localhost:3000/orders/status/pending-shipment',
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Shop-Cipher': shopCipher,
      },
    }
  );

  const data = await response.json();
  const orders = data.data.orders;

  console.log(`找到 ${orders.length} 个待发货订单`);

  // 2. 对每个订单进行处理
  for (const order of orders) {
    console.log(`\n处理订单 ${order.id}...`);

    // 2.1 获取订单详情
    const detailResponse = await fetch(`http://localhost:3000/orders/${order.id}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    const detailData = await detailResponse.json();
    const orderDetail = detailData.data.order;

    // 2.2 验证库存
    console.log('验证库存...');
    for (const item of orderDetail.line_items) {
      // 检查库存是否充足
      const productResponse = await fetch(
        `http://localhost:3000/products/${item.product_id}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-Shop-Cipher': shopCipher,
          },
        }
      );
      // ... 库存验证逻辑
    }

    // 2.3 生成发货单
    console.log('生成发货单...');
    const packingSlip = generatePackingSlip(orderDetail);

    // 2.4 这里可以调用配送API创建包裹
    // await createPackage(orderDetail);

    console.log(`订单 ${order.id} 处理完成`);
  }

  console.log('\n所有订单处理完成！');
}

function generatePackingSlip(order: any) {
  return {
    order_id: order.id,
    items: order.line_items.map(item => ({
      product: item.product_name,
      sku: item.sku_name,
      quantity: item.quantity,
    })),
    ship_to: order.recipient_address,
    notes: order.buyer_message,
  };
}
```

### 场景3：定时任务 - Token自动刷新

```typescript
// 在服务端运行的定时任务
import { CronJob } from 'cron';

// 每天凌晨2点执行Token刷新检查
const tokenRefreshJob = new CronJob('0 2 * * *', async () => {
  console.log('开始Token刷新检查...');

  // 从数据库获取所有用户的Token信息
  const users = await database.getAllUsers();

  for (const user of users) {
    const now = Math.floor(Date.now() / 1000);
    const expireTime = user.token_expire_time;

    // 如果Token在24小时内过期，进行刷新
    if (now >= expireTime - 86400) {
      try {
        const response = await fetch('http://localhost:3000/auth/refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh_token: user.refresh_token }),
        });

        const data = await response.json();

        if (data.success) {
          // 更新数据库
          await database.updateUserToken(user.id, {
            access_token: data.data.access_token,
            refresh_token: data.data.refresh_token,
            token_expire_time: data.data.access_token_expire_in,
          });

          console.log(`用户 ${user.id} 的Token刷新成功`);
        }
      } catch (error) {
        console.error(`用户 ${user.id} 的Token刷新失败:`, error);
      }
    }
  }

  console.log('Token刷新检查完成');
});

tokenRefreshJob.start();
```

### 场景4：Webhook集成（订单更新通知）

```typescript
// 这是TikTok Shop发送Webhook通知时的处理示例
import { Request, Response } from 'express';

// 接收TikTok Webhook
app.post('/webhooks/tiktok', async (req: Request, res: Response) => {
  const event = req.body;

  console.log('收到Webhook事件:', event.type);

  switch (event.type) {
    case 'ORDER_STATUS_UPDATE':
      await handleOrderStatusUpdate(event.data);
      break;

    case 'PRODUCT_STATUS_UPDATE':
      await handleProductStatusUpdate(event.data);
      break;

    case 'INVENTORY_UPDATE':
      await handleInventoryUpdate(event.data);
      break;

    default:
      console.log('未知事件类型:', event.type);
  }

  res.status(200).json({ success: true });
});

async function handleOrderStatusUpdate(data: any) {
  const orderId = data.order_id;
  const newStatus = data.status;

  console.log(`订单 ${orderId} 状态更新为: ${getOrderStatusName(newStatus)}`);

  // 更新本地数据库
  await database.updateOrderStatus(orderId, newStatus);

  // 发送通知给用户
  if (newStatus === 122) {  // 已送达
    await sendEmailNotification(orderId, '您的订单已送达！');
  }
}
```

---

## 错误处理最佳实践

```typescript
async function apiCallWithRetry(apiFunction: Function, maxRetries = 3) {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiFunction();
    } catch (error) {
      lastError = error;

      // 如果是Token过期错误，先刷新Token再重试
      if (error.statusCode === 401) {
        await ensureValidToken();
        continue;
      }

      // 如果是限流错误，等待后重试
      if (error.statusCode === 429) {
        const waitTime = Math.pow(2, i) * 1000;  // 指数退避
        console.log(`限流错误，等待 ${waitTime}ms 后重试...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      // 其他错误直接抛出
      throw error;
    }
  }

  throw lastError;
}

// 使用示例
const result = await apiCallWithRetry(async () => {
  return await fetch('http://localhost:3000/products/search', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'X-Shop-Cipher': shopCipher,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ page_number: 1, page_size: 20 }),
  });
});
```

---

## 性能优化建议

```typescript
// 1. 使用批量操作
async function optimizedProductActivation(productIds: string[]) {
  const BATCH_SIZE = 50;  // TikTok API建议的批量大小

  for (let i = 0; i < productIds.length; i += BATCH_SIZE) {
    const batch = productIds.slice(i, i + BATCH_SIZE);

    await fetch('http://localhost:3000/products/activate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Shop-Cipher': shopCipher,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ product_ids: batch }),
    });

    console.log(`已处理 ${Math.min(i + BATCH_SIZE, productIds.length)} / ${productIds.length} 个产品`);
  }
}

// 2. 缓存分类和品牌数据
const metadataCache = {
  categories: null,
  brands: null,
  lastUpdate: 0,
  CACHE_DURATION: 24 * 60 * 60 * 1000,  // 24小时
};

async function getCachedMetadata() {
  const now = Date.now();

  if (!metadataCache.categories || now - metadataCache.lastUpdate > metadataCache.CACHE_DURATION) {
    console.log('刷新元数据缓存...');
    const metadata = await getProductMetadata();
    metadataCache.categories = metadata.categories;
    metadataCache.brands = metadata.brands;
    metadataCache.lastUpdate = now;
  }

  return metadataCache;
}
```

---

**提示**: 这些示例展示了实际开发中的常见场景。在生产环境中，建议添加更完善的错误处理、日志记录和监控。
