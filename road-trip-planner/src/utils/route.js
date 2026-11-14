import { getDistanceFromLatLonInKm, getTollsOnRoute, tolledSegmentsFromExtras } from "./geo";

// Cumulative km at each vertex of a [lat, lng] polyline
export function cumulativeKm(coords) {
  const out = new Array(coords.length);
  out[0] = 0;
  for (let i = 1; i < coords.length; i++) {
    out[i] = out[i - 1] + getDistanceFromLatLonInKm(...coords[i - 1], ...coords[i]);
  }
  return out;
}

// Km along the route at a fractional vertex index (e.g. a toll's routeOrder)
export function kmAtOrder(cumKm, order) {
  const i = Math.max(0, Math.min(cumKm.length - 1, Math.floor(order)));
  const next = Math.min(cumKm.length - 1, i + 1);
  return cumKm[i] + (cumKm[next] - cumKm[i]) * (order - i);
}

/**
 * Splits a route into legs (start → stop → … → destination).
 * ORS `way_points` are the vertex indexes of each requested point. `segments` carry each
 * leg's distance/duration when ORS sends them; otherwise the totals are split by geometry.
 */
function buildLegs(feature, cumKm, totalKm, totalMin) {
  const props = feature.properties ?? {};
  const last = cumKm.length - 1;
  const wayPoints =
    Array.isArray(props.way_points) && props.way_points.length >= 2 ? props.way_points : [0, last];
  const segments = Array.isArray(props.segments) ? props.segments : null;
  const geoTotal = cumKm[last] || 1;

  const legs = [];
  for (let i = 0; i < wayPoints.length - 1; i++) {
    const from = wayPoints[i];
    const to = wayPoints[i + 1];
    const seg = segments?.length === wayPoints.length - 1 ? segments[i] : null;
    const share = (cumKm[to] - cumKm[from]) / geoTotal;
    legs.push({
      from,
      to,
      distanceKm: seg ? seg.distance / 1000 : totalKm * share,
      durationMin: seg ? seg.duration / 60 : totalMin * share,
    });
  }
  return legs;
}

// Index of the leg a fractional vertex index falls in
export function legIndexAt(legs, order) {
  const i = legs.findIndex((leg) => order <= leg.to);
  return i === -1 ? legs.length - 1 : i;
}

// One ORS GeoJSON feature → coords, totals, legs, and (optionally) the toll booths on it
export function parseRouteFeature(feature, { tollData, includeTolls }) {
  // ORS gives [lng, lat]; Leaflet wants [lat, lng]
  const coords = feature.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
  const distanceKm = feature.properties.summary.distance / 1000;
  const durationMin = feature.properties.summary.duration / 60;
  const cumKm = cumulativeKm(coords);
  const legs = buildLegs(feature, cumKm, distanceKm, durationMin);

  const tollValues = feature.properties?.extras?.tollways?.values;
  const tolledSegments = tolledSegmentsFromExtras(tollValues, coords.length);
  const tolls = includeTolls
    ? getTollsOnRoute(tollData, coords, { tolledSegments }).map((t) => ({
        ...t,
        leg: legIndexAt(legs, t.routeOrder),
      }))
    : [];

  return { coords, cumKm, distanceKm, durationMin, legs, tolls };
}
