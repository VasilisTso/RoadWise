import React from "react";
import { TbMinus, TbPlus } from "react-icons/tb";
import SegmentedControl from "./ui/SegmentedControl";

const MAX_PASSENGERS = 9;

function NumberField({ id, label, unit, value, onChange, step, min = 0 }) {
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={min}
          step={step}
          value={value}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (Number.isFinite(n) && n >= min) onChange(n);
          }}
          className="field-input num pr-[4.5rem]"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-ink-subtle">
          {unit}
        </span>
      </div>
    </div>
  );
}

function PassengerStepper({ id, value, onChange }) {
  const set = (n) => onChange(Math.min(MAX_PASSENGERS, Math.max(1, n)));
  return (
    <div>
      <label htmlFor={id} className="field-label">
        People sharing
      </label>
      <div className="flex h-10 items-stretch overflow-hidden rounded-plate border border-line bg-surface-raised">
        <button
          type="button"
          aria-label="One person fewer"
          disabled={value <= 1}
          onClick={() => set(value - 1)}
          className="grid w-10 place-items-center text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <TbMinus aria-hidden className="size-4" />
        </button>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min="1"
          max={MAX_PASSENGERS}
          value={value}
          onChange={(e) => set(parseInt(e.target.value, 10) || 1)}
          className="num w-full min-w-0 border-x border-line bg-transparent text-center text-[15px] font-medium text-ink outline-none focus-visible:bg-surface"
        />
        <button
          type="button"
          aria-label="One person more"
          disabled={value >= MAX_PASSENGERS}
          onClick={() => set(value + 1)}
          className="grid w-10 place-items-center text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <TbPlus aria-hidden className="size-4" />
        </button>
      </div>
    </div>
  );
}

// Cost inputs. Every change recalculates locally: no new route request.
function TripSettings({ settings, onChange, idPrefix = "" }) {
  const { fuelPrice, consumption, passengers, roundTrip } = settings;

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-4">
      <PassengerStepper
        id={`${idPrefix}passengers`}
        value={passengers}
        onChange={(n) => onChange("passengers", n)}
      />
      <SegmentedControl
        label="Trip"
        value={roundTrip ? "return" : "oneway"}
        onChange={(v) => onChange("roundTrip", v === "return")}
        options={[
          { value: "oneway", label: "One way" },
          { value: "return", label: "Return" },
        ]}
      />
      <NumberField
        id={`${idPrefix}fuel-price`}
        label="Fuel price"
        unit="€/L"
        step="0.01"
        value={fuelPrice}
        onChange={(n) => onChange("fuelPrice", n)}
      />
      <NumberField
        id={`${idPrefix}consumption`}
        label="Consumption"
        unit="L/100 km"
        step="0.1"
        value={consumption}
        onChange={(n) => onChange("consumption", n)}
      />
    </div>
  );
}

export default TripSettings;
