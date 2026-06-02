"use client";

import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";

/** Reveals a heading word-by-word with a spring rise. */
export function AnimatedHeading({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const reduced = usePrefersReducedMotion();
  const words = text.split(" ");

  if (reduced) return <h1 className={className}>{text}</h1>;

  return (
    <h1 className={className} aria-label={text}>
      <motion.span
        aria-hidden
        className="inline-flex flex-wrap gap-x-[0.25em]"
        initial="hidden"
        animate="shown"
        variants={{ shown: { transition: { staggerChildren: 0.08 } } }}
      >
        {words.map((w, i) => (
          <span key={i} className="inline-block overflow-hidden">
            <motion.span
              className="inline-block"
              variants={{
                hidden: { y: "110%", opacity: 0 },
                shown: { y: "0%", opacity: 1 },
              }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              {w}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </h1>
  );
}
