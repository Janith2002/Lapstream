import type { DriverStanding, ConstructorStanding } from "@/lib/types";
import { AnimatedBar } from "@/components/motion/AnimatedBar";

function teamColor(name: string): string {
  // Lightweight, brand-neutral accents keyed off the constructor name.
  const map: Record<string, string> = {
    Ferrari: "#e8002d",
    McLaren: "#ff8000",
    Mercedes: "#27f4d2",
    "Red Bull": "#3671c6",
    Williams: "#64c4ff",
    Alpine: "#0093cc",
    Aston: "#229971",
    Haas: "#b6babd",
    Sauber: "#52e252",
    "RB F1": "#6692ff",
  };
  const hit = Object.keys(map).find((k) => name.includes(k));
  return hit ? map[hit] : "#8b8b9e";
}

export function DriverStandingsTable({ rows }: { rows: DriverStanding[] }) {
  const max = Number(rows[0]?.points ?? 1) || 1;
  return (
    <div className="overflow-hidden rounded-xl border border-apex-border">
      <table className="w-full text-sm">
        <thead className="bg-apex-panel text-left text-xs uppercase tracking-wider text-apex-muted">
          <tr>
            <th className="px-4 py-3 w-12">#</th>
            <th className="px-4 py-3">Driver</th>
            <th className="px-4 py-3 hidden sm:table-cell">Team</th>
            <th className="px-4 py-3 text-right">Wins</th>
            <th className="px-4 py-3 text-right">Pts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const team = r.Constructors[r.Constructors.length - 1]?.name ?? "";
            const color = teamColor(team);
            return (
              <tr
                key={r.Driver.driverId}
                className="border-t border-apex-border/60"
              >
                <td className="px-4 py-3 font-mono text-apex-muted">
                  {r.position}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-4 w-1 rounded"
                      style={{ background: color }}
                    />
                    <span className="font-semibold">
                      {r.Driver.givenName} {r.Driver.familyName}
                    </span>
                    {r.Driver.code && (
                      <span className="font-mono text-xs text-apex-muted">
                        {r.Driver.code}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 hidden text-apex-muted sm:table-cell">
                  {team}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{r.wins}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="hidden sm:block">
                      <AnimatedBar
                        pct={(Number(r.points) / max) * 100}
                        color={color}
                      />
                    </div>
                    <span className="font-bold tabular-nums">{r.points}</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function ConstructorStandingsTable({
  rows,
}: {
  rows: ConstructorStanding[];
}) {
  const max = Number(rows[0]?.points ?? 1) || 1;
  return (
    <div className="overflow-hidden rounded-xl border border-apex-border">
      <table className="w-full text-sm">
        <thead className="bg-apex-panel text-left text-xs uppercase tracking-wider text-apex-muted">
          <tr>
            <th className="px-4 py-3 w-12">#</th>
            <th className="px-4 py-3">Team</th>
            <th className="px-4 py-3 text-right">Wins</th>
            <th className="px-4 py-3 text-right">Pts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const color = teamColor(r.Constructor.name);
            return (
              <tr
                key={r.Constructor.constructorId}
                className="border-t border-apex-border/60"
              >
                <td className="px-4 py-3 font-mono text-apex-muted">
                  {r.position}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-4 w-1 rounded"
                      style={{ background: color }}
                    />
                    <span className="font-semibold">{r.Constructor.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{r.wins}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="hidden sm:block">
                      <AnimatedBar
                        pct={(Number(r.points) / max) * 100}
                        color={color}
                      />
                    </div>
                    <span className="font-bold tabular-nums">{r.points}</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
