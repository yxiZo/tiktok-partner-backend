# TikTok Shop API - Troubleshooting Guide

## Authentication Errors (400 Bad Request)

If you're getting "Failed to get access token" with a 400 status code, follow these steps:

### 1. Verify Your Configuration

Check your `.env` file:
```bash
TIKTOK_APP_KEY=your_app_key
TIKTOK_APP_SECRET=your_app_secret
TIKTOK_SERVICE_ID=your_service_id
TIKTOK_SANDBOX=false
```

**Important:** Make sure these values match what's registered in your TikTok Shop Developer Portal.

### 2. Check the Authorization Flow

The TikTok OAuth flow requires these steps in order:

1. **Get Authorization URL**
   ```bash
   GET http://localhost:3000/auth/authorization-url
   ```

2. **User Authorization**
   - Open the returned URL in a browser
   - Log in and authorize your app
   - TikTok will redirect to your callback URL with a `code` parameter

3. **Exchange Code for Token**
   ```bash
   GET http://localhost:3000/auth/callback?code=YOUR_AUTH_CODE
   ```

### 3. Common Issues

#### Issue: Authorization Code Expired
**Symptom:** 400 error when calling `/auth/callback`
**Cause:** Authorization codes expire within minutes
**Solution:** Complete the entire OAuth flow quickly. Don't copy the code and wait - use it immediately.

#### Issue: Wrong App Credentials
**Symptom:** 400 error with message about invalid credentials
**Cause:** `TIKTOK_APP_KEY` or `TIKTOK_APP_SECRET` don't match TikTok Developer Portal
**Solution:**
1. Go to TikTok Shop Developer Portal
2. Check your App Key and App Secret
3. Update your `.env` file
4. Restart the server

#### Issue: Wrong Service ID
**Symptom:** Authorization URL doesn't work
**Cause:** `TIKTOK_SERVICE_ID` is incorrect
**Solution:** Use the correct Service ID from your TikTok Shop Developer Portal

#### Issue: Callback URL Mismatch
**Symptom:** TikTok doesn't redirect back after authorization
**Cause:** The redirect URL configured in TikTok Developer Portal doesn't match your application
**Solution:** Make sure the callback URL in your TikTok app settings matches your actual callback endpoint

### 4. Debug with Console Logs

The updated `auth.service.ts` now includes detailed logging:

```typescript
[Auth] Requesting access token with: { authCode: '...', appKey: '...', hasAppSecret: true }
[Auth] TikTok API response: { code: 0, message: '...', hasData: true }
[Auth] Successfully obtained access token for: { open_id: '...', seller_name: '...', ... }
```

Check your console output for these logs to understand where the flow is failing.

### 5. Test the Authorization Flow

1. **Start the server:**
   ```bash
   pnpm run start:dev
   ```

2. **Open the test page:**
   ```
   test-api.html
   ```

3. **Follow the authorization workflow:**
   - Click "获取授权链接" (Get Authorization URL)
   - Click the generated link to authorize
   - Copy the `code` parameter from the callback URL
   - Paste it and click "获取Token" (Get Token)

4. **Check the server logs** for detailed error messages

### 6. Verify TikTok API Endpoint

The SDK uses:
- Auth endpoint: `https://auth.tiktok-shops.com/api/v2/token/get`
- Request method: GET with query parameters

Make sure your network can reach this endpoint (not blocked by firewall/proxy).

### 7. Common Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 10000 | Invalid parameter | Check auth_code, app_key, app_secret |
| 10001 | System error | Try again later |
| 10002 | Invalid app key | Verify TIKTOK_APP_KEY |
| 10003 | Invalid access token | Token expired, refresh it |
| 10004 | Invalid auth code | Get a new auth code |

### 8. Still Having Issues?

If you're still experiencing problems:

1. Enable full error logging in the SDK by checking the response body
2. Verify your TikTok Shop account has the correct permissions
3. Make sure you're using the correct region (US/UK/etc.)
4. Check if your app is in sandbox mode or production mode
5. Contact TikTok Shop Developer Support with your request_id from error responses

## Additional Resources

- [TikTok Shop API Documentation](https://partner.tiktokshop.com/doc)
- [OAuth 2.0 Flow Guide](https://partner.tiktokshop.com/doc/page/262765)
- [Error Codes Reference](https://partner.tiktokshop.com/doc/page/262766)
