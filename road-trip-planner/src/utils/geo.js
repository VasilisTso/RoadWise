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

// A toll counts as "on the route" if it is within this distance of the road line.
export const TOLL_MATCH_TOLERANCE_KM = 1;

/**
 * Finds which tolls lie on a route.
 *
 * Instead of checking route *points* (which misses plazas between points and
 * catches parallel roads at 5 km), this measures the distance from each toll to
 * the nearest route *segment*, and records how far along the route it sits so
 * the tolls can be listed in driving order.
 *
 * routeCoords: [[lat, lng], ...]  ->  returns tolls (+ distanceAlongKm, offRouteKm)
 * Uses a local flat projection (accurate to a few % over Greece-sized areas,
 * which is plenty for a ~1 km tolerance). distanceAlongKm is approximate.
 */
export function matchTollsToRoute(tolls, routeCoords, toleranceKm = TOLL_MATCH_TOLERANCE_KM) {
  if (!routeCoords || routeCoords.length < 2) return [];

  const meanLat = routeCoords.reduce((sum, [lat]) => sum + lat, 0) / routeCoords.length;
  const cosLat = Math.cos(meanLat * DEG);
  const project = (lat, lng) => [lng * DEG * R * cosLat, lat * DEG * R];

  const pts = routeCoords.map(([lat, lng]) => project(lat, lng));
  const cum = [0]; // cumulative km along the route at each point
  for (let i = 1; i < pts.length; i++) {
    cum[i] = cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  }

  const matches = [];
  for (const toll of tolls) {
    const [px, py] = project(toll.lat, toll.lng);
    let bestDist = Infinity;
    let bestAlong = 0;

    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, ay] = pts[i];
      const [bx, by] = pts[i + 1];

      // cheap bounding-box skip
      if (
        px < Math.min(ax, bx) - toleranceKm || px > Math.max(ax, bx) + toleranceKm ||
        py < Math.min(ay, by) - toleranceKm || py > Math.max(ay, by) + toleranceKm
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

    if (bestDist <= toleranceKm) {
      matches.push({ ...toll, distanceAlongKm: bestAlong, offRouteKm: bestDist });
    }
  }

  matches.sort((a, b) => a.distanceAlongKm - b.distanceAlongKm);

  // Drop duplicate entries for the same plaza (same name, essentially same spot)
  return matches.filter(
    (m, i) => !(i > 0 && m.name === matches[i - 1].name && m.distanceAlongKm - matches[i - 1].distanceAlongKm < 1)
  );
}