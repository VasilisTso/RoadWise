import { useCallback, useRef, useState } from "react";
import tollData from "../data/tolls.json";
import { fetchRoute, geocode } from "../services/ors";
import { getTollsOnRoute, tolledSegmentsFromExtras } from "../utils/geo";

function parseFeature(feature, includeTolls) {
  // ORS gives [lng, lat]; Leaflet wants [lat, lng]
  const coords = feature.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
  const distanceKm = feature.properties.summary.distance / 1000;
  const durationMin = feature.properties.summary.duration / 60;

  const tollValues = feature.properties?.extras?.tollways?.values;
  const tolledSegments = tolledSegmentsFromExtras(tollValues, coords.length);

  const tolls = includeTolls
    ? getTollsOnRoute(tollData, coords, { tolledSegments })
    : [];

  return { coords, distanceKm, durationMin, tolls };
}

export function useRoute() {
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const requestId = useRef(0);

  const clearError = useCallback(() => setError(null), []);

  const search = useCallback(async ({ start, end, startCoords, endCoords }) => {
    setError(null);
    if (!start.trim() || !end.trim()) {
      setError("Please enter both a start location and a destination.");
      return null;
    }

    const id = ++requestId.current;
    setLoading(true);

    try {
      const sCoords = startCoords ?? (await geocode(start));
      if (!sCoords) throw new Error(`Couldn't find "${start}". Try a more specific place name.`);

      const eCoords = endCoords ?? (await geocode(end));
      if (!eCoords) throw new Error(`Couldn't find "${end}". Try a more specific place name.`);

      // Fetch both With-Tolls and Toll-Free routes in parallel
      const [tollSettled, freeSettled] = await Promise.allSettled([
        fetchRoute(sCoords, eCoords, { avoidTolls: false, withTollInfo: true }),
        fetchRoute(sCoords, eCoords, { avoidTolls: true, withTollInfo: false }),
      ]);

      if (id !== requestId.current) return null;

      if (tollSettled.status === "rejected" && freeSettled.status === "rejected") {
        throw tollSettled.reason || new Error("No route was found between these locations.");
      }

      const withTolls =
        tollSettled.status === "fulfilled" ? parseFeature(tollSettled.value, true) : null;
      const withoutTolls =
        freeSettled.status === "fulfilled" ? parseFeature(freeSettled.value, false) : null;

      const payload = {
        start,
        end,
        startCoords: sCoords,
        endCoords: eCoords,
        withTolls: withTolls ?? withoutTolls,
        withoutTolls: withoutTolls ?? withTolls,
      };

      setRouteData(payload);
      return payload;
    } catch (err) {
      if (id !== requestId.current) return null;
      console.error(err);
      setError(err.message || "Something went wrong. Please try again.");
      return null;
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, []);

  return { routeData, loading, error, search, clearError };
}