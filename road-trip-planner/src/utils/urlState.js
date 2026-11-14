import { FUEL_TYPES } from "../data/fuel";

// Shareable trip state in the query string.
//   wp=Athens|23.72760,37.98380;Delphi|22.50110,38.48240   (label|lng,lat; coords optional)
//   veh fuel fp cons pax avoid rt brk dep
// Legacy links (?from=&to=&sc=&ec=) still load.

const DEPART_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

function parseCoords(str) {
  if (!str) return null;
  const parts = str.split(",").map(Number);
  return parts.length === 2 && parts.every((n) => Number.isFinite(n)) ? parts : null;
}

// ";" and "|" are the separators, so labels can't carry them
const cleanLabel = (label) => String(label).replace(/[;|]/g, ",").trim();

function parseWaypoints(params) {
  const wp = params.get("wp");
  if (wp) {
    return wp
      .split(";")
      .map((part) => {
        const cut = part.lastIndexOf("|");
        const label = (cut === -1 ? part : part.slice(0, cut)).trim();
        const coords = cut === -1 ? null : parseCoords(part.slice(cut + 1));
        return { label, coords };
      })
      .filter((w) => w.label);
  }
  const from = params.get("from");
  const to = params.get("to");
  if (from || to) {
    return [
      { label: from ?? "", coords: parseCoords(params.get("sc")) },
      { label: to ?? "", coords: parseCoords(params.get("ec")) },
    ];
  }
  return [];
}

// Only settings explicitly present in the URL; they override stored settings.
function parseSettings(params) {
  const out = {};
  const veh = params.get("veh");
  if (veh === "car" || veh === "bike") out.vehicle = veh;
  const fuel = params.get("fuel");
  if (fuel && fuel in FUEL_TYPES) out.fuelType = fuel;
  const fp = Number(params.get("fp"));
  if (params.has("fp") && fp > 0) out.fuelPrice = fp;
  const cons = Number(params.get("cons"));
  if (params.has("cons") && cons > 0) out.consumption = cons;
  const pax = parseInt(params.get("pax") ?? "", 10);
  if (pax >= 1) out.passengers = pax;
  if (params.has("avoid")) out.avoidTolls = params.get("avoid") === "1";
  if (params.has("rt")) out.roundTrip = params.get("rt") === "1";
  if (params.has("brk")) out.breaks = params.get("brk") === "1";
  return out;
}

export function readUrlState(search = window.location.search) {
  const params = new URLSearchParams(search);
  const dep = params.get("dep");
  return {
    waypoints: parseWaypoints(params),
    departAt: dep && DEPART_RE.test(dep) ? dep : null,
    settings: parseSettings(params),
  };
}

export function buildUrlSearch({ waypoints, departAt, settings }) {
  const params = new URLSearchParams();
  params.set(
    "wp",
    waypoints
      .map((w) => {
        const label = cleanLabel(w.label);
        return w.coords ? `${label}|${w.coords.map((n) => n.toFixed(5)).join(",")}` : label;
      })
      .join(";")
  );
  params.set("veh", settings.vehicle);
  params.set("fuel", settings.fuelType);
  params.set("fp", String(settings.fuelPrice));
  params.set("cons", String(settings.consumption));
  params.set("pax", String(settings.passengers));
  if (settings.avoidTolls) params.set("avoid", "1");
  if (settings.roundTrip) params.set("rt", "1");
  if (settings.breaks) params.set("brk", "1");
  if (departAt) params.set("dep", departAt);
  return `?${params.toString()}`;
}
