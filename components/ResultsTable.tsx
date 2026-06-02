import type { RaceResult } from "@/lib/types";

export function ResultsTable({ results }: { results: RaceResult[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-apex-border">
      <table className="w-full text-sm">
        <thead className="bg-apex-panel text-left text-xs uppercase tracking-wider text-apex-muted">
          <tr>
            <th className="px-4 py-3 w-12">Pos</th>
            <th className="px-4 py-3">Driver</th>
            <th className="px-4 py-3 hidden sm:table-cell">Team</th>
            <th className="px-4 py-3 text-center hidden md:table-cell">Grid</th>
            <th className="px-4 py-3 text-right">Time / Status</th>
            <th className="px-4 py-3 text-right">Pts</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r) => {
            const gained = Number(r.grid) - Number(r.position);
            return (
              <tr
                key={r.Driver.driverId}
                className="border-t border-apex-border/60"
              >
                <td className="px-4 py-3 font-mono text-apex-muted">
                  {r.positionText}
                </td>
                <td className="px-4 py-3">
                  <span className="font-semibold">
                    {r.Driver.givenName} {r.Driver.familyName}
                  </span>
                  {r.Driver.code && (
                    <span className="ml-2 font-mono text-xs text-apex-muted">
                      {r.Driver.code}
                    </span>
                  )}
                  {r.FastestLap?.rank === "1" && (
                    <span
                      title="Fastest lap"
                      className="ml-2 rounded bg-purple-500/20 px-1.5 py-0.5 text-[10px] font-bold text-purple-300"
                    >
                      FL
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 hidden text-apex-muted sm:table-cell">
                  {r.Constructor.name}
                </td>
                <td className="px-4 py-3 text-center hidden md:table-cell">
                  <span className="text-apex-muted">{r.grid}</span>
                  {gained !== 0 && (
                    <span
                      className={`ml-1 text-xs ${gained > 0 ? "text-green-400" : "text-red-400"}`}
                    >
                      {gained > 0 ? `▲${gained}` : `▼${-gained}`}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right font-mono text-xs">
                  {r.Time?.time ?? r.status}
                </td>
                <td className="px-4 py-3 text-right font-bold tabular-nums">
                  {r.points}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
