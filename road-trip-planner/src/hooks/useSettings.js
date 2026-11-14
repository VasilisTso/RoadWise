import { useCallback, useEffect, useState } from "react";
import { FUEL_TYPES, defaultConsumption, supportsFuel } from "../data/fuel";

const STORAGE_KEY = "roadwise:settings:v1";

const VEHICLES = ["car", "bike"];

const DEFAULTS = {
  vehicle: "car",
  fuelType: "petrol",
  fuelPrice: FUEL_TYPES.petrol.defaultPrice,
  consumption: defaultConsumption("car", "petrol"),
  passengers: 1,
  avoidTolls: false,
  roundTrip: false,
  breaks: false,
};

// Fixes combinations that can't exist (e.g. a diesel motorbike)
function normalize(settings) {
  const s = { ...settings };
  if (!VEHICLES.includes(s.vehicle)) s.vehicle = DEFAULTS.vehicle;
  if (!(s.fuelType in FUEL_TYPES)) s.fuelType = DEFAULTS.fuelType;
  if (!supportsFuel(s.vehicle, s.fuelType)) {
    s.fuelType = "petrol";
    s.fuelPrice = FUEL_TYPES.petrol.defaultPrice;
    s.consumption = defaultConsumption(s.vehicle, "petrol");
  }
  return s;
}

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    if (!saved || typeof saved !== "object") return DEFAULTS;
    const settings = { ...DEFAULTS };
    for (const key of Object.keys(DEFAULTS)) {
      const ok =
        typeof saved[key] === typeof DEFAULTS[key] &&
        (typeof saved[key] !== "number" || Number.isFinite(saved[key]));
      if (ok) settings[key] = saved[key];
    }
    return normalize(settings);
  } catch {
    return DEFAULTS; // storage unavailable or corrupted JSON
  }
}

// Applies one change, keeping price and consumption sensible for the vehicle + energy type
export function applySetting(prev, key, value) {
  const next = { ...prev, [key]: value };

  if (key === "vehicle") {
    if (!supportsFuel(value, prev.fuelType)) {
      next.fuelType = "petrol";
      next.fuelPrice = FUEL_TYPES.petrol.defaultPrice;
      next.consumption = defaultConsumption(value, "petrol");
    } else if (prev.consumption === defaultConsumption(prev.vehicle, prev.fuelType)) {
      // never customised: follow the new vehicle's default
      next.consumption = defaultConsumption(value, prev.fuelType);
    }
  }

  if (key === "fuelType" && value !== prev.fuelType) {
    // units change (L ⇄ kWh), so old numbers mean nothing for the new type
    next.fuelPrice = FUEL_TYPES[value].defaultPrice;
    next.consumption = defaultConsumption(prev.vehicle, value);
  }

  return normalize(next);
}

// Trip settings, remembered between visits (locations are intentionally not saved).
// `overrides` (e.g. from a shared link's URL params) take precedence over stored values.
export function useSettings(overrides) {
  const [settings, setSettings] = useState(() => {
    let s = load();
    // vehicle / energy type first, so their defaults apply before explicit price & consumption
    if (overrides?.vehicle) s = applySetting(s, "vehicle", overrides.vehicle);
    if (overrides?.fuelType) s = applySetting(s, "fuelType", overrides.fuelType);
    return normalize({ ...s, ...overrides });
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* private mode / quota: settings just won't persist */
    }
  }, [settings]);

  const updateSetting = useCallback((key, value) => {
    setSettings((prev) => applySetting(prev, key, value));
  }, []);

  // Several keys at once (restoring a saved trip)
  const updateSettings = useCallback((patch) => {
    setSettings((prev) => {
      let next = prev;
      for (const [key, value] of Object.entries(patch)) next = applySetting(next, key, value);
      return next;
    });
  }, []);

  return { settings, updateSetting, updateSettings };
}
