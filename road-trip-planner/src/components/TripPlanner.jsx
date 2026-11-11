import React, { useState } from "react";
import { motion } from "framer-motion"; // eslint-disable-line
import { FaCar, FaMotorcycle, FaCompass, FaExclamationTriangle, FaTimes } from "react-icons/fa";
import LocationField from "./LocationField";
import TripSettings from "./TripSettings";

// The input form. It owns form state only; searching, loading and errors
// belong to useRoute and arrive as props.
function TripPlanner({ onSearch, loading, error, onDismissError }) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  // Exact [lng, lat] from a selected suggestion. Cleared when the text is edited.
  const [startCoords, setStartCoords] = useState(null);
  const [endCoords, setEndCoords] = useState(null);

  const [settings, setSettings] = useState({
    vehicle: "car",
    fuelPrice: 1.8,
    consumption: 6.5,
    passengers: 1,
    avoidTolls: false,
  });

  const updateSetting = (key, value) => setSettings((s) => ({ ...s, [key]: value }));

  const handleSearch = () =>
    onSearch({ start, end, startCoords, endCoords, ...settings });

  return (
    <motion.div
      className="bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Panel Header */}
      <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <FaCompass className="text-amber-400 text-base" />
          <h2 className="text-xs font-mono-num uppercase tracking-widest font-bold">
            Trip Parameters
          </h2>
        </div>
        <span className="text-[11px] font-mono-num text-slate-400">
          EUR (€) • Metric
        </span>
      </div>

      <div className="p-5 space-y-6">
        {/* Section 1: Waypoints */}
        <div className="space-y-3.5 relative">
          <LocationField
            id="start-location"
            label="Origin Waypoint"
            placeholder="e.g. Athens, Greece"
            badgeColor="bg-emerald-500"
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
            label="Destination Waypoint"
            placeholder="e.g. Thessaloniki, Greece"
            badgeColor="bg-amber-500"
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
        </div>

        {/* Section 2: Vehicle Class Segmented Toggle */}
        <div className="pt-2 border-t border-slate-100">
          <label
            htmlFor="vehicle"
            className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2"
          >
            Vehicle Classification
          </label>

          {/* Keep hidden select for screen readers / strict id compatibility */}
          <select
            id="vehicle"
            value={settings.vehicle}
            onChange={(e) => updateSetting("vehicle", e.target.value)}
            className="sr-only"
          >
            <option value="car">Car</option>
            <option value="bike">Motorcycle</option>
          </select>

          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg border border-slate-200/70">
            <button
              type="button"
              onClick={() => updateSetting("vehicle", "car")}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-bold transition-all cursor-pointer ${
                settings.vehicle === "car"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FaCar className={settings.vehicle === "car" ? "text-amber-400" : "text-slate-400"} />
              <span>Car (Cat. 2)</span>
            </button>

            <button
              type="button"
              onClick={() => updateSetting("vehicle", "bike")}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-bold transition-all cursor-pointer ${
                settings.vehicle === "bike"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FaMotorcycle className={settings.vehicle === "bike" ? "text-amber-400" : "text-slate-400"} />
              <span>Motorcycle (Cat. 1)</span>
            </button>
          </div>
        </div>

        {/* Section 3: Fuel, Passengers & Toll Preference */}
        <TripSettings settings={settings} onChange={updateSetting} />

        {/* Error Alert */}
        {error && (
          <div
            role="alert"
            className="flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50/90 px-3.5 py-3 text-xs font-medium text-red-800"
          >
            <div className="flex items-start gap-2.5">
              <FaExclamationTriangle className="text-red-500 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={onDismissError}
              aria-label="Dismiss error"
              className="text-red-500 hover:text-red-800 p-0.5 cursor-pointer"
            >
              <FaTimes />
            </button>
          </div>
        )}

        {/* Submit Button */}
        <motion.button
          whileTap={{ scale: 0.985 }}
          onClick={handleSearch}
          disabled={loading}
          className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition-all text-white font-bold text-sm py-3.5 px-6 rounded-lg shadow-sm flex items-center justify-center gap-2.5 cursor-pointer border border-slate-950"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-4 w-4 text-amber-400"
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
              <span className="font-mono-num text-xs uppercase tracking-wider">
                Computing Telemetry...
              </span>
            </>
          ) : (
            <>
              <span>Calculate Route &amp; Expenses</span>
              <span className="text-amber-400 font-mono-num text-xs">→</span>
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}

export default TripPlanner;