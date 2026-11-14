import React, { useEffect } from "react";
import { TbCar, TbMotorbike } from "react-icons/tb";
import { useI18n } from "../i18n/context";

// Fixed class columns, like the posted board at a plaza: car, then motorbike
const CLASSES = [
  { id: "car", icon: TbCar },
  { id: "bike", icon: TbMotorbike },
];

// Tolls tab: the route's booths in driving order, set like a posted rate board.
function TollList({ tolls, vehicle = "car", roundTrip = false, highlightIndex, onHoverToll, onSelectToll }) {
  const { t, fmt } = useI18n();
  // Leaving the tab (or the results) must not leave a booth highlighted on the map
  useEffect(() => () => onHoverToll?.(null), [onHoverToll]);

  if (tolls.length === 0) {
    return (
      <div className="rounded-plate border border-dashed border-line-strong px-4 py-6 text-center">
        <p className="font-medium text-ink">{t("tolls.emptyTitle")}</p>
        <p className="mt-1 text-[13px] text-ink-muted">{t("tolls.emptyHint")}</p>
      </div>
    );
  }

  const factor = roundTrip ? 2 : 1;
  const totalFor = (cls) => tolls.reduce((sum, toll) => sum + (toll[cls] ?? 0), 0) * factor;
  // The selected class's column carries the plate figure; the other stays for reference
  const cellClass = (cls) =>
    cls === vehicle
      ? "rate-cell rate-cell--on num font-plate font-semibold text-ink"
      : "rate-cell num text-ink-muted";

  return (
    <div>
      <p className="mb-2 text-[13px] text-ink-muted">
        {t(`tolls.intro.${vehicle}`)}
      </p>
      <div aria-hidden className="rate-head">
        <span />
        <span />
        {CLASSES.map((cls) => (
          <span key={cls.id} className="rate-cell" data-on={cls.id === vehicle}>
            <cls.icon className="size-[18px]" />
          </span>
        ))}
      </div>
      <ol className="rate-board" onMouseLeave={() => onHoverToll?.(null)}>
        {tolls.map((toll, i) => (
          <li key={toll.name}>
            <button
              type="button"
              className="rate-row"
              data-active={highlightIndex === i}
              // Mouse only: a touch tap fires mouseenter too and would leave the highlight stuck
              onPointerEnter={(e) => e.pointerType === "mouse" && onHoverToll?.(i)}
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
              {CLASSES.map(({ id }) => (
                <span key={id} className={cellClass(id)}>
                  {fmt.euro(toll[id])}
                </span>
              ))}
            </button>
          </li>
        ))}
      </ol>
      <div className="rate-total">
        <span className="text-ink">
          {t("results.booths", { n: tolls.length })}
          {roundTrip && <span className="block text-[13px] text-ink-muted">{t("tolls.returnTimesTwo")}</span>}
        </span>
        {CLASSES.map(({ id }) => (
          <span key={id} className={cellClass(id)}>
            {fmt.euro(totalFor(id))}
          </span>
        ))}
      </div>
    </div>
  );
}

export default TollList;
