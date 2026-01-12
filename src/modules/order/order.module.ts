import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { TikTokClientProvider } from '../../config/tiktok-client.provider';

@Module({
  imports: [ConfigModule],
  controllers: [OrderController],
  providers: [OrderService, TikTokClientProvider],
  exports: [OrderService],
})
export class OrderModule {}
