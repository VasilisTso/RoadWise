import React, { useState } from "react";
import { RouteHeader, ShareActions } from "./RouteSummary";
import CostBreakdown from "./CostBreakdown";
import TollList from "./TollList";
import Tabs from "./ui/Tabs";

// Results view: total and route choice up top, then Cost · Tolls.
function ResultsView({
  result,
  comparison,
  hasAlternative,
  settings,
  onSettingChange,
  onSelectRouteMode,
  onEdit,
  highlightIndex,
  onHoverToll,
  onSelectToll,
}) {
  const [tab, setTab] = useState("cost");

  return (
    <div className="flex flex-col gap-6 p-5">
      <RouteHeader
        result={result}
        comparison={comparison}
        hasAlternative={hasAlternative}
        onSelectRouteMode={onSelectRouteMode}
        onEdit={onEdit}
      />

      <Tabs
        label="Trip details"
        value={tab}
        onChange={setTab}
        tabs={[
          { id: "cost", label: "Cost" },
          { id: "tolls", label: "Tolls", count: result.tolls.length },
        ]}
      >
        {tab === "cost" ? (
          <CostBreakdown result={result} settings={settings} onSettingChange={onSettingChange} />
        ) : (
          <TollList
            tolls={result.tolls}
            vehicle={settings.vehicle}
            roundTrip={settings.roundTrip}
            highlightIndex={highlightIndex}
            onHoverToll={onHoverToll}
            onSelectToll={onSelectToll}
          />
        )}
      </Tabs>

      <ShareActions result={result} />
    </div>
  );
}

export default ResultsView;
