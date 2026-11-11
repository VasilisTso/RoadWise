const R = 6371; // Earth radius, km
const DEG = Math.PI / 180;

export function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const dLat = (lat2 - lat1) * DEG;
  const dLon = (lon2 - lon1) * DEG;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * DEG) * Math.cos(lat2 * DEG) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// A toll counts as "on the route" if it is within this distance of the toll road.
// 3 km tolerates imprecise plaza coordinates (e.g. a town centre instead of the
// plaza itself). Once tolls.json holds exact plaza positions this can go back to ~1.
export const TOLL_MATCH_TOLERANCE_KM = 3;
const SEARCH_LIMIT_KM = 25; // beyond this we don't bother measuring

/**
 * OpenRouteService `extras.tollways.values` is a list of [fromIdx, toIdx, flag]
 * over route vertices (flag 1 = toll road). Converts it to one boolean per
 * segment (segment i joins vertex i and i+1). Returns null if nothing is tolled.
 */
export function tolledSegmentsFromExtras(values, vertexCount) {
  if (!Array.isArray(values) || vertexCount < 2) return null;
  const flags = new Array(vertexCount - 1).fill(false);
  let any = false;
  for (const [from, to, flag] of values) {
    if (flag !== 1) continue;
    for (let i = from; i < to && i < flags.length; i++) {
      flags[i] = true;
      any = true;
    }
  }
  return any ? flags : null;
}

// Length (km) of the tolled part of the route
export function tolledDistanceKm(routeCoords, tolledSegments) {
  if (!tolledSegments) return 0;
  let km = 0;
  for (let i = 0; i < tolledSegments.length; i++) {
    if (tolledSegments[i]) {
      km += getDistanceFromLatLonInKm(...routeCoords[i], ...routeCoords[i + 1]);
    }
  }
  return km;
}

/**
 * For every toll: distance (km) to the nearest route segment and how far along
 * the route that point is. If `tolledSegments` is given, only toll-road segments
 * are considered, so a plaza next to a *free* parallel road won't match.
 * routeCoords: [[lat, lng], ...]. Uses a local flat projection (fine over Greece).
 * Returns [{ ...toll, offRouteKm, distanceAlongKm }]  (offRouteKm = Infinity if far/none)
 */
export function measureTolls(tolls, routeCoords, { tolledSegments = null } = {}) {
  if (!routeCoords || routeCoords.length < 2) return [];

  const meanLat = routeCoords.reduce((sum, [lat]) => sum + lat, 0) / routeCoords.length;
  const cosLat = Math.cos(meanLat * DEG);
  const project = (lat, lng) => [lng * DEG * R * cosLat, lat * DEG * R];

  const pts = routeCoords.map(([lat, lng]) => project(lat, lng));
  const cum = [0]; // cumulative km along the whole route
  for (let i = 1; i < pts.length; i++) {
    cum[i] = cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  }

  return tolls.map((toll) => {
    const [px, py] = project(toll.lat, toll.lng);
    let bestDist = Infinity;
    let bestAlong = 0;

    for (let i = 0; i < pts.length - 1; i++) {
      if (tolledSegments && !tolledSegments[i]) continue;
      const [ax, ay] = pts[i];
      const [bx, by] = pts[i + 1];

      if (
        px < Math.min(ax, bx) - SEARCH_LIMIT_KM || px > Math.max(ax, bx) + SEARCH_LIMIT_KM ||
        py < Math.min(ay, by) - SEARCH_LIMIT_KM || py > Math.max(ay, by) + SEARCH_LIMIT_KM
      ) continue;

      const dx = bx - ax;
      const dy = by - ay;
      const len2 = dx * dx + dy * dy;
      const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
      const d = Math.hypot(px - (ax + t * dx), py - (ay + t * dy));

      if (d < bestDist) {
        bestDist = d;
        bestAlong = cum[i] + t * Math.sqrt(len2);
      }
    }
    return { ...toll, offRouteKm: bestDist, distanceAlongKm: bestAlong };
  });
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