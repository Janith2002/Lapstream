"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";
import type { ReplayData } from "@/lib/replay";

function posAt(frames: number[][], t: number): [number, number] | null {
  if (!frames.length) return null;
  if (t <= frames[0][0]) return [frames[0][1], frames[0][2]];
  const last = frames[frames.length - 1];
  if (t >= last[0]) return [last[1], last[2]];
  let lo = 0,
    hi = frames.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (frames[mid][0] < t) lo = mid + 1;
    else hi = mid - 1;
  }
  const b = frames[lo];
  const a = frames[lo - 1];
  const r = (t - a[0]) / (b[0] - a[0] || 1);
  return [a[1] + (b[1] - a[1]) * r, a[2] + (b[2] - a[2]) * r];
}

const SPEEDS = [1, 2, 4, 8];

export function TrackReplay({ data }: { data: ReplayData }) {
  const reduced = usePrefersReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const tRef = useRef(0);
  const playingRef = useRef(!reduced);
  const speedRef = useRef(1);
  const [, force] = useState(0); // re-render for control labels
  const [playing, setPlaying] = useState(!reduced);
  const [speed, setSpeed] = useState(1);
  const [tDisplay, setTDisplay] = useState(0);

  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  // Draw + animation loop.
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let last = performance.now();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const draw = () => {
      const cw = canvas.width;
      const ch = canvas.height;
      ctx.clearRect(0, 0, cw, ch);

      const pad = 24 * dpr;
      const s = Math.min(
        (cw - pad * 2) / data.width,
        (ch - pad * 2) / data.height,
      );
      const ox = (cw - data.width * s) / 2;
      const oy = (ch - data.height * s) / 2;
      const sx = (x: number) => ox + x * s;
      const sy = (y: number) => oy + (data.height - y) * s; // flip

      // track outline
      if (data.track.length > 1) {
        ctx.beginPath();
        ctx.moveTo(sx(data.track[0][0]), sy(data.track[0][1]));
        for (let i = 1; i < data.track.length; i++)
          ctx.lineTo(sx(data.track[i][0]), sy(data.track[i][1]));
        ctx.strokeStyle = "rgba(139,139,158,0.35)";
        ctx.lineWidth = 6 * dpr;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.stroke();
        ctx.strokeStyle = "rgba(139,139,158,0.15)";
        ctx.lineWidth = 12 * dpr;
        ctx.stroke();
      }

      // cars
      const t = tRef.current;
      ctx.font = `${11 * dpr}px ui-monospace, monospace`;
      for (const d of data.drivers) {
        const p = posAt(data.frames[d.num] ?? [], t);
        if (!p) continue;
        const x = sx(p[0]);
        const y = sy(p[1]);
        ctx.beginPath();
        ctx.arc(x, y, 5.5 * dpr, 0, Math.PI * 2);
        ctx.fillStyle = d.color;
        ctx.shadowColor = d.color;
        ctx.shadowBlur = 10 * dpr;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.fillText(d.code, x + 8 * dpr, y + 4 * dpr);
      }
    };

    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      if (playingRef.current && data.duration > 0) {
        tRef.current += dt * speedRef.current;
        if (tRef.current > data.duration) tRef.current = 0; // loop
        setTDisplay(tRef.current);
      }
      draw();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [data]);

  const aspect = `${data.width} / ${data.height}`;

  return (
    <div>
      <div
        ref={wrapRef}
        className="relative w-full overflow-hidden rounded-2xl border border-apex-border bg-gradient-to-b from-apex-panel/40 to-apex-bg"
        style={{ aspectRatio: aspect, maxHeight: "70vh" }}
      >
        <canvas ref={canvasRef} className="h-full w-full" />
      </div>

      {/* controls */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => {
            const next = !playing;
            setPlaying(next);
            force((n) => n + 1);
          }}
          aria-label={playing ? "Pause" : "Play"}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-apex-accent text-white transition hover:opacity-90"
        >
          {playing ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        <input
          type="range"
          min={0}
          max={data.duration || 1}
          value={Math.round(tDisplay)}
          onChange={(e) => {
            tRef.current = Number(e.target.value);
            setTDisplay(tRef.current);
          }}
          aria-label="Scrub replay"
          className="h-1.5 flex-1 cursor-pointer accent-apex-accent"
        />

        <span className="font-mono text-xs tabular-nums text-apex-muted">
          {(tDisplay / 1000).toFixed(1)}s / {(data.duration / 1000).toFixed(0)}s
        </span>

        <div className="flex items-center gap-1">
          {SPEEDS.map((sp) => (
            <button
              key={sp}
              type="button"
              onClick={() => setSpeed(sp)}
              className={`rounded-md px-2 py-1 text-xs font-semibold transition ${
                speed === sp
                  ? "bg-apex-panel text-white"
                  : "text-apex-muted hover:text-white"
              }`}
            >
              {sp}×
            </button>
          ))}
        </div>
      </div>

      {/* driver legend */}
      <div className="mt-5 flex flex-wrap gap-2">
        {data.drivers.map((d) => (
          <span
            key={d.num}
            className="flex items-center gap-1.5 rounded-full border border-apex-border bg-apex-panel px-2.5 py-1 text-xs"
          >
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ background: d.color }}
            />
            <span className="font-mono">{d.code}</span>
          </span>
        ))}
      </div>

      {/* session selector */}
      {data.sessions.length > 1 && (
        <div className="mt-8">
          <p className="mb-2 text-xs uppercase tracking-widest text-apex-muted">
            Pick a race
          </p>
          <div className="flex flex-wrap gap-2">
            {data.sessions.map((s) => (
              <Link
                key={s.key}
                href={`/replay?session=${s.key}`}
                scroll={false}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  s.key === data.sessionKey
                    ? "border-apex-accent bg-apex-accent/15 text-white"
                    : "border-apex-border text-apex-muted hover:border-apex-muted/60 hover:text-white"
                }`}
              >
                {s.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
