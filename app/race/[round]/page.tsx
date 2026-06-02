import type { Metadata } from "next";
import Link from "next/link";
import { Podium, type PodiumEntry } from "@/components/Podium";
import { ResultsTable } from "@/components/ResultsTable";
import { LocalTime } from "@/components/LocalTime";
import { Reveal } from "@/components/motion/Reveal";
import { getRaceResults, getSeasonSchedule, normalizeRace } from "@/lib/jolpica";

export const revalidate = 600;

export async function generateMetadata({
  params,
}: {
  params: { round: string };
}): Promise<Metadata> {
  const schedule = await getSeasonSchedule().catch(() => []);
  const meta = schedule
    .map(normalizeRace)
    .find((r) => r.round === Number(params.round));
  const name = meta?.name ?? `Round ${params.round}`;
  const where = meta ? ` at ${meta.circuitName}, ${meta.locality}` : "";
  return {
    title: name,
    description: `${name}${where}: podium, pole position, fastest lap and the full classification. Times shown in your local timezone.`,
    alternates: { canonical: `/race/${params.round}` },
    openGraph: { title: `${name} — Lapstream`, url: `/race/${params.round}` },
  };
}

export default async function RacePage({
  params,
}: {
  params: { round: string };
}) {
  const round = params.round;
  const [race, schedule] = await Promise.all([
    getRaceResults("current", round).catch(() => null),
    getSeasonSchedule().catch(() => []),
  ]);

  const meta = schedule.map(normalizeRace).find((r) => r.round === Number(round));
  const results = race?.Results ?? [];
  const pole = results.find((r) => r.grid === "1");
  const fl = results.find((r) => r.FastestLap?.rank === "1");

  const podium: PodiumEntry[] = results.slice(0, 3).map((r) => ({
    position: Number(r.position),
    name: `${r.Driver.givenName} ${r.Driver.familyName}`,
    team: r.Constructor.name,
    detail: r.Time?.time ?? r.status,
  }));

  const jsonLd = meta
    ? {
        "@context": "https://schema.org",
        "@type": "SportsEvent",
        name: race?.raceName ?? meta.name,
        sport: "Motorsport",
        startDate: meta.raceStartUtc ?? undefined,
        eventStatus: "https://schema.org/EventScheduled",
        location: {
          "@type": "Place",
          name: meta.circuitName,
          address: `${meta.locality}, ${meta.country}`,
        },
      }
    : null;

  return (
    <div className="space-y-10">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <Reveal>
        <div>
          <Link
            href="/calendar"
            className="text-sm text-apex-muted transition hover:text-white"
          >
            ← Back to calendar
          </Link>
          <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="rounded-full bg-apex-panel px-2.5 py-1 text-xs font-semibold text-apex-muted">
              Round {round}
            </span>
            <h1 className="text-3xl font-black sm:text-4xl">
              {race?.raceName ?? meta?.name ?? "Grand Prix"}
            </h1>
          </div>
          <p className="mt-2 text-apex-muted">
            {race?.Circuit.circuitName ?? meta?.circuitName}
            {meta && ` · ${meta.locality}, ${meta.country}`}
          </p>
          {meta?.raceStartUtc && (
            <p className="mt-1 text-sm text-apex-muted">
              <LocalTime utcIso={meta.raceStartUtc} pattern="EEEE d MMM yyyy, HH:mm" showZone />
            </p>
          )}
        </div>
      </Reveal>

      {results.length === 0 ? (
        <div className="rounded-2xl border border-apex-border bg-apex-panel p-10 text-center">
          <p className="text-lg font-semibold">Results not in yet</p>
          <p className="mt-2 text-sm text-apex-muted">
            Classified results appear here within ~30 minutes of the chequered
            flag. Check the{" "}
            <Link href="/calendar" className="text-apex-accent underline">
              calendar
            </Link>{" "}
            for session times.
          </p>
        </div>
      ) : (
        <>
          <Reveal direction="scale">
            <section className="rounded-2xl border border-apex-border bg-apex-panel/50 p-6">
              <h2 className="mb-6 text-center text-sm font-semibold uppercase tracking-widest text-apex-muted">
                Podium
              </h2>
              <Podium entries={podium} />
            </section>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2">
            <Reveal direction="left">
              <StatCard
                label="Pole position"
                value={
                  pole
                    ? `${pole.Driver.givenName} ${pole.Driver.familyName}`
                    : "—"
                }
                sub={pole?.Constructor.name ?? ""}
                accent="#00e5ff"
              />
            </Reveal>
            <Reveal direction="right">
              <StatCard
                label="Fastest lap"
                value={
                  fl ? `${fl.Driver.givenName} ${fl.Driver.familyName}` : "—"
                }
                sub={fl?.FastestLap?.Time.time ?? ""}
                accent="#b07bff"
              />
            </Reveal>
          </div>

          <Reveal>
            <section>
              <h2 className="mb-4 text-xl font-bold">Full classification</h2>
              <ResultsTable results={results} />
            </section>
          </Reveal>
        </>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-apex-border bg-apex-panel p-6">
      <p className="text-xs uppercase tracking-widest text-apex-muted">
        {label}
      </p>
      <p className="mt-3 text-2xl font-bold" style={{ color: accent }}>
        {value}
      </p>
      {sub && <p className="text-sm text-apex-muted">{sub}</p>}
    </div>
  );
}
