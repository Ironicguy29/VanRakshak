# Bill of Materials (BOM)

Note: Replace placeholders with actual vendors and links during procurement.

## Core Electronics
- MCU: ESP32 DevKitC (ESP32-WROOM-32)
- Cellular: SIM800L (2G/GSM only), antenna + mini SIM
- GPS: NEO-6M with active antenna

## Sensors
- Heart rate: MAX30102 breakout (optional)
- Temperature: DS18B20 waterproof probe (1-Wire, 3-pin)
- Accelerometer: GY-61 (ADXL335 analog 3-axis)

## Power
- LiPo 3.7V 3000–6000 mAh
- Solar panel (optional) 5–6V
- Charge controller (e.g., TP4056 with protection)
- Buck converter to 3.3V as needed

## Enclosure & Mounting
- IP67+ collar housing, strain relief, epoxy potting
- Connectorized harnesses, waterproof glands

## Misc
- PCB or protoboard, JST connectors, wiring, heatshrink

## Notes
- SIM800L only supports 2G/GSM networks (check carrier support)
- SIM800L requires high current (2A peaks) - use adequate power supply
- GY-61 provides analog output (0-3.3V) for each axis
- Antenna placement to avoid interference
- Use conformal coating for moisture protection
- Add 1000µF+ capacitor near SIM800L for current spikes
