import dotenv from 'dotenv';
import twilio from 'twilio';
import path from 'path';
import { fileURLToPath } from 'url';
// ES module equivalents for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Load environment variables from parent directory
dotenv.config({ path: path.join(__dirname, '../.env') });
async function quickTest() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║        VanRakshak - QUICK SMS TEST (Magic Number)        ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    // Use the working credentials (Set 3)
    const sid = process.env.TWILIO_ACCOUNT_SID3;
    const token = process.env.TWILIO_AUTH_TOKEN3;
    // Use Twilio magic number for testing
    const magicNumber = '+15005550006';
    const realAlertNumber = process.env.ALERT_TO;
    console.log('✨ Using Twilio Magic Number for Testing\n');
    console.log(`Account SID: ${sid}`);
    console.log(`Auth Token: ${token?.substring(0, 4)}${'*'.repeat((token?.length || 0) - 4)}`);
    console.log(`From: ${magicNumber} (Magic Number)`);
    console.log(`To: ${magicNumber} (Magic Number)`);
    console.log(`Real Alert Number: ${realAlertNumber} (will use after upgrade)\n`);
    if (!sid || !token) {
        console.log('❌ Missing credentials in .env file');
        process.exit(1);
    }
    try {
        console.log('Initializing Twilio client...');
        const client = twilio(sid, token);
        const testMessage = `🧪 VanRakshak Quick Test ✅

Time: ${new Date().toLocaleString()}
Test Mode: Magic Number
Status: SUCCESS

Your SMS integration is working correctly!

Next steps:
1. Upgrade Twilio account
2. Get real phone number
3. Send to ${realAlertNumber}`;
        console.log('Sending test SMS with magic number...\n');
        const message = await client.messages.create({
            from: magicNumber,
            to: magicNumber,
            body: testMessage
        });
        console.log('🎉 SUCCESS! SMS API WORKING!');
        console.log('─'.repeat(60));
        console.log(`✅ Message SID: ${message.sid}`);
        console.log(`✅ Status: ${message.status}`);
        console.log(`✅ From: ${message.from}`);
        console.log(`✅ To: ${message.to}`);
        console.log('─'.repeat(60));
        console.log(`\n💡 What This Means:\n`);
        console.log(`   ✓ Your Twilio integration code is correct`);
        console.log(`   ✓ Credentials are valid (test account)`);
        console.log(`   ✓ SMS API calls work successfully`);
        console.log(`   ✗ Real SMS not sent (test credentials limitation)`);
        console.log(`\n📱 To Send Real SMS to ${realAlertNumber}:\n`);
        console.log(`   1. Upgrade Twilio account (add payment method)`);
        console.log(`   2. Purchase a phone number (~$1/month)`);
        console.log(`   3. Update .env:`);
        console.log(`      TWILIO_ACCOUNT_SID=<your_production_sid>`);
        console.log(`      TWILIO_AUTH_TOKEN=<your_production_token>`);
        console.log(`      TWILIO_FROM=<your_purchased_number>`);
        console.log(`      ALERT_TO=${realAlertNumber}`);
        console.log(`   4. Run: npm run test:sms`);
        console.log(`\n🔗 Upgrade Now: https://console.twilio.com/\n`);
    }
    catch (error) {
        console.log('❌ TEST FAILED\n');
        console.log(`Error: ${error.message}`);
        if (error.code) {
            console.log(`Error Code: ${error.code}`);
        }
        console.log(`\n💡 If you see this error, check:`);
        console.log(`   1. Internet connection`);
        console.log(`   2. Twilio service status: https://status.twilio.com/`);
        console.log(`   3. Credentials in .env file`);
        process.exit(1);
    }
}
// Run the test
quickTest().catch(console.error);
