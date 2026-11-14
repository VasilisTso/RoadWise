import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, Reorder, useDragControls, useReducedMotion } from "framer-motion";
import { TbGripVertical, TbPlus, TbX } from "react-icons/tb";
import LocationField from "./LocationField";
import { MAX_WAYPOINTS } from "../hooks/useTrip";
import { pointLetter, pointName } from "../utils/labels";
import { useT } from "../i18n/context";

// Letter badge matching the map pin: start ●, stops ○, destination ■
export function PointBadge({ index, count, className = "" }) {
  const kind = index === 0 ? "start" : index === count - 1 ? "end" : "stop";
  return (
    <span aria-hidden className={`wp-badge wp-badge--${kind} ${className}`}>
      {pointLetter(index)}
    </span>
  );
}

// How an unfilled point is named in announcements ("start", "empty stop", …)
function emptyPlace(t, index, count) {
  if (index === 0) return t("waypoints.emptyFrom");
  if (index === count - 1) return t("waypoints.emptyTo");
  return t("waypoints.emptyStop");
}

function WaypointRow({
  waypoint,
  index,
  count,
  reorderable,
  action,
  onTextChange,
  onSelect,
  onRemove,
  onMove,
  reduceMotion,
}) {
  const t = useT();
  const controls = useDragControls();
  const name = pointName(t, index, count);
  const place = waypoint.label.trim() || emptyPlace(t, index, count);

  return (
    <Reorder.Item
      as="li"
      value={waypoint}
      dragListener={false}
      dragControls={controls}
      initial={reduceMotion ? false : { opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0, transition: { duration: 0.16 } }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex items-end gap-1.5 rounded-plate bg-surface"
    >
      {reorderable && (
        <button
          type="button"
          data-handle={waypoint.id}
          aria-label={t("waypoints.move", { place })}
          onPointerDown={(e) => controls.start(e)}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp" || e.key === "ArrowDown") {
              e.preventDefault();
              onMove(waypoint.id, e.key === "ArrowUp" ? -1 : 1);
            }
          }}
          className="-ml-1.5 grid h-10 w-6 shrink-0 cursor-grab touch-none place-items-center rounded-plate text-ink-subtle hover:bg-surface-sunken hover:text-ink active:cursor-grabbing"
        >
          <TbGripVertical aria-hidden className="size-4" />
        </button>
      )}

      <div className="min-w-0 flex-1">
        <LocationField
          id={`place-${waypoint.id}`}
          label={name}
          placeholder={t(index === 0 || index === count - 1 ? "waypoints.placeholderEnd" : "waypoints.placeholderStop")}
          marker={<PointBadge index={index} count={count} />}
          value={waypoint.label}
          onTextChange={(text) => onTextChange(waypoint.id, text)}
          onSelect={(s) => onSelect(waypoint.id, s)}
          action={action}
        />
      </div>

      {count > 2 && (
        <button
          type="button"
          aria-label={t("waypoints.remove", { place })}
          onClick={() => onRemove(waypoint.id)}
          className="-mr-1.5 grid size-10 shrink-0 place-items-center rounded-plate text-ink-subtle hover:bg-surface-sunken hover:text-ink"
        >
          <TbX aria-hidden className="size-4" />
        </button>
      )}
    </Reorder.Item>
  );
}

/**
 * Start, stops and destination. Stops reorder by dragging the grip, or with ↑/↓ on it.
 * `firstAction` / `lastAction` sit next to the first and last field's label.
 */
function WaypointList({
  waypoints,
  onTextChange,
  onSelect,
  onAdd,
  onRemove,
  onReorder,
  onMove,
  firstAction = null,
  lastAction = null,
}) {
  const t = useT();
  const reduceMotion = useReducedMotion();
  const listRef = useRef(null);
  const focusAfterMove = useRef(null);
  const [announcement, setAnnouncement] = useState("");
  const count = waypoints.length;
  const reorderable = count > 2;

  // Keyboard moves re-order the DOM; keep focus on the moved grip
  useEffect(() => {
    const id = focusAfterMove.current;
    if (!id) return;
    focusAfterMove.current = null;
    listRef.current?.querySelector(`[data-handle="${id}"]`)?.focus();
  }, [waypoints]);

  const move = (id, delta) => {
    const from = waypoints.findIndex((w) => w.id === id);
    const to = from + delta;
    if (to < 0 || to >= count) return;
    focusAfterMove.current = id;
    onMove(id, delta);
    const place = waypoints[from].label.trim() || emptyPlace(t, from, count);
    setAnnouncement(t("waypoints.moved", { place, pos: to + 1, count }));
  };

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="sr-only">{t("waypoints.legend")}</legend>
      <Reorder.Group
        ref={listRef}
        as="ol"
        axis="y"
        values={waypoints}
        onReorder={onReorder}
        className="flex flex-col gap-3"
      >
        <AnimatePresence initial={false}>
          {waypoints.map((w, i) => (
            <WaypointRow
              key={w.id}
              waypoint={w}
              index={i}
              count={count}
              reorderable={reorderable}
              action={i === 0 ? firstAction : i === count - 1 ? lastAction : null}
              onTextChange={onTextChange}
              onSelect={onSelect}
              onRemove={onRemove}
              onMove={move}
              reduceMotion={reduceMotion}
            />
          ))}
        </AnimatePresence>
      </Reorder.Group>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onAdd}
          disabled={count >= MAX_WAYPOINTS}
          className="-ml-1.5 inline-flex items-center gap-1.5 rounded-plate px-1.5 py-1 text-sm font-medium text-ink hover:bg-surface-sunken disabled:cursor-not-allowed disabled:text-ink-subtle disabled:hover:bg-transparent"
        >
          <TbPlus aria-hidden className="size-4" />
          {t("waypoints.add")}
        </button>
        {count >= MAX_WAYPOINTS && (
          <span className="text-[13px] text-ink-subtle">{t("waypoints.max", { n: MAX_WAYPOINTS })}</span>
        )}
      </div>

      <p role="status" className="sr-only">
        {announcement}
      </p>
    </fieldset>
  );
}

export default WaypointList;
