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

// Tolls on the route, in driving order, duplicates merged.
export function matchTollsToRoute(
  tolls,
  routeCoords,
  { toleranceKm = TOLL_MATCH_TOLERANCE_KM, tolledSegments = null } = {}
) {
  const matches = measureTolls(tolls, routeCoords, { tolledSegments })
    .filter((t) => t.offRouteKm <= toleranceKm)
    .sort((a, b) => a.distanceAlongKm - b.distanceAlongKm);

  return matches.filter(
    (m, i) => !(i > 0 && m.name === matches[i - 1].name && m.distanceAlongKm - matches[i - 1].distanceAlongKm < 1)
  );
}