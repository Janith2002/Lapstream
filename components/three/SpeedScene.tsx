"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Float,
  ContactShadows,
  OrbitControls,
  Environment,
  Lightformer,
} from "@react-three/drei";
import * as THREE from "three";
import { F1Car } from "./F1Car";

const ACCENT = new THREE.Color("#ff2d55");
const CYAN = new THREE.Color("#00e5ff");

type Quality = "low" | "high";

/** Soft round sprite for particles (replaces the default square points). */
function useCircleTexture() {
  return useMemo(() => {
    const size = 64;
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2,
    );
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.45, "rgba(255,255,255,0.5)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    return tex;
  }, []);
}

function ParticleTunnel({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const tex = useCircleTexture();

  const { positions, colors, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 34;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 22;
      positions[i * 3 + 2] = -Math.random() * 55;
      speeds[i] = 8 + Math.random() * 22;
      const col = ACCENT.clone().lerp(CYAN, Math.random());
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }
    return { positions, colors, speeds };
  }, [count]);

  useFrame((_, delta) => {
    const pts = ref.current;
    if (!pts) return;
    const arr = pts.geometry.attributes.position.array as Float32Array;
    const d = Math.min(delta, 0.05);
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 2] += speeds[i] * d;
      if (arr[i * 3 + 2] > 14) {
        arr[i * 3 + 2] = -55;
        arr[i * 3] = (Math.random() - 0.5) * 34;
        arr[i * 3 + 1] = (Math.random() - 0.5) * 22;
      }
    }
    pts.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.3}
        map={tex}
        alphaTest={0.01}
        vertexColors
        transparent
        opacity={0.95}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
        toneMapped={false}
      />
    </points>
  );
}

function RacingRibbon({
  color,
  offsetY,
  radius,
}: {
  color: THREE.Color;
  offsetY: number;
  radius: number;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-14, -4 + offsetY, -8),
      new THREE.Vector3(-7, 4 + offsetY, -3),
      new THREE.Vector3(0, -3 + offsetY, -6),
      new THREE.Vector3(7, 4 + offsetY, -3),
      new THREE.Vector3(14, -2 + offsetY, -9),
    ]);
    return new THREE.TubeGeometry(curve, 200, radius, 12, false);
  }, [offsetY, radius]);

  useFrame((s) => {
    if (mesh.current)
      mesh.current.rotation.z = Math.cos(s.clock.elapsedTime * 0.1) * 0.1;
  });

  return (
    <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={mesh} geometry={geometry}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </Float>
  );
}

/** Gentle vertical bob for the car. */
function CarRig() {
  const ref = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (ref.current)
      ref.current.position.y = Math.sin(s.clock.elapsedTime * 0.8) * 0.06;
  });
  return (
    <group ref={ref}>
      <F1Car />
    </group>
  );
}

export default function SpeedScene({
  quality = "high",
  paused = false,
}: {
  quality?: Quality;
  paused?: boolean;
}) {
  const high = quality === "high";
  const count = high ? 1100 : 450;
  const shadowRes = high ? 256 : 160;

  return (
    <Canvas
      camera={{ position: [3.6, 1.5, 6.6], fov: 42 }}
      dpr={high ? [1, 1.5] : [1, 1.15]}
      gl={{ antialias: high, alpha: true, powerPreference: "high-performance" }}
      shadows={high}
      frameloop={paused ? "never" : "always"}
    >
      <fog attach="fog" args={["#0a0a0f", 16, 44]} />

      {/* studio lighting */}
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.4}
        castShadow={high}
        shadow-mapSize={[512, 512]}
      />
      <pointLight position={[-6, 2, -2]} intensity={50} color="#ff2d55" />
      <pointLight position={[6, 1, 4]} intensity={45} color="#00e5ff" />

      {/* inline studio environment -> real reflections on the clear-coat paint.
          No external HDR file, so it works fully offline. */}
      <Environment resolution={quality === "high" ? 256 : 128}>
        <Lightformer
          intensity={2}
          position={[0, 5, -2]}
          scale={[10, 5, 1]}
          color="#ffffff"
        />
        <Lightformer
          intensity={3}
          position={[-4, 1, 2]}
          scale={[3, 6, 1]}
          color="#ff2d55"
        />
        <Lightformer
          intensity={3}
          position={[4, 1, 2]}
          scale={[3, 6, 1]}
          color="#00e5ff"
        />
        <Lightformer
          intensity={1.5}
          position={[0, 1, 6]}
          scale={[8, 3, 1]}
          color="#aab0ff"
        />
      </Environment>

      {/* ambient background */}
      <ParticleTunnel count={count} />
      <RacingRibbon color={ACCENT} offsetY={0} radius={0.08} />
      <RacingRibbon color={CYAN} offsetY={1.6} radius={0.05} />

      {/* the star */}
      <CarRig />

      {/* Glossy floor: reflects the studio environment via env-map (cheap, no
          per-frame render pass) instead of a real planar reflector. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial
          color="#07070c"
          roughness={high ? 0.35 : 0.6}
          metalness={0.9}
          envMapIntensity={0.6}
        />
      </mesh>
      <ContactShadows
        position={[0, -0.01, 0]}
        opacity={0.6}
        scale={11}
        blur={2.6}
        far={4}
        resolution={shadowRes}
        color="#000000"
      />

      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom={false}
        autoRotate
        autoRotateSpeed={0.9}
        enableDamping
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 2.05}
        target={[0, -0.35, 0]}
      />
    </Canvas>
  );
}
