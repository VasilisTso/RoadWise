import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { escapeHtml, formatEuro, formatDuration, formatKm } from "../utils/format";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function MapView({ route, loading = false }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

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

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !route) return;

    const line = L.polyline(route.coords, {
      color: route.avoidTolls ? "#f59e0b" : "#2563eb",
      weight: 5,
      opacity: 0.9,
    }).addTo(map);
    map.fitBounds(line.getBounds(), { padding: [36, 36] });

    const markers = route.tolls.map((toll) =>
      L.marker([toll.lat, toll.lng])
        .bindPopup(
          `<div style="min-width:130px">
            <div style="font-weight:700;color:#fbbf24;margin-bottom:4px;border-bottom:1px solid #334155;padding-bottom:3px">${escapeHtml(toll.name)}</div>
            <div style="display:flex;justify-content:space-between;font-family:monospace"><span>Car:</span> <strong>${formatEuro(toll.car)}</strong></div>
            <div style="display:flex;justify-content:space-between;font-family:monospace"><span>Bike:</span> <strong>${formatEuro(toll.bike)}</strong></div>
          </div>`
        )
        .addTo(map)
    );

    return () => {
      line.remove();
      markers.forEach((m) => m.remove());
    };
  }, [route]);

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden">
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
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-1 rounded-full bg-blue-500 inline-block" />
            Tollway
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-1 rounded-full bg-amber-500 inline-block" />
            Toll-Free
          </span>
          {route && (
            <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
              {route.tolls.length} {route.tolls.length === 1 ? "Toll" : "Tolls"}
            </span>
          )}
        </div>
      </div>

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
                Plotting Route Geometry...
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MapView;