#!/usr/bin/env node
/**
 * Suggests accurate coordinates for src/data/tolls.json using OpenStreetMap.
 * OSM maps toll plazas (barrier=toll_booth) and free-flow gantries
 * (highway=toll_gantry) as nodes ON the road, which is exactly what the route
 * matcher needs.
 *
 * Usage (Node 18+, run from the project root):
 *   node scripts/update-toll-coords.mjs                    # downloads from Overpass
 *   node scripts/update-toll-coords.mjs --input osm.json   # use a saved Overpass result
 *
 * It NEVER overwrites tolls.json. It writes src/data/tolls.suggested.json (same
 * schema, coordinates moved to the nearest OSM toll node) and prints a report.
 * Review every line marked REVIEW, because the nearest node isn't always the right plaza.
 */
import { readFile, writeFile } from "node:fs/promises";

const TOLLS_PATH = "src/data/tolls.json";
const OUT_PATH = "src/data/tolls.suggested.json";
const MAX_SNAP_KM = 10; // ignore OSM nodes farther than this from the current point
const REVIEW_MOVE_KM = 3; // flag moves bigger than this for a manual look
const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

const QUERY = `[out:json][timeout:90];
area["ISO3166-1"="GR"][admin_level=2]->.gr;
(
  node["barrier"="toll_booth"](area.gr);
  node["highway"="toll_gantry"](area.gr);
);
out body;`;

const DEG = Math.PI / 180;
function km(lat1, lon1, lat2, lon2) {
  const a =
    Math.sin(((lat2 - lat1) * DEG) / 2) ** 2 +
    Math.cos(lat1 * DEG) * Math.cos(lat2 * DEG) * Math.sin(((lon2 - lon1) * DEG) / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function suggest(tolls, elements) {
  const nodes = elements
    .filter((e) => e.type === "node" && Number.isFinite(e.lat) && Number.isFinite(e.lon))
    .map((e) => ({
      id: e.id,
      lat: e.lat,
      lng: e.lon,
      label: e.tags?.name ?? e.tags?.["name:en"] ?? e.tags?.ref ?? "(unnamed)",
      operator: e.tags?.operator ?? "",
    }));

  return tolls.map((toll) => {
    const candidates = nodes
      .map((n) => ({ ...n, distKm: km(toll.lat, toll.lng, n.lat, n.lng) }))
      .filter((n) => n.distKm <= MAX_SNAP_KM)
      .sort((a, b) => a.distKm - b.distKm);
    const best = candidates[0];
    return {
      toll,
      best,
      candidates: candidates.slice(0, 3),
      review: !best || best.distKm > REVIEW_MOVE_KM || candidates.length > 1,
      suggested: best
        ? { ...toll, lat: +best.lat.toFixed(5), lng: +best.lng.toFixed(5) }
        : toll,
    };
  });
}

async function main() {
  const args = process.argv.slice(2);
  const inputIdx = args.indexOf("--input");
  let osm;
  if (inputIdx !== -1) {
    osm = JSON.parse(await readFile(args[inputIdx + 1], "utf8"));
  } else {
    console.log("Querying Overpass for toll booths and gantries in Greece...");
    const res = await fetch(OVERPASS_URL, {
      method: "POST",
      body: new URLSearchParams({ data: QUERY }),
    });
    if (!res.ok) throw new Error(`Overpass returned ${res.status}`);
    osm = await res.json();
  }

  const tolls = JSON.parse(await readFile(TOLLS_PATH, "utf8"));
  const results = suggest(tolls, osm.elements ?? []);
  console.log(`OSM toll nodes found: ${(osm.elements ?? []).length}\n`);

  for (const r of results) {
    const flag = r.review ? "REVIEW" : "ok    ";
    if (!r.best) {
      console.log(`${flag} ${r.toll.name}: no OSM toll node within ${MAX_SNAP_KM} km, keeping old coordinates`);
      continue;
    }
    console.log(
      `${flag} ${r.toll.name}: moved ${r.best.distKm.toFixed(1)} km to "${r.best.label}" ${r.best.operator}`.trimEnd()
    );
    if (r.candidates.length > 1) {
      for (const c of r.candidates.slice(1)) {
        console.log(`         other candidate: "${c.label}" ${c.distKm.toFixed(1)} km away (${c.lat}, ${c.lng})`);
      }
    }
  }

  await writeFile(OUT_PATH, JSON.stringify(results.map((r) => r.suggested), null, 2) + "\n");
  console.log(`\nWrote ${OUT_PATH}. Review it, then copy over ${TOLLS_PATH} when you're happy.`);
}

import { pathToFileURL } from "node:url";
if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}