# Arduino IDE Upload Instructions

## ✅ Pre-Upload Checklist

### Configuration (Already Done ✓)
- ✅ APN set to: `airtelgprs.com` (Airtel India)
- ✅ Server IP set to: `192.168.0.177` (Your PC)
- ✅ Server Port: `3000`
- ✅ Device ID: `GB-esp32-0001`

### Server Status (Already Running ✓)
- ✅ Server is running at `http://192.168.0.177:3000`
- ✅ Dashboard available at: `http://localhost:3000/api/v1/dashboard`

---

## 📥 Step 1: Install Arduino IDE

1. Download Arduino IDE from: https://www.arduino.cc/en/software
2. Install Arduino IDE 2.x (latest version recommended)
3. Launch Arduino IDE

---

## 🔧 Step 2: Configure Arduino IDE for ESP32

### 2.1 Add ESP32 Board Manager URL
1. Open Arduino IDE
2. Go to: **File → Preferences**
3. In "Additional Board Manager URLs" field, add:
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
4. Click **OK**

### 2.2 Install ESP32 Board Support
1. Go to: **Tools → Board → Boards Manager**
2. Search for: `esp32`
3. Find "**esp32 by Espressif Systems**"
4. Click **Install** (wait for download to complete)
5. Close Boards Manager

---

## 📚 Step 3: Install Required Libraries

Go to: **Tools → Manage Libraries** (or press `Ctrl+Shift+I`)

Install the following libraries **one by one**:

### Library 1: TinyGSM
- Search: `TinyGSM`
- Install: **TinyGSM by Volodymyr Shymanskyy** (version 0.11.7 or later)

### Library 2: TinyGPSPlus
- Search: `TinyGPSPlus`
- Install: **TinyGPSPlus by Mikal Hart** (version 1.0.3 or later)

### Library 3: OneWire
- Search: `OneWire`
- Install: **OneWire by Paul Stoffregen** (version 2.3.8 or later)

### Library 4: DallasTemperature
- Search: `DallasTemperature`
- Install: **DallasTemperature by Miles Burton** (version 3.9.1 or later)

**Note:** If you get dependency prompts, click "Install All"

---

## 📂 Step 4: Open the Sketch

1. In Arduino IDE, go to: **File → Open**
2. Navigate to: `C:\Users\kalvi\OneDrive\Documents\VanRakshak\firmware\esp32-arduino\`
3. Open: **esp32-arduino.ino**
4. The sketch should load with all code visible

---

## ⚙️ Step 5: Configure Board Settings

### 5.1 Select Board
- Go to: **Tools → Board → esp32**
- Select: **ESP32 Dev Module** (or your specific ESP32 board)

### 5.2 Configure Board Parameters
Set the following under **Tools** menu:

| Setting | Value |
|---------|-------|
| **Upload Speed** | 115200 |
| **CPU Frequency** | 240MHz (WiFi/BT) |
| **Flash Frequency** | 80MHz |
| **Flash Mode** | QIO |
| **Flash Size** | 4MB (32Mb) |
| **Partition Scheme** | Default 4MB with spiffs |
| **Core Debug Level** | None (or "Info" for debugging) |
| **PSRAM** | Disabled |

### 5.3 Select COM Port
1. **Connect ESP32 to PC via USB cable**
2. Go to: **Tools → Port**
3. Select the COM port (e.g., `COM3`, `COM4`, `COM5`)
   - If no port appears, install **CH340 or CP2102 drivers** (see troubleshooting below)

---

## 🚀 Step 6: Compile and Upload

### 6.1 Verify (Compile) First
1. Click the **✓ Verify** button (top left)
2. Wait for compilation to complete
3. Check the output window for "Compilation complete" message
4. If errors occur, check library installation

### 6.2 Upload to ESP32
1. Make sure ESP32 is connected via USB
2. Click the **→ Upload** button (next to Verify)
3. **During upload, you may need to:**
   - Press and hold the **BOOT** button on ESP32
   - Release after "Connecting..." message appears
4. Wait for upload to complete (progress bar will show)
5. You should see: "Leaving... Hard resetting via RTS pin..."

### 6.3 Open Serial Monitor
1. Click **Tools → Serial Monitor** (or press `Ctrl+Shift+M`)
2. Set baud rate to: **115200**
3. You should see boot messages:

```
=====================================
   Guardian Band - Wildlife Tracker
=====================================
Device ID: GB-esp32-0001
Server: 192.168.0.177:3000
=====================================

[MODEM] Initializing SIM800L...
[GPS] Initializing NEO-6M...
[SENSORS] Initializing...
[SYSTEM] ✓ All systems initialized!
```

---

## 🔍 Expected Output

### Successful Boot
```
[MODEM] ✓ Connected to cellular network!
[GPS] ✓ GPS module initialized
[SENSORS] ✓ DS18B20 temperature sensor ready
[SENSORS] ✓ GY-61 accelerometer ready
[GPS] Waiting for fix... Satellites: 0
```

### GPS Fix Acquired
```
[GPS] Waiting for fix... Satellites: 4
─────────────────────────────────────
[DATA] GPS: 28.123456, 77.654321
[DATA] Temperature: 25.50 °C
[DATA] Accelerometer: X:0.05 Y:0.02 Z:0.98
─────────────────────────────────────
[HTTP] Preparing to send data...
[HTTP] Connecting to 192.168.0.177:3000
[HTTP] ✓ Connected to server
[HTTP] Sent: {"deviceId":"GB-esp32-0001",...}
[HTTP] ✓ Request complete
```

---

## 🛠️ Troubleshooting

### Issue 1: No COM Port Detected
**Problem:** ESP32 not showing in Tools → Port

**Solutions:**
1. **Install USB drivers:**
   - For CH340: Download from [CH340 Driver](http://www.wch-ic.com/downloads/CH341SER_ZIP.html)
   - For CP2102: Download from [Silicon Labs](https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers)
2. Try different USB cable (must be data cable, not charge-only)
3. Try different USB port
4. Check Device Manager → Ports (COM & LPT)

### Issue 2: Upload Failed / Timeout
**Problem:** "Failed to connect to ESP32"

**Solutions:**
1. Press and hold **BOOT** button during upload
2. Press **EN (Reset)** button, then try upload again
3. Lower upload speed to 921600 or 460800 in Tools → Upload Speed
4. Check USB cable quality

### Issue 3: Compilation Errors
**Problem:** "Error compiling for board ESP32 Dev Module"

**Solutions:**
1. Verify all 4 libraries are installed
2. Restart Arduino IDE
3. Go to Tools → Board → Boards Manager, reinstall ESP32 board support
4. Check Arduino IDE version (use 2.x or latest 1.8.x)

### Issue 4: SIM800L Not Responding
**Problem:** `[MODEM] ✗ Failed to connect`

**Solutions:**
1. **Power issue:** SIM800L needs 3.7-4.2V from battery, NOT USB
2. Connect SIM800L VCC directly to LiPo battery
3. Add 1000µF capacitor near SIM800L VCC
4. Check SIM card is inserted and activated
5. Verify 2G network availability in your area
6. Try alternative APN: Change line 30 to `"www"`

### Issue 5: No GPS Fix
**Problem:** `[GPS] Waiting for fix... Satellites: 0`

**Solutions:**
1. Move to location with clear sky view (outdoor)
2. Wait 1-5 minutes for first GPS fix
3. Check GPS antenna connection
4. Verify GPS RX/TX wiring (GPS TX → ESP32 pin 16, GPS RX → ESP32 pin 17)

### Issue 6: Server Connection Failed
**Problem:** `[HTTP] ✗ Connection failed!`

**Solutions:**
1. Verify server is running: Open `http://192.168.0.177:3000/api/v1/dashboard`
2. Check both PC and ESP32 are on same network (WiFi/Cellular must reach PC)
3. Disable Windows Firewall temporarily to test
4. Verify PC IP hasn't changed: Run `ipconfig` in cmd
5. Check cellular data connection is working

---

## 🔄 Making Changes

### To Change APN (if needed)
Edit line 30:
```cpp
#define APN "airtelgprs.com"  // Change to your carrier's APN
```
Common alternatives: `"www"`, `"internet"`, `"airtelnet"`

### To Change Server IP (if PC IP changes)
Edit line 39:
```cpp
#define SERVER_HOST "192.168.0.177"  // Update with new IP
```

### To Change Upload Interval
Edit line 48:
```cpp
#define UPLOAD_INTERVAL_MS 15000  // Change to desired milliseconds
```
- 15000 = 15 seconds (testing)
- 60000 = 1 minute
- 300000 = 5 minutes (recommended for field use)

**After any changes:** Click Verify → Upload again

---

## 📊 Monitoring Data

### View on Dashboard
Open in browser: `http://192.168.0.177:3000/api/v1/dashboard`

You should see:
- Active Wildlife Trackers count
- Live device location and vitals
- Temperature readings
- Last update timestamp

### View Raw Serial Data
Keep Serial Monitor open to see real-time logs from ESP32

---

## 🎯 Final Checklist

Before field deployment:

- [ ] ESP32 boots successfully
- [ ] SIM800L connects to cellular network
- [ ] GPS gets satellite fix (outdoor test)
- [ ] Temperature sensor reads correctly
- [ ] Data appears on server dashboard
- [ ] Battery provides adequate runtime
- [ ] Weatherproof enclosure is sealed
- [ ] Collar attachment is secure

---

## 📞 Support

If you encounter issues:
1. Check Serial Monitor for error messages
2. Verify all wiring matches `docs/connections.md`
3. Test components individually
4. Check server logs for incoming data

**Server Dashboard:** http://192.168.0.177:3000/api/v1/dashboard
**Device ID:** GB-esp32-0001
