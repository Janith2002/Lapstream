// Typed client for the Jolpica-F1 API (Ergast-compatible successor).
// Docs: https://github.com/jolpica/jolpica-f1
//
// We rely on Next.js fetch caching (ISR) via the `next: { revalidate }` option
// so the browser never hits Jolpica directly and we stay well inside its
// volunteer-funded rate limits (~4 req/s burst, ~500/hr sustained).

import type {
  Race,
  DriverStanding,
  ConstructorStanding,
  RaceWithResults,
  NormalizedRace,
  NormalizedSession,
} from "./types";

const BASE =
  process.env.NEXT_PUBLIC_JOLPICA_BASE ?? "https://api.jolpi.ca/ergast/f1";

// Revalidate windows (seconds). Calendar rarely changes; standings change per race.
const REVALIDATE_CALENDAR = 60 * 60 * 6; // 6h
const REVALIDATE_STANDINGS = 60 * 30; // 30m
const REVALIDATE_RESULTS = 60 * 10; // 10m

async function jolpica<T>(path: string, revalidate: number): Promise<T> {
  const url = `${BASE}/${path}`;
  // Hard timeout so a slow/rate-limited API never hangs the build or a request;
  // callers fall back to empty data and ISR re-fetches later.
  const res = await fetch(url, {
    next: { revalidate },
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) {
    throw new Error(`Jolpica request failed (${res.status}): ${url}`);
  }
  return (await res.json()) as T;
}

interface MRData<K extends string, V> {
  MRData: Record<K, V> & { total: string };
}

// --- Calendar -------------------------------------------------------------

interface RaceTableResp {
  MRData: { RaceTable: { Races: Race[] }; total: string };
}

export async function getSeasonSchedule(
  season: string | number = "current",
): Promise<Race[]> {
  const data = await jolpica<RaceTableResp>(
    `${season}.json?limit=100`,
    REVALIDATE_CALENDAR,
  );
  return data.MRData.RaceTable.Races ?? [];
}

// --- Standings ------------------------------------------------------------

interface DriverStandingsResp {
  MRData: {
    StandingsTable: {
      StandingsLists: { DriverStandings: DriverStanding[] }[];
    };
  };
}

export async function getDriverStandings(
  season: string | number = "current",
): Promise<DriverStanding[]> {
  const data = await jolpica<DriverStandingsResp>(
    `${season}/driverStandings.json`,
    REVALIDATE_STANDINGS,
  );
  return data.MRData.StandingsTable.StandingsLists[0]?.DriverStandings ?? [];
}

interface ConstructorStandingsResp {
  MRData: {
    StandingsTable: {
      StandingsLists: { ConstructorStandings: ConstructorStanding[] }[];
    };
  };
}

export async function getConstructorStandings(
  season: string | number = "current",
): Promise<ConstructorStanding[]> {
  const data = await jolpica<ConstructorStandingsResp>(
    `${season}/constructorStandings.json`,
    REVALIDATE_STANDINGS,
  );
  return (
    data.MRData.StandingsTable.StandingsLists[0]?.ConstructorStandings ?? []
  );
}

// --- Results --------------------------------------------------------------

interface ResultsResp {
  MRData: { RaceTable: { Races: RaceWithResults[] }; total: string };
}

export async function getLastRaceResults(
  season: string | number = "current",
): Promise<RaceWithResults | null> {
  const data = await jolpica<ResultsResp>(
    `${season}/last/results.json`,
    REVALIDATE_RESULTS,
  );
  return data.MRData.RaceTable.Races[0] ?? null;
}

export async function getRaceResults(
  season: string | number,
  round: string | number,
): Promise<RaceWithResults | null> {
  const data = await jolpica<ResultsResp>(
    `${season}/${round}/results.json`,
    REVALIDATE_RESULTS,
  );
  return data.MRData.RaceTable.Races[0] ?? null;
}

// --- Normalization helpers ------------------------------------------------

function toUtcIso(s?: { date: string; time?: string }): string | null {
  if (!s?.date) return null;
  // Jolpica gives date "2026-03-15" and time "13:00:00Z" (already UTC).
  const time = s.time ?? "00:00:00Z";
  const iso = `${s.date}T${time.endsWith("Z") ? time : time + "Z"}`;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

export function normalizeRace(race: Race): NormalizedRace {
  const sessions: NormalizedSession[] = [];
  const push = (key: string, label: string, st?: { date: string; time?: string }) => {
    if (st?.date) sessions.push({ key, label, startUtc: toUtcIso(st) });
  };

  push("fp1", "Practice 1", race.FirstPractice);
  // Sprint weekends replace FP2/FP3 with Sprint Qualifying + Sprint.
  push("sq", "Sprint Qualifying", race.SprintQualifying);
  push("fp2", "Practice 2", race.SecondPractice);
  push("fp3", "Practice 3", race.ThirdPractice);
  push("sprint", "Sprint", race.Sprint);
  push("quali", "Qualifying", race.Qualifying);
  push("race", "Race", { date: race.date, time: race.time });

  return {
    season: race.season,
    round: Number(race.round),
    name: race.raceName,
    circuitName: race.Circuit.circuitName,
    locality: race.Circuit.Location.locality,
    country: race.Circuit.Location.country,
    lat: Number(race.Circuit.Location.lat),
    long: Number(race.Circuit.Location.long),
    raceStartUtc: toUtcIso({ date: race.date, time: race.time }),
    sessions,
    isSprintWeekend: Boolean(race.Sprint),
  };
}

/** The next race whose race start is in the future (or the last race if season is over). */
export function findNextRace(
  races: NormalizedRace[],
  now: Date = new Date(),
): NormalizedRace | null {
  if (races.length === 0) return null;
  const upcoming = races
    .filter((r) => r.raceStartUtc && new Date(r.raceStartUtc) >= now)
    .sort(
      (a, b) =>
        new Date(a.raceStartUtc!).getTime() - new Date(b.raceStartUtc!).getTime(),
    );
  return upcoming[0] ?? races[races.length - 1];
}

export type { MRData };
