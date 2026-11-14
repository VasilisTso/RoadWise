// Locale-aware formatters. `createFormatters` is called once per language (see src/i18n);
// components get the result from `useI18n().fmt`, so each function is stable per language.

const sameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/**
 * @param locale  BCP 47 tag, e.g. "en-GB" or "el-GR"
 * @param units   { h, min } short duration units ("h"/"min", "ώρ."/"λεπ.")
 * @param justNow text for times under a minute ago
 */
export function createFormatters({ locale, units, justNow }) {
  const euroFmt = new Intl.NumberFormat(locale, { style: "currency", currency: "EUR" });
  const kmFmt = new Intl.NumberFormat(locale, {
    style: "unit",
    unit: "kilometer",
    maximumFractionDigits: 0,
  });
  const kgFmt = (digits) =>
    new Intl.NumberFormat(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits });
  const kg1 = kgFmt(1);
  const kg0 = kgFmt(0);
  const numFmts = new Map();
  // 24-hour clock in both languages (el-GR defaults to 12-hour with π.μ./μ.μ.)
  const timeFmt = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  const dayTimeFmt = new Intl.DateTimeFormat(locale, {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const relFmt = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  return {
    locale,

    euro: (amount) => euroFmt.format(amount),

    km: (km) => kmFmt.format(Math.round(km)),

    // CO₂: one decimal under 10 kg, whole kg above
    kg: (kg) => `${(kg < 10 ? kg1 : kg0).format(kg)} kg`,

    // Plain number with up to `max` decimals, e.g. a consumption figure (6.5 / 6,5)
    number: (n, max = 2) => {
      if (!numFmts.has(max)) numFmts.set(max, new Intl.NumberFormat(locale, { maximumFractionDigits: max }));
      return numFmts.get(max).format(n);
    },

    // "5 h 07 min" / "5 ώρ. 07 λεπ."; round first so we never get "1 h 60 min"
    duration: (totalMinutes) => {
      const total = Math.round(Math.abs(totalMinutes));
      const h = Math.floor(total / 60);
      const m = total % 60;
      const nb = "\u00a0"; // keep each number with its unit
      if (h === 0) return `${m}${nb}${units.min}`;
      return `${h}${nb}${units.h} ${String(m).padStart(2, "0")}${nb}${units.min}`;
    },

    // "14:05", or "Sat 09:10" when it falls on a different day than `ref`
    time: (date, ref = date) => (sameDay(date, ref) ? timeFmt : dayTimeFmt).format(date),

    // "just now", "5 minutes ago", "yesterday", "3 days ago"
    relative: (ms, now = Date.now()) => {
      const sec = Math.round((ms - now) / 1000);
      if (Math.abs(sec) < 60) return justNow;
      const min = Math.round(sec / 60);
      if (Math.abs(min) < 60) return relFmt.format(min, "minute");
      const hr = Math.round(min / 60);
      if (Math.abs(hr) < 24) return relFmt.format(hr, "hour");
      return relFmt.format(Math.round(hr / 24), "day");
    },
  };
}

export function escapeHtml(str) {
  return String(str).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}
