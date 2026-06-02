"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTimezone } from "./TimezoneProvider";

const FALLBACK = [
  "UTC",
  "Europe/London",
  "Europe/Paris",
  "Europe/Rome",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Colombo",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
  "America/Sao_Paulo",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
];

function GlobeIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
      className={className}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18" />
    </svg>
  );
}

export function TimezonePicker() {
  const { tz, setTz, isAuto } = useTimezone();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const zones = useMemo(() => {
    try {
      const all = (Intl as any).supportedValuesOf?.("timeZone") as
        | string[]
        | undefined;
      return all && all.length ? all : FALLBACK;
    } catch {
      return FALLBACK;
    }
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return zones;
    return zones.filter((z) => z.toLowerCase().includes(q)).slice(0, 200);
  }, [zones, query]);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node))
        setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 20);
    else setQuery("");
  }, [open]);

  const short = tz.split("/").pop()?.replace(/_/g, " ") ?? tz;

  const choose = (value: string) => {
    setTz(value);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Change display timezone"
        className="flex items-center gap-1.5 rounded-md border border-apex-border bg-apex-panel px-2.5 py-1.5 text-xs text-white outline-none transition hover:border-apex-muted/60 focus:border-apex-accent"
      >
        <GlobeIcon className="shrink-0 text-apex-accent2" />
        <span className="max-w-[7rem] truncate sm:max-w-[9rem]">
          {isAuto ? `Auto · ${short}` : short}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          aria-hidden
          className={`shrink-0 text-apex-muted transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 z-[70] mt-2 w-64 overflow-hidden rounded-xl border border-apex-border bg-apex-panel/95 shadow-2xl backdrop-blur-xl"
        >
          <div className="border-b border-apex-border p-2">
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search timezone…"
              className="w-full rounded-md border border-apex-border bg-apex-bg px-2.5 py-1.5 text-xs text-white outline-none placeholder:text-apex-muted focus:border-apex-accent"
            />
          </div>

          <ul className="max-h-72 overflow-y-auto py-1 text-sm">
            <li>
              <button
                type="button"
                onClick={() => choose("auto")}
                className={`flex w-full items-center justify-between px-3 py-2 text-left transition hover:bg-apex-bg ${isAuto ? "text-apex-accent" : "text-white"}`}
              >
                <span>Auto · {short}</span>
                {isAuto && <Check />}
              </button>
            </li>
            <li className="px-3 py-1 text-[10px] uppercase tracking-widest text-apex-muted">
              {query ? `${filtered.length} matches` : "All timezones"}
            </li>
            {filtered.map((z) => {
              const selected = !isAuto && z === tz;
              return (
                <li key={z}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => choose(z)}
                    className={`flex w-full items-center justify-between px-3 py-2 text-left transition hover:bg-apex-bg ${selected ? "text-apex-accent" : "text-apex-muted hover:text-white"}`}
                  >
                    <span className="truncate">{z.replace(/_/g, " ")}</span>
                    {selected && <Check />}
                  </button>
                </li>
              );
            })}
            {filtered.length === 0 && (
              <li className="px-3 py-3 text-center text-xs text-apex-muted">
                No timezones match “{query}”.
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

function Check() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      aria-hidden
      className="shrink-0"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}
