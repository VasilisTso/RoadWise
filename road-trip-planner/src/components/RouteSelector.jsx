import React from 'react';

function RouteSelector({ selectedRoute, onChange }) {
  return(
    <>
        <section class="input-section">
            <label className="mr-4 font-semibold">Choose Route:</label>
            <div class="location-inputs">
                <input type="text" id="start" placeholder="Start Location"/>
                <input type="text" id="end" placeholder="Destination"/>
                <button onclick="calculateRoute()" id="searchBtn">Search</button>
            </div>

            <div class="trip-info">
                <p><strong>From:</strong> <span id="fromDisplay">-</span></p>
                <p><strong>To:</strong> <span id="toDisplay">-</span></p>
                <p><strong>Distance:</strong> <span id="distance">0km</span></p>
                <p><strong>Time:</strong> <span id="duration">-</span></p>
                <label for="vehicle">Vehicle: </label>
                <select id="vehicle">
                    <option value="car">Car</option>
                    <option value="bike">Bike</option>
                </select>
            </div>

            <div class="fuel-cost-section">
                <label for="fuel-type">Fuel Type: </label>
                <select id="fuel-type">
                    <option value="gasoline">Gasoline</option>
                    <option value="diesel">Diesel</option>
                </select>

                <div class="fuel-input">
                    <label>Fuel Price (/L): </label>
                    <input type="number" id="fuel-price" value="1.80" step="0.01"/>
                    <button onclick="adjustValue('fuel-price', -0.1)">-</button>
                    <button onclick="adjustValue('fuel-price', 0.1)">+</button>
                </div>

                <div class="fuel-input">
                    <label>Consumption (L/100km): </label>
                    <button onclick="adjustValue('consumption', -0.1)">- 0.1</button>
                    <button onclick="adjustValue('consumption', 0.1)">+ 0.1</button>
                    <input type="number" id="consumption" value="6.5" step="0.1"/>
                    <button onclick="adjustValue('consumption', -0.5)">- 0.5</button>
                    <button onclick="adjustValue('consumption', 0.5)">+ 0.5</button>
                </div>

                <div class="fuel-cost-display">
                    <p><strong>Total Fuel Cost:</strong> <span id="fuel-cost">0 €</span></p>
                    <label>Passengers: </label>
                    <select id="passengers">
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                    </select>
                    <p><strong>Cost Per Passenger:</strong> <span id="cost-per-passenger">0 €</span></p>
                </div>

                <label for="route-option">Route Option: </label>
                <button
                    className={`mr-2 px-4 py-2 rounded ${selectedRoute === 'toll' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    onClick={() => onChange('toll')}
                >
                    With Tolls
                </button>
                <button
                    className={`px-4 py-2 rounded ${selectedRoute === 'no-toll' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    onClick={() => onChange('no-toll')}
                >
                    Without Tolls
                </button>
            </div>
    </section>
    </>
  );
}

export default RouteSelector
