import React, { useEffect, useRef } from "react";
import L from "leaflet";
import { escapeHtml } from "../utils/format";
import { useI18n } from "../i18n/context";
import { DESKTOP_QUERY } from "../hooks/useMediaQuery";
import { pointLetter } from "../utils/labels";

// Stadia Alidade Smooth: keyless on localhost; production needs the domain registered in Stadia
const TILE_ATTRIBUTION =
  '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
const TILE_URLS = {
  light: "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png",
  dark: "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png",
};

const GREECE_VIEW = { center: [38.6, 23.2], zoom: 7 };
const DRAW_MS = 900; // route draw-in; toll plates appear as the line reaches them
const FIT_MARGIN = 40;

const prefersReducedMotion = () =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

// Fixed price ramp for toll plates: bigger fee, bigger plate
function tollSizeClass(fee) {
  if (fee >= 4) return "rw-toll--lg";
  if (fee >= 2) return "rw-toll--md";
  return "rw-toll--sm";
}

function enterAttrs(delayMs) {
  return delayMs == null ? "" : ` rw-enter" style="animation-delay:${Math.round(delayMs)}ms`;
}

// Numbered rate plate for each toll station on the route
function createTollIcon(index, fee, feeText, delayMs) {
  return L.divIcon({
    className: "rw-toll-marker",
    iconSize: [64, 26],
    iconAnchor: [32, 13],
    popupAnchor: [0, -14],
    html: `<div class="rw-toll ${tollSizeClass(fee)}${enterAttrs(delayMs)}"><span class="rw-toll__num">${
      index + 1
    }</span><span class="rw-toll__fee">${escapeHtml(feeText)}</span></div>`,
  });
}

// Start / stop / end pin
function createEndpointIcon(letter, variant, delayMs) {
  const size = variant === "stop" ? 22 : 26;
  return L.divIcon({
    className: "rw-pin-marker",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2 - 1],
    html: `<div class="rw-pin rw-pin--${variant}${enterAttrs(delayMs)}">${letter}</div>`,
  });
}

// Route line colour from the design tokens (tolled = sign green, toll-free = ochre)
function routeColor(avoidTolls) {
  const name = avoidTolls ? "--rw-free-line" : "--rw-tolled-line";
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || "#00824a";
}

// Draws the SVG path in with stroke-dashoffset, then clears the dash so zooming stays correct
function drawIn(line, map) {
  const path = line.getElement();
  if (!path?.getTotalLength) return () => {};
  const len = path.getTotalLength();
  path.style.strokeDasharray = `${len} ${len}`;
  path.style.strokeDashoffset = `${len}`;
  path.getBoundingClientRect(); // commit the start state before transitioning
  path.style.transition = `stroke-dashoffset ${DRAW_MS}ms cubic-bezier(0.65, 0, 0.35, 1)`;
  path.style.strokeDashoffset = "0";

  const finish = () => {
    path.removeEventListener("transitionend", finish);
    map.off("zoomstart", finish);
    path.style.transition = "";
    path.style.strokeDasharray = "";
    path.style.strokeDashoffset = "";
  };
  path.addEventListener("transitionend", finish);
  map.on("zoomstart", finish); // a zoom re-projects the path; stop the dash trick
  return finish;
}

const tollPopup = (toll, idx, t, fmt) => `<div class="rw-popup">
  <div class="rw-popup__meta">${idx + 1} · ${escapeHtml(toll.highway || t("tolls.booth"))}</div>
  <div class="rw-popup__title">${escapeHtml(toll.name)}</div>
  <div class="rw-popup__row"><span>${escapeHtml(t("settings.car"))}</span><strong>${escapeHtml(fmt.euro(toll.car))}</strong></div>
  <div class="rw-popup__row"><span>${escapeHtml(t("settings.bike"))}</span><strong>${escapeHtml(fmt.euro(toll.bike))}</strong></div>
</div>`;

const endpointPopup = (label, name) =>
  `<div class="rw-popup__label">${escapeHtml(label)}</div><div class="rw-popup__title">${escapeHtml(name)}</div>`;

/**
 * Full-bleed map. `insets` are the px the floating sheet covers, so the route is
 * framed in the visible part of the map.
 */
function MapView({
  route,
  alternativeRoute = null,
  focusedToll = null,
  highlightIndex = null,
  loading = false,
  theme,
  isDesktop,
  insets,
  onSelectRouteMode,
  onHoverToll,
}) {
  const { t, fmt } = useI18n();
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const tilesRef = useRef(null);
  const tollMarkersRef = useRef([]);
  const fittedCoordsRef = useRef(null);
  const insetsRef = useRef(insets);
  const callbacksRef = useRef({ onSelectRouteMode, onHoverToll });

  useEffect(() => {
    insetsRef.current = insets;
    callbacksRef.current = { onSelectRouteMode, onHoverToll };
  });

  // Create the map once (cleaned up on unmount / StrictMode re-mount)
  useEffect(() => {
    const map = L.map(containerRef.current, { zoomControl: false }).setView(
      GREECE_VIEW.center,
      GREECE_VIEW.zoom
    );
    // Start with Greece in the part of the map the sheet leaves visible
    if (window.matchMedia(DESKTOP_QUERY).matches) map.panBy([-208, 0], { animate: false });
    else map.setZoom(6, { animate: false }).panBy([0, 160], { animate: false });
    L.control.zoom({ position: "topright" }).addTo(map);
    tilesRef.current = L.tileLayer(TILE_URLS.light, {
      maxZoom: 20,
      attribution: TILE_ATTRIBUTION,
    }).addTo(map);
    mapRef.current = map;

    // Keep Leaflet's size in sync with its container
    const ro = new ResizeObserver(() => map.invalidateSize({ pan: false }));
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Basemap follows the theme
  useEffect(() => {
    tilesRef.current?.setUrl(TILE_URLS[theme === "dark" ? "dark" : "light"]);
  }, [theme]);

  // Attribution stays visible: under the bottom sheet on mobile, so move it to the top
  useEffect(() => {
    mapRef.current?.attributionControl.setPosition(isDesktop ? "bottomright" : "topleft");
  }, [isDesktop]);

  // Draw the active route, the dashed alternative, and the markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !route || !route.coords?.length) return;

    const isNewGeometry = fittedCoordsRef.current !== route.coords;
    const animateIn = isNewGeometry && !prefersReducedMotion();
    const delayFor = (fraction) => (animateIn ? fraction * DRAW_MS : null);

    let altLine = null;
    if (alternativeRoute?.coords?.length) {
      altLine = L.polyline(alternativeRoute.coords, {
        color: routeColor(alternativeRoute.avoidTolls),
        weight: 4,
        opacity: 0.55,
        dashArray: "2 8",
        lineCap: "round",
        className: animateIn ? "rw-alt-line rw-enter-late" : "rw-alt-line",
      })
        .bindTooltip(
          t("map.switchTo", {
            mode: t(alternativeRoute.avoidTolls ? "share.textTollFree" : "share.textWithTolls"),
            amount: fmt.euro(alternativeRoute.totalCost),
          }),
          { sticky: true }
        )
        .on("click", () => callbacksRef.current.onSelectRouteMode?.(alternativeRoute.avoidTolls))
        .addTo(map);
    }

    const line = L.polyline(route.coords, {
      color: routeColor(route.avoidTolls),
      weight: 5,
      opacity: 0.95,
      lineJoin: "round",
    }).addTo(map);

    // Only re-fit when the geometry changes, so settings tweaks keep the user's zoom
    let stopDraw = () => {};
    if (isNewGeometry) {
      fittedCoordsRef.current = route.coords;
      const { top = 0, right = 0, bottom = 0, left = 0 } = insetsRef.current ?? {};
      map.fitBounds(line.getBounds(), {
        paddingTopLeft: [left + FIT_MARGIN, top + FIT_MARGIN],
        paddingBottomRight: [right + FIT_MARGIN, bottom + FIT_MARGIN],
        animate: false,
      });
      if (animateIn) stopDraw = drawIn(line, map);
    }

    const last = route.coords.length - 1;
    // Pins sit on the route where each leg starts / ends (A, B, C… like the plan list)
    const pointIdx = route.legs?.length
      ? [route.legs[0].from, ...route.legs.map((leg) => leg.to)]
      : [0, last];
    const count = pointIdx.length;
    const pointMarkers = pointIdx.map((vertex, i) => {
      const variant = i === 0 ? "start" : i === count - 1 ? "end" : "stop";
      const role =
        i === 0 ? t("map.start") : i === count - 1 ? t("map.destination") : t("map.stopN", { n: i });
      return L.marker(route.coords[vertex], {
        icon: createEndpointIcon(pointLetter(i), variant, delayFor(vertex / last)),
        zIndexOffset: 900,
        keyboard: false,
      })
        .bindPopup(endpointPopup(role, route.waypoints?.[i]?.label ?? ""))
        .addTo(map);
    });

    const vehicle = route.vehicle || "car";
    tollMarkersRef.current = route.tolls.map((toll, idx) => {
      const fee = toll[vehicle] ?? toll.car;
      return L.marker([toll.lat, toll.lng], {
        icon: createTollIcon(idx, fee, fmt.euro(fee), delayFor(toll.routeOrder / last)),
        zIndexOffset: 1000,
        keyboard: false, // the toll list is the keyboard path to each booth
        title: `${toll.name}: ${fmt.euro(fee)}`,
      })
        .bindPopup(tollPopup(toll, idx, t, fmt))
        .on("mouseover", () => callbacksRef.current.onHoverToll?.(idx))
        .on("mouseout", () => callbacksRef.current.onHoverToll?.(null))
        .addTo(map);
    });

    return () => {
      stopDraw();
      altLine?.remove();
      line.remove();
      pointMarkers.forEach((m) => m.remove());
      tollMarkersRef.current.forEach((m) => m.remove());
      tollMarkersRef.current = [];
    };
  }, [route, alternativeRoute, theme, t, fmt]);

  // Highlight the plate for the toll row under the pointer / focus
  useEffect(() => {
    const plates = tollMarkersRef.current.map((m) => m.getElement()?.querySelector(".rw-toll"));
    plates.forEach((el, i) => el?.classList.toggle("is-active", i === highlightIndex));
    const marker = tollMarkersRef.current[highlightIndex];
    marker?.setZIndexOffset(1100);
    return () => marker?.setZIndexOffset(1000);
  }, [highlightIndex, route]);

  // Fly to a toll picked from the list and open its popup
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !focusedToll) return;
    const marker = tollMarkersRef.current[focusedToll.index];
    if (!marker) return;
    map.flyTo([focusedToll.toll.lat, focusedToll.toll.lng], Math.max(map.getZoom(), 11), {
      duration: prefersReducedMotion() ? 0 : 0.6,
    });
    marker.openPopup();
  }, [focusedToll]);

  return (
    // isolate: keep Leaflet's pane z-indexes below the sheet
    <div className="absolute inset-0 isolate">
      <div ref={containerRef} className="h-full w-full" />
      {loading && <div aria-hidden className="map-shimmer" />}
    </div>
  );
}

export default MapView;
