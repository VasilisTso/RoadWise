import React, { useState } from "react";
import { motion } from "framer-motion"; // eslint-disable-line
import LocationField from "./LocationField";
import TripSettings from "./TripSettings";

// The input form. Locations are local state; trip settings are owned by App
// (useSettings) so results can recalculate live and settings persist.
function TripPlanner({ settings, onSettingChange, onSearch, loading, error, onDismissError }) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  // Exact [lng, lat] from a selected suggestion. Cleared when the text is edited.
  const [startCoords, setStartCoords] = useState(null);
  const [endCoords, setEndCoords] = useState(null);

  const handleSearch = () => onSearch({ start, end, startCoords, endCoords });

  return (
    <div className="w-full flex flex-col items-center">
      <div className="max-w-6xl w-full px-4 grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
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
              setStartCoords(null);
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
            value={settings.vehicle}
            onChange={(e) => onSettingChange("vehicle", e.target.value)}
            className="w-full mt-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
          >
            <option value="car">Car</option>
            <option value="bike">Motorcycle</option>
          </select>
        </motion.div>

        <TripSettings settings={settings} onChange={onSettingChange} />
      </div>

      <div className="w-full flex justify-center mt-6">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleSearch}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition text-white font-semibold py-3 px-10 rounded-xl shadow-md cursor-pointer"
        >
          Search Route
        </motion.button>
      </div>

      {error && (
        <div
          role="alert"
          className="max-w-xl w-full mx-4 mt-4 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-left"
        >
          <span>{error}</span>
          <button
            onClick={onDismissError}
            aria-label="Dismiss error"
            className="text-red-500 hover:text-red-700 font-bold cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-500">
          <div className="bg-white p-6 rounded-xl shadow-lg flex items-center gap-3">
            <svg className="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            <span>Loading route...</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default TripPlanner;