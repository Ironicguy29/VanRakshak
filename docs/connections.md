# The Guardian Band: Hardware Connections

## ESP32 Pin Assignments

Based on the firmware configuration in `firmware/esp32/include/config.h`, here are the complete wiring connections:

### Power Connections
```
ESP32 3.3V  → All sensor VCC pins
ESP32 GND   → All sensor GND pins + Battery GND
Battery +   → ESP32 VIN (3.7V LiPo)
```

### Digital Pin Assignments
```
GPIO 26 (RX) → SIM800L TX (Cellular Modem)
GPIO 27 (TX) → SIM800L RX (Cellular Modem)
GPIO 16 (RX) → NEO-6M TX (GPS Module)
GPIO 17 (TX) → NEO-6M RX (GPS Module)
GPIO 4       → DS18B20 Data (Temperature Sensor)
GPIO 34 (ADC)→ GY-61 X-axis (Analog)
GPIO 35 (ADC)→ GY-61 Y-axis (Analog)
GPIO 32 (ADC)→ GY-61 Z-axis (Analog)
GPIO 21 (SDA)→ MAX30102 SDA (I2C Bus) - Optional
GPIO 22 (SCL)→ MAX30102 SCL (I2C Bus) - Optional
```

## Detailed Component Connections

### 1. SIM800L Cellular Modem
```
SIM800L          ESP32
VCC        →     3.7-4.2V (Direct battery connection recommended)
GND        →     GND
TX         →     GPIO 26 (MODEM_RX_PIN)
RX         →     GPIO 27 (MODEM_TX_PIN)
RST        →     (Optional: GPIO pin for reset control)
ANT        →     External 2G/GSM antenna
SIM        →     Mini SIM card slot
```

**Notes:**
- Use 9600 baud rate (SIM800L default)
- SIM800L draws high current (2A peaks) - connect VCC directly to battery
- Only supports 2G/GSM networks (not LTE/NB-IoT)
- Configure APN settings in config.h for your carrier

### 2. NEO-6M GPS Module
```
NEO-6M           ESP32
VCC        →     3.3V (or 5V if module supports it)
GND        →     GND
TX         →     GPIO 16 (GPS_RX_PIN)
RX         →     GPIO 17 (GPS_TX_PIN)
ANT        →     External GPS antenna (usually built-in)
```

**Notes:**
- Use 9600 baud rate (configured in firmware)
- Requires clear sky view for GPS fix
- Active antenna recommended for better reception

### 3. DS18B20 Temperature Sensor (1-Wire)
```
DS18B20          ESP32
VCC (Red)  →     3.3V
GND (Black)→     GND
Data (Yellow)→   GPIO 4 (TEMP_ONEWIRE_PIN)
```

**Additional Components:**
- 4.7kΩ pull-up resistor between Data and VCC
- Use waterproof version for outdoor deployment

### 4. GY-61 Accelerometer (ADXL335 - Analog)
```
GY-61 (ADXL335) ESP32
VCC        →     3.3V
GND        →     GND
X-OUT      →     GPIO 34 (ADC1_CH6)
Y-OUT      →     GPIO 35 (ADC1_CH7)
Z-OUT      →     GPIO 32 (ADC1_CH4)
ST         →     (Self-test, leave unconnected)
```

**Notes:**
- Analog accelerometer with 0-3.3V output range
- ±3g measurement range
- No I2C communication required
- Read via ESP32 ADC (12-bit resolution)

### 5. MAX30102 Heart Rate Sensor (I2C) - Optional
```
MAX30102         ESP32
VCC        →     3.3V
GND        →     GND
SDA        →     GPIO 21 (I2C Data)
SCL        →     GPIO 22 (I2C Clock)
INT        →     (Optional: GPIO pin for interrupts)
```

**Notes:**
- I2C address: 0x57
- Requires direct contact with animal skin
- Not currently implemented in firmware (placeholder)
- Use 4.7kΩ pull-up resistors on SDA/SCL if enabled

## Power System Connections

### Battery and Charging Circuit
```
LiPo Battery (+) → TP4056 B+ ──┬── ESP32 VIN
                               └── SIM800L VCC (Direct connection!)
LiPo Battery (-) → TP4056 B- ──┬── ESP32 GND
                               └── SIM800L GND
TP4056 OUT+     → (Not used - direct battery connections)
TP4056 OUT-     → (Not used - direct battery connections)
Solar Panel (+) → TP4056 IN+ (optional)
Solar Panel (-) → TP4056 IN- (optional)
```

**CRITICAL: SIM800L Power Requirements**
- SIM800L needs 3.7-4.2V (battery voltage)
- Peak current draw: 2A during transmission
- Connect SIM800L VCC directly to battery positive
- Use 1000µF+ capacitor near SIM800L VCC for current spikes

### Power Monitoring (Optional)
```
Battery Voltage Divider:
Battery (+) → 10kΩ → GPIO 36 (ADC) → 10kΩ → GND
```

## Complete Wiring Diagram

```
                    ESP32 DevKit C
                   ┌─────────────────┐
    Battery VIN ───┤VIN          3V3 ├─── VCC (All Sensors)
    Battery GND ───┤GND          GND ├─── GND (All Sensors)
                   │                 │
         GPS RX ───┤16           21  ├─── I2C SDA (MAX30102 Optional)
         GPS TX ───┤17           22  ├─── I2C SCL (MAX30102 Optional)
                   │                 │
       SIM800L ────┤26           4   ├─── DS18B20 Data
       TX→RX       │                 │
       SIM800L ────┤27           32  ├─── GY-61 Z-axis (ADC)
       RX←TX       │                 │
                   │             34  ├─── GY-61 X-axis (ADC)
                   │             35  ├─── GY-61 Y-axis (ADC)
                   └─────────────────┘

External Components:
┌─────────────┐    ┌──────────────┐    ┌────────────┐
│   SIM800L   │    │    NEO-6M    │    │  DS18B20   │
│   Modem     │    │     GPS      │    │   Temp     │
└─────────────┘    └──────────────┘    └────────────┘

┌─────────────┐    ┌──────────────┐    ┌────────────┐
│    GY-61    │    │   MAX30102   │    │  TP4056    │
│ Accel (ADC) │    │ Heart Rate   │    │  Charger   │
└─────────────┘    └──────────────┘    └────────────┘
```

## Assembly Notes

### 1. PCB Layout Considerations
- Keep GPS and cellular antennas separated (>5cm)
- Use ground plane for noise reduction
- Short I2C traces (<10cm)
- Separate analog and digital grounds if possible

### 2. Enclosure Requirements
- IP67+ waterproof rating
- Strain relief for all cables
- Antenna feedthrough considerations
- Easy access for charging port
- Secure mounting points for collar attachment

### 3. Antenna Placement
- GPS antenna: Clear sky view, away from metal
- Cellular antenna: External, proper impedance matching
- Minimum 5cm separation between antennas

### 4. Power Considerations
- 3.7V LiPo battery (3000-6000mAh recommended)
- Solar charging optional (6V panel + charge controller)
- Buck converter if 5V sensors are used

## Testing Connections

### Continuity Tests
1. Check all power connections (VCC/GND)
2. Verify UART crossover (TX→RX, RX→TX)
3. Confirm I2C pull-up resistors (SDA/SCL)
4. Test 1-Wire pull-up (DS18B20)

### Functional Tests
1. **GPS**: Serial monitor should show NMEA sentences
2. **Cellular**: AT commands via serial interface
3. **I2C Devices**: I2C scanner should detect addresses
4. **Temperature**: Should read ambient temperature
5. **Power**: Verify voltage levels at all points

## Troubleshooting

### Common Issues
- **No GPS fix**: Check antenna, ensure sky view
- **Cellular connection fails**: Verify APN settings, SIM card
- **I2C devices not found**: Check wiring, pull-up resistors
- **Temperature reads -127°C**: DS18B20 wiring issue
- **Power issues**: Check battery voltage, connections

### Debug Commands
```cpp
// In Arduino IDE Serial Monitor (115200 baud)
// GPS debug: Check for NMEA sentences
// I2C scan: Look for device addresses 0x68 (MPU6050), 0x57 (MAX30102)
// AT commands: Test SIM7000 with AT+CPIN? AT+CREG? etc.
```

## Bill of Materials Reference

See `docs/BOM.md` for complete parts list with specifications and sourcing information.

## Safety Considerations

- Use proper ESD protection during assembly
- Verify polarity on all connections
- Test with multimeter before powering up
- Use fuses/protection circuits for battery connections
- Follow local regulations for cellular device deployment