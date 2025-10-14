# The Guardian Band: End-to-End Guide

This guide explains every major component and function in the project, how they interact, and how to run and validate the system end-to-end on Windows.

## 1) What the system does
- Proactively prevents human–wildlife conflict by monitoring animal position and health.
- Creates geofences around sensitive areas; sends real-time alerts when an animal approaches or exits.
- Collects health and behavior data (temperature, motion) useful to conservationists.

## 2) Project structure and roles
- `docs/`
  - `architecture.md` – high-level architecture, data flows, telemetry schema.
  - `BOM.md` – bill of materials for hardware.
  - `guide.md` – this end-to-end guide.
- `firmware/esp32/`
  - `platformio.ini` – ESP32 board, libs (TinyGSM, TinyGPSPlus, DallasTemperature, OneWire, Adafruit_MPU6050).
  - `include/config.h` – device config (pins, APN, server host/port, intervals).
  - `src/main.cpp` – firmware logic: sensor reads, GPS, modem, HTTP POST to server.
- `server/`
  - `package.json`, `tsconfig.json` – Node+TypeScript setup, ESM runner.
  - `src/index.ts` – Express app: health, ingest, geofence admin, alerts.
  - `src/geofence.ts` – geofencing utilities and distance math.
  - `src/notify.ts` – Twilio SMS integration.
  - `.env.example` – configurable environment variables.
- `simulator/`
  - `simulate.py` – generates realistic telemetry to the server for testing.
- `.vscode/tasks.json` – tasks for server and simulator.

## 3) End-to-end data flow
1. Firmware reads sensors (GPS, temperature, IMU) and packages telemetry.
2. Firmware connects via cellular (SIM7000) using APN and sends HTTP POST to the server endpoint `/api/v1/ingest`.
3. Server validates payload, evaluates geofence (circle or polygon; global or per-device), logs movement deltas, and triggers SMS alert if outside (respecting cooldown).
4. Simulator can emulate the firmware stream for development.

## 4) Firmware walkthrough (ESP32)
Files: `firmware/esp32/include/config.h`, `firmware/esp32/src/main.cpp`, `platformio.ini`.

- `platformio.ini`
  - Board: `esp32dev`; framework: Arduino.
  - Libraries:
    - TinyGSM (SIM7000 modem), TinyGPSPlus (NEO‑6M GPS), OneWire + DallasTemperature (DS18B20), Adafruit_MPU6050.
  - Build flag: `-D TINY_GSM_MODEM_SIM7000` selects the modem profile.

- `include/config.h`
  - Pins: UART pins for modem (SIM7000) and GPS (NEO-6M), OneWire pin for DS18B20.
  - Network: `APN`, `APN_USER`, `APN_PASS` for cellular data.
  - Server: `SERVER_HOST`, `SERVER_PORT`, `SERVER_PATH` for the ingest API.
  - Device: `DEVICE_ID` and `UPLOAD_INTERVAL_MS` to control upload cadence.

- `src/main.cpp` key functions
  - `setupModem()`
    - Initializes UART for SIM7000 and restarts modem.
    - Calls `modem.gprsConnect(APN, APN_USER, APN_PASS)` to attach to the network.
  - `setupGPS()`
    - Initializes UART for NEO-6M and configures 9600 baud.
  - `setupSensors()`
    - Starts DS18B20 and attempts to start the MPU6050.
  - `sendTelemetry(lat, lon, tempC, accelEvent)`
    - Ensures a GPRS connection; opens TCP connection to `SERVER_HOST:SERVER_PORT`.
    - Sends an HTTP POST with JSON payload to `SERVER_PATH`.
  - `loop()`
    - Feeds TinyGPS++ with bytes from GPS UART.
    - Samples DS18B20 and MPU6050.
    - On a schedule (`UPLOAD_INTERVAL_MS`), if the GPS location is valid, calls `sendTelemetry`.

Telemetry payload (example):
```
{
  "deviceId": "GB-esp32-0001",
  "ts": 1712345678901,
  "location": { "lat": 12.34, "lon": 56.78 },
  "vitals": { "tempC": 37.5 },
  "motion": { "ax": 0.01, "ay": 0.00, "az": 0.98 },
  "battery": 3.92
}
```

Note: Heart rate sensor (MAX30102) is not wired in this starter; you can add it similarly to the DS18B20 and IMU.

## 5) Server walkthrough (Node/TypeScript, ESM)
Files: `server/src/index.ts`, `server/src/geofence.ts`, `server/src/notify.ts`, `server/.env.example`.

- `index.ts`
  - Express setup: JSON body parser and port config (`PORT` env; defaults to 3000).
  - `GET /health` – liveness check.
  - `POST /api/v1/ingest`
    - Validates telemetry with zod (`deviceId`, `location`, optional `vitals`/`motion`/`battery`).
    - Resolves fence: per-device fence if present, else default.
    - Computes `inside` using geofence utils.
    - Logs movement deltas using `haversineMeters` against last known location.
    - If outside: computes `distanceToGeofenceMeters`, checks per-device cooldown, and calls `sendBreachAlert`.
    - Responds with `{ ok: true, inside }`.
  - Geofence admin (in-memory demo):
    - `GET /api/v1/geofence` – get default fence.
    - `PUT /api/v1/geofence` – set default fence (circle or polygon).
    - `DELETE /api/v1/geofence` – reset to default circle fence.
    - Per-device:
      - `GET /api/v1/geofence/:deviceId`
      - `PUT /api/v1/geofence/:deviceId`
      - `DELETE /api/v1/geofence/:deviceId`

- `geofence.ts`
  - Types: `Geofence` is either `circle` (center + radiusMeters) or `polygon` (list of points).
  - `pointInCircle(lat, lon, clat, clon, radiusMeters)` – checks distance against radius (haversine).
  - `pointInPolygon(lat, lon, points)` – ray-casting algorithm.
  - `haversineMeters(lat1, lon1, lat2, lon2)` – geographic distance.
  - `isInsideGeofence(lat, lon, fence)` – circle or polygon dispatch.
  - `distanceToGeofenceMeters(lat, lon, fence)` – 0 if inside; else est. min distance (polygon via edge sampling).

- `notify.ts`
  - Reads Twilio env: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM`, `ALERT_TO`.
  - `sendBreachAlert(message)` – returns `{ sent: boolean, reason?: string }`.
  - If Twilio not configured or phone numbers missing, returns skipped with reason.

- Environment (.env)
  - `PORT`, `SERVER_PUBLIC_URL` (future use), Twilio variables, and `ALERT_COOLDOWN_SECONDS`.

## 6) Simulator walkthrough (Python)
File: `simulator/simulate.py`.

- Arguments:
  - `--server` base URL (default `http://localhost:3000`)
  - `--animalId` device identifier
  - `--period` seconds between POSTs
  - `--lat`, `--lon` starting position; `--drift` random walk magnitude
  - `--breach` when set, periodically pushes location out of the fence
- Behavior:
  - Generates a random walk around the starting point.
  - Builds telemetry similar to firmware: `location`, `vitals` (hr/temp), `motion`, `battery`.
  - Posts to `/api/v1/ingest` and prints status line.

## 7) Setup and run (Windows PowerShell)
- Server
  ```powershell
  cd C:\TheGuardianBand\server
  # If npm scripts are blocked by policy, use node.exe to run npm
  & "C:\Program Files\nodejs\node.exe" "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" install
  & "C:\Program Files\nodejs\node.exe" "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" run dev
  ```
  If port 3000 is in use, set an alternate port:
  ```powershell
  $env:PORT=3001
  & "C:\Program Files\nodejs\node.exe" "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" run dev
  ```

- Configure a geofence (example: circle 100m)
  ```powershell
  $body = '{"type":"circle","center":{"lat":12.34,"lon":56.78},"radiusMeters":100}'
  Invoke-RestMethod -Uri http://localhost:3000/api/v1/geofence -Method PUT -ContentType 'application/json' -Body $body
  ```

- Simulator
  ```powershell
  cd C:\TheGuardianBand\simulator
  python -m venv .venv; .\.venv\Scripts\Activate.ps1
  pip install -r requirements.txt
  python simulate.py --animalId GB-sim-0001 --period 2 --breach
  ```

- Firmware (PlatformIO)
  - Open `firmware/esp32` in VS Code.
  - Edit `include/config.h`: set APN, server host/port, and pin mapping to your wiring.
  - Build and flash; open serial monitor at 115200 baud.

## 8) Testing scenarios
- Inside fence: simulator without `--breach` should show `{ ok: true, inside: true }` responses; server shows movement logs.
- Breach: with `--breach`, server logs `[ALERT:sent]` or `skipped(twilio_not_configured)`; includes distance to boundary.
- Per-device fence: set a fence for one device via `PUT /api/v1/geofence/:deviceId` and verify differing behaviors across devices.
- Cooldown: multiple breaches within `ALERT_COOLDOWN_SECONDS` log `ALERT:cooldown` without repeated SMS.

## 9) Troubleshooting
- Port 3000 in use: set `PORT` to another value (e.g., 3001) before starting.
- PowerShell policy blocks npm/npx: invoke npm via `node.exe` as shown; or set execution policy for current user.
- Twilio errors: `twilio_not_configured` or `phone_not_configured` indicate missing env vars; set `.env` and restart.
- No telemetry arriving: verify server URL/port in `config.h`, APN credentials, and cellular coverage.
- GPS fix: ensure antenna is connected and device has sky view; firmware only sends when `gps.location.isValid()`.
- Sensor pins: adjust `MODEM_RX/TX_PIN`, `GPS_RX/TX_PIN`, `TEMP_ONEWIRE_PIN` to match your wiring.

## 10) Security and next steps
- Use HTTPS/TLS and token-based auth for production.
- Persist telemetry (SQLite/Postgres) and build a dashboard (map + vitals).
- Firmware: add MAX30102 heart rate, deep sleep, motion-triggered wake.
- Server: add alert recipients per device, schedule windows, and webhooks.

This guide should equip you to understand, run, and extend The Guardian Band end-to-end.
