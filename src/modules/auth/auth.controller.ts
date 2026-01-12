import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 获取TikTok授权链接
   * GET /auth/authorization-url
   */
  @Get('authorization-url')
  getAuthorizationUrl() {
    return {
      success: true,
      data: {
        authorization_url: this.authService.getAuthorizationUrl(),
      },
    };
  }

  /**
   * OAuth回调处理 - 通过授权码获取Token
   * GET /auth/callback?code=xxx
   */
  @Get('callback')
  async handleCallback(@Query('code') authCode: string) {
    const tokenData = await this.authService.getAccessToken(authCode);

    return {
      success: true,
      message: 'Authorization successful',
      data: tokenData,
    };
  }

  /**
   * 刷新Access Token
   * POST /auth/refresh
   * Body: { refresh_token: string }
   */
  @Post('refresh')
  async refreshToken(@Body('refresh_token') refreshToken: string) {
    const tokenData = await this.authService.refreshAccessToken(refreshToken);

    return {
      success: true,
      message: 'Token refreshed successfully',
      data: tokenData,
    };
  }

  /**
   * 验证Token是否过期
   * POST /auth/validate
   * Body: { expire_time: number }
   */
  @Post('validate')
  validateToken(@Body('expire_time') expireTime: number) {
    const isExpired = this.authService.isTokenExpired(expireTime);

    return {
      success: true,
      data: {
        is_expired: isExpired,
        needs_refresh: isExpired,
      },
    };
  }
}
