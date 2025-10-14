# Real-World Guardian Band Scenario

## 🐘 **Scenario: Elephant "Temba" Near Maasai Village**

### **Setup**
- **Location**: Amboseli National Park, Kenya
- **Animal**: Adult bull elephant "Temba" (Device ID: GB-temba-001)
- **Geofence**: 500m radius around Kimana village
- **Alert Recipients**: Wildlife rangers, village chief

---

## **Timeline of Events**

### **6:00 AM - Normal Behavior (Inside Safe Zone)**
```json
{
  "deviceId": "GB-temba-001",
  "ts": 1729742400000,
  "location": {"lat": -2.6890, "lon": 37.2440},
  "vitals": {"tempC": 36.8},
  "motion": {"ax": 0.02, "ay": -0.01, "az": 0.98},
  "battery": 4.1
}
```
**Server Response**: `{"ok": true, "inside": true}`
**Action**: ✅ Normal logging, no alerts

---

### **6:15 AM - Moving Toward Village**
```json
{
  "deviceId": "GB-temba-001", 
  "ts": 1729743300000,
  "location": {"lat": -2.6850, "lon": 37.2480},
  "vitals": {"tempC": 37.2},
  "motion": {"ax": 0.15, "ay": 0.08, "az": 0.95},
  "battery": 4.0
}
```
**Server Response**: `{"ok": true, "inside": true}`
**Action**: ✅ Still safe, but movement detected (450m from village)

---

### **6:30 AM - 🚨 GEOFENCE BREACH! 🚨**
```json
{
  "deviceId": "GB-temba-001",
  "ts": 1729744200000, 
  "location": {"lat": -2.6820, "lon": 37.2520},
  "vitals": {"tempC": 37.5},
  "motion": {"ax": 0.25, "ay": 0.12, "az": 0.92},
  "battery": 3.9
}
```
**Server Response**: `{"ok": true, "inside": false}`

**🚨 IMMEDIATE ACTIONS TRIGGERED:**

1. **SMS Alert Sent**:
   ```
   To: +254-700-123456 (Ranger Station)
   "GuardianBand ALERT: GB-temba-001 outside geofence at 
   lat=-2.68200, lon=37.25200 (~150m from boundary)"
   ```

2. **Server Log**:
   ```
   [ALERT:sent] GB-temba-001 outside geofence (~150m from boundary)
   [MOVE] GB-temba-001 moved ~420m over 900s
   ```

---

### **6:35 AM - Continued Movement (Still Outside)**
```json
{
  "deviceId": "GB-temba-001",
  "ts": 1729744500000,
  "location": {"lat": -2.6810, "lon": 37.2540}, 
  "vitals": {"tempC": 37.8},
  "motion": {"ax": 0.30, "ay": 0.15, "az": 0.89},
  "battery": 3.9
}
```
**Server Response**: `{"ok": true, "inside": false}`
**Action**: 🔕 No new SMS (cooldown active - 5 minutes default)

**Server Log**:
```
[ALERT:cooldown] GB-temba-001 still outside geofence (~280m)
```

---

### **7:00 AM - Rangers Respond Successfully**
```json
{
  "deviceId": "GB-temba-001",
  "ts": 1729746000000,
  "location": {"lat": -2.6870, "lon": 37.2420},
  "vitals": {"tempC": 36.9}, 
  "motion": {"ax": 0.08, "ay": 0.03, "az": 0.97},
  "battery": 3.8
}
```
**Server Response**: `{"ok": true, "inside": true}`
**Action**: ✅ Back to safety! Rangers successfully guided elephant away

---

## **🎯 What Each Component Does**

### **ESP32 Collar on Temba**:
- 📍 **GPS**: Gets precise location every 15 seconds
- 🌡️ **Temperature**: Monitors body temperature (fever = stress/illness)
- 📊 **Accelerometer**: Detects movement patterns (walking, running, resting)
- 📱 **SIM800L**: Sends data via 2G network to server
- 🔋 **Battery**: Powers system for weeks (solar charging optional)

### **Server Processing**:
- 📥 **Receives**: Telemetry data from collar
- 🗺️ **Checks**: Is elephant inside or outside geofence?
- 📏 **Calculates**: Distance moved, speed, proximity to boundary
- 🚨 **Alerts**: SMS notifications when boundaries crossed
- ⏰ **Cooldown**: Prevents SMS spam (5-minute default)

### **SMS Alert System**:
- 📲 **Instant**: Alerts sent within seconds of breach
- 🎯 **Targeted**: Different recipients for different areas
- 📍 **Precise**: GPS coordinates and distance information
- 🔄 **Rate Limited**: Prevents flooding during extended breaches

---

## **🛠️ Customizable Actions**

You can configure different responses:

### **Geofence Types**:
- **Circle**: Simple radius around villages/crops
- **Polygon**: Complex boundaries (river systems, park borders)
- **Multiple**: Different fences per device/area

### **Alert Escalation**:
```
Breach +0 min:  → Village chief SMS
Breach +5 min:  → Ranger station SMS  
Breach +15 min: → Wildlife authority SMS
Breach +30 min: → Emergency response team
```

### **Health Monitoring**:
```
Temperature >39°C:     "Temba fever alert - check health"
No movement 2+ hours:  "Temba stationary - investigate"  
Low battery <3.3V:     "Temba collar battery low"
```

---

## **🎯 Success Metrics**

From your test, the system is working perfectly:
- ✅ **Data Flow**: Collar → Server → Processing
- ✅ **Geofencing**: Accurately detects inside/outside status
- ✅ **Real-time**: Immediate response to position changes
- ✅ **Alerts**: SMS system ready (configure Twilio for production)

The Guardian Band turns **reactive** conflict management (after crop damage) into **proactive** prevention (before elephants reach crops)!