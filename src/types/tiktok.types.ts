// ==================== 通用类型 ====================

export interface TikTokApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  request_id?: string;
}

export interface PageInfo {
  page: number;
  page_size: number;
  total_count: number;
}

// ==================== 授权相关类型 ====================

export enum UserType {
  Seller = 0,
  Creator = 1,
}

export interface TokenData {
  access_token: string;
  refresh_token: string;
  access_token_expire_in: number; // Unix timestamp
  refresh_token_expire_in: number; // Unix timestamp
  open_id: string;
  seller_name: string;
  seller_base_region: string;
  user_type: UserType;
}

export interface TokenRefreshResponse {
  access_token: string;
  refresh_token: string;
  access_token_expire_in: number;
  refresh_token_expire_in: number;
}

// ==================== 店铺相关类型 ====================

export interface ShopInfo {
  shop_id: string;
  shop_name: string;
  cipher: string; // 重要：后续API调用需要
  code: string;
  region: string;
  seller_type?: string;
}

export interface ShopDetail {
  id: string;
  name: string;
  code: string;
  region: string;
  seller_type: string;
  status: number;
}

export interface ShopPermission {
  permission: string;
  granted: boolean;
}

// ==================== 产品相关类型 ====================

export enum ProductStatus {
  Draft = 2,
  PendingActivation = 3,
  Activated = 4,
  Deactivated = 5,
  Frozen = 6,
  Deleted = 7,
}

export interface ProductSearchParams {
  page_number?: number;
  page_size?: number;
  search_status?: ProductStatus;
  title?: string;
  product_ids?: string[];
}

export interface ProductImage {
  url?: string;
  uri?: string;
  width?: number;
  height?: number;
}

export interface ProductSku {
  id?: string;
  seller_sku?: string;
  sales_attributes?: Array<{
    attribute_id: string;
    attribute_name: string;
    value_id: string;
    value_name: string;
  }>;
  price: {
    amount: string;
    currency: string;
  };
  available_stock?: number;
}

export interface ProductCreateInput {
  title: string;
  description: string;
  category_id: string;
  brand_id?: string;
  main_images: ProductImage[];
  skus: ProductSku[];
  package_dimensions?: {
    length: string;
    width: string;
    height: string;
    unit: string;
  };
  package_weight?: {
    value: string;
    unit: string;
  };
  is_cod_open?: boolean;
  product_attributes?: Array<{
    attribute_id: string;
    values: Array<{ value_id?: string; value_name?: string }>;
  }>;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  status: ProductStatus;
  category_id: string;
  brand_id?: string;
  main_images: ProductImage[];
  skus: ProductSku[];
  create_time: number;
  update_time: number;
}

export interface ProductInventoryUpdate {
  id: string; // SKU ID
  available_stock: number;
}

export interface ProductPriceUpdate {
  id: string; // SKU ID
  price: {
    amount: string;
    currency: string;
  };
}

export interface Category {
  id: string;
  parent_id: string;
  local_name: string;
  is_leaf: boolean;
}

export interface CategoryAttribute {
  id: string;
  name: string;
  is_required: boolean;
  type: string; // "TEXT", "SINGLE_SELECT", "MULTIPLE_SELECT"
  values?: Array<{
    id: string;
    name: string;
  }>;
}

export interface Brand {
  id: string;
  name: string;
  status: string;
}

// ==================== 订单相关类型 ====================

export enum OrderStatus {
  Unpaid = 100,
  AwaitingShipment = 111,
  PartiallyShipping = 112,
  AwaitingCollection = 114,
  InTransit = 121,
  Delivered = 122,
  Completed = 130,
  Cancelled = 140,
}

export interface OrderSearchParams {
  shop_cipher?: string;
  sort_by?: 'CREATE_TIME' | 'UPDATE_TIME';
  sort_order?: 'ASC' | 'DESC';
  order_status?: OrderStatus[];
  page_number?: number;
  page_size?: number;
  create_time_ge?: number; // Unix timestamp
  create_time_lt?: number;
  update_time_ge?: number;
  update_time_lt?: number;
}

export interface OrderLineItem {
  id: string;
  product_id: string;
  product_name: string;
  sku_id: string;
  sku_name: string;
  sku_image: string;
  quantity: number;
  sale_price: {
    amount: string;
    currency: string;
  };
  platform_discount: {
    amount: string;
    currency: string;
  };
  seller_discount: {
    amount: string;
    currency: string;
  };
}

export interface RecipientAddress {
  full_address: string;
  name: string;
  phone: string;
  region_code: string;
  zipcode?: string;
}

export interface OrderPayment {
  currency: string;
  total_amount: string;
  sub_total: string;
  shipping_fee: string;
  seller_discount: string;
  platform_discount: string;
  tax: string;
}

export interface Order {
  id: string;
  status: OrderStatus;
  create_time: number;
  update_time: number;
  payment: OrderPayment;
  line_items: OrderLineItem[];
  recipient_address: RecipientAddress;
  tracking_number?: string;
  fulfillment_type: number;
  buyer_email?: string;
  buyer_message?: string;
}
