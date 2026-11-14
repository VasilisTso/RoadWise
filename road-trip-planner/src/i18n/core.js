import en from "./en";
import el from "./el";
import { createFormatters } from "../utils/format";

export const DICTIONARIES = { en, el };
export const LANGS = ["en", "el"];
export const LOCALES = { en: "en-GB", el: "el-GR" };
export const STORAGE_KEY = "roadwise:lang:v1";

// Saved choice, else the browser language (Greek for any el-*), else English
export function initialLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (LANGS.includes(saved)) return saved;
  } catch {
    /* storage unavailable */
  }
  const nav = typeof navigator !== "undefined" ? navigator.languages?.[0] ?? navigator.language : "";
  return /^el\b/i.test(nav ?? "") ? "el" : "en";
}

const lookup = (dict, key) => key.split(".").reduce((node, part) => node?.[part], dict);

const interpolate = (str, vars) =>
  str.replace(/\{(\w+)\}/g, (m, name) => (vars[name] != null ? String(vars[name]) : m));

/**
 * Builds `t(key, vars)` for one language. Falls back to English, then to the key itself.
 * Plural entries ({ one, other }) are picked with Intl.PluralRules from `vars.n`.
 */
export function createTranslator(lang) {
  const dict = DICTIONARIES[lang] ?? en;
  const plural = new Intl.PluralRules(LOCALES[lang] ?? LOCALES.en);

  return function t(key, vars = {}) {
    let value = lookup(dict, key) ?? lookup(en, key);
    if (value == null) {
      if (import.meta.env.DEV) console.warn(`[i18n] missing key "${key}"`);
      return key;
    }
    if (typeof value === "object") {
      value = value[plural.select(Number(vars.n) || 0)] ?? value.other;
    }
    return interpolate(value, vars);
  };
}

export function createI18n(lang) {
  const t = createTranslator(lang);
  return {
    lang,
    locale: LOCALES[lang],
    t,
    fmt: createFormatters({
      locale: LOCALES[lang],
      units: { h: t("units.h"), min: t("units.min") },
      justNow: t("time.justNow"),
    }),
  };
}
