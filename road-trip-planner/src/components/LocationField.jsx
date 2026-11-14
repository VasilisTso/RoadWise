import React, { useState } from "react";
import { TbMapPin } from "react-icons/tb";
import { useAutocomplete } from "../hooks/useAutocomplete";
import { useT } from "../i18n/context";

/**
 * Place input with autocomplete (WAI-ARIA combobox, list autocomplete).
 * ↑/↓ move through suggestions, Enter picks, Escape closes.
 */
function LocationField({
  id,
  label,
  placeholder,
  value,
  onTextChange,
  onSelect,
  onSubmit,
  marker,
  action = null,
}) {
  const t = useT();
  const { suggestions, search, clear } = useAutocomplete();
  const [activeIndex, setActiveIndex] = useState(-1);
  const open = suggestions.length > 0;
  const listboxId = `${id}-listbox`;
  const optionId = (i) => `${id}-option-${i}`;

  const close = () => {
    setActiveIndex(-1);
    clear();
  };

  const pick = (s) => {
    onSelect(s);
    close();
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown" && open) {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp" && open) {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      if (open && activeIndex >= 0) {
        e.preventDefault();
        pick(suggestions[activeIndex]);
      } else {
        close();
        onSubmit?.();
      }
    } else if (e.key === "Escape" && open) {
      e.preventDefault();
      close();
    }
  };

  return (
    <div className="relative">
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="field-label">
          {label}
        </label>
        {action}
      </div>

      <div className="relative">
        <span
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
        >
          {marker}
        </span>
        <input
          id={id}
          type="text"
          autoComplete="off"
          spellCheck={false}
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-activedescendant={open && activeIndex >= 0 ? optionId(activeIndex) : undefined}
          className="field-input pl-10"
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onTextChange(e.target.value);
            setActiveIndex(-1);
            search(e.target.value);
          }}
          onKeyDown={onKeyDown}
          onBlur={close}
        />
      </div>

      {open && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label={t("waypoints.suggestions", { label })}
          className="popover-in absolute inset-x-0 top-full z-50 mt-1 max-h-64 overflow-auto rounded-plate border border-line bg-surface-raised p-1 shadow-sheet"
        >
          {suggestions.map((s, i) => {
            const active = i === activeIndex;
            return (
              <li
                key={`${s.label}-${i}`}
                id={optionId(i)}
                role="option"
                aria-selected={active}
                // onMouseDown fires before the input's blur, so the pick isn't lost
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(s);
                }}
                onMouseEnter={() => setActiveIndex(i)}
                className={`flex cursor-pointer items-center gap-2.5 rounded-[4px] px-2.5 py-2 text-sm ${
                  active ? "bg-surface-sunken text-ink" : "text-ink-muted"
                }`}
              >
                <TbMapPin aria-hidden className="size-4 shrink-0 text-ink-subtle" />
                <span className="truncate">{s.label}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default LocationField;
