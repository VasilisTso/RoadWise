import { useCallback, useEffect, useState } from "react";
import { shortPlace } from "../utils/labels";

const STORAGE_KEY = "roadwise:trips:v1";
const MAX_RECENT = 8; // unstarred trips kept; starred ones are never dropped

const isCoord = (c) => Array.isArray(c) && c.length === 2 && c.every(Number.isFinite);

function valid(trip) {
  return (
    trip &&
    typeof trip.id === "string" &&
    Array.isArray(trip.waypoints) &&
    trip.waypoints.length >= 2 &&
    trip.waypoints.every((w) => typeof w.label === "string" && isCoord(w.coords))
  );
}

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(saved) ? saved.filter(valid) : [];
  } catch {
    return [];
  }
}

// Same places in the same order = same trip (coords rounded so tiny geocoder drift matches)
const tripKey = (waypoints) =>
  waypoints.map((w) => w.coords.map((n) => n.toFixed(3)).join(",")).join(";");

function prune(trips) {
  let recent = 0;
  return trips.filter((t) => t.starred || ++recent <= MAX_RECENT);
}

/**
 * Saved & recent trips in localStorage. Each trip:
 * { id, key, waypoints: [{label, coords}], name, starred, savedAt, distanceKm, durationMin }
 */
export function useTripHistory() {
  const [trips, setTrips] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
    } catch {
      /* private mode / quota: history just won't persist */
    }
  }, [trips]);

  // Called after every successful search: moves an existing trip to the top or adds it
  const record = useCallback(({ waypoints, distanceKm, durationMin }) => {
    const clean = waypoints.map(({ label, coords }) => ({ label, coords }));
    const key = tripKey(clean);
    setTrips((list) => {
      const existing = list.find((t) => t.key === key);
      const entry = {
        id: existing?.id ?? `t${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
        key,
        waypoints: clean,
        name: existing?.name ?? "",
        starred: existing?.starred ?? false,
        savedAt: Date.now(),
        distanceKm,
        durationMin,
      };
      return prune([entry, ...list.filter((t) => t.key !== key)]);
    });
  }, []);

  const toggleStar = useCallback((id) => {
    setTrips((list) => prune(list.map((t) => (t.id === id ? { ...t, starred: !t.starred } : t))));
  }, []);

  const rename = useCallback((id, name) => {
    setTrips((list) => list.map((t) => (t.id === id ? { ...t, name: name.trim() } : t)));
  }, []);

  const remove = useCallback((id) => {
    setTrips((list) => list.filter((t) => t.id !== id));
  }, []);

  return { trips, record, toggleStar, rename, remove };
}

// "Athens → Thessaloniki", "Athens → Thessaloniki via Delphi", "… via 2 stops"
export function tripTitle(trip) {
  if (trip.name) return trip.name;
  const wps = trip.waypoints;
  const ends = `${shortPlace(wps[0].label)} → ${shortPlace(wps[wps.length - 1].label)}`;
  const stops = wps.length - 2;
  if (stops === 0) return ends;
  return stops === 1 ? `${ends} via ${shortPlace(wps[1].label)}` : `${ends} via ${stops} stops`;
}
