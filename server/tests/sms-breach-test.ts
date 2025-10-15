import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module equivalents for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from parent directory
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import the actual notify function from the server
import { sendBreachAlert } from '../src/notify';

async function testBreachAlert() {
  console.log('=== Breach Alert SMS Test ===\n');
  
  const testAnimalId = 'GB-TEST-0001';
  const testLocation = {
    lat: 28.6139,
    lng: 77.2090
  };
  
  const alertMessage = `🚨 GEOFENCE BREACH ALERT!

Animal ID: ${testAnimalId}
Time: ${new Date().toLocaleString()}
Location: ${testLocation.lat}, ${testLocation.lng}
Google Maps: https://maps.google.com/?q=${testLocation.lat},${testLocation.lng}

This is a TEST breach alert from VanRakshak system.`;

  console.log('Test Configuration:');
  console.log(`- Animal ID: ${testAnimalId}`);
  console.log(`- Location: ${testLocation.lat}, ${testLocation.lng}`);
  console.log(`- Alert To: ${process.env.ALERT_TO || 'Not configured'}`);
  console.log();

  try {
    console.log('Sending breach alert SMS...\n');
    
    const result = await sendBreachAlert(alertMessage);
    
    if (result.sent) {
      console.log('✅ Breach alert sent successfully!');
      console.log(`\nCheck your phone at ${process.env.ALERT_TO} for the breach alert.`);
    } else {
      console.error('❌ Failed to send breach alert');
      console.error(`Reason: ${result.reason}`);
      
      if (result.reason === 'twilio_not_configured') {
        console.error('\nTwilio credentials are missing in .env file');
      } else if (result.reason === 'phone_not_configured') {
        console.error('\nPhone numbers (TWILIO_FROM or ALERT_TO) are missing in .env file');
      }
      process.exit(1);
    }
    
  } catch (error: any) {
    console.error('❌ Unexpected error:');
    console.error(error.message);
    process.exit(1);
  }
}

// Run the test
testBreachAlert();
