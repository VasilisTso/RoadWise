import React from "react";
import { motion } from "framer-motion"; // eslint-disable-line
import { FaRoad, FaCheckCircle, FaMapPin } from "react-icons/fa";

function TollList({ tolls, vehicle = "car", roundTrip = false, onSelectToll }) {
  return (
    <motion.div
      className="w-full bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200/90 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FaRoad className="text-slate-700 text-sm" />
          <h2 className="text-xs font-mono-num font-bold text-slate-900">
            Ordered Toll Ledger
          </h2>
        </div>
        <span className="text-xs font-mono-num font-semibold text-slate-500">
          {tolls.length} {tolls.length === 1 ? "Plaza" : "Plazas"} {roundTrip ? "(×2 Return)" : ""}
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
              <tr className="border-b border-slate-200 bg-slate-50/60 text-[11px] font-mono-num text-slate-500">
                <th className="py-2.5 pl-5 pr-2 w-10">#</th>
                <th className="py-2.5 px-3">Plaza &amp; Corridor</th>
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
                  onClick={() => onSelectToll?.(toll)}
                  title="Click to locate toll plaza on map"
                  className="hover:bg-slate-100/80 transition-colors cursor-pointer group"
                >
                  <td className="py-3 pl-5 pr-2 font-mono-num text-slate-400">
                    {String(index + 1).padStart(2, "0")}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900 group-hover:text-blue-600 flex items-center gap-1.5 transition-colors">
                      <span>{toll.name}</span>
                      <FaMapPin className="text-[10px] opacity-0 group-hover:opacity-100 text-amber-500 transition-opacity" />
                    </div>
                    {toll.highway && (
                      <div className="text-[10px] font-mono-num text-slate-400 mt-0.5 flex items-center gap-1.5">
                        <span>{toll.highway}</span>
                        {toll.type && toll.type !== "mainline" && (
                          <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            {toll.type}
                          </span>
                        )}
                      </div>
                    )}
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