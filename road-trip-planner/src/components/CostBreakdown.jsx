import React from "react";
import AnimatedNumber from "./ui/AnimatedNumber";
import TripSettings, { VehicleFields } from "./TripSettings";
import { FUEL_TYPES } from "../data/fuel";
import { useI18n } from "../i18n/context";

function Row({ label, proof, amount, strong = false }) {
  const { fmt } = useI18n();
  return (
    <div className={`grid grid-cols-[1fr_auto] items-baseline gap-x-4 py-2.5 ${strong ? "" : "border-b border-line"}`}>
      <div className="min-w-0">
        <div className={strong ? "font-semibold text-ink" : "text-ink"}>{label}</div>
        {proof && <div className="num mt-0.5 text-[13px] text-ink-muted">{proof}</div>}
      </div>
      <AnimatedNumber
        value={amount}
        format={fmt.euro}
        className={`font-plate ${strong ? "text-xl font-semibold" : "text-[17px] font-medium"} text-ink`}
      />
    </div>
  );
}

// CO₂ for the chosen route, per person, and the other route for comparison. Always an estimate.
function Emissions({ result, comparison, hasAlternative, fuelType, fuel }) {
  const { t, fmt } = useI18n();
  const other = hasAlternative ? comparison.alternative : null;
  const factor =
    fuel.energy === "electricity"
      ? t("co2.factorGrid", { factor: fmt.number(fuel.co2PerUnit) })
      : t("co2.factorFuel", { factor: fmt.number(fuel.co2PerUnit), fuel: t(`fuel.of.${fuelType}`) });

  return (
    <section aria-labelledby="co2-heading">
      <h3 id="co2-heading" className="text-[15px] font-semibold text-ink">
        {t("co2.heading")}
      </h3>
      <dl className="mt-1.5 grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 text-sm">
        <dt className="text-ink-muted">{t("co2.thisRoute")}</dt>
        <dd className="num text-right font-medium text-ink">
          <AnimatedNumber value={result.co2Kg} format={fmt.kg} />
          {result.passengers > 1 && (
            <span className="font-normal text-ink-muted">
              {" "}
              · <AnimatedNumber value={result.co2PerPassenger} format={fmt.kg} /> {t("co2.each")}
            </span>
          )}
        </dd>
        {other && (
          <>
            <dt className="text-ink-muted">{t(other.avoidTolls ? "co2.tollFreeRoute" : "co2.tolledRoute")}</dt>
            <dd className="num text-right text-ink-muted">
              <AnimatedNumber value={other.co2Kg} format={fmt.kg} />
              {result.passengers > 1 && <> · <AnimatedNumber value={other.co2PerPassenger} format={fmt.kg} /> {t("co2.each")}</>}
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
  const { t, fmt } = useI18n();
  const fuelType = FUEL_TYPES[settings.fuelType] ? settings.fuelType : "petrol";
  const fuel = FUEL_TYPES[fuelType];
  const booths = result.tolls.length;
  const tollProof =
    booths === 0
      ? t("cost.noBooths")
      : t("cost.boothsProof", { booths: t("results.booths", { n: booths }) }) +
        (result.roundTrip ? t("cost.returnTimesTwo") : "");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Row
          label={t(fuel.energy === "electricity" ? "cost.charging" : "cost.fuel")}
          proof={`${fmt.km(result.distanceKm)} × ${fmt.number(settings.consumption)} ${t(
            `unit.${fuel.consumptionUnit}`
          )} × ${fmt.euro(settings.fuelPrice)}/${t(`unit.${fuel.unit}`)}`}
          amount={result.energyCost}
        />
        <Row label={t("cost.tolls")} proof={tollProof} amount={result.tollCost} />
        <Row label={t("cost.total")} amount={result.totalCost} strong />
      </div>

      <Emissions result={result} comparison={comparison} hasAlternative={hasAlternative} fuelType={fuelType} fuel={fuel} />

      <section aria-labelledby="adjust-heading" className="flex flex-col gap-4">
        <div>
          <h3 id="adjust-heading" className="text-[15px] font-semibold text-ink">
            {t("cost.adjust")}
          </h3>
          <p className="text-[13px] text-ink-muted">{t("cost.adjustHint")}</p>
        </div>
        <VehicleFields settings={settings} onChange={onSettingChange} />
        <TripSettings settings={settings} onChange={onSettingChange} idPrefix="results-" />
      </section>
    </div>
  );
}

export default CostBreakdown;
