"use client";

import dynamic from "next/dynamic";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";
import type { GlobePoint } from "./CircuitGlobe";

const CircuitGlobe = dynamic(() => import("./CircuitGlobe"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-apex-muted">
      Loading globe…
    </div>
  ),
});

export function GlobeSection({ points }: { points: GlobePoint[] }) {
  const reduced = usePrefersReducedMotion();

  return (
    <div className="relative h-[340px] w-full overflow-hidden rounded-2xl border border-apex-border bg-gradient-to-b from-apex-panel/60 to-apex-bg sm:h-[420px]">
      <div className="apex-lines pointer-events-none absolute inset-0 opacity-30" />
      {reduced ? (
        <div className="flex h-full items-center justify-center text-sm text-apex-muted">
          Globe disabled (reduced motion). {points.length} circuits this season.
        </div>
      ) : (
        <CircuitGlobe points={points} />
      )}
      <div className="pointer-events-none absolute bottom-3 left-4 text-xs text-apex-muted">
        Drag to rotate · <span className="text-apex-accent">●</span> next ·{" "}
        <span className="text-apex-accent2">●</span> upcoming ·{" "}
        <span className="text-apex-muted">●</span> done
      </div>
    </div>
  );
}
