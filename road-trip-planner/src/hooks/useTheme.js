import { useCallback, useLayoutEffect, useState } from "react";
import { useMediaQuery } from "./useMediaQuery";

const STORAGE_KEY = "roadwise:theme:v1";
const MODES = ["system", "light", "dark"];

function loadMode() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return MODES.includes(saved) ? saved : "system";
  } catch {
    return "system";
  }
}

// Theme preference: "system" follows the OS; "light"/"dark" set data-theme on <html>.
export function useTheme() {
  const [mode, setMode] = useState(loadMode);
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const resolved = mode === "system" ? (prefersDark ? "dark" : "light") : mode;

  // Layout effect: the attribute is set before child effects read token colours
  useLayoutEffect(() => {
    const root = document.documentElement;
    if (mode === "system") delete root.dataset.theme;
    else root.dataset.theme = mode;
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      /* storage unavailable: preference lasts for this visit only */
    }
  }, [mode]);

  const cycle = useCallback(
    () => setMode((m) => MODES[(MODES.indexOf(m) + 1) % MODES.length]),
    []
  );

  return { mode, resolved, setMode, cycle };
}
