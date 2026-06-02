// Timezone-aware formatting helpers. All stored times are UTC ISO strings;
// we convert to the viewer's local zone on the client.

import { formatInTimeZone } from "date-fns-tz";

/** The viewer's IANA timezone, e.g. "Europe/London". Safe on server (falls back to UTC). */
export function localTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

export function formatSession(
  utcIso: string | null,
  tz: string,
  pattern = "EEE d MMM, HH:mm",
): string {
  if (!utcIso) return "TBC";
  try {
    return formatInTimeZone(new Date(utcIso), tz, pattern);
  } catch {
    return "TBC";
  }
}

export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
}

export function countdownTo(utcIso: string | null, now: Date = new Date()): Countdown {
  if (!utcIso) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  const diff = new Date(utcIso).getTime() - now.getTime();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  const seconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(seconds / 86400),
    hours: Math.floor((seconds % 86400) / 3600),
    minutes: Math.floor((seconds % 3600) / 60),
    seconds: seconds % 60,
    done: false,
  };
}
