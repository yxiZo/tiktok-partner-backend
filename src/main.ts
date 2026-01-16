import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 启用静态文件服务
  // 使用process.cwd()获取项目根目录，这样无论在开发还是生产环境都能正确工作
  const projectRoot = process.cwd();
  const publicPath = join(projectRoot, 'public');

  console.log('Project root:', projectRoot);
  console.log('Serving static files from:', publicPath);

  // 检查public目录是否存在
  const fs = require('fs');
  if (!fs.existsSync(publicPath)) {
    console.error('ERROR: Public directory not found at:', publicPath);
  } else {
    console.log('✓ Public directory exists');
  }

  app.useStaticAssets(publicPath);

  await app.listen(process.env.PORT ?? 3000);
  console.log(`✓ Application is running on: http://localhost:${process.env.PORT ?? 3000}`);
  console.log(`✓ Access the app at: http://localhost:${process.env.PORT ?? 3000}/index.html`);
}
bootstrap();
