import React from "react";
import { motion } from "framer-motion"; // eslint-disable-line
import { formatDuration, formatEuro, formatKm } from "../utils/format";

export const ROUTE_COLORS = { fast: "#2563eb", free: "#f97316" };
const LABELS = { fast: "Fastest route", free: "Toll-free route" };

function Stat({ label, value }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-gray-500">{label}</dt>
      <dd className="text-lg font-semibold text-gray-900">{value}</dd>
    </div>
  );
}

function RouteCard({ id, trip, selected, onSelect }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect(id)}
      className={`text-left bg-white rounded-2xl p-5 shadow-lg border-2 transition cursor-pointer ${
        selected ? "border-blue-600 ring-2 ring-blue-200" : "border-transparent hover:border-gray-300"
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: ROUTE_COLORS[id] }} />
        <h3 className="font-semibold text-gray-800">{LABELS[id]}</h3>
        {selected && <span className="ml-auto text-xs font-medium text-blue-700">Showing on map</span>}
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
        <Stat label="Time" value={formatDuration(trip.durationMin)} />
        <Stat label="Distance" value={formatKm(trip.distanceKm)} />
        <Stat label="Tolls" value={formatEuro(trip.tollCost)} />
        <Stat label="Total" value={formatEuro(trip.totalCost)} />
      </dl>
    </button>
  );
}

function describeDifference(fast, free) {
  const extraMin = Math.round(free.durationMin - fast.durationMin);
  const saving = fast.totalCost - free.totalCost;

  const money =
    saving > 0.005 ? `saves ${formatEuro(saving)} overall`
    : saving < -0.005 ? `costs ${formatEuro(-saving)} more overall (the extra fuel outweighs the tolls)`
    : "costs about the same";
  const time =
    extraMin > 0 ? `takes ${formatDuration(extraMin)} longer`
    : extraMin < 0 ? `is ${formatDuration(-extraMin)} faster`
    : "takes the same time";

  return `The toll-free route ${money} and ${time}.`;
}

// trips: { fast, free } with costs already calculated for the current settings
function RouteComparison({ trips, selectedId, onSelect, freeError }) {
  const { fast, free } = trips;

  return (
    <motion.div
      className="max-w-6xl w-full mx-auto px-4 mt-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className={`grid grid-cols-1 gap-4 ${free ? "md:grid-cols-2" : ""}`}>
        <RouteCard id="fast" trip={fast} selected={selectedId === "fast"} onSelect={onSelect} />
        {free && <RouteCard id="free" trip={free} selected={selectedId === "free"} onSelect={onSelect} />}
      </div>

      <p className="mt-3 text-sm text-gray-700">
        {free
          ? describeDifference(fast, free)
          : freeError
          ? `Toll-free option unavailable: ${freeError}`
          : "There are no tolls on the fastest route."}
      </p>
    </motion.div>
  );
}

export default RouteComparison;