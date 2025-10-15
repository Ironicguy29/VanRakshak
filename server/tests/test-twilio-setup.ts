import dotenv from 'dotenv';
import twilio from 'twilio';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from server root directory
dotenv.config({ path: join(__dirname, '../../.env') });

async function testTwilioSetup() {
  console.log('Testing Twilio Setup...\n');

  // Check environment variables
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM;
  const to = process.env.ALERT_TO;

  console.log('✓ Account SID:', sid ? `${sid.substring(0, 10)}...` : 'MISSING');
  console.log('✓ Auth Token:', token ? `${token.substring(0, 5)}...` : 'MISSING');
  console.log('✓ From Number:', from || 'MISSING');
  console.log('✓ To Number:', to || 'MISSING');
  console.log();

  if (!sid || !token || !from || !to) {
    console.error('❌ Missing required environment variables!');
    return;
  }

  try {
    const client = twilio(sid, token);
    console.log('Sending test SMS...');

    const message = await client.messages.create({
      from: from,
      to: to,
      body: '🐾 VanRakshak Test: Twilio SMS is working correctly!'
    });

    console.log('✅ SMS sent successfully!');
    console.log('Message SID:', message.sid);
    console.log('Status:', message.status);
  } catch (error) {
    console.error('❌ Error sending SMS:', error);
  }
}

testTwilioSetup();
