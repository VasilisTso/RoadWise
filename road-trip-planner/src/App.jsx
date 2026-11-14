import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import TripPlanner from "./components/TripPlanner";
import MapView from "./components/MapView";
import TollList from "./components/TollList";
import RouteSummary from "./components/RouteSummary";
import Footer from "./components/Footer";
import { useRoute } from "./hooks/useRoute";
import { useSettings } from "./hooks/useSettings";
import { calculateCosts } from "./utils/costs";

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

function App() {
  const initial = useMemo(() => getInitialUrlState(), []);

  const [start, setStart] = useState(initial.start);
  const [end, setEnd] = useState(initial.end);
  const [startCoords, setStartCoords] = useState(initial.startCoords);
  const [endCoords, setEndCoords] = useState(initial.endCoords);
  const { settings, updateSetting } = useSettings(initial.settings);
  const [focusedToll, setFocusedToll] = useState(null);

  const { routeData, loading, error, search, clearError } = useRoute();
  const didAutoSearch = useRef(false);

  const handleSelectRouteMode = useCallback(
    (avoid) => updateSetting("avoidTolls", avoid),
    [updateSetting]
  );

  // If the user opened a shared link with ?from=...&to=..., automatically fetch the route
  useEffect(() => {
    if (!didAutoSearch.current && initial.start.trim() && initial.end.trim()) {
      didAutoSearch.current = true;
      search({
        start: initial.start,
        end: initial.end,
        startCoords: initial.startCoords,
        endCoords: initial.endCoords,
      });
    }
  }, [initial, search]);

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

  // Instant reactive cost calculation (zero API calls when settings change!)
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

  const activeResult = comparison?.active ?? null;

  const handleSearch = async () => {
    setFocusedToll(null);
    const payload = await search({ start, end, startCoords, endCoords });
    if (payload) {
      setStartCoords(payload.startCoords);
      setEndCoords(payload.endCoords);
    }
  };

  const handleSwapWaypoints = () => {
    const prevStart = start;
    const prevStartCoords = startCoords;
    setStart(end);
    setStartCoords(endCoords);
    setEnd(prevStart);
    setEndCoords(prevStartCoords);
  };

  return (
    <div className="min-h-screen flex flex-col text-slate-900">
      <Header />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        <Hero />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start mt-4">
          <div className="lg:col-span-5 flex flex-col gap-6">
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
              hasActiveRoute={Boolean(activeResult)}
            />

            {activeResult && (
              <div className="flex flex-col gap-6">
                <RouteSummary
                  result={activeResult}
                  comparison={comparison}
                  onSelectRouteMode={handleSelectRouteMode}
                />
                <TollList
                  tolls={activeResult.tolls}
                  vehicle={settings.vehicle}
                  roundTrip={settings.roundTrip}
                  onSelectToll={(toll) => setFocusedToll(toll)}
                />
              </div>
            )}
          </div>

          <div className="lg:col-span-7 lg:sticky lg:top-20">
            <MapView
              route={activeResult}
              alternativeRoute={comparison?.alternative}
              focusedToll={focusedToll}
              loading={loading}
              onSelectRouteMode={handleSelectRouteMode}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;