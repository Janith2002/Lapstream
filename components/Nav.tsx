"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TimezonePicker } from "./TimezonePicker";

const links = [
  { href: "/", label: "Home" },
  { href: "/calendar", label: "Calendar" },
  { href: "/standings", label: "Standings" },
  { href: "/replay", label: "Replay" },
  { href: "/news", label: "News" },
];

export function Nav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-apex-border bg-apex-bg/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-y-2 px-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 rounded outline-none focus-visible:ring-2 focus-visible:ring-apex-accent"
          aria-label="Lapstream home"
        >
          <span className="inline-block h-3 w-3 rotate-45 bg-apex-accent" />
          <span className="text-lg font-bold tracking-tight">
            Lapstream<span className="text-apex-accent">.</span>
          </span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <ul className="hidden items-center gap-0.5 text-sm sm:flex sm:gap-1">
            {links.map((l) => {
              const active = isActive(l.href);
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    aria-current={active ? "page" : undefined}
                    className={`rounded-md px-2 py-1.5 outline-none transition focus-visible:ring-2 focus-visible:ring-apex-accent sm:px-3 ${
                      active
                        ? "bg-apex-panel font-semibold text-white"
                        : "text-apex-muted hover:bg-apex-panel hover:text-white"
                    }`}
                  >
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <TimezonePicker />
        </div>
      </nav>
    </header>
  );
}
