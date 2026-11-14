import React, { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { I18nContext } from "./context";
import { LANGS, STORAGE_KEY, createI18n, initialLang } from "./core";

// Active language: persisted, mirrored to <html lang>, the document title and meta description.
export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(initialLang);

  const setLang = useCallback((next) => {
    if (LANGS.includes(next)) setLangState(next);
  }, []);
  const toggleLang = useCallback(() => setLangState((l) => (l === "el" ? "en" : "el")), []);

  const value = useMemo(() => ({ ...createI18n(lang), setLang, toggleLang }), [lang, setLang, toggleLang]);

  useLayoutEffect(() => {
    document.documentElement.lang = lang;
    document.title = value.t("meta.title");
    document.querySelector('meta[name="description"]')?.setAttribute("content", value.t("meta.description"));
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* storage unavailable: choice lasts for this visit only */
    }
  }, [lang, value]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
