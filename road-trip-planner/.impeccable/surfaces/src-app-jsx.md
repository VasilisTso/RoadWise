---
version: 1
slug: "src-app-jsx"
primary_target: "src/App.jsx"
related_targets: []
---

# Surface: RoadWise app (map + plan/results sheet)

Mode: Operate. Users plan a Greek motorway trip and read its cost (tolls booth by booth, energy, per person), tolled vs toll-free.
Constraints: toll prices are published rates and may be stale (label them as such); no extra ORS requests for settings changes; EN + EL; WCAG 2.2 AA; reduced motion respected.
Memorable moment: the toll list reads like the posted rate board at a toll station, and the trip total is the biggest thing on the screen.

## Direction contract

THESIS: Price as posted, not guessed. The surface owns the toll station rate board: every cost is a posted figure with its source. It refuses the generic map-app card stack with a hero metric and grey chips.

OWN-WORLD: Warm neutral ground (cool, not cream) with ink-near-black type. Colour appears only on route lines, rate plates and state: motorway-sign green = tolled route, warm ochre = toll-free. Rate plates are flat rounded rectangles with a thin rule frame, a small vehicle pictogram, and the price in large tabular figures. Faces: Commissioner (UI, Greek coverage) and Fira Sans Condensed (plate figures, short labels). Sentence case everywhere.

STORY: The driver enters from and to, sees the total and per-person cost at display scale, compares the toll-free option next to it, then checks each booth's plate. They trust the number because each figure traces to a booth or the fuel math.

FIRST VIEWPORT: Full-bleed map. On desktop a 400px sheet floats on the left; on mobile a bottom sheet. Plan state: waypoint fields, a vehicle/fuel segmented control, and a primary "Find route" button. Results state: the total at about 3rem tabular, per person below it, a two-plate route comparison (green / ochre), then Cost · Tolls · Timeline tabs.

FORM: Toll plaza rate board, candidate 6 of 7 (seed: e60f7f327441c046). Raises: Specimen → hierarchy by scale contrast alone (the total is huge, labels small). Product-canon → every figure is paired with its proof (booth list, fuel math line). Lexicon → colour quarantined inside plates and route lines. Airport wayfinding → the active route is highlighted consistently across map, plates and list, and green/ochre do no other job. Star atlas → toll marker size follows a fixed price ramp.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
