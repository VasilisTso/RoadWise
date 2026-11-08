import React, { useState } from 'react';
import TollList from './components/TollList';
import Header from './components/Header';
import Hero from './components/Hero';
import RouteSummary from './components/RouteSummary';
import Footer from './components/Footer';
import Map2 from './components/Map2';

function App() {
  const [tolls, setTolls] = useState([]);
  const [summary, setSummary] = useState({});

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-indigo-100 to-indigo-50">
      <Header />

      <Hero />

      <Map2 onTollUpdate={setTolls} onSummaryUpdate={setSummary} />

      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row px-4 items-start gap-6 mt-6">
        <TollList tolls={tolls} />

        <RouteSummary summary={summary} />
      </div>

      <Footer />
    </div>
  );
}

export default App
