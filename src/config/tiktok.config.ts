import { registerAs } from '@nestjs/config';

export default registerAs('tiktok', () => ({
  appKey: process.env.TIKTOK_APP_KEY,
  appSecret: process.env.TIKTOK_APP_SECRET,
  serviceId: process.env.TIKTOK_SERVICE_ID,
  sandbox: process.env.TIKTOK_SANDBOX === 'true',
  authHost: 'https://auth.tiktok-shops.com',
  apiHost: process.env.TIKTOK_SANDBOX === 'true'
    ? 'https://open-api-sandbox.tiktokglobalshop.com'
    : 'https://open-api.tiktokglobalshop.com',
}));
