import React from "react";
import { formatEuro, pluralize } from "../utils/format";

const VEHICLE_NAME = { car: "car", bike: "motorbike" };

// Tolls tab: the route's booths in driving order, set like a posted rate board.
function TollList({ tolls, vehicle = "car", roundTrip = false, highlightIndex, onHoverToll, onSelectToll }) {
  if (tolls.length === 0) {
    return (
      <div className="rounded-plate border border-dashed border-line-strong px-4 py-6 text-center">
        <p className="font-medium text-ink">No toll booths on this route</p>
        <p className="mt-1 text-[13px] text-ink-muted">You pay for fuel only.</p>
      </div>
    );
  }

  const other = vehicle === "car" ? "bike" : "car";
  const oneWay = tolls.reduce((sum, t) => sum + (t[vehicle] ?? 0), 0);

  return (
    <div>
      <p className="mb-2 text-[13px] text-ink-muted">
        Published rates for a {VEHICLE_NAME[vehicle]}, in driving order. Rates can change.
      </p>
      <ol className="rate-board" onMouseLeave={() => onHoverToll?.(null)}>
        {tolls.map((toll, i) => (
          <li key={toll.name}>
            <button
              type="button"
              className="rate-row"
              data-active={highlightIndex === i}
              onMouseEnter={() => onHoverToll?.(i)}
              onFocus={() => onHoverToll?.(i)}
              onBlur={() => onHoverToll?.(null)}
              onClick={() => onSelectToll?.(toll, i)}
              aria-label={`${i + 1}. ${toll.name}, ${toll.highway}: ${formatEuro(toll[vehicle])}. Show on map`}
            >
              <span aria-hidden className="rate-row__num num">
                {i + 1}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-medium text-ink">{toll.name}</span>
                <span className="block truncate text-[13px] text-ink-muted">
                  {toll.highway}
                  {toll.type === "ramp" ? " · exit ramp" : ""}
                </span>
              </span>
              <span className="text-right">
                <span className="num block font-plate text-[17px] font-semibold text-ink">
                  {formatEuro(toll[vehicle])}
                </span>
                <span className="num block text-xs text-ink-subtle">
                  {VEHICLE_NAME[other]} {formatEuro(toll[other])}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ol>
      <div className="mt-1 flex items-baseline justify-between border-t border-line-strong pt-2.5">
        <span className="text-ink">
          {pluralize(tolls.length, "booth", "booths")}
          {roundTrip && <span className="text-ink-muted"> · × 2 for the return</span>}
        </span>
        <span className="num font-plate text-[17px] font-semibold text-ink">
          {formatEuro(oneWay * (roundTrip ? 2 : 1))}
        </span>
      </div>
    </div>
  );
}

export default TollList;
