import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TikTokClientProvider } from '../../config/tiktok-client.provider';

@Module({
  imports: [ConfigModule],
  controllers: [AuthController],
  providers: [AuthService, TikTokClientProvider],
  exports: [AuthService],
})
export class AuthModule {}
