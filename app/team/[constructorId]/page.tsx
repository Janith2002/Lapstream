import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/Reveal";
import { CountUp } from "@/components/motion/CountUp";
import { flagUrl } from "@/lib/flags";
import {
  getConstructorStandings,
  getConstructorDrivers,
  getConstructorSeasonResults,
  getDriverStandings,
} from "@/lib/jolpica";

export const revalidate = 1800;

export async function generateMetadata({
  params,
}: {
  params: { constructorId: string };
}): Promise<Metadata> {
  const standings = await getConstructorStandings().catch(() => []);
  const s = standings.find(
    (x) => x.Constructor.constructorId === params.constructorId,
  );
  const name = s?.Constructor.name ?? params.constructorId;
  return {
    title: name,
    description: `${name}: championship position, points, wins, drivers and full season results.`,
    alternates: { canonical: `/team/${params.constructorId}` },
    openGraph: {
      title: `${name} — Lapstream`,
      url: `/team/${params.constructorId}`,
    },
  };
}

export default async function TeamPage({
  params,
}: {
  params: { constructorId: string };
}) {
  const { constructorId } = params;
  const [cStandings, drivers, races, dStandings] = await Promise.all([
    getConstructorStandings().catch(() => []),
    getConstructorDrivers(constructorId).catch(() => []),
    getConstructorSeasonResults(constructorId).catch(() => []),
    getDriverStandings().catch(() => []),
  ]);

  const standing = cStandings.find(
    (s) => s.Constructor.constructorId === constructorId,
  );
  const team = standing?.Constructor ?? races[0]?.Results?.[0]?.Constructor;

  if (!team) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-bold">Team not found</h1>
        <Link href="/standings" className="mt-4 inline-block text-apex-accent underline">
          Back to standings
        </Link>
      </div>
    );
  }

  const flag = flagUrl(team.nationality, 80);
  const stats = [
    { label: "Championship", value: Number(standing?.position ?? 0), prefix: "P" },
    { label: "Points", value: Number(standing?.points ?? 0) },
    { label: "Wins", value: Number(standing?.wins ?? 0) },
    { label: "Drivers", value: drivers.length },
  ];

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
                alt={team.nationality}
                width={52}
                height={39}
                className="rounded border border-apex-border"
              />
            )}
            <div>
              <h1 className="text-3xl font-black sm:text-4xl">{team.name}</h1>
              <p className="mt-1 text-apex-muted">{team.nationality}</p>
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

      {drivers.length > 0 && (
        <Reveal>
          <section>
            <h2 className="mb-4 text-xl font-bold">Drivers</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {drivers.map((d) => {
                const ds = dStandings.find(
                  (x) => x.Driver.driverId === d.driverId,
                );
                const dflag = flagUrl(d.nationality, 40);
                return (
                  <Link
                    key={d.driverId}
                    href={`/driver/${d.driverId}`}
                    className="flex items-center justify-between rounded-2xl border border-apex-border bg-apex-panel p-5 transition hover:border-apex-accent/60"
                  >
                    <div className="flex items-center gap-3">
                      {dflag && (
                        <Image
                          src={dflag}
                          alt={d.nationality}
                          width={28}
                          height={21}
                          className="rounded-sm border border-apex-border"
                        />
                      )}
                      <div>
                        <p className="font-bold">
                          {d.givenName} {d.familyName}
                        </p>
                        <p className="text-xs text-apex-muted">
                          {d.permanentNumber && `#${d.permanentNumber} · `}
                          {ds ? `P${ds.position}` : "—"}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono text-2xl font-black text-apex-accent">
                      {ds?.points ?? "0"}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        </Reveal>
      )}

      {races.length > 0 && (
        <Reveal>
          <section>
            <h2 className="mb-4 text-xl font-bold">{races[0].season} results</h2>
            <div className="overflow-hidden rounded-xl border border-apex-border">
              <table className="w-full text-sm">
                <thead className="bg-apex-panel text-left text-xs uppercase tracking-wider text-apex-muted">
                  <tr>
                    <th className="px-4 py-3 w-14">Rnd</th>
                    <th className="px-4 py-3">Grand Prix</th>
                    <th className="px-4 py-3 text-center">Best</th>
                    <th className="px-4 py-3 text-right">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {races.map((r) => {
                    const res = r.Results ?? [];
                    const positions = res
                      .map((x) => Number(x.position))
                      .filter((n) => !Number.isNaN(n));
                    const best = positions.length ? Math.min(...positions) : null;
                    const pts = res.reduce(
                      (sum, x) => sum + Number(x.points || 0),
                      0,
                    );
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
                        <td className="px-4 py-3 text-center font-semibold">
                          {best ? `P${best}` : "—"}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          {pts}
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
