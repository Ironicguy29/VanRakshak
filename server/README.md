# Guardian Band Server

## Setup
1. Install Node.js LTS
2. PowerShell:
```
cd server
npm install
Copy-Item .env.example .env
npm run dev
```

## Env
- PORT=3000
- TWILIO_ACCOUNT_SID=your_sid
- TWILIO_AUTH_TOKEN=your_token
- TWILIO_FROM=+10000000000
- ALERT_TO=+10000000001
- SERVER_PUBLIC_URL=http://localhost:3000
 - ALERT_COOLDOWN_SECONDS=300

## SMS Alerts
If Twilio variables are set, the server will send an SMS when a device breaches the geofence, rate-limited by ALERT_COOLDOWN_SECONDS per device.

### Configure
1. Create `server/.env` from `.env.example`
2. Set: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM`, `ALERT_TO`, and optionally `ALERT_COOLDOWN_SECONDS`
3. Restart dev server

### Test
Use a tight fence and the simulator breach flag:
```powershell
$body = '{"type":"circle","center":{"lat":12.34,"lon":56.78},"radiusMeters":100}'
Invoke-RestMethod -Uri http://localhost:3000/api/v1/geofence -Method PUT -ContentType 'application/json' -Body $body
```
Then run the simulator with `--breach`. If SMS is configured, you should receive a message. Logs include whether it was sent or skipped and distance from boundary.

## Geofence Admin (Demo)
- GET `/api/v1/geofence` -> returns current fence
- PUT `/api/v1/geofence` with JSON body to set a fence (circle or polygon):
```json
{
	"type": "polygon",
	"points": [
		{ "lat": 12.34, "lon": 56.78 },
		{ "lat": 12.35, "lon": 56.80 },
		{ "lat": 12.33, "lon": 56.81 }
	]
}
```
Note: In-memory only, no auth; for demo/testing.

### Per-Device Fences
- GET `/api/v1/geofence/:deviceId` -> returns device fence if set, else default
- PUT `/api/v1/geofence/:deviceId` -> set device-specific fence (circle or polygon)
- DELETE `/api/v1/geofence/:deviceId` -> remove device-specific fence
