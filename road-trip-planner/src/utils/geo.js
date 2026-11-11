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
// equirectangular tangent plane. Returns perpendicular distance in km, progress t in [0, 1],
// and the exact [snappedLat, snappedLng] point on the highway segment.
function projectPointOntoSegment(pLat, pLng, aLat, aLng, bLat, bLng) {
  const R = 6371;
  const rad = Math.PI / 180;
  const cosLat = Math.cos(((aLat + bLat + pLat) / 3) * rad);

  const bx = (bLng - aLng) * rad * cosLat * R;
  const by = (bLat - aLat) * rad * R;
  const px = (pLng - aLng) * rad * cosLat * R;
  const py = (pLat - aLat) * rad * R;

  const lenSq = bx * bx + by * by;

  let t = 0;
  if (lenSq > 0) {
    t = (px * bx + py * by) / lenSq;
    t = Math.max(0, Math.min(1, t));
  }

  const projX = t * bx;
  const projY = t * by;
  const distKm = Math.hypot(px - projX, py - projY);

  const snappedLat = aLat + t * (bLat - aLat);
  const snappedLng = aLng + t * (bLng - aLng);

  return { distKm, t, snappedLat, snappedLng };
}

// routeCoords: [[lat, lng], ...]
// Matches tolls using perpendicular point-to-segment distance, snaps their coordinates
// directly onto the route polyline, and orders them chronologically (Origin -> Destination).
export function getTollsOnRoute(tolls, routeCoords, defaultRadiusKm = 4.5) {
  if (!Array.isArray(routeCoords) || routeCoords.length === 0) return [];

  if (routeCoords.length === 1) {
    const [lat, lng] = routeCoords[0];
    return tolls
      .filter((t) => getDistanceFromLatLonInKm(lat, lng, t.lat, t.lng) <= defaultRadiusKm)
      .map((t) => ({ ...t, lat, lng }));
  }

  const matched = [];

  for (const toll of tolls) {
    const maxRadiusKm = toll.type === "ramp" ? 1.2 : defaultRadiusKm;

    let minDist = Infinity;
    let bestProgress = Infinity;
    let bestLat = toll.lat;
    let bestLng = toll.lng;

    for (let i = 0; i < routeCoords.length - 1; i++) {
      const [aLat, aLng] = routeCoords[i];
      const [bLat, bLng] = routeCoords[i + 1];

      // Generous bounding-box pre-filter (~0.08 deg is ~8.8 km)
      const minLat = Math.min(aLat, bLat) - 0.08;
      const maxLat = Math.max(aLat, bLat) + 0.08;
      const minLng = Math.min(aLng, bLng) - 0.08;
      const maxLng = Math.max(aLng, bLng) + 0.08;

      if (
        toll.lat < minLat ||
        toll.lat > maxLat ||
        toll.lng < minLng ||
        toll.lng > maxLng
      ) {
        continue;
      }

      const { distKm, t, snappedLat, snappedLng } = projectPointOntoSegment(
        toll.lat,
        toll.lng,
        aLat,
        aLng,
        bLat,
        bLng
      );

      if (distKm < minDist) {
        minDist = distKm;
        bestProgress = i + t;
        bestLat = snappedLat;
        bestLng = snappedLng;
      }
    }

    if (minDist <= maxRadiusKm) {
      matched.push({
        ...toll,
        // Override lat/lng with the exact snapped point on the highway polyline!
        lat: bestLat,
        lng: bestLng,
        rawLat: toll.lat,
        rawLng: toll.lng,
        routeOrder: bestProgress,
      });
    }
  }

  // Sort chronologically along the driving route from Origin -> Destination
  matched.sort((a, b) => a.routeOrder - b.routeOrder);
  return matched;
}