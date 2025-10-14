# The Guardian Band: Architecture Overview

## System Components
- ESP32 microcontroller (low-power, WiFi/Bluetooth; UART for GPS and cellular)
- NEO-6M GPS module (UART @ 9600 bps)
- SIM7000 (NB-IoT/LTE-M/GSM) for data + SMS (UART @ 115200)
- Heart rate sensor: MAX30102 (I2C)
- Temperature: DS18B20 (1-Wire) or MLX90614 (I2C)
- IMU: MPU6050 (I2C) for accelerometer/gyro
- Power: LiPo + charger (solar optional), buck/boost as needed
- Enclosure: rugged, waterproof collar housing

## Data Flow
Device -> Cellular -> Cloud Ingest -> Alerts/Dashboard

- Periodic telemetry (location, vitals, movement)
- Event-driven alerts (geofence breach, distress)
- OTA update support (future)

## Geofencing & Conflict Prediction
- On-device coarse check (optional) to reduce uplinks
- Server performs precise geofence evaluation (polygons/circles)
- Instant alert via SMS or webhook when crossing boundaries

## Health & Behavior
- Heart rate thresholds (species-tuned ranges)
- Temperature thresholds (fever/hypothermia)
- Movement features: step count, gait variance, burst acceleration

## Power Strategy
- Duty cycles: sample sensors at short intervals, batch upload
- Deep sleep between uploads; wake on IMU motion threshold
- NB-IoT/LTE-M preferred for power efficiency

## Security
- TLS to server; token-based auth
- Minimal PII; rotate device keys

## Telemetry Schema (example)
```
{
  "deviceId": "GB-esp32-0001",
  "ts": 1712345678901,
  "location": { "lat": 12.34, "lon": 56.78, "hdop": 0.9 },
  "vitals": { "hr": 62, "tempC": 37.5 },
  "motion": { "ax": 0.02, "ay": -0.01, "az": 0.98 },
  "battery": 3.92
}
```
