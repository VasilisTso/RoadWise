import React from "react";
import {
  TbBrandGithub,
  TbHistory,
  TbBrandLinkedin,
  TbDeviceDesktop,
  TbInfoCircle,
  TbMail,
  TbMoon,
  TbSun,
} from "react-icons/tb";
import HistoryPanel from "./HistoryPanel";
import { usePopover } from "../hooks/usePopover";

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
  const { open, panelId, rootRef, triggerProps } = usePopover();

  return (
    <div ref={rootRef} className="relative">
      <IconButton label="About RoadWise" {...triggerProps}>
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

function HistoryMenu({ history, onLoadTrip }) {
  const { open, setOpen, panelId, rootRef, triggerProps } = usePopover();

  return (
    <div ref={rootRef} className="relative">
      <IconButton label="Your trips" {...triggerProps}>
        <TbHistory aria-hidden className="size-5" />
      </IconButton>

      {open && (
        <div
          id={panelId}
          role="region"
          aria-label="Your trips"
          className="popover-in absolute right-0 top-full z-[1000] mt-2 w-[min(360px,calc(100vw-24px))] rounded-plate border border-line bg-surface-raised p-2 pt-3 text-sm shadow-sheet"
        >
          <HistoryPanel
            trips={history.trips}
            onLoad={(trip) => {
              setOpen(false);
              onLoadTrip(trip);
            }}
            onToggleStar={history.toggleStar}
            onRename={history.rename}
            onRemove={history.remove}
          />
        </div>
      )}
    </div>
  );
}

// Slim top bar: logo, trips, theme, about. (Language joins in Phase 4.)
function Header({ themeMode, onCycleTheme, history, onLoadTrip }) {
  const theme = THEME_META[themeMode] ?? THEME_META.system;
  const ThemeIcon = theme.icon;

  return (
    <header className="relative z-[600] flex h-[52px] shrink-0 items-center justify-between border-b border-line bg-surface px-3 sm:px-4">
      <a href="/" className="flex items-center gap-2 rounded-plate text-ink no-underline">
        <img src="/distance.png" alt="" width="24" height="24" className="brand-mark size-6" />
        <span className="text-[17px] font-semibold tracking-[-0.01em]">RoadWise</span>
      </a>

      <div className="flex items-center gap-0.5">
        <HistoryMenu history={history} onLoadTrip={onLoadTrip} />
        <IconButton label={`${theme.label}. Change theme`} onClick={onCycleTheme}>
          <ThemeIcon aria-hidden className="size-5" />
        </IconButton>
        <AboutMenu />
      </div>
    </header>
  );
}

export default Header;
