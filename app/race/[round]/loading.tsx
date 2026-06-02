export default function RaceLoading() {
  return (
    <div className="space-y-10" aria-busy="true" aria-label="Loading race">
      <div>
        <div className="h-4 w-32 animate-pulse rounded bg-apex-panel/70" />
        <div className="mt-3 h-9 w-3/4 animate-pulse rounded-lg bg-apex-panel" />
        <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-apex-panel/70" />
      </div>
      <div className="h-56 animate-pulse rounded-2xl border border-apex-border bg-apex-panel/50" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-28 animate-pulse rounded-2xl border border-apex-border bg-apex-panel/50" />
        <div className="h-28 animate-pulse rounded-2xl border border-apex-border bg-apex-panel/50" />
      </div>
      <div className="h-80 animate-pulse rounded-xl border border-apex-border bg-apex-panel/40" />
    </div>
  );
}
