import { RaceCard } from "@/components/RaceCard";
import { GlobeSection } from "@/components/three/GlobeSection";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/Reveal";
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
