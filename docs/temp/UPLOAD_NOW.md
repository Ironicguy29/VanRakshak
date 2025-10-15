# ⚡ QUICK UPLOAD INSTRUCTIONS

## ✅ STATUS: Firmware Ready - Just Need to Upload!

---

## 🎯 TO UPLOAD RIGHT NOW:

### Step 1: Open VS Code Terminal (Ctrl+`)

### Step 2: Run These Commands:

```powershell
cd c:\Users\kalvi\OneDrive\Documents\VanRakshak\firmware\esp32
```

### Step 3: **HOLD the BOOT button** on your ESP32 board

### Step 4: While Holding BOOT, Run:

```powershell
& "C:\Users\kalvi\.platformio\penv\Scripts\platformio.exe" run --target upload
```

### Step 5: Keep holding BOOT until you see "Writing..." then **RELEASE**

---

## 📺 MONITOR OUTPUT:

After upload completes:

```powershell
& "C:\Users\kalvi\.platformio\penv\Scripts\platformio.exe" device monitor
```

Press `Ctrl+C` to exit monitor.

---

## ✅ SUCCESS INDICATORS:

**Upload Successful:**
```
Hard resetting via RTS pin...
[SUCCESS] Took X.XX seconds
```

**Serial Monitor (115200 baud):**
```
[MODEM] ✓ Connected to cellular network!
[GPS] ✓ GPS module initialized
[SENSORS] ✓ All systems initialized!
```

**Dashboard:**
- Open: http://192.168.0.177:3000/api/v1/dashboard
- Look for device: **GB-esp32-0001**

---

## 🚨 IF UPLOAD FAILS:

**Method 1 - Reset Sequence:**
1. Hold BOOT
2. Press and release EN (Reset)
3. Release BOOT
4. Run upload command

**Method 2 - Manual Reset:**
1. Unplug USB
2. Hold BOOT
3. Plug in USB (while holding BOOT)
4. Run upload command
5. Release BOOT after "Writing..."

---

## 📊 SYSTEM STATUS

- ✅ **Firmware Built:** SUCCESS (294KB)
- ✅ **ESP32 Detected:** COM3 (CP210x)
- ✅ **Server Running:** http://192.168.0.177:3000
- ✅ **Config Set:** Airtel APN, Server IP
- ⏳ **Upload:** Waiting for BOOT button press

---

**Just hold BOOT and run the upload command above!** 🚀
