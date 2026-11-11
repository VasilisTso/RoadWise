// All OpenRouteService calls go through our own /api/ors proxy

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

export async function autocomplete(query, signal) {
  const data = await request(
    `${BASE}/geocode/autocomplete?text=${encodeURIComponent(query)}&boundary.country=GR`,
    { signal },
    "Couldn't load suggestions."
  );
  return (data.features ?? []).map((f) => ({
    label: f.properties.label,
    coords: f.geometry.coordinates,
  }));
}

export async function geocode(place, signal) {
  const data = await request(
    `${BASE}/geocode/search?text=${encodeURIComponent(place)}&boundary.country=GR`,
    { signal },
    "Couldn't reach the location service. Check your connection and try again."
  );
  return data.features?.[0]?.geometry?.coordinates ?? null;
}

// Reverse-geocodes GPS coordinates into a human-readable label (falls back to lat/lng string)
export async function reverseGeocode(lat, lng, signal) {
  try {
    const data = await request(
      `${BASE}/geocode/reverse?point.lat=${encodeURIComponent(lat)}&point.lon=${encodeURIComponent(lng)}&size=1`,
      { signal },
      "Couldn't resolve your location name."
    );
    return data.features?.[0]?.properties?.label ?? `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}

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
        ...(withTollInfo ? { extra_info: ["tollways"] } : {}),
      }),
    },
    "Couldn't reach the routing service. Check your connection and try again."
  );
  const feature = data.features?.[0];
  if (!feature) throw new Error("No route was found between these locations.");
  return feature;
}