// Naming for trip points and routes

export const pointLetter = (i) => String.fromCharCode(65 + i); // A, B, C… as on the map

// "From" / "Stop" / "Stop 2" / "To" for a point in a list of `count`
export function pointName(i, count) {
  if (i === 0) return "From";
  if (i === count - 1) return "To";
  return count > 3 ? `Stop ${i}` : "Stop";
}

export const shortPlace = (label) => label.split(",")[0].trim();

// "Athens, Attica → Thessaloniki"; with stops, short names: "Athens → Delphi → Thessaloniki"
export function routeTitle(waypoints) {
  const labels = waypoints.map((w) => w.label);
  return (labels.length > 2 ? labels.map(shortPlace) : labels).join(" → ");
}
