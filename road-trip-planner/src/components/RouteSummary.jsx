import React, { useEffect, useRef, useState } from "react";
import { TbCheck, TbCopy, TbPencil, TbShare } from "react-icons/tb";
import AnimatedNumber from "./ui/AnimatedNumber";
import { useRovingRadio } from "../hooks/useRovingRadio";
import { routeTitle } from "../utils/labels";
import { useI18n } from "../i18n/context";

const ROUTE_MODES = [false, true]; // avoidTolls

// Short plain sentence on what the toll-free route trades: money vs time
function tradeOff(t, fmt, withTolls, withoutTolls) {
  const saved = withTolls.totalCost - withoutTolls.totalCost;
  const extraMin = Math.round(withoutTolls.durationMin - withTolls.durationMin);

  const money =
    saved > 0.05
      ? t("tradeOff.saves", { amount: fmt.euro(saved) })
      : saved < -0.05
        ? t("tradeOff.costsMore", { amount: fmt.euro(-saved) })
        : t("tradeOff.costsSame");
  const time =
    extraMin > 0
      ? t("tradeOff.longer", { duration: fmt.duration(extraMin) })
      : extraMin < 0
        ? t("tradeOff.faster", { duration: fmt.duration(-extraMin) })
        : t("tradeOff.sameTime");
  const joiner = t((saved > 0.05) === (extraMin > 0) ? "tradeOff.but" : "tradeOff.and");
  return t("tradeOff.sentence", { money, joiner, time });
}

function RoutePlate({ option, kind, selected, radioProps }) {
  const { t, fmt } = useI18n();
  const label = t(kind === "tolled" ? "results.withTolls" : "results.tollFree");
  return (
    <button {...radioProps} className={`route-plate route-plate--${kind}`} data-selected={selected}>
      <span className="route-plate__head">
        <span aria-hidden className="route-plate__swatch" />
        {label}
      </span>
      <AnimatedNumber
        value={option.totalCost}
        format={fmt.euro}
        className="route-plate__price"
      />
      <span className="route-plate__meta num">
        {fmt.duration(option.durationMin)} · {fmt.km(option.distanceKm)}
      </span>
      <span className="route-plate__meta num">
        {option.tolls.length === 0
          ? t("results.noBooths")
          : `${t("results.booths", { n: option.tolls.length })} · ${fmt.euro(option.tollCost)}`}
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

function splitText(t, fmt, r) {
  return [
    `RoadWise · ${routeTitle(r.waypoints)}`,
    t("share.textRoute", {
      distance: fmt.km(r.distanceKm),
      duration: fmt.duration(r.durationMin),
      mode: t(r.avoidTolls ? "share.textTollFree" : "share.textWithTolls"),
      trip: t(r.roundTrip ? "results.return" : "results.oneWay"),
    }),
    t("share.textCost", {
      energy: t(r.fuelType === "ev" ? "cost.charging" : "cost.fuel"),
      energyCost: fmt.euro(r.energyCost),
      tollCost: fmt.euro(r.tollCost),
      total: fmt.euro(r.totalCost),
    }),
    r.passengers > 1 ? t("share.textEach", { amount: fmt.euro(r.perPassenger), n: r.passengers }) : null,
    window.location.href,
  ]
    .filter(Boolean)
    .join("\n");
}

// Results header: route, the total at display size, per person, and the route choice.
export function RouteHeader({ result, comparison, hasAlternative, timeline, onSelectRouteMode, onEdit }) {
  const { t, fmt } = useI18n();
  const radioProps = useRovingRadio(ROUTE_MODES, result.avoidTolls, onSelectRouteMode);
  const { withTolls, withoutTolls } = comparison;
  const stops = result.waypoints.length - 2;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[17px] font-semibold leading-snug text-ink text-balance">
            {routeTitle(result.waypoints)
              .split(" → ")
              .map((part, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span className="text-ink-subtle"> → </span>}
                  {part}
                </React.Fragment>
              ))}
          </h2>
          <p className="num mt-0.5 text-[13px] text-ink-muted">
            {fmt.km(result.distanceKm)} · {fmt.duration(result.durationMin)} ·{" "}
            {t(result.roundTrip ? "results.return" : "results.oneWay")}
            {stops > 0 && ` · ${t("results.stops", { n: stops })}`}
            {timeline &&
              ` · ${t("results.arrive", { time: fmt.time(timeline.arrival, timeline.departure) })}`}
          </p>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-plate border border-line px-2.5 py-1.5 text-[13px] font-medium text-ink hover:bg-surface-sunken"
        >
          <TbPencil aria-hidden className="size-4" />
          {t("results.editTrip")}
        </button>
      </div>

      <div>
        <div className="text-[13px] text-ink-muted">{t("results.tripCost")}</div>
        <AnimatedNumber
          value={result.totalCost}
          format={fmt.euro}
          className="block font-plate text-[3.25rem] font-semibold leading-none tracking-[-0.02em] text-ink"
        />
        <p className="mt-2 text-[15px] text-ink-muted">
          {result.passengers > 1 ? (
            <>
              <AnimatedNumber
                value={result.perPassenger}
                format={fmt.euro}
                className="font-semibold text-ink"
              />{" "}
              {t("results.eachSuffix", { n: result.passengers })}
            </>
          ) : (
            t("results.onePerson")
          )}
        </p>
      </div>

      {hasAlternative && (
        <div>
          <div id="route-choice-label" className="field-label">
            {t("results.route")}
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
          <p className="mt-2.5 text-[13px] text-ink-muted">{tradeOff(t, fmt, withTolls, withoutTolls)}</p>
        </div>
      )}
    </div>
  );
}

export function ShareActions({ result }) {
  const { t, fmt } = useI18n();
  const [copied, flashCopied] = useFlag();
  const [linked, flashLinked] = useFlag();

  const copySplit = async () => {
    try {
      await navigator.clipboard.writeText(splitText(t, fmt, result));
      flashCopied();
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const shareLink = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: `RoadWise: ${routeTitle(result.waypoints)}`, url });
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
        {copied ? t("share.copied") : t("share.copy")}
      </button>
      <button type="button" onClick={shareLink} className="btn-secondary">
        {linked ? <TbCheck aria-hidden className="size-4 text-success" /> : <TbShare aria-hidden className="size-4" />}
        {linked ? t("share.linkCopied") : t("share.link")}
      </button>
      <span role="status" className="sr-only">
        {copied ? t("share.copiedStatus") : linked ? t("share.linkCopied") : ""}
      </span>
    </div>
  );
}
