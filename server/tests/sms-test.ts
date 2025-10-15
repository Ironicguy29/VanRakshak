import dotenv from 'dotenv';
import twilio from 'twilio';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module equivalents for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from parent directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const sid = process.env.TWILIO_ACCOUNT_SID;
const token = process.env.TWILIO_AUTH_TOKEN;
const from = process.env.TWILIO_FROM;
const to = process.env.ALERT_TO;

async function testSMS() {
  console.log('=== SMS Alert Test ===\n');
  
  // Verify configuration
  console.log('Configuration Check:');
  console.log(`- TWILIO_ACCOUNT_SID: ${sid ? '✓ Set' : '✗ Missing'}`);
  console.log(`- TWILIO_AUTH_TOKEN: ${token ? '✓ Set' : '✗ Missing'}`);
  console.log(`- TWILIO_FROM: ${from || '✗ Missing'}`);
  console.log(`- ALERT_TO: ${to || '✗ Missing'}`);
  console.log();

  if (!sid || !token) {
    console.error('❌ Twilio credentials not configured!');
    process.exit(1);
  }

  if (!from || !to) {
    console.error('❌ Phone numbers not configured!');
    process.exit(1);
  }

  try {
    console.log('Initializing Twilio client...');
    const client = twilio(sid, token);

    const testMessage = `🧪 TEST ALERT from VanRakshak System
    
Time: ${new Date().toLocaleString()}
Status: Test SMS successful
    
This is a test message to verify SMS alerts are working correctly.`;

    console.log(`\nSending SMS from ${from} to ${to}...`);
    console.log(`Message: "${testMessage.substring(0, 50)}..."\n`);

    const message = await client.messages.create({
      from: from,
      to: to,
      body: testMessage
    });

    console.log('✅ SMS sent successfully!');
    console.log(`Message SID: ${message.sid}`);
    console.log(`Status: ${message.status}`);
    console.log(`Direction: ${message.direction}`);
    console.log(`\nCheck your phone at ${to} for the test message.`);

  } catch (error: any) {
    console.error('❌ Failed to send SMS:');
    console.error(`Error: ${error.message}`);
    if (error.code) {
      console.error(`Error Code: ${error.code}`);
    }
    if (error.moreInfo) {
      console.error(`More Info: ${error.moreInfo}`);
    }
    process.exit(1);
  }
}

// Run the test
testSMS();
