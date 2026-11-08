import React from "react";
import { motion } from "framer-motion"; // eslint-disable-line

const inputClass =
  "w-full mt-1 mb-4 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none";

// Controlled: `settings` in, `onChange(key, value)` out.
function TripSettings({ settings, onChange }) {
  const { fuelPrice, consumption, passengers, avoidTolls } = settings;

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
            onChange={(e) => onChange("passengers", Number(e.target.value))}
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
            onChange={(e) => onChange("avoidTolls", e.target.value === "noTolls")}
            className={inputClass}
          >
            <option value="tolls">With Tolls</option>
            <option value="noTolls">Without Tolls</option>
          </select>
        </div>
      </div>
    </motion.div>
  );
}

export default TripSettings;