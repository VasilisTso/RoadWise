import { useCallback, useEffect, useRef, useState } from "react";
import { autocomplete } from "../services/ors";
import { useI18n } from "../i18n/context";

// Debounced autocomplete. Each new query cancels the in-flight one, so
// out-of-order responses can't overwrite newer suggestions.
export function useAutocomplete(delay = 300, minChars = 3) {
  const { lang } = useI18n();
  const [suggestions, setSuggestions] = useState([]);
  const timer = useRef(null);
  const controller = useRef(null);

  const clear = useCallback(() => {
    clearTimeout(timer.current);
    controller.current?.abort();
    setSuggestions([]);
  }, []);

  const search = useCallback(
    (query) => {
      clearTimeout(timer.current);
      controller.current?.abort();

      if (query.trim().length < minChars) {
        setSuggestions([]);
        return;
      }

      timer.current = setTimeout(async () => {
        const ctrl = new AbortController();
        controller.current = ctrl;
        try {
          setSuggestions(await autocomplete(query, { signal: ctrl.signal, lang }));
        } catch (err) {
          if (err.name === "AbortError") return;
          console.error(err); // not fatal: Search falls back to geocoding
          setSuggestions([]);
        }
      }, delay);
    },
    [delay, minChars, lang]
  );

  useEffect(
    () => () => {
      clearTimeout(timer.current);
      controller.current?.abort();
    },
    []
  );

  return { suggestions, search, clear };
}