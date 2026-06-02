import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { UpdateBadge } from "@/components/UpdateBadge";
import { TrackReplay } from "@/components/replay/TrackReplay";
import { getReplay } from "@/lib/replay";

export const revalidate = 86400;

export const metadata = {
  title: "Replay",
  description:
    "Watch a past race start replayed from real car GPS telemetry on an auto-drawn track map — animated, scrubbable and free.",
  alternates: { canonical: "/replay" },
};

export default async function ReplayPage({
  searchParams,
}: {
  searchParams: { session?: string };
}) {
  const requested = searchParams.session
    ? Number(searchParams.session)
    : undefined;
  const data = await getReplay(requested).catch(() => null);

  return (
    <div className="space-y-8">
      <Reveal>
        <header>
          <h1 className="text-3xl font-black sm:text-4xl">Telemetry Replay</h1>
          <p className="mt-2 max-w-2xl text-apex-muted">
            A past race start reconstructed from real car GPS data — the track
            outline is drawn from the telemetry itself. Powered by the free
            historical layer of OpenF1.
          </p>
          <div className="mt-3">
            <UpdateBadge>Past (historical) sessions only · not live</UpdateBadge>
          </div>
        </header>
      </Reveal>

      {data ? (
        <Reveal direction="scale">
          <div>
            <p className="mb-4 text-sm font-semibold text-apex-accent2">
              {data.title}
            </p>
            <TrackReplay data={data} />
          </div>
        </Reveal>
      ) : (
        <div className="rounded-2xl border border-apex-border bg-apex-panel p-10 text-center">
          <p className="text-lg font-semibold">Replay unavailable right now</p>
          <p className="mt-2 text-sm text-apex-muted">
            Telemetry is only available for past sessions (historical data).
            Please try again shortly, or head back to the{" "}
            <Link href="/calendar" className="text-apex-accent underline">
              calendar
            </Link>
            .
          </p>
        </div>
      )}
    </div>
  );
}
