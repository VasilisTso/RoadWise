import { createContext, useContext } from "react";
import { createI18n } from "./core";

// Default value keeps components usable outside the provider (English)
export const I18nContext = createContext({ ...createI18n("en"), setLang: () => {}, toggleLang: () => {} });

// { lang, locale, t, fmt, setLang, toggleLang }
export const useI18n = () => useContext(I18nContext);

export const useT = () => useContext(I18nContext).t;
