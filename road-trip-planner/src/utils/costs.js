// Pure function (easy to unit test in Phase 4).
// route: { distanceKm, durationMin, tolls }  (one way)
// settings: { vehicle, fuelPrice, consumption, passengers, roundTrip }
export function calculateTrip(route, { vehicle, fuelPrice, consumption, passengers, roundTrip }) {
  const m = roundTrip ? 2 : 1;
  const distanceKm = route.distanceKm * m;
  const durationMin = route.durationMin * m;
  const tollCost = route.tolls.reduce((sum, t) => sum + (t[vehicle] ?? 0), 0) * m;
  const fuelCost = (distanceKm * consumption * fuelPrice) / 100;
  const totalCost = fuelCost + tollCost;
  const perPassenger = totalCost / Math.max(1, passengers);
  return { distanceKm, durationMin, tollCost, fuelCost, totalCost, perPassenger };
}