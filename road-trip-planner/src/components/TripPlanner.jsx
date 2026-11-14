import React, { useState } from "react";
import {
  TbAlertTriangle,
  TbArrowsUpDown,
  TbCar,
  TbChevronLeft,
  TbCurrentLocation,
  TbLoader2,
  TbMotorbike,
  TbX,
} from "react-icons/tb";
import LocationField from "./LocationField";
import TripSettings from "./TripSettings";
import SegmentedControl from "./ui/SegmentedControl";
import { reverseGeocode } from "../services/ors";

const VEHICLES = [
  { value: "car", label: "Car", icon: TbCar },
  { value: "bike", label: "Motorbike", icon: TbMotorbike },
];

// Plan view: where from, where to, what you drive, who shares the cost.
function TripPlanner({
  start,
  end,
  onStartChange,
  onEndChange,
  onStartSelect,
  onEndSelect,
  onSwap,
  settings,
  onSettingChange,
  onSearch,
  loading,
  error,
  onDismissError,
  hasResults = false,
  onShowResults,
}) {
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState(null);

  const handleUseMyLocation = () => {
    setGeoError(null);
    if (!("geolocation" in navigator)) {
      setGeoError("This browser can't share your location. Type the place instead.");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const label = await reverseGeocode(latitude, longitude);
          // ORS expects [lng, lat]
          onStartSelect({ label, coords: [longitude, latitude] });
        } catch {
          setGeoError("Found you, but couldn't name the place. Type it instead.");
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        setGeoError(
          err.code === err.PERMISSION_DENIED
            ? "Location access is off. Allow it in your browser settings, or type the place."
            : "Couldn't get your location. Type the place instead."
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
          Back to results
        </button>
      ) : (
        <div>
          <h1 className="text-[22px] font-semibold leading-tight tracking-[-0.015em] text-balance text-ink">
            What will the drive cost?
          </h1>
          <p className="mt-1.5 text-ink-muted text-pretty">
            See every toll booth on the way and what it charges, plus fuel, next to the
            toll-free route.
          </p>
        </div>
      )}

      <fieldset className="relative flex flex-col gap-3">
        <legend className="sr-only">Route</legend>
        <LocationField
          id="start-location"
          label="From"
          placeholder="Town, address or place"
          marker={<span className="block size-2.5 rounded-full border-2 border-ink" />}
          value={start}
          onTextChange={onStartChange}
          onSelect={onStartSelect}
          action={
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
              {locating ? "Locating…" : "Use my location"}
            </button>
          }
        />

        <LocationField
          id="end-location"
          label="To"
          placeholder="Town, address or place"
          marker={<span className="block size-2.5 rounded-[2px] bg-ink" />}
          value={end}
          onTextChange={onEndChange}
          onSelect={onEndSelect}
          action={
            <button
              type="button"
              onClick={onSwap}
              className="-mr-1 inline-flex items-center gap-1 rounded-plate px-1 py-0.5 text-[13px] font-medium text-ink-muted hover:text-ink"
            >
              <TbArrowsUpDown aria-hidden className="size-4" />
              Swap
            </button>
          }
        />

        {geoError && (
          <p role="status" className="rounded-plate bg-warn-soft px-3 py-2 text-[13px] text-warn">
            {geoError}
          </p>
        )}
      </fieldset>

      <SegmentedControl
        label="Vehicle"
        value={settings.vehicle}
        onChange={(v) => onSettingChange("vehicle", v)}
        options={VEHICLES}
      />

      <TripSettings settings={settings} onChange={onSettingChange} idPrefix="plan-" />

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-plate bg-danger-soft px-3 py-2.5 text-sm text-danger"
        >
          <TbAlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <button
            type="button"
            onClick={onDismissError}
            aria-label="Dismiss message"
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
            Finding routes…
          </>
        ) : (
          "Find route"
        )}
      </button>
    </form>
  );
}

export default TripPlanner;
