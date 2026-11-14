import { useEffect, useId, useRef, useState } from "react";

// Disclosure popover: closes on outside pointer or Escape (focus returns to the trigger).
export function usePopover() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const rootRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const triggerProps = {
    ref: buttonRef,
    "aria-expanded": open,
    "aria-controls": panelId,
    onClick: () => setOpen((o) => !o),
  };

  return { open, setOpen, panelId, rootRef, triggerProps };
}
