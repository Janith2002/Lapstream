# Lapstream — Motorsport Dashboard

An **unofficial** motorsport data dashboard: season calendar, championship
standings, results and (later) telemetry replay. Built to run at **zero cost**.

> ⚠️ **Not affiliated with Formula 1, the FIA, or any team.** "F1" and
> "Formula 1" are trademarks of their respective owners. Data comes from the
> community projects [Jolpica-F1](https://github.com/jolpica/jolpica-f1) and
> [OpenF1](https://openf1.org), which are themselves unofficial. This project
> hosts no race footage; any video is embedded from official YouTube channels.

## Stack (all free tiers)

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS |
| 2D animation | Framer Motion (reveals, magnetic buttons, tilt, page transitions) |
| 3D | three.js + React Three Fiber + drei (hero speed scene, circuit globe) |
| Structured data | Jolpica-F1 (`api.jolpi.ca`) — schedule, standings, results |
| Telemetry | OpenF1 (`api.openf1.org`) — free historical layer |
| Hosting | Netlify (Next.js runtime) |
| Dates/TZ | date-fns + date-fns-tz |

No database is required for Phase 1 — pages are server-rendered and cached with
Next.js **ISR** (`export const revalidate`), and the `fetch` layer caches each
API call (`next: { revalidate }`), so the browser never hits the upstream APIs
directly and we stay well inside their rate limits.

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run typecheck  # tsc --noEmit
```

Copy `.env.example` to `.env.local` if you want to override API base URLs
(defaults are baked in, so this is optional).

## Project structure

```
app/
  layout.tsx           # shell: nav + footer disclaimer
  page.tsx             # home: next-race hero + countdown + standings snapshot
  calendar/page.tsx    # full season, timezone-aware session times + globe
  standings/page.tsx   # driver + constructor championship tables
  race/[round]/page.tsx# Race Centre: podium, pole, fastest lap, full results (ISR)
components/
  Countdown.tsx        # client: live ticking countdown (mount-guarded)
  LocalTime.tsx        # client: UTC -> viewer's local timezone
  RaceCard.tsx         # calendar event card
  StandingsTable.tsx   # driver/constructor tables with animated bars
  Nav.tsx, Disclaimer.tsx
  motion/              # Framer Motion primitives
    Reveal.tsx         #   scroll-reveal + stagger groups
    AnimatedHeading.tsx#   word-by-word heading rise
    MagneticButton.tsx #   cursor-magnet button
    TiltCard.tsx       #   3D tilt + glare on hover
    AnimatedBar.tsx    #   fill-from-zero progress bar
  three/               # React Three Fiber 3D (all client-only, ssr:false)
    F1Car.tsx          #   procedural ORIGINAL open-wheel car (no trademarks)
    SpeedScene.tsx     #   hero: car + round-sprite particle tunnel + ribbons
    Hero3D.tsx         #   dynamic loader, device-quality + reduced-motion gate
    CircuitGlobe.tsx   #   globe w/ real coastlines + circuit pins
    GlobeSection.tsx   #   dynamic loader for the globe
lib/
  useReducedMotion.ts  # gates heavy motion on prefers-reduced-motion
public/data/
  land.json            # Natural Earth 110m coastlines (public domain) for the globe
lib/
  jolpica.ts           # typed Jolpica client + normalization helpers
  openf1.ts            # OpenF1 client (free historical layer, 30-min guard)
  time.ts              # timezone + countdown helpers
  types.ts             # shared types
```

## Data notes / free-tier rules

- **Jolpica**: volunteer-funded (~$45/mo hosting). Respect rate limits
  (~4 req/s burst). Our ISR caching keeps usage tiny.
- **OpenF1**: data is "live" (paid) from 30 min before a session to 30 min
  after. Outside that window it's **historical and free**. `lib/openf1.ts`
  exposes an `isHistorical()` guard so we never query the paid window.

## Deploying to Netlify (free)

1. Push this repo to GitHub.
2. In Netlify: **Add new site → Import from Git**, pick the repo.
3. Netlify auto-detects Next.js and installs `@netlify/plugin-nextjs`
   (also pinned in `netlify.toml`). Build command `npm run build`.
4. Deploy. ISR + server rendering work on the free tier.

## Roadmap

- **Phase 1 (done):** calendar, standings, next-race countdown, timezone
  handling, brand + disclaimer, 3D hero (realistic car) + circuit globe,
  Race Centre result pages, last-race podium.
- **Phase 2:** lap-by-lap charts, driver/team profiles,
  news RSS aggregation, YouTube video grid, optional Supabase + GitHub Actions
  cron to pre-cache data.
- **Phase 3:** OpenF1 telemetry, canvas track-map replay of past races,
  weather/tyre data.
- **Phase 4 (optional, paid):** OpenF1 live tier for true real-time, push
  notifications. Everything before this is free forever.
```
