# Breadboard Prototyping Guide

## Quick Prototype Setup

For initial development and testing, you can build The Guardian Band on breadboards before creating a PCB. This guide shows the essential connections for a working prototype.

### Required Components for Breadboard Testing

#### Main Components
- ESP32 DevKit C development board
- SIM7000 breakout board (e.g., Adafruit FONA)
- NEO-6M GPS module
- DS18B20 waterproof temperature sensor
- MPU6050 breakout board
- Half-size breadboards (2-3 pieces)
- Jumper wires (male-to-male, male-to-female)

#### Supporting Components
- 4.7kΩ resistors (3 pieces - for pull-ups)
- 3.3V breadboard power supply
- LiPo battery (3.7V, 1000mAh minimum)
- USB cables for programming

### Breadboard Layout

```
BREADBOARD 1 - Main Controller & Power
=====================================
    +3.3V ----+----+----+----+----+   Power Rail (Red)
              |    |    |    |    |
    ESP32 ----+    |    |    |    |
              |    |    |    |    |
           SIM7000 |    |    |    |
              |    |    |    |    |
              | GPS NEO-6M   |    |
              |    |    |    |    |
              |    | MPU6050  |    |
              |    |    |    |    |
              |    |    | DS18B20  |
              |    |    |    |    |
      GND ----+----+----+----+----+   Ground Rail (Black)

BREADBOARD 2 - Sensor Connections  
==================================
              I2C Bus
    SDA ------+----------+
              |          |
           MPU6050   MAX30102
              |          | (optional)
    SCL ------+----------+

BREADBOARD 3 - Power & Charging
===============================
    Battery ---> Power Module ---> ESP32 VIN
    USB ------> Charging -------> Battery
```

## Step-by-Step Wiring

### Step 1: Power Distribution
```
1. Connect ESP32 3.3V pin to breadboard positive rail (red)
2. Connect ESP32 GND pin to breadboard negative rail (black/blue)
3. Connect battery positive to ESP32 VIN
4. Connect battery negative to breadboard ground rail
```

### Step 2: GPS Module (NEO-6M)
```
NEO-6M VCC ---> 3.3V rail
NEO-6M GND ---> Ground rail  
NEO-6M TX  ---> ESP32 GPIO 16
NEO-6M RX  ---> ESP32 GPIO 17
```

### Step 3: Cellular Module (SIM7000)
```
SIM7000 VCC ---> 3.3V rail
SIM7000 GND ---> Ground rail
SIM7000 TX  ---> ESP32 GPIO 26  
SIM7000 RX  ---> ESP32 GPIO 27
SIM7000 ANT ---> External antenna (SMA/U.FL)
```

### Step 4: I2C Sensors
```
MPU6050 VCC ---> 3.3V rail
MPU6050 GND ---> Ground rail
MPU6050 SDA ---> ESP32 GPIO 21
MPU6050 SCL ---> ESP32 GPIO 22
MPU6050 AD0 ---> Ground (sets I2C address to 0x68)

Add 4.7kΩ pull-up resistors:
- 3.3V ---> 4.7kΩ ---> SDA line
- 3.3V ---> 4.7kΩ ---> SCL line
```

### Step 5: Temperature Sensor (DS18B20)
```
DS18B20 VCC (Red)    ---> 3.3V rail
DS18B20 GND (Black)  ---> Ground rail  
DS18B20 DATA (Yellow) ---> ESP32 GPIO 4

Add 4.7kΩ pull-up resistor:
- 3.3V ---> 4.7kΩ ---> DATA line (GPIO 4)
```

## Visual Breadboard Diagram

```
                ESP32 DevKit C
           ┌─────────────────────────┐
      VIN ─┤●                      ● ├─ 3V3 ────┐
      GND ─┤●                      ● ├─ GND ────┼─── Ground Rail
           │                         │          │
      G26 ─┤● ←── SIM7000 TX         ├─ G21 ────┼─── I2C SDA + 4.7kΩ pullup
      G27 ─┤● ──→ SIM7000 RX         ├─ G22 ────┼─── I2C SCL + 4.7kΩ pullup  
           │                         │          │
      G16 ─┤● ←── GPS TX             ├─ G4  ────┼─── DS18B20 + 4.7kΩ pullup
      G17 ─┤● ──→ GPS RX             │          │
           └─────────────────────────┘          │
                        │                      │
                    Power Rail ────────────────┘
                   (3.3V from ESP32)

Connected Modules:
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   SIM7000   │  │   NEO-6M    │  │   MPU6050   │  │   DS18B20   │
│   Cellular  │  │     GPS     │  │     IMU     │  │    Temp     │
│             │  │             │  │             │  │             │
│ TX → G26    │  │ TX → G16    │  │ SDA → G21   │  │ DAT → G4    │
│ RX ← G27    │  │ RX ← G17    │  │ SCL → G22   │  │             │
│ VCC→ 3.3V   │  │ VCC→ 3.3V   │  │ VCC→ 3.3V   │  │ VCC→ 3.3V   │
│ GND→ GND    │  │ GND→ GND    │  │ GND→ GND    │  │ GND→ GND    │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
```

## Testing Your Prototype

### 1. Power Test
```cpp
// Upload this test code to verify power connections
void setup() {
  Serial.begin(115200);
  Serial.println("Guardian Band Power Test");
  Serial.print("VCC: "); Serial.println("3.3V");
}

void loop() {
  Serial.println("System running...");
  delay(1000);
}
```

### 2. GPS Test
```cpp
#include <SoftwareSerial.h>
SoftwareSerial gpsSerial(16, 17);

void setup() {
  Serial.begin(115200);
  gpsSerial.begin(9600);
  Serial.println("GPS Test - Looking for NMEA sentences...");
}

void loop() {
  if (gpsSerial.available()) {
    Serial.write(gpsSerial.read());
  }
}
```

### 3. I2C Device Scan
```cpp
#include <Wire.h>

void setup() {
  Serial.begin(115200);
  Wire.begin();
  Serial.println("I2C Scanner");
}

void loop() {
  for (byte address = 1; address < 127; address++) {
    Wire.beginTransmission(address);
    if (Wire.endTransmission() == 0) {
      Serial.print("Found device at 0x");
      if (address < 16) Serial.print("0");
      Serial.println(address, HEX);
    }
  }
  delay(5000);
}
```

### 4. Temperature Test
```cpp
#include <OneWire.h>
#include <DallasTemperature.h>

OneWire oneWire(4);
DallasTemperature sensors(&oneWire);

void setup() {
  Serial.begin(115200);
  sensors.begin();
}

void loop() {
  sensors.requestTemperatures();
  float tempC = sensors.getTempCByIndex(0);
  Serial.print("Temperature: ");
  Serial.print(tempC);
  Serial.println("°C");
  delay(2000);
}
```

## Common Breadboard Issues and Solutions

### Problem: GPS Not Getting Fix
**Symptoms**: No NMEA sentences or all zeros
**Solutions**:
- Ensure GPS antenna has clear sky view
- Check GPS module is powered (LED should blink)
- Verify RX/TX connections (they should cross)
- Wait 2-5 minutes for initial fix

### Problem: I2C Devices Not Detected
**Symptoms**: I2C scanner shows no devices
**Solutions**:
- Verify 4.7kΩ pull-up resistors on SDA/SCL
- Check power connections to sensors
- Ensure short, stable breadboard connections
- Try different I2C addresses (MPU6050 can be 0x68 or 0x69)

### Problem: Cellular Module Not Responding  
**Symptoms**: No response to AT commands
**Solutions**:
- Check SIM card is inserted correctly
- Verify RX/TX connections (they should cross)
- Ensure adequate power supply (cellular draws high current)
- Check antenna connection

### Problem: Unstable Connections
**Symptoms**: Intermittent failures, random errors
**Solutions**:
- Use shorter jumper wires
- Ensure breadboard connections are firm
- Add bypass capacitors (100nF) near ICs
- Check for loose connections

## Breadboard to PCB Migration

### Design Verification Checklist
Before creating PCB, verify on breadboard:
- [ ] All sensors read correctly
- [ ] GPS gets satellite fix
- [ ] Cellular connects to network
- [ ] Data uploads to server successfully
- [ ] Power consumption acceptable
- [ ] No interference between modules

### Layout Considerations for PCB
1. **Keep breadboard wire lengths**: Note successful wire lengths
2. **Document working configuration**: Take photos of breadboard
3. **Measure interference**: Note any modules that interfere
4. **Power distribution**: Plan robust power delivery
5. **Test point access**: Ensure debugging capabilities

## Parts Sourcing for Prototyping

### ESP32 and Modules
- **ESP32**: Espressif ESP32-DevKitC-32E
- **GPS**: u-blox NEO-6M or NEO-8M module
- **Cellular**: Adafruit FONA SIM7000 or similar
- **IMU**: Adafruit MPU6050 breakout
- **Temperature**: Maxim DS18B20 waterproof version

### Prototyping Supplies
- **Breadboards**: Half-size solderless breadboards (830 tie points)
- **Jumper wires**: Various lengths, male-to-male and male-to-female
- **Resistors**: 4.7kΩ ¼W through-hole resistors
- **Power supply**: 3.3V breadboard power module
- **Multimeter**: For debugging and verification

This breadboard setup provides a complete working prototype for development and testing before committing to a PCB design.