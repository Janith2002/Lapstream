"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";

// WebGL must be client-only; ssr:false avoids any server render of the canvas.
const SpeedScene = dynamic(() => import("./SpeedScene"), {
  ssr: false,
  loading: () => <StaticBackdrop />,
});

/** Static, motion-free gradient used as the loading + reduced-motion fallback. */
function StaticBackdrop() {
  return (
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,45,85,0.25),transparent_55%),radial-gradient(circle_at_80%_60%,rgba(0,229,255,0.18),transparent_55%)]" />
  );
}

export function Hero3D() {
  const reduced = usePrefersReducedMotion();
  const [quality, setQuality] = useState<"low" | "high" | null>(null);
  const [visible, setVisible] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scale down work on small / low-core devices for smooth mobile perf.
    const small = window.matchMedia("(max-width: 768px)").matches;
    const lowCore =
      typeof navigator !== "undefined" &&
      (navigator.hardwareConcurrency ?? 8) <= 4;
    setQuality(small || lowCore ? "low" : "high");
  }, []);

  useEffect(() => {
    // Pause the render loop while the hero is scrolled out of view.
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="absolute inset-0 z-0">
      {reduced || quality === null ? (
        <StaticBackdrop />
      ) : (
        <SpeedScene quality={quality} paused={!visible} />
      )}
    </div>
  );
}
