// Minimal client for the OpenF1 API (free historical layer).
// Docs: https://openf1.org
//
// IMPORTANT (free-tier rules): data is "live" from 30 min before a session to
// 30 min after it ends and requires a paid plan. Outside that window it is
// historical and free. So we only query sessions that ended > 30 min ago.
// Free limits: 3 req/s, 30 req/min — use ISR caching and avoid client polling.

const BASE = process.env.NEXT_PUBLIC_OPENF1_BASE ?? "https://api.openf1.org/v1";

const REVALIDATE = 60 * 30; // 30m — historical data is immutable once settled.

async function openf1<T>(path: string, revalidate = REVALIDATE): Promise<T> {
  const url = `${BASE}/${path}`;
  const res = await fetch(url, {
    next: { revalidate },
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) {
    throw new Error(`OpenF1 request failed (${res.status}): ${url}`);
  }
  return (await res.json()) as T;
}

export interface OpenF1Session {
  session_key: number;
  meeting_key: number;
  session_name: string;
  session_type: string;
  date_start: string;
  date_end: string;
  year: number;
  circuit_short_name: string;
  country_name: string;
}

export interface OpenF1Driver {
  driver_number: number;
  full_name: string;
  name_acronym: string;
  team_name: string;
  team_colour: string;
  headshot_url?: string;
}

/** GPS location sample for the track-map replay (Phase 3). */
export interface OpenF1Location {
  driver_number: number;
  date: string;
  x: number;
  y: number;
  z: number;
}

export async function getSessions(
  params: Record<string, string | number> = {},
): Promise<OpenF1Session[]> {
  const qs = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)]),
  ).toString();
  return openf1<OpenF1Session[]>(`sessions${qs ? `?${qs}` : ""}`);
}

export async function getDriversForSession(
  sessionKey: number,
): Promise<OpenF1Driver[]> {
  return openf1<OpenF1Driver[]>(`drivers?session_key=${sessionKey}`);
}

/** Guard: returns true only if the session ended more than 30 min ago (free tier safe). */
export function isHistorical(session: OpenF1Session, now: Date = new Date()): boolean {
  const end = new Date(session.date_end).getTime();
  return now.getTime() - end > 30 * 60 * 1000;
}
