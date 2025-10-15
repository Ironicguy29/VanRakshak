# ⚡ QUICK START - Arduino IDE Upload

## 🎯 YOUR STATUS

✅ **Server Running:** http://192.168.0.177:3000  
✅ **Sketch Ready:** `firmware\esp32-arduino\esp32-arduino.ino`  
✅ **Configuration:** Airtel APN + Server IP set  

---

## 📥 5-MINUTE SETUP

### 1️⃣ Install Arduino IDE
Download: **https://www.arduino.cc/en/software**

### 2️⃣ Add ESP32 Support
- **File → Preferences**
- Add URL: `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json`
- **Tools → Board → Boards Manager** → Install "**esp32**"

### 3️⃣ Install 4 Libraries
**Tools → Manage Libraries**, install:
1. **TinyGSM**
2. **TinyGPSPlus**
3. **OneWire**
4. **DallasTemperature**

### 4️⃣ Open Sketch
- **File → Open**
- Go to: `C:\Users\kalvi\OneDrive\Documents\VanRakshak\firmware\esp32-arduino\esp32-arduino.ino`

### 5️⃣ Configure & Upload
- **Tools → Board → ESP32 Dev Module**
- **Tools → Port → Select COM port** (connect ESP32 first)
- Click **✓ Verify** then **→ Upload**
- Hold **BOOT button** if upload fails

---

## 🔍 CHECK SUCCESS

Open **Tools → Serial Monitor** (115200 baud), should see:
```
[MODEM] ✓ Connected to cellular network!
[GPS] ✓ GPS module initialized
[SENSORS] ✓ All systems initialized!
```

Open browser: **http://192.168.0.177:3000/api/v1/dashboard**  
Should see device **GB-esp32-0001** with live data!

---

## 🚨 COMMON FIXES

| Problem | Solution |
|---------|----------|
| No COM port | Install CH340 drivers, try different USB cable |
| Upload fails | Hold BOOT button during upload |
| SIM800L fails | Connect to battery (3.7-4.2V), NOT USB! |
| No GPS fix | Go outdoor, wait 1-5 minutes |
| HTTP fails | Check server running, verify IP 192.168.0.177 |

---

## 📖 Full Guide

Complete instructions: **`ARDUINO_IDE_UPLOAD_GUIDE.md`**

---

**Device ID:** GB-esp32-0001  
**APN:** airtelgprs.com  
**Server:** 192.168.0.177:3000  
