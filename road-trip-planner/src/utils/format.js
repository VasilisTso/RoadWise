export function formatDuration(totalMinutes) {
  const total = Math.round(totalMinutes); // round first so we never get "1 h 60 m"
  return `${Math.floor(total / 60)} h ${total % 60} m`;
}

export const formatEuro = (amount) => `€${amount.toFixed(2)}`;

export const formatKm = (km) => `${km.toFixed(1)} km`;

export function escapeHtml(str) {
  return String(str).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}