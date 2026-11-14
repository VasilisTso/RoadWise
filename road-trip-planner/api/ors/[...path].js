// Vercel serverless proxy for OpenRouteService.
// only forwards the endpoints the app needs.

const ORS_BASE = "https://api.openrouteservice.org";

const ALLOWED = {
  "geocode/autocomplete": "GET",
  "geocode/search": "GET",
  "geocode/reverse": "GET",
  "v2/directions/driving-car/geojson": "POST",
};

// The app sends 2–6 points (start, stops, destination); a little headroom here
const MIN_POINTS = 2;
const MAX_POINTS = 8;

const isCoord = (c) =>
  Array.isArray(c) && c.length === 2 && c.every((n) => typeof n === "number" && Number.isFinite(n));

export default async function handler(req, res) {
  const key = process.env.ORS_API_KEY;
  if (!key) return res.status(500).json({ error: "ORS_API_KEY is not configured" });

  const url = new URL(req.url, "http://localhost");
  const path = url.pathname.replace(/^\/api\/ors\//, "");

  if (ALLOWED[path] !== req.method) {
    return res.status(404).json({ error: "Not found" });
  }

  let body;
  if (req.method === "POST") {
    const b = req.body ?? {};
    const n = Array.isArray(b.coordinates) ? b.coordinates.length : 0;
    if (n < MIN_POINTS || n > MAX_POINTS || !b.coordinates.every(isCoord)) {
      return res.status(400).json({ error: "Invalid coordinates" });
    }
    body = JSON.stringify({
      coordinates: b.coordinates,
      // multi-stop trips need instructions for per-leg segments
      instructions: b.instructions === true,
      options: b.options?.avoid_features?.includes("tollways")
        ? { avoid_features: ["tollways"] }
        : {},
      // the only extra_info we allow
      ...(Array.isArray(b.extra_info) && b.extra_info.includes("tollways")
        ? { extra_info: ["tollways"] }
        : {}),
    });
  }

  url.searchParams.delete("api_key"); // never accept a client-supplied key

  try {
    const upstream = await fetch(`${ORS_BASE}/${path}${url.search}`, {
      method: req.method,
      headers: { Authorization: key, "Content-Type": "application/json" },
      body,
    });

    const text = await upstream.text();
    if (req.method === "GET" && upstream.ok) {
      res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
    }
    res.setHeader("Content-Type", upstream.headers.get("content-type") ?? "application/json");
    return res.status(upstream.status).send(text);
  } catch (err) {
    console.error("ORS proxy error:", err);
    return res.status(502).json({ error: "Upstream request failed" });
  }
}