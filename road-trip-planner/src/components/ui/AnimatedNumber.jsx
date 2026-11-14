import React, { useLayoutEffect, useRef } from "react";
import { animate, useReducedMotion } from "framer-motion";

// Number that tweens to its new value when settings change (instant with reduced motion).
function AnimatedNumber({ value, format, className = "" }) {
  const ref = useRef(null);
  const shown = useRef(value);
  const reduce = useReducedMotion();

  // Layout effect: overwrite React's final text with the start value before paint
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const from = shown.current;
    if (reduce || from === value) {
      shown.current = value;
      el.textContent = format(value);
      return;
    }
    el.textContent = format(from);
    const controls = animate(from, value, {
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        shown.current = v;
        el.textContent = format(v);
      },
    });
    return () => controls.stop();
  }, [value, format, reduce]);

  // Render the final value so SSR/no-JS and screen readers get the real number
  return (
    <span ref={ref} className={`num ${className}`}>
      {format(value)}
    </span>
  );
}

export default AnimatedNumber;
