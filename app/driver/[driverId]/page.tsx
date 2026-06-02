import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/Reveal";
import { CountUp } from "@/components/motion/CountUp";
import { flagUrl } from "@/lib/flags";
import {
  getDriverStandings,
  getDriverSeasonResults,
  getConstructorDrivers,
} from "@/lib/jolpica";

export const revalidate = 1800;

export async function generateMetadata({
  params,
}: {
  params: { driverId: string };
}): Promise<Metadata> {
  const standings = await getDriverStandings().catch(() => []);
  const s = standings.find((x) => x.Driver.driverId === params.driverId);
  const name = s
    ? `${s.Driver.givenName} ${s.Driver.familyName}`
    : params.driverId;
  return {
    title: name,
    description: `${name}'s season: championship position, points, wins, podiums, teammate head-to-head and full race-by-race results.`,
    alternates: { canonical: `/driver/${params.driverId}` },
    openGraph: { title: `${name} — Lapstream`, url: `/driver/${params.driverId}` },
  };
}

export default async function DriverPage({
  params,
}: {
  params: { driverId: string };
}) {
  const { driverId } = params;
  const [standings, races] = await Promise.all([
    getDriverStandings().catch(() => []),
    getDriverSeasonResults(driverId).catch(() => []),
  ]);

  const standing = standings.find((s) => s.Driver.driverId === driverId);
  const driver = standing?.Driver ?? races[0]?.Results?.[0]?.Driver;
  const team =
    standing?.Constructors.at(-1) ?? races.at(-1)?.Results?.[0]?.Constructor;

  if (!driver) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-bold">Driver not found</h1>
        <Link href="/standings" className="mt-4 inline-block text-apex-accent underline">
          Back to standings
        </Link>
      </div>
    );
  }

  let teammate = null;
  if (team) {
    const mates = await getConstructorDrivers(team.constructorId).catch(() => []);
    teammate = mates.find((d) => d.driverId !== driverId) ?? null;
  }
  const teammateStanding = teammate
    ? standings.find((s) => s.Driver.driverId === teammate!.driverId)
    : null;

  const finishes = races
    .map((r) => Number(r.Results?.[0]?.position))
    .filter((n) => !Number.isNaN(n));
  const podiums = finishes.filter((p) => p <= 3).length;
  const best = finishes.length ? Math.min(...finishes) : null;
  const flag = flagUrl(driver.nationality, 80);

  const stats = [
    { label: "Championship", value: Number(standing?.position ?? 0), prefix: "P" },
    { label: "Points", value: Number(standing?.points ?? 0) },
    { label: "Wins", value: Number(standing?.wins ?? 0) },
    { label: "Podiums", value: podiums },
  ];

  const myPts = Number(standing?.points ?? 0);
  const matePts = Number(teammateStanding?.points ?? 0);
  const h2hMax = Math.max(myPts, matePts, 1);

  return (
    <div className="space-y-10">
      <Reveal>
        <div>
          <Link
            href="/standings"
            className="text-sm text-apex-muted transition hover:text-white"
          >
            ← Standings
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            {flag && (
              <Image
                src={flag}
                alt={driver.nationality}
                width={52}
                height={39}
                className="rounded border border-apex-border"
              />
            )}
            <div>
              <h1 className="text-3xl font-black sm:text-4xl">
                {driver.givenName} {driver.familyName}
              </h1>
              <p className="mt-1 text-apex-muted">
                {driver.permanentNumber && (
                  <span className="mr-2 font-mono text-apex-accent">
                    #{driver.permanentNumber}
                  </span>
                )}
                {team && (
                  <Link
                    href={`/team/${team.constructorId}`}
                    className="hover:text-white hover:underline"
                  >
                    {team.name}
                  </Link>
                )}
                {" · "}
                {driver.nationality}
              </p>
            </div>
          </div>
        </div>
      </Reveal>

      <StaggerGroup className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <StaggerItem key={s.label}>
            <div className="rounded-2xl border border-apex-border bg-apex-panel p-5">
              <p className="text-3xl font-black sm:text-4xl">
                <span className="gradient-text">
                  <CountUp value={s.value} prefix={s.prefix ?? ""} />
                </span>
              </p>
              <p className="mt-1 text-xs uppercase tracking-widest text-apex-muted">
                {s.label}
              </p>
            </div>
          </StaggerItem>
        ))}
      </StaggerGroup>

      {teammate && teammateStanding && (
        <Reveal direction="scale">
          <section className="rounded-2xl border border-apex-border bg-apex-panel/50 p-6">
            <h2 className="mb-5 text-sm font-semibold uppercase tracking-widest text-apex-muted">
              Teammate head-to-head
            </h2>
            <div className="space-y-4">
              <H2HRow
                name={`${driver.givenName} ${driver.familyName}`}
                pts={myPts}
                max={h2hMax}
                lead={myPts >= matePts}
              />
              <H2HRow
                name={`${teammate.givenName} ${teammate.familyName}`}
                pts={matePts}
                max={h2hMax}
                lead={matePts > myPts}
                href={`/driver/${teammate.driverId}`}
              />
            </div>
          </section>
        </Reveal>
      )}

      {races.length > 0 && (
        <Reveal>
          <section>
            <h2 className="mb-4 text-xl font-bold">
              {races[0].season} results{" "}
              {best && (
                <span className="text-sm font-normal text-apex-muted">
                  · best finish P{best}
                </span>
              )}
            </h2>
            <div className="overflow-hidden rounded-xl border border-apex-border">
              <table className="w-full text-sm">
                <thead className="bg-apex-panel text-left text-xs uppercase tracking-wider text-apex-muted">
                  <tr>
                    <th className="px-4 py-3 w-14">Rnd</th>
                    <th className="px-4 py-3">Grand Prix</th>
                    <th className="px-4 py-3 text-center hidden sm:table-cell">
                      Grid
                    </th>
                    <th className="px-4 py-3 text-center">Finish</th>
                    <th className="px-4 py-3 text-right">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {races.map((r) => {
                    const res = r.Results?.[0];
                    if (!res) return null;
                    return (
                      <tr key={r.round} className="border-t border-apex-border/60">
                        <td className="px-4 py-3 font-mono text-apex-muted">
                          {r.round}
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/race/${r.round}`}
                            className="font-medium hover:text-apex-accent hover:underline"
                          >
                            {r.raceName}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-center hidden text-apex-muted sm:table-cell">
                          {res.grid}
                        </td>
                        <td className="px-4 py-3 text-center font-semibold">
                          {res.positionText}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          {res.points}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </Reveal>
      )}
    </div>
  );
}

function H2HRow({
  name,
  pts,
  max,
  lead,
  href,
}: {
  name: string;
  pts: number;
  max: number;
  lead: boolean;
  href?: string;
}) {
  const label = href ? (
    <Link href={href} className="hover:text-white hover:underline">
      {name}
    </Link>
  ) : (
    name
  );
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className={lead ? "font-bold text-white" : "text-apex-muted"}>
          {label}
        </span>
        <span className="font-mono font-bold tabular-nums">{pts}</span>
      </div>
      <div className="h-2 overflow-hidden rounded bg-apex-bg">
        <div
          className="h-full rounded"
          style={{
            width: `${(pts / max) * 100}%`,
            background: lead ? "#ff2d55" : "#5b5b6b",
          }}
        />
      </div>
    </div>
  );
}
