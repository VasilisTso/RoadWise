import React from "react";
import { TbBolt, TbCar, TbMinus, TbMotorbike, TbPlus } from "react-icons/tb";
import SegmentedControl from "./ui/SegmentedControl";
import { FUEL_TYPES, fuelOptionsFor } from "../data/fuel";
import { toLocalInputValue } from "../utils/trip";
import { useT } from "../i18n/context";

const VEHICLES = [
  { value: "car", icon: TbCar },
  { value: "bike", icon: TbMotorbike },
];

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
          className="field-input num pr-[5.75rem]"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-ink-subtle">
          {unit}
        </span>
      </div>
    </div>
  );
}

function PassengerStepper({ id, value, onChange }) {
  const t = useT();
  const set = (n) => onChange(Math.min(MAX_PASSENGERS, Math.max(1, n)));
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {t("settings.people")}
      </label>
      <div className="flex h-10 items-stretch overflow-hidden rounded-plate border border-line bg-surface-raised">
        <button
          type="button"
          aria-label={t("settings.fewer")}
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
          aria-label={t("settings.more")}
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

// What you drive and what it runs on. Motorbikes only offer petrol and electric.
export function VehicleFields({ settings, onChange }) {
  const t = useT();
  const vehicles = VEHICLES.map((v) => ({ ...v, label: t(`settings.${v.value}`) }));
  const fuelOptions = fuelOptionsFor(settings.vehicle).map((id) => ({
    value: id,
    label: t(`fuel.${id}`),
    icon: id === "ev" ? TbBolt : undefined,
  }));
  return (
    <div className="flex flex-col gap-4">
      <SegmentedControl
        label={t("settings.vehicle")}
        value={settings.vehicle}
        onChange={(v) => onChange("vehicle", v)}
        options={vehicles}
      />
      <SegmentedControl
        label={t("settings.runsOn")}
        value={settings.fuelType}
        onChange={(v) => onChange("fuelType", v)}
        options={fuelOptions}
      />
    </div>
  );
}

// When you leave, and whether to allow for breaks. Empty `departAt` means "now".
export function DepartureFields({ departAt, onDepartChange, breaks, onBreaksChange, idPrefix = "" }) {
  const t = useT();
  const id = `${idPrefix}depart-at`;
  return (
    <div className="flex flex-col gap-3">
      <div>
        <div className="flex items-baseline justify-between">
          <label htmlFor={id} className="field-label">
            {t("settings.leaving")}
          </label>
          {departAt && (
            <button
              type="button"
              onClick={() => onDepartChange(null)}
              className="-mr-1 rounded-plate px-1 py-0.5 text-[13px] font-medium text-ink-muted hover:text-ink"
            >
              {t("settings.leaveNow")}
            </button>
          )}
        </div>
        <input
          id={id}
          type="datetime-local"
          value={departAt ?? toLocalInputValue(new Date())}
          onChange={(e) => onDepartChange(e.target.value || null)}
          className="field-input num"
        />
      </div>
      <label className="flex items-center gap-2.5 text-sm text-ink">
        <input
          type="checkbox"
          checked={breaks}
          onChange={(e) => onBreaksChange(e.target.checked)}
          className="size-4 shrink-0 accent-ink"
        />
        <span>
          {t("settings.breaks")} <span className="text-ink-muted">· {t("settings.breaksHint")}</span>
        </span>
      </label>
    </div>
  );
}

// Cost inputs. Every change recalculates locally: no new route request.
function TripSettings({ settings, onChange, idPrefix = "" }) {
  const t = useT();
  const { fuelPrice, consumption, passengers, roundTrip } = settings;
  const fuel = FUEL_TYPES[settings.fuelType] ?? FUEL_TYPES.petrol;

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-4">
      <PassengerStepper
        id={`${idPrefix}passengers`}
        value={passengers}
        onChange={(n) => onChange("passengers", n)}
      />
      <SegmentedControl
        label={t("settings.trip")}
        value={roundTrip ? "return" : "oneway"}
        onChange={(v) => onChange("roundTrip", v === "return")}
        options={[
          { value: "oneway", label: t("settings.oneWay") },
          { value: "return", label: t("settings.return") },
        ]}
      />
      <NumberField
        id={`${idPrefix}fuel-price`}
        label={t(fuel.energy === "electricity" ? "settings.chargingPrice" : "settings.fuelPrice")}
        unit={t(`unit.${fuel.priceUnit}`)}
        step="0.01"
        value={fuelPrice}
        onChange={(n) => onChange("fuelPrice", n)}
      />
      <NumberField
        id={`${idPrefix}consumption`}
        label={t("settings.consumption")}
        unit={t(`unit.${fuel.consumptionUnit}`)}
        step="0.1"
        value={consumption}
        onChange={(n) => onChange("consumption", n)}
      />
    </div>
  );
}

export default TripSettings;
