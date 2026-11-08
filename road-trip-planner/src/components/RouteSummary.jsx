import React from "react";
import { motion } from "framer-motion"; // eslint-disable-line
import { formatDuration, formatEuro, formatKm } from "../utils/format";

// `result` is the object produced by useRoute (numbers, not preformatted strings)
function RouteSummary({ result }) {
  if (!result) return null;

  return (
    <motion.div
      className="w-full mx-auto bg-white p-6 rounded-xl shadow-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="text-xl font-semibold mb-3">Route Summary</h2>

      <div className="space-y-1 text-gray-700">
        <p><strong>From:</strong> {result.start}</p>
        <p><strong>To:</strong> {result.end}</p>
        <p><strong>Distance:</strong> {formatKm(result.distanceKm)}</p>
        <p><strong>Duration:</strong> {formatDuration(result.durationMin)}</p>
        <p><strong>Fuel Cost:</strong> {formatEuro(result.fuelCost)}</p>
        <p><strong>Toll Cost:</strong> {formatEuro(result.tollCost)}</p>
        <p><strong>Total Cost:</strong> {formatEuro(result.totalCost)}</p>
        <p><strong>Per Passenger:</strong> {formatEuro(result.perPassenger)}</p>
      </div>
    </motion.div>
  );
}

export default RouteSummary;