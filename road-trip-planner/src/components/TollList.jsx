import React from "react";
import { useI18n } from "../i18n/context";

// Tolls tab: the route's booths in driving order, set like a posted rate board.
function TollList({ tolls, vehicle = "car", roundTrip = false, highlightIndex, onHoverToll, onSelectToll }) {
  const { t, fmt } = useI18n();
  if (tolls.length === 0) {
    return (
      <div className="rounded-plate border border-dashed border-line-strong px-4 py-6 text-center">
        <p className="font-medium text-ink">{t("tolls.emptyTitle")}</p>
        <p className="mt-1 text-[13px] text-ink-muted">{t("tolls.emptyHint")}</p>
      </div>
    );
  }

  const other = vehicle === "car" ? "bike" : "car";
  const oneWay = tolls.reduce((sum, t) => sum + (t[vehicle] ?? 0), 0);

  return (
    <div>
      <p className="mb-2 text-[13px] text-ink-muted">
        {t(`tolls.intro.${vehicle}`)}
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
              aria-label={t("tolls.rowLabel", {
                n: i + 1,
                name: toll.name,
                highway: toll.highway,
                fee: fmt.euro(toll[vehicle]),
              })}
            >
              <span aria-hidden className="rate-row__num num">
                {i + 1}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-medium text-ink">{toll.name}</span>
                <span className="block truncate text-[13px] text-ink-muted">
                  {toll.highway}
                  {toll.type === "ramp" ? ` · ${t("tolls.exitRamp")}` : ""}
                </span>
              </span>
              <span className="text-right">
                <span className="num block font-plate text-[17px] font-semibold text-ink">
                  {fmt.euro(toll[vehicle])}
                </span>
                <span className="num block text-xs text-ink-subtle">
                  {t(`tolls.vehicleShort.${other}`)} {fmt.euro(toll[other])}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ol>
      <div className="mt-1 flex items-baseline justify-between border-t border-line-strong pt-2.5">
        <span className="text-ink">
          {t("results.booths", { n: tolls.length })}
          {roundTrip && <span className="text-ink-muted"> · {t("tolls.returnTimesTwo")}</span>}
        </span>
        <span className="num font-plate text-[17px] font-semibold text-ink">
          {fmt.euro(oneWay * (roundTrip ? 2 : 1))}
        </span>
      </div>
    </div>
  );
}

export default TollList;
