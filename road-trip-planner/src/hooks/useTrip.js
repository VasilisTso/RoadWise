import { useCallback, useState } from "react";

export const MIN_WAYPOINTS = 2;
export const MAX_WAYPOINTS = 6;

let nextId = 0;
const newId = () => `wp${++nextId}`;

export const makeWaypoint = (label = "", coords = null) => ({ id: newId(), label, coords });

// Pads / trims a list of { label, coords } into 2–6 waypoints with ids
function toWaypoints(list = []) {
  const wps = list.slice(0, MAX_WAYPOINTS).map((w) => makeWaypoint(w.label ?? "", w.coords ?? null));
  while (wps.length < MIN_WAYPOINTS) wps.push(makeWaypoint());
  return wps;
}

/**
 * The trip being planned: ordered waypoints (start, stops, destination) and the departure.
 * `departAt` is a local "YYYY-MM-DDTHH:mm" string, or null for "leave now".
 */
export function useTrip(initial = {}) {
  const [waypoints, setWaypointsState] = useState(() => toWaypoints(initial.waypoints));
  const [departAt, setDepartAt] = useState(initial.departAt ?? null);

  const update = useCallback((id, patch) => {
    setWaypointsState((list) => list.map((w) => (w.id === id ? { ...w, ...patch } : w)));
  }, []);

  // Typing invalidates the picked coordinates
  const setLabel = useCallback((id, label) => update(id, { label, coords: null }), [update]);
  const select = useCallback((id, { label, coords }) => update(id, { label, coords }), [update]);

  // New stop goes just before the destination
  const addStop = useCallback(() => {
    setWaypointsState((list) =>
      list.length >= MAX_WAYPOINTS ? list : [...list.slice(0, -1), makeWaypoint(), list[list.length - 1]]
    );
  }, []);

  const remove = useCallback((id) => {
    setWaypointsState((list) => (list.length <= MIN_WAYPOINTS ? list : list.filter((w) => w.id !== id)));
  }, []);

  const reorder = useCallback((list) => setWaypointsState(list), []);

  const move = useCallback((id, delta) => {
    setWaypointsState((list) => {
      const from = list.findIndex((w) => w.id === id);
      const to = from + delta;
      if (from === -1 || to < 0 || to >= list.length) return list;
      const next = [...list];
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    });
  }, []);

  const reverse = useCallback(() => setWaypointsState((list) => [...list].reverse()), []);

  // Replace everything, e.g. from a search result (keeps ids when given) or a saved trip
  const setWaypoints = useCallback((list) => {
    setWaypointsState(
      list.every((w) => w.id) && list.length >= MIN_WAYPOINTS ? list.slice(0, MAX_WAYPOINTS) : toWaypoints(list)
    );
  }, []);

  return {
    waypoints,
    departAt,
    setDepartAt,
    setLabel,
    select,
    addStop,
    remove,
    reorder,
    move,
    reverse,
    setWaypoints,
  };
}
