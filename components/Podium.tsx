"use client";

import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";

export interface PodiumEntry {
  position: number;
  name: string;
  team: string;
  detail?: string;
}

const STEP = [
  { h: "h-28", label: "1", ring: "#ffd54a", order: "order-2" },
  { h: "h-20", label: "2", ring: "#cfd6e4", order: "order-1" },
  { h: "h-16", label: "3", ring: "#e0954a", order: "order-3" },
];

export function Podium({ entries }: { entries: PodiumEntry[] }) {
  const reduced = usePrefersReducedMotion();
  const top3 = [...entries]
    .sort((a, b) => a.position - b.position)
    .slice(0, 3);

  return (
    <div className="flex items-end justify-center gap-3 sm:gap-5">
      {top3.map((e, i) => {
        const step = STEP[i];
        return (
          <div
            key={e.position}
            className={`flex w-1/3 max-w-[180px] flex-col items-center ${step.order}`}
          >
            <div className="mb-2 text-center">
              <p
                className="truncate text-sm font-bold sm:text-base"
                style={{ color: step.ring }}
              >
                {e.name}
              </p>
              <p className="truncate text-xs text-apex-muted">{e.team}</p>
              {e.detail && (
                <p className="mt-0.5 font-mono text-[11px] text-apex-muted">
                  {e.detail}
                </p>
              )}
            </div>
            <motion.div
              className={`relative ${step.h} w-full overflow-hidden rounded-t-lg border-x border-t`}
              style={{
                borderColor: step.ring,
                background: "rgba(19,19,28,0.7)",
                transformOrigin: "bottom",
              }}
              initial={reduced ? false : { scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.7,
                delay: reduced ? 0 : i * 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <span
                className="absolute left-1/2 top-2 -translate-x-1/2 font-mono text-3xl font-black"
                style={{ color: step.ring }}
              >
                {step.label}
              </span>
              <span
                className="absolute inset-x-0 top-0 h-1"
                style={{ background: step.ring }}
              />
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
