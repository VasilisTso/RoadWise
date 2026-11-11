import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import TripPlanner from './components/TripPlanner';
import MapView from './components/MapView';
import TollList from './components/TollList';
import RouteSummary from './components/RouteSummary';
import Footer from './components/Footer';
import { useRoute } from './hooks/useRoute';

function App() {
  const { result, loading, error, search, clearError } = useRoute();

  return (
    <div className="min-h-screen flex flex-col text-slate-900">
      <Header />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        <Hero />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start mt-4">
          {/* LEFT COLUMN: Controls & Telemetry Receipt */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <TripPlanner
              onSearch={search}
              loading={loading}
              error={error}
              onDismissError={clearError}
            />

            {result && (
              <div className="flex flex-col gap-6">
                <RouteSummary result={result} />
                <TollList tolls={result.tolls} vehicle={result.vehicle} />
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Sticky Interactive Cartography HUD */}
          <div className="lg:col-span-7 lg:sticky lg:top-20">
            <MapView route={result} loading={loading} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;