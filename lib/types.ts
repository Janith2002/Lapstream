// Shared types for the Jolpica (Ergast-compatible) and OpenF1 APIs.

export interface Location {
  lat: string;
  long: string;
  locality: string;
  country: string;
}

export interface Circuit {
  circuitId: string;
  url: string;
  circuitName: string;
  Location: Location;
}

/** A date/time pair as returned by Jolpica (time is UTC, e.g. "13:00:00Z"). */
export interface SessionTime {
  date: string;
  time?: string;
}

export interface Race {
  season: string;
  round: string;
  url: string;
  raceName: string;
  Circuit: Circuit;
  date: string;
  time?: string;
  FirstPractice?: SessionTime;
  SecondPractice?: SessionTime;
  ThirdPractice?: SessionTime;
  Qualifying?: SessionTime;
  Sprint?: SessionTime;
  SprintQualifying?: SessionTime;
}

export interface Driver {
  driverId: string;
  permanentNumber?: string;
  code?: string;
  url: string;
  givenName: string;
  familyName: string;
  dateOfBirth: string;
  nationality: string;
}

export interface Constructor {
  constructorId: string;
  url: string;
  name: string;
  nationality: string;
}

export interface DriverStanding {
  position: string;
  positionText: string;
  points: string;
  wins: string;
  Driver: Driver;
  Constructors: Constructor[];
}

export interface ConstructorStanding {
  position: string;
  positionText: string;
  points: string;
  wins: string;
  Constructor: Constructor;
}

export interface RaceResult {
  number: string;
  position: string;
  positionText: string;
  points: string;
  Driver: Driver;
  Constructor: Constructor;
  grid: string;
  laps: string;
  status: string;
  Time?: { millis?: string; time: string };
  FastestLap?: {
    rank: string;
    lap: string;
    Time: { time: string };
    AverageSpeed?: { units: string; speed: string };
  };
}

export interface RaceWithResults extends Race {
  Results: RaceResult[];
}

/** A single session, normalized for the calendar/countdown UI. */
export interface NormalizedSession {
  key: string;
  label: string;
  /** ISO UTC datetime, or null if only a date is known. */
  startUtc: string | null;
}

export interface NormalizedRace {
  season: string;
  round: number;
  name: string;
  circuitName: string;
  locality: string;
  country: string;
  lat: number;
  long: number;
  /** ISO UTC datetime of the race itself. */
  raceStartUtc: string | null;
  sessions: NormalizedSession[];
  isSprintWeekend: boolean;
}
