import React, { useState } from 'react';
import TollList from './components/TollList';
import RouteSelector from './components/RouteSelector';
import Header from './components/Header';
import Hero from './components/Hero';
import RouteSummary from './components/RouteSummary';
import Footer from './components/Footer';
import Map2 from './components/Map2';

function App() {
  const [selectedRoute, setSelectedRoute] = useState('toll'); // 'toll' or 'no-toll'
  const [tolls, setTolls] = useState([]);
  const [summary, setSummary] = useState({});

  // Handle route selection from the RouteSelector component
  const handleRouteChange = (routeType) => {
    setSelectedRoute(routeType);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-indigo-100 to-indigo-50">
      <Header/>

      <Hero/>

      {/* RouteSelector and Map merged into Map2
      <RouteSelector selectedRoute={selectedRoute} onChange={handleRouteChange} />
      <Map selectedRoute={selectedRoute} tolls={tollData} />
      */}

      <Map2 selectedRoute={selectedRoute} 
        onChange={handleRouteChange} 
        onTollUpdate={(tolls) => setTolls(tolls)} 
        onSummaryUpdate={setSummary}
      />

      <div className='max-w-6xl mx-auto flex flex-col sm:flex-row px-4 items-start gap-6 mt-6'>
        <TollList tolls={tolls} />

        <RouteSummary summary={summary} />
      </div>

      <Footer/>

    </div>
  );
}

export default App