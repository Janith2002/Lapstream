"use client";

import { useEffect, useState } from "react";

/**
 * True when the OS "reduce motion" setting is on. SSR-safe: defaults to false
 * (motion enabled) and updates after mount. Used to gate heavy 3D / animations.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
