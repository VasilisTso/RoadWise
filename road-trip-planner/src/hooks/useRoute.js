import { useCallback, useRef, useState } from "react";
import tollData from "../data/tolls.json";
import { fetchRoute, geocode } from "../services/ors";
import { getTollsOnRoute } from "../utils/geo";
import { calculateCosts } from "../utils/costs";

// Owns everything about a route search: loading, error and the single `result`
// object that the map, toll list and summary all read from.
export function useRoute() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const requestId = useRef(0); // ignore responses from superseded searches

  const clearError = useCallback(() => setError(null), []);

  const search = useCallback(async (params) => {
    const {
      start, end, startCoords, endCoords,
      avoidTolls, vehicle, fuelPrice, consumption, passengers,
    } = params;

    setError(null);
    if (!start.trim() || !end.trim()) {
      setError("Please enter both a start location and a destination.");
      return;
    }

    const id = ++requestId.current;
    setLoading(true);
    setResult(null);

    try {
      // Prefer coordinates from a selected suggestion; otherwise geocode the text.
      const sCoords = startCoords ?? (await geocode(start));
      if (!sCoords) throw new Error(`Couldn't find "${start}". Try a more specific place name.`);
      const eCoords = endCoords ?? (await geocode(end));
      if (!eCoords) throw new Error(`Couldn't find "${end}". Try a more specific place name.`);

      const feature = await fetchRoute(sCoords, eCoords, { avoidTolls });

      // ORS gives [lng, lat]; Leaflet wants [lat, lng]
      const coords = feature.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
      const distanceKm = feature.properties.summary.distance / 1000;
      const durationMin = feature.properties.summary.duration / 60;
      const tolls = avoidTolls ? [] : getTollsOnRoute(tollData, coords);
      const costs = calculateCosts({ distanceKm, consumption, fuelPrice, tolls, vehicle, passengers });

      if (id !== requestId.current) return;
      setResult({ start, end, avoidTolls, vehicle, coords, tolls, distanceKm, durationMin, ...costs });
    } catch (err) {
      if (id !== requestId.current) return;
      console.error(err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, []);

  return { result, loading, error, search, clearError };
}