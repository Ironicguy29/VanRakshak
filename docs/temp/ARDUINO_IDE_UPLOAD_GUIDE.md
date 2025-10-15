# 🚀 ARDUINO IDE UPLOAD GUIDE - Guardian Band ESP32

## ✅ VERIFICATION COMPLETE

**Server Status:** ✅ RUNNING at http://192.168.0.177:3000
**Configuration:** ✅ ALL SET (Airtel APN + Server IP configured)
**Sketch Location:** `C:\Users\kalvi\OneDrive\Documents\VanRakshak\firmware\esp32-arduino\esp32-arduino.ino`

---

# 📋 PRE-UPLOAD CHECKLIST

Before starting, ensure you have:

- [ ] **Arduino IDE installed** (download from arduino.cc)
- [ ] **ESP32 board** connected to PC via USB cable
- [ ] **Hardware assembled** according to wiring diagram
- [ ] **Airtel SIM card** inserted in SIM800L module
- [ ] **Battery connected** to SIM800L (3.7-4.2V) - USB power won't work!
- [ ] **Server running** - Already done ✓

---

# 🔧 PART 1: ARDUINO IDE SETUP (One-time)

## Step 1: Install Arduino IDE

1. Download from: **https://www.arduino.cc/en/software**
2. Install Arduino IDE (version 2.x recommended)
3. Launch Arduino IDE

---

## Step 2: Add ESP32 Board Support

### 2.1 Add Board Manager URL

1. Click: **File → Preferences** (or press `Ctrl+,`)
2. Find: **"Additional Board Manager URLs"** field
3. Paste this URL:
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
4. Click **OK**

### 2.2 Install ESP32 Board Package

1. Click: **Tools → Board → Boards Manager...**
2. In search box, type: **`esp32`**
3. Find: **"esp32 by Espressif Systems"**
4. Click **INSTALL** button (wait for download, takes 2-5 minutes)
5. Close Boards Manager when complete

---

## Step 3: Install Required Libraries

Click: **Tools → Manage Libraries...** (or press `Ctrl+Shift+I`)

### Install these 4 libraries one by one:

#### Library 1: TinyGSM
- Search: **`TinyGSM`**
- Find: **"TinyGSM by Volodymyr Shymanskyy"**
- Click **INSTALL**
- Version: 0.11.7 or newer

#### Library 2: TinyGPSPlus
- Search: **`TinyGPSPlus`**
- Find: **"TinyGPSPlus by Mikal Hart"**
- Click **INSTALL**
- Version: 1.0.3 or newer

#### Library 3: OneWire
- Search: **`OneWire`**
- Find: **"OneWire by Paul Stoffregen"**
- Click **INSTALL**
- Version: 2.3.8 or newer

#### Library 4: DallasTemperature
- Search: **`DallasTemperature`**
- Find: **"DallasTemperature by Miles Burton"**
- Click **INSTALL**
- Version: 3.9.1 or newer

**Note:** If prompted to install dependencies, click **"Install All"**

Close Library Manager when done.

---

# 📂 PART 2: OPEN THE SKETCH

1. In Arduino IDE, click: **File → Open...**
2. Navigate to:
   ```
   C:\Users\kalvi\OneDrive\Documents\VanRakshak\firmware\esp32-arduino\
   ```
3. Select file: **`esp32-arduino.ino`**
4. Click **Open**

The sketch should load and you'll see the code with configurations already set:
- ✅ APN: `airtelgprs.com`
- ✅ Server: `192.168.0.177:3000`
- ✅ Device ID: `GB-esp32-0001`

---

# ⚙️ PART 3: CONFIGURE BOARD SETTINGS

## Step 1: Select Board Type

1. Click: **Tools → Board → esp32**
2. Select: **"ESP32 Dev Module"**

*(If you have a different ESP32 board like NodeMCU-32S or DOIT ESP32, select that instead)*

---

## Step 2: Configure Board Parameters

Under **Tools** menu, set these values:

| Parameter | Value |
|-----------|-------|
| **Board** | ESP32 Dev Module |
| **Upload Speed** | 115200 |
| **CPU Frequency** | 240MHz (WiFi/BT) |
| **Flash Frequency** | 80MHz |
| **Flash Mode** | QIO |
| **Flash Size** | 4MB (32Mb) |
| **Partition Scheme** | Default 4MB with spiffs |
| **Core Debug Level** | None |
| **PSRAM** | Disabled |

---

## Step 3: Select COM Port

### 3.1 Connect ESP32
1. **Connect your ESP32 to PC using USB cable**
2. Wait for Windows to recognize device (10-30 seconds)

### 3.2 Select Port
1. Click: **Tools → Port**
2. Look for a port like: **COM3**, **COM4**, **COM5**, etc.
3. Select the COM port that appears

**❌ If NO port appears:**
- Install USB drivers (see troubleshooting section below)
- Try different USB cable
- Try different USB port on PC

---

# 🚀 PART 4: UPLOAD TO ESP32

## Step 1: Verify (Compile)

1. Click the **✓ Verify** button (top-left, checkmark icon)
2. Wait for compilation (20-60 seconds)
3. Check bottom status bar for: **"Done compiling"**

**Expected Output:**
```
Sketch uses XXXXX bytes (XX%) of program storage space.
Global variables use XXXXX bytes (XX%) of dynamic memory.
```

**❌ If you see errors:**
- Check all 4 libraries are installed correctly
- Restart Arduino IDE and try again

---

## Step 2: Upload

### Method A: Standard Upload (Try This First)

1. Click the **→ Upload** button (next to Verify)
2. Wait for "Connecting..." message
3. Watch for progress bar
4. Wait for "Done uploading" message

### Method B: If Upload Fails - Manual Boot Mode

1. **Press and HOLD the BOOT button** on ESP32 board
2. Click **→ Upload** in Arduino IDE
3. Keep holding BOOT until you see "Connecting..."
4. **Release BOOT button**
5. Upload should proceed

### Method C: Hard Reset First

1. Press **EN (Reset)** button on ESP32
2. Wait 2 seconds
3. Click **→ Upload**

---

## Step 3: Open Serial Monitor

1. Click: **Tools → Serial Monitor** (or press `Ctrl+Shift+M`)
2. Set baud rate dropdown (bottom-right) to: **115200**
3. Press **EN (Reset)** button on ESP32 to restart

---

# 📊 PART 5: VERIFY UPLOAD SUCCESS

## Expected Serial Monitor Output

You should see something like this:

```
=====================================
   Guardian Band - Wildlife Tracker
=====================================
Device ID: GB-esp32-0001
Server: 192.168.0.177:3000
=====================================

[MODEM] Initializing SIM800L...
[MODEM] Restarting modem...
[MODEM] Connecting to cellular network...
[MODEM] APN: airtelgprs.com
[MODEM] ✓ Connected to cellular network!

[GPS] Initializing NEO-6M...
[GPS] ✓ GPS module initialized
[GPS] Waiting for GPS fix (may take 1-5 minutes)...

[SENSORS] Initializing...
[SENSORS] ✓ DS18B20 temperature sensor ready
[SENSORS] ✓ GY-61 (ADXL335) accelerometer ready

[SYSTEM] ✓ All systems initialized!
[SYSTEM] Starting main loop...

[GPS] Waiting for fix... Satellites: 0
[GPS] Waiting for fix... Satellites: 2
[GPS] Waiting for fix... Satellites: 4
─────────────────────────────────────
[DATA] GPS: 28.612345, 77.234567
[DATA] Temperature: 25.50 °C
[DATA] Accelerometer: X:0.05 Y:0.02 Z:0.98
─────────────────────────────────────
[HTTP] Preparing to send data...
[HTTP] Connecting to 192.168.0.177:3000
[HTTP] ✓ Connected to server
[HTTP] Sent: {"deviceId":"GB-esp32-0001",...}
HTTP/1.1 200 OK
{"ok":true,"inside":true}
[HTTP] ✓ Request complete
```

---

## Verify on Dashboard

1. Open browser
2. Go to: **http://192.168.0.177:3000/api/v1/dashboard**
3. You should see:
   - Device **GB-esp32-0001** listed
   - Live GPS coordinates
   - Temperature reading
   - **"Active"** status badge
   - Last update timestamp

---

# 🛠️ TROUBLESHOOTING

## Problem 1: No COM Port in Arduino IDE

**Symptoms:** Tools → Port is grayed out or empty

**Solutions:**

### For CH340 USB Chip (Most common)
1. Download driver: http://www.wch-ic.com/downloads/CH341SER_ZIP.html
2. Extract ZIP file
3. Run **SETUP.EXE**
4. Restart PC
5. Reconnect ESP32

### For CP2102 USB Chip
1. Download driver: https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers
2. Install driver
3. Restart PC
4. Reconnect ESP32

### Other Checks:
- Try different USB cable (must be **data cable**, not charge-only)
- Try different USB port on PC
- Open Device Manager → Ports (COM & LPT) to see if device appears

---

## Problem 2: Upload Failed / Timeout

**Error Message:** "Failed to connect to ESP32: Timed out waiting for packet header"

**Solutions:**

1. **Hold BOOT button during upload:**
   - Press and hold BOOT
   - Click Upload
   - Wait for "Connecting..."
   - Release BOOT

2. **Lower upload speed:**
   - Tools → Upload Speed → Select **460800** or **115200**
   - Try upload again

3. **Press EN (Reset) first:**
   - Press EN button
   - Wait 2 seconds
   - Click Upload

4. **Check USB cable:**
   - Try different cable
   - Use shorter cable (< 1 meter)

---

## Problem 3: Compilation Errors

**Error:** "Error compiling for board ESP32 Dev Module"

**Solutions:**

1. **Verify libraries installed:**
   - Tools → Manage Libraries
   - Search each library: TinyGSM, TinyGPSPlus, OneWire, DallasTemperature
   - Reinstall if needed

2. **Reinstall ESP32 board support:**
   - Tools → Board → Boards Manager
   - Find "esp32 by Espressif"
   - Click **REMOVE** then **INSTALL**

3. **Clear Arduino cache:**
   - Close Arduino IDE
   - Delete folder: `C:\Users\kalvi\AppData\Local\Arduino15\`
   - Restart Arduino IDE
   - Reinstall ESP32 board support

4. **Update Arduino IDE:**
   - Download latest version from arduino.cc
   - Install over existing installation

---

## Problem 4: SIM800L Not Connecting

**Serial Output:** `[MODEM] ✗ Failed to connect`

**Solutions:**

1. **Power Issue (Most Common):**
   - SIM800L needs 3.7-4.2V **from battery**
   - USB power is **not sufficient** (peak 2A required)
   - Connect SIM800L VCC directly to LiPo battery
   - Add 1000µF capacitor near SIM800L VCC/GND

2. **SIM Card Issues:**
   - Ensure SIM card is inserted correctly
   - Verify SIM is activated and has balance/data
   - Remove PIN lock from SIM (use phone first)
   - Check SIM card orientation

3. **Network Issues:**
   - Verify 2G/GSM network available in your area
   - Airtel supports 2G in most Indian cities
   - Call Airtel to confirm 2G coverage
   - Try alternative APN: Change line 39 to `"www"`

4. **Hardware Issues:**
   - Check antenna is connected
   - Verify RX/TX connections (TX→RX, RX→TX crossover)
   - Check solder joints if using custom PCB

---

## Problem 5: No GPS Fix

**Serial Output:** `[GPS] Waiting for fix... Satellites: 0`

**Solutions:**

1. **Location Issues:**
   - Move to **outdoor** location
   - Clear sky view needed (no buildings/trees overhead)
   - Indoor GPS **will not work**
   - Near window may work but slower

2. **Wait Longer:**
   - First GPS fix takes 1-5 minutes
   - Subsequent fixes are faster (30 seconds)
   - Be patient!

3. **Hardware Check:**
   - Verify GPS antenna connected
   - Check RX/TX wiring (GPS TX → ESP32 pin 16)
   - Test GPS module separately

4. **Module Issue:**
   - Some NEO-6M clones are poor quality
   - Try different GPS module
   - Verify red LED blinking on GPS module

---

## Problem 6: HTTP Connection Failed

**Serial Output:** `[HTTP] ✗ Connection failed!`

**Solutions:**

1. **Server Not Running:**
   - Open: http://192.168.0.177:3000/api/v1/dashboard
   - If page doesn't load, restart server
   - Go to terminal in VS Code
   - Run server again

2. **Network Issues:**
   - ESP32's cellular connection must reach your PC
   - PC and cellular network must be routable
   - Check Windows Firewall settings
   - Temporarily disable firewall to test

3. **IP Address Changed:**
   - Run `ipconfig` in cmd
   - Check if PC IP is still 192.168.0.177
   - If changed, update line 44 in sketch:
     ```cpp
     #define SERVER_HOST "NEW_IP_HERE"
     ```
   - Upload sketch again

4. **APN Issues:**
   - Wrong APN may allow modem connection but block data
   - Try alternative APN: `"www"` instead of `"airtelgprs.com"`
   - Contact carrier for correct APN settings

---

## Problem 7: Temperature Reads -127°C

**Issue:** DS18B20 sensor wiring problem

**Solutions:**

1. Check wiring:
   - Red (VCC) → 3.3V
   - Black (GND) → GND
   - Yellow (Data) → GPIO 4

2. Add pull-up resistor:
   - 4.7kΩ resistor between Data and VCC
   - Required for 1-Wire communication

3. Test sensor:
   - Verify sensor with multimeter (should show ~5kΩ at room temp)
   - Try different sensor if faulty

---

# 📝 MAKING CHANGES

## Change APN (if current doesn't work)

Edit line 39 in sketch:
```cpp
#define APN "airtelgprs.com"  // Change this
```

Try these alternatives:
- `"www"` (Airtel alternative)
- `"airtelnet"`
- `"internet"`

After change: **Verify → Upload** again

---

## Change Server IP (if your PC IP changes)

Edit line 44 in sketch:
```cpp
#define SERVER_HOST "192.168.0.177"  // Change this
```

Check current PC IP:
```cmd
ipconfig
```

After change: **Verify → Upload** again

---

## Change Upload Frequency

Edit line 51 in sketch:
```cpp
#define UPLOAD_INTERVAL_MS 15000  // milliseconds
```

Common values:
- `10000` = 10 seconds (fast testing)
- `15000` = 15 seconds (current)
- `60000` = 1 minute (moderate)
- `300000` = 5 minutes (battery saving)

After change: **Verify → Upload** again

---

# ✅ SUCCESS CHECKLIST

Upload is successful when:

- [ ] Arduino IDE shows "Done uploading"
- [ ] Serial Monitor shows boot messages
- [ ] `[MODEM] ✓ Connected to cellular network!`
- [ ] `[GPS] ✓ GPS module initialized`
- [ ] `[SENSORS] ✓ All systems initialized!`
- [ ] GPS gets fix (may take 5 minutes)
- [ ] `[HTTP] ✓ Request complete`
- [ ] Dashboard shows device data
- [ ] Device appears as "Active" on dashboard

---

# 📞 NEED HELP?

If stuck at any step:

1. **Check Serial Monitor** for error messages (115200 baud)
2. **Check Dashboard** to verify server is receiving data
3. **Review Troubleshooting** section for your specific issue
4. **Verify Hardware** connections match `docs/connections.md`

**Important URLs:**
- Dashboard: http://192.168.0.177:3000/api/v1/dashboard
- Health Check: http://192.168.0.177:3000/health
- Wiring Diagram: `docs/connections.md`

**Device Info:**
- Device ID: GB-esp32-0001
- APN: airtelgprs.com (Airtel India)
- Server: 192.168.0.177:3000

---

# 🎉 CONGRATULATIONS!

Once you see data on the dashboard, your Guardian Band collar is working!

Next steps:
- Test geofencing by moving device
- Monitor temperature readings
- Check accelerometer data
- Prepare for field deployment

Good luck! 🚀
