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
import { useTrip } from "./hooks/useTrip";
import { useTripHistory } from "./hooks/useTripHistory";
import { useTheme } from "./hooks/useTheme";
import { DESKTOP_QUERY, useMediaQuery } from "./hooks/useMediaQuery";
import { buildComparison, buildTimeline } from "./utils/trip";
import { buildUrlSearch, readUrlState } from "./utils/urlState";
import { useT } from "./i18n/context";

const TOP_BAR_PX = 52;
const SHEET_GAP_PX = 16;
const SHEET_WIDTH_PX = 400;

// Plan sits left of Results: each view enters from and leaves to its own side (fade only with reduced motion)
const viewMotion = (dir, reduce) => ({
  initial: { opacity: 0, x: reduce ? 0 : 24 * dir },
  animate: { opacity: 1, x: 0, transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, x: reduce ? 0 : 16 * dir, transition: { duration: 0.14, ease: "easeIn" } },
});

function App() {
  const t = useT();
  const initial = useMemo(() => readUrlState(), []);

  const trip = useTrip(initial);
  const { waypoints, departAt, setWaypoints } = trip;
  const { settings, updateSetting } = useSettings(initial.settings);
  const history = useTripHistory();
  const recordTrip = history.record;
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

  // Runs a search; on success adopts the geocoded waypoints, saves it to history, shows results
  const runSearch = useCallback(
    async (list) => {
      setFocusedToll(null);
      setHighlightIndex(null);
      const payload = await search(list);
      if (!payload) return null;
      setWaypoints(payload.waypoints);
      const main = payload.withTolls;
      recordTrip({
        waypoints: payload.waypoints,
        distanceKm: main.distanceKm,
        durationMin: main.durationMin,
      });
      showResults();
      return payload;
    },
    [search, setWaypoints, recordTrip, showResults]
  );

  // A shared link (?wp=… or legacy ?from=&to=) loads its route straight away
  useEffect(() => {
    const wps = initial.waypoints;
    if (!didAutoSearch.current && wps.length >= 2 && wps[0].label && wps[wps.length - 1].label) {
      didAutoSearch.current = true;
      runSearch(trip.waypoints);
    }
  }, [initial, runSearch, trip.waypoints]);

  // Keep the URL query string in sync with active route & settings so links are always shareable
  useEffect(() => {
    if (!routeData) return;
    const query = buildUrlSearch({ waypoints: routeData.waypoints, departAt, settings });
    window.history.replaceState(null, "", `${window.location.pathname}${query}`);
  }, [routeData, departAt, settings]);

  // Costs recalculate locally: settings changes never cost a request
  const comparison = useMemo(() => buildComparison(routeData, settings), [routeData, settings]);

  // useRoute falls back to one branch for both when a variant fails
  const hasAlternative = Boolean(routeData && routeData.withTolls !== routeData.withoutTolls);
  const activeResult = comparison?.active ?? null;
  const showingResults = view === "results" && Boolean(activeResult);

  // Clock times for the active route; recomputed when departure or breaks change, no refetch
  const timeline = useMemo(
    () => (activeResult ? buildTimeline(activeResult, { departAt, breaks: settings.breaks }) : null),
    [activeResult, departAt, settings.breaks]
  );

  const handleSearch = () => runSearch(waypoints);

  // Saved trip: put its places back and look it up again
  const handleLoadTrip = (saved) => {
    setWaypoints(saved.waypoints);
    runSearch(saved.waypoints);
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
      <Header
        themeMode={themeMode}
        onCycleTheme={cycleTheme}
        history={history}
        onLoadTrip={handleLoadTrip}
      />

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
          label={t(showingResults ? "sheet.results" : "sheet.plan")}
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
                  timeline={timeline}
                  departAt={departAt}
                  onDepartChange={trip.setDepartAt}
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
                  trip={trip}
                  settings={settings}
                  onSettingChange={updateSetting}
                  onSearch={handleSearch}
                  loading={loading}
                  error={error}
                  onDismissError={clearError}
                  hasResults={Boolean(activeResult)}
                  onShowResults={showResults}
                  recentTrips={history.trips}
                  onLoadTrip={handleLoadTrip}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </Sheet>

        <p role="status" className="sr-only">
          {loading ? t("sheet.finding") : ""}
        </p>
      </main>
    </div>
  );
}

export default App;
