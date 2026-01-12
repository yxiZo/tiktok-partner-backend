import { Injectable, Inject, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TikTokShopNodeApiClient, AccessTokenTool } from '../../../sdk';
import { TIKTOK_CLIENT } from '../../config/tiktok-client.provider';
import { TokenData, TokenRefreshResponse } from '../../types/tiktok.types';

@Injectable()
export class AuthService {
  constructor(
    @Inject(TIKTOK_CLIENT)
    private readonly tikTokClient: TikTokShopNodeApiClient,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 获取TikTok授权链接
   * @returns 授权URL
   */
  getAuthorizationUrl(): string {
    const appKey = this.configService.get<string>('tiktok.serviceId');
    return `https://services.tiktokshop.com/open/authorize?service_id=${appKey}`;
  }

  /**
   * 通过授权码获取Access Token
   * @param authCode - 授权码（从回调URL获取）
   * @returns Token数据
   */
  async getAccessToken(authCode: string): Promise<TokenData> {
    if (!authCode) {
      throw new BadRequestException('Authorization code is required');
    }

    try {
      const appKey = this.configService.get<string>('tiktok.appKey');
      const appSecret = this.configService.get<string>('tiktok.appSecret');

      // 验证配置
      if (!appKey || !appSecret) {
        throw new BadRequestException(
          'TikTok app credentials not configured. Please check TIKTOK_APP_KEY and TIKTOK_APP_SECRET in .env file',
        );
      }

      console.log('[Auth] Requesting access token with:', {
        authCode: authCode.substring(0, 10) + '...',
        appKey: appKey.substring(0, 6) + '...',
        hasAppSecret: !!appSecret,
      });

      const result = await AccessTokenTool.getAccessToken(
        authCode,
        appKey,
        appSecret,
      );

      console.log('[Auth] TikTok API response:', {
        code: result.body.code,
        message: result.body.message,
        hasData: !!result.body.data,
      });

      if (result.body.code !== 0) {
        throw new BadRequestException(
          `TikTok API Error (${result.body.code}): ${result.body.message || 'Failed to get access token'}`,
        );
      }

      const tokenData = result.body.data;

      if (!tokenData) {
        throw new BadRequestException('No token data received from TikTok API');
      }

      console.log('[Auth] Successfully obtained access token for:', {
        open_id: tokenData.open_id,
        seller_name: tokenData.seller_name,
        seller_base_region: tokenData.seller_base_region,
      });

      // 这里应该将token保存到数据库
      // TODO: 实现数据库存储逻辑

      return {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        access_token_expire_in: tokenData.access_token_expire_in || 0,
        refresh_token_expire_in: tokenData.refresh_token_expire_in || 0,
        open_id: tokenData.open_id || '',
        seller_name: tokenData.seller_name || '',
        seller_base_region: tokenData.seller_base_region || '',
        user_type: tokenData.user_type || 0,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('[Auth] Error getting access token:', error);
      throw new InternalServerErrorException(
        `Failed to get access token: ${error.message}`,
      );
    }
  }

  /**
   * 刷新Access Token
   * @param refreshToken - 刷新令牌
   * @returns 新的Token数据
   */
  async refreshAccessToken(refreshToken: string): Promise<TokenRefreshResponse> {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }

    try {
      const result = await AccessTokenTool.refreshToken(
        refreshToken,
        this.configService.get<string>('tiktok.appKey'),
        this.configService.get<string>('tiktok.appSecret'),
      );

      if (result.body.code !== 0) {
        throw new BadRequestException(
          result.body.message || 'Failed to refresh token',
        );
      }

      const tokenData = result.body.data;

      if (!tokenData) {
        throw new BadRequestException('No token data received');
      }

      // 这里应该更新数据库中的token
      // TODO: 实现数据库更新逻辑

      return {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        access_token_expire_in: tokenData.access_token_expire_in || 0,
        refresh_token_expire_in: tokenData.refresh_token_expire_in || 0,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to refresh token: ${error.message}`,
      );
    }
  }

  /**
   * 验证Access Token是否过期
   * @param expireTime - Token过期时间（Unix时间戳）
   * @returns 是否过期
   */
  isTokenExpired(expireTime: number): boolean {
    const now = Math.floor(Date.now() / 1000);
    // 提前5分钟判定为过期，留出刷新时间
    return now >= expireTime - 300;
  }

  /**
   * 自动刷新Token（如果需要）
   * @param accessToken - 当前Access Token
   * @param refreshToken - 刷新令牌
   * @param expireTime - Token过期时间
   * @returns 有效的Access Token
   */
  async ensureValidToken(
    accessToken: string,
    refreshToken: string,
    expireTime: number,
  ): Promise<string> {
    if (this.isTokenExpired(expireTime)) {
      const newTokenData = await this.refreshAccessToken(refreshToken);
      return newTokenData.access_token;
    }
    return accessToken;
  }
}
