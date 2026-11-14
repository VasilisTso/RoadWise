import React, { useEffect, useRef, useState } from "react";
import { TbPencil, TbStar, TbStarFilled, TbTrash } from "react-icons/tb";
import { tripTitle } from "../hooks/useTripHistory";
import { useI18n, useT } from "../i18n/context";

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
  const t = useT();
  const [value, setValue] = useState(trip.name || tripTitle(trip, t));
  const ref = useRef(null);
  useEffect(() => {
    ref.current?.focus();
    ref.current?.select();
  }, []);
  return (
    <input
      ref={ref}
      aria-label={t("history.tripName")}
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
  const { t, fmt } = useI18n();
  const [renaming, setRenaming] = useState(false);
  const title = tripTitle(trip, t);
  const stops = trip.waypoints.length - 2;

  return (
    <li className="flex items-center gap-1 border-t border-line py-1 first:border-t-0">
      <div className="min-w-0 flex-1">
        {renaming ? (
          <RenameField
            trip={trip}
            onDone={(name) => {
              setRenaming(false);
              if (name != null) onRename(trip.id, name === tripTitle({ ...trip, name: "" }, t) ? "" : name);
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
              {fmt.km(trip.distanceKm)} · {fmt.duration(trip.durationMin)}
              {stops > 0 && ` · ${t("results.stops", { n: stops })}`} · {fmt.relative(trip.savedAt)}
            </span>
          </button>
        )}
      </div>
      <RowIconButton
        label={t(trip.starred ? "history.unstar" : "history.star", { title })}
        pressed={trip.starred}
        onClick={() => onToggleStar(trip.id)}
      >
        {trip.starred ? (
          <TbStarFilled aria-hidden className="size-4 text-free-line" />
        ) : (
          <TbStar aria-hidden className="size-4" />
        )}
      </RowIconButton>
      <RowIconButton label={t("history.rename", { title })} onClick={() => setRenaming(true)}>
        <TbPencil aria-hidden className="size-4" />
      </RowIconButton>
      <RowIconButton label={t("history.remove", { title })} onClick={() => onRemove(trip.id)}>
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
  const t = useT();
  const handlers = { onLoad, onToggleStar, onRename, onRemove };
  const starred = trips.filter((t) => t.starred);
  const recent = trips.filter((t) => !t.starred);

  return (
    <div className="flex flex-col gap-3">
      <div className="px-2">
        <p className="font-semibold text-ink">{t("history.title")}</p>
        <p className="text-[13px] text-ink-muted">{t("history.intro")}</p>
      </div>
      {trips.length === 0 ? (
        <p className="mx-2 rounded-plate border border-dashed border-line-strong px-3 py-4 text-center text-[13px] text-ink-muted">
          {t("history.empty")}
        </p>
      ) : (
        <div className="-mx-1 flex max-h-[min(60vh,420px)] flex-col gap-3 overflow-y-auto px-1">
          <Group heading={t("history.starred")} trips={starred} {...handlers} />
          <Group heading={t("history.recent")} trips={recent} {...handlers} />
        </div>
      )}
    </div>
  );
}

export default HistoryPanel;
