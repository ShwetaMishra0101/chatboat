import { useState } from "react";
import { THEMES, applyTheme, getTheme } from "../theme.ts";

export default function ThemeSwitcher() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(getTheme());

  function choose(id: string) {
    applyTheme(id);
    setCurrent(id);
    setOpen(false);
  }

  const active = THEMES.find((t) => t.id === current) ?? THEMES[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-sm font-medium text-[var(--text)] shadow-sm transition-colors hover:bg-[var(--input-bg)]"
      >
        <span
          className="h-3.5 w-3.5 rounded-full ring-1 ring-black/10"
          style={{ background: active.accent }}
        />
        {active.label}
        <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" className="opacity-60">
          <path d="M5.5 7.5 10 12l4.5-4.5" stroke="currentColor" strokeWidth="1.6" fill="none" />
        </svg>
      </button>

      {open && (
        <>
          {/* click-away backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] py-1 shadow-xl">
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => choose(t.id)}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-[var(--text)] transition-colors hover:bg-[var(--input-bg)]"
              >
                <span
                  className="flex h-5 w-5 items-center justify-center rounded-full ring-1 ring-black/10"
                  style={{ background: t.bg }}
                >
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: t.accent }} />
                </span>
                <span className={current === t.id ? "font-semibold" : ""}>{t.label}</span>
                {current === t.id && (
                  <span className="ml-auto text-[var(--accent)]">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
