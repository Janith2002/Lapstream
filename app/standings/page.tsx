import {
  DriverStandingsTable,
  ConstructorStandingsTable,
} from "@/components/StandingsTable";
import { Reveal } from "@/components/motion/Reveal";
import { getDriverStandings, getConstructorStandings } from "@/lib/jolpica";

export const revalidate = 1800;

export const metadata = {
  title: "Standings",
  description:
    "Live drivers' and constructors' championship standings, updated automatically after every round, with points, wins and team colours.",
  alternates: { canonical: "/standings" },
};

export default async function StandingsPage() {
  const [drivers, constructors] = await Promise.all([
    getDriverStandings().catch(() => []),
    getConstructorStandings().catch(() => []),
  ]);

  return (
    <div className="space-y-12">
      <Reveal>
        <header>
          <h1 className="text-3xl font-black sm:text-4xl">
            Championship Standings
          </h1>
          <p className="mt-2 text-apex-muted">
            Updates automatically after each round.
          </p>
        </header>
      </Reveal>

      <Reveal direction="up">
        <section>
          <h2 className="mb-4 text-xl font-bold">Drivers</h2>
          {drivers.length ? (
            <DriverStandingsTable rows={drivers} />
          ) : (
            <p className="text-apex-muted">Standings unavailable right now.</p>
          )}
        </section>
      </Reveal>

      <Reveal direction="up">
        <section>
          <h2 className="mb-4 text-xl font-bold">Constructors</h2>
          {constructors.length ? (
            <ConstructorStandingsTable rows={constructors} />
          ) : (
            <p className="text-apex-muted">Standings unavailable right now.</p>
          )}
        </section>
      </Reveal>
    </div>
  );
}
