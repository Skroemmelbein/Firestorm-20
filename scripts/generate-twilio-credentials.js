import https from 'https';
import { config } from 'dotenv';
config();

console.log('🔑 Twilio API Credential Generator');
console.log('==================================\n');

function createAPIKey(accountSid, authToken, friendlyName = 'ECHELONX-API-Key') {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    
    const postData = JSON.stringify({
      FriendlyName: friendlyName
    });
    
    const options = {
      hostname: 'api.twilio.com',
      port: 443,
      path: `/2010-04-01/Accounts/${accountSid}/Keys.json`,
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          if (res.statusCode === 201) {
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
    req.write(postData);
    req.end();
  });
}

function testAlternativeAuth(accountSid, possiblePassword) {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${accountSid}:${possiblePassword}`).toString('base64');
    
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
          resolve({ 
            success: res.statusCode === 200, 
            data: parsedData, 
            statusCode: res.statusCode,
            authUsed: possiblePassword
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

async function main() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const currentAuthToken = process.env.TWILIO_AUTH_TOKEN;
  
  console.log('Current credentials:');
  console.log('Account SID:', accountSid);
  console.log('Auth Token:', currentAuthToken ? 'SET' : 'NOT SET');
  
  console.log('\n🧪 Testing alternative authentication methods...');
  
  console.log('1. Testing current auth token...');
  try {
    const result1 = await testAlternativeAuth(accountSid, currentAuthToken);
    if (result1.success) {
      console.log('✅ Current auth token works!');
      return;
    } else {
      console.log('❌ Current auth token failed:', result1.data?.message || 'Unknown error');
    }
  } catch (error) {
    console.log('❌ Error testing current auth token:', error.message);
  }
  
  console.log('\n2. Attempting to create new API key...');
  try {
    const apiKeyResult = await createAPIKey(accountSid, currentAuthToken);
    if (apiKeyResult.success) {
      console.log('✅ Successfully created new API key!');
      console.log('New API Key SID:', apiKeyResult.data.sid);
      console.log('New API Secret:', apiKeyResult.data.secret);
      console.log('\n📝 Update your .env file with:');
      console.log(`TWILIO_ACCOUNT_SID=${accountSid}`);
      console.log(`TWILIO_AUTH_TOKEN=${apiKeyResult.data.secret}`);
      console.log(`# Or use API Key approach:`);
      console.log(`TWILIO_API_KEY_SID=${apiKeyResult.data.sid}`);
      console.log(`TWILIO_API_KEY_SECRET=${apiKeyResult.data.secret}`);
    } else {
      console.log('❌ Failed to create API key:', apiKeyResult.error?.message || 'Unknown error');
    }
  } catch (error) {
    console.log('❌ Error creating API key:', error.message);
  }
  
  console.log('\n🔍 Credential Analysis:');
  console.log('Current auth token format:', currentAuthToken);
  console.log('Length:', currentAuthToken?.length || 0, 'characters');
  console.log('Pattern: All lowercase hex -', /^[a-f0-9]+$/.test(currentAuthToken || ''));
  
  if (currentAuthToken?.length === 32 && /^[a-f0-9]+$/.test(currentAuthToken)) {
    console.log('✅ Format looks like valid Twilio auth token');
    console.log('❌ But authentication is failing - token may be expired or revoked');
  }
  
  console.log('\n📋 Next Steps:');
  console.log('1. Log into Twilio Console: https://console.twilio.com');
  console.log('2. Go to Account → API Keys & Tokens');
  console.log('3. Create a new Auth Token or API Key');
  console.log('4. Update the .env file with new credentials');
  console.log('5. Restart the server and test SMS functionality');
}

main().catch(console.error);
