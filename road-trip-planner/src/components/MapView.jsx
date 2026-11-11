import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { escapeHtml, formatEuro, formatDuration, formatKm } from "../utils/format";

// Creates a crisp, zero-dependency numbered badge for each toll station on the route
function createTollIcon(index, feeText) {
  const num = String(index + 1).padStart(2, "0");
  return L.divIcon({
    className: "roadwise-toll-marker",
    iconSize: [58, 24],
    iconAnchor: [29, 12],
    popupAnchor: [0, -14],
    html: `
      <div style="
        display:inline-flex;
        align-items:center;
        gap:4px;
        background:#0f172a;
        color:#f8fafc;
        border:1.5px solid #fbbf24;
        border-radius:9999px;
        padding:2px 7px 2px 5px;
        font-family:'JetBrains Mono',monospace;
        font-size:11px;
        font-weight:700;
        line-height:1;
        box-shadow:0 3px 10px rgba(15,23,42,0.45);
        white-space:nowrap;
        transform:translate(-50%, -50%);
        position:absolute;
        top:50%;
        left:50%;
      ">
        <span style="
          background:#fbbf24;
          color:#0f172a;
          border-radius:9999px;
          padding:2px 4px;
          font-size:9px;
          font-weight:800;
        ">${num}</span>
        <span>${feeText}</span>
      </div>
    `,
  });
}

// Creates a clean Origin (A) or Destination (B) endpoint marker
function createEndpointIcon(letter, bgColor) {
  return L.divIcon({
    className: "roadwise-endpoint-marker",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
    html: `
      <div style="
        width:26px;
        height:26px;
        border-radius:9999px;
        background:${bgColor};
        color:#ffffff;
        border:2.5px solid #ffffff;
        box-shadow:0 3px 10px rgba(15,23,42,0.4);
        display:flex;
        align-items:center;
        justify-content:center;
        font-family:'JetBrains Mono',monospace;
        font-size:12px;
        font-weight:800;
      ">${letter}</div>
    `,
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

  // Create the map once (cleaned up on unmount / StrictMode re-mount)
  useEffect(() => {
    const map = L.map(containerRef.current).setView([39.0742, 21.8243], 7);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);
    mapRef.current = map;

    return () => {
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
        color: alternativeRoute.avoidTolls ? "#f59e0b" : "#2563eb",
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
      color: route.avoidTolls ? "#f59e0b" : "#2563eb",
      weight: 5,
      opacity: 0.95,
    }).addTo(map);

    map.fitBounds(line.getBounds(), { padding: [40, 40] });

    // Origin (A) & Destination (B) endpoint pins
    const startPt = route.coords[0];
    const endPt = route.coords[route.coords.length - 1];

    const startMarker = L.marker(startPt, {
      icon: createEndpointIcon("A", "#10b981"),
      zIndexOffset: 900,
    })
      .bindPopup(
        `<div style="font-weight:700;color:#34d399">Origin</div><div>${escapeHtml(
          route.start
        )}</div>`
      )
      .addTo(map);

    const endMarker = L.marker(endPt, {
      icon: createEndpointIcon("B", "#f59e0b"),
      zIndexOffset: 900,
    })
      .bindPopup(
        `<div style="font-weight:700;color:#fbbf24">Destination</div><div>${escapeHtml(
          route.end
        )}</div>`
      )
      .addTo(map);

    // Snapped Toll Plaza pill markers directly on the route line
    const activeVehicle = route.vehicle || "car";
    const tollMarkers = route.tolls.map((toll, idx) => {
      const activeFee = toll[activeVehicle] ?? toll.car;
      const marker = L.marker([toll.lat, toll.lng], {
        icon: createTollIcon(idx, `€${activeFee.toFixed(2)}`),
        zIndexOffset: 1000,
      })
        .bindPopup(
          `<div style="min-width:155px">
            <div style="font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.06em">#${String(
              idx + 1
            ).padStart(2, "0")} • ${escapeHtml(toll.highway || "Toll Plaza")}</div>
            <div style="font-weight:700;color:#fbbf24;margin-bottom:6px;border-bottom:1px solid #334155;padding-bottom:4px">${escapeHtml(
              toll.name
            )}</div>
            <div style="display:flex;justify-content:space-between;font-family:monospace"><span>Car:</span> <strong>${formatEuro(
              toll.car
            )}</strong></div>
            <div style="display:flex;justify-content:space-between;font-family:monospace"><span>Bike:</span> <strong>${formatEuro(
              toll.bike
            )}</strong></div>
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
          <span className="text-xs font-mono-num uppercase tracking-widest font-bold">
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
              <span className="text-xs font-mono-num uppercase tracking-wider">
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