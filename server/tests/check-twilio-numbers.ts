import dotenv from 'dotenv';
import twilio from 'twilio';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module equivalents for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from parent directory
dotenv.config({ path: path.join(__dirname, '../.env') });

async function checkPhoneNumbers() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     VanRakshak - Check Twilio Phone Numbers              ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Try the tertiary credentials (most promising)
  const sid = process.env.TWILIO_ACCOUNT_SID3;
  const token = process.env.TWILIO_AUTH_TOKEN3;

  if (!sid || !token) {
    console.log('❌ Tertiary credentials not configured in .env');
    process.exit(1);
  }

  console.log(`Account SID: ${sid}`);
  console.log(`Auth Token: ${token.substring(0, 4)}${'*'.repeat(token.length - 4)}\n`);

  try {
    console.log('Connecting to Twilio...\n');
    const client = twilio(sid, token);

    console.log('Fetching your Twilio phone numbers...\n');
    const numbers = await client.incomingPhoneNumbers.list({ limit: 20 });

    if (numbers.length === 0) {
      console.log('❌ No phone numbers found on this account!\n');
      console.log('You need to purchase or acquire a phone number first:');
      console.log('https://console.twilio.com/us1/develop/phone-numbers/manage/search\n');
      return;
    }

    console.log(`✅ Found ${numbers.length} phone number(s):\n`);
    console.log('─'.repeat(60));

    numbers.forEach((number, index) => {
      console.log(`\n${index + 1}. ${number.phoneNumber}`);
      console.log(`   Friendly Name: ${number.friendlyName || 'N/A'}`);
      console.log(`   SMS Capable: ${number.capabilities.sms ? '✅ Yes' : '❌ No'}`);
      console.log(`   Voice Capable: ${number.capabilities.voice ? '✅ Yes' : '❌ No'}`);
      console.log(`   Status: ${number.status}`);
    });

    console.log('\n' + '─'.repeat(60));

    // Find SMS-capable numbers
    const smsNumbers = numbers.filter(n => n.capabilities.sms);
    
    if (smsNumbers.length > 0) {
      console.log(`\n✅ SMS-Capable Numbers: ${smsNumbers.length}`);
      console.log(`\n💡 Update your .env file with one of these numbers:\n`);
      smsNumbers.forEach((number, index) => {
        console.log(`   Option ${index + 1}: TWILIO_FROM=${number.phoneNumber}`);
      });
    } else {
      console.log(`\n❌ No SMS-capable numbers found!`);
      console.log(`   You need to purchase an SMS-capable phone number.`);
    }

    console.log(`\n📝 Recommended .env configuration:\n`);
    if (smsNumbers.length > 0) {
      console.log(`   TWILIO_ACCOUNT_SID=${sid}`);
      console.log(`   TWILIO_AUTH_TOKEN=${token}`);
      console.log(`   TWILIO_FROM=${smsNumbers[0].phoneNumber}  ← Use this!`);
      console.log(`   ALERT_TO=${process.env.ALERT_TO}`);
      console.log(`\n   Then run: npm run test:sms`);
    }

  } catch (error: any) {
    console.log('❌ Error connecting to Twilio:\n');
    console.log(`   ${error.message}`);
    if (error.code) {
      console.log(`   Error Code: ${error.code}`);
    }
    
    if (error.code === 20003) {
      console.log(`\n   This means the credentials are invalid or expired.`);
      console.log(`   Please check your Twilio console for correct credentials.`);
    }
  }
}

// Run the check
checkPhoneNumbers().catch(console.error);
