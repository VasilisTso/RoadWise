import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"; // eslint-disable-line no-unused-vars
import Header from "./components/Header";
import TripPlanner from "./components/TripPlanner";
import ResultsView from "./components/ResultsView";
import MapView from "./components/MapView";
import Sheet from "./components/Sheet";
import { TOP_GAP_PX, visibleSheetHeight } from "./utils/sheet";
import { useRoute } from "./hooks/useRoute";
import { useSettings } from "./hooks/useSettings";
import { useTheme } from "./hooks/useTheme";
import { DESKTOP_QUERY, useMediaQuery } from "./hooks/useMediaQuery";
import { calculateCosts } from "./utils/costs";

const TOP_BAR_PX = 52;
const SHEET_GAP_PX = 16;
const SHEET_WIDTH_PX = 400;

function parseCoordParam(str) {
  if (!str) return null;
  const parts = str.split(",").map(Number);
  if (parts.length === 2 && parts.every((n) => Number.isFinite(n))) {
    return parts;
  }
  return null;
}

function getInitialUrlState() {
  const params = new URLSearchParams(window.location.search);
  return {
    start: params.get("from") || "",
    end: params.get("to") || "",
    startCoords: parseCoordParam(params.get("sc")),
    endCoords: parseCoordParam(params.get("ec")),
    settings: getUrlSettings(params),
  };
}

// Only settings explicitly present in the URL; they override stored settings.
function getUrlSettings(params) {
  const out = {};
  const veh = params.get("veh");
  if (veh === "car" || veh === "bike") out.vehicle = veh;
  const fp = Number(params.get("fp"));
  if (params.has("fp") && fp > 0) out.fuelPrice = fp;
  const cons = Number(params.get("cons"));
  if (params.has("cons") && cons > 0) out.consumption = cons;
  const pax = parseInt(params.get("pax") ?? "", 10);
  if (pax >= 1) out.passengers = pax;
  if (params.has("avoid")) out.avoidTolls = params.get("avoid") === "1";
  if (params.has("rt")) out.roundTrip = params.get("rt") === "1";
  return out;
}

// Plan sits left of Results: each view enters from and leaves to its own side (fade only with reduced motion)
const viewMotion = (dir, reduce) => ({
  initial: { opacity: 0, x: reduce ? 0 : 24 * dir },
  animate: { opacity: 1, x: 0, transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, x: reduce ? 0 : 16 * dir, transition: { duration: 0.14, ease: "easeIn" } },
});

function App() {
  const initial = useMemo(() => getInitialUrlState(), []);

  const [start, setStart] = useState(initial.start);
  const [end, setEnd] = useState(initial.end);
  const [startCoords, setStartCoords] = useState(initial.startCoords);
  const [endCoords, setEndCoords] = useState(initial.endCoords);
  const { settings, updateSetting } = useSettings(initial.settings);
  const [view, setView] = useState("plan");
  const [snap, setSnap] = useState("half");
  const [focusedToll, setFocusedToll] = useState(null);
  const [highlightIndex, setHighlightIndex] = useState(null);

  const { mode: themeMode, resolved: theme, cycle: cycleTheme } = useTheme();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const reduceMotion = useReducedMotion();

  const { routeData, loading, error, search, clearError } = useRoute();
  const didAutoSearch = useRef(false);

  const handleSelectRouteMode = useCallback(
    (avoid) => updateSetting("avoidTolls", avoid),
    [updateSetting]
  );

  const showResults = useCallback(() => {
    setView("results");
    setSnap("half");
  }, []);

  // A shared link with ?from=...&to=... loads its route straight away
  useEffect(() => {
    if (!didAutoSearch.current && initial.start.trim() && initial.end.trim()) {
      didAutoSearch.current = true;
      search({
        start: initial.start,
        end: initial.end,
        startCoords: initial.startCoords,
        endCoords: initial.endCoords,
      }).then((payload) => {
        if (payload) showResults();
      });
    }
  }, [initial, search, showResults]);

  // Keep the URL query string in sync with active route & settings so links are always shareable
  useEffect(() => {
    if (!routeData) return;
    const params = new URLSearchParams();
    params.set("from", routeData.start);
    params.set("to", routeData.end);
    if (routeData.startCoords) {
      params.set("sc", routeData.startCoords.map((n) => n.toFixed(5)).join(","));
    }
    if (routeData.endCoords) {
      params.set("ec", routeData.endCoords.map((n) => n.toFixed(5)).join(","));
    }
    params.set("veh", settings.vehicle);
    params.set("fp", String(settings.fuelPrice));
    params.set("cons", String(settings.consumption));
    params.set("pax", String(settings.passengers));
    if (settings.avoidTolls) params.set("avoid", "1");
    if (settings.roundTrip) params.set("rt", "1");

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, "", newUrl);
  }, [routeData, settings]);

  // Costs recalculate locally: settings changes never cost a request
  const comparison = useMemo(() => {
    if (!routeData) return null;

    const buildOption = (branch, isAvoidTolls) => {
      if (!branch) return null;
      const costs = calculateCosts({
        distanceKm: branch.distanceKm,
        durationMin: branch.durationMin,
        consumption: settings.consumption,
        fuelPrice: settings.fuelPrice,
        tolls: branch.tolls,
        vehicle: settings.vehicle,
        passengers: settings.passengers,
        roundTrip: settings.roundTrip,
      });
      return {
        start: routeData.start,
        end: routeData.end,
        startCoords: routeData.startCoords,
        endCoords: routeData.endCoords,
        avoidTolls: isAvoidTolls,
        vehicle: settings.vehicle,
        passengers: settings.passengers,
        roundTrip: settings.roundTrip,
        coords: branch.coords,
        tolls: branch.tolls,
        baseDistanceKm: branch.distanceKm,
        baseDurationMin: branch.durationMin,
        distanceKm: costs.effectiveDistanceKm,
        durationMin: costs.effectiveDurationMin,
        ...costs,
      };
    };

    const withTolls = buildOption(routeData.withTolls, false);
    const withoutTolls = buildOption(routeData.withoutTolls, true);
    const active = settings.avoidTolls ? withoutTolls : withTolls;
    const alternative = settings.avoidTolls ? withTolls : withoutTolls;

    return { withTolls, withoutTolls, active, alternative };
  }, [routeData, settings]);

  // useRoute falls back to one branch for both when a variant fails
  const hasAlternative = Boolean(routeData && routeData.withTolls !== routeData.withoutTolls);
  const activeResult = comparison?.active ?? null;
  const showingResults = view === "results" && Boolean(activeResult);

  const handleSearch = async () => {
    setFocusedToll(null);
    setHighlightIndex(null);
    const payload = await search({ start, end, startCoords, endCoords });
    if (payload) {
      setStartCoords(payload.startCoords);
      setEndCoords(payload.endCoords);
      showResults();
    }
  };

  const handleSwapWaypoints = () => {
    setStart(end);
    setStartCoords(endCoords);
    setEnd(start);
    setEndCoords(startCoords);
  };

  const handleSelectToll = useCallback(
    (toll, index) => {
      setFocusedToll({ toll, index });
      if (!isDesktop) setSnap("peek"); // uncover the map on a phone
    },
    [isDesktop]
  );

  // Space the sheet covers, so the route is framed in the visible map
  const insets = isDesktop
    ? { left: SHEET_GAP_PX + SHEET_WIDTH_PX }
    : {
        bottom: visibleSheetHeight(
          snap,
          window.innerHeight - TOP_BAR_PX - TOP_GAP_PX,
          window.innerHeight
        ),
      };

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-ground text-ink">
      <Header themeMode={themeMode} onCycleTheme={cycleTheme} />

      <main className="relative flex-1">
        <MapView
          route={activeResult}
          alternativeRoute={hasAlternative ? comparison?.alternative : null}
          focusedToll={focusedToll}
          highlightIndex={highlightIndex}
          loading={loading}
          theme={theme}
          isDesktop={isDesktop}
          insets={insets}
          onSelectRouteMode={handleSelectRouteMode}
          onHoverToll={setHighlightIndex}
        />

        <Sheet
          isDesktop={isDesktop}
          snap={snap}
          onSnapChange={setSnap}
          topOffset={TOP_BAR_PX}
          label={showingResults ? "Trip results" : "Plan a trip"}
          scrollKey={view}
        >
          <AnimatePresence mode="wait" initial={false}>
            {showingResults ? (
              <motion.div key="results" {...viewMotion(1, reduceMotion)}>
                <ResultsView
                  result={activeResult}
                  comparison={comparison}
                  hasAlternative={hasAlternative}
                  settings={settings}
                  onSettingChange={updateSetting}
                  onSelectRouteMode={handleSelectRouteMode}
                  onEdit={() => setView("plan")}
                  highlightIndex={highlightIndex}
                  onHoverToll={setHighlightIndex}
                  onSelectToll={handleSelectToll}
                />
              </motion.div>
            ) : (
              <motion.div key="plan" {...viewMotion(-1, reduceMotion)}>
                <TripPlanner
                  start={start}
                  end={end}
                  onStartChange={(text) => {
                    setStart(text);
                    setStartCoords(null);
                  }}
                  onEndChange={(text) => {
                    setEnd(text);
                    setEndCoords(null);
                  }}
                  onStartSelect={(s) => {
                    setStart(s.label);
                    setStartCoords(s.coords);
                  }}
                  onEndSelect={(s) => {
                    setEnd(s.label);
                    setEndCoords(s.coords);
                  }}
                  onSwap={handleSwapWaypoints}
                  settings={settings}
                  onSettingChange={updateSetting}
                  onSearch={handleSearch}
                  loading={loading}
                  error={error}
                  onDismissError={clearError}
                  hasResults={Boolean(activeResult)}
                  onShowResults={showResults}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </Sheet>

        <p role="status" className="sr-only">
          {loading ? "Finding routes" : ""}
        </p>
      </main>
    </div>
  );
}

export default App;
