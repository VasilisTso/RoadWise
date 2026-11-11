export function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Projects point P(pLat, pLng) onto segment A(aLat, aLng) -> B(bLat, bLng) using a local
// equirectangular tangent plane (accurate to <1m over short highway segments).
function pointToSegmentDistanceKm(pLat, pLng, aLat, aLng, bLat, bLng) {
  const R = 6371;
  const rad = Math.PI / 180;
  const cosLat = Math.cos(((aLat + bLat + pLat) / 3) * rad);

  const ax = 0;
  const ay = 0;
  const bx = (bLng - aLng) * rad * cosLat * R;
  const by = (bLat - aLat) * rad * R;
  const px = (pLng - aLng) * rad * cosLat * R;
  const py = (pLat - aLat) * rad * R;

  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;

  let t = 0;
  if (lenSq > 0) {
    t = ((px - ax) * dx + (py - ay) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
  }

  const projX = ax + t * dx;
  const projY = ay + t * dy;
  const distKm = Math.hypot(px - projX, py - projY);

  return { distKm, t };
}

// routeCoords: [[lat, lng], ...]
// Matches tolls using perpendicular point-to-segment distance and orders them
// chronologically from Origin -> Destination along the polyline.
export function getTollsOnRoute(tolls, routeCoords, defaultRadiusKm = 0.45) {
  if (!Array.isArray(routeCoords) || routeCoords.length === 0) return [];

  if (routeCoords.length === 1) {
    const [lat, lng] = routeCoords[0];
    return tolls.filter((t) => getDistanceFromLatLonInKm(lat, lng, t.lat, t.lng) < defaultRadiusKm);
  }

  const matched = [];

  for (const toll of tolls) {
    // Lateral entry/exit ramps sit right next to the mainline; use a tighter radius
    // so through-traffic on the highway isn't billed for exit ramps it didn't take.
    const maxRadiusKm = toll.type === "ramp" ? 0.22 : defaultRadiusKm;

    let minDist = Infinity;
    let bestProgress = Infinity;

    for (let i = 0; i < routeCoords.length - 1; i++) {
      const [aLat, aLng] = routeCoords[i];
      const [bLat, bLng] = routeCoords[i + 1];

      // Fast bounding-box pre-filter (~0.02 deg is ~2.2km) to skip faraway segments
      const minLat = Math.min(aLat, bLat) - 0.02;
      const maxLat = Math.max(aLat, bLat) + 0.02;
      const minLng = Math.min(aLng, bLng) - 0.02;
      const maxLng = Math.max(aLng, bLng) + 0.02;

      if (toll.lat < minLat || toll.lat > maxLat || toll.lng < minLng || toll.lng > maxLng) {
        continue;
      }

      const { distKm, t } = pointToSegmentDistanceKm(toll.lat, toll.lng, aLat, aLng, bLat, bLng);
      if (distKm < minDist) {
        minDist = distKm;
        bestProgress = i + t;
      }
    }

    if (minDist <= maxRadiusKm) {
      matched.push({
        ...toll,
        routeOrder: bestProgress,
      });
    }
  }

  matched.sort((a, b) => a.routeOrder - b.routeOrder);
  return matched;
}