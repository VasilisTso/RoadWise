import { FUEL_TYPES } from "../data/fuel";

/**
 * Energy (fuel or charging) + tolls for one route, and the CO₂ estimate.
 * `consumption` is per 100 km in the fuel type's unit (L or kWh); `fuelPrice` is € per unit.
 */
export function calculateCosts({
  distanceKm,
  durationMin = 0,
  consumption,
  fuelPrice,
  fuelType = "petrol",
  tolls,
  vehicle,
  passengers,
  roundTrip = false,
}) {
  const fuel = FUEL_TYPES[fuelType] ?? FUEL_TYPES.petrol;
  const multiplier = roundTrip ? 2 : 1;
  const effectiveDistanceKm = distanceKm * multiplier;
  const effectiveDurationMin = durationMin * multiplier;

  const oneWayTollCost = tolls.reduce((sum, t) => sum + (t[vehicle] ?? 0), 0);
  const tollCost = oneWayTollCost * multiplier;
  const energyUsed = (effectiveDistanceKm * consumption) / 100; // L or kWh
  const energyCost = energyUsed * fuelPrice;
  const totalCost = energyCost + tollCost;
  const safePassengers = Math.max(1, Number(passengers) || 1);
  const perPassenger = totalCost / safePassengers;
  const co2Kg = energyUsed * fuel.co2PerUnit;

  return {
    multiplier,
    effectiveDistanceKm,
    effectiveDurationMin,
    energyUsed,
    energyCost,
    tollCost,
    totalCost,
    perPassenger,
    co2Kg,
    co2PerPassenger: co2Kg / safePassengers,
  };
}
