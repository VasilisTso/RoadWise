import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { escapeHtml, formatEuro, formatDuration, formatKm } from "../utils/format";

// Default marker icons break under Vite unless the image URLs are set explicitly.
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

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

  // Create the map once (and clean up on unmount / StrictMode re-mount)
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

  // Draw the active route + ghost comparison route + toll markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !route) return;

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

    map.fitBounds(line.getBounds(), { padding: [36, 36] });

    const markers = route.tolls.map((toll, idx) => {
      const marker = L.marker([toll.lat, toll.lng])
        .bindPopup(
          `<div style="min-width:150px">
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
      markers.forEach((m) => m.remove());
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