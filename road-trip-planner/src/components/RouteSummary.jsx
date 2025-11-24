import React from "react";
import { motion } from "framer-motion"; // eslint-disable-line

function RouteSummary({ summary }) {
  if (!summary || !summary.distance) return null; // hide if no route

  const minutes = parseFloat(summary.duration);
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  
  return (
    <motion.div className="w-full mx-auto bg-white p-6 rounded-xl shadow-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="text-xl font-semibold mb-3">Route Summary</h2>
    
      <div className="space-y-1 text-gray-700">
        <p><strong>From:</strong> {summary.start}</p>
        <p><strong>To:</strong> {summary.end}</p>
        <p><strong>Distance:</strong> {summary.distance}</p>
        <p><strong>Duration:</strong> {hours} h {mins} m</p>
        <p><strong>Fuel Cost:</strong> €{summary.fuelCost}</p>
        <p><strong>Toll Cost:</strong> €{summary.tollCost}</p>
        <p><strong>Total Cost:</strong> €{summary.cost}</p>
        <p><strong>Per Passenger:</strong> €{summary.perPassenger}</p>
      </div>
    </motion.div>
  );
}

export default RouteSummary;
