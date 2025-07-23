#!/usr/bin/env node

// Setup script to configure environment variables
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

console.log('🚀 Setting up RecurFlow environment...\n');

// Check if .env already exists
const envPath = path.join(projectRoot, '.env');
const envExamplePath = path.join(projectRoot, '.env.example');

if (fs.existsSync(envPath)) {
  console.log('✅ .env file already exists');
  
  // Read current .env and check what's configured
  const envContent = fs.readFileSync(envPath, 'utf8');
  const hasXano = envContent.includes('XANO_INSTANCE_URL') && envContent.includes('XANO_API_KEY');
  const hasTwilio = envContent.includes('TWILIO_ACCOUNT_SID') && envContent.includes('TWILIO_AUTH_TOKEN');
  
  console.log('\n📋 Current Configuration:');
  console.log(`   Xano: ${hasXano ? '✅ Configured' : '❌ Missing'}`);
  console.log(`   Twilio: ${hasTwilio ? '✅ Configured' : '❌ Missing'}`);
  
  if (!hasXano || !hasTwilio) {
    console.log('\n⚠️  Some credentials are missing. Please update your .env file with:');
    if (!hasXano) {
      console.log('   - XANO_INSTANCE_URL');
      console.log('   - XANO_API_KEY'); 
      console.log('   - XANO_DATABASE_ID');
    }
    if (!hasTwilio) {
      console.log('   - TWILIO_ACCOUNT_SID');
      console.log('   - TWILIO_AUTH_TOKEN');
      console.log('   - TWILIO_PHONE_NUMBER');
    }
  }
} else {
  console.log('📝 Creating .env file from template...');
  
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Created .env file');
    console.log('\n⚠️  Please edit .env file with your actual credentials:');
    console.log(`   📍 Location: ${envPath}`);
  } else {
    // Create basic .env file
    const envTemplate = `# Xano Database Configuration
XANO_INSTANCE_URL=https://your-workspace-id.xano.io
XANO_API_KEY=your_xano_api_key_here
XANO_DATABASE_ID=your_database_id

# Twilio Configuration  
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890

# Application Configuration
NODE_ENV=development
PORT=8080

# Optional: Additional Services
STRIPE_SECRET_KEY=sk_test_xxx
SENDGRID_API_KEY=SG.xxx

# Security
JWT_SECRET=your_jwt_secret_here_${Math.random().toString(36).substring(2)}
ENCRYPTION_KEY=${Math.random().toString(36).substring(2).padEnd(32, '0')}
`;
    
    fs.writeFileSync(envPath, envTemplate);
    console.log('✅ Created .env file with template');
  }
}

console.log('\n🔗 Next Steps:');
console.log('1. 📱 Login to your Xano workspace at app.xano.com');
console.log('2. 🔑 Get your Instance URL, API Key, and Database ID');
console.log('3. 📞 Get your Twilio credentials from console.twilio.com');
console.log('4. ✏️  Update the .env file with real credentials');
console.log('5. 🚀 Run: npm run dev');

console.log('\n📖 For detailed instructions, see: SETUP_INSTRUCTIONS.md');
console.log('\n🎯 Test your setup at: http://localhost:8080/integrations');
