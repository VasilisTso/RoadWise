import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { escapeHtml, formatEuro } from "../utils/format";

// Default marker icons break under Vite unless the image URLs are set explicitly.
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Presentational. Props:
//  routes:        [{ id, coords, color }]  (all routes to draw)
//  selectedId:    which route is highlighted
//  tolls:         tolls of the selected route (shown as markers)
//  onSelectRoute: called when a route line is clicked
function MapView({ routes, selectedId, tolls, onSelectRoute }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const linesRef = useRef({});
  const onSelectRef = useRef(onSelectRoute);

  useEffect(() => {
    onSelectRef.current = onSelectRoute;
  });

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

  // Draw all routes and zoom to fit. Runs only when a new search result arrives,
  // so picking a different route doesn't re-zoom the map.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !routes?.length) return;

    const lines = {};
    routes.forEach((r) => {
      const line = L.polyline(r.coords, { color: r.color, weight: 5 }).addTo(map);
      line.on("click", () => onSelectRef.current?.(r.id));
      lines[r.id] = line;
    });
    linesRef.current = lines;
    map.fitBounds(L.featureGroup(Object.values(lines)).getBounds());

    return () => {
      Object.values(lines).forEach((l) => l.remove());
      linesRef.current = {};
    };
  }, [routes]);

  // Highlight the selected route, dim the others
  useEffect(() => {
    Object.entries(linesRef.current).forEach(([id, line]) => {
      if (id === selectedId) {
        line.setStyle({ weight: 6, opacity: 1, dashArray: null });
        line.bringToFront();
      } else {
        line.setStyle({ weight: 4, opacity: 0.55, dashArray: "8 8" });
      }
    });
  }, [routes, selectedId]);

  // Toll markers for the selected route
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !tolls?.length) return;

    const markers = tolls.map((toll, i) =>
      L.marker([toll.lat, toll.lng])
        .bindPopup(
          `<strong>${i + 1}. ${escapeHtml(toll.name)}</strong><br/>Car: ${formatEuro(toll.car)}<br/>Bike: ${formatEuro(toll.bike)}`
        )
        .addTo(map)
    );

    return () => markers.forEach((m) => m.remove());
  }, [tolls]);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 mt-6">
      <div ref={containerRef} className="w-full h-[600px] rounded-xl overflow-hidden shadow-lg" />
    </div>
  );
}

export default MapView;