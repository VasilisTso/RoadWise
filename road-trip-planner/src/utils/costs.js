export function calculateCosts({
  distanceKm,
  durationMin = 0,
  consumption,
  fuelPrice,
  tolls,
  vehicle,
  passengers,
  roundTrip = false,
}) {
  const multiplier = roundTrip ? 2 : 1;
  const effectiveDistanceKm = distanceKm * multiplier;
  const effectiveDurationMin = durationMin * multiplier;

  const oneWayTollCost = tolls.reduce((sum, t) => sum + (t[vehicle] ?? 0), 0);
  const tollCost = oneWayTollCost * multiplier;
  const fuelCost = (effectiveDistanceKm * consumption * fuelPrice) / 100;
  const totalCost = fuelCost + tollCost;
  const safePassengers = Math.max(1, Number(passengers) || 1);
  const perPassenger = totalCost / safePassengers;

  return {
    multiplier,
    effectiveDistanceKm,
    effectiveDurationMin,
    fuelCost,
    tollCost,
    totalCost,
    perPassenger,
  };
}