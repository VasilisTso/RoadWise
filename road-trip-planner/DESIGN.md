# RoadWise design system

> Working spec from Phase 1. Tokens live in `src/index.css`. After the Phase 2 build, the impeccable documenter regenerates this file from the shipped UI (with `.impeccable/design.json`).

## Direction
**Toll plaza rate board.** Price as posted, not guessed. Each cost is a posted figure with its source, set like the category rate board at a Greek toll station. Surface mode: Operate. The map fills the screen and one sheet holds Plan and Results. The full contract is in `.impeccable/surfaces/src-app-jsx.md`.

The world contributes four things only:
- **Type:** Commissioner + Fira Sans Condensed
- **Palette:** warm neutrals, sign green, ochre
- **Density:** a compact, tabular rate-board rhythm
- **Signature move:** rate plates whose size follows a price ramp

Layout and controls stay standard web components.

## Colour
Strategy: **Restrained, with quarantined colour.** Neutrals carry the UI. Colour lives only on route lines, rate plates and state.

| Role | Token | Light | Dark | Job |
|---|---|---|---|---|
| Ground | `ground` | #f2f0eb | #151413 | App/map backdrop |
| Surface | `surface` / `surface-raised` / `surface-sunken` | #fbfaf7 / #fff / #e9e6df | #1d1c1a / #262422 / #121110 | Sheet, popovers, wells |
| Lines | `line` / `line-strong` | #dcd7cd / #b9b2a5 | #36332f / #4d4943 | Rules, plate frames |
| Ink | `ink` / `ink-muted` / `ink-subtle` | #1d1c19 / #5b574f / #6f6a60 | #f1eee8 / #b8b2a7 / #a19a8e | Text |
| Tolled route | `tolled` (+ `-strong`, `-soft`, `-line`) | #00703c | #4cc485 | Greek motorway-sign green. Tolled route only. |
| Toll-free route | `free` (+ `-strong`, `-soft`, `-line`) | #8a5800 (line #c98a1b) | #e2a947 | Warm ochre. Toll-free route only. |
| States | `success`, `warn`, `danger` (+ `-soft`) | #1f7a45 / #8f5b00 / #b3261e | #5cc98a / #e8b453 / #f08b80 | Feedback only |
| Focus | `focus` | #1d5fd1 | #7aa7ff | Focus rings |

Rules:
- Green and ochre do no other job: no green "success" buttons and no ochre warnings. Use `success`/`warn` for those.
- The active route is shown the same way everywhere (map line, plate frame, list accent).
- Text colours on surfaces meet 4.5:1, using the `-strong` variants for text on `-soft` fills.

## Theme
- `data-theme="light"|"dark"` on `<html>` wins.
- With no attribute, the theme follows `prefers-color-scheme`.
- Tokens are raw `--rw-*` custom properties, exposed to Tailwind through `@theme inline`, e.g. `bg-surface`, `text-ink-muted`, `border-line`, `text-tolled`.
- Map tiles: Stadia Alidade Smooth (light) and Alidade Smooth Dark (dark), swapped live by `MapView`, with Stadia + OpenMapTiles + OSM attribution. Keyless on localhost; production requires the Vercel domain registered in a Stadia account. (CARTO basemaps now require an API key.)

## Typography
- **Commissioner** (`font-sans`, 400–700): all UI. It is by a Greek type designer and has full Greek coverage for EL.
- **Fira Sans Condensed** (`font-plate`, 500–700): plate figures, prices on markers, short plate labels. Has Greek.
- Labels use sentence case. No uppercase tracking and no monospace.
- Numbers use the `.num` class (`tabular-nums lining-nums`) in the UI face.
- Scale contrast carries the hierarchy: the trip total is display size (~3rem), labels are 12–13px, body is 15px.
- Single font source: one Google Fonts `<link rel="stylesheet">` in `index.html` (after the preconnects), so it loads in parallel with the app CSS instead of chaining behind it.

## Shape & depth
- `radius-plate` 6px (plates, inputs, markers). `radius-sheet` 16px (floating sheet).
- `shadow-sheet` for the floating sheet and popups. `shadow-marker` for map markers. Shadows always use an offset and blur, with a warm tint.

## Map markers
- Start/end pins: `.rw-pin`. Start is a circle, end is a rounded square.
- Toll: `.rw-toll` rate plate, with a green number tab and a price in `font-plate`. Size follows a fixed price ramp: `--sm` < €1.50 ≤ `--md` < €3 ≤ `--lg` (10.5 / 12.5 / 15px, splitting the published car rates into thirds). `.is-active` marks the highlighted plate. `.is-compact` folds a plate to its number tab where it would overlap an earlier booth at the current zoom (recomputed on zoom); it opens fully again when highlighted.
- Popups: `.rw-popup`, `__meta`, `__title`, `__row`, `__label`.

## Motion
- Ease: `--ease-out-expo`.
- `prefers-reduced-motion` turns transitions and animations off globally.
- Motion work (route draw-in, staggered plates, number tween) comes in Phase 2.
