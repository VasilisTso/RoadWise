import React from 'react'

const Hero = () => {
  return (
    <div className='hero'>
        <h2>Find distance-route between cities, areas on the map. Calculate travel costs (fuel, tolls).</h2>
        <p>Search for a route by entering a starting and destination area. Additionally, get travel directions for your route, as well as fuel cost estimates, toll calculations, and available alternative routes.</p>
    
        <p className="instructions-title">Instructions</p>
        <p className="instructions-text">Fill in the text fields with your starting point and destination, as well as your gas price, fuel consumption and passengers, and choose whether you want a route with or without tolls.</p>
    </div>

  )
}

export default Hero