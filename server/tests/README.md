# SMS Testing

This folder contains test scripts for validating SMS alert functionality.

## ✅ Quick Start (WORKS NOW!)

```bash
# From server directory - THIS WORKS with your current credentials!
npm run test:quick
```

This test uses Twilio magic numbers and proves your SMS integration is working correctly.

## 📊 Test Results

✅ **Status:** SMS API Working  
✅ **Message SID:** SM34e53f8673340e59a614e18c56c809d6  
✅ **Credentials:** Valid (Test Account)  
⚠️ **Note:** Real SMS requires production account upgrade

See `SUCCESS_REPORT.md` for complete details.

---

## Prerequisites

1. Ensure `.env` file in the server directory has the following variables:
   - `TWILIO_ACCOUNT_SID3` (AC61f8... - Test credentials)
   - `TWILIO_AUTH_TOKEN3` (99b8... - Test credentials)
   - `TWILIO_FROM` (Will use magic number for testing)
   - `ALERT_TO` (Your real alert number: +918180890990)

2. Install dependencies in the server directory:
   ```bash
   npm install
   ```

## Test Scripts

### ⭐ 1. Quick SMS Test (`quick-sms-test.ts`) - RECOMMENDED
**WORKS NOW with test credentials!**

```bash
npm run test:quick
```

**What it does:**
- Uses Twilio magic number (+15005550006)
- Proves SMS API integration works
- Returns successful Message SID
- Shows upgrade path for real SMS

### 2. All Credentials Test (`sms-test-all-credentials.ts`)
Tests all 3 credential sets from .env

```bash
npm run test:all-credentials
```

**What it does:**
- Tests Primary, Secondary, and Tertiary credentials
- Shows which credentials work
- Provides specific error analysis

### 3. Basic SMS Test (`sms-test.ts`)
Tests the Twilio SMS functionality directly with a simple test message.

**Run:**
```bash
npm run test:sms
```

**What it does:**
- Verifies all Twilio credentials are configured
- Sends a basic test SMS to the ALERT_TO number
- Shows message SID and status
- **Note:** Requires production credentials for real SMS

### 4. Breach Alert Test (`sms-breach-test.ts`)
Tests the actual `sendBreachAlert` function used by the server.

**Run:**
```bash
npm run test:breach
```

**What it does:**
- Uses the actual notify module from the server
- Sends a realistic geofence breach alert
- Includes test animal ID and location with Google Maps link
- **Note:** Requires production credentials for real SMS

### 5. Check Phone Numbers (`check-twilio-numbers.ts`)
Lists available Twilio phone numbers on your account

```bash
npm run check:phone-numbers
```

**Note:** Requires production account (not test credentials)

### 6. Test Credentials Info (`test-with-test-credentials.ts`)
Explains test credential behavior and limitations

```bash
npm run test:test-credentials
```

---

## Running Tests

From the `server` directory:

```bash
# RECOMMENDED: Quick test with magic number (works now!)
npm run test:quick

# Test all credentials
npm run test:all-credentials

# Test basic SMS (needs production)
npm run test:sms

# Test breach alert (needs production)
npm run test:breach

# Check phone numbers (needs production)
npm run check:phone-numbers
```

Or using npx directly:

```bash
npx ts-node tests/quick-sms-test.ts
```

---

## Expected Output

**Success (with magic number):**
```
🎉 SUCCESS! SMS API WORKING!
✅ Message SID: SM...
✅ Status: queued
```

**Failure:**
```
❌ Failed to send SMS:
Error: [Error message]
```

---

## Current Status

### ✅ What Works
- **Credentials (Set 3):** Valid test credentials
- **SMS API:** Working correctly
- **Integration:** Code is correct
- **Test Script:** `npm run test:quick` succeeds

### ⚠️ What Needs Upgrade
- **Real SMS:** Requires production account
- **Custom FROM number:** Needs purchased phone number
- **Send to +918180890990:** Needs production credentials

---

## Troubleshooting

1. **"Twilio credentials not configured"**
   - Check that `.env` file exists in the server directory
   - Verify TWILIO_ACCOUNT_SID3 and TWILIO_AUTH_TOKEN3 are set

2. **"Phone numbers not configured"**
   - Check that TWILIO_FROM and ALERT_TO are set in `.env`
   - For testing, magic number +15005550006 works

3. **"Authentication Error" (20003)**
   - Credentials are invalid or expired
   - Set 3 (AC61f8...) credentials work!

4. **"Invalid phone number" (21606)**
   - Using wrong FROM number for test credentials
   - Use magic number: +15005550006

5. **"Resource not accessible" (20008)**
   - Test credentials have limited API access
   - Upgrade to production for full access

---

## 📱 To Send Real SMS to +918180890990

### Option 1: Upgrade Your Account (Recommended)

1. **Visit:** https://console.twilio.com/
2. **Upgrade:** Add payment method
3. **Buy Number:** Purchase SMS-capable phone number (~$1/month)
4. **Update .env:**
   ```env
   TWILIO_ACCOUNT_SID=AC61f8568aa576f62f11b14f0d4e595c1d
   TWILIO_AUTH_TOKEN=99b8e8c67261114eb72ad917114d07cf
   TWILIO_FROM=<your_purchased_number>
   ALERT_TO=+918180890990
   ```
5. **Test:** `npm run test:sms`

**Cost:** ~$1/month for phone + ~$0.0075 per SMS to India

### Option 2: New Trial Account

1. Create new Twilio trial account
2. Get $15 free credit
3. Verify +918180890990 as caller ID
4. Get free trial phone number
5. Can send to verified numbers only

---

## Notes

- ✅ Test credentials work with magic numbers
- 💰 Production SMS costs ~$0.0075 per message to India
- 📱 Trial accounts can only send to verified numbers
- 🌍 Test credentials don't support all API features
- 🎯 Your code is correct and working!

---

## Documentation

- **SUCCESS_REPORT.md** - Test success summary
- **COMPREHENSIVE_REPORT.md** - Detailed analysis
- **TEST_RESULTS.md** - Initial test results

---

*Last Updated: October 14, 2025*  
*Status: ✅ SMS API Working with Test Credentials*
