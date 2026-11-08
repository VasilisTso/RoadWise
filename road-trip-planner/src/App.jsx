import React, { useMemo } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import TripPlanner from './components/TripPlanner';
import RouteComparison, { ROUTE_COLORS } from './components/RouteComparison';
import MapView from './components/MapView';
import TollList from './components/TollList';
import RouteSummary from './components/RouteSummary';
import Footer from './components/Footer';
import { useRoute } from './hooks/useRoute';
import { useSettings } from './hooks/useSettings';
import { calculateTrip } from './utils/costs';

function App() {
  const { settings, updateSetting } = useSettings();
  const { routes, selectedId, setSelectedId, loading, error, search, clearError } = useRoute();

  // Costs are derived from the raw routes + current settings, so editing fuel
  // price, passengers, vehicle or round trip updates results without a new search.
  const trips = useMemo(() => {
    if (!routes) return null;
    return {
      fast: calculateTrip(routes.fast, settings),
      free: routes.free ? calculateTrip(routes.free, settings) : null,
    };
  }, [routes, settings]);

  const mapRoutes = useMemo(() => {
    if (!routes) return null;
    return [
      { id: 'fast', coords: routes.fast.coords, color: ROUTE_COLORS.fast },
      routes.free && { id: 'free', coords: routes.free.coords, color: ROUTE_COLORS.free },
    ].filter(Boolean);
  }, [routes]);

  const activeId = routes?.[selectedId] ? selectedId : 'fast';
  const activeRoute = routes?.[activeId];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-indigo-100 to-indigo-50">
      <Header />
      <Hero />

      <TripPlanner
        settings={settings}
        onSettingChange={updateSetting}
        onSearch={search}
        loading={loading}
        error={error}
        onDismissError={clearError}
      />

      {trips && (
        <RouteComparison
          trips={trips}
          selectedId={activeId}
          onSelect={setSelectedId}
          freeError={routes.freeError}
          warning={routes.fast.tollWarning}
        />
      )}

      <MapView
        routes={mapRoutes}
        selectedId={activeId}
        tolls={activeRoute?.tolls}
        onSelectRoute={setSelectedId}
      />

      {trips && (
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row px-4 items-start gap-6 mt-6">
          <TollList tolls={activeRoute.tolls} vehicle={settings.vehicle} roundTrip={settings.roundTrip} />
          <RouteSummary
            summary={{
              start: routes.start,
              end: routes.end,
              routeLabel: activeId === 'free' ? 'Toll-free' : 'Fastest',
              roundTrip: settings.roundTrip,
              ...trips[activeId],
            }}
          />
        </div>
      )}

      <Footer />
    </div>
  );
}

export default App