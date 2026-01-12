import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ShopController } from './shop.controller';
import { ShopService } from './shop.service';
import { TikTokClientProvider } from '../../config/tiktok-client.provider';

@Module({
  imports: [ConfigModule],
  controllers: [ShopController],
  providers: [ShopService, TikTokClientProvider],
  exports: [ShopService],
})
export class ShopModule {}
