import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { TikTokClientProvider } from '../../config/tiktok-client.provider';

@Module({
  imports: [ConfigModule],
  controllers: [ProductController],
  providers: [ProductService, TikTokClientProvider],
  exports: [ProductService],
})
export class ProductModule {}
