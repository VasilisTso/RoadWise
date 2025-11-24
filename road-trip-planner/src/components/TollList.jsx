import React from 'react';
import { motion } from "framer-motion"; // eslint-disable-line

function TollList({ tolls }) {
  return (
    <motion.div className="w-full mx-auto bg-white p-6 rounded-xl shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="text-xl font-semibold mb-4">Toll Information</h2>
      
      {tolls.length === 0 ? (
        <p className="text-gray-600">No tolls on this route.</p>
      ) : (
        <table className="w-full border border-gray-200 rounded-lg overflow-hidden text-center">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-3">Location</th>
              <th className="border p-3">Bike (€)</th>
              <th className="border p-3">Car (€)</th>
            </tr>
          </thead>

          <tbody>
            {tolls.map((toll, index) => (
              <tr key={index} className="hover:bg-gray-100 transition">
                <td className="border p-3">{toll.name}</td>
                <td className="border p-3">{toll.bike.toFixed(2)}</td>
                <td className="border p-3">{toll.car.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </motion.div>
  );
}

export default TollList;