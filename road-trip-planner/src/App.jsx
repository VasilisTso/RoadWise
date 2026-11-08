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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-indigo-100 to-indigo-50">
      <Header />
      <Hero />

      <TripPlanner
        onSearch={search}
        loading={loading}
        error={error}
        onDismissError={clearError}
      />

      <MapView route={result} />

      {result && (
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row px-4 items-start gap-6 mt-6">
          <TollList tolls={result.tolls} />
          <RouteSummary result={result} />
        </div>
      )}

      <Footer />
    </div>
  );
}

export default App