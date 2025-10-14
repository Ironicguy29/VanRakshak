import express from 'express';
import dotenv from 'dotenv';
import { z } from 'zod';
import { isInsideGeofence, distanceToGeofenceMeters, haversineMeters } from './geofence.js';
import { sendBreachAlert } from './notify.js';
dotenv.config();
const app = express();
app.use(express.json());
const PORT = Number(process.env.PORT || 3000);
// In-memory state
const fences = {
    default: {
        type: 'circle',
        center: { lat: 12.34, lon: 56.78 },
        radiusMeters: 500,
    },
};
// Optional per-device fences
const deviceFences = {};
const ALERT_COOLDOWN_SECONDS = Number(process.env.ALERT_COOLDOWN_SECONDS || 300);
const lastAlertAt = {};
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
app.get('/health', (_req, res) => res.json({ ok: true }));
// Geofence admin (in-memory, no auth; for demo only)
app.get('/api/v1/geofence', (_req, res) => res.json(fences.default));
app.get('/api/v1/geofence/:deviceId', (req, res) => {
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
app.put('/api/v1/geofence', (req, res) => {
    const parsed = AnyFence.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: 'invalid geofence', issues: parsed.error.flatten() });
    }
    fences.default = parsed.data;
    res.json({ ok: true, fence: fences.default });
});
app.put('/api/v1/geofence/:deviceId', (req, res) => {
    const parsed = AnyFence.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: 'invalid geofence', issues: parsed.error.flatten() });
    }
    deviceFences[req.params.deviceId] = parsed.data;
    res.json({ ok: true, fence: deviceFences[req.params.deviceId] });
});
app.delete('/api/v1/geofence', (_req, res) => {
    fences.default = { type: 'circle', center: { lat: 12.34, lon: 56.78 }, radiusMeters: 500 };
    res.json({ ok: true, fence: fences.default });
});
app.delete('/api/v1/geofence/:deviceId', (req, res) => {
    delete deviceFences[req.params.deviceId];
    res.json({ ok: true });
});
app.post('/api/v1/ingest', (req, res) => {
    var _a;
    const parsed = Telemetry.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: 'invalid payload', issues: parsed.error.flatten() });
    }
    const data = parsed.data;
    const fence = deviceFences[data.deviceId] || fences.default;
    const inside = isInsideGeofence(data.location.lat, data.location.lon, fence);
    // Last location tracking and delta
    const key = `last:${data.deviceId}`;
    // Using in-memory store on app locals for simplicity
    const lastMap = ((_a = app.locals).lastMap || (_a.lastMap = new Map()));
    const prev = lastMap.get(key);
    if (prev) {
        const dist = haversineMeters(prev.lat, prev.lon, data.location.lat, data.location.lon);
        const dt = (data.ts ?? Date.now()) - prev.ts;
        console.log(`[MOVE] ${data.deviceId} moved ~${Math.round(dist)}m over ${Math.round(dt / 1000)}s`);
    }
    lastMap.set(key, { lat: data.location.lat, lon: data.location.lon, ts: data.ts ?? Date.now() });
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
        }
        else {
            console.log(`[ALERT:cooldown] ${data.deviceId} still outside geofence (~${Math.round(dist)}m)`);
        }
    }
    return res.json({ ok: true, inside });
});
app.listen(PORT, () => {
    console.log(`Guardian Band server listening on :${PORT}`);
});
