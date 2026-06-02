import {
  getRaceSessions,
  getDriversForSession,
  getLocations,
  isHistorical,
  type OpenF1Session,
} from "./openf1";

const WINDOW_SECONDS = 90; // start + ~first lap; bounded => free-tier safe

export interface ReplayDriver {
  num: number;
  code: string;
  name: string;
  color: string;
}

export interface ReplayData {
  sessionKey: number;
  title: string;
  drivers: ReplayDriver[];
  /** driver_number -> samples [tMs, x, y] in a 0..~1000 plane. */
  frames: Record<number, number[][]>;
  /** track outline polyline [x, y]. */
  track: number[][];
  width: number;
  height: number;
  duration: number;
  sessions: { key: number; label: string }[];
}

const FALLBACK_COLORS = [
  "#ff2d55", "#00e5ff", "#ffd54a", "#52e252", "#b07bff",
  "#ff8000", "#27f4d2", "#3671c6", "#e8002d", "#64c4ff",
];

function sessionTitle(s: OpenF1Session): string {
  return `${s.circuit_short_name} · ${s.country_name} ${s.year}`;
}

/** Pick a year's historical race sessions, falling back to previous years. */
async function findRaceSessions(): Promise<OpenF1Session[]> {
  const now = new Date();
  for (let y = now.getFullYear(); y >= now.getFullYear() - 2; y--) {
    const list = (await getRaceSessions(y).catch(() => [])).filter((s) =>
      isHistorical(s, now),
    );
    if (list.length) return list;
  }
  return [];
}

export async function getReplay(
  requestedKey?: number,
): Promise<ReplayData | null> {
  const raceSessions = await findRaceSessions();
  if (raceSessions.length === 0) return null;

  const session =
    raceSessions.find((s) => s.session_key === requestedKey) ?? raceSessions[0];

  const startMs = new Date(session.date_start).getTime();
  const startISO = new Date(startMs).toISOString();
  const endISO = new Date(startMs + WINDOW_SECONDS * 1000).toISOString();

  const [drivers, locations] = await Promise.all([
    getDriversForSession(session.session_key).catch(() => []),
    getLocations(session.session_key, startISO, endISO).catch(() => []),
  ]);

  if (locations.length === 0) return null;

  // Choose the two highest-variance axes as the map plane (handles whichever
  // axes OpenF1 uses for ground vs elevation).
  const keys = ["x", "y", "z"] as const;
  const min: Record<string, number> = { x: Infinity, y: Infinity, z: Infinity };
  const max: Record<string, number> = {
    x: -Infinity,
    y: -Infinity,
    z: -Infinity,
  };
  for (const p of locations) {
    for (const k of keys) {
      const v = p[k];
      if (v < min[k]) min[k] = v;
      if (v > max[k]) max[k] = v;
    }
  }
  const ranges = keys.map((k) => ({ k, r: max[k] - min[k] }));
  ranges.sort((a, b) => b.r - a.r);
  const A = ranges[0].k;
  const B = ranges[1].k;
  const scale = 1000 / Math.max(ranges[0].r || 1, 1);
  const width = Math.round((max[A] - min[A]) * scale);
  const height = Math.round((max[B] - min[B]) * scale);
  const toXY = (p: Record<string, number>): [number, number] => [
    Math.round((p[A] - min[A]) * scale),
    Math.round((p[B] - min[B]) * scale),
  ];

  // Group samples per driver.
  const frames: Record<number, number[][]> = {};
  let duration = 0;
  for (const p of locations) {
    const t = new Date(p.date).getTime() - startMs;
    if (t < 0) continue;
    const [x, y] = toXY(p as unknown as Record<string, number>);
    (frames[p.driver_number] ??= []).push([t, x, y]);
    if (t > duration) duration = t;
  }
  for (const num of Object.keys(frames))
    frames[Number(num)].sort((a, b) => a[0] - b[0]);

  // Track outline = the path of the driver with the most samples.
  let bestNum = -1;
  let bestLen = 0;
  for (const [num, arr] of Object.entries(frames)) {
    if (arr.length > bestLen) {
      bestLen = arr.length;
      bestNum = Number(num);
    }
  }
  const track = (frames[bestNum] ?? []).map(([, x, y]) => [x, y]);

  // Driver metadata (only those with frames).
  const driverMeta: ReplayDriver[] = Object.keys(frames)
    .map(Number)
    .map((num, i) => {
      const d = drivers.find((x) => x.driver_number === num);
      const colour = d?.team_colour ? `#${d.team_colour}` : null;
      return {
        num,
        code: d?.name_acronym ?? String(num),
        name: d?.full_name ?? `Car ${num}`,
        color: colour ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length],
      };
    })
    .sort((a, b) => a.num - b.num);

  return {
    sessionKey: session.session_key,
    title: sessionTitle(session),
    drivers: driverMeta,
    frames,
    track,
    width: width || 1000,
    height: height || 600,
    duration,
    sessions: raceSessions.slice(0, 24).map((s) => ({
      key: s.session_key,
      label: `${s.circuit_short_name}`,
    })),
  };
}
