// Ελληνικά. Same keys as en.js. Written as Greek copy, not word-for-word translation.

const el = {
  meta: {
    title: "RoadWise: κόστος διοδίων και καυσίμων για ταξίδια στην Ελλάδα",
    description:
      "Σχεδιάστε μια διαδρομή στην Ελλάδα και δείτε κάθε σταθμό διοδίων με την τιμή του, μαζί με το κόστος καυσίμου, δίπλα στη διαδρομή χωρίς διόδια.",
  },

  units: { h: "ώρ.", min: "λεπ." },
  time: { justNow: "μόλις τώρα" },

  header: {
    home: "Αρχική RoadWise",
    yourTrips: "Οι διαδρομές σας",
    theme: {
      system: "Θέμα: όπως το σύστημα",
      light: "Θέμα: φωτεινό",
      dark: "Θέμα: σκοτεινό",
      change: "{current}. Αλλαγή θέματος",
    },
    language: { switchTo: "English", short: "EN" },
    about: {
      label: "Σχετικά με το RoadWise",
      body: "Σχεδιάζει διαδρομές στους ελληνικούς αυτοκινητόδρομους και δείχνει κάθε σταθμό διοδίων στον δρόμο με την τιμή του, μαζί με το κόστος καυσίμου, δίπλα στη διαδρομή χωρίς διόδια.",
      caveat:
        "Οι τιμές των διοδίων είναι οι δημοσιευμένες χρεώσεις και καταχωρούνται με το χέρι. Μπορεί να αλλάξουν, γι' αυτό ελέγξτε τες πριν ξεκινήσετε.",
      credits:
        "Διαδρομές από το OpenRouteService. Χάρτης από Stadia Maps, OpenMapTiles και τους συντελεστές του OpenStreetMap.",
      email: "Email",
    },
  },

  history: {
    title: "Οι διαδρομές σας",
    intro: "Εδώ μένουν οι 8 τελευταίες διαδρομές που αναζητήσατε. Βάλτε αστέρι για να κρατήσετε μία.",
    empty: "Καμία διαδρομή ακόμα. Βρείτε μια διαδρομή και θα εμφανιστεί εδώ.",
    starred: "Με αστέρι",
    recent: "Πρόσφατες",
    tripName: "Όνομα διαδρομής",
    star: "Αστέρι στη διαδρομή {title}",
    unstar: "Αφαίρεση αστεριού από τη διαδρομή {title}",
    rename: "Μετονομασία της διαδρομής {title}",
    remove: "Διαγραφή της διαδρομής {title}",
    via: "{route} μέσω {place}",
    viaStops: { one: "{route} με {n} στάση", other: "{route} με {n} στάσεις" },
  },

  sheet: {
    plan: "Σχεδιασμός διαδρομής",
    results: "Αποτελέσματα διαδρομής",
    expand: "Άνοιγμα πίνακα",
    collapse: "Σύμπτυξη πίνακα",
    finding: "Αναζήτηση διαδρομών",
  },

  plan: {
    title: "Πόσο θα κοστίσει η διαδρομή;",
    intro: "Δείτε κάθε σταθμό διοδίων στον δρόμο και πόσο χρεώνει, μαζί με τα καύσιμα, δίπλα στη διαδρομή χωρίς διόδια.",
    backToResults: "Πίσω στα αποτελέσματα",
    recentTrips: "Πρόσφατες διαδρομές",
    starred: "Με αστέρι",
    useMyLocation: "Η τοποθεσία μου",
    locating: "Εντοπισμός…",
    swap: "Αντιστροφή",
    find: "Εύρεση διαδρομής",
    finding: "Αναζήτηση διαδρομών…",
    dismiss: "Κλείσιμο μηνύματος",
  },

  geo: {
    unsupported: "Αυτός ο browser δεν μπορεί να δώσει την τοποθεσία σας. Πληκτρολογήστε το μέρος.",
    noName: "Βρήκαμε πού είστε, αλλά όχι το όνομα του μέρους. Πληκτρολογήστε το.",
    denied: "Η πρόσβαση στην τοποθεσία είναι κλειστή. Ενεργοποιήστε τη στις ρυθμίσεις του browser ή πληκτρολογήστε το μέρος.",
    failed: "Δεν βρέθηκε η τοποθεσία σας. Πληκτρολογήστε το μέρος.",
  },

  waypoints: {
    legend: "Διαδρομή",
    from: "Από",
    to: "Προς",
    stop: "Στάση",
    stopN: "Στάση {n}",
    placeholderEnd: "Πόλη, διεύθυνση ή μέρος",
    placeholderStop: "Προσθήκη στάσης",
    emptyFrom: "αφετηρία",
    emptyTo: "προορισμός",
    emptyStop: "κενή στάση",
    move: "Μετακίνηση: {place}. Χρησιμοποιήστε τα βέλη πάνω και κάτω",
    remove: "Αφαίρεση: {place}",
    moved: "{place}: θέση {pos} από {count}",
    add: "Προσθήκη στάσης",
    max: "Έως {n} σημεία",
    suggestions: "Προτάσεις για {label}",
  },

  settings: {
    vehicle: "Όχημα",
    runsOn: "Καύσιμο",
    car: "Αυτοκίνητο",
    bike: "Μηχανή",
    leaving: "Αναχώρηση",
    leaveNow: "Τώρα",
    breaks: "Με διαλείμματα",
    breaksHint: "15 λεπ. κάθε 2 ώρες οδήγησης",
    people: "Άτομα που μοιράζονται",
    fewer: "Ένα άτομο λιγότερο",
    more: "Ένα άτομο περισσότερο",
    // Asked as a yes/no: "Με επιστροφή / Μόνο μετάβαση" don't fit the half-width control
    trip: "Επιστροφή",
    oneWay: "Όχι",
    return: "Ναι",
    fuelPrice: "Τιμή καυσίμου",
    chargingPrice: "Τιμή φόρτισης",
    consumption: "Κατανάλωση",
  },

  fuel: {
    petrol: "Βενζίνη",
    diesel: "Diesel",
    lpg: "Υγραέριο",
    ev: "Ρεύμα",
    // "ανά λίτρο ___"
    of: { petrol: "βενζίνης", diesel: "diesel", lpg: "υγραερίου" },
  },

  unit: {
    L: "λτ",
    kWh: "kWh",
    perL: "€/λτ",
    perKWh: "€/kWh",
    LPer100: "λτ/100 χλμ.",
    kWhPer100: "kWh/100 χλμ.",
  },

  results: {
    editTrip: "Αλλαγή",
    tripCost: "Κόστος ταξιδιού",
    eachSuffix: "ο καθένας, για {n} άτομα",
    onePerson: "Πληρώνει ένα άτομο. Προσθέστε άτομα για να το μοιράσετε.",
    route: "Διαδρομή",
    withTolls: "Με διόδια",
    tollFree: "Χωρίς διόδια",
    noBooths: "Χωρίς σταθμούς διοδίων",
    booths: { one: "{n}\u00a0σταθμός", other: "{n}\u00a0σταθμοί" },
    oneWay: "μόνο μετάβαση",
    return: "μετ' επιστροφής",
    stops: { one: "{n}\u00a0στάση", other: "{n}\u00a0στάσεις" },
    arrive: "άφιξη {time}",
    tabsLabel: "Λεπτομέρειες διαδρομής",
    tabCost: "Κόστος",
    tabTolls: "Διόδια",
    tabTimeline: "Χρόνοι",
  },

  tradeOff: {
    sentence: "Χωρίς διόδια {money} {joiner} {time}.",
    saves: "γλιτώνετε {amount}",
    costsMore: "πληρώνετε {amount} περισσότερα",
    costsSame: "το κόστος είναι ίδιο",
    longer: "θέλει {duration} παραπάνω",
    faster: "είναι {duration} πιο γρήγορη",
    sameTime: "θέλει τον ίδιο χρόνο",
    but: "αλλά",
    and: "και",
  },

  share: {
    copy: "Αντιγραφή μοιρασιάς",
    copied: "Αντιγράφηκε",
    copiedStatus: "Η μοιρασιά αντιγράφηκε",
    link: "Κοινοποίηση",
    linkCopied: "Ο σύνδεσμος αντιγράφηκε",
    textRoute: "{distance}, {duration}, {mode}, {trip}",
    textWithTolls: "με διόδια",
    textTollFree: "χωρίς διόδια",
    textCost: "{energy} {energyCost} + διόδια {tollCost} = {total}",
    textEach: "{amount} ο καθένας, για {n} άτομα",
  },

  cost: {
    fuel: "Καύσιμα",
    charging: "Φόρτιση",
    tolls: "Διόδια",
    total: "Σύνολο",
    noBooths: "Δεν υπάρχουν διόδια σε αυτή τη διαδρομή",
    boothsProof: "{booths}, δημοσιευμένες χρεώσεις",
    returnTimesTwo: " × 2 για την επιστροφή",
    adjust: "Ρυθμίσεις",
    adjustHint: "Το κόστος αλλάζει μόλις τις αλλάξετε.",
  },

  co2: {
    heading: "CO₂",
    thisRoute: "Αυτή η διαδρομή",
    each: "ανά άτομο",
    tollFreeRoute: "Χωρίς διόδια",
    tolledRoute: "Με διόδια",
    factorGrid: "Εκτίμηση με βάση τον μέσο όρο του ελληνικού δικτύου, {factor} kg CO₂ ανά kWh.",
    factorFuel: "Εκτίμηση, {factor} kg CO₂ ανά λίτρο {fuel}.",
  },

  tolls: {
    emptyTitle: "Δεν υπάρχουν διόδια σε αυτή τη διαδρομή",
    emptyHint: "Πληρώνετε μόνο καύσιμα.",
    intro: {
      car: "Δημοσιευμένες χρεώσεις για αυτοκίνητο, με τη σειρά που τα συναντάτε. Μπορεί να αλλάξουν.",
      bike: "Δημοσιευμένες χρεώσεις για μηχανή, με τη σειρά που τα συναντάτε. Μπορεί να αλλάξουν.",
    },
    vehicleShort: { car: "αυτοκ.", bike: "μηχανή" },
    rowLabel: "{n}. {name}, {highway}: {fee}. Εμφάνιση στον χάρτη",
    exitRamp: "ράμπα εξόδου",
    returnTimesTwo: "× 2 για την επιστροφή",
    booth: "Σταθμός διοδίων",
  },

  timeline: {
    leave: "Αναχώρηση",
    arrive: "Άφιξη",
    stop: "Στάση",
    leg: "Σκέλος {n}",
    tollLabel: "{time}, διόδια {n}: {name}, {fee}. Εμφάνιση στον χάρτη",
    summaryDriving: "Οδήγηση {duration}",
    summaryBreaks: " + διαλείμματα {duration}",
    summaryArrive: " · άφιξη ", // ". Άφιξη" would double the dot after "λεπ."
    estimate: "Εκτιμώμενοι χρόνοι οδήγησης, χωρίς κίνηση σε πραγματικό χρόνο.",
    oneWayOnly: " Μόνο η μετάβαση: η επιστροφή εξαρτάται από το πότε θα ξεκινήσετε.",
  },

  map: {
    switchTo: "Αλλαγή σε {mode}: {amount}",
    start: "Αφετηρία",
    destination: "Προορισμός",
    stopN: "Στάση {n}",
  },

  errors: {
    missingEnds: "Συμπληρώστε από πού ξεκινάτε και πού πηγαίνετε.",
    notFound: "Δεν βρέθηκε το «{place}». Δοκιμάστε πιο συγκεκριμένο όνομα.",
    noRoute: "Δεν βρέθηκε οδική διαδρομή ανάμεσα σε αυτά τα σημεία.",
    tooMany: "Πάρα πολλά αιτήματα. Περιμένετε λίγο και δοκιμάστε ξανά.",
    auth: "Η υπηρεσία διαδρομών απέρριψε τα διαπιστευτήριά μας. (Έχει οριστεί το ORS_API_KEY στον server;)",
    service: "Η υπηρεσία διαδρομών επέστρεψε σφάλμα. Δοκιμάστε ξανά.",
    networkRoute: "Δεν υπάρχει σύνδεση με την υπηρεσία διαδρομών. Ελέγξτε τη σύνδεσή σας και δοκιμάστε ξανά.",
    networkGeocode: "Δεν υπάρχει σύνδεση με την υπηρεσία τοποθεσιών. Ελέγξτε τη σύνδεσή σας και δοκιμάστε ξανά.",
    generic: "Κάτι πήγε στραβά. Δοκιμάστε ξανά.",
  },
};

export default el;
