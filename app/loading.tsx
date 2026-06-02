export default function Loading() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading">
      <div className="h-10 w-2/3 animate-pulse rounded-lg bg-apex-panel" />
      <div className="h-4 w-1/2 animate-pulse rounded bg-apex-panel/70" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-48 animate-pulse rounded-xl border border-apex-border bg-apex-panel/60"
          />
        ))}
      </div>
    </div>
  );
}
