// English strings. Values: plain strings with {placeholders}, or { one, other } plural forms
// picked by `n`. el.js mirrors these keys; a missing Greek key falls back to English.

const en = {
  meta: {
    title: "RoadWise: toll and fuel cost for Greek road trips",
    description:
      "Plan a drive in Greece and see every toll booth on the route with its price, plus fuel cost, next to the toll-free route.",
  },

  units: { h: "h", min: "min" },
  time: { justNow: "just now" },

  header: {
    home: "RoadWise home",
    yourTrips: "Your trips",
    theme: {
      system: "Theme: match system",
      light: "Theme: light",
      dark: "Theme: dark",
      change: "{current}. Change theme",
    },
    language: { switchTo: "Ελληνικά", short: "ΕΛ" },
    about: {
      label: "About RoadWise",
      body: "Plans a drive on Greek motorways and lists every toll booth on the way with its price, plus the fuel cost, next to the toll-free route.",
      caveat:
        "Toll prices are published rates, entered by hand. They can change, so check before you travel.",
      credits:
        "Routes by OpenRouteService. Map by Stadia Maps, OpenMapTiles and OpenStreetMap contributors.",
      email: "Email",
    },
  },

  history: {
    title: "Your trips",
    intro: "The last 8 trips you looked up stay here. Star one to keep it.",
    empty: "No trips yet. Find a route and it shows up here.",
    starred: "Starred",
    recent: "Recent",
    tripName: "Trip name",
    star: "Star {title}",
    unstar: "Unstar {title}",
    rename: "Rename {title}",
    remove: "Delete {title}",
    via: "{route} via {place}",
    viaStops: { one: "{route} via {n} stop", other: "{route} via {n} stops" },
  },

  sheet: {
    plan: "Plan a trip",
    results: "Trip results",
    expand: "Expand panel",
    collapse: "Collapse panel",
    finding: "Finding routes",
  },

  plan: {
    title: "What will the drive cost?",
    intro: "See every toll booth on the way and what it charges, plus fuel, next to the toll-free route.",
    backToResults: "Back to results",
    recentTrips: "Recent trips",
    starred: "Starred",
    useMyLocation: "Use my location",
    locating: "Locating…",
    swap: "Swap",
    find: "Find route",
    finding: "Finding routes…",
    dismiss: "Dismiss message",
  },

  geo: {
    unsupported: "This browser can't share your location. Type the place instead.",
    noName: "Found you, but couldn't name the place. Type it instead.",
    denied: "Location access is off. Allow it in your browser settings, or type the place.",
    failed: "Couldn't get your location. Type the place instead.",
  },

  waypoints: {
    legend: "Route",
    from: "From",
    to: "To",
    stop: "Stop",
    stopN: "Stop {n}",
    placeholderEnd: "Town, address or place",
    placeholderStop: "Add a stop",
    emptyFrom: "start",
    emptyTo: "destination",
    emptyStop: "empty stop",
    move: "Move {place}. Use the up and down arrow keys",
    remove: "Remove {place}",
    moved: "{place} moved to place {pos} of {count}",
    add: "Add stop",
    max: "Up to {n} places",
    suggestions: "{label} suggestions",
  },

  settings: {
    vehicle: "Vehicle",
    runsOn: "Runs on",
    car: "Car",
    bike: "Motorbike",
    leaving: "Leaving",
    leaveNow: "Leave now",
    breaks: "Include breaks",
    breaksHint: "15 min every 2 h of driving",
    people: "People sharing",
    fewer: "One person fewer",
    more: "One person more",
    trip: "Trip",
    oneWay: "One way",
    return: "Return",
    fuelPrice: "Fuel price",
    chargingPrice: "Charging price",
    consumption: "Consumption",
  },

  fuel: {
    petrol: "Petrol",
    diesel: "Diesel",
    lpg: "LPG",
    ev: "Electric",
    // "per litre of ___ burned"
    of: { petrol: "petrol", diesel: "diesel", lpg: "LPG" },
  },

  unit: {
    L: "L",
    kWh: "kWh",
    perL: "€/L",
    perKWh: "€/kWh",
    LPer100: "L/100 km",
    kWhPer100: "kWh/100 km",
  },

  results: {
    editTrip: "Edit trip",
    tripCost: "Trip cost",
    eachSuffix: "each, split {n} ways",
    onePerson: "One person paying. Add people to split it.",
    route: "Route",
    withTolls: "With tolls",
    tollFree: "Toll-free",
    noBooths: "No toll booths",
    booths: { one: "{n}\u00a0booth", other: "{n}\u00a0booths" },
    oneWay: "one way",
    return: "return",
    stops: { one: "{n}\u00a0stop", other: "{n}\u00a0stops" },
    arrive: "arrive {time}",
    tabsLabel: "Trip details",
    tabCost: "Cost",
    tabTolls: "Tolls",
    tabTimeline: "Timeline",
  },

  tradeOff: {
    sentence: "Toll-free {money} {joiner} {time}.",
    saves: "saves {amount}",
    costsMore: "costs {amount} more",
    costsSame: "costs the same",
    longer: "takes {duration} longer",
    faster: "is {duration} faster",
    sameTime: "takes the same time",
    but: "but",
    and: "and",
  },

  share: {
    copy: "Copy cost split",
    copied: "Copied",
    copiedStatus: "Cost split copied",
    link: "Share link",
    linkCopied: "Link copied",
    textRoute: "{distance}, {duration}, {mode}, {trip}",
    textWithTolls: "with tolls",
    textTollFree: "toll-free",
    textCost: "{energy} {energyCost} + tolls {tollCost} = {total}",
    textEach: "{amount} each for {n} people",
  },

  cost: {
    fuel: "Fuel",
    charging: "Charging",
    tolls: "Tolls",
    total: "Total",
    noBooths: "No toll booths on this route",
    boothsProof: "{booths}, published rates",
    returnTimesTwo: " × 2 for the return",
    adjust: "Adjust",
    adjustHint: "The cost updates as you change these.",
  },

  co2: {
    heading: "CO₂",
    thisRoute: "This route",
    each: "each",
    tollFreeRoute: "Toll-free route",
    tolledRoute: "Route with tolls",
    factorGrid: "Estimate from the Greek grid average, {factor} kg CO₂ per kWh.",
    factorFuel: "Estimate, {factor} kg CO₂ per litre of {fuel} burned.",
  },

  tolls: {
    emptyTitle: "No toll booths on this route",
    emptyHint: "You pay for fuel only.",
    intro: {
      car: "Published rates for a car, in driving order. Rates can change.",
      bike: "Published rates for a motorbike, in driving order. Rates can change.",
    },
    vehicleShort: { car: "car", bike: "motorbike" },
    rowLabel: "{n}. {name}, {highway}: {fee}. Show on map",
    exitRamp: "exit ramp",
    returnTimesTwo: "× 2 for the return",
    booth: "Toll booth",
  },

  timeline: {
    leave: "Leave",
    arrive: "Arrive",
    stop: "Stop",
    leg: "Leg {n}",
    tollLabel: "{time}, toll {n}: {name}, {fee}. Show on map",
    summaryDriving: "Driving {duration}",
    summaryBreaks: " + breaks {duration}",
    summaryArrive: ". Arrive ",
    estimate: "Estimated driving times, without live traffic.",
    oneWayOnly: " One way only: the return depends on when you set off.",
  },

  map: {
    switchTo: "Switch to {mode}: {amount}",
    start: "Start",
    destination: "Destination",
    stopN: "Stop {n}",
  },

  errors: {
    missingEnds: "Add where you start and where you're going.",
    notFound: "Couldn't find \"{place}\". Try a more specific place name.",
    noRoute: "No drivable route was found between these places.",
    tooMany: "Too many requests. Please wait a moment and try again.",
    auth: "The routing service rejected our credentials. (Is ORS_API_KEY set on the server?)",
    service: "The routing service returned an error. Please try again.",
    networkRoute: "Couldn't reach the routing service. Check your connection and try again.",
    networkGeocode: "Couldn't reach the location service. Check your connection and try again.",
    generic: "Something went wrong. Please try again.",
  },
};

export default en;
