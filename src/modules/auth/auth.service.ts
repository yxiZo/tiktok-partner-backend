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
        appKeyLength: appKey.length,
        hasAppSecret: !!appSecret,
        appSecretLength: appSecret?.length,
      });

      // 验证授权码格式（TikTok授权码通常是字符串）
      if (typeof authCode !== 'string' || authCode.trim().length === 0) {
        throw new BadRequestException('Invalid authorization code format');
      }

      const result = await AccessTokenTool.getAccessToken(
        authCode,
        appKey,
        appSecret,
      );

      // 解析响应体（如果是JSON字符串）
      const responseBody = typeof result.body === 'string'
        ? JSON.parse(result.body)
        : result.body;

      console.log('[Auth] TikTok API response:', {
        code: responseBody.code,
        message: responseBody.message,
        hasData: !!responseBody.data,
        responseData: responseBody.data ? {
          hasAccessToken: !!responseBody.data.access_token,
          hasRefreshToken: !!responseBody.data.refresh_token,
          openId: responseBody.data.open_id,
          sellerName: responseBody.data.seller_name,
        } : null,
      });

      if (responseBody.code !== 0) {
        const errorMessage = `TikTok API Error (${responseBody.code}): ${responseBody.message || 'Failed to get access token'}`;

        // 根据错误代码提供更具体的提示
        let hint = '';
        switch (responseBody.code) {
          case 40001:
            hint = '\n\n💡 提示：授权码无效或已过期。请重新获取授权码（每个授权码只能使用一次）';
            break;
          case 40002:
            hint = '\n\n💡 提示：授权码已被使用。请重新获取新的授权码';
            break;
          case 10008:
            hint = '\n\n💡 提示：App Key或App Secret配置错误';
            break;
          default:
            hint = '\n\n💡 提示：请检查授权码是否完整复制，或尝试重新获取授权码';
        }

        throw new BadRequestException(errorMessage + hint);
      }

      const tokenData = responseBody.data;

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

      // 解析响应体（如果是JSON字符串）
      const responseBody = typeof result.body === 'string'
        ? JSON.parse(result.body)
        : result.body;

      if (responseBody.code !== 0) {
        throw new BadRequestException(
          responseBody.message || 'Failed to refresh token',
        );
      }

      const tokenData = responseBody.data;

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
