import https from 'https';
import { config } from 'dotenv';
config();

console.log('🔄 Twilio Credential Refresh Script');
console.log('===================================\n');

const currentAccountSid = process.env.TWILIO_ACCOUNT_SID;
const currentAuthToken = process.env.TWILIO_AUTH_TOKEN;

console.log('Current credentials status:');
console.log('TWILIO_ACCOUNT_SID:', currentAccountSid ? currentAccountSid.substring(0, 10) + '...' : 'NOT SET');
console.log('TWILIO_AUTH_TOKEN:', currentAuthToken ? 'SET (32 chars)' : 'NOT SET');

function testCredentials(accountSid, authToken) {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    
    const options = {
      hostname: 'api.twilio.com',
      port: 443,
      path: `/2010-04-01/Accounts/${accountSid}.json`,
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          if (res.statusCode === 200) {
            resolve({ success: true, data: parsedData });
          } else {
            resolve({ success: false, error: parsedData, statusCode: res.statusCode });
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function main() {
  try {
    console.log('\n🧪 Testing current credentials...');
    const result = await testCredentials(currentAccountSid, currentAuthToken);
    
    if (result.success) {
      console.log('✅ Current credentials are working!');
      console.log('Account Name:', result.data.friendly_name);
      console.log('Account Status:', result.data.status);
      console.log('No credential refresh needed.');
    } else {
      console.log('❌ Current credentials failed authentication');
      console.log('Status Code:', result.statusCode);
      console.log('Error:', result.error);
      
      if (result.error && result.error.code === 20003) {
        console.log('\n🔍 Error Code 20003: Authentication failed');
        console.log('This typically means:');
        console.log('1. Auth Token is invalid or expired');
        console.log('2. Account SID is incorrect');
        console.log('3. Credentials are console passwords instead of API tokens');
        
        console.log('\n📋 Next Steps:');
        console.log('1. Log into Twilio Console: https://console.twilio.com');
        console.log('2. Go to Account → API Keys & Tokens');
        console.log('3. Create a new Auth Token or API Key');
        console.log('4. Update the .env file with new credentials');
        console.log('5. Restart the server');
      }
    }
  } catch (error) {
    console.error('💥 Error testing credentials:', error);
  }
}

main();
