import React from "react";
import { motion } from "framer-motion"; // eslint-disable-line

const inputClass =
  "w-full mt-1 mb-4 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none";

// Controlled: `settings` in, `onChange(key, value)` out.
// (The toll / toll-free choice now lives in the route comparison cards.)
function TripSettings({ settings, onChange }) {
  const { fuelPrice, consumption, passengers, roundTrip } = settings;

  return (
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
        onChange={(e) => onChange("fuelPrice", Number(e.target.value))}
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
        onChange={(e) => onChange("consumption", Number(e.target.value))}
        className={inputClass}
        placeholder="6.5"
      />

      <div className="flex gap-6">
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
            onChange={(e) => onChange("passengers", Number(e.target.value))}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col w-full">
          <span className="block text-gray-700 font-medium">Trip Type</span>
          <label
            htmlFor="round-trip"
            className="mt-1 mb-4 p-3 border border-gray-300 rounded-xl flex items-center gap-3 cursor-pointer focus-within:ring-2 focus-within:ring-blue-400"
          >
            <input
              id="round-trip"
              type="checkbox"
              checked={roundTrip}
              onChange={(e) => onChange("roundTrip", e.target.checked)}
              className="h-5 w-5 accent-blue-600"
            />
            Round trip
          </label>
        </div>
      </div>
    </motion.div>
  );
}

export default TripSettings;