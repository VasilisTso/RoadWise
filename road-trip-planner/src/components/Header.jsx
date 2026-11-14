import React, { useEffect, useId, useRef, useState } from "react";
import {
  TbBrandGithub,
  TbBrandLinkedin,
  TbDeviceDesktop,
  TbInfoCircle,
  TbMail,
  TbMoon,
  TbSun,
} from "react-icons/tb";

const THEME_META = {
  system: { icon: TbDeviceDesktop, label: "Theme: match system" },
  light: { icon: TbSun, label: "Theme: light" },
  dark: { icon: TbMoon, label: "Theme: dark" },
};

function IconButton({ label, children, ...props }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className="grid size-9 place-items-center rounded-plate text-ink-muted transition-colors duration-150 hover:bg-surface-sunken hover:text-ink aria-expanded:bg-surface-sunken aria-expanded:text-ink"
      {...props}
    >
      {children}
    </button>
  );
}

function AboutMenu() {
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

  return (
    <div ref={rootRef} className="relative">
      <IconButton
        ref={buttonRef}
        label="About RoadWise"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
      >
        <TbInfoCircle aria-hidden className="size-5" />
      </IconButton>

      {open && (
        <div
          id={panelId}
          role="region"
          aria-label="About RoadWise"
          className="popover-in absolute right-0 top-full z-[1000] mt-2 w-[min(320px,calc(100vw-24px))] rounded-plate border border-line bg-surface-raised p-4 text-sm shadow-sheet"
        >
          <p className="font-semibold text-ink">RoadWise</p>
          <p className="mt-1 text-ink-muted">
            Plans a drive on Greek motorways and lists every toll booth on the way with its
            price, plus the fuel cost, next to the toll-free route.
          </p>
          <p className="mt-3 text-ink-muted">
            Toll prices are published rates, entered by hand. They can change, so check before
            you travel.
          </p>
          <p className="mt-3 text-xs text-ink-subtle">
            Routes by OpenRouteService. Map by Stadia Maps, OpenMapTiles and OpenStreetMap
            contributors.
          </p>
          <div className="mt-3 flex items-center gap-1 border-t border-line pt-3">
            <a
              href="https://github.com/VasilisTso"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="grid size-9 place-items-center rounded-plate text-ink-muted hover:bg-surface-sunken hover:text-ink"
            >
              <TbBrandGithub aria-hidden className="size-5" />
            </a>
            <a
              href="https://www.linkedin.com/in/vasilis-tsomakas-dev/"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="grid size-9 place-items-center rounded-plate text-ink-muted hover:bg-surface-sunken hover:text-ink"
            >
              <TbBrandLinkedin aria-hidden className="size-5" />
            </a>
            <a
              href="mailto:vtsomakas@gmail.com"
              aria-label="Email"
              className="grid size-9 place-items-center rounded-plate text-ink-muted hover:bg-surface-sunken hover:text-ink"
            >
              <TbMail aria-hidden className="size-5" />
            </a>
            <span className="num ml-auto text-xs text-ink-subtle">© {new Date().getFullYear()}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Slim top bar: logo, theme, about. (Language and history join in later phases.)
function Header({ themeMode, onCycleTheme }) {
  const theme = THEME_META[themeMode] ?? THEME_META.system;
  const ThemeIcon = theme.icon;

  return (
    <header className="relative z-[600] flex h-[52px] shrink-0 items-center justify-between border-b border-line bg-surface px-3 sm:px-4">
      <a href="/" className="flex items-center gap-2 rounded-plate text-ink no-underline">
        <img src="/distance.png" alt="" width="24" height="24" className="brand-mark size-6" />
        <span className="text-[17px] font-semibold tracking-[-0.01em]">RoadWise</span>
      </a>

      <div className="flex items-center gap-0.5">
        <IconButton label={`${theme.label}. Change theme`} onClick={onCycleTheme}>
          <ThemeIcon aria-hidden className="size-5" />
        </IconButton>
        <AboutMenu />
      </div>
    </header>
  );
}

export default Header;
