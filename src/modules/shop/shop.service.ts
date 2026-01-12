import { Injectable, Inject, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { TikTokShopNodeApiClient } from '../../../sdk';
import { TIKTOK_CLIENT } from '../../config/tiktok-client.provider';
import { ShopInfo, ShopDetail, ShopPermission } from '../../types/tiktok.types';

@Injectable()
export class ShopService {
  constructor(
    @Inject(TIKTOK_CLIENT)
    private readonly tikTokClient: TikTokShopNodeApiClient,
  ) {}

  /**
   * 获取已授权的店铺列表
   * @param accessToken - Access Token
   * @returns 店铺列表
   */
  async getAuthorizedShops(accessToken: string): Promise<ShopInfo[]> {
    if (!accessToken) {
      throw new BadRequestException('Access token is required');
    }

    try {
      const result = await this.tikTokClient.api.AuthorizationV202309Api.ShopsGet(
        accessToken,
        'application/json',
      );

      if (result.body.code !== 0) {
        throw new BadRequestException(
          result.body.message || 'Failed to get authorized shops',
        );
      }

      const shops = result.body.data?.shops || [];
      return shops.map((shop) => ({
        shop_id: shop.id || '',
        shop_name: shop.name || '',
        cipher: shop.cipher || '', // 重要：后续API调用需要
        code: shop.code || '',
        region: shop.region || '',
        seller_type: shop.sellerType || '',
      }));
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to get authorized shops: ${error.message}`,
      );
    }
  }

  /**
   * 获取店铺详细信息
   * @param accessToken - Access Token
   * @returns 店铺详情列表
   */
  async getShopDetails(accessToken: string): Promise<ShopDetail[]> {
    if (!accessToken) {
      throw new BadRequestException('Access token is required');
    }

    try {
      const result = await this.tikTokClient.api.SellerV202309Api.ShopsGet(
        accessToken,
        'application/json',
      );

      if (result.body.code !== 0) {
        throw new BadRequestException(
          result.body.message || 'Failed to get shop details',
        );
      }

      const shops = result.body.data?.shops || [];
      return shops.map((shop: any) => ({
        id: shop.id || '',
        name: shop.name || '',
        code: shop.code || '',
        region: shop.region || '',
        seller_type: shop.sellerType || '',
        status: shop.status || 0,
      }));
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to get shop details: ${error.message}`,
      );
    }
  }

  /**
   * 获取店铺权限
   * @param accessToken - Access Token
   * @returns 权限列表
   */
  async getShopPermissions(accessToken: string): Promise<ShopPermission[]> {
    if (!accessToken) {
      throw new BadRequestException('Access token is required');
    }

    try {
      const result = await this.tikTokClient.api.SellerV202309Api.PermissionsGet(
        accessToken,
        'application/json',
      );

      if (result.body.code !== 0) {
        throw new BadRequestException(
          result.body.message || 'Failed to get shop permissions',
        );
      }

      const permissions = result.body.data?.permissions || [];
      return permissions.map((perm: any) => ({
        permission: typeof perm === 'string' ? perm : perm.permission || '',
        granted: typeof perm === 'string' ? true : perm.granted !== false,
      }));
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to get shop permissions: ${error.message}`,
      );
    }
  }

  /**
   * 取消店铺授权
   * @param accessToken - Access Token
   * @param shopId - 店铺ID
   * @returns 是否成功
   */
  async removeShopAuthorization(accessToken: string, shopId: string): Promise<boolean> {
    if (!accessToken) {
      throw new BadRequestException('Access token is required');
    }

    if (!shopId) {
      throw new BadRequestException('Shop ID is required');
    }

    try {
      const result = await this.tikTokClient.api.AuthorizationV202403Api.ShopsDelete(
        shopId,
        accessToken,
        'application/json',
      );

      if (result.body.code !== 0) {
        throw new BadRequestException(
          result.body.message || 'Failed to remove shop authorization',
        );
      }

      return true;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to remove shop authorization: ${error.message}`,
      );
    }
  }

  /**
   * 获取Widget Token（用于前端集成）
   * @param accessToken - Access Token
   * @param shopId - 可选的店铺ID
   * @returns Widget Token
   */
  async getWidgetToken(accessToken: string, shopId?: string): Promise<string> {
    if (!accessToken) {
      throw new BadRequestException('Access token is required');
    }

    try {
      const result = await this.tikTokClient.api.AuthorizationV202312Api.WidgetTokenGet(
        accessToken,
        'application/json',
        shopId ? parseInt(shopId) : undefined,
      );

      if (result.body.code !== 0) {
        throw new BadRequestException(
          result.body.message || 'Failed to get widget token',
        );
      }

      return result.body.data?.widgetToken?.token || '';
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to get widget token: ${error.message}`,
      );
    }
  }
}
