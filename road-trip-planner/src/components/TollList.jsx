import React from 'react';
import { motion } from "framer-motion"; // eslint-disable-line
import { FaRoad, FaCheckCircle } from "react-icons/fa";

function TollList({ tolls, vehicle = "car" }) {
  return (
    <motion.div
      className="w-full bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200/90 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FaRoad className="text-slate-700 text-sm" />
          <h2 className="text-xs font-mono-num uppercase tracking-widest font-bold text-slate-900">
            Toll Station Ledger
          </h2>
        </div>
        <span className="text-xs font-mono-num font-semibold text-slate-500">
          {tolls.length} {tolls.length === 1 ? "Plaza" : "Plazas"} Detected
        </span>
      </div>

      {tolls.length === 0 ? (
        <div className="p-6 text-center flex flex-col items-center gap-2">
          <FaCheckCircle className="text-emerald-500 text-xl" />
          <p className="text-sm font-semibold text-slate-800">
            No toll stations on this route.
          </p>
          <p className="text-xs text-slate-500">
            Your selected path avoids all registered Greek highway toll plazas.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/60 text-[11px] font-mono-num uppercase tracking-wider text-slate-500">
                <th className="py-2.5 pl-5 pr-2 w-10">#</th>
                <th className="py-2.5 px-3">Plaza Location</th>
                <th
                  className={`py-2.5 px-3 text-right ${
                    vehicle === "bike" ? "text-slate-900 font-bold" : ""
                  }`}
                >
                  Bike (€)
                </th>
                <th
                  className={`py-2.5 pl-3 pr-5 text-right ${
                    vehicle === "car" ? "text-slate-900 font-bold" : ""
                  }`}
                >
                  Car (€)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {tolls.map((toll, index) => (
                <tr
                  key={`${toll.name}-${index}`}
                  className="hover:bg-slate-50/90 transition-colors"
                >
                  <td className="py-3 pl-5 pr-2 font-mono-num text-slate-400">
                    {String(index + 1).padStart(2, "0")}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-900">
                    {toll.name}
                  </td>
                  <td
                    className={`py-3 px-3 text-right font-mono-num ${
                      vehicle === "bike"
                        ? "font-bold text-slate-950 bg-amber-50/60"
                        : "text-slate-500"
                    }`}
                  >
                    €{toll.bike.toFixed(2)}
                  </td>
                  <td
                    className={`py-3 pl-3 pr-5 text-right font-mono-num ${
                      vehicle === "car"
                        ? "font-bold text-slate-950 bg-amber-50/60"
                        : "text-slate-500"
                    }`}
                  >
                    €{toll.car.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}

export default TollList;