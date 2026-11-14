import { calculateCosts } from "./costs";
import { kmAtOrder } from "./route";

const BREAK_EVERY_MIN = 120;
const BREAK_MIN = 15;

// Both route options with costs, plus which one is active. Pure: settings changes never refetch.
export function buildComparison(routeData, settings) {
  if (!routeData) return null;

  const buildOption = (branch, isAvoidTolls) => {
    if (!branch) return null;
    const costs = calculateCosts({
      distanceKm: branch.distanceKm,
      durationMin: branch.durationMin,
      consumption: settings.consumption,
      fuelPrice: settings.fuelPrice,
      fuelType: settings.fuelType,
      tolls: branch.tolls,
      vehicle: settings.vehicle,
      passengers: settings.passengers,
      roundTrip: settings.roundTrip,
    });
    return {
      waypoints: routeData.waypoints,
      avoidTolls: isAvoidTolls,
      vehicle: settings.vehicle,
      fuelType: settings.fuelType,
      passengers: settings.passengers,
      roundTrip: settings.roundTrip,
      coords: branch.coords,
      cumKm: branch.cumKm,
      legs: branch.legs,
      tolls: branch.tolls,
      baseDistanceKm: branch.distanceKm,
      baseDurationMin: branch.durationMin,
      distanceKm: costs.effectiveDistanceKm,
      durationMin: costs.effectiveDurationMin,
      ...costs,
    };
  };

  const withTolls = buildOption(routeData.withTolls, false);
  const withoutTolls = buildOption(routeData.withoutTolls, true);
  const active = settings.avoidTolls ? withoutTolls : withTolls;
  const alternative = settings.avoidTolls ? withTolls : withoutTolls;
  return { withTolls, withoutTolls, active, alternative };
}

// Break time taken before reaching a point after `drivingMin` of driving:
// 15 min for every full 2 h, but only once the drive actually continues past it.
export function breakMinutes(drivingMin) {
  return Math.max(0, Math.ceil(drivingMin / BREAK_EVERY_MIN) - 1) * BREAK_MIN;
}

// "YYYY-MM-DDTHH:mm" (local) → Date; null → now
export function departureDate(departAt) {
  if (!departAt) return new Date();
  const d = new Date(departAt);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

// Local "YYYY-MM-DDTHH:mm" for a datetime-local input
export function toLocalInputValue(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

/**
 * One-way timeline of the active route: depart → tolls / stops → arrive, with clock times.
 * Toll times are interpolated by distance inside their leg.
 */
export function buildTimeline(option, { departAt, breaks = false }) {
  const start = departureDate(departAt);
  // Rounded to the minute, so clock times agree with the rounded durations shown
  const at = (drivingMin) =>
    new Date(
      start.getTime() + Math.round(drivingMin + (breaks ? breakMinutes(drivingMin) : 0)) * 60000
    );

  const { legs, cumKm, waypoints } = option;
  const legStartMin = [];
  let acc = 0;
  for (const leg of legs) {
    legStartMin.push(acc);
    acc += leg.durationMin;
  }
  const drivingMin = acc;

  const events = [{ type: "depart", time: start, label: waypoints[0]?.label ?? "", point: 0 }];

  const tollsByLeg = legs.map(() => []);
  option.tolls.forEach((toll, index) => tollsByLeg[toll.leg ?? 0]?.push({ toll, index }));

  legs.forEach((leg, i) => {
    const legKm = cumKm[leg.to] - cumKm[leg.from] || 1;
    for (const { toll, index } of tollsByLeg[i]) {
      const share = Math.min(1, Math.max(0, (kmAtOrder(cumKm, toll.routeOrder) - cumKm[leg.from]) / legKm));
      events.push({ type: "toll", time: at(legStartMin[i] + leg.durationMin * share), toll, index });
    }
    const isLast = i === legs.length - 1;
    events.push({
      type: isLast ? "arrive" : "stop",
      time: at(legStartMin[i] + leg.durationMin),
      label: waypoints[i + 1]?.label ?? "",
      point: i + 1,
      leg,
    });
  });

  return {
    events,
    departure: start,
    arrival: events[events.length - 1].time,
    drivingMin,
    breakMin: breaks ? breakMinutes(drivingMin) : 0,
  };
}
