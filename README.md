# The Guardian Band

A humane, IoT-enabled, non-invasive wildlife collar that proactively prevents human-wildlife conflict while monitoring animal health and behavior.

## Quick Start (Windows)

- Server (Node.js/TypeScript)
  1. Install Node.js LTS.
  2. In PowerShell:
     - `cd server`
     - If npm is blocked by policy, run:
       - `& "C:\\Program Files\\nodejs\\node.exe" "C:\\Program Files\\nodejs\\node_modules\\npm\\bin\\npm-cli.js" install`
     - Otherwise: `npm install`
     - Copy `.env.example` to `.env` and set values
     - Start dev server:
       - `& "C:\\Program Files\\nodejs\\node.exe" "C:\\Program Files\\nodejs\\node_modules\\npm\\bin\\npm-cli.js" run dev`
       - Or: `npm run dev`

- Simulator (Python)
  1. Install Python 3.10+
  2. In PowerShell:
     - `cd simulator`
     - `python -m venv .venv; . .\.venv\Scripts\Activate.ps1`
     - `pip install -r requirements.txt`
     - `python simulate.py --animalId A-001`

- Firmware (ESP32/PlatformIO)
  1. Install VS Code + PlatformIO extension
  2. Open `firmware/esp32`
  3. Configure `include/config.h`
  4. Build and upload via PlatformIO

## Repos
- `docs/` Architecture and BOM
- `docs/guide.md` End-to-end guide (setup, components, and flow)
- `firmware/esp32/` ESP32 collar firmware scaffold
- `server/` Minimal ingest server with geofencing + SMS hooks
- `simulator/` Data generator to test end-to-end

## Mission
Shift conflict management from reactive to proactive with real-time geofencing alerts, health metrics, and behavior analytics.

## SMS Alerts (Optional)
1. Copy `server/.env.example` to `server/.env` and set:
  - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM`, `ALERT_TO`
  - `ALERT_COOLDOWN_SECONDS` (seconds per-device; default 300)
2. Restart the server after setting env vars.
3. To force a breach SMS in dev, either set a small radius or run the simulator with `--breach`.

Verification (PowerShell):
```powershell
# Set a tight default fence
$body = '{"type":"circle","center":{"lat":12.34,"lon":56.78},"radiusMeters":100}'
Invoke-RestMethod -Uri http://localhost:3000/api/v1/geofence -Method PUT -ContentType 'application/json' -Body $body

# Run simulator and observe server logs/SMS
cd C:\TheGuardianBand\simulator
python -m venv .venv; .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python simulate.py --animalId GB-sim-0001 --period 2 --breach
```
