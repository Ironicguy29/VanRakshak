import dotenv from 'dotenv';
import twilio from 'twilio';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module equivalents for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from parent directory
dotenv.config({ path: path.join(__dirname, '../.env') });

async function sendTestSMS() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     VanRakshak - Twilio Test Credentials SMS Test        ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Use the tertiary credentials
  const sid = process.env.TWILIO_ACCOUNT_SID3;
  const token = process.env.TWILIO_AUTH_TOKEN3;
  const from = process.env.TWILIO_FROM;
  const to = process.env.ALERT_TO;

  console.log('Configuration:');
  console.log(`Account SID: ${sid}`);
  console.log(`Auth Token: ${token?.substring(0, 4)}${'*'.repeat((token?.length || 0) - 4)}`);
  console.log(`From: ${from}`);
  console.log(`To: ${to}\n`);

  if (!sid || !token || !from || !to) {
    console.log('❌ Missing configuration in .env file');
    process.exit(1);
  }

  try {
    console.log('ℹ️  Note: These are Twilio TEST CREDENTIALS');
    console.log('   Test credentials have specific behavior:\n');
    console.log('   ✓ Can send to "Magic Numbers" for testing');
    console.log('   ✓ Magic numbers: +15005550006 (valid), +15005550001 (invalid), etc.');
    console.log('   ✓ Real SMS will NOT be delivered with test credentials');
    console.log('   ✓ Messages will appear in Twilio logs but not on real phones\n');

    console.log('Initializing Twilio client...');
    const client = twilio(sid, token);

    const testMessage = `🧪 VanRakshak SMS Test (Test Credentials)

Time: ${new Date().toLocaleString()}
Status: Testing with Twilio Test Account

This is a test message using Twilio test credentials.
Real SMS will not be delivered, but the API call should succeed.`;

    console.log('Sending test SMS...\n');

    const message = await client.messages.create({
      from: from,
      to: to,
      body: testMessage
    });

    console.log('✅ SMS API CALL SUCCESSFUL!');
    console.log(`   Message SID: ${message.sid}`);
    console.log(`   Status: ${message.status}`);
    console.log(`   Direction: ${message.direction}`);
    console.log(`   Price: ${message.price || 'N/A'}`);
    console.log(`   Price Unit: ${message.priceUnit || 'N/A'}`);
    
    console.log(`\n⚠️  IMPORTANT:`);
    console.log(`   - Test credentials: No real SMS was sent to ${to}`);
    console.log(`   - The API call succeeded, proving your integration works`);
    console.log(`   - To send REAL SMS, you need production Twilio credentials`);
    console.log(`\n📝 To upgrade to production:`);
    console.log(`   1. Visit: https://console.twilio.com/`);
    console.log(`   2. Upgrade your account (add payment method)`);
    console.log(`   3. Get production Account SID and Auth Token`);
    console.log(`   4. Purchase a phone number`);
    console.log(`   5. Update .env with production credentials`);

  } catch (error: any) {
    console.log('❌ SMS FAILED\n');
    console.log(`Error: ${error.message}`);
    if (error.code) {
      console.log(`Error Code: ${error.code}`);
    }
    if (error.status) {
      console.log(`HTTP Status: ${error.status}`);
    }

    console.log('\n💡 Common issues with test credentials:');
    console.log('   - Error 21606: FROM number not valid (use magic number: +15005550006)');
    console.log('   - Error 21408: TO number permission denied');
    console.log('   - Error 20003: Invalid credentials');
    
    if (error.code === 21606) {
      console.log(`\n💡 FIX: Update your .env file:`);
      console.log(`   TWILIO_FROM=+15005550006  (Twilio magic number)`);
    }
  }
}

// Run the test
sendTestSMS().catch(console.error);
