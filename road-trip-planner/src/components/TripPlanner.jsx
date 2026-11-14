import React, { useState } from "react";
import {
  TbAlertTriangle,
  TbArrowsUpDown,
  TbChevronLeft,
  TbChevronRight,
  TbCurrentLocation,
  TbLoader2,
  TbStarFilled,
  TbX,
} from "react-icons/tb";
import WaypointList from "./WaypointList";
import TripSettings, { DepartureFields, VehicleFields } from "./TripSettings";
import { reverseGeocode } from "../services/ors";
import { tripTitle } from "../hooks/useTripHistory";
import { useI18n } from "../i18n/context";

const QUICK_PICKS = 4;

// Recent trips as one-tap picks in the empty Plan view (starred first)
function RecentTrips({ trips, onLoadTrip }) {
  const { t, fmt } = useI18n();
  const picks = [...trips].sort((a, b) => b.starred - a.starred).slice(0, QUICK_PICKS);
  if (picks.length === 0) return null;
  return (
    <section aria-labelledby="recent-heading">
      <h2 id="recent-heading" className="text-[15px] font-semibold text-ink">
        {t("plan.recentTrips")}
      </h2>
      <ul className="mt-2 flex flex-col">
        {picks.map((trip) => (
          <li key={trip.id} className="border-t border-line first:border-t-0">
            <button
              type="button"
              onClick={() => onLoadTrip(trip)}
              className="-mx-2 grid w-[calc(100%+16px)] grid-cols-[1fr_auto] items-center gap-3 rounded-plate px-2 py-2.5 text-left hover:bg-surface-sunken"
            >
              <span className="min-w-0">
                <span className="flex items-center gap-1.5 font-medium text-ink">
                  {trip.starred && (
                    <TbStarFilled aria-label={t("plan.starred")} className="size-3.5 shrink-0 text-free-line" />
                  )}
                  <span className="truncate">{tripTitle(trip, t)}</span>
                </span>
                <span className="num block truncate text-[13px] text-ink-muted">
                  {fmt.km(trip.distanceKm)} · {fmt.duration(trip.durationMin)} ·{" "}
                  {fmt.relative(trip.savedAt)}
                </span>
              </span>
              <TbChevronRight aria-hidden className="size-4 text-ink-subtle" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

// Plan view: where from, where to (and via), when, what you drive, who shares the cost.
function TripPlanner({
  trip,
  settings,
  onSettingChange,
  onSearch,
  loading,
  error,
  onDismissError,
  hasResults = false,
  onShowResults,
  recentTrips = [],
  onLoadTrip,
}) {
  const { t, lang } = useI18n();
  const { waypoints } = trip;
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState(null);

  const handleUseMyLocation = () => {
    setGeoError(null);
    if (!("geolocation" in navigator)) {
      setGeoError("geo.unsupported");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const label = await reverseGeocode(latitude, longitude, { lang });
          // ORS expects [lng, lat]
          trip.select(waypoints[0].id, { label, coords: [longitude, latitude] });
        } catch {
          setGeoError("geo.noName");
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        setGeoError(
          err.code === err.PERMISSION_DENIED ? "geo.denied" : "geo.failed"
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <form
      className="flex flex-col gap-6 p-5"
      onSubmit={(e) => {
        e.preventDefault();
        onSearch();
      }}
    >
      {hasResults ? (
        <button
          type="button"
          onClick={onShowResults}
          className="-ml-1.5 inline-flex w-fit items-center gap-1 rounded-plate px-1.5 py-1 text-sm font-medium text-ink-muted hover:bg-surface-sunken hover:text-ink"
        >
          <TbChevronLeft aria-hidden className="size-4" />
          {t("plan.backToResults")}
        </button>
      ) : (
        <div>
          <h1 className="text-[22px] font-semibold leading-tight tracking-[-0.015em] text-balance text-ink">
            {t("plan.title")}
          </h1>
          <p className="mt-1.5 text-ink-muted text-pretty">
            {t("plan.intro")}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <WaypointList
          waypoints={waypoints}
          onTextChange={trip.setLabel}
          onSelect={trip.select}
          onAdd={trip.addStop}
          onRemove={trip.remove}
          onReorder={trip.reorder}
          onMove={trip.move}
          firstAction={
            <button
              type="button"
              onClick={handleUseMyLocation}
              disabled={locating}
              className="-mr-1 inline-flex items-center gap-1 rounded-plate px-1 py-0.5 text-[13px] font-medium text-ink-muted hover:text-ink disabled:opacity-60"
            >
              {locating ? (
                <TbLoader2 aria-hidden className="size-4 animate-spin" />
              ) : (
                <TbCurrentLocation aria-hidden className="size-4" />
              )}
              {locating ? t("plan.locating") : t("plan.useMyLocation")}
            </button>
          }
          lastAction={
            waypoints.length === 2 ? (
              <button
                type="button"
                onClick={trip.reverse}
                className="-mr-1 inline-flex items-center gap-1 rounded-plate px-1 py-0.5 text-[13px] font-medium text-ink-muted hover:text-ink"
              >
                <TbArrowsUpDown aria-hidden className="size-4" />
                {t("plan.swap")}
              </button>
            ) : null
          }
        />

        {geoError && (
          <p role="status" className="rounded-plate bg-warn-soft px-3 py-2 text-[13px] text-warn">
            {t(geoError)}
          </p>
        )}
      </div>

      <DepartureFields
        idPrefix="plan-"
        departAt={trip.departAt}
        onDepartChange={trip.setDepartAt}
        breaks={settings.breaks}
        onBreaksChange={(v) => onSettingChange("breaks", v)}
      />

      <VehicleFields settings={settings} onChange={onSettingChange} />

      <TripSettings settings={settings} onChange={onSettingChange} idPrefix="plan-" />

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-plate bg-danger-soft px-3 py-2.5 text-sm text-danger"
        >
          <TbAlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0" />
          <span className="flex-1">{t(error.key, error.vars)}</span>
          <button
            type="button"
            onClick={onDismissError}
            aria-label={t("plan.dismiss")}
            className="-m-1 grid size-7 place-items-center rounded-plate hover:bg-danger/10"
          >
            <TbX aria-hidden className="size-4" />
          </button>
        </div>
      )}

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? (
          <>
            <TbLoader2 aria-hidden className="size-[18px] animate-spin" />
            {t("plan.finding")}
          </>
        ) : (
          t("plan.find")
        )}
      </button>

      {!hasResults && <RecentTrips trips={recentTrips} onLoadTrip={onLoadTrip} />}
    </form>
  );
}

export default TripPlanner;
