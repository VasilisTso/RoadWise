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

// Purely presentational: draws whatever `route` (the useRoute result) contains.
function MapView({ route }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

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

  // Draw the route + toll markers; the cleanup removes them when `route` changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !route) return;

    const line = L.polyline(route.coords, {
      color: route.avoidTolls ? "orange" : "blue",
      weight: 5,
    }).addTo(map);
    map.fitBounds(line.getBounds());

    const markers = route.tolls.map((toll) =>
      L.marker([toll.lat, toll.lng])
        .bindPopup(
          `<strong>${escapeHtml(toll.name)}</strong><br/>Car: ${formatEuro(toll.car)}<br/>Bike: ${formatEuro(toll.bike)}`
        )
        .addTo(map)
    );

    return () => {
      line.remove();
      markers.forEach((m) => m.remove());
    };
  }, [route]);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 mt-6">
      <div
        ref={containerRef}
        className="w-full h-[600px] rounded-xl overflow-hidden shadow-lg"
      />
    </div>
  );
}

export default MapView;