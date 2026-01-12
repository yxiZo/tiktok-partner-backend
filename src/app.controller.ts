import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test-api')
  getTestApi(@Res() res: Response) {
    return res.sendFile(join(__dirname, '..', '..', 'test-api.html'));
  }
}
