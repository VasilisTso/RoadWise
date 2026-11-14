import React, { useState } from "react";
import { motion } from "framer-motion"; // eslint-disable-line
import { formatDuration, formatEuro, formatKm } from "../utils/format";
import {
  FaReceipt,
  FaArrowRight,
  FaShareAlt,
  FaCopy,
  FaCheck,
  FaBalanceScale,
} from "react-icons/fa";

function RouteSummary({ result, comparison, onSelectRouteMode }) {
  const [copiedSplit, setCopiedSplit] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!result) return null;

  const withTolls = comparison?.withTolls;
  const withoutTolls = comparison?.withoutTolls;

  // Calculate savings & time trade-off between With Tolls and Toll-Free
  const moneySavedNoTolls =
    withTolls && withoutTolls ? withTolls.totalCost - withoutTolls.totalCost : 0;
  const extraMinutesNoTolls =
    withTolls && withoutTolls
      ? Math.round(withoutTolls.durationMin - withTolls.durationMin)
      : 0;

  const handleCopySplit = async () => {
    const legLabel = result.roundTrip ? "Round-Trip (2x)" : "One-Way (1x)";
    const modeLabel = result.avoidTolls ? "Toll-Free Route" : "Highway (With Tolls)";
    const text = [
      `🚗 RoadWise Trip Split (${legLabel})`,
      `📍 ${result.start} → ${result.end}`,
      `🛣️ ${formatKm(result.distanceKm)} • ${formatDuration(result.durationMin)} (${modeLabel})`,
      `⛽ Fuel: ${formatEuro(result.fuelCost)} | 🚧 Tolls: ${formatEuro(result.tollCost)}`,
      `💶 Total: ${formatEuro(result.totalCost)} (${formatEuro(result.perPassenger)} / person for ${result.passengers} ${result.passengers === 1 ? "passenger" : "passengers"})`,
      `🔗 ${window.location.href}`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopiedSplit(true);
      setTimeout(() => setCopiedSplit(false), 2500);
    } catch (err) {
      console.error("Failed to copy split:", err);
    }
  };

  const handleShareLink = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `RoadWise: ${result.start} → ${result.end}`,
          text: `Trip cost: ${formatEuro(result.totalCost)} (${formatEuro(result.perPassenger)}/person)`,
          url: shareUrl,
        });
        return;
      } catch {
        // user cancelled or share failed; fall back to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  return (
    <motion.div
      className="w-full bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <FaReceipt className="text-amber-400 text-sm" />
          <h2 className="text-xs font-mono-num font-bold">
            Trip Telemetry &amp; Receipt
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          {result.roundTrip && (
            <span className="text-[10px] font-mono-num px-2 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              2x Round-Trip
            </span>
          )}
          <span
            className={`text-[10px] font-mono-num px-2 py-0.5 rounded font-bold ${
              result.avoidTolls
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
            }`}
          >
            {result.avoidTolls ? "Toll-Free" : "With Tolls"}
          </span>
        </div>
      </div>

      <div className="p-5 space-y-5">
        <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3.5 flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <span className="block text-[10px] font-mono-num text-slate-400">
              Origin
            </span>
            <p className="text-xs font-bold text-slate-900 truncate mt-0.5" title={result.start}>
              {result.start}
            </p>
          </div>

          <div className="w-7 h-7 rounded-full bg-slate-200/70 text-slate-600 flex items-center justify-center shrink-0">
            <FaArrowRight className="text-xs" />
          </div>

          <div className="min-w-0 flex-1 text-right">
            <span className="block text-[10px] font-mono-num text-slate-400">
              Destination
            </span>
            <p className="text-xs font-bold text-slate-900 truncate mt-0.5" title={result.end}>
              {result.end}
            </p>
          </div>
        </div>

        {withTolls && withoutTolls && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-500 flex items-center gap-1.5">
                <FaBalanceScale className="text-slate-400" />
                <span>Side-by-Side Route Comparison</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono-num">Click to switch</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onSelectRouteMode?.(false)}
                className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                  !result.avoidTolls
                    ? "border-blue-600 bg-blue-50/40 ring-2 ring-blue-600/15"
                    : "border-slate-200 hover:border-slate-300 bg-white opacity-80 hover:opacity-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono-num font-bold text-blue-700">
                    With Tolls
                  </span>
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                </div>
                <div className="text-lg font-mono-num font-extrabold text-slate-900 mt-1">
                  {formatEuro(withTolls.totalCost)}
                </div>
                <div className="text-[11px] font-mono-num text-slate-600 mt-1 space-y-0.5">
                  <div>
                    {formatDuration(withTolls.durationMin)} • {formatKm(withTolls.distanceKm)}
                  </div>
                  <div className="text-slate-500">
                    {withTolls.tolls.length} {withTolls.tolls.length === 1 ? "toll" : "tolls"} (
                    {formatEuro(withTolls.tollCost)})
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onSelectRouteMode?.(true)}
                className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                  result.avoidTolls
                    ? "border-amber-500 bg-amber-50/40 ring-2 ring-amber-500/20"
                    : "border-slate-200 hover:border-slate-300 bg-white opacity-80 hover:opacity-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono-num font-bold text-amber-700">
                    Toll-Free
                  </span>
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                </div>
                <div className="text-lg font-mono-num font-extrabold text-slate-900 mt-1">
                  {formatEuro(withoutTolls.totalCost)}
                </div>
                <div className="text-[11px] font-mono-num text-slate-600 mt-1 space-y-0.5">
                  <div>
                    {formatDuration(withoutTolls.durationMin)} • {formatKm(withoutTolls.distanceKm)}
                  </div>
                  <div className="text-emerald-700 font-semibold">€0.00 in tolls</div>
                </div>
              </button>
            </div>

            <div className="px-3.5 py-2.5 rounded-lg bg-slate-900 text-slate-200 text-xs font-mono-num flex items-center justify-between">
              <span>Toll-Free Tradeoff:</span>
              <span>
                {moneySavedNoTolls > 0.05 ? (
                  <strong className="text-emerald-400">
                    Save {formatEuro(moneySavedNoTolls)}
                  </strong>
                ) : moneySavedNoTolls < -0.05 ? (
                  <strong className="text-amber-400">
                    Costs +{formatEuro(Math.abs(moneySavedNoTolls))} more in fuel
                  </strong>
                ) : (
                  <strong className="text-slate-300">Same total cost</strong>
                )}{" "}
                •{" "}
                {extraMinutesNoTolls > 0 ? (
                  <span className="text-amber-300">+{extraMinutesNoTolls} min slower</span>
                ) : extraMinutesNoTolls < 0 ? (
                  <span className="text-emerald-300">{Math.abs(extraMinutesNoTolls)} min faster</span>
                ) : (
                  <span>Same duration</span>
                )}
              </span>
            </div>
          </div>
        )}

        <div className="border-t border-dashed border-slate-200 pt-4 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-600">
            <span>
              Active Distance &amp; Time {result.roundTrip ? "(Round-Trip 2x)" : "(One-Way 1x)"}
            </span>
            <span className="font-mono-num font-semibold text-slate-900">
              {formatKm(result.distanceKm)} • {formatDuration(result.durationMin)}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-600">
            <span>Estimated Fuel Burn</span>
            <span className="font-mono-num font-semibold text-slate-900">
              {formatEuro(result.fuelCost)}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-600">
            <span>
              Highway Toll Fees ({result.tolls?.length ?? 0}{" "}
              {result.tolls?.length === 1 ? "plaza" : "plazas"}
              {result.roundTrip ? " × 2" : ""})
            </span>
            <span className="font-mono-num font-semibold text-slate-900">
              {formatEuro(result.tollCost)}
            </span>
          </div>
        </div>

        <div className="bg-slate-900 text-white rounded-xl p-4 grid grid-cols-2 gap-4 items-center">
          <div>
            <span className="text-[10px] font-mono-num text-slate-400 block">
              Total Trip Cost
            </span>
            <span className="text-2xl font-mono-num font-extrabold text-white mt-0.5 block">
              {formatEuro(result.totalCost)}
            </span>
          </div>

          <div className="border-l border-slate-800 pl-4">
            <span className="text-[10px] font-mono-num text-amber-400 block">
              Per Passenger ({result.passengers} {result.passengers === 1 ? "PAX" : "PAX"})
            </span>
            <span className="text-2xl font-mono-num font-extrabold text-amber-400 mt-0.5 block">
              {formatEuro(result.perPassenger)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            onClick={handleCopySplit}
            className="flex items-center justify-center gap-2 py-2.5 px-3.5 rounded-lg border border-slate-200 hover:border-slate-900 bg-slate-50 hover:bg-slate-900 text-slate-800 hover:text-white text-xs font-bold transition-all cursor-pointer"
          >
            {copiedSplit ? (
              <>
                <FaCheck className="text-emerald-500" />
                <span>Split Copied!</span>
              </>
            ) : (
              <>
                <FaCopy className="text-slate-400" />
                <span>Copy Split for Friends</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleShareLink}
            className="flex items-center justify-center gap-2 py-2.5 px-3.5 rounded-lg border border-slate-200 hover:border-slate-900 bg-slate-50 hover:bg-slate-900 text-slate-800 hover:text-white text-xs font-bold transition-all cursor-pointer"
          >
            {copiedLink ? (
              <>
                <FaCheck className="text-emerald-500" />
                <span>Trip Link Copied!</span>
              </>
            ) : (
              <>
                <FaShareAlt className="text-slate-400" />
                <span>Share Trip Link</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default RouteSummary;