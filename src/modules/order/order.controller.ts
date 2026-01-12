import { Controller, Get, Post, Body, Param, Query, Headers } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderSearchParams } from '../../types/tiktok.types';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  /**
   * 搜索订单
   * POST /orders/search
   * Headers: { Authorization: Bearer <access_token> }
   * Body: OrderSearchParams
   */
  @Post('search')
  async searchOrders(
    @Headers('authorization') authorization: string,
    @Body() params: OrderSearchParams,
  ) {
    const accessToken = this.extractToken(authorization);
    const result = await this.orderService.searchOrders(accessToken, params);

    return {
      success: true,
      data: result,
    };
  }

  /**
   * 获取订单详情
   * GET /orders/:orderId
   * Headers: { Authorization: Bearer <access_token> }
   */
  @Get(':orderId')
  async getOrderDetail(
    @Headers('authorization') authorization: string,
    @Param('orderId') orderId: string,
  ) {
    const accessToken = this.extractToken(authorization);
    const order = await this.orderService.getOrderDetail(accessToken, orderId);

    return {
      success: true,
      data: { order },
    };
  }

  /**
   * 获取待发货订单
   * GET /orders/pending-shipment
   * Headers: { Authorization: Bearer <access_token>, X-Shop-Cipher: <shop_cipher> }
   * Query: { page?, page_size? }
   */
  @Get('status/pending-shipment')
  async getPendingShipmentOrders(
    @Headers('authorization') authorization: string,
    @Headers('x-shop-cipher') shopCipher: string,
    @Query('page') page?: number,
    @Query('page_size') pageSize?: number,
  ) {
    const accessToken = this.extractToken(authorization);
    const result = await this.orderService.getPendingShipmentOrders(
      accessToken,
      shopCipher,
      page,
      pageSize,
    );

    return {
      success: true,
      data: result,
    };
  }

  /**
   * 获取运输中订单
   * GET /orders/in-transit
   * Headers: { Authorization: Bearer <access_token>, X-Shop-Cipher: <shop_cipher> }
   * Query: { page?, page_size? }
   */
  @Get('status/in-transit')
  async getInTransitOrders(
    @Headers('authorization') authorization: string,
    @Headers('x-shop-cipher') shopCipher: string,
    @Query('page') page?: number,
    @Query('page_size') pageSize?: number,
  ) {
    const accessToken = this.extractToken(authorization);
    const result = await this.orderService.getInTransitOrders(
      accessToken,
      shopCipher,
      page,
      pageSize,
    );

    return {
      success: true,
      data: result,
    };
  }

  /**
   * 获取已完成订单
   * GET /orders/completed
   * Headers: { Authorization: Bearer <access_token>, X-Shop-Cipher: <shop_cipher> }
   * Query: { page?, page_size? }
   */
  @Get('status/completed')
  async getCompletedOrders(
    @Headers('authorization') authorization: string,
    @Headers('x-shop-cipher') shopCipher: string,
    @Query('page') page?: number,
    @Query('page_size') pageSize?: number,
  ) {
    const accessToken = this.extractToken(authorization);
    const result = await this.orderService.getCompletedOrders(
      accessToken,
      shopCipher,
      page,
      pageSize,
    );

    return {
      success: true,
      data: result,
    };
  }

  /**
   * 根据时间范围获取订单
   * GET /orders/by-time-range
   * Headers: { Authorization: Bearer <access_token>, X-Shop-Cipher: <shop_cipher> }
   * Query: { start_time: number, end_time: number, page?, page_size? }
   */
  @Get('filters/by-time-range')
  async getOrdersByTimeRange(
    @Headers('authorization') authorization: string,
    @Headers('x-shop-cipher') shopCipher: string,
    @Query('start_time') startTime: number,
    @Query('end_time') endTime: number,
    @Query('page') page?: number,
    @Query('page_size') pageSize?: number,
  ) {
    const accessToken = this.extractToken(authorization);
    const result = await this.orderService.getOrdersByTimeRange(
      accessToken,
      shopCipher,
      startTime,
      endTime,
      page,
      pageSize,
    );

    return {
      success: true,
      data: result,
    };
  }

  /**
   * 获取最近更新的订单
   * GET /orders/recently-updated
   * Headers: { Authorization: Bearer <access_token>, X-Shop-Cipher: <shop_cipher> }
   * Query: { minutes?, page?, page_size? }
   */
  @Get('filters/recently-updated')
  async getRecentlyUpdatedOrders(
    @Headers('authorization') authorization: string,
    @Headers('x-shop-cipher') shopCipher: string,
    @Query('minutes') minutes?: number,
    @Query('page') page?: number,
    @Query('page_size') pageSize?: number,
  ) {
    const accessToken = this.extractToken(authorization);
    const result = await this.orderService.getRecentlyUpdatedOrders(
      accessToken,
      shopCipher,
      minutes,
      page,
      pageSize,
    );

    return {
      success: true,
      data: result,
    };
  }

  /**
   * 从Authorization header中提取token
   */
  private extractToken(authorization: string): string {
    if (!authorization) {
      throw new Error('Authorization header is required');
    }

    const parts = authorization.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new Error('Invalid authorization header format');
    }

    return parts[1];
  }
}
