import React, { useEffect, useRef, useState } from "react";
import { TbPencil, TbStar, TbStarFilled, TbTrash } from "react-icons/tb";
import { tripTitle } from "../hooks/useTripHistory";
import { formatDuration, formatKm, formatRelative, pluralize } from "../utils/format";

function RowIconButton({ label, pressed, onClick, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      onClick={onClick}
      className="grid size-8 shrink-0 place-items-center rounded-plate text-ink-subtle hover:bg-surface-sunken hover:text-ink"
    >
      {children}
    </button>
  );
}

function RenameField({ trip, onDone }) {
  const [value, setValue] = useState(trip.name || tripTitle(trip));
  const ref = useRef(null);
  useEffect(() => {
    ref.current?.focus();
    ref.current?.select();
  }, []);
  return (
    <input
      ref={ref}
      aria-label="Trip name"
      value={value}
      maxLength={60}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => onDone(value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onDone(value);
        } else if (e.key === "Escape") {
          e.stopPropagation(); // cancel the rename, keep the panel open
          onDone(null);
        }
      }}
      className="field-input h-9 text-sm"
    />
  );
}

function TripRow({ trip, onLoad, onToggleStar, onRename, onRemove }) {
  const [renaming, setRenaming] = useState(false);
  const title = tripTitle(trip);
  const stops = trip.waypoints.length - 2;

  return (
    <li className="flex items-center gap-1 border-t border-line py-1 first:border-t-0">
      <div className="min-w-0 flex-1">
        {renaming ? (
          <RenameField
            trip={trip}
            onDone={(name) => {
              setRenaming(false);
              if (name != null) onRename(trip.id, name === tripTitle({ ...trip, name: "" }) ? "" : name);
            }}
          />
        ) : (
          <button
            type="button"
            onClick={() => onLoad(trip)}
            className="block w-full rounded-plate px-2 py-1.5 text-left hover:bg-surface-sunken"
          >
            <span className="block truncate font-medium text-ink">{title}</span>
            <span className="num block truncate text-[13px] text-ink-muted">
              {formatKm(trip.distanceKm)} · {formatDuration(trip.durationMin)}
              {stops > 0 && ` · ${pluralize(stops, "stop", "stops")}`} · {formatRelative(trip.savedAt)}
            </span>
          </button>
        )}
      </div>
      <RowIconButton
        label={trip.starred ? `Unstar ${title}` : `Star ${title}`}
        pressed={trip.starred}
        onClick={() => onToggleStar(trip.id)}
      >
        {trip.starred ? (
          <TbStarFilled aria-hidden className="size-4 text-free-line" />
        ) : (
          <TbStar aria-hidden className="size-4" />
        )}
      </RowIconButton>
      <RowIconButton label={`Rename ${title}`} onClick={() => setRenaming(true)}>
        <TbPencil aria-hidden className="size-4" />
      </RowIconButton>
      <RowIconButton label={`Delete ${title}`} onClick={() => onRemove(trip.id)}>
        <TbTrash aria-hidden className="size-4" />
      </RowIconButton>
    </li>
  );
}

function Group({ heading, trips, ...handlers }) {
  if (trips.length === 0) return null;
  return (
    <section>
      <h3 className="px-2 pb-1 text-[13px] font-medium text-ink-muted">{heading}</h3>
      <ul>
        {trips.map((t) => (
          <TripRow key={t.id} trip={t} {...handlers} />
        ))}
      </ul>
    </section>
  );
}

// Saved (starred) and recent trips. Opens from the top bar.
function HistoryPanel({ trips, onLoad, onToggleStar, onRename, onRemove }) {
  const handlers = { onLoad, onToggleStar, onRename, onRemove };
  const starred = trips.filter((t) => t.starred);
  const recent = trips.filter((t) => !t.starred);

  return (
    <div className="flex flex-col gap-3">
      <div className="px-2">
        <p className="font-semibold text-ink">Your trips</p>
        <p className="text-[13px] text-ink-muted">
          The last 8 trips you looked up stay here. Star one to keep it.
        </p>
      </div>
      {trips.length === 0 ? (
        <p className="mx-2 rounded-plate border border-dashed border-line-strong px-3 py-4 text-center text-[13px] text-ink-muted">
          No trips yet. Find a route and it shows up here.
        </p>
      ) : (
        <div className="-mx-1 flex max-h-[min(60vh,420px)] flex-col gap-3 overflow-y-auto px-1">
          <Group heading="Starred" trips={starred} {...handlers} />
          <Group heading="Recent" trips={recent} {...handlers} />
        </div>
      )}
    </div>
  );
}

export default HistoryPanel;
