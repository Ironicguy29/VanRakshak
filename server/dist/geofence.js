export function pointInCircle(lat, lon, clat, clon, radiusMeters) {
    const d = haversineMeters(lat, lon, clat, clon);
    return d <= radiusMeters;
}
export function pointInPolygon(lat, lon, points) {
    // Ray-casting algorithm
    let inside = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        const xi = points[i].lat, yi = points[i].lon;
        const xj = points[j].lat, yj = points[j].lon;
        const intersect = yi > lon !== yj > lon && lat < ((xj - xi) * (lon - yi)) / (yj - yi) + xi;
        if (intersect)
            inside = !inside;
    }
    return inside;
}
export function haversineMeters(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
export function isInsideGeofence(lat, lon, fence) {
    if (fence.type === 'circle') {
        return pointInCircle(lat, lon, fence.center.lat, fence.center.lon, fence.radiusMeters);
    }
    return pointInPolygon(lat, lon, fence.points);
}
export function distanceToGeofenceMeters(lat, lon, fence) {
    if (fence.type === 'circle') {
        const d = haversineMeters(lat, lon, fence.center.lat, fence.center.lon);
        return Math.max(0, d - fence.radiusMeters);
    }
    // For polygon, return 0 if inside; else min distance to edges (approx via dense sampling)
    if (pointInPolygon(lat, lon, fence.points))
        return 0;
    let min = Number.POSITIVE_INFINITY;
    for (let i = 0; i < fence.points.length; i++) {
        const a = fence.points[i];
        const b = fence.points[(i + 1) % fence.points.length];
        // coarse sample along edge
        for (let t = 0; t <= 10; t++) {
            const pLat = a.lat + ((b.lat - a.lat) * t) / 10;
            const pLon = a.lon + ((b.lon - a.lon) * t) / 10;
            const d = haversineMeters(lat, lon, pLat, pLon);
            if (d < min)
                min = d;
        }
    }
    return min;
}
