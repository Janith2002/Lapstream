export function Disclaimer() {
  return (
    <footer className="border-t border-apex-border bg-apex-panel/40">
      <div className="mx-auto max-w-6xl px-4 py-6 text-xs leading-relaxed text-apex-muted">
        <p>
          <strong className="text-apex-muted">Lapstream</strong> is an independent,
          unofficial project. It is <strong>not affiliated with, endorsed by, or
          associated with</strong> Formula 1, Formula One Licensing BV, the FIA,
          or any team. &quot;F1&quot; and &quot;Formula 1&quot; are trademarks of
          their respective owners.
        </p>
        <p className="mt-2">
          Data is sourced from the community projects{" "}
          <a
            className="underline hover:text-white"
            href="https://github.com/jolpica/jolpica-f1"
            target="_blank"
            rel="noreferrer"
          >
            Jolpica-F1
          </a>{" "}
          and{" "}
          <a
            className="underline hover:text-white"
            href="https://openf1.org"
            target="_blank"
            rel="noreferrer"
          >
            OpenF1
          </a>
          , which are themselves unofficial. Please respect their rate limits.
        </p>
        <div className="mt-4 rounded-lg border border-apex-border bg-apex-bg/50 p-3">
          <p className="font-semibold text-white/80">⏱️ About updates</p>
          <p className="mt-1">
            Data refreshes <strong>automatically</strong> on a schedule — news
            and standings about every 30 minutes, race results within ~10
            minutes of the chequered flag, and the calendar hourly. Countdowns
            and your local times update live in your browser. This is{" "}
            <strong>&ldquo;near-live&rdquo;</strong>: figures appear shortly
            after the source publishes them — it is <strong>not</strong>{" "}
            second-by-second live timing during a race. Telemetry replays cover
            past (historical) sessions only.
          </p>
        </div>
      </div>
    </footer>
  );
}
