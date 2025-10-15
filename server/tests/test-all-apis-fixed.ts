import dotenv from 'dotenv';
import twilio from 'twilio';

dotenv.config();

const testConfigs = [
  {
    name: 'API 1 (Primary)',
    sid: process.env.TWILIO_ACCOUNT_SID,
    token: process.env.TWILIO_AUTH_TOKEN,
    from: process.env.TWILIO_FROM,
    to: process.env.ALERT_TO,
    isApiKey: false,
  },
  {
    name: 'API 2 (API Key)',
    sid: process.env.TWILIO_ACCOUNT_SID2, // This is actually an API Key (SK...)
    token: process.env.TWILIO_AUTH_TOKEN2,
    from: process.env.TWILIO_FROM,
    to: process.env.ALERT_TO,
    isApiKey: true,
    accountSid: process.env.TWILIO_ACCOUNT_SID3 || process.env.TWILIO_ACCOUNT_SID, // Need an AC... SID for API Key
  },
  {
    name: 'API 3',
    sid: process.env.TWILIO_ACCOUNT_SID3,
    token: process.env.TWILIO_AUTH_TOKEN3,
    from: process.env.TWILIO_FROM,
    to: process.env.ALERT_TO,
    isApiKey: false,
  },
];

async function testAPI(config: typeof testConfigs[0]) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing ${config.name}`);
  console.log(`${'='.repeat(60)}`);
  console.log(`SID/Key: ${config.sid?.substring(0, 10)}...`);
  console.log(`Token: ${config.token?.substring(0, 10)}...`);
  console.log(`From: ${config.from}`);
  console.log(`To: ${config.to}`);
  if (config.isApiKey) {
    console.log(`Account SID: ${config.accountSid?.substring(0, 10)}...`);
  }

  if (!config.sid || !config.token || !config.from || !config.to) {
    console.log('❌ FAILED: Missing credentials');
    return { success: false, error: 'Missing credentials' };
  }

  try {
    let client;
    if (config.isApiKey && config.accountSid) {
      // API Key requires accountSid option
      client = twilio(config.sid, config.token, {
        accountSid: config.accountSid,
      });
    } else {
      client = twilio(config.sid, config.token);
    }

    const message = await client.messages.create({
      from: config.from,
      to: config.to,
      body: `🧪 Test SMS from ${config.name} - VanRakshak Guardian Band System - ${new Date().toLocaleString()}`,
    });

    console.log('✅ SUCCESS!');
    console.log(`Message SID: ${message.sid}`);
    console.log(`Status: ${message.status}`);
    console.log(`Date: ${message.dateCreated}`);
    return { 
      success: true, 
      messageSid: message.sid, 
      status: message.status,
      config: config.name 
    };
  } catch (error: any) {
    console.log('❌ FAILED');
    console.log(`Error Code: ${error.code || 'N/A'}`);
    console.log(`Error Message: ${error.message}`);
    return { success: false, error: error.message, code: error.code };
  }
}

async function testAllAPIs() {
  console.log('\n🚀 VanRakshak Guardian Band - Twilio API Testing (Enhanced)');
  console.log(`Testing ${testConfigs.length} API configurations...\n`);

  const results = [];

  for (const config of testConfigs) {
    const result = await testAPI(config);
    results.push({ name: config.name, ...result });
    
    // Wait 2 seconds between tests to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  // Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 TEST SUMMARY');
  console.log(`${'='.repeat(60)}\n`);

  const workingAPIs = results.filter((r) => r.success);
  const failedAPIs = results.filter((r) => !r.success);

  if (workingAPIs.length > 0) {
    console.log(`✅ WORKING APIs (${workingAPIs.length}):`);
    workingAPIs.forEach((api) => {
      console.log(`   • ${api.name} ✓`);
    });
  }

  if (failedAPIs.length > 0) {
    console.log(`\n❌ FAILED APIs (${failedAPIs.length}):`);
    failedAPIs.forEach((api) => {
      console.log(`   • ${api.name}: ${api.error}`);
    });
  }

  if (workingAPIs.length > 0) {
    console.log(`\n🎯 RECOMMENDATION:`);
    console.log(`   Use ${workingAPIs[0].name} as your primary API.`);
    
    const workingConfig = testConfigs.find(c => c.name === workingAPIs[0].name);
    
    console.log(`\n📋 CONFIGURATION TO USE:`);
    if (workingConfig?.isApiKey) {
      console.log(`   TWILIO_ACCOUNT_SID=${workingConfig.accountSid}`);
      console.log(`   TWILIO_API_KEY=${workingConfig.sid}`);
      console.log(`   TWILIO_API_SECRET=${workingConfig.token}`);
    } else {
      console.log(`   TWILIO_ACCOUNT_SID=${workingConfig?.sid}`);
      console.log(`   TWILIO_AUTH_TOKEN=${workingConfig?.token}`);
    }
    console.log(`   TWILIO_FROM=${workingConfig?.from}`);
    console.log(`   ALERT_TO=${workingConfig?.to}`);
    
    if (workingAPIs[0].name !== 'API 1 (Primary)') {
      console.log(`\n⚠️  ACTION REQUIRED:`);
      console.log(`   Update notify.ts to use the working API configuration`);
    } else {
      console.log(`\n✅ Your primary API is already configured correctly!`);
    }
  } else {
    console.log(`\n❌ NO WORKING APIs FOUND!`);
    console.log(`\n💡 TROUBLESHOOTING TIPS:`);
    console.log(`   1. Verify your Twilio Account SID and Auth Token in Twilio Console`);
    console.log(`   2. Check that the 'From' number (+19033643491) is verified in your account`);
    console.log(`   3. Ensure your Twilio account has SMS capability enabled`);
    console.log(`   4. Verify the destination number (+918180890990) format`);
    console.log(`   5. Check if your Twilio trial account has geographic restrictions`);
  }

  console.log(`\n${'='.repeat(60)}\n`);
  
  return workingAPIs;
}

testAllAPIs().catch(console.error);
