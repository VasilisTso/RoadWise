import React from "react";
import { motion } from "framer-motion"; // eslint-disable-line
import { formatDuration, formatEuro, formatKm } from "../utils/format";
import { FaReceipt, FaArrowRight } from "react-icons/fa";

function RouteSummary({ result }) {
  if (!result) return null;

  return (
    <motion.div
      className="w-full bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <FaReceipt className="text-amber-400 text-sm" />
          <h2 className="text-xs font-mono-num uppercase tracking-widest font-bold">
            Trip Telemetry &amp; Cost Breakdown
          </h2>
        </div>
        <span
          className={`text-[10px] font-mono-num uppercase px-2 py-0.5 rounded font-bold ${
            result.avoidTolls
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
          }`}
        >
          {result.avoidTolls ? "Toll-Free Route" : "Standard Tollway"}
        </span>
      </div>

      <div className="p-5 space-y-5">
        <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3.5 flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <span className="block text-[10px] font-mono-num uppercase tracking-wider text-slate-400">
              From Origin
            </span>
            <p className="text-xs font-bold text-slate-900 truncate mt-0.5" title={result.start}>
              {result.start}
            </p>
          </div>

          <div className="w-7 h-7 rounded-full bg-slate-200/70 text-slate-600 flex items-center justify-center shrink-0">
            <FaArrowRight className="text-xs" />
          </div>

          <div className="min-w-0 flex-1 text-right">
            <span className="block text-[10px] font-mono-num uppercase tracking-wider text-slate-400">
              To Destination
            </span>
            <p className="text-xs font-bold text-slate-900 truncate mt-0.5" title={result.end}>
              {result.end}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-lg border border-slate-200/80 bg-white">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Distance
            </span>
            <span className="text-lg font-mono-num font-bold text-slate-900 mt-1 block">
              {formatKm(result.distanceKm)}
            </span>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200/80 bg-white">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Est. Driving Time
            </span>
            <span className="text-lg font-mono-num font-bold text-slate-900 mt-1 block">
              {formatDuration(result.durationMin)}
            </span>
          </div>
        </div>

        <div className="border-t border-dashed border-slate-200 pt-4 space-y-2.5 text-sm">
          <div className="flex items-center justify-between text-slate-600">
            <span>Estimated Fuel Burn</span>
            <span className="font-mono-num font-semibold text-slate-900">
              {formatEuro(result.fuelCost)}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-600">
            <span>
              Highway Toll Fees ({result.tolls?.length ?? 0}{" "}
              {result.tolls?.length === 1 ? "station" : "stations"})
            </span>
            <span className="font-mono-num font-semibold text-slate-900">
              {formatEuro(result.tollCost)}
            </span>
          </div>
        </div>

        <div className="bg-slate-900 text-white rounded-xl p-4 grid grid-cols-2 gap-4 items-center">
          <div>
            <span className="text-[10px] font-mono-num uppercase tracking-widest text-slate-400 block">
              Total Trip Cost
            </span>
            <span className="text-2xl font-mono-num font-extrabold text-white mt-0.5 block">
              {formatEuro(result.totalCost)}
            </span>
          </div>

          <div className="border-l border-slate-800 pl-4">
            <span className="text-[10px] font-mono-num uppercase tracking-widest text-amber-400 block">
              Per Passenger
            </span>
            <span className="text-2xl font-mono-num font-extrabold text-amber-400 mt-0.5 block">
              {formatEuro(result.perPassenger)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default RouteSummary;