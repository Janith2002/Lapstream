"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { localTimeZone } from "@/lib/time";

interface TimezoneCtx {
  /** Active IANA timezone. "UTC" until mounted, to match SSR. */
  tz: string;
  /** Pass an IANA zone, or "auto" to follow the browser. */
  setTz: (tz: string) => void;
  isAuto: boolean;
  ready: boolean;
}

const Ctx = createContext<TimezoneCtx>({
  tz: "UTC",
  setTz: () => {},
  isAuto: true,
  ready: false,
});

export const useTimezone = () => useContext(Ctx);

const KEY = "apex-tz";

export function TimezoneProvider({ children }: { children: React.ReactNode }) {
  const [tz, setTzState] = useState<string | null>(null);
  const [isAuto, setIsAuto] = useState(true);

  useEffect(() => {
    const saved =
      typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
    if (saved) {
      setTzState(saved);
      setIsAuto(false);
    } else {
      setTzState(localTimeZone());
      setIsAuto(true);
    }
  }, []);

  const setTz = useCallback((next: string) => {
    if (next === "auto") {
      localStorage.removeItem(KEY);
      setTzState(localTimeZone());
      setIsAuto(true);
    } else {
      localStorage.setItem(KEY, next);
      setTzState(next);
      setIsAuto(false);
    }
  }, []);

  return (
    <Ctx.Provider
      value={{ tz: tz ?? "UTC", setTz, isAuto, ready: tz !== null }}
    >
      {children}
    </Ctx.Provider>
  );
}
