import React from 'react';
import { motion } from "framer-motion"; // eslint-disable-line
import { formatEuro } from "../utils/format";

// tolls are listed in driving order. The selected vehicle's column is highlighted
// and totalled (doubled for a round trip).
function TollList({ tolls, vehicle, roundTrip }) {
  const multiplier = roundTrip ? 2 : 1;
  const total = tolls.reduce((sum, t) => sum + (t[vehicle] ?? 0), 0) * multiplier;
  const col = (v) => (v === vehicle ? "bg-blue-50 font-semibold" : "");

  return (
    <motion.div className="w-full mx-auto bg-white p-6 rounded-xl shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="text-xl font-semibold mb-4">Toll Information</h2>

      {tolls.length === 0 ? (
        <p className="text-gray-600">No tolls on this route.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-lg overflow-hidden text-center">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-3">#</th>
                  <th className="border p-3 text-left">Location</th>
                  <th className="border p-3">≈ km</th>
                  <th className="border p-3">Bike (€)</th>
                  <th className="border p-3">Car (€)</th>
                </tr>
              </thead>

              <tbody>
                {tolls.map((toll, index) => (
                  <tr key={`${toll.name}-${index}`} className="hover:bg-gray-100 transition">
                    <td className="border p-3">{index + 1}</td>
                    <td className="border p-3 text-left">{toll.name}</td>
                    <td className="border p-3">{Math.round(toll.distanceAlongKm)}</td>
                    <td className={`border p-3 ${col("bike")}`}>{toll.bike.toFixed(2)}</td>
                    <td className={`border p-3 ${col("car")}`}>{toll.car.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-3 text-gray-700">
            <strong>Total ({vehicle === "bike" ? "motorcycle" : "car"}):</strong> {formatEuro(total)}
            {roundTrip && <span className="text-gray-500"> (round trip: tolls counted twice)</span>}
          </p>
        </>
      )}
    </motion.div>
  );
}

export default TollList;