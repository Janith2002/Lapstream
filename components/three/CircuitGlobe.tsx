"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";

export interface GlobePoint {
  name: string;
  locality: string;
  country: string;
  lat: number;
  long: number;
  isNext?: boolean;
  isPast?: boolean;
}

const R = 2;

function latLongToVec3(lat: number, long: number, radius = R): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (long + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

/** Real coastline outlines from public-domain Natural Earth data. */
function Continents() {
  const [geo, setGeo] = useState<THREE.BufferGeometry | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/data/land.json")
      .then((r) => r.json())
      .then((gj: any) => {
        const pts: number[] = [];
        const addRing = (ring: number[][]) => {
          for (let i = 0; i < ring.length - 1; i++) {
            const a = latLongToVec3(ring[i][1], ring[i][0], R + 0.012);
            const b = latLongToVec3(ring[i + 1][1], ring[i + 1][0], R + 0.012);
            pts.push(a.x, a.y, a.z, b.x, b.y, b.z);
          }
        };
        for (const f of gj.features ?? []) {
          const g = f.geometry;
          if (!g) continue;
          if (g.type === "Polygon") g.coordinates.forEach(addRing);
          else if (g.type === "MultiPolygon")
            g.coordinates.forEach((poly: number[][][]) => poly.forEach(addRing));
        }
        if (!alive) return;
        const bg = new THREE.BufferGeometry();
        bg.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
        setGeo(bg);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  if (!geo) return null;
  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial
        color="#3ad7ff"
        transparent
        opacity={0.75}
        toneMapped={false}
      />
    </lineSegments>
  );
}

function Pin({ point }: { point: GlobePoint }) {
  const [hover, setHover] = useState(false);
  const pos = useMemo(
    () => latLongToVec3(point.lat, point.long, R + 0.02),
    [point.lat, point.long],
  );
  const color = point.isNext ? "#ff2d55" : point.isPast ? "#5b5b6b" : "#00e5ff";
  const size = point.isNext ? 0.06 : 0.04;

  return (
    <group position={pos}>
      <mesh
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
        }}
        onPointerOut={() => setHover(false)}
      >
        <sphereGeometry args={[hover ? size * 1.6 : size, 12, 12]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      {point.isNext && (
        <mesh>
          <sphereGeometry args={[size * 2.4, 16, 16]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.25}
            toneMapped={false}
          />
        </mesh>
      )}
      {(hover || point.isNext) && (
        <Html
          center
          distanceFactor={8}
          position={[0, 0.18, 0]}
          style={{ pointerEvents: "none" }}
        >
          <div className="whitespace-nowrap rounded-md border border-apex-border bg-apex-bg/90 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur">
            {point.isNext && (
              <span className="mr-1 text-apex-accent">NEXT ·</span>
            )}
            {point.locality}, {point.country}
          </div>
        </Html>
      )}
    </group>
  );
}

function Globe({ points }: { points: GlobePoint[] }) {
  const group = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.08;
  });

  const grid = useMemo(() => new THREE.SphereGeometry(R + 0.004, 24, 18), []);

  return (
    <group ref={group} rotation={[0.32, 0, 0]}>
      {/* Solid dark ocean sphere */}
      <mesh>
        <sphereGeometry args={[R, 64, 64]} />
        <meshStandardMaterial
          color="#0c1424"
          roughness={0.8}
          metalness={0.25}
        />
      </mesh>
      {/* Faint lat/long grid */}
      <lineSegments>
        <wireframeGeometry args={[grid]} />
        <lineBasicMaterial
          color="#16243c"
          transparent
          opacity={0.45}
          toneMapped={false}
        />
      </lineSegments>
      {/* Real coastlines */}
      <Continents />
      {/* Atmosphere halo */}
      <mesh>
        <sphereGeometry args={[R * 1.12, 48, 48]} />
        <meshBasicMaterial
          color="#00e5ff"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
          toneMapped={false}
        />
      </mesh>
      {points.map((p, i) => (
        <Pin key={i} point={p} />
      ))}
    </group>
  );
}

export default function CircuitGlobe({ points }: { points: GlobePoint[] }) {
  return (
    <Canvas camera={{ position: [0, 0, 6], fov: 45 }} dpr={[1, 1.8]}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 3, 5]} intensity={1.2} />
      <pointLight position={[-5, -2, -3]} intensity={0.5} color="#ff2d55" />
      <Globe points={points} />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate={false}
        rotateSpeed={0.5}
      />
    </Canvas>
  );
}
