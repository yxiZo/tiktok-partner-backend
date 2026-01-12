import { Injectable, Inject, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { TikTokShopNodeApiClient } from '../../../sdk';
import { TIKTOK_CLIENT } from '../../config/tiktok-client.provider';
import { Order, OrderSearchParams } from '../../types/tiktok.types';

@Injectable()
export class OrderService {
  constructor(
    @Inject(TIKTOK_CLIENT)
    private readonly tikTokClient: TikTokShopNodeApiClient,
  ) {}

  /**
   * 搜索订单
   * @param accessToken - Access Token
   * @param params - 搜索参数
   * @returns 订单列表和分页信息
   */
  async searchOrders(accessToken: string, params: OrderSearchParams) {
    if (!accessToken) {
      throw new BadRequestException('Access token is required');
    }

    try {
      const searchRequest = {
        shop_cipher: params.shop_cipher,
        sort_by: params.sort_by || 'CREATE_TIME',
        sort_order: params.sort_order || 'DESC',
        order_status: params.order_status,
        page_number: params.page_number || 1,
        page_size: params.page_size || 20,
        create_time_ge: params.create_time_ge,
        create_time_lt: params.create_time_lt,
        update_time_ge: params.update_time_ge,
        update_time_lt: params.update_time_lt,
      };

      const result = await this.tikTokClient.api.OrderV202309Api.OrdersSearchPost(
        searchRequest.page_size || 20,
        accessToken,
        'application/json',
        searchRequest.sort_order,
        undefined, // pageToken
        searchRequest.sort_by,
        searchRequest.shop_cipher,
        searchRequest as any,
      );

      if (result.body.code !== 0) {
        throw new BadRequestException(
          result.body.message || 'Failed to search orders',
        );
      }

      return {
        orders: result.body.data?.orders || [],
        total: result.body.data?.totalCount || 0,
        page_info: result.body.data?.nextPageToken,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to search orders: ${error.message}`,
      );
    }
  }

  /**
   * 获取订单详情
   * @param accessToken - Access Token
   * @param orderId - 订单ID
   * @returns 订单详情
   */
  async getOrderDetail(accessToken: string, orderId: string): Promise<Order> {
    if (!accessToken || !orderId) {
      throw new BadRequestException('Access token and order ID are required');
    }

    try {
      const result = await this.tikTokClient.api.OrderV202309Api.OrdersGet(
        [orderId],
        accessToken,
        'application/json',
      );

      if (result.body.code !== 0) {
        throw new BadRequestException(
          result.body.message || 'Failed to get order detail',
        );
      }

      const orders = result.body.data?.orders || [];
      if (orders.length === 0) {
        throw new BadRequestException('Order not found');
      }

      const order = orders[0];

      return {
        id: order.id || '',
        status: order.status || 0,
        create_time: order.createTime || 0,
        update_time: order.updateTime || 0,
        payment: order.payment || {},
        line_items: order.lineItems || [],
        recipient_address: order.recipientAddress || {},
        tracking_number: order.trackingNumber,
        fulfillment_type: order.fulfillmentType || 0,
        buyer_email: order.buyerEmail,
        buyer_message: order.buyerMessage,
      } as any;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to get order detail: ${error.message}`,
      );
    }
  }

  /**
   * 获取指定状态的订单列表
   * @param accessToken - Access Token
   * @param shopCipher - 店铺Cipher
   * @param status - 订单状态
   * @param page - 页码
   * @param pageSize - 每页数量
   * @returns 订单列表
   */
  async getOrdersByStatus(
    accessToken: string,
    shopCipher: string,
    status: number[],
    page: number = 1,
    pageSize: number = 20,
  ) {
    return this.searchOrders(accessToken, {
      shop_cipher: shopCipher,
      order_status: status,
      page_number: page,
      page_size: pageSize,
      sort_by: 'CREATE_TIME',
      sort_order: 'DESC',
    });
  }

  /**
   * 获取待发货订单
   * @param accessToken - Access Token
   * @param shopCipher - 店铺Cipher
   * @param page - 页码
   * @param pageSize - 每页数量
   * @returns 待发货订单列表
   */
  async getPendingShipmentOrders(
    accessToken: string,
    shopCipher: string,
    page: number = 1,
    pageSize: number = 20,
  ) {
    return this.getOrdersByStatus(
      accessToken,
      shopCipher,
      [111, 112], // 待发货(111)和部分发货(112)
      page,
      pageSize,
    );
  }

  /**
   * 获取运输中订单
   * @param accessToken - Access Token
   * @param shopCipher - 店铺Cipher
   * @param page - 页码
   * @param pageSize - 每页数量
   * @returns 运输中订单列表
   */
  async getInTransitOrders(
    accessToken: string,
    shopCipher: string,
    page: number = 1,
    pageSize: number = 20,
  ) {
    return this.getOrdersByStatus(
      accessToken,
      shopCipher,
      [114, 121], // 待揽收(114)和运输中(121)
      page,
      pageSize,
    );
  }

  /**
   * 获取已完成订单
   * @param accessToken - Access Token
   * @param shopCipher - 店铺Cipher
   * @param page - 页码
   * @param pageSize - 每页数量
   * @returns 已完成订单列表
   */
  async getCompletedOrders(
    accessToken: string,
    shopCipher: string,
    page: number = 1,
    pageSize: number = 20,
  ) {
    return this.getOrdersByStatus(
      accessToken,
      shopCipher,
      [122, 130], // 已送达(122)和已完成(130)
      page,
      pageSize,
    );
  }

  /**
   * 根据时间范围获取订单
   * @param accessToken - Access Token
   * @param shopCipher - 店铺Cipher
   * @param startTime - 开始时间（Unix时间戳）
   * @param endTime - 结束时间（Unix时间戳）
   * @param page - 页码
   * @param pageSize - 每页数量
   * @returns 订单列表
   */
  async getOrdersByTimeRange(
    accessToken: string,
    shopCipher: string,
    startTime: number,
    endTime: number,
    page: number = 1,
    pageSize: number = 20,
  ) {
    return this.searchOrders(accessToken, {
      shop_cipher: shopCipher,
      create_time_ge: startTime,
      create_time_lt: endTime,
      page_number: page,
      page_size: pageSize,
      sort_by: 'CREATE_TIME',
      sort_order: 'DESC',
    });
  }

  /**
   * 获取最近更新的订单
   * @param accessToken - Access Token
   * @param shopCipher - 店铺Cipher
   * @param minutes - 最近N分钟
   * @param page - 页码
   * @param pageSize - 每页数量
   * @returns 订单列表
   */
  async getRecentlyUpdatedOrders(
    accessToken: string,
    shopCipher: string,
    minutes: number = 30,
    page: number = 1,
    pageSize: number = 20,
  ) {
    const now = Math.floor(Date.now() / 1000);
    const startTime = now - minutes * 60;

    return this.searchOrders(accessToken, {
      shop_cipher: shopCipher,
      update_time_ge: startTime,
      update_time_lt: now,
      page_number: page,
      page_size: pageSize,
      sort_by: 'UPDATE_TIME',
      sort_order: 'DESC',
    });
  }
}
