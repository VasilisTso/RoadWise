import { useRef } from "react";

// Arrow/Home/End keys move selection inside a radio group (roving tabindex).
export function useRovingRadio(values, value, onChange) {
  const refs = useRef([]);

  const onKeyDown = (e) => {
    const i = values.indexOf(value);
    let next = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (i + 1) % values.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (i - 1 + values.length) % values.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = values.length - 1;
    if (next === null) return;
    e.preventDefault();
    onChange(values[next]);
    refs.current[next]?.focus();
  };

  const itemProps = (v, index) => ({
    ref: (el) => {
      refs.current[index] = el;
    },
    role: "radio",
    type: "button",
    "aria-checked": v === value,
    tabIndex: v === value ? 0 : -1,
    onClick: () => onChange(v),
    onKeyDown,
  });

  return itemProps;
}
