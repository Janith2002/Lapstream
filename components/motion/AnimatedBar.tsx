"use client";

import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";

/** A horizontal bar that fills from 0 to `pct`% when scrolled into view. */
export function AnimatedBar({
  pct,
  color,
  delay = 0,
}: {
  pct: number;
  color: string;
  delay?: number;
}) {
  const reduced = usePrefersReducedMotion();
  const width = `${Math.max(0, Math.min(100, pct))}%`;

  return (
    <div className="h-1.5 w-24 overflow-hidden rounded bg-apex-bg">
      <motion.div
        className="h-full rounded"
        style={{ background: color }}
        initial={reduced ? false : { width: 0 }}
        whileInView={{ width }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}
