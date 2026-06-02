"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Tab = { href: string; label: string; icon: React.ReactNode };

const I = {
  home: (
    <path d="M3 10.5 12 4l9 6.5M5 9.5V20h14V9.5" />
  ),
  calendar: (
    <>
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M3 9h18M8 2v4M16 2v4" />
    </>
  ),
  trophy: (
    <>
      <path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" />
      <path d="M8 5H5v1a3 3 0 0 0 3 3M16 5h3v1a3 3 0 0 1-3 3M10 14h4M9 20h6M12 14v6" />
    </>
  ),
  news: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M7 8h7M7 12h10M7 16h10" />
    </>
  ),
  replay: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M10 9l5 3-5 3z" />
    </>
  ),
};

const tabs: Tab[] = [
  { href: "/", label: "Home", icon: I.home },
  { href: "/calendar", label: "Calendar", icon: I.calendar },
  { href: "/standings", label: "Standings", icon: I.trophy },
  { href: "/replay", label: "Replay", icon: I.replay },
  { href: "/news", label: "News", icon: I.news },
];

export function MobileTabBar() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-apex-border bg-apex-bg/90 backdrop-blur sm:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around">
        {tabs.map((t) => {
          const active = isActive(t.href);
          return (
            <li key={t.href} className="flex-1">
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold outline-none transition ${
                  active ? "text-apex-accent" : "text-apex-muted"
                }`}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  {t.icon}
                </svg>
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
