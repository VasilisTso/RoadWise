import React, { useState } from "react";
import { RouteHeader, ShareActions } from "./RouteSummary";
import CostBreakdown from "./CostBreakdown";
import TollList from "./TollList";
import Timeline from "./Timeline";
import Tabs from "./ui/Tabs";

// Results view: total and route choice up top, then Cost · Tolls · Timeline.
function ResultsView({
  result,
  comparison,
  hasAlternative,
  settings,
  onSettingChange,
  timeline,
  departAt,
  onDepartChange,
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
        timeline={timeline}
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
          { id: "timeline", label: "Timeline" },
        ]}
      >
        {tab === "cost" ? (
          <CostBreakdown
            result={result}
            comparison={comparison}
            hasAlternative={hasAlternative}
            settings={settings}
            onSettingChange={onSettingChange}
          />
        ) : tab === "timeline" ? (
          <Timeline
            timeline={timeline}
            result={result}
            departAt={departAt}
            onDepartChange={onDepartChange}
            breaks={settings.breaks}
            onBreaksChange={(v) => onSettingChange("breaks", v)}
            highlightIndex={highlightIndex}
            onHoverToll={onHoverToll}
            onSelectToll={onSelectToll}
          />
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
