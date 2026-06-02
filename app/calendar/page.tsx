import { RaceCard } from "@/components/RaceCard";
import { GlobeSection } from "@/components/three/GlobeSection";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/Reveal";
import { CountdownTimer } from "@/components/Countdown";
import { LocalTime } from "@/components/LocalTime";
import { getSeasonSchedule, normalizeRace, findNextRace } from "@/lib/jolpica";
import type { GlobePoint } from "@/components/three/CircuitGlobe";

export const revalidate = 3600;

export const metadata = {
  title: "Calendar",
  description:
    "The full season race calendar with every session (practice, qualifying, sprint and race) shown in your local timezone, plus an interactive 3D circuit globe.",
  alternates: { canonical: "/calendar" },
};

export default async function CalendarPage() {
  const schedule = await getSeasonSchedule().catch(() => []);
  const races = schedule.map(normalizeRace);
  const next = findNextRace(races);
  const season = races[0]?.season ?? "";
  const now = new Date();

  const points: GlobePoint[] = races
    .filter((r) => !Number.isNaN(r.lat) && !Number.isNaN(r.long))
    .map((r) => ({
      round: r.round,
      name: r.name,
      locality: r.locality,
      country: r.country,
      lat: r.lat,
      long: r.long,
      isNext: next?.round === r.round,
      isPast:
        r.raceStartUtc != null &&
        new Date(r.raceStartUtc) < now &&
        next?.round !== r.round,
    }));

  // Earliest upcoming session across the whole season (any session type).
  const nextSession = races
    .flatMap((r) =>
      r.sessions.map((s) => ({ ...s, raceName: r.name, round: r.round })),
    )
    .filter((s) => s.startUtc && new Date(s.startUtc) > now)
    .sort(
      (a, b) =>
        new Date(a.startUtc!).getTime() - new Date(b.startUtc!).getTime(),
    )[0];

  return (
    <div className="space-y-10">
      <Reveal>
        <header>
          <h1 className="text-3xl font-black sm:text-4xl">
            {season} Season Calendar
          </h1>
          <p className="mt-2 text-apex-muted">
            All session times shown in <strong>your local timezone</strong>,
            detected automatically.
          </p>
        </header>
      </Reveal>

      {nextSession && (
        <Reveal>
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-apex-border glass p-5 sm:p-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-apex-muted">
                Next session
              </p>
              <p className="mt-1 text-lg font-bold sm:text-xl">
                {nextSession.label}{" "}
                <span className="text-apex-muted">· {nextSession.raceName}</span>
              </p>
              <p className="mt-0.5 text-sm text-apex-muted">
                <LocalTime
                  utcIso={nextSession.startUtc}
                  pattern="EEE d MMM, HH:mm"
                  showZone
                />
              </p>
            </div>
            <CountdownTimer targetUtc={nextSession.startUtc} />
          </div>
        </Reveal>
      )}

      {points.length > 0 && (
        <Reveal direction="scale">
          <GlobeSection points={points} />
        </Reveal>
      )}

      {races.length === 0 ? (
        <p className="text-apex-muted">
          Calendar unavailable right now — please try again shortly.
        </p>
      ) : (
        <StaggerGroup
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          stagger={0.05}
        >
          {races.map((r) => (
            <StaggerItem key={r.round}>
              <RaceCard race={r} isNext={next?.round === r.round} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}
    </div>
  );
}
