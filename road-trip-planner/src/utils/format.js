export function formatDuration(totalMinutes) {
  const total = Math.round(Math.abs(totalMinutes)); // round first so we never get "1 h 60 min"
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m} min`;
  return `${h} h ${String(m).padStart(2, "0")} min`;
}

export const formatEuro = (amount) => `€${amount.toFixed(2)}`;

export const formatKm = (km) => `${Math.round(km)} km`;

export const pluralize = (n, one, many) => `${n} ${n === 1 ? one : many}`;

export function escapeHtml(str) {
  return String(str).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}
