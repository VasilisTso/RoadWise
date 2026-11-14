import React from "react";
import { DepartureFields } from "./TripSettings";
import { PointBadge } from "./WaypointList";
import { useI18n } from "../i18n/context";

function LegMeta({ leg, index, count }) {
  const { t, fmt } = useI18n();
  if (!leg) return null;
  return (
    <span className="num block text-[13px] text-ink-muted">
      {count > 1 ? `${t("timeline.leg", { n: index + 1 })} · ` : ""}
      {fmt.km(leg.distanceKm)} · {fmt.duration(leg.durationMin)}
    </span>
  );
}

// Timeline tab: depart → tolls and stops → arrive, each with its clock time (one way).
function Timeline({
  timeline,
  result,
  departAt,
  onDepartChange,
  breaks,
  onBreaksChange,
  highlightIndex,
  onHoverToll,
  onSelectToll,
}) {
  const { t, fmt } = useI18n();
  const { events, departure, arrival, drivingMin, breakMin } = timeline;
  const points = result.waypoints.length;
  const legCount = result.legs.length;

  return (
    <div className="flex flex-col gap-6">
      <ol className="timeline" onMouseLeave={() => onHoverToll?.(null)}>
        {events.map((ev) => {
          const time = (
            <time dateTime={ev.time.toISOString()} className="timeline__time num">
              {fmt.time(ev.time, departure)}
            </time>
          );

          if (ev.type === "toll") {
            const fee = ev.toll[result.vehicle] ?? ev.toll.car;
            return (
              <li key={`toll-${ev.index}`} className="timeline__item">
                {time}
                <span aria-hidden className="timeline__mark">
                  <span className="rate-row__num num">{ev.index + 1}</span>
                </span>
                <button
                  type="button"
                  className="timeline__body timeline__toll"
                  data-active={highlightIndex === ev.index}
                  onMouseEnter={() => onHoverToll?.(ev.index)}
                  onFocus={() => onHoverToll?.(ev.index)}
                  onBlur={() => onHoverToll?.(null)}
                  onClick={() => onSelectToll?.(ev.toll, ev.index)}
                  aria-label={t("timeline.tollLabel", {
                    time: fmt.time(ev.time, departure),
                    n: ev.index + 1,
                    name: ev.toll.name,
                    fee: fmt.euro(fee),
                  })}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-ink">{ev.toll.name}</span>
                    <span className="block truncate text-[13px] text-ink-muted">{ev.toll.highway}</span>
                  </span>
                  <span className="num font-plate text-[15px] font-semibold text-ink">
                    {fmt.euro(fee)}
                  </span>
                </button>
              </li>
            );
          }

          const heading =
            t(ev.type === "depart" ? "timeline.leave" : ev.type === "arrive" ? "timeline.arrive" : "timeline.stop");
          return (
            <li key={`pt-${ev.point}`} className="timeline__item timeline__item--point">
              {time}
              <span className="timeline__mark">
                <PointBadge index={ev.point} count={points} />
              </span>
              <div className="timeline__body">
                <span className="block text-[13px] text-ink-muted">{heading}</span>
                <span className="block font-medium text-ink text-pretty">{ev.label}</span>
                <LegMeta leg={ev.leg} index={ev.point - 1} count={legCount} />
              </div>
            </li>
          );
        })}
      </ol>

      <div className="rounded-plate bg-surface-sunken px-3 py-2.5 text-[13px] text-ink-muted">
        <p className="num">
          {t("timeline.summaryDriving", { duration: fmt.duration(drivingMin) })}
          {breakMin > 0 && t("timeline.summaryBreaks", { duration: fmt.duration(breakMin) })}
          {t("timeline.summaryArrive")}
          <strong className="font-semibold text-ink">{fmt.time(arrival, departure)}</strong>.
        </p>
        <p className="mt-1">
          {t("timeline.estimate")}
          {result.roundTrip && t("timeline.oneWayOnly")}
        </p>
      </div>

      <DepartureFields
        idPrefix="results-"
        departAt={departAt}
        onDepartChange={onDepartChange}
        breaks={breaks}
        onBreaksChange={onBreaksChange}
      />
    </div>
  );
}

export default Timeline;
