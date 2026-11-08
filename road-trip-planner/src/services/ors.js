// All OpenRouteService calls go through our own /api/ors proxy, which adds the
// API key server-side (see api/ors/[...path].js and the Vite dev proxy).
const BASE = "/api/ors";

function messageForStatus(status) {
  if (status === 404) return "No drivable route was found between these two locations.";
  if (status === 429) return "Too many requests. Please wait a moment and try again.";
  if (status === 401 || status === 403) {
    return "The routing service rejected our credentials. (Is ORS_API_KEY set on the server?)";
  }
  return "The routing service returned an error. Please try again.";
}

async function request(url, options, networkMessage) {
  let res;
  try {
    res = await fetch(url, options);
  } catch (err) {
    if (err.name === "AbortError") throw err;
    console.error("Request failed:", err);
    throw new Error(networkMessage);
  }
  if (!res.ok) {
    console.error("ORS error:", res.status, await res.text().catch(() => ""));
    throw new Error(messageForStatus(res.status));
  }
  return res.json();
}

// Returns [{ label, coords: [lng, lat] }]
export async function autocomplete(query, signal) {
  const data = await request(
    `${BASE}/geocode/autocomplete?text=${encodeURIComponent(query)}`,
    { signal },
    "Couldn't load suggestions."
  );
  return (data.features ?? []).map((f) => ({
    label: f.properties.label,
    coords: f.geometry.coordinates,
  }));
}

// Returns [lng, lat] or null when nothing matches
export async function geocode(place, signal) {
  const data = await request(
    `${BASE}/geocode/search?text=${encodeURIComponent(place)}`,
    { signal },
    "Couldn't reach the location service. Check your connection and try again."
  );
  return data.features?.[0]?.geometry?.coordinates ?? null;
}

// Returns the first GeoJSON feature of the route
export async function fetchRoute(startCoords, endCoords, { avoidTolls = false, signal } = {}) {
  const data = await request(
    `${BASE}/v2/directions/driving-car/geojson`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal,
      body: JSON.stringify({
        coordinates: [startCoords, endCoords], // ORS expects [lng, lat]
        instructions: false,
        options: avoidTolls ? { avoid_features: ["tollways"] } : {},
      }),
    },
    "Couldn't reach the routing service. Check your connection and try again."
  );
  const feature = data.features?.[0];
  if (!feature) throw new Error("No route was found between these locations.");
  return feature;
}