import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientConfiguration, TikTokShopNodeApiClient } from '../../sdk';

export const TIKTOK_CLIENT = 'TIKTOK_CLIENT';

export const TikTokClientProvider: Provider = {
  provide: TIKTOK_CLIENT,
  useFactory: (configService: ConfigService) => {
    // 设置全局配置
    ClientConfiguration.globalConfig.app_key = configService.get<string>('tiktok.appKey');
    ClientConfiguration.globalConfig.app_secret = configService.get<string>('tiktok.appSecret');

    // 设置API基础路径（沙箱或生产环境）
    const isSandbox = configService.get<boolean>('tiktok.sandbox', false);
    const basePath = isSandbox
      ? 'https://open-api-sandbox.tiktokglobalshop.com'
      : 'https://open-api.tiktokglobalshop.com';

    ClientConfiguration.globalConfig.basePath = basePath;

    // 创建客户端实例
    const config = new ClientConfiguration(
      configService.get<string>('tiktok.appKey'),
      configService.get<string>('tiktok.appSecret'),
      basePath
    );

    return new TikTokShopNodeApiClient({ config });
  },
  inject: [ConfigService],
};
