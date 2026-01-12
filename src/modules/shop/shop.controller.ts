import { Controller, Get, Delete, Headers, Query } from '@nestjs/common';
import { ShopService } from './shop.service';

@Controller('shops')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  /**
   * 获取已授权的店铺列表
   * GET /shops/authorized
   * Headers: { Authorization: Bearer <access_token> }
   */
  @Get('authorized')
  async getAuthorizedShops(@Headers('authorization') authorization: string) {
    const accessToken = this.extractToken(authorization);
    const shops = await this.shopService.getAuthorizedShops(accessToken);

    return {
      success: true,
      data: {
        shops,
        count: shops.length,
      },
    };
  }

  /**
   * 获取店铺详细信息
   * GET /shops/details
   * Headers: { Authorization: Bearer <access_token> }
   */
  @Get('details')
  async getShopDetails(@Headers('authorization') authorization: string) {
    const accessToken = this.extractToken(authorization);
    const shops = await this.shopService.getShopDetails(accessToken);

    return {
      success: true,
      data: {
        shops,
        count: shops.length,
      },
    };
  }

  /**
   * 获取店铺权限
   * GET /shops/permissions
   * Headers: { Authorization: Bearer <access_token> }
   */
  @Get('permissions')
  async getShopPermissions(@Headers('authorization') authorization: string) {
    const accessToken = this.extractToken(authorization);
    const permissions = await this.shopService.getShopPermissions(accessToken);

    return {
      success: true,
      data: {
        permissions,
      },
    };
  }

  /**
   * 取消店铺授权
   * DELETE /shops/:shopId/authorization
   * Headers: { Authorization: Bearer <access_token> }
   */
  @Delete(':shopId/authorization')
  async removeShopAuthorization(
    @Headers('authorization') authorization: string,
    @Query('shopId') shopId: string,
  ) {
    const accessToken = this.extractToken(authorization);
    await this.shopService.removeShopAuthorization(accessToken, shopId);

    return {
      success: true,
      message: 'Shop authorization removed successfully',
    };
  }

  /**
   * 获取Widget Token
   * GET /shops/widget-token
   * Headers: { Authorization: Bearer <access_token> }
   * Query: { shop_id?: string }
   */
  @Get('widget-token')
  async getWidgetToken(
    @Headers('authorization') authorization: string,
    @Query('shop_id') shopId?: string,
  ) {
    const accessToken = this.extractToken(authorization);
    const widgetToken = await this.shopService.getWidgetToken(accessToken, shopId);

    return {
      success: true,
      data: {
        widget_token: widgetToken,
      },
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
