import React from "react";
import { FaGasPump, FaTachometerAlt, FaUsers, FaRoad } from "react-icons/fa";

// Controlled: `settings` in, `onChange(key, value)` out.
function TripSettings({ settings, onChange }) {
  const { fuelPrice, consumption, passengers, avoidTolls } = settings;

  return (
    <div className="pt-4 border-t border-slate-100 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Fuel Price */}
        <div>
          <label
            htmlFor="fuel-price"
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5"
          >
            <FaGasPump className="text-slate-400 text-[11px]" />
            <span>Fuel Price</span>
          </label>
          <div className="relative flex items-center">
            <input
              id="fuel-price"
              type="number"
              min="0"
              step="0.01"
              value={fuelPrice}
              onChange={(e) => onChange("fuelPrice", Number(e.target.value))}
              className="w-full pl-3 pr-12 py-2.5 text-sm font-mono-num font-semibold bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-900 border border-slate-200 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 rounded-lg outline-none transition-all"
              placeholder="1.80"
            />
            <span className="absolute right-3 text-xs font-mono-num text-slate-400 pointer-events-none">
              €/L
            </span>
          </div>
        </div>

        {/* Fuel Consumption */}
        <div>
          <label
            htmlFor="consumption"
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5"
          >
            <FaTachometerAlt className="text-slate-400 text-[11px]" />
            <span>Consumption</span>
          </label>
          <div className="relative flex items-center">
            <input
              id="consumption"
              type="number"
              min="0"
              step="0.1"
              value={consumption}
              onChange={(e) => onChange("consumption", Number(e.target.value))}
              className="w-full pl-3 pr-16 py-2.5 text-sm font-mono-num font-semibold bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-900 border border-slate-200 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 rounded-lg outline-none transition-all"
              placeholder="6.5"
            />
            <span className="absolute right-3 text-xs font-mono-num text-slate-400 pointer-events-none">
              L/100km
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-end">
        {/* Passengers */}
        <div>
          <label
            htmlFor="passengers"
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5"
          >
            <FaUsers className="text-slate-400 text-[11px]" />
            <span>Passengers</span>
          </label>
          <div className="relative flex items-center">
            <input
              id="passengers"
              type="number"
              min="1"
              step="1"
              value={passengers}
              onChange={(e) => onChange("passengers", Number(e.target.value))}
              className="w-full pl-3 pr-12 py-2.5 text-sm font-mono-num font-semibold bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-900 border border-slate-200 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 rounded-lg outline-none transition-all"
            />
            <span className="absolute right-3 text-xs font-mono-num text-slate-400 pointer-events-none">
              PAX
            </span>
          </div>
        </div>

        {/* Route Option */}
        <div>
          <label
            htmlFor="route-option"
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5"
          >
            <FaRoad className="text-slate-400 text-[11px]" />
            <span>Toll Routing</span>
          </label>

          {/* Keep select for accessibility & strict DOM queries */}
          <select
            id="route-option"
            value={avoidTolls ? "noTolls" : "tolls"}
            onChange={(e) => onChange("avoidTolls", e.target.value === "noTolls")}
            className="sr-only"
          >
            <option value="tolls">With Tolls</option>
            <option value="noTolls">Without Tolls</option>
          </select>

          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200/70">
            <button
              type="button"
              onClick={() => onChange("avoidTolls", false)}
              className={`py-2 px-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
                !avoidTolls
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              With Tolls
            </button>
            <button
              type="button"
              onClick={() => onChange("avoidTolls", true)}
              className={`py-2 px-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
                avoidTolls
                  ? "bg-amber-500 text-slate-950 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Avoid Tolls
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TripSettings;