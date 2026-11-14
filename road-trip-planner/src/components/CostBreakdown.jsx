import React from "react";
import AnimatedNumber from "./ui/AnimatedNumber";
import TripSettings, { VehicleFields } from "./TripSettings";
import { FUEL_TYPES } from "../data/fuel";
import { formatEuro, formatKg, formatKm, pluralize } from "../utils/format";

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

// CO₂ for the chosen route, per person, and the other route for comparison. Always an estimate.
function Emissions({ result, comparison, hasAlternative, fuel }) {
  const other = hasAlternative ? comparison.alternative : null;
  const factor =
    fuel.energy === "electricity"
      ? `Estimate from the Greek grid average, ${fuel.co2PerUnit} kg CO₂ per kWh.`
      : `Estimate, ${fuel.co2PerUnit} kg CO₂ per litre of ${fuel.label.toLowerCase()} burned.`;

  return (
    <section aria-labelledby="co2-heading">
      <h3 id="co2-heading" className="text-[15px] font-semibold text-ink">
        CO₂
      </h3>
      <dl className="mt-1.5 grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 text-sm">
        <dt className="text-ink-muted">This route</dt>
        <dd className="num text-right font-medium text-ink">
          <AnimatedNumber value={result.co2Kg} format={formatKg} />
          {result.passengers > 1 && (
            <span className="font-normal text-ink-muted">
              {" "}
              · <AnimatedNumber value={result.co2PerPassenger} format={formatKg} /> each
            </span>
          )}
        </dd>
        {other && (
          <>
            <dt className="text-ink-muted">{other.avoidTolls ? "Toll-free route" : "Route with tolls"}</dt>
            <dd className="num text-right text-ink-muted">
              <AnimatedNumber value={other.co2Kg} format={formatKg} />
              {result.passengers > 1 && <> · <AnimatedNumber value={other.co2PerPassenger} format={formatKg} /> each</>}
            </dd>
          </>
        )}
      </dl>
      <p className="mt-1.5 text-[13px] text-ink-subtle">{factor}</p>
    </section>
  );
}

// Cost tab: each figure next to the math behind it, then the inputs to adjust it.
function CostBreakdown({ result, comparison, hasAlternative, settings, onSettingChange }) {
  const fuel = FUEL_TYPES[settings.fuelType] ?? FUEL_TYPES.petrol;
  const booths = result.tolls.length;
  const tollProof =
    booths === 0
      ? "No toll booths on this route"
      : `${pluralize(booths, "booth", "booths")}, published rates${result.roundTrip ? " × 2 for the return" : ""}`;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Row
          label={fuel.energy === "electricity" ? "Charging" : "Fuel"}
          proof={`${formatKm(result.distanceKm)} × ${settings.consumption} ${fuel.consumptionUnit} × ${formatEuro(settings.fuelPrice)}/${fuel.unit}`}
          amount={result.energyCost}
        />
        <Row label="Tolls" proof={tollProof} amount={result.tollCost} />
        <Row label="Total" amount={result.totalCost} strong />
      </div>

      <Emissions result={result} comparison={comparison} hasAlternative={hasAlternative} fuel={fuel} />

      <section aria-labelledby="adjust-heading" className="flex flex-col gap-4">
        <div>
          <h3 id="adjust-heading" className="text-[15px] font-semibold text-ink">
            Adjust
          </h3>
          <p className="text-[13px] text-ink-muted">The cost updates as you change these.</p>
        </div>
        <VehicleFields settings={settings} onChange={onSettingChange} />
        <TripSettings settings={settings} onChange={onSettingChange} idPrefix="results-" />
      </section>
    </div>
  );
}

export default CostBreakdown;
