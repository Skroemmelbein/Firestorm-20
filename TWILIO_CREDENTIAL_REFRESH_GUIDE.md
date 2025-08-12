# Twilio Credential Refresh Guide

## Current Status
- **Issue**: SMS functionality failing with HTTP 401 error code 20003 "Authenticate"
- **Root Cause**: Twilio credentials are invalid or expired
- **Fix Applied**: Enhanced authentication error handling to properly detect and report credential issues

## Credential Verification Results

### Current Credentials
- **Account SID**: ACf1f39d9f653df3669fa99343e88b2074
- **Auth Token**: 1f9a48e4dcd9c518889e148fe931e226 (32 chars, lowercase hex format)
- **Phone Number**: +18559600037

### Authentication Test Results
```bash
# Direct Twilio API test confirms authentication failure
curl -X GET "https://api.twilio.com/2010-04-01/Accounts/ACf1f39d9f653df3669fa99343e88b2074.json" \
  -u "ACf1f39d9f653df3669fa99343e88b2074:1f9a48e4dcd9c518889e148fe931e226"

# Response: {"code":20003,"message":"Authenticate","more_info":"https://www.twilio.com/docs/errors/20003","status":401}
```

## Credential Refresh Steps

### Option 1: Refresh Auth Token (Recommended)
1. **Login to Twilio Console**: https://console.twilio.com
2. **Navigate to API Keys & Tokens**: Account → API Keys & Tokens
3. **Create New Auth Token**:
   - Click "Create new Auth Token"
   - Copy the new token immediately (it won't be shown again)
4. **Update Environment Variables**:
   ```bash
   # Update .env file
   TWILIO_ACCOUNT_SID=ACf1f39d9f653df3669fa99343e88b2074
   TWILIO_AUTH_TOKEN=<new_auth_token>
   ```

### Option 2: Create API Key (More Secure)
1. **Login to Twilio Console**: https://console.twilio.com
2. **Navigate to API Keys & Tokens**: Account → API Keys & Tokens
3. **Create API Key**:
   - Click "Create API Key"
   - Set friendly name: "ECHELONX-SMS-System"
   - Copy both SID and Secret
4. **Update Environment Variables**:
   ```bash
   # Update .env file
   TWILIO_API_KEY_SID=<api_key_sid>
   TWILIO_API_KEY_SECRET=<api_key_secret>
   TWILIO_ACCOUNT_SID=ACf1f39d9f653df3669fa99343e88b2074
   ```

## Testing New Credentials

### 1. Test Authentication
```bash
# Run credential test script
node scripts/refresh-twilio-credentials.js
```

### 2. Test SMS Functionality
```bash
# Test SMS endpoint
curl -X POST http://localhost:5000/api/real/sms/send \
  -H "Content-Type: application/json" \
  -d '{"to": "+18144409068", "body": "Test SMS with new credentials"}'
```

### 3. Expected Success Response
```json
{
  "success": true,
  "message": "SMS sent to +18144409068",
  "result": {
    "sid": "SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "status": "queued",
    "to": "+18144409068",
    "from": "+18559600037"
  },
  "httpStatus": 200,
  "timestamp": "2025-08-06T22:48:34.634Z"
}
```

## Error Code Reference

### 20003 - Authenticate
- **Meaning**: Authentication failed
- **Common Causes**:
  - Auth Token is invalid or expired
  - Account SID is incorrect
  - Using console password instead of API auth token
  - Account has been suspended or restricted

### 20404 - Not Found
- **Meaning**: Account SID not found
- **Solution**: Verify Account SID is correct

### 20429 - Too Many Requests
- **Meaning**: Rate limit exceeded
- **Solution**: Implement exponential backoff

## Enhanced Error Handling

The SMS system now includes comprehensive error handling:

- **Proper HTTP Status Codes**: 401 for authentication, 400 for validation, 500 for server errors
- **Detailed Error Messages**: Include Twilio error codes and helpful instructions
- **Credential Refresh Guidance**: Direct links to Twilio Console for credential management
- **Authentication Test Scripts**: Automated credential validation tools

## Next Steps

1. **Refresh Credentials**: Follow Option 1 or 2 above
2. **Test SMS Functionality**: Verify successful message delivery
3. **Update Documentation**: Record new credential details securely
4. **Monitor Performance**: Check SMS delivery rates and error logs

## Support Resources

- **Twilio Console**: https://console.twilio.com
- **Twilio Error Codes**: https://www.twilio.com/docs/errors/20003
- **API Documentation**: https://www.twilio.com/docs/messaging/api
- **Authentication Guide**: https://www.twilio.com/docs/iam/api-keys
