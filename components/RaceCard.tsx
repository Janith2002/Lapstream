import Link from "next/link";
import { LocalTime } from "./LocalTime";
import type { NormalizedRace } from "@/lib/types";

export function RaceCard({
  race,
  isNext = false,
}: {
  race: NormalizedRace;
  isNext?: boolean;
}) {
  const isPast =
    race.raceStartUtc != null && new Date(race.raceStartUtc) < new Date();

  return (
    <article
      className={`rounded-xl border bg-apex-panel p-5 transition ${
        isNext
          ? "border-apex-accent shadow-[0_0_30px_-10px_rgba(255,45,85,0.6)]"
          : "border-apex-border hover:border-apex-muted/50"
      } ${isPast && !isNext ? "opacity-60" : ""}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="rounded-full bg-apex-bg px-2.5 py-1 text-xs font-semibold text-apex-muted">
          Round {race.round}
        </span>
        <div className="flex items-center gap-2">
          {race.isSprintWeekend && (
            <span className="rounded-full bg-apex-accent2/15 px-2.5 py-1 text-xs font-semibold text-apex-accent2">
              SPRINT
            </span>
          )}
          {isNext && (
            <span className="rounded-full bg-apex-accent px-2.5 py-1 text-xs font-bold text-white">
              NEXT
            </span>
          )}
          {isPast && !isNext && (
            <span className="text-xs font-semibold text-apex-muted">DONE</span>
          )}
        </div>
      </div>

      <h3 className="text-lg font-bold leading-tight">{race.name}</h3>
      <p className="mt-0.5 text-sm text-apex-muted">
        {race.circuitName} · {race.locality}, {race.country}
      </p>

      <ul className="mt-4 space-y-1.5 border-t border-apex-border pt-3 text-sm">
        {race.sessions.map((s) => (
          <li key={s.key} className="flex items-center justify-between gap-3">
            <span className="text-apex-muted">{s.label}</span>
            <span className="font-medium tabular-nums">
              <LocalTime utcIso={s.startUtc} />
            </span>
          </li>
        ))}
      </ul>

      <Link
        href={`/race/${race.round}`}
        className="mt-4 flex items-center justify-between rounded-lg border border-apex-border px-3 py-2 text-sm font-semibold text-apex-muted transition hover:border-apex-accent/60 hover:text-white"
      >
        {isPast ? "Results & race centre" : "Race centre"}
        <span aria-hidden>→</span>
      </Link>
    </article>
  );
}
