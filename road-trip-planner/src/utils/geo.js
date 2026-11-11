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

export const TOLL_MATCH_TOLERANCE_KM = 3.5;

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

function projectPointOntoSegment(pLat, pLng, aLat, aLng, bLat, bLng) {
  const cosLat = Math.cos(((aLat + bLat + pLat) / 3) * DEG);

  const bx = (bLng - aLng) * DEG * cosLat * R;
  const by = (bLat - aLat) * DEG * R;
  const px = (pLng - aLng) * DEG * cosLat * R;
  const py = (pLat - aLat) * DEG * R;

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

// Matches tolls using perpendicular point-to-segment distance, snaps their coordinates
// directly onto the route polyline, and orders them chronologically (Origin -> Destination).
export function getTollsOnRoute(
  tolls,
  routeCoords,
  { defaultRadiusKm = 4.5, tolledSegments = null } = {}
) {
  if (!Array.isArray(routeCoords) || routeCoords.length < 2) return [];

  const matched = [];

  for (const toll of tolls) {
    const maxRadiusKm = toll.type === "ramp" ? 1.2 : defaultRadiusKm;

    let minDist = Infinity;
    let bestProgress = Infinity;
    let bestLat = toll.lat;
    let bestLng = toll.lng;

    for (let i = 0; i < routeCoords.length - 1; i++) {
      // If ORS provided tollway segment flags, only match segments flagged as tollways
      if (tolledSegments && !tolledSegments[i]) continue;

      const [aLat, aLng] = routeCoords[i];
      const [bLat, bLng] = routeCoords[i + 1];

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
        lat: bestLat,
        lng: bestLng,
        rawLat: toll.lat,
        rawLng: toll.lng,
        routeOrder: bestProgress,
      });
    }
  }

  matched.sort((a, b) => a.routeOrder - b.routeOrder);
  return matched;
}