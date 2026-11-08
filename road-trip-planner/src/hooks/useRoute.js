import { useCallback, useRef, useState } from "react";
import tollData from "../data/tolls.json";
import { fetchRoute, geocode } from "../services/ors";
import {
  TOLL_MATCH_TOLERANCE_KM,
  matchTollsToRoute,
  measureTolls,
  tolledDistanceKm,
  tolledSegmentsFromExtras,
} from "../utils/geo";

const NO_TOLLS = []; // shared, so the toll-free route keeps a stable identity

// Converts an ORS feature into our route shape (one way, no costs yet).
// Costs are derived later from the current settings, so changing fuel price,
// passengers, vehicle or round trip updates instantly without a new search.
function toRoute(feature, { detectTolls }) {
  const coords = feature.geometry.coordinates.map(([lng, lat]) => [lat, lng]); // Leaflet order
  const route = {
    coords,
    distanceKm: feature.properties.summary.distance / 1000,
    durationMin: feature.properties.summary.duration / 60,
    tolls: NO_TOLLS,
    tollKm: 0, // km of toll road according to the routing data
    tollWarning: null,
  };
  if (!detectTolls) return route;

  // ORS tells us which stretches are toll roads; only match plazas against those.
  const tolledSegments = tolledSegmentsFromExtras(
    feature.properties.extras?.tollways?.values,
    coords.length
  );
  route.tollKm = tolledDistanceKm(coords, tolledSegments);
  route.tolls = matchTollsToRoute(tollData, coords, { tolledSegments });

  // Don't silently show "no tolls" when we know the route uses a toll road.
  if (route.tollKm >= 1 && route.tolls.length === 0) {
    route.tollWarning =
      `This route uses about ${Math.round(route.tollKm)} km of toll road, but none of the ` +
      "toll stations in our data matched it, so toll costs are missing from the totals.";
  }

  if (import.meta.env.DEV) {
    console.groupCollapsed(
      `[tolls] ${route.tolls.length} matched, ${route.tollKm.toFixed(1)} km of toll road flagged by ORS`
    );
    console.table(
      measureTolls(tollData, coords, { tolledSegments })
        .sort((a, b) => a.offRouteKm - b.offRouteKm)
        .slice(0, 10)
        .map((t) => ({
          name: t.name,
          distanceToTollRoadKm: Number.isFinite(t.offRouteKm) ? +t.offRouteKm.toFixed(2) : "far",
          matched: t.offRouteKm <= TOLL_MATCH_TOLERANCE_KM,
        }))
    );
    console.groupEnd();
  }
  return route;
}

// Owns the search flow. `routes` = { start, end, fast, free, freeError }
//  - fast: the default fastest route (with tolls, if any)
//  - free: a toll-free alternative, only requested when `fast` actually uses toll roads
export function useRoute() {
  const [routes, setRoutes] = useState(null);
  const [selectedId, setSelectedId] = useState("fast"); // "fast" | "free"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const requestId = useRef(0); // ignore responses from superseded searches

  const clearError = useCallback(() => setError(null), []);

  const search = useCallback(async ({ start, end, startCoords, endCoords }) => {
    setError(null);
    if (!start.trim() || !end.trim()) {
      setError("Please enter both a start location and a destination.");
      return;
    }

    const id = ++requestId.current;
    setLoading(true);
    setRoutes(null);
    setSelectedId("fast");

    try {
      const sCoords = startCoords ?? (await geocode(start));
      if (!sCoords) throw new Error(`Couldn't find "${start}". Try a more specific place name.`);
      const eCoords = endCoords ?? (await geocode(end));
      if (!eCoords) throw new Error(`Couldn't find "${end}". Try a more specific place name.`);

      const fast = toRoute(await fetchRoute(sCoords, eCoords, { withTollInfo: true }), {
        detectTolls: true,
      });

      // Only spend a second API request when the route actually uses toll roads
      let free = null;
      let freeError = null;
      if (fast.tolls.length > 0 || fast.tollKm >= 1) {
        try {
          free = toRoute(await fetchRoute(sCoords, eCoords, { avoidTolls: true }), {
            detectTolls: false, // ORS already avoided tollways
          });
        } catch (err) {
          console.error(err);
          freeError = err.message;
        }
      }

      if (id !== requestId.current) return;
      setRoutes({ start, end, fast, free, freeError });
    } catch (err) {
      if (id !== requestId.current) return;
      console.error(err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, []);

  return { routes, selectedId, setSelectedId, loading, error, search, clearError };
}