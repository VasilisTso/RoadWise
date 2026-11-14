// All OpenRouteService calls go through our own /api/ors proxy

const BASE = "/api/ors";

/**
 * Error carrying a dictionary key (see `errors.*` in src/i18n), so the message is shown
 * in whatever language is active when it renders, not when it was thrown.
 */
export class AppError extends Error {
  constructor(key, vars = {}) {
    super(key);
    this.name = "AppError";
    this.key = key;
    this.vars = vars;
  }
}

function errorKeyForStatus(status) {
  if (status === 404) return "errors.noRoute";
  if (status === 429) return "errors.tooMany";
  if (status === 401 || status === 403) return "errors.auth";
  return "errors.service";
}

async function request(url, options, networkKey) {
  let res;
  try {
    res = await fetch(url, options);
  } catch (err) {
    if (err.name === "AbortError") throw err;
    console.error("Request failed:", err);
    throw new AppError(networkKey);
  }
  if (!res.ok) {
    console.error("ORS error:", res.status, await res.text().catch(() => ""));
    throw new AppError(errorKeyForStatus(res.status));
  }
  return res.json();
}

// Place names come back in the UI language ("Athens" / "Αθήνα") where the geocoder has them
const geocodeParams = (lang) => `boundary.country=GR&lang=${lang === "el" ? "el" : "en"}`;

export async function autocomplete(query, { signal, lang } = {}) {
  const data = await request(
    `${BASE}/geocode/autocomplete?text=${encodeURIComponent(query)}&${geocodeParams(lang)}`,
    { signal },
    "errors.networkGeocode"
  );
  return (data.features ?? []).map((f) => ({
    label: f.properties.label,
    coords: f.geometry.coordinates,
  }));
}

export async function geocode(place, { signal, lang } = {}) {
  const data = await request(
    `${BASE}/geocode/search?text=${encodeURIComponent(place)}&${geocodeParams(lang)}`,
    { signal },
    "errors.networkGeocode"
  );
  return data.features?.[0]?.geometry?.coordinates ?? null;
}

// Reverse-geocodes GPS coordinates into a human-readable label (falls back to lat/lng string)
export async function reverseGeocode(lat, lng, { signal, lang } = {}) {
  try {
    const data = await request(
      `${BASE}/geocode/reverse?point.lat=${encodeURIComponent(lat)}&point.lon=${encodeURIComponent(lng)}&size=1&lang=${
        lang === "el" ? "el" : "en"
      }`,
      { signal },
      "errors.networkGeocode"
    );
    return data.features?.[0]?.properties?.label ?? `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}

// `coordsList`: 2–8 [lng, lat] points in driving order (start, stops…, destination)
export async function fetchRoute(
  coordsList,
  { avoidTolls = false, withTollInfo = false, signal } = {}
) {
  const data = await request(
    `${BASE}/v2/directions/driving-car/geojson`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal,
      body: JSON.stringify({
        coordinates: coordsList, // ORS expects [lng, lat]
        // ORS only sends per-leg `segments` (distance/duration) with instructions on; ~8% larger
        instructions: coordsList.length > 2,
        options: avoidTolls ? { avoid_features: ["tollways"] } : {},
        ...(withTollInfo ? { extra_info: ["tollways"] } : {}),
      }),
    },
    "errors.networkRoute"
  );
  const feature = data.features?.[0];
  if (!feature) throw new AppError("errors.noRoute");
  return feature;
}
