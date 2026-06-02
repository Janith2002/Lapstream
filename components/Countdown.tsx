"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { countdownTo, type Countdown } from "@/lib/time";

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <motion.span
        key={value}
        initial={{ y: -8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="font-mono text-3xl font-bold tabular-nums sm:text-5xl"
      >
        {String(value).padStart(2, "0")}
      </motion.span>
      <span className="mt-1 text-[10px] uppercase tracking-widest text-apex-muted sm:text-xs">
        {label}
      </span>
    </div>
  );
}

export function CountdownTimer({ targetUtc }: { targetUtc: string | null }) {
  // Start null so server render and first client paint match (no time-based
  // markup), then compute + tick after mount to avoid hydration mismatch.
  const [cd, setCd] = useState<Countdown | null>(null);

  useEffect(() => {
    setCd(countdownTo(targetUtc));
    const id = setInterval(() => setCd(countdownTo(targetUtc)), 1000);
    return () => clearInterval(id);
  }, [targetUtc]);

  if (!cd) {
    return (
      <div className="flex items-end gap-4 sm:gap-6" aria-hidden>
        {["Days", "Hrs", "Min", "Sec"].map((label, i) => (
          <div key={label} className="flex items-center gap-4 sm:gap-6">
            <Unit value={0} label={label} />
            {i < 3 && (
              <span className="pb-6 text-2xl text-apex-border sm:text-4xl">
                :
              </span>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (cd.done) {
    return (
      <span className="animate-pulseGlow font-mono text-2xl font-bold text-apex-accent">
        LIGHTS OUT
      </span>
    );
  }

  return (
    <div className="flex items-end gap-4 sm:gap-6">
      <Unit value={cd.days} label="Days" />
      <span className="pb-6 text-2xl text-apex-border sm:text-4xl">:</span>
      <Unit value={cd.hours} label="Hrs" />
      <span className="pb-6 text-2xl text-apex-border sm:text-4xl">:</span>
      <Unit value={cd.minutes} label="Min" />
      <span className="pb-6 text-2xl text-apex-border sm:text-4xl">:</span>
      <Unit value={cd.seconds} label="Sec" />
    </div>
  );
}
