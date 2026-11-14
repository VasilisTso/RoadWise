import { useCallback, useRef, useState } from "react";
import tollData from "../data/tolls.json";
import { fetchRoute, geocode } from "../services/ors";
import { parseRouteFeature } from "../utils/route";

export function useRoute() {
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const requestId = useRef(0);

  const clearError = useCallback(() => setError(null), []);

  /**
   * `waypoints`: [{ label, coords? }] in driving order. Empty stops in the middle are skipped;
   * places typed without picking a suggestion are geocoded first.
   */
  const search = useCallback(async (waypoints) => {
    setError(null);
    const first = waypoints[0];
    const last = waypoints[waypoints.length - 1];
    if (!first?.label.trim() || !last?.label.trim() || waypoints.length < 2) {
      setError("Add where you start and where you're going.");
      return null;
    }
    const points = waypoints.filter((w) => w.label.trim());

    const id = ++requestId.current;
    setLoading(true);

    try {
      const located = await Promise.all(
        points.map(async (w) => {
          const coords = w.coords ?? (await geocode(w.label));
          if (!coords) throw new Error(`Couldn't find "${w.label}". Try a more specific place name.`);
          return { ...w, coords };
        })
      );
      const coordsList = located.map((w) => w.coords);

      // Fetch both With-Tolls and Toll-Free routes in parallel
      const [tollSettled, freeSettled] = await Promise.allSettled([
        fetchRoute(coordsList, { avoidTolls: false, withTollInfo: true }),
        fetchRoute(coordsList, { avoidTolls: true, withTollInfo: false }),
      ]);

      if (id !== requestId.current) return null;

      if (tollSettled.status === "rejected" && freeSettled.status === "rejected") {
        throw tollSettled.reason || new Error("No route was found between these places.");
      }

      const withTolls =
        tollSettled.status === "fulfilled"
          ? parseRouteFeature(tollSettled.value, { tollData, includeTolls: true })
          : null;
      const withoutTolls =
        freeSettled.status === "fulfilled"
          ? parseRouteFeature(freeSettled.value, { tollData, includeTolls: false })
          : null;

      const payload = {
        waypoints: located,
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
