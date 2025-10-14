import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { z } from 'zod';
import { isInsideGeofence, Geofence, distanceToGeofenceMeters, haversineMeters } from './geofence.js';
import { sendBreachAlert } from './notify.js';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = Number(process.env.PORT || 3000);

// In-memory state
const fences: Record<string, Geofence> = {
  default: {
    type: 'circle',
    center: { lat: 12.34, lon: 56.78 },
    radiusMeters: 500,
  },
};

// Optional per-device fences
const deviceFences: Record<string, Geofence> = {};

// User registration and safety system
interface RegisteredUser {
  id: string;
  name: string;
  phone: string;
  safetyRadius: number; // meters - alert if animal within this distance
  lastLocation?: { lat: number; lon: number; timestamp: number };
}

const registeredUsers: Record<string, RegisteredUser> = {};
const animalLocations: Record<string, { lat: number; lon: number; timestamp: number; tempC?: number }> = {};

const ALERT_COOLDOWN_SECONDS = Number(process.env.ALERT_COOLDOWN_SECONDS || 300);
const lastAlertAt: Record<string, number> = {};
const lastSafetyAlertAt: Record<string, number> = {};

const Telemetry = z.object({
  deviceId: z.string(),
  ts: z.number().optional(),
  location: z.object({ lat: z.number(), lon: z.number() }),
  vitals: z.object({ hr: z.number().optional(), tempC: z.number().optional() }).optional(),
  motion: z
    .object({ ax: z.number().optional(), ay: z.number().optional(), az: z.number().optional() })
    .optional(),
  battery: z.number().optional(),
});

const UserRegistration = z.object({
  name: z.string().min(2),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]{10,15}$/),
  safetyRadius: z.number().min(50).max(5000).default(200), // 50m to 5km
});

const UserLocationUpdate = z.object({
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
});

app.get('/health', (_req: Request, res: Response) => res.json({ ok: true }));

// Geofence admin (in-memory, no auth; for demo only)
app.get('/api/v1/geofence', (_req: Request, res: Response) => res.json(fences.default));
app.get('/api/v1/geofence/:deviceId', (req: Request, res: Response) => {
  const fence = deviceFences[req.params.deviceId] || fences.default;
  res.json(fence);
});

const PolygonFence = z.object({
  type: z.literal('polygon'),
  points: z.array(z.object({ lat: z.number(), lon: z.number() })).min(3),
});

const CircleFence = z.object({
  type: z.literal('circle'),
  center: z.object({ lat: z.number(), lon: z.number() }),
  radiusMeters: z.number().positive(),
});

const AnyFence = z.union([CircleFence, PolygonFence]);

app.put('/api/v1/geofence', (req: Request, res: Response) => {
  const parsed = AnyFence.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'invalid geofence', issues: parsed.error.flatten() });
  }
  fences.default = parsed.data;
  res.json({ ok: true, fence: fences.default });
});

app.put('/api/v1/geofence/:deviceId', (req: Request, res: Response) => {
  const parsed = AnyFence.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'invalid geofence', issues: parsed.error.flatten() });
  }
  deviceFences[req.params.deviceId] = parsed.data;
  res.json({ ok: true, fence: deviceFences[req.params.deviceId] });
});

app.delete('/api/v1/geofence', (_req: Request, res: Response) => {
  fences.default = { type: 'circle', center: { lat: 12.34, lon: 56.78 }, radiusMeters: 500 };
  res.json({ ok: true, fence: fences.default });
});

app.delete('/api/v1/geofence/:deviceId', (req: Request, res: Response) => {
  delete deviceFences[req.params.deviceId];
  res.json({ ok: true });
});

// User Safety System API
app.post('/api/v1/users/register', (req: Request, res: Response) => {
  const parsed = UserRegistration.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'invalid registration', issues: parsed.error.flatten() });
  }
  
  const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  registeredUsers[userId] = {
    id: userId,
    ...parsed.data,
  };
  
  res.json({ ok: true, userId, message: 'Registered successfully for wildlife safety alerts' });
});

app.put('/api/v1/users/:userId/location', (req: Request, res: Response) => {
  const parsed = UserLocationUpdate.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'invalid location', issues: parsed.error.flatten() });
  }
  
  const user = registeredUsers[req.params.userId];
  if (!user) {
    return res.status(404).json({ error: 'user not found' });
  }
  
  user.lastLocation = { ...parsed.data, timestamp: Date.now() };
  
  // Check proximity to all animals
  const nearbyAnimals = checkAnimalProximity(user);
  
  res.json({ ok: true, nearbyAnimals });
});

app.get('/api/v1/users/:userId/nearby-animals', (req: Request, res: Response) => {
  const user = registeredUsers[req.params.userId];
  if (!user) {
    return res.status(404).json({ error: 'user not found' });
  }
  
  if (!user.lastLocation) {
    return res.status(400).json({ error: 'location not set - update location first' });
  }
  
  const nearbyAnimals = getNearbyAnimalsWithDetails(user);
  res.json({ nearbyAnimals, userLocation: user.lastLocation });
});

app.get('/api/v1/dashboard', (_req: Request, res: Response) => {
  res.send(generateSafetyDashboard());
});

app.post('/api/v1/ingest', (req: Request, res: Response) => {
  const parsed = Telemetry.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'invalid payload', issues: parsed.error.flatten() });
  }
  const data = parsed.data;
  const fence = deviceFences[data.deviceId] || fences.default;
  const inside = isInsideGeofence(data.location.lat, data.location.lon, fence);
  // Store animal location for safety system
  animalLocations[data.deviceId] = {
    lat: data.location.lat,
    lon: data.location.lon,
    timestamp: data.ts ?? Date.now(),
    tempC: data.vitals?.tempC,
  };

  // Last location tracking and delta
  const key = `last:${data.deviceId}`;
  // Using in-memory store on app locals for simplicity
  const lastMap = (app.locals.lastMap ||= new Map<string, { lat: number; lon: number; ts: number }>());
  const prev = lastMap.get(key);
  if (prev) {
    const dist = haversineMeters(prev.lat, prev.lon, data.location.lat, data.location.lon);
    const dt = (data.ts ?? Date.now()) - prev.ts;
    console.log(`[MOVE] ${data.deviceId} moved ~${Math.round(dist)}m over ${Math.round(dt/1000)}s`);
  }
  lastMap.set(key, { lat: data.location.lat, lon: data.location.lon, ts: data.ts ?? Date.now() });

  // Check for human safety alerts
  checkHumanSafetyAlerts(data.deviceId, data.location.lat, data.location.lon);

  if (!inside) {
    const dist = distanceToGeofenceMeters(data.location.lat, data.location.lon, fence);
    const now = Date.now();
    const last = lastAlertAt[data.deviceId] || 0;
    if (now - last > ALERT_COOLDOWN_SECONDS * 1000) {
      const msg = `GuardianBand ALERT: ${data.deviceId} outside geofence at lat=${data.location.lat.toFixed(5)}, lon=${data.location.lon.toFixed(5)} (~${Math.round(dist)}m from boundary)`;
      sendBreachAlert(msg).then((r) => {
        const status = r.sent ? 'sent' : `skipped(${r.reason})`;
        console.log(`[ALERT:${status}] ${msg}`);
      });
      lastAlertAt[data.deviceId] = now;
    } else {
      console.log(`[ALERT:cooldown] ${data.deviceId} still outside geofence (~${Math.round(dist)}m)`);
    }
  }

  return res.json({ ok: true, inside });
});

// Human Safety Alert Functions
function checkAnimalProximity(user: RegisteredUser) {
  if (!user.lastLocation) return [];
  
  const nearbyAnimals = [];
  for (const [deviceId, animal] of Object.entries(animalLocations)) {
    const distance = haversineMeters(
      user.lastLocation.lat, user.lastLocation.lon,
      animal.lat, animal.lon
    );
    
    if (distance <= user.safetyRadius) {
      nearbyAnimals.push({
        deviceId,
        distance: Math.round(distance),
        location: animal,
        danger: distance < 100 ? 'HIGH' : distance < 300 ? 'MEDIUM' : 'LOW'
      });
    }
  }
  
  return nearbyAnimals.sort((a, b) => a.distance - b.distance);
}

function getNearbyAnimalsWithDetails(user: RegisteredUser) {
  if (!user.lastLocation) return [];
  
  const animals = [];
  for (const [deviceId, animal] of Object.entries(animalLocations)) {
    const distance = haversineMeters(
      user.lastLocation.lat, user.lastLocation.lon,
      animal.lat, animal.lon
    );
    
    const timeSinceUpdate = Date.now() - animal.timestamp;
    const isRecent = timeSinceUpdate < 300000; // 5 minutes
    
    animals.push({
      deviceId,
      distance: Math.round(distance),
      location: animal,
      danger: distance < 100 ? 'HIGH' : distance < 300 ? 'MEDIUM' : distance < 1000 ? 'LOW' : 'SAFE',
      lastUpdate: new Date(animal.timestamp).toISOString(),
      isRecent,
      vitals: animal.tempC ? { temperature: animal.tempC } : null
    });
  }
  
  return animals.sort((a, b) => a.distance - b.distance);
}

function checkHumanSafetyAlerts(deviceId: string, lat: number, lon: number) {
  for (const [userId, user] of Object.entries(registeredUsers)) {
    if (!user.lastLocation) continue;
    
    const distance = haversineMeters(user.lastLocation.lat, user.lastLocation.lon, lat, lon);
    
    if (distance <= user.safetyRadius) {
      const now = Date.now();
      const alertKey = `${userId}-${deviceId}`;
      const lastAlert = lastSafetyAlertAt[alertKey] || 0;
      
      if (now - lastAlert > ALERT_COOLDOWN_SECONDS * 1000) {
        const danger = distance < 100 ? 'DANGER' : distance < 300 ? 'WARNING' : 'CAUTION';
        const message = `${danger}: Wildlife ${deviceId} detected ${Math.round(distance)}m from your location. Stay alert!`;
        
        sendBreachAlert(message).then((r) => {
          const status = r.sent ? 'sent' : `skipped(${r.reason})`;
          console.log(`[SAFETY:${status}] ${user.name} (${user.phone}): ${message}`);
        });
        
        lastSafetyAlertAt[alertKey] = now;
      }
    }
  }
}

function generateSafetyDashboard() {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Guardian Band - Wildlife Safety Dashboard</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      background: linear-gradient(135deg, #B0CE88 0%, #FFFD8F 100%);
      min-height: 100vh;
      padding: 15px;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    .header { 
      background: #043915; 
      color: #FFFD8F; 
      padding: 25px 30px; 
      border-radius: 12px; 
      margin-bottom: 25px;
      box-shadow: 0 4px 12px rgba(4, 57, 21, 0.3);
    }
    .header h1 { font-size: 2.2em; font-weight: 600; margin-bottom: 8px; }
    .header p { font-size: 1.1em; opacity: 0.9; }
    
    .card { 
      background: rgba(255, 255, 255, 0.95); 
      padding: 25px; 
      margin: 15px 0; 
      border-radius: 12px; 
      box-shadow: 0 3px 8px rgba(0,0,0,0.08);
      border: 1px solid rgba(76, 118, 59, 0.15);
    }
    .card h3 { color: #043915; margin-bottom: 15px; font-size: 1.3em; }
    
    .danger { border-left: 4px solid #dc3545; background: rgba(220, 53, 69, 0.02); }
    .warning { border-left: 4px solid #fd7e14; background: rgba(253, 126, 20, 0.02); }
    .safe { border-left: 4px solid #4C763B; background: rgba(76, 118, 59, 0.02); }
    
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
    .stat-item { 
      display: flex; 
      justify-content: space-between; 
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid rgba(76, 118, 59, 0.1);
    }
    .stat-item:last-child { border-bottom: none; }
    .stat-value { font-weight: 600; color: #4C763B; font-size: 1.2em; }
    
    .form-container { 
      background: linear-gradient(135deg, #B0CE88, rgba(176, 206, 136, 0.8)); 
      padding: 20px; 
      border-radius: 10px; 
      margin: 15px 0;
      border: 1px solid #4C763B;
    }
    .form-row { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
    .form-input { 
      padding: 10px 14px; 
      border: 2px solid #4C763B; 
      border-radius: 6px; 
      font-size: 14px;
      background: white;
      min-width: 140px;
    }
    .form-input:focus { outline: none; border-color: #043915; }
    
    .btn { 
      background: #4C763B; 
      color: white; 
      padding: 10px 20px; 
      border: none; 
      border-radius: 6px; 
      cursor: pointer;
      font-weight: 500;
      transition: background 0.2s;
    }
    .btn:hover { background: #043915; }
    
    .animal-item { 
      display: flex; 
      justify-content: space-between; 
      align-items: center;
      padding: 15px;
      margin: 10px 0;
      border-radius: 8px;
      border: 1px solid rgba(76, 118, 59, 0.2);
    }
    .animal-info h4 { color: #043915; margin-bottom: 4px; }
    .coords { 
      font-family: 'Courier New', monospace; 
      font-size: 13px; 
      color: #666; 
      background: rgba(255, 253, 143, 0.3);
      padding: 2px 6px;
      border-radius: 3px;
    }
    .status-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .status-active { background: #B0CE88; color: #043915; }
    .status-warning { background: #FFFD8F; color: #043915; }
    .status-danger { background: #dc3545; color: white; }
    
    .refresh-note { 
      color: #4C763B; 
      font-size: 13px; 
      margin-top: 8px;
      font-style: italic;
    }
    .result-msg { 
      margin-top: 10px; 
      padding: 10px; 
      border-radius: 6px; 
      font-weight: 500;
    }
    .success { background: rgba(76, 118, 59, 0.1); color: #043915; }
    .error { background: rgba(220, 53, 69, 0.1); color: #dc3545; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Guardian Band Control Center</h1>
      <p>Wildlife Conservation & Human Safety Monitoring</p>
    </div>

    <div class="stats">
      <div class="card">
        <h3>System Overview</h3>
        <div class="stat-item">
          <span>Active Wildlife Trackers</span>
          <span class="stat-value">${Object.keys(animalLocations).length}</span>
        </div>
        <div class="stat-item">
          <span>Registered Personnel</span>
          <span class="stat-value">${Object.keys(registeredUsers).length}</span>
        </div>
        <div class="stat-item">
          <span>Alert Cooldown Period</span>
          <span class="stat-value">${ALERT_COOLDOWN_SECONDS}s</span>
        </div>
      </div>
      
      <div class="card">
        <h3>Dashboard Controls</h3>
        <button class="btn" onclick="location.reload()">Refresh Data</button>
        <div class="refresh-note">
          Last updated: ${new Date().toLocaleString()}
        </div>
      </div>
    </div>

    <div class="card">
      <h3>Personnel Registration</h3>
      <p style="margin-bottom: 15px; color: #666;">Register field staff, researchers, and local community members for safety alerts</p>
      <div class="form-container">
        <form id="registerForm">
          <div class="form-row">
            <input type="text" id="name" placeholder="Full Name" required class="form-input">
            <input type="tel" id="phone" placeholder="Phone (+country code)" required class="form-input">
            <input type="number" id="radius" placeholder="Alert Range (meters)" value="300" min="50" max="5000" class="form-input">
            <button type="submit" class="btn">Register Person</button>
          </div>
        </form>
        <div id="registerResult"></div>
      </div>
    </div>

    <div class="card">
      <h3>Wildlife Tracker Status</h3>
      ${Object.entries(animalLocations).length === 0 ? 
        '<p style="color: #666; font-style: italic; padding: 20px; text-align: center;">No active wildlife trackers detected.<br>Connect collar devices or run simulator to see data.</p>' :
        Object.entries(animalLocations).map(([deviceId, animal]) => {
          const age = Math.round((Date.now() - animal.timestamp) / 1000);
          const statusClass = age < 300 ? 'safe' : age < 900 ? 'warning' : 'danger';
          const statusText = age < 300 ? 'Active' : age < 900 ? 'Delayed' : 'Lost Signal';
          const badgeClass = age < 300 ? 'status-active' : age < 900 ? 'status-warning' : 'status-danger';
          
          return `
          <div class="animal-item ${statusClass}">
            <div class="animal-info">
              <h4>${deviceId.replace('GB-', '').replace('-', ' ').toUpperCase()}</h4>
              <div class="coords">${animal.lat.toFixed(6)}, ${animal.lon.toFixed(6)}</div>
              ${animal.tempC ? `<small style="color: #4C763B;">Body Temp: ${animal.tempC}°C</small>` : ''}
            </div>
            <div style="text-align: right;">
              <div class="status-badge ${badgeClass}">${statusText}</div>
              <small style="color: #666;">${age < 60 ? age + ' sec ago' : Math.round(age/60) + ' min ago'}</small>
            </div>
          </div>`;
        }).join('')
      }
    </div>

    <div class="card">
      <h3>Registered Personnel</h3>
      ${Object.entries(registeredUsers).length === 0 ? 
        '<p style="color: #666; font-style: italic; padding: 20px; text-align: center;">No personnel registered for safety alerts.</p>' :
        Object.entries(registeredUsers).map(([userId, user]) => `
          <div class="animal-item safe">
            <div class="animal-info">
              <h4>${user.name}</h4>
              <div style="margin: 5px 0;">
                <span style="color: #4C763B; font-weight: 500;">${user.phone}</span>
                <span style="color: #666;"> • Alert Range: ${user.safetyRadius}m</span>
              </div>
              ${user.lastLocation ? 
                `<div class="coords">${user.lastLocation.lat.toFixed(6)}, ${user.lastLocation.lon.toFixed(6)}</div>` : 
                '<small style="color: #999;">Location not set</small>'
              }
            </div>
            <div style="text-align: right;">
              <div class="status-badge status-active">Registered</div>
              <small style="color: #666;">ID: ${userId.split('-').pop()}</small>
            </div>
          </div>
        `).join('')
      }
    </div>
  </div>

  <script>
    document.getElementById('registerForm').onsubmit = async (e) => {
      e.preventDefault();
      const formData = {
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        safetyRadius: parseInt(document.getElementById('radius').value)
      };
      
      try {
        const response = await fetch('/api/v1/users/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        if (result.ok) {
          document.getElementById('registerResult').innerHTML = 
            '<div class="result-msg success">Registration successful! Your tracking ID: <strong>' + result.userId.split('-').pop() + '</strong></div>';
          setTimeout(() => location.reload(), 2500);
        } else {
          document.getElementById('registerResult').innerHTML = 
            '<div class="result-msg error">Registration failed: ' + (result.error || 'Unknown error') + '</div>';
        }
      } catch (err) {
        document.getElementById('registerResult').innerHTML = 
          '<div class="result-msg error">Network connection error. Please try again.</div>';
      }
    };
  </script>
</body>
</html>`;
}

app.listen(PORT, () => {
  console.log(`Guardian Band server listening on :${PORT}`);
  console.log(`Wildlife Safety Dashboard: http://localhost:${PORT}/api/v1/dashboard`);
});
