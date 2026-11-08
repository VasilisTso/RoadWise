import React from "react";
import { motion } from "framer-motion"; // eslint-disable-line
import { formatDuration, formatEuro, formatKm } from "../utils/format";

// summary = { start, end, routeLabel, roundTrip, + the numbers from calculateTrip }
function RouteSummary({ summary }) {
  if (!summary) return null;

  return (
    <motion.div
      className="w-full mx-auto bg-white p-6 rounded-xl shadow-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="text-xl font-semibold mb-3">Route Summary</h2>

      <div className="space-y-1 text-gray-700">
        <p><strong>From:</strong> {summary.start}</p>
        <p><strong>To:</strong> {summary.end}</p>
        <p><strong>Route:</strong> {summary.routeLabel}{summary.roundTrip ? " (round trip)" : ""}</p>
        <p><strong>Distance:</strong> {formatKm(summary.distanceKm)}</p>
        <p><strong>Duration:</strong> {formatDuration(summary.durationMin)}</p>
        <p><strong>Fuel Cost:</strong> {formatEuro(summary.fuelCost)}</p>
        <p><strong>Toll Cost:</strong> {formatEuro(summary.tollCost)}</p>
        <p><strong>Total Cost:</strong> {formatEuro(summary.totalCost)}</p>
        <p><strong>Per Passenger:</strong> {formatEuro(summary.perPassenger)}</p>
      </div>
    </motion.div>
  );
}

export default RouteSummary;