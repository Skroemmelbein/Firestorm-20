import { config } from 'dotenv';
config();

export interface TwilioCredentials {
  accountSid: string;
  authToken?: string;
  apiKeySid?: string;
  apiKeySecret?: string;
}

export interface AuthTestResult {
  success: boolean;
  method: string;
  error?: string;
  statusCode?: number;
  accountInfo?: any;
}

export class TwilioAuthManager {
  private credentials: TwilioCredentials;

  constructor(credentials?: TwilioCredentials) {
    this.credentials = credentials || {
      accountSid: process.env.TWILIO_ACCOUNT_SID || '',
      authToken: process.env.TWILIO_AUTH_TOKEN || '',
      apiKeySid: process.env.TWILIO_API_KEY_SID || '',
      apiKeySecret: process.env.TWILIO_API_KEY_SECRET || ''
    };
  }

  /**
   * Test authentication using Auth Token
   */
  async testAuthToken(): Promise<AuthTestResult> {
    if (!this.credentials.accountSid || !this.credentials.authToken) {
      return {
        success: false,
        method: 'auth_token',
        error: 'Missing Account SID or Auth Token'
      };
    }

    try {
      const response = await this.makeAuthenticatedRequest(
        this.credentials.accountSid,
        this.credentials.authToken,
        `/2010-04-01/Accounts/${this.credentials.accountSid}.json`
      );

      return {
        success: response.success,
        method: 'auth_token',
        error: response.error,
        statusCode: response.statusCode,
        accountInfo: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        method: 'auth_token',
        error: error.message
      };
    }
  }

  /**
   * Test authentication using API Key
   */
  async testAPIKey(): Promise<AuthTestResult> {
    if (!this.credentials.accountSid || !this.credentials.apiKeySid || !this.credentials.apiKeySecret) {
      return {
        success: false,
        method: 'api_key',
        error: 'Missing Account SID, API Key SID, or API Key Secret'
      };
    }

    try {
      const response = await this.makeAuthenticatedRequest(
        this.credentials.apiKeySid,
        this.credentials.apiKeySecret,
        `/2010-04-01/Accounts/${this.credentials.accountSid}.json`
      );

      return {
        success: response.success,
        method: 'api_key',
        error: response.error,
        statusCode: response.statusCode,
        accountInfo: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        method: 'api_key',
        error: error.message
      };
    }
  }

  /**
   * Test all available authentication methods
   */
  async testAllMethods(): Promise<AuthTestResult[]> {
    const results: AuthTestResult[] = [];

    const authTokenResult = await this.testAuthToken();
    results.push(authTokenResult);

    if (this.credentials.apiKeySid && this.credentials.apiKeySecret) {
      const apiKeyResult = await this.testAPIKey();
      results.push(apiKeyResult);
    }

    return results;
  }

  /**
   * Get the best working authentication method
   */
  async getBestAuthMethod(): Promise<{ method: string; credentials: any } | null> {
    const results = await this.testAllMethods();
    
    const workingResult = results.find(r => r.success);
    if (!workingResult) {
      return null;
    }

    if (workingResult.method === 'auth_token') {
      return {
        method: 'auth_token',
        credentials: {
          username: this.credentials.accountSid,
          password: this.credentials.authToken
        }
      };
    } else if (workingResult.method === 'api_key') {
      return {
        method: 'api_key',
        credentials: {
          username: this.credentials.apiKeySid,
          password: this.credentials.apiKeySecret
        }
      };
    }

    return null;
  }

  /**
   * Make authenticated request to Twilio API
   */
  private async makeAuthenticatedRequest(username: string, password: string, path: string): Promise<any> {
    const https = await import('https');
    
    return new Promise((resolve, reject) => {
      const auth = Buffer.from(`${username}:${password}`).toString('base64');
      
      const options = {
        hostname: 'api.twilio.com',
        port: 443,
        path: path,
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'User-Agent': 'ECHELONX-SMS-System/1.0'
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const parsedData = JSON.parse(data);
            resolve({
              success: res.statusCode === 200,
              data: parsedData,
              statusCode: res.statusCode,
              error: res.statusCode !== 200 ? parsedData.message || 'Authentication failed' : undefined
            });
          } catch (e) {
            reject(e);
          }
        });
      });

      req.on('error', reject);
      req.end();
    });
  }

  /**
   * Send SMS using the best available authentication method
   */
  async sendSMS(to: string, body: string, from?: string): Promise<any> {
    const authMethod = await this.getBestAuthMethod();
    if (!authMethod) {
      throw new Error('No working Twilio authentication method available');
    }

    const fromNumber = from || process.env.TWILIO_PHONE_NUMBER || '+18559600037';
    
    const https = await import('https');
    const querystring = await import('querystring');
    
    return new Promise((resolve, reject) => {
      const auth = Buffer.from(`${authMethod.credentials.username}:${authMethod.credentials.password}`).toString('base64');
      
      const postData = querystring.stringify({
        To: to,
        From: fromNumber,
        Body: body
      });
      
      const options = {
        hostname: 'api.twilio.com',
        port: 443,
        path: `/2010-04-01/Accounts/${this.credentials.accountSid}/Messages.json`,
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData),
          'User-Agent': 'ECHELONX-SMS-System/1.0'
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const parsedData = JSON.parse(data);
            resolve({
              success: res.statusCode === 201,
              data: parsedData,
              statusCode: res.statusCode,
              authMethod: authMethod.method
            });
          } catch (e) {
            reject(e);
          }
        });
      });

      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  }

  /**
   * Generate credential refresh instructions
   */
  generateRefreshInstructions(): string {
    return `
🔄 Twilio Credential Refresh Instructions
========================================

Current Status: Authentication failing with error code 20003

Steps to refresh credentials:

1. 🌐 Login to Twilio Console
   - Go to: https://console.twilio.com
   - Use your Twilio account credentials

2. 🔑 Generate New Auth Token
   - Navigate to: Account → API Keys & Tokens
   - Click "Create new Auth Token"
   - Copy the new token immediately (it won't be shown again)

3. 📝 Update Environment Variables
   - Update .env file with new credentials:
     TWILIO_ACCOUNT_SID=${this.credentials.accountSid}
     TWILIO_AUTH_TOKEN=<new_auth_token>

4. 🔄 Alternative: Create API Key (Recommended)
   - In Twilio Console: Account → API Keys & Tokens
   - Click "Create API Key"
   - Set friendly name: "ECHELONX-SMS-System"
   - Copy both SID and Secret
   - Update .env file:
     TWILIO_API_KEY_SID=<api_key_sid>
     TWILIO_API_KEY_SECRET=<api_key_secret>

5. ✅ Test New Credentials
   - Restart the server
   - Run: node scripts/refresh-twilio-credentials.js
   - Test SMS: curl -X POST http://localhost:5000/api/real/sms/send -H "Content-Type: application/json" -d '{"to": "+18144409068", "body": "Test SMS"}'

Note: API Keys are more secure than Auth Tokens and can be rotated independently.
`;
  }
}

export default TwilioAuthManager;
