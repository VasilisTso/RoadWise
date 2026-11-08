// Pure function so it can be unit tested later (Phase 4).
export function calculateCosts({ distanceKm, consumption, fuelPrice, tolls, vehicle, passengers }) {
  const tollCost = tolls.reduce((sum, t) => sum + (t[vehicle] ?? 0), 0);
  const fuelCost = (distanceKm * consumption * fuelPrice) / 100;
  const totalCost = fuelCost + tollCost;
  const perPassenger = passengers > 0 ? totalCost / passengers : totalCost;
  return { fuelCost, tollCost, totalCost, perPassenger };
}