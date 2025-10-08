//merged RouteSelector.jsx and Map2.jsx
import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import tollData from "../data/tolls.json";

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
  return data.features[0]?.geometry?.coordinates;
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
  const [avoidTolls, setAvoidTolls] = useState(false);
  const [vehicle, setVehicle] = useState("car");
  const [fuelPrice, setFuelPrice] = useState(1.8);
  const [consumption, setConsumption] = useState(6.5);
  const [passengers, setPassengers] = useState(1);
  const [routeLayer, setRouteLayer] = useState(null);
  const [tollMarkers, setTollMarkers] = useState([]);
  const [info, setInfo] = useState({start: "-", end:"-", distance: "-", duration: "-", tolls: [], cost: 0 });

  /* Auto complete suggestions for start/end destination */
  const [startSuggestions, setStartSuggestions] = useState([]);
  const [endSuggestions, setEndSuggestions] = useState([]);


  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

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

    try {
      const res = await fetch(
        `https://api.openrouteservice.org/geocode/autocomplete?api_key=${API_KEY}&text=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      const suggestions = data.features.map((f) => ({
        label: f.properties.label,
        coords: f.geometry.coordinates
      }));
      setter(suggestions);
    } catch (err) {
      console.error("Autocomplete error:", err);
      setter([]);
    }
  };


  const adjustValue = (setter, delta) => setter((prev) => Math.max(prev + delta, 0));

  const calculateRoute = async () => {
    const startCoords = await geocode(start);
    const endCoords = await geocode(end);

    if (!startCoords || !endCoords) {
      alert("Invalid start or end point");
      return;
    }

    const routeData = await fetchRoute(startCoords, endCoords, avoidTolls);
    if (!routeData || !routeData.features?.length) return;

    const coords = routeData.features[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);

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

	/* ADDED */
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
  };

  return (
    <div className="my-6">
      <section className="input-section">
        <div className="location-inputs">
          <input placeholder="Start Location" value={start} onChange={(e) => {setStart(e.target.value); fetchSuggestions(e.target.value, setStartSuggestions);}} />
          {startSuggestions.length > 0 && (
            <ul className="autocomplete-list">
              {startSuggestions.map((s, i) => (
                <li
                  key={i}
                  onClick={() => {
                    setStart(s.label);
                    setStartSuggestions([]);
                  }}
                >
                  {s.label}
                </li>
              ))}
            </ul>
          )}
          <input placeholder="Destination" value={end} onChange={(e) => {setEnd(e.target.value); fetchSuggestions(e.target.value, setEndSuggestions);}} />
          {endSuggestions.length > 0 && (
            <ul className="autocomplete-list">
              {endSuggestions.map((s, i) => (
                <li
                  key={i}
                  onClick={() => {
                    setEnd(s.label);
                    setEndSuggestions([]);
                  }}
                >
                  {s.label}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="trip-info">
		  <p><strong>From:</strong> <span id="fromDisplay">{info.start}</span></p>
          <p><strong>To:</strong> <span id="toDisplay">{info.end}</span></p>	
          <p><strong>Distance:</strong> {info.distance}</p>
          <p><strong>Duration:</strong> {info.duration}</p>
          <label>Vehicle:</label>
          <select value={vehicle} onChange={(e) => setVehicle(e.target.value)}>
            <option value="car">Car</option>
            <option value="bike">Bike</option>
          </select>
        </div>

        <div className="fuel-cost-section">
          <label>Fuel Type:</label>
          <select>
            <option value="gasoline">Gasoline</option>
            <option value="diesel">Diesel</option>
          </select>

          <div className="fuel-input">
            <label>Fuel Price (/L):</label>
            <button onClick={() => adjustValue(setFuelPrice, -0.1)}>-</button>
            <input type="number" value={fuelPrice} step="0.01" onChange={(e) => setFuelPrice(Number(e.target.value))} />
            <button onClick={() => adjustValue(setFuelPrice, 0.1)}>+</button>
          </div>

          <div className="fuel-input">
            <label>Consumption (L/100km):</label>
            <button onClick={() => adjustValue(setConsumption, -0.1)}>- 0.1</button>
            <button onClick={() => adjustValue(setConsumption, 0.1)}>+ 0.1</button>
            <input type="number" value={consumption} step="0.1" onChange={(e) => setConsumption(Number(e.target.value))} />
            <button onClick={() => adjustValue(setConsumption, -0.5)}>- 0.5</button>
            <button onClick={() => adjustValue(setConsumption, 0.5)}>+ 0.5</button>
          </div>

          <div className="fuel-cost-display">
            *<p><strong>Fuel Cost:</strong> €{info.fuelCost ?? "0.00"}</p>
            <p><strong>Toll Cost:</strong> €{info.tollCost ?? "0.00"}</p>
            <p><strong>Total Trip Cost:</strong> €{info.cost}</p>
            
            <label>Passengers:</label>
            <select value={passengers} onChange={(e) => setPassengers(Number(e.target.value))}>
              {[1, 2, 3, 4, 5].map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <p><strong>Cost Per Passenger:</strong> €{info.perPassenger}</p>
          </div>

			  
        	<label htmlFor="route-option">Route Option:</label>
			<select
				id="route-option"
				value={avoidTolls ? "noTolls" : "tolls"}
				onChange={(e) => setAvoidTolls(e.target.value === "noTolls")}
			>
				<option value="tolls">With Tolls</option>
				<option value="noTolls">Without Tolls</option>
			</select> 
        </div>

        <button onClick={calculateRoute}>Search</button>
      </section>

      <div ref={mapRef} className="mapRef" id="map2"></div>

      <div className="tolls-used">
        <p>
          <strong>Tolls:</strong>{" "}
          {info.tolls.length
            ? info.tolls.map((t) => `${t.name} (€${t[vehicle].toFixed(2)})`).join(", ")
            : "None"}
        </p>
      </div>
    </div>
  );
};

export default Map2;