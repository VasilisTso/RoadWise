export function formatDuration(totalMinutes) {
  const total = Math.round(Math.abs(totalMinutes)); // round first so we never get "1 h 60 min"
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m} min`;
  return `${h} h ${String(m).padStart(2, "0")} min`;
}

export const formatEuro = (amount) => `€${amount.toFixed(2)}`;

export const formatKm = (km) => `${Math.round(km)} km`;

// CO₂: one decimal under 10 kg, whole kg above
export const formatKg = (kg) => `${kg < 10 ? kg.toFixed(1) : Math.round(kg)} kg`;

const LOCALE = "en-GB"; // Phase 4 makes this follow the chosen language

const timeFmt = new Intl.DateTimeFormat(LOCALE, { hour: "2-digit", minute: "2-digit" });
const dayTimeFmt = new Intl.DateTimeFormat(LOCALE, {
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
});

const sameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

// "14:05", or "Sat 09:10" when it falls on a different day than `ref`
export const formatTime = (date, ref = date) =>
  (sameDay(date, ref) ? timeFmt : dayTimeFmt).format(date);

const relFmt = new Intl.RelativeTimeFormat(LOCALE, { numeric: "auto" });

// "just now", "5 minutes ago", "yesterday", "3 days ago"
export function formatRelative(ms, now = Date.now()) {
  const sec = Math.round((ms - now) / 1000);
  if (Math.abs(sec) < 60) return "just now";
  const min = Math.round(sec / 60);
  if (Math.abs(min) < 60) return relFmt.format(min, "minute");
  const hr = Math.round(min / 60);
  if (Math.abs(hr) < 24) return relFmt.format(hr, "hour");
  return relFmt.format(Math.round(hr / 24), "day");
}

export const pluralize = (n, one, many) => `${n} ${n === 1 ? one : many}`;

export function escapeHtml(str) {
  return String(str).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}
