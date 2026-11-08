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

// routeCoords: [[lat, lng], ...]
// NOTE: still the simple "any route point within radius" check. Phase 3
// replaces this with point-to-segment matching and ordering along the route.
export function getTollsOnRoute(tolls, routeCoords, radiusKm = 5) {
  return tolls.filter((toll) =>
    routeCoords.some(
      ([lat, lng]) => getDistanceFromLatLonInKm(lat, lng, toll.lat, toll.lng) < radiusKm
    )
  );
}