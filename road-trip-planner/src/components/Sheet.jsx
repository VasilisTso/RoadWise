import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { TOP_GAP_PX, snapOffsets } from "../utils/sheet";
import { useT } from "../i18n/context";
import { animate, motion, useDragControls, useMotionValue, useReducedMotion } from "framer-motion"; // eslint-disable-line no-unused-vars

/**
 * The one panel next to the map.
 * Desktop: floats on the left, 400px, scrolls internally.
 * Mobile: bottom sheet with peek / half / full snap points, dragged by its handle.
 */
function Sheet({ isDesktop, snap, onSnapChange, topOffset, label, scrollKey, children }) {
  const scrollRef = useRef(null);

  // New view: start at its top
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [scrollKey]);

  if (isDesktop) {
    return (
      <section
        aria-label={label}
        className="absolute left-4 top-4 z-[500] flex max-h-[calc(100%-2rem)] w-[400px] flex-col overflow-hidden rounded-sheet border border-line bg-surface shadow-sheet"
      >
        <div ref={scrollRef} className="sheet-scroll flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </section>
    );
  }
  return (
    <BottomSheet
      snap={snap}
      onSnapChange={onSnapChange}
      topOffset={topOffset}
      label={label}
      scrollRef={scrollRef}
    >
      {children}
    </BottomSheet>
  );
}

function useViewportHeight() {
  const [h, setH] = useState(() => window.innerHeight);
  useEffect(() => {
    const onResize = () => setH(window.innerHeight);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return h;
}

function BottomSheet({ snap, onSnapChange, topOffset, label, scrollRef, children }) {
  const t = useT();
  const vh = useViewportHeight();
  const sheetHeight = vh - topOffset - TOP_GAP_PX;
  const offsets = snapOffsets(sheetHeight, vh);
  const y = useMotionValue(offsets[snap]);
  const controls = useDragControls();
  const reduce = useReducedMotion();

  // Move to the requested snap (also when the viewport resizes)
  useLayoutEffect(() => {
    const target = offsets[snap];
    if (reduce) {
      y.set(target);
      return;
    }
    const a = animate(y, target, { type: "spring", stiffness: 420, damping: 42, mass: 0.9 });
    return () => a.stop();
  }, [snap, offsets.half, offsets.peek, reduce, y]); // eslint-disable-line react-hooks/exhaustive-deps

  const onDragEnd = (_, info) => {
    // Project where the flick would land, then pick the nearest snap
    const projected = y.get() + info.velocity.y * 0.18;
    const order = ["full", "half", "peek"];
    const nearest = order.reduce((best, s) =>
      Math.abs(offsets[s] - projected) < Math.abs(offsets[best] - projected) ? s : best
    );
    if (nearest === snap) {
      animate(y, offsets[snap], { type: "spring", stiffness: 420, damping: 42 });
    } else {
      onSnapChange(nearest);
    }
  };

  const nextSnap = snap === "full" ? "peek" : snap === "half" ? "full" : "half";
  const handleLabel = t(snap === "full" ? "sheet.collapse" : "sheet.expand");

  return (
    <motion.section
      aria-label={label}
      className="fixed inset-x-0 bottom-0 z-[500] flex flex-col rounded-t-sheet border-t border-line bg-surface shadow-sheet"
      style={{ height: sheetHeight, y }}
      drag="y"
      dragListener={false}
      dragControls={controls}
      dragConstraints={{ top: 0, bottom: offsets.peek }}
      dragElastic={0.08}
      dragMomentum={false}
      onDragEnd={onDragEnd}
    >
      <div
        className="flex shrink-0 touch-none justify-center pb-1 pt-2"
        onPointerDown={(e) => controls.start(e)}
      >
        <button
          type="button"
          aria-label={handleLabel}
          onClick={() => onSnapChange(nextSnap)}
          className="grid h-6 w-16 cursor-grab place-items-center rounded-full active:cursor-grabbing"
        >
          <span aria-hidden className="block h-1 w-10 rounded-full bg-line-strong" />
        </button>
      </div>
      <div
        ref={scrollRef}
        className="sheet-scroll flex-1 overflow-y-auto overscroll-contain"
        // Let the content scroll to its end at any snap height
        style={{ paddingBottom: offsets[snap] }}
      >
        {children}
      </div>
    </motion.section>
  );
}

export default Sheet;
