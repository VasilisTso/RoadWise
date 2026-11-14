import { useCallback, useRef, useState } from "react";
import tollData from "../data/tolls.json";
import { AppError, fetchRoute, geocode } from "../services/ors";
import { useI18n } from "../i18n/context";
import { parseRouteFeature } from "../utils/route";

// `error` is { key, vars } for the i18n dictionary, or null
export function useRoute() {
  const { lang } = useI18n();
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
      setError({ key: "errors.missingEnds" });
      return null;
    }
    const points = waypoints.filter((w) => w.label.trim());

    const id = ++requestId.current;
    setLoading(true);

    try {
      const located = await Promise.all(
        points.map(async (w) => {
          const coords = w.coords ?? (await geocode(w.label, { lang }));
          if (!coords) throw new AppError("errors.notFound", { place: w.label });
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
        throw tollSettled.reason || new AppError("errors.noRoute");
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
      setError(err instanceof AppError ? { key: err.key, vars: err.vars } : { key: "errors.generic" });
      return null;
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [lang]);

  return { routeData, loading, error, search, clearError };
}
