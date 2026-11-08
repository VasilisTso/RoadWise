import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "roadwise:settings:v1";

// Typical consumption (L/100km) used when switching vehicle
export const DEFAULT_CONSUMPTION = { car: 6.5, bike: 4.0 };

const DEFAULTS = {
  vehicle: "car",
  fuelPrice: 1.8,
  consumption: DEFAULT_CONSUMPTION.car,
  passengers: 1,
  roundTrip: false,
};

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
    if (!(settings.vehicle in DEFAULT_CONSUMPTION)) settings.vehicle = DEFAULTS.vehicle;
    return settings;
  } catch {
    return DEFAULTS; // storage unavailable or corrupted JSON
  }
}

// Trip settings, remembered between visits (locations are intentionally not saved).
export function useSettings() {
  const [settings, setSettings] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* private mode / quota: settings just won't persist */
    }
  }, [settings]);

  const updateSetting = useCallback((key, value) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      // If the user never customised consumption, follow the vehicle's default
      if (key === "vehicle" && prev.consumption === DEFAULT_CONSUMPTION[prev.vehicle]) {
        next.consumption = DEFAULT_CONSUMPTION[value];
      }
      return next;
    });
  }, []);

  return { settings, updateSetting };
}