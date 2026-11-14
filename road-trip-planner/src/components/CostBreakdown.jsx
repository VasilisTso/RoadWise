import React from "react";
import { TbCar, TbMotorbike } from "react-icons/tb";
import AnimatedNumber from "./ui/AnimatedNumber";
import SegmentedControl from "./ui/SegmentedControl";
import TripSettings from "./TripSettings";
import { formatEuro, formatKm, pluralize } from "../utils/format";

const VEHICLES = [
  { value: "car", label: "Car", icon: TbCar },
  { value: "bike", label: "Motorbike", icon: TbMotorbike },
];

function Row({ label, proof, amount, strong = false }) {
  return (
    <div className={`grid grid-cols-[1fr_auto] items-baseline gap-x-4 py-2.5 ${strong ? "" : "border-b border-line"}`}>
      <div className="min-w-0">
        <div className={strong ? "font-semibold text-ink" : "text-ink"}>{label}</div>
        {proof && <div className="num mt-0.5 text-[13px] text-ink-muted">{proof}</div>}
      </div>
      <AnimatedNumber
        value={amount}
        format={formatEuro}
        className={`font-plate ${strong ? "text-xl font-semibold" : "text-[17px] font-medium"} text-ink`}
      />
    </div>
  );
}

// Cost tab: each figure next to the math behind it, then the inputs to adjust it.
function CostBreakdown({ result, settings, onSettingChange }) {
  const booths = result.tolls.length;
  const tollProof =
    booths === 0
      ? "No toll booths on this route"
      : `${pluralize(booths, "booth", "booths")}, published rates${result.roundTrip ? " × 2 for the return" : ""}`;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Row
          label="Fuel"
          proof={`${formatKm(result.distanceKm)} × ${settings.consumption} L/100 km × ${formatEuro(settings.fuelPrice)}/L`}
          amount={result.fuelCost}
        />
        <Row label="Tolls" proof={tollProof} amount={result.tollCost} />
        <Row label="Total" amount={result.totalCost} strong />
      </div>

      <section aria-labelledby="adjust-heading" className="flex flex-col gap-4">
        <div>
          <h3 id="adjust-heading" className="text-[15px] font-semibold text-ink">
            Adjust
          </h3>
          <p className="text-[13px] text-ink-muted">The cost updates as you change these.</p>
        </div>
        <SegmentedControl
          label="Vehicle"
          value={settings.vehicle}
          onChange={(v) => onSettingChange("vehicle", v)}
          options={VEHICLES}
        />
        <TripSettings settings={settings} onChange={onSettingChange} idPrefix="results-" />
      </section>
    </div>
  );
}

export default CostBreakdown;
