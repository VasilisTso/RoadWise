//merged RouteSelector.jsx and Map2.jsx
import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import tollData from "../data/tolls.json";
import { motion } from "framer-motion"; // eslint-disable-line

const API_KEY = import.meta.env.VITE_ORS_API_KEY;

// Utility functions
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

async function geocode(place) {
  const response = await fetch(
    `https://api.openrouteservice.org/geocode/search?api_key=${API_KEY}&text=${encodeURIComponent(
      place
    )}`
  );
  const data = await response.json();
  return data.features[0]?.geometry?.coordinates; // [lng, lat]
}

async function fetchRoute(startCoords, endCoords, avoidTolls = false) {
  try {
    const response = await fetch(
      "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: API_KEY,
        },
        body: JSON.stringify({
          // Coordinates must be [lng, lat] (ORS format)
          coordinates: [startCoords, endCoords],
          instructions: false,
          options: avoidTolls ? { avoid_features: ["tollways"] } : {},
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ORS API error:", errorText);
      alert("Routing API error. See console for details.");
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Fetch failed:", error);
    alert("Request failed. See console for error.");
    return null;
  }
}

//convert min to hr+min
function convertToHoursAndMinutes(totalMinutes) {
	const hours = Math.floor(totalMinutes / 60);
	const minutes = Math.round(totalMinutes % 60);
	return [hours, minutes];
}

const Map2 = (props) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  // New states to store exact coordinates from autocomplete for ORS format
  const [startCoords, setStartCoords] = useState(null); // eslint-disable-line
  const [endCoords, setEndCoords] = useState(null); // eslint-disable-line

  const [avoidTolls, setAvoidTolls] = useState(false);
  const [vehicle, setVehicle] = useState("car");
  const [fuelPrice, setFuelPrice] = useState(1.8);
  const [consumption, setConsumption] = useState(6.5);
  const [passengers, setPassengers] = useState(1);

  const [routeLayer, setRouteLayer] = useState(null);
  const [tollMarkers, setTollMarkers] = useState([]);

  // notif until route is loaded
  const [loadingRoute, setLoadingRoute] = useState(false);

  const [info, setInfo] = useState({ // eslint-disable-line
    start: "-", 
    end:"-", 
    distance: "-", 
    duration: "-", 
    tolls: [], 
    cost: 0 
  });


  // Auto complete suggestions for start/end destination 
  const [startSuggestions, setStartSuggestions] = useState([]);
  const [endSuggestions, setEndSuggestions] = useState([]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // map now correctly attaches to ref={mapRef}
    mapInstance.current = L.map(mapRef.current).setView([39.0742, 21.8243], 7);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(mapInstance.current);
  }, []);

  /* Auto complete suggestions for start/end destination */
  const fetchSuggestions = async (query, setter) => {
    if (!query) {
      setter([]);
      return;
    }

    let didSetSuggestions = false; // flag to prevent duplicate setting

    try {
      const res = await fetch(
        `https://api.openrouteservice.org/geocode/autocomplete?api_key=${API_KEY}&text=${encodeURIComponent(query)}`
      );

      if (!res.ok) throw new Error("ORS Autocomplete failed");

      const data = await res.json();
      
      // Store both label and coords
      const suggestions = data.features.map((f) => ({
        label: f.properties.label,
        coords: f.geometry.coordinates
      }));

      setter(suggestions);
      didSetSuggestions = true;
    } catch (err) {
      console.error("ORS autocomplete failed, falling back to geocode:", err);
    }
      
    // fallback: always provide at least one option if ORS autocomplete failed
    if (!didSetSuggestions) {
      try {
        const coords = await geocode(query);
        if (coords) {
          setter([{ label: query, coords }]);
        } else {
          setter([]);
        }
      } catch (fallbackErr) {
        console.error("Fallback geocode also failed:", fallbackErr);
        setter([]);
      }
    }
  };

  const calculateRoute = async () => {
    setLoadingRoute(true); //start loading

    try {
      // Prefer the coords selected from suggestions. If none, fallback to geocoding.
      const sCoords = startCoords || (await geocode(start));
      const eCoords = endCoords || (await geocode(end));

      if (!sCoords || !eCoords) {
        alert("Invalid start or end point");
        return;
      }

      // Request ORS route
      const routeData = await fetchRoute(sCoords, eCoords, avoidTolls);
      if (!routeData || !routeData.features?.length) return;

      // Leaflet expects [lat, lng]
      const coords = routeData.features[0].geometry.coordinates.map((
        [lng, lat]) => [lat, lng]
      );

      if (routeLayer) routeLayer.remove();
      tollMarkers.forEach((m) => m.remove());
      setTollMarkers([]);

      const newLayer = L.polyline(coords, {
        color: avoidTolls ? "orange" : "blue",
        weight: 5,
      }).addTo(mapInstance.current);

      setRouteLayer(newLayer);
      mapInstance.current.fitBounds(newLayer.getBounds());

      const distanceKm = routeData.features[0].properties.summary.distance / 1000;
      const durationMin = routeData.features[0].properties.summary.duration / 60;

      const tollsOnRoute = !avoidTolls ? getTollsOnRoute(tollData, coords) : [];

      const newMarkers = tollsOnRoute.map((toll) =>
        L.marker([toll.lat, toll.lng])
          .bindPopup(
            `<strong>${toll.name}</strong><br/>Car: €${toll.car.toFixed(
              2
            )}<br/>Bike: €${toll.bike.toFixed(2)}`
          )
          .addTo(mapInstance.current)
      );
      setTollMarkers(newMarkers);

      //Notify parent component
      if (props.onTollUpdate) {
        props.onTollUpdate(tollsOnRoute);
      }

      const tollTotal = tollsOnRoute.reduce((sum, t) => sum + t[vehicle], 0);
      const fuelCost = (distanceKm * consumption * fuelPrice) / 100;
      const totalCost = fuelCost + tollTotal;
      const perPassenger = passengers > 0 ? totalCost / passengers : totalCost;

      setInfo({
      start: `${start}`,
      end: `${end}`,
        distance: `${distanceKm.toFixed(1)} km`,
        duration: (() => {
          const [h, m] = convertToHoursAndMinutes(durationMin);
          return `${h}h ${m}min`;
        })(),
        tolls: tollsOnRoute,
        cost: totalCost.toFixed(2),
        perPassenger: perPassenger.toFixed(2),
        fuelCost: fuelCost.toFixed(2),
        tollCost: tollTotal.toFixed(2),
      });

      //route summary
      if (props.onSummaryUpdate) {
        props.onSummaryUpdate({
          start,
          end,
          distance: `${distanceKm.toFixed(1)} km`,
          duration: durationMin,
          fuelCost: fuelCost.toFixed(2),
          tollCost: tollTotal.toFixed(2),
          cost: totalCost.toFixed(2),
          perPassenger: perPassenger.toFixed(2),
        });
      }
    } finally {
      setLoadingRoute(false); // stop loading regardless of success/error
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Top 2-card layout */}
      <div className="max-w-6xl w-full px-4 grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
        {/* card 1: Locations */}
        <motion.div className="bg-white shadow-lg rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl font-semibold mb-4">Locations</h2>

          {/* Start Location */}
          <label className="block text-gray-700 font-medium">Start Location</label>
          <input className="w-full mt-1 p-3 border border-gray-300 rounded-t-xl focus:ring-2 focus:ring-blue-300 outline-none"
            placeholder="Enter Start Location" value={start} 
            onChange={(e) => {setStart(e.target.value); fetchSuggestions(e.target.value, setStartSuggestions);}} 
          />
          {startSuggestions.length > 0 && (
            <ul className="border border-gray-300 mb-4 py-1 px-2 rounded-b-xl shadow-md bg-gray-300/80 max-h-38 overflow-auto">
              {startSuggestions.map((s, i) => (
                <li key={i}
                  onClick={() => {
                    setStart(s.label);
                    setStartSuggestions([]);
                  }}
                  className="p-3 hover:bg-gray-100 cursor-pointer"
                >
                  {s.label}
                </li>
              ))}
            </ul>
          )}

          {/* Destination */}
          <label className="block text-gray-700 font-medium mt-4">Destination</label>
          <input className="w-full mt-1 p-3 border border-gray-300 rounded-t-xl focus:ring-2 focus:ring-blue-300 outline-none"
            placeholder="Enter Destination" value={end} 
            onChange={(e) => {setEnd(e.target.value); fetchSuggestions(e.target.value, setEndSuggestions);}} 
          />
          {endSuggestions.length > 0 && (
            <ul className="border border-gray-300 mb-4 py-1 px-2 rounded-b-xl shadow-md bg-gray-300/80 max-h-38 overflow-auto">
              {endSuggestions.map((s, i) => (
                <li key={i}
                  onClick={() => {
                    setEnd(s.label);
                    setEndSuggestions([]);
                  }}
                  className="p-3 hover:bg-gray-100 cursor-pointer"
                >
                  {s.label}
                </li>
              ))}
            </ul>
          )}

          {/* Vehicle Type */}
          <label className="block text-gray-700 font-medium mt-4">Vehicle Type</label>
          <select value={vehicle}
            onChange={(e) => setVehicle(e.target.value)}
            className="w-full mt-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
          >
            <option value="car">Car</option>
            <option value="bike">Motorcycle</option>
          </select>
        </motion.div>

        {/* card 2: trip settings */}
        <motion.div className="bg-white shadow-lg rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl font-semibold mb-4">Trip Settings</h2>

          {/* Fuel Price */}
          <label className="block text-gray-700 font-medium">Fuel Price (€ / L)</label>
          <input
            type="number"
            value={fuelPrice}
            step="0.01"
            onChange={(e) => setFuelPrice(Number(e.target.value))}
            className="w-full mt-1 mb-4 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
            placeholder="1.80"
          />

          {/* Fuel Consumption */}
          <label className="block text-gray-700 font-medium">Fuel Consumption (L/100km)</label>
          <input
            type="number"
            value={consumption}
            onChange={(e) => setConsumption(Number(e.target.value))}
            className="w-full mt-1 mb-4 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
            placeholder="6.5"
          />

          <div className="flex gap-10">
            {/* Passengers */}
            <div className="flex flex-col w-full">
              <label className="block text-gray-700 font-medium">Passengers</label>
              <input type="number"
                value={passengers}
                onChange={(e) => setPassengers(Number(e.target.value))}
                className="w-full mt-1 mb-4 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>

            {/* Route Type */}
            <div className="flex flex-col w-full">
              <label className="block text-gray-700 font-medium">Route Option</label>
              <select value={avoidTolls ? "noTolls" : "tolls"}
                onChange={(e) => setAvoidTolls(e.target.value === "noTolls")}
                className="w-full mt-1 mb-4 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
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
          className="bg-blue-600 hover:bg-blue-700 transition text-white font-semibold py-3 px-10 rounded-xl shadow-md cursor-pointer"
        >
          Search Route
        </motion.button>
      </div>

      {/* Loading results notification */}
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

      {/* SUMMARY CARDS */}
      {/* RouteSummary.jsx
      {info && info.distance && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-4xl w-full mt-10 px-4"
        >
          <div className="bg-white p-6 rounded-2xl shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Route Summary</h2>
            <p><strong>Distance:</strong> {info.distance}</p>
            <p><strong>Duration:</strong> {info.duration}</p>
            <p><strong>Fuel Cost:</strong> €{info.fuelCost}</p>
            <p><strong>Toll Cost:</strong> €{info.tollCost}</p>
            <p><strong>Total Cost:</strong> €{info.cost}</p>
            <p><strong>Per Passenger:</strong> €{info.perPassenger}</p>
          </div>
        </motion.div>
      )}
      */}

      {/* MAP */}
      <div ref={mapRef}
        className="w-full max-w-6xl h-[600px] mt-6 rounded-xl overflow-hidden shadow-lg" 
      />

      {/* TOLL LIST */}
      {/* TollList.jsx
      <div className="w-full">
        <div className="max-w-4xl mx-auto mt-6 bg-white shadow-md rounded-xl p-5">
          <p className="text-gray-700 text-lg">
            <strong>All Tolls:</strong>{" "}
            {info.tolls.length
              ? info.tolls
                  .map((t) => `${t.name} (€${t[vehicle].toFixed(2)})`)
                  .join(", ")
              : "None"}
          </p>
        </div>
      </div>
      */}

    </div>
  );
};

export default Map2;