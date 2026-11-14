// Energy types (names in src/i18n under `fuel.<id>`): default price, default consumption per vehicle, and CO₂ factor.
// Prices are typical Greek pump / charger prices: a starting point the user edits.
// CO₂ factors are tank-to-wheel for liquid fuels; EV uses the Greek grid average (an estimate).

export const FUEL_TYPES = {
  petrol: {
    energy: "fuel",
    // keys under `unit.*` in src/i18n
    unit: "L",
    priceUnit: "perL",
    consumptionUnit: "LPer100",
    defaultPrice: 1.85,
    co2PerUnit: 2.31, // kg CO₂ per litre
    consumption: { car: 6.5, bike: 4.0 },
  },
  diesel: {
    energy: "fuel",
    unit: "L",
    priceUnit: "perL",
    consumptionUnit: "LPer100",
    defaultPrice: 1.6,
    co2PerUnit: 2.68,
    consumption: { car: 5.5 }, // no diesel motorbikes
  },
  lpg: {
    energy: "fuel",
    unit: "L",
    priceUnit: "perL",
    consumptionUnit: "LPer100",
    defaultPrice: 0.95,
    co2PerUnit: 1.51,
    consumption: { car: 8.5 },
  },
  ev: {
    energy: "electricity",
    unit: "kWh",
    priceUnit: "perKWh",
    consumptionUnit: "kWhPer100",
    defaultPrice: 0.35,
    co2PerUnit: 0.35, // kg CO₂ per kWh, Greek grid average (estimate)
    consumption: { car: 17, bike: 7 },
  },
};

export const FUEL_IDS = Object.keys(FUEL_TYPES);

export const fuelOptionsFor = (vehicle) =>
  FUEL_IDS.filter((id) => FUEL_TYPES[id].consumption[vehicle] != null);

export const supportsFuel = (vehicle, fuelType) =>
  FUEL_TYPES[fuelType]?.consumption[vehicle] != null;

export const defaultConsumption = (vehicle, fuelType) =>
  FUEL_TYPES[fuelType]?.consumption[vehicle] ?? FUEL_TYPES.petrol.consumption[vehicle];
