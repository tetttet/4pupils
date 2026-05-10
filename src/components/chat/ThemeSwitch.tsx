import type { ThemeMode, ThemeTransitionOrigin } from "./chat-types";
import { MoonIcon, SunIcon } from "./icons";

type ThemeSwitchProps = {
  onToggle: (origin: ThemeTransitionOrigin) => void;
  theme: ThemeMode;
};

export function ThemeSwitch({ onToggle, theme }: ThemeSwitchProps) {
  const isDark = theme === "dark";

  return (
    <button
      aria-label={isDark ? "Включить светлую тему" : "Включить темную тему"}
      aria-pressed={isDark}
      className="group relative inline-flex h-11 w-[84px] shrink-0 items-center rounded-full border border-[var(--switch-border)] bg-[var(--switch-bg)] p-[3px] text-[var(--muted)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_10px_24px_rgba(15,23,42,0.08)] transition-[background-color,border-color,box-shadow,transform,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:text-[var(--text)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_14px_28px_rgba(15,23,42,0.12)] active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-[var(--focus-ring)]"
      onClick={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();

        onToggle({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });
      }}
      type="button"
    >
      <span
        aria-hidden="true"
        className={`absolute left-[3px] top-[3px] z-10 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--switch-knob)] shadow-[0_10px_24px_rgba(15,23,42,0.14),inset_0_1px_0_rgba(255,255,255,0.6)] transition-[transform,background-color,box-shadow] duration-[380ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isDark ? "translate-x-[40px]" : "translate-x-0"
        }`}
      >
        <span className="relative h-4 w-4">
          <span
            className={`absolute inset-0 flex items-center justify-center text-[var(--switch-active-icon)] transition-[opacity,transform,color] duration-[340ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isDark
                ? "scale-75 -rotate-45 opacity-0"
                : "scale-100 rotate-0 opacity-100"
            }`}
          >
            <SunIcon />
          </span>
          <span
            className={`absolute inset-0 flex items-center justify-center text-[var(--switch-active-icon)] transition-[opacity,transform,color] duration-[340ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isDark
                ? "scale-100 rotate-0 opacity-100"
                : "scale-75 rotate-45 opacity-0"
            }`}
          >
            <MoonIcon />
          </span>
        </span>
      </span>
      <span
        aria-hidden="true"
        className={`absolute left-3 top-1/2 -translate-y-1/2 transition-[color,opacity,transform] duration-[340ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isDark
            ? "scale-90 opacity-45 text-[var(--switch-inactive-icon)]"
            : "scale-100 opacity-100 text-[var(--switch-active-icon)]"
        }`}
      >
        <SunIcon />
      </span>
      <span
        aria-hidden="true"
        className={`absolute right-3 top-1/2 -translate-y-1/2 transition-[color,opacity,transform] duration-[340ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isDark
            ? "scale-100 opacity-100 text-[var(--switch-active-icon)]"
            : "scale-90 opacity-45 text-[var(--switch-inactive-icon)]"
        }`}
      >
        <MoonIcon />
      </span>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-[3px] rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0.14),transparent_58%)] opacity-80 transition-opacity duration-300 group-hover:opacity-100"
      />
      <span className="sr-only">
        {isDark ? "Темная тема включена" : "Светлая тема включена"}
      </span>
    </button>
  );
}
