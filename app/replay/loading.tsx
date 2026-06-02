export default function ReplayLoading() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading replay">
      <div>
        <div className="h-9 w-64 animate-pulse rounded-lg bg-apex-panel" />
        <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-apex-panel/70" />
      </div>
      <div className="aspect-video w-full animate-pulse rounded-2xl border border-apex-border bg-apex-panel/50" />
      <div className="flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-7 w-14 animate-pulse rounded-full bg-apex-panel/60"
          />
        ))}
      </div>
    </div>
  );
}
