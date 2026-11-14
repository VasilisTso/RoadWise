import React, { useId } from "react";
import { useRovingRadio } from "../../hooks/useRovingRadio";

/**
 * Accessible single-choice control (role="radiogroup").
 * options: [{ value, label, icon? }]
 */
function SegmentedControl({ label, options, value, onChange, className = "" }) {
  const labelId = useId();
  const itemProps = useRovingRadio(
    options.map((o) => o.value),
    value,
    onChange
  );

  return (
    <div className={className}>
      <div id={labelId} className="field-label">
        {label}
      </div>
      <div
        role="radiogroup"
        aria-labelledby={labelId}
        className="grid auto-cols-fr grid-flow-col gap-1 rounded-plate bg-surface-sunken p-1"
      >
        {options.map((o, i) => {
          const Icon = o.icon;
          const selected = o.value === value;
          return (
            <button
              key={o.value}
              {...itemProps(o.value, i)}
              className={`flex min-h-9 items-center justify-center gap-2 whitespace-nowrap rounded-[4px] px-2 text-sm font-medium transition-[background-color,color,box-shadow] duration-150 ${
                selected
                  ? "bg-surface-raised text-ink shadow-[0_1px_2px_rgb(var(--rw-shadow)/0.14)]"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              {Icon && <Icon aria-hidden className="size-[18px] shrink-0" />}
              <span>{o.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default SegmentedControl;
