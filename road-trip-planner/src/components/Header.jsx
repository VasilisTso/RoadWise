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
import { useI18n, useT } from "../i18n/context";

const THEME_ICON = { system: TbDeviceDesktop, light: TbSun, dark: TbMoon };

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
  const t = useT();
  const { open, panelId, rootRef, triggerProps } = usePopover();

  return (
    <div ref={rootRef} className="relative">
      <IconButton label={t("header.about.label")} {...triggerProps}>
        <TbInfoCircle aria-hidden className="size-5" />
      </IconButton>

      {open && (
        <div
          id={panelId}
          role="region"
          aria-label={t("header.about.label")}
          className="popover-in absolute right-0 top-full z-[1000] mt-2 w-[min(320px,calc(100vw-24px))] rounded-plate border border-line bg-surface-raised p-4 text-sm shadow-sheet"
        >
          <p className="font-semibold text-ink">RoadWise</p>
          <p className="mt-1 text-ink-muted">{t("header.about.body")}</p>
          <p className="mt-3 text-ink-muted">{t("header.about.caveat")}</p>
          <p className="mt-3 text-xs text-ink-subtle">{t("header.about.credits")}</p>
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
              aria-label={t("header.about.email")}
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
  const t = useT();
  const { open, setOpen, panelId, rootRef, triggerProps } = usePopover();

  return (
    <div ref={rootRef} className="relative">
      <IconButton label={t("header.yourTrips")} {...triggerProps}>
        <TbHistory aria-hidden className="size-5" />
      </IconButton>

      {open && (
        <div
          id={panelId}
          role="region"
          aria-label={t("header.yourTrips")}
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

// EN ⇄ EL. Shows the language it switches to, named in that language.
function LanguageToggle() {
  const { t, lang, toggleLang } = useI18n();
  const target = lang === "el" ? "en" : "el";
  return (
    <button
      type="button"
      onClick={toggleLang}
      lang={target}
      aria-label={t("header.language.switchTo")}
      title={t("header.language.switchTo")}
      className="grid h-9 min-w-9 place-items-center rounded-plate px-1.5 text-[13px] font-semibold text-ink-muted transition-colors duration-150 hover:bg-surface-sunken hover:text-ink"
    >
      {t("header.language.short")}
    </button>
  );
}

// Slim top bar: logo, trips, language, theme, about.
function Header({ themeMode, onCycleTheme, history, onLoadTrip }) {
  const t = useT();
  const mode = THEME_ICON[themeMode] ? themeMode : "system";
  const ThemeIcon = THEME_ICON[mode];

  return (
    <header className="relative z-[600] flex h-[52px] shrink-0 items-center justify-between border-b border-line bg-surface px-3 sm:px-4">
      <a href="/" aria-label={t("header.home")} className="flex items-center gap-2 rounded-plate text-ink no-underline">
        <img src="/distance.png" alt="" width="24" height="24" className="brand-mark size-6" />
        <span className="text-[17px] font-semibold tracking-[-0.01em]">RoadWise</span>
      </a>

      <div className="flex items-center gap-0.5">
        <HistoryMenu history={history} onLoadTrip={onLoadTrip} />
        <LanguageToggle />
        <IconButton
          label={t("header.theme.change", { current: t(`header.theme.${mode}`) })}
          onClick={onCycleTheme}
        >
          <ThemeIcon aria-hidden className="size-5" />
        </IconButton>
        <AboutMenu />
      </div>
    </header>
  );
}

export default Header;
