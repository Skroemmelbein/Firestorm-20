import https from 'https';
import { config } from 'dotenv';
config();

console.log('🧪 Testing SMS with Enhanced Auth Manager');
console.log('=========================================\n');

function testAuthToken(accountSid, authToken) {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    
    const options = {
      hostname: 'api.twilio.com',
      port: 443,
      path: `/2010-04-01/Accounts/${accountSid}.json`,
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
            method: 'auth_token',
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

function sendSMSWithAuth(accountSid, authToken, to, body, from) {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    
    const postData = new URLSearchParams({
      To: to,
      From: from,
      Body: body
    }).toString();
    
    const options = {
      hostname: 'api.twilio.com',
      port: 443,
      path: `/2010-04-01/Accounts/${accountSid}/Messages.json`,
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
            authMethod: 'auth_token'
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

async function main() {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const phoneNumber = process.env.TWILIO_PHONE_NUMBER || '+18559600037';
    
    console.log('1. Testing authentication with current credentials...');
    console.log('   Account SID:', accountSid ? accountSid.substring(0, 10) + '...' : 'NOT SET');
    console.log('   Auth Token:', authToken ? 'SET (32 chars)' : 'NOT SET');
    console.log('   Phone Number:', phoneNumber);
    
    const authResult = await testAuthToken(accountSid, authToken);
    
    console.log(`\n   Auth test result: ${authResult.success ? '✅ Success' : `❌ Failed - ${authResult.error}`}`);
    console.log('   Status Code:', authResult.statusCode);
    
    if (authResult.success && authResult.data) {
      console.log('   Account Name:', authResult.data.friendly_name);
      console.log('   Account Status:', authResult.data.status);
      
      console.log('\n2. 🎯 Authentication successful! Testing SMS sending...');
      
      try {
        const smsResult = await sendSMSWithAuth(
          accountSid,
          authToken,
          '+18144409068',
          'Test SMS from ECHELONX Direct Auth - ' + new Date().toLocaleTimeString(),
          phoneNumber
        );
        
        if (smsResult.success) {
          console.log('   ✅ SMS sent successfully!');
          console.log('   Message SID:', smsResult.data.sid);
          console.log('   Status:', smsResult.data.status);
          console.log('   To:', smsResult.data.to);
          console.log('   From:', smsResult.data.from);
        } else {
          console.log('   ❌ SMS failed:', smsResult.data?.message || 'Unknown error');
          console.log('   Status code:', smsResult.statusCode);
          console.log('   Error details:', JSON.stringify(smsResult.data, null, 2));
        }
      } catch (smsError) {
        console.error('   💥 SMS error:', smsError.message);
      }
    } else {
      console.log('\n❌ Authentication failed - credentials appear to be invalid or expired');
      console.log('\n📋 Next steps:');
      console.log('1. Log into Twilio Console: https://console.twilio.com');
      console.log('2. Go to Account → API Keys & Tokens');
      console.log('3. Create a new Auth Token or API Key');
      console.log('4. Update the .env file with new credentials');
      console.log('5. Restart the server and test SMS functionality');
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

main();
