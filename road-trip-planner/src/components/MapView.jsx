import React, { useEffect, useRef } from "react";
import L from "leaflet";
import { escapeHtml, formatEuro, formatDuration, formatKm } from "../utils/format";

// Stadia Alidade Smooth: keyless on localhost; production needs the domain registered in Stadia
const TILE_ATTRIBUTION =
  '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const TILE_URLS = {
  light: "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png",
  dark: "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png",
};

// Active theme: explicit data-theme on <html>, otherwise the OS preference
function resolveTheme() {
  const attr = document.documentElement.dataset.theme;
  if (attr === "light" || attr === "dark") return attr;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

// Fixed price ramp for toll plates: bigger fee, bigger plate
function tollSizeClass(fee) {
  if (fee >= 4) return "rw-toll--lg";
  if (fee >= 2) return "rw-toll--md";
  return "rw-toll--sm";
}

// Numbered rate plate for each toll station on the route
function createTollIcon(index, fee) {
  return L.divIcon({
    className: "roadwise-toll-marker",
    iconSize: [64, 26],
    iconAnchor: [32, 13],
    popupAnchor: [0, -14],
    html: `<div class="rw-toll ${tollSizeClass(fee)}"><span class="rw-toll__num">${
      index + 1
    }</span><span class="rw-toll__fee">${escapeHtml(formatEuro(fee))}</span></div>`,
  });
}

// Route line colour from the design tokens (tolled = sign green, toll-free = ochre)
function routeColor(avoidTolls) {
  const name = avoidTolls ? "--rw-free-line" : "--rw-tolled-line";
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || "#00824a";
}

// Origin / destination pin
function createEndpointIcon(letter, variant) {
  return L.divIcon({
    className: "roadwise-endpoint-marker",
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -14],
    html: `<div class="rw-pin rw-pin--${variant}">${letter}</div>`,
  });
}

function MapView({
  route,
  alternativeRoute = null,
  focusedToll = null,
  loading = false,
  onSelectRouteMode,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersByTollNameRef = useRef(new Map());
  const fittedCoordsRef = useRef(null);

  // Create the map once (cleaned up on unmount / StrictMode re-mount)
  useEffect(() => {
    const map = L.map(containerRef.current).setView([39.0742, 21.8243], 7);
    const tiles = L.tileLayer(TILE_URLS[resolveTheme()], {
      maxZoom: 20,
      attribution: TILE_ATTRIBUTION,
    }).addTo(map);
    mapRef.current = map;

    // Swap basemap when the theme changes (data-theme attribute or OS setting)
    const syncTiles = () => tiles.setUrl(TILE_URLS[resolveTheme()]);
    const observer = new MutationObserver(syncTiles);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    media?.addEventListener("change", syncTiles);

    return () => {
      observer.disconnect();
      media?.removeEventListener("change", syncTiles);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Draw the active route + ghost comparison route + snapped custom SVG/HTML markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !route || !route.coords?.length) return;

    markersByTollNameRef.current.clear();

    // Draw alternative route first as a dashed clickable ghost line
    let altLine = null;
    if (alternativeRoute && alternativeRoute.coords?.length > 0) {
      altLine = L.polyline(alternativeRoute.coords, {
        color: routeColor(alternativeRoute.avoidTolls),
        weight: 4,
        opacity: 0.4,
        dashArray: "8, 8",
      })
        .bindTooltip(
          `Switch to ${alternativeRoute.avoidTolls ? "Toll-Free" : "With Tolls"} (${formatEuro(
            alternativeRoute.totalCost
          )})`,
          { sticky: true }
        )
        .on("click", () => {
          onSelectRouteMode?.(alternativeRoute.avoidTolls);
        })
        .addTo(map);
    }

    // Draw primary active route
    const line = L.polyline(route.coords, {
      color: routeColor(route.avoidTolls),
      weight: 5,
      opacity: 0.95,
    }).addTo(map);

    // Only re-fit when the geometry changes, so settings tweaks keep the user's zoom
    if (fittedCoordsRef.current !== route.coords) {
      fittedCoordsRef.current = route.coords;
      map.fitBounds(line.getBounds(), { padding: [40, 40] });
    }

    // Origin (A) & Destination (B) endpoint pins
    const startPt = route.coords[0];
    const endPt = route.coords[route.coords.length - 1];

    const startMarker = L.marker(startPt, {
      icon: createEndpointIcon("A", "start"),
      zIndexOffset: 900,
    })
      .bindPopup(
        `<div class="rw-popup__label">Start</div><div class="rw-popup__title">${escapeHtml(
          route.start
        )}</div>`
      )
      .addTo(map);

    const endMarker = L.marker(endPt, {
      icon: createEndpointIcon("B", "end"),
      zIndexOffset: 900,
    })
      .bindPopup(
        `<div class="rw-popup__label">Destination</div><div class="rw-popup__title">${escapeHtml(
          route.end
        )}</div>`
      )
      .addTo(map);

    // Snapped Toll Plaza pill markers directly on the route line
    const activeVehicle = route.vehicle || "car";
    const tollMarkers = route.tolls.map((toll, idx) => {
      const activeFee = toll[activeVehicle] ?? toll.car;
      const marker = L.marker([toll.lat, toll.lng], {
        icon: createTollIcon(idx, activeFee),
        zIndexOffset: 1000,
      })
        .bindPopup(
          `<div class="rw-popup">
            <div class="rw-popup__meta">${idx + 1} · ${escapeHtml(toll.highway || "Toll station")}</div>
            <div class="rw-popup__title">${escapeHtml(toll.name)}</div>
            <div class="rw-popup__row"><span>Car</span><strong>${formatEuro(toll.car)}</strong></div>
            <div class="rw-popup__row"><span>Motorbike</span><strong>${formatEuro(toll.bike)}</strong></div>
          </div>`
        )
        .addTo(map);

      markersByTollNameRef.current.set(toll.name, marker);
      return marker;
    });

    return () => {
      altLine?.remove();
      line.remove();
      startMarker.remove();
      endMarker.remove();
      tollMarkers.forEach((m) => m.remove());
    };
  }, [route, alternativeRoute, onSelectRouteMode]);

  // Pan and open popup when user clicks a toll row in TollList
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !focusedToll) return;
    const marker = markersByTollNameRef.current.get(focusedToll.name);
    if (marker) {
      map.flyTo([focusedToll.lat, focusedToll.lng], Math.max(map.getZoom(), 11), {
        duration: 0.6,
      });
      marker.openPopup();
    }
  }, [focusedToll]);

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden">
      {/* Top Map HUD Bar */}
      <div className="bg-slate-900 text-white px-4 py-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="text-xs font-mono-num font-bold">
            Cartographic Viewport
          </span>
          {route && (
            <span className="text-xs font-mono-num text-slate-400 hidden sm:inline">
              • {formatKm(route.distanceKm)} ({formatDuration(route.durationMin)})
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 text-[11px] font-mono-num text-slate-300">
          <button
            type="button"
            onClick={() => onSelectRouteMode?.(false)}
            className={`flex items-center gap-1.5 cursor-pointer transition-opacity ${
              route && route.avoidTolls ? "opacity-50 hover:opacity-100" : "font-bold text-white"
            }`}
          >
            <span className="w-3 h-1 rounded-full bg-blue-500 inline-block" />
            Tollway
          </button>
          <button
            type="button"
            onClick={() => onSelectRouteMode?.(true)}
            className={`flex items-center gap-1.5 cursor-pointer transition-opacity ${
              route && !route.avoidTolls ? "opacity-50 hover:opacity-100" : "font-bold text-white"
            }`}
          >
            <span className="w-3 h-1 rounded-full bg-amber-500 inline-block" />
            Toll-Free
          </button>
          {route && (
            <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
              {route.tolls.length} {route.tolls.length === 1 ? "Plaza" : "Plazas"}
            </span>
          )}
        </div>
      </div>

      {/* Map Canvas Container */}
      <div className="relative w-full h-[500px] lg:h-[680px]">
        <div ref={containerRef} className="w-full h-full z-10" />

        {loading && (
          <div className="absolute inset-0 z-20 bg-slate-950/35 backdrop-blur-[2px] flex items-center justify-center">
            <div className="bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-xl border border-slate-700 flex items-center gap-3">
              <svg
                className="animate-spin h-5 w-5 text-amber-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              <span className="text-xs font-mono-num">
                Plotting Dual Route Geometry...
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MapView;