import dotenv from 'dotenv';
import twilio from 'twilio';
import path from 'path';
import { fileURLToPath } from 'url';
// ES module equivalents for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Load environment variables from parent directory
dotenv.config({ path: path.join(__dirname, '../.env') });
// Collect all credential sets
const credentialSets = [
    {
        name: 'Primary Credentials',
        sid: process.env.TWILIO_ACCOUNT_SID,
        token: process.env.TWILIO_AUTH_TOKEN,
    },
    {
        name: 'Secondary Credentials (Set 2)',
        sid: process.env.TWILIO_ACCOUNT_SID2,
        token: process.env.TWILIO_AUTH_TOKEN2,
    },
    {
        name: 'Tertiary Credentials (Set 3)',
        sid: process.env.TWILIO_ACCOUNT_SID3,
        token: process.env.TWILIO_AUTH_TOKEN3,
    }
];
const from = process.env.TWILIO_FROM;
const to = process.env.ALERT_TO;
async function testCredentials(name, sid, token, index) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Testing ${name}`);
    console.log(`${'='.repeat(60)}\n`);
    if (!sid || !token) {
        console.log(`❌ Credentials not configured`);
        console.log(`   SID: ${sid ? '✓ Set' : '✗ Missing'}`);
        console.log(`   Token: ${token ? '✓ Set' : '✗ Missing'}`);
        return false;
    }
    console.log(`Account SID: ${sid}`);
    console.log(`Auth Token: ${token.substring(0, 4)}${'*'.repeat(token.length - 4)}`);
    console.log(`From: ${from}`);
    console.log(`To: ${to}`);
    if (!from || !to) {
        console.log(`\n❌ Phone numbers not configured!`);
        return false;
    }
    try {
        console.log(`\nInitializing Twilio client...`);
        const client = twilio(sid, token);
        const testMessage = `🧪 VanRakshak SMS Test #${index + 1}

Time: ${new Date().toLocaleString()}
Credentials: ${name}
Status: ✅ SUCCESS

This test message confirms that SMS alerts are working correctly with ${name}.`;
        console.log(`Sending SMS...`);
        const message = await client.messages.create({
            from: from,
            to: to,
            body: testMessage
        });
        console.log(`\n✅ SUCCESS! SMS sent with ${name}`);
        console.log(`   Message SID: ${message.sid}`);
        console.log(`   Status: ${message.status}`);
        console.log(`   Direction: ${message.direction}`);
        console.log(`\n📱 Check your phone at ${to} for the test message!`);
        return true;
    }
    catch (error) {
        console.log(`\n❌ FAILED with ${name}`);
        console.log(`   Error: ${error.message}`);
        if (error.code) {
            console.log(`   Error Code: ${error.code}`);
        }
        if (error.status) {
            console.log(`   Status: ${error.status}`);
        }
        return false;
    }
}
async function testAllCredentials() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║         VanRakshak SMS Test - All Credentials             ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    let successFound = false;
    let workingCredentials = '';
    for (let i = 0; i < credentialSets.length; i++) {
        const { name, sid, token } = credentialSets[i];
        const success = await testCredentials(name, sid, token, i);
        if (success) {
            successFound = true;
            workingCredentials = name;
            break; // Stop after first successful send
        }
    }
    console.log(`\n${'='.repeat(60)}`);
    console.log('FINAL RESULT');
    console.log(`${'='.repeat(60)}\n`);
    if (successFound) {
        console.log(`✅ SMS SENDING WORKS!`);
        console.log(`   Working Credentials: ${workingCredentials}`);
        console.log(`\n💡 Recommendation: Update your notify.ts to use these credentials.`);
    }
    else {
        console.log(`❌ ALL CREDENTIALS FAILED`);
        console.log(`\n📋 Summary of Issues:\n`);
        console.log(`1. Primary (ACea66...): Authentication failed (Error 20003)`);
        console.log(`   → Invalid or expired credentials`);
        console.log(`\n2. Secondary (SK647...): API Key - requires special handling`);
        console.log(`   → This is an API Key (SK...), not an Account SID (AC...)`);
        console.log(`\n3. Tertiary (AC61f8...): Invalid FROM number (Error 21606)`);
        console.log(`   → The phone number +19033643491 is not owned by account AC61f8...`);
        console.log(`\n💡 NEXT STEPS - Get YOUR Twilio Phone Number:`);
        console.log(`\n   The tertiary credentials (AC61f8...) are valid but need the correct phone!`);
        console.log(`\n   1. Login: https://console.twilio.com/`);
        console.log(`   2. Go to: Phone Numbers → Manage → Active numbers`);
        console.log(`   3. Copy YOUR Twilio phone number (format: +1XXXXXXXXXX)`);
        console.log(`   4. Update .env: TWILIO_FROM=<your_actual_twilio_number>`);
        console.log(`   5. Re-run: npm run test:all-credentials`);
        console.log(`\n   OR buy a new phone number if you don't have one yet.`);
    }
}
// Run the test
testAllCredentials().catch(console.error);
