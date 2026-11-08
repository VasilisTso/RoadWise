// Merged RouteSelector + Map. (Phase 1: bug fixes and cleanup)
import React, { useCallback, useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import tollData from "../data/tolls.json";
import { motion } from "framer-motion"; // eslint-disable-line

const API_KEY = import.meta.env.VITE_ORS_API_KEY;
const ORS_BASE = "https://api.openrouteservice.org";

// Leaflet's default marker icons break under bundlers like Vite because the
// image URLs are resolved relative to the CSS. Point them at the bundled files.
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

/* -------------------------------------------------------------------------- */
/* Utilities                                                                  */
/* -------------------------------------------------------------------------- */

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function getTollsOnRoute(tolls, routeCoords, radiusKm = 5) {
  return tolls.filter((toll) =>
    routeCoords.some(([lat, lng]) => {
      const dist = getDistanceFromLatLonInKm(lat, lng, toll.lat, toll.lng);
      return dist < radiusKm;
    })
  );
}

/* -------------------------------------------------------------------------- */
/* API calls (all throw an Error with a user-friendly message on failure)     */
/* -------------------------------------------------------------------------- */

// Returns [{ label, coords: [lng, lat] }]
async function autocomplete(query, signal) {
  const res = await fetch(
    `${ORS_BASE}/geocode/autocomplete?api_key=${API_KEY}&text=${encodeURIComponent(query)}`,
    { signal }
  );
  if (!res.ok) throw new Error(`Autocomplete failed (${res.status})`);
  const data = await res.json();
  return (data.features ?? []).map((f) => ({
    label: f.properties.label,
    coords: f.geometry.coordinates,
  }));
}

// Returns [lng, lat] or null if nothing was found
async function geocode(place) {
  const res = await fetch(
    `${ORS_BASE}/geocode/search?api_key=${API_KEY}&text=${encodeURIComponent(place)}`
  );
  if (!res.ok) {
    throw new Error("The location service is unavailable right now. Please try again.");
  }
  const data = await res.json();
  return data.features?.[0]?.geometry?.coordinates ?? null;
}

async function fetchRoute(startCoords, endCoords, avoidTolls = false) {
  let res;
  try {
    res = await fetch(`${ORS_BASE}/v2/directions/driving-car/geojson`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: API_KEY },
      body: JSON.stringify({
        // ORS expects [lng, lat]
        coordinates: [startCoords, endCoords],
        instructions: false,
        options: avoidTolls ? { avoid_features: ["tollways"] } : {},
      }),
    });
  } catch (err) {
    console.error("Route request failed:", err);
    throw new Error("Couldn't reach the routing service. Check your connection and try again.");
  }

  if (!res.ok) {
    const text = await res.text();
    console.error("ORS API error:", res.status, text);
    if (res.status === 404) {
      throw new Error("No drivable route was found between these two locations.");
    }
    if (res.status === 429) {
      throw new Error("Too many requests. Please wait a moment and try again.");
    }
    throw new Error("The routing service returned an error. Please try again.");
  }
  return res.json();
}

/* -------------------------------------------------------------------------- */
/* Autocomplete hook + field                                                  */
/* -------------------------------------------------------------------------- */

// Debounced autocomplete. Cancels the in-flight request whenever a new one
// starts, so out-of-order responses can't overwrite newer suggestions.
function useAutocomplete(delay = 300, minChars = 3) {
  const [suggestions, setSuggestions] = useState([]);
  const timer = useRef(null);
  const controller = useRef(null);

  const clear = useCallback(() => {
    clearTimeout(timer.current);
    controller.current?.abort();
    setSuggestions([]);
  }, []);

  const search = useCallback(
    (query) => {
      clearTimeout(timer.current);
      controller.current?.abort();

      if (query.trim().length < minChars) {
        setSuggestions([]);
        return;
      }

      timer.current = setTimeout(async () => {
        const ctrl = new AbortController();
        controller.current = ctrl;
        try {
          setSuggestions(await autocomplete(query, ctrl.signal));
        } catch (err) {
          if (err.name === "AbortError") return;
          // Not fatal: the user can still type a full name and hit Search,
          // which falls back to geocoding.
          console.error(err);
          setSuggestions([]);
        }
      }, delay);
    },
    [delay, minChars]
  );

  useEffect(
    () => () => {
      clearTimeout(timer.current);
      controller.current?.abort();
    },
    []
  );

  return { suggestions, search, clear };
}

function LocationField({ id, label, placeholder, value, onTextChange, onSelect, className = "" }) {
  const { suggestions, search, clear } = useAutocomplete();
  const open = suggestions.length > 0;

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-gray-700 font-medium">
        {label}
      </label>
      <input
        id={id}
        type="text"
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        aria-controls={`${id}-listbox`}
        className={`w-full mt-1 p-3 border border-gray-300 focus:ring-2 focus:ring-blue-300 outline-none ${
          open ? "rounded-t-xl" : "rounded-xl"
        }`}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onTextChange(e.target.value);
          search(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") clear();
        }}
        onBlur={clear}
      />
      {open && (
        <ul
          id={`${id}-listbox`}
          role="listbox"
          className="border border-gray-300 border-t-0 mb-4 py-1 px-2 rounded-b-xl shadow-md bg-white max-h-48 overflow-auto text-left"
        >
          {suggestions.map((s, i) => (
            <li
              key={`${s.label}-${i}`}
              role="option"
              aria-selected="false"
              // onMouseDown (not onClick) fires before the input's blur,
              // so the selection isn't lost when the list closes.
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect(s);
                clear();
              }}
              className="p-3 hover:bg-gray-100 cursor-pointer rounded-lg"
            >
              {s.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

const inputClass =
  "w-full mt-1 mb-4 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none";

const Map2 = ({ onTollUpdate, onSummaryUpdate }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const routeLayerRef = useRef(null);
  const tollMarkersRef = useRef([]);

  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  // Exact [lng, lat] from a selected suggestion. Cleared when the user edits the text.
  const [startCoords, setStartCoords] = useState(null);
  const [endCoords, setEndCoords] = useState(null);

  const [avoidTolls, setAvoidTolls] = useState(false);
  const [vehicle, setVehicle] = useState("car");
  const [fuelPrice, setFuelPrice] = useState(1.8);
  const [consumption, setConsumption] = useState(6.5);
  const [passengers, setPassengers] = useState(1);

  const [loadingRoute, setLoadingRoute] = useState(false);
  const [error, setError] = useState(null);

  // Initialize map (and clean up on unmount / StrictMode re-mount)
  useEffect(() => {
    if (!mapRef.current) return;

    const map = L.map(mapRef.current).setView([39.0742, 21.8243], 7);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);
    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
      routeLayerRef.current = null;
      tollMarkersRef.current = [];
    };
  }, []);

  // Remove the previous route/markers and reset the results shown by the parent
  const clearResults = () => {
    routeLayerRef.current?.remove();
    routeLayerRef.current = null;
    tollMarkersRef.current.forEach((m) => m.remove());
    tollMarkersRef.current = [];
    onTollUpdate?.([]);
    onSummaryUpdate?.({});
  };

  const calculateRoute = async () => {
    setError(null);

    if (!start.trim() || !end.trim()) {
      setError("Please enter both a start location and a destination.");
      return;
    }

    setLoadingRoute(true);
    clearResults();

    try {
      // Prefer coordinates from a selected suggestion; otherwise geocode the text.
      const sCoords = startCoords ?? (await geocode(start));
      if (!sCoords) {
        throw new Error(`Couldn't find "${start}". Try a more specific place name.`);
      }
      const eCoords = endCoords ?? (await geocode(end));
      if (!eCoords) {
        throw new Error(`Couldn't find "${end}". Try a more specific place name.`);
      }

      const routeData = await fetchRoute(sCoords, eCoords, avoidTolls);
      const feature = routeData.features?.[0];
      if (!feature) throw new Error("No route was found between these locations.");

      // Leaflet expects [lat, lng]
      const coords = feature.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

      const map = mapInstance.current;
      if (!map) return; // component unmounted while waiting

      const layer = L.polyline(coords, {
        color: avoidTolls ? "orange" : "blue",
        weight: 5,
      }).addTo(map);
      routeLayerRef.current = layer;
      map.fitBounds(layer.getBounds());

      const distanceKm = feature.properties.summary.distance / 1000;
      const durationMin = feature.properties.summary.duration / 60;

      const tollsOnRoute = avoidTolls ? [] : getTollsOnRoute(tollData, coords);

      tollMarkersRef.current = tollsOnRoute.map((toll) =>
        L.marker([toll.lat, toll.lng])
          .bindPopup(
            `<strong>${toll.name}</strong><br/>Car: €${toll.car.toFixed(
              2
            )}<br/>Bike: €${toll.bike.toFixed(2)}`
          )
          .addTo(map)
      );

      const tollTotal = tollsOnRoute.reduce((sum, t) => sum + t[vehicle], 0);
      const fuelCost = (distanceKm * consumption * fuelPrice) / 100;
      const totalCost = fuelCost + tollTotal;
      const perPassenger = passengers > 0 ? totalCost / passengers : totalCost;

      onTollUpdate?.(tollsOnRoute);
      onSummaryUpdate?.({
        start,
        end,
        distance: `${distanceKm.toFixed(1)} km`,
        duration: durationMin, // minutes; RouteSummary formats it
        fuelCost: fuelCost.toFixed(2),
        tollCost: tollTotal.toFixed(2),
        cost: totalCost.toFixed(2),
        perPassenger: perPassenger.toFixed(2),
      });
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoadingRoute(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Top 2-card layout */}
      <div className="max-w-6xl w-full px-4 grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
        {/* card 1: Locations */}
        <motion.div
          className="bg-white shadow-lg rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl font-semibold mb-4">Locations</h2>

          <LocationField
            id="start-location"
            label="Start Location"
            placeholder="Enter Start Location"
            value={start}
            onTextChange={(text) => {
              setStart(text);
              setStartCoords(null); // text changed, so the old coords are stale
            }}
            onSelect={(s) => {
              setStart(s.label);
              setStartCoords(s.coords);
            }}
          />

          <LocationField
            id="end-location"
            label="Destination"
            placeholder="Enter Destination"
            className="mt-4"
            value={end}
            onTextChange={(text) => {
              setEnd(text);
              setEndCoords(null);
            }}
            onSelect={(s) => {
              setEnd(s.label);
              setEndCoords(s.coords);
            }}
          />

          <label htmlFor="vehicle" className="block text-gray-700 font-medium mt-4">
            Vehicle Type
          </label>
          <select
            id="vehicle"
            value={vehicle}
            onChange={(e) => setVehicle(e.target.value)}
            className="w-full mt-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
          >
            <option value="car">Car</option>
            <option value="bike">Motorcycle</option>
          </select>
        </motion.div>

        {/* card 2: trip settings */}
        <motion.div
          className="bg-white shadow-lg rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl font-semibold mb-4">Trip Settings</h2>

          <label htmlFor="fuel-price" className="block text-gray-700 font-medium">
            Fuel Price (€ / L)
          </label>
          <input
            id="fuel-price"
            type="number"
            min="0"
            step="0.01"
            value={fuelPrice}
            onChange={(e) => setFuelPrice(Number(e.target.value))}
            className={inputClass}
            placeholder="1.80"
          />

          <label htmlFor="consumption" className="block text-gray-700 font-medium">
            Fuel Consumption (L/100km)
          </label>
          <input
            id="consumption"
            type="number"
            min="0"
            step="0.1"
            value={consumption}
            onChange={(e) => setConsumption(Number(e.target.value))}
            className={inputClass}
            placeholder="6.5"
          />

          <div className="flex gap-10">
            <div className="flex flex-col w-full">
              <label htmlFor="passengers" className="block text-gray-700 font-medium">
                Passengers
              </label>
              <input
                id="passengers"
                type="number"
                min="1"
                step="1"
                value={passengers}
                onChange={(e) => setPassengers(Number(e.target.value))}
                className={inputClass}
              />
            </div>

            <div className="flex flex-col w-full">
              <label htmlFor="route-option" className="block text-gray-700 font-medium">
                Route Option
              </label>
              <select
                id="route-option"
                value={avoidTolls ? "noTolls" : "tolls"}
                onChange={(e) => setAvoidTolls(e.target.value === "noTolls")}
                className={inputClass}
              >
                <option value="tolls">With Tolls</option>
                <option value="noTolls">Without Tolls</option>
              </select>
            </div>
          </div>
        </motion.div>
      </div>

      {/* SEARCH BUTTON */}
      <div className="w-full flex justify-center mt-6">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={calculateRoute}
          disabled={loadingRoute}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition text-white font-semibold py-3 px-10 rounded-xl shadow-md cursor-pointer"
        >
          Search Route
        </motion.button>
      </div>

      {/* Inline error message (replaces alert()) */}
      {error && (
        <div
          role="alert"
          className="max-w-xl w-full mx-4 mt-4 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-left"
        >
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            aria-label="Dismiss error"
            className="text-red-500 hover:text-red-700 font-bold cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* Loading overlay */}
      {loadingRoute && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-500">
          <div className="bg-white p-6 rounded-xl shadow-lg flex items-center gap-3">
            <svg
              className="animate-spin h-6 w-6 text-blue-600"
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
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
            <span>Loading route...</span>
          </div>
        </div>
      )}

      {/* MAP */}
      <div
        ref={mapRef}
        className="w-full max-w-6xl h-[600px] mt-6 rounded-xl overflow-hidden shadow-lg"
      />
    </div>
  );
};

export default Map2;
