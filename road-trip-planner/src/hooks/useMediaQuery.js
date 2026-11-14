import { useCallback, useSyncExternalStore } from "react";

// Live boolean for a CSS media query (e.g. "(min-width: 1024px)")
export function useMediaQuery(query) {
  const subscribe = useCallback(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query]
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false
  );
}

export const DESKTOP_QUERY = "(min-width: 1024px)";
