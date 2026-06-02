import Link from "next/link";
import { CountdownTimer } from "@/components/Countdown";
import { LocalTime } from "@/components/LocalTime";
import { Hero3D } from "@/components/three/Hero3D";
import { AnimatedHeading } from "@/components/motion/AnimatedHeading";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/Reveal";
import { TiltCard } from "@/components/motion/TiltCard";
import { Podium, type PodiumEntry } from "@/components/Podium";
import { CountUp } from "@/components/motion/CountUp";
import { UpdateBadge } from "@/components/UpdateBadge";
import {
  getSeasonSchedule,
  getDriverStandings,
  getConstructorStandings,
  getLastRaceResults,
  normalizeRace,
  findNextRace,
} from "@/lib/jolpica";

export const revalidate = 1800;

export default async function HomePage() {
  const [schedule, drivers, constructors, lastRace] = await Promise.all([
    getSeasonSchedule().catch(() => []),
    getDriverStandings().catch(() => []),
    getConstructorStandings().catch(() => []),
    getLastRaceResults().catch(() => null),
  ]);

  const races = schedule.map(normalizeRace);
  const next = findNextRace(races);
  const leader = drivers[0];
  const topTeam = constructors[0];

  const lastPodium: PodiumEntry[] = (lastRace?.Results ?? [])
    .slice(0, 3)
    .map((r) => ({
      position: Number(r.position),
      name: `${r.Driver.givenName} ${r.Driver.familyName}`,
      team: r.Constructor.name,
      detail: r.Time?.time ?? r.status,
    }));

  const now = new Date();
  const totalRounds = races.length;
  const roundsDone = races.filter(
    (r) => r.raceStartUtc && new Date(r.raceStartUtc) < now,
  ).length;
  const leaderPts = Number(leader?.points ?? 0);
  const leadMargin = leaderPts - Number(drivers[1]?.points ?? 0);
  const stats = [
    { label: "Round", value: roundsDone, suffix: `/${totalRounds}` },
    { label: "Races left", value: Math.max(0, totalRounds - roundsDone) },
    { label: "Leader points", value: leaderPts },
    { label: "Lead margin", value: leadMargin, suffix: " pts" },
  ];

  return (
    <div className="space-y-16">
      {/* Hero with 3D speed scene backdrop */}
      <section className="relative -mx-4 -mt-8 flex min-h-[88vh] flex-col justify-end overflow-hidden border-b border-apex-border px-4 pb-12 sm:px-8">
        <Hero3D />
        {/* legibility gradient over the canvas (keeps text readable, lets scene show up top) */}
        <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-apex-bg from-15% via-apex-bg/30 via-55% to-transparent" />
        <div className="apex-lines pointer-events-none absolute inset-0 z-[1] opacity-40" />

        <div className="relative z-10 mx-auto w-full max-w-6xl">
          <div className="mb-4 flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-apex-accent opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-apex-accent" />
            </span>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-apex-muted">
              Next Grand Prix
            </p>
          </div>

          {next ? (
            <>
              <AnimatedHeading
                text={next.name}
                className="max-w-4xl text-4xl font-black leading-[0.95] tracking-tight gradient-text sm:text-7xl"
              />
              <Reveal delay={0.2}>
                <p className="mt-4 text-lg text-white/80">
                  {next.circuitName} · {next.locality}, {next.country}
                </p>
                <p className="mt-1 text-sm text-apex-muted">
                  Lights out:{" "}
                  <LocalTime
                    utcIso={next.raceStartUtc}
                    pattern="EEEE d MMM yyyy, HH:mm"
                    showZone
                  />
                </p>
              </Reveal>

              <Reveal delay={0.35} className="mt-8">
                <CountdownTimer targetUtc={next.raceStartUtc} />
              </Reveal>

              <Reveal delay={0.5} className="mt-9 flex flex-wrap gap-4">
                <MagneticButton href="/calendar" variant="solid">
                  Full calendar →
                </MagneticButton>
                <MagneticButton href="/standings" variant="ghost">
                  Standings
                </MagneticButton>
              </Reveal>
            </>
          ) : (
            <h1 className="text-3xl font-bold">
              Schedule unavailable right now — please try again shortly.
            </h1>
          )}
        </div>
      </section>

      {/* Season stat strip */}
      <section className="mx-auto w-full max-w-6xl">
        <StaggerGroup
          className="grid grid-cols-2 gap-3 sm:grid-cols-4"
          stagger={0.07}
        >
          {stats.map((s) => (
            <StaggerItem key={s.label}>
              <div className="relative overflow-hidden rounded-2xl border border-apex-border glass p-5">
                <span className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-apex-accent to-apex-accent2" />
                <p className="text-3xl font-black sm:text-4xl">
                  <span className="gradient-text">
                    <CountUp value={s.value} suffix={s.suffix ?? ""} />
                  </span>
                </p>
                <p className="mt-1 text-xs uppercase tracking-widest text-apex-muted">
                  {s.label}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
        <div className="mt-4 flex justify-center sm:justify-start">
          <UpdateBadge>
            Near-live · auto-updates on a schedule, not real-time during races
          </UpdateBadge>
        </div>
      </section>

      {/* Championship snapshot */}
      <section className="mx-auto w-full max-w-6xl">
        <Reveal>
          <h2 className="mb-6 text-2xl font-black sm:text-3xl">
            Championship pulse
          </h2>
        </Reveal>
        <StaggerGroup className="grid gap-5 sm:grid-cols-2">
          <StaggerItem className="group">
            <SnapshotCard
              label="Drivers' Championship leader"
              title={
                leader
                  ? `${leader.Driver.givenName} ${leader.Driver.familyName}`
                  : "—"
              }
              subtitle={leader?.Constructors.at(-1)?.name ?? ""}
              points={leader?.points}
              href="/standings"
            />
          </StaggerItem>
          <StaggerItem className="group">
            <SnapshotCard
              label="Constructors' Championship leader"
              title={topTeam?.Constructor.name ?? "—"}
              subtitle={topTeam ? `${topTeam.wins} wins` : ""}
              points={topTeam?.points}
              href="/standings"
            />
          </StaggerItem>
        </StaggerGroup>
      </section>

      {/* Last race podium */}
      {lastPodium.length === 3 && (
        <section className="mx-auto w-full max-w-6xl">
          <Reveal>
            <div className="mb-6 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-black sm:text-3xl">
                  Last time out
                </h2>
                <p className="text-sm text-apex-muted">
                  {lastRace?.raceName}
                </p>
              </div>
              {lastRace && (
                <Link
                  href={`/race/${lastRace.round}`}
                  className="text-sm font-semibold text-apex-accent transition hover:underline"
                >
                  Full results →
                </Link>
              )}
            </div>
          </Reveal>
          <Reveal direction="scale">
            <div className="rounded-2xl border border-apex-border bg-apex-panel/50 p-6 sm:p-8">
              <Podium entries={lastPodium} />
            </div>
          </Reveal>
        </section>
      )}
    </div>
  );
}

function SnapshotCard({
  label,
  title,
  subtitle,
  points,
  href,
}: {
  label: string;
  title: string;
  subtitle?: string;
  points?: string;
  href: string;
}) {
  return (
    <TiltCard className="h-full">
      <Link
        href={href}
        className="relative block h-full overflow-hidden rounded-2xl border border-apex-border glass p-6 transition-colors hover:border-apex-accent/60"
      >
        <span className="scanline absolute inset-x-0 top-0 h-px" />
        <p className="text-xs uppercase tracking-widest text-apex-muted">
          {label}
        </p>
        <div className="mt-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-2xl font-bold leading-tight sm:text-3xl">
              {title}
            </p>
            {subtitle && <p className="text-sm text-apex-muted">{subtitle}</p>}
          </div>
          {points != null && (
            <p className="font-mono text-4xl font-black text-apex-accent sm:text-5xl">
              {points}
            </p>
          )}
        </div>
      </Link>
    </TiltCard>
  );
}
