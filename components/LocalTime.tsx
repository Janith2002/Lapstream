"use client";

import { formatSession } from "@/lib/time";
import { useTimezone } from "./TimezoneProvider";

/**
 * Renders a UTC time in the active timezone (from TimezoneProvider). Defaults
 * to "UTC" before mount so server and first client paint match (no hydration
 * mismatch), then re-renders to the resolved/selected zone.
 */
export function LocalTime({
  utcIso,
  pattern = "EEE d MMM, HH:mm",
  showZone = false,
}: {
  utcIso: string | null;
  pattern?: string;
  showZone?: boolean;
}) {
  const { tz } = useTimezone();

  if (!utcIso) return <span className="text-apex-muted">TBC</span>;

  return (
    <span suppressHydrationWarning>
      {formatSession(utcIso, tz, pattern)}
      {showZone && (
        <span className="ml-1 text-xs text-apex-muted">
          ({tz.replace(/_/g, " ")})
        </span>
      )}
    </span>
  );
}
