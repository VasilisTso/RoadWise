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
    <div className="bg-gradient-to-br from-[#e5e7eb] via-[#1f2937]/50 to-[#e5e7eb]">
      <Header/>

      <Hero/>

      {/*
      <RouteSelector selectedRoute={selectedRoute} onChange={handleRouteChange} />
      <Map selectedRoute={selectedRoute} tolls={tollData} />
      */}

      <Map2 selectedRoute={selectedRoute} 
        onChange={handleRouteChange} 
        onTollUpdate={(tolls) => setTolls(tolls)} 
        onSummaryUpdate={setSummary}/>

      <TollList tolls={tolls} />

      <RouteSummary summary={summary} />

      <Footer/>

    </div>
  );
}

export default App