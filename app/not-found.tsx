import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="font-mono text-7xl font-black text-apex-accent">404</p>
      <h1 className="mt-4 text-2xl font-bold">Off the track</h1>
      <p className="mt-2 max-w-md text-apex-muted">
        That page took a wrong turn into the gravel. Let&apos;s get you back on
        the racing line.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-lg bg-apex-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Back to home
        </Link>
        <Link
          href="/calendar"
          className="rounded-lg border border-apex-border px-5 py-2.5 text-sm font-semibold transition hover:bg-apex-panel"
        >
          View calendar
        </Link>
      </div>
    </div>
  );
}
