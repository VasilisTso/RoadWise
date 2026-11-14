import React, { useEffect, useRef, useState } from "react";
import { TbCheck, TbCopy, TbPencil, TbShare } from "react-icons/tb";
import AnimatedNumber from "./ui/AnimatedNumber";
import { useRovingRadio } from "../hooks/useRovingRadio";
import { formatDuration, formatEuro, formatKm, pluralize } from "../utils/format";

const ROUTE_MODES = [false, true]; // avoidTolls

// Short plain sentence on what the toll-free route trades: money vs time
function tradeOff(withTolls, withoutTolls) {
  const saved = withTolls.totalCost - withoutTolls.totalCost;
  const extraMin = Math.round(withoutTolls.durationMin - withTolls.durationMin);

  const money =
    saved > 0.05
      ? `saves ${formatEuro(saved)}`
      : saved < -0.05
        ? `costs ${formatEuro(-saved)} more`
        : "costs the same";
  const time =
    extraMin > 0
      ? `takes ${formatDuration(extraMin)} longer`
      : extraMin < 0
        ? `is ${formatDuration(-extraMin)} faster`
        : "takes the same time";
  const joiner = (saved > 0.05) === (extraMin > 0) ? "but" : "and";
  return `Toll-free ${money} ${joiner} ${time}.`;
}

function RoutePlate({ option, kind, selected, radioProps }) {
  const label = kind === "tolled" ? "With tolls" : "Toll-free";
  return (
    <button {...radioProps} className={`route-plate route-plate--${kind}`} data-selected={selected}>
      <span className="route-plate__head">
        <span aria-hidden className="route-plate__swatch" />
        {label}
      </span>
      <AnimatedNumber
        value={option.totalCost}
        format={formatEuro}
        className="route-plate__price"
      />
      <span className="route-plate__meta num">
        {formatDuration(option.durationMin)} · {formatKm(option.distanceKm)}
      </span>
      <span className="route-plate__meta num">
        {option.tolls.length === 0
          ? "No toll booths"
          : `${pluralize(option.tolls.length, "booth", "booths")} · ${formatEuro(option.tollCost)}`}
      </span>
    </button>
  );
}

function useFlag() {
  const [on, setOn] = useState(false);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  const flash = () => {
    setOn(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOn(false), 2200);
  };
  return [on, flash];
}

function splitText(r) {
  return [
    `RoadWise · ${r.start} → ${r.end}`,
    `${formatKm(r.distanceKm)}, ${formatDuration(r.durationMin)}, ${
      r.avoidTolls ? "toll-free" : "with tolls"
    }, ${r.roundTrip ? "return" : "one way"}`,
    `Fuel ${formatEuro(r.fuelCost)} + tolls ${formatEuro(r.tollCost)} = ${formatEuro(r.totalCost)}`,
    r.passengers > 1 ? `${formatEuro(r.perPassenger)} each for ${r.passengers} people` : null,
    window.location.href,
  ]
    .filter(Boolean)
    .join("\n");
}

// Results header: route, the total at display size, per person, and the route choice.
export function RouteHeader({ result, comparison, hasAlternative, onSelectRouteMode, onEdit }) {
  const radioProps = useRovingRadio(ROUTE_MODES, result.avoidTolls, onSelectRouteMode);
  const { withTolls, withoutTolls } = comparison;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[17px] font-semibold leading-snug text-ink text-balance">
            {result.start} <span className="text-ink-subtle">→</span> {result.end}
          </h2>
          <p className="num mt-0.5 text-[13px] text-ink-muted">
            {formatKm(result.distanceKm)} · {formatDuration(result.durationMin)} ·{" "}
            {result.roundTrip ? "return" : "one way"}
          </p>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-plate border border-line px-2.5 py-1.5 text-[13px] font-medium text-ink hover:bg-surface-sunken"
        >
          <TbPencil aria-hidden className="size-4" />
          Edit trip
        </button>
      </div>

      <div>
        <div className="text-[13px] text-ink-muted">Trip cost</div>
        <AnimatedNumber
          value={result.totalCost}
          format={formatEuro}
          className="block font-plate text-[3.25rem] font-semibold leading-none tracking-[-0.02em] text-ink"
        />
        <p className="mt-2 text-[15px] text-ink-muted">
          {result.passengers > 1 ? (
            <>
              <AnimatedNumber
                value={result.perPassenger}
                format={formatEuro}
                className="font-semibold text-ink"
              />{" "}
              each, split {result.passengers} ways
            </>
          ) : (
            "One person paying. Add people to split it."
          )}
        </p>
      </div>

      {hasAlternative && (
        <div>
          <div id="route-choice-label" className="field-label">
            Route
          </div>
          <div role="radiogroup" aria-labelledby="route-choice-label" className="grid grid-cols-2 gap-2.5">
            <RoutePlate
              option={withTolls}
              kind="tolled"
              selected={!result.avoidTolls}
              radioProps={radioProps(false, 0)}
            />
            <RoutePlate
              option={withoutTolls}
              kind="free"
              selected={result.avoidTolls}
              radioProps={radioProps(true, 1)}
            />
          </div>
          <p className="mt-2.5 text-[13px] text-ink-muted">{tradeOff(withTolls, withoutTolls)}</p>
        </div>
      )}
    </div>
  );
}

export function ShareActions({ result }) {
  const [copied, flashCopied] = useFlag();
  const [linked, flashLinked] = useFlag();

  const copySplit = async () => {
    try {
      await navigator.clipboard.writeText(splitText(result));
      flashCopied();
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const shareLink = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: `RoadWise: ${result.start} → ${result.end}`, url });
        return;
      } catch {
        // cancelled or unsupported: fall back to copying the link
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      flashLinked();
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-2.5">
      <button type="button" onClick={copySplit} className="btn-secondary">
        {copied ? <TbCheck aria-hidden className="size-4 text-success" /> : <TbCopy aria-hidden className="size-4" />}
        {copied ? "Copied" : "Copy cost split"}
      </button>
      <button type="button" onClick={shareLink} className="btn-secondary">
        {linked ? <TbCheck aria-hidden className="size-4 text-success" /> : <TbShare aria-hidden className="size-4" />}
        {linked ? "Link copied" : "Share link"}
      </button>
      <span role="status" className="sr-only">
        {copied ? "Cost split copied" : linked ? "Link copied" : ""}
      </span>
    </div>
  );
}
