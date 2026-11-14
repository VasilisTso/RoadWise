import React, { useId, useRef } from "react";

/**
 * Accessible tabs (WAI-ARIA tabs pattern, automatic activation).
 * tabs: [{ id, label, count? }]
 */
function Tabs({ tabs, value, onChange, label, children }) {
  const baseId = useId();
  const refs = useRef([]);

  const onKeyDown = (e) => {
    const i = tabs.findIndex((t) => t.id === value);
    let next = null;
    if (e.key === "ArrowRight") next = (i + 1) % tabs.length;
    else if (e.key === "ArrowLeft") next = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = tabs.length - 1;
    if (next === null) return;
    e.preventDefault();
    onChange(tabs[next].id);
    refs.current[next]?.focus();
  };

  return (
    <div>
      <div role="tablist" aria-label={label} className="flex gap-5 border-b border-line">
        {tabs.map((t, i) => {
          const selected = t.id === value;
          return (
            <button
              key={t.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              id={`${baseId}-tab-${t.id}`}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${t.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(t.id)}
              onKeyDown={onKeyDown}
              className={`-mb-px flex min-h-10 items-center gap-1.5 border-b-2 text-sm font-medium transition-colors duration-150 ${
                selected
                  ? "border-ink text-ink"
                  : "border-transparent text-ink-muted hover:text-ink"
              }`}
            >
              {t.label}
              {t.count != null && (
                <span className="num rounded-full bg-surface-sunken px-1.5 text-xs leading-5 text-ink-muted">
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        id={`${baseId}-panel-${value}`}
        aria-labelledby={`${baseId}-tab-${value}`}
        tabIndex={0}
        className="pt-4 focus-visible:outline-offset-4"
      >
        {children}
      </div>
    </div>
  );
}

export default Tabs;
