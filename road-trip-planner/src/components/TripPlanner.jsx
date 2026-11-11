import React, { useState } from "react";
import { motion } from "framer-motion"; // eslint-disable-line
import {
  FaCar,
  FaMotorcycle,
  FaCompass,
  FaExclamationTriangle,
  FaTimes,
  FaExchangeAlt,
  FaCrosshairs,
} from "react-icons/fa";
import LocationField from "./LocationField";
import TripSettings from "./TripSettings";
import { reverseGeocode } from "../services/ors";

function TripPlanner({
  start,
  end,
  onStartChange,
  onEndChange,
  onStartSelect,
  onEndSelect,
  onSwap,
  settings,
  onSettingChange,
  onSearch,
  loading,
  error,
  onDismissError,
  hasActiveRoute = false,
}) {
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState(null);

  const handleUseMyLocation = () => {
    setGeoError(null);
    if (!("geolocation" in navigator)) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const label = await reverseGeocode(latitude, longitude);
          // ORS expects [lng, lat]
          onStartSelect({ label, coords: [longitude, latitude] });
        } catch {
          setGeoError("Could not determine your address.");
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError("Location permission denied. Enable GPS access in your browser.");
        } else {
          setGeoError("Unable to retrieve your current GPS position.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

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
          {hasActiveRoute ? "Live Telemetry Sync" : "EUR (€) • Metric"}
        </span>
      </div>

      <div className="p-5 space-y-5">
        <div className="relative space-y-2">
          <LocationField
            id="start-location"
            label="Origin Waypoint"
            placeholder="e.g. Athens, Greece"
            badgeColor="bg-emerald-500"
            value={start}
            onTextChange={onStartChange}
            onSelect={onStartSelect}
            rightAction={
              <button
                type="button"
                onClick={handleUseMyLocation}
                disabled={locating}
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 hover:text-blue-800 disabled:opacity-50 cursor-pointer transition-colors"
                title="Use current GPS coordinates"
              >
                <FaCrosshairs className={locating ? "animate-spin" : ""} />
                <span>{locating ? "Locating..." : "Use My Location"}</span>
              </button>
            }
          />

          <div className="flex items-center justify-center py-0.5">
            <div className="h-px bg-slate-100 flex-1" />
            <button
              type="button"
              onClick={onSwap}
              aria-label="Swap origin and destination"
              title="Swap Origin & Destination"
              className="mx-2 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-900 text-slate-600 hover:text-amber-400 border border-slate-200/80 text-xs font-mono-num font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <FaExchangeAlt className="rotate-90 text-[10px]" />
              <span className="text-[10px] uppercase tracking-wider">Swap</span>
            </button>
            <div className="h-px bg-slate-100 flex-1" />
          </div>

          <LocationField
            id="end-location"
            label="Destination Waypoint"
            placeholder="e.g. Thessaloniki, Greece"
            badgeColor="bg-amber-500"
            value={end}
            onTextChange={onEndChange}
            onSelect={onEndSelect}
          />

          {geoError && (
            <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200/80 rounded-md px-2.5 py-1.5 mt-1">
              {geoError}
            </p>
          )}
        </div>

        <div className="pt-3 border-t border-slate-100">
          <label
            htmlFor="vehicle"
            className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2"
          >
            Vehicle Classification
          </label>

          <select
            id="vehicle"
            value={settings.vehicle}
            onChange={(e) => onSettingChange("vehicle", e.target.value)}
            className="sr-only"
          >
            <option value="car">Car</option>
            <option value="bike">Motorcycle</option>
          </select>

          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg border border-slate-200/70">
            <button
              type="button"
              onClick={() => onSettingChange("vehicle", "car")}
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
              onClick={() => onSettingChange("vehicle", "bike")}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-bold transition-all cursor-pointer ${
                settings.vehicle === "bike"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FaMotorcycle
                className={settings.vehicle === "bike" ? "text-amber-400" : "text-slate-400"}
              />
              <span>Motorcycle (Cat. 1)</span>
            </button>
          </div>
        </div>

        <TripSettings settings={settings} onChange={onSettingChange} />

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

        <motion.button
          whileTap={{ scale: 0.985 }}
          onClick={onSearch}
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
                Computing Both Routes...
              </span>
            </>
          ) : (
            <>
              <span>Calculate Route &amp; Compare Tolls</span>
              <span className="text-amber-400 font-mono-num text-xs">→</span>
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}

export default TripPlanner;