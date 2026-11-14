# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Greek drivers planning a drive inside Greece. Before they leave, they want to know what the trip will cost: tolls, fuel or charging, and often how much each person in the car owes. They use it at a desk while planning and on a phone right before leaving.

## Product Purpose
RoadWise plans a road trip on Greek motorways and shows the real cost: every toll booth on the route with its price, plus energy cost. It compares the tolled route with the toll-free one. Success means the driver trusts the number and decides quickly, and the trip feels cheaper to plan than to guess.

## Positioning
Mapping apps say "this route has tolls". RoadWise says which toll booths you pass, what each one charges for your vehicle, and what the whole trip costs per person. It shows that next to the toll-free alternative and the time it costs.

## Operating Context
- Routes come from OpenRouteService through the `/api/ors` Vercel proxy. Toll booths are matched to the route geometry from `src/data/tolls.json`.
- Cost settings (vehicle, fuel price, consumption, passengers, round trip) recalculate locally with no new request.
- Trips are shared as URLs; a link reopens the same route and settings.
- Planned (see REDESIGN_PLAN.md): multi-stop waypoints, fuel type + EV with CO₂, saved and recent trips, departure time / ETA, dark mode, EN + EL.

## Capabilities and Constraints
- **Toll prices may be stale.** `tolls.json` is maintained by hand. The UI presents toll prices as published rates that can change, never as guaranteed.
- **ORS free-tier limits.** Avoid unnecessary requests: settings changes must not refetch, autocomplete stays debounced, and one search fetches both route variants.
- Coverage and vehicle classes (car, motorbike today) are current facts, not commitments. The user did not mark them as fixed limits.
- Stack: React 19, Vite 7, Tailwind v4, Leaflet, framer-motion. Deployed on Vercel.

## Brand Commitments
- Name: RoadWise. Favicon `public/distance.png`.
- Voice: plain, direct language. No pseudo-technical jargon ("telemetry", "PAX", fake status indicators).
- Bilingual EN + EL is planned. Greek copy must read as native, not as a translation.

## Evidence on Hand
- Toll dataset: `src/data/tolls.json` (names, highways, coordinates, car and motorbike prices).
- No testimonials, usage numbers or press exist. Do not invent any.

## Product Principles
1. The number must be trustworthy: show where each cost comes from (booth by booth, fuel math visible) and mark estimates as estimates.
2. The map is the work surface. Planning and results stay next to the route, not on a separate page.
3. Comparison is the point. The tolled vs toll-free trade-off (money vs time) is always one glance away.
4. Changing settings is instant and free: never cost a request or lose the user's place on the map.
5. Respect the phone moment: the answer must be readable one-handed right before leaving.

## Accessibility & Inclusion
Target WCAG 2.2 AA. All controls work by keyboard. Motion respects `prefers-reduced-motion`. Lighthouse a11y ≥ 95 (from REDESIGN_PLAN.md).
