"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

// A stylized but realistically-proportioned ORIGINAL open-wheel car.
// Generic on purpose (no real team livery / numbers / badges) => trademark-safe.

const PAINT = "#1b1d27";
const ACCENT = "#ff2d55";
const CYAN = "#00e5ff";
const CARBON = "#0c0d12";
const TIRE = "#0b0b0d";
const METAL = "#c8ccd6";

/** A thin cylinder connecting two points — used for suspension wishbones. */
function Strut({
  a,
  b,
  r = 0.022,
  color = CARBON,
}: {
  a: [number, number, number];
  b: [number, number, number];
  r?: number;
  color?: string;
}) {
  const { pos, quat, len } = useMemo(() => {
    const A = new THREE.Vector3(...a);
    const B = new THREE.Vector3(...b);
    const dir = new THREE.Vector3().subVectors(B, A);
    const len = dir.length();
    const pos = new THREE.Vector3().addVectors(A, B).multiplyScalar(0.5);
    const quat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir.clone().normalize(),
    );
    return { pos: pos.toArray() as [number, number, number], quat, len };
  }, [a, b]);
  return (
    <mesh position={pos} quaternion={quat}>
      <cylinderGeometry args={[r, r, len, 8]} />
      <meshStandardMaterial color={color} roughness={0.5} metalness={0.6} />
    </mesh>
  );
}

function Wheel({
  position,
  steer = 0,
}: {
  position: [number, number, number];
  steer?: number;
}) {
  const spin = useRef<THREE.Group>(null);
  useFrame((_, d) => {
    if (spin.current) spin.current.rotation.x += d * 5;
  });
  return (
    <group position={position} rotation={[0, steer, 0]}>
      <group ref={spin} rotation={[0, 0, Math.PI / 2]}>
        {/* tyre */}
        <mesh castShadow>
          <cylinderGeometry args={[0.34, 0.34, 0.3, 40]} />
          <meshStandardMaterial color={TIRE} roughness={0.9} metalness={0.05} />
        </mesh>
        {/* rounded shoulders */}
        {[-0.15, 0.15].map((y) => (
          <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.31, 0.05, 12, 40]} />
            <meshStandardMaterial color={TIRE} roughness={0.9} />
          </mesh>
        ))}
        {/* brake disc */}
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.21, 0.21, 0.03, 28]} />
          <meshStandardMaterial
            color="#3a3a42"
            roughness={0.4}
            metalness={0.8}
          />
        </mesh>
        {/* rim face */}
        <mesh position={[0, 0.151, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.02, 28]} />
          <meshStandardMaterial color={METAL} roughness={0.25} metalness={0.95} />
        </mesh>
        {/* spokes */}
        {Array.from({ length: 6 }).map((_, i) => (
          <mesh
            key={i}
            position={[0, 0.151, 0]}
            rotation={[0, (i / 6) * Math.PI * 2, 0]}
          >
            <boxGeometry args={[0.03, 0.025, 0.4]} />
            <meshStandardMaterial color="#2a2a32" metalness={0.7} roughness={0.4} />
          </mesh>
        ))}
        {/* hub nut accent */}
        <mesh position={[0, 0.165, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.03, 12]} />
          <meshStandardMaterial
            color={ACCENT}
            emissive={ACCENT}
            emissiveIntensity={0.5}
          />
        </mesh>
      </group>
    </group>
  );
}

export function F1Car() {
  const paint = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: PAINT,
        roughness: 0.32,
        metalness: 0.5,
        clearcoat: 1,
        clearcoatRoughness: 0.12,
      }),
    [],
  );
  const accent = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: ACCENT,
        roughness: 0.3,
        metalness: 0.4,
        clearcoat: 1,
        clearcoatRoughness: 0.15,
        emissive: new THREE.Color(ACCENT),
        emissiveIntensity: 0.08,
      }),
    [],
  );
  const carbon = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: CARBON,
        roughness: 0.55,
        metalness: 0.35,
      }),
    [],
  );
  const cyanMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: CYAN,
        emissive: new THREE.Color(CYAN),
        emissiveIntensity: 0.4,
        roughness: 0.4,
      }),
    [],
  );

  return (
    <group position={[0, 0.05, 0]}>
      {/* ---- floor / plank ---- */}
      <RoundedBox
        args={[0.92, 0.07, 4.0]}
        radius={0.03}
        smoothness={4}
        position={[0, 0.16, 0.1]}
        material={carbon}
        castShadow
      />

      {/* ---- monocoque / tub ---- */}
      <RoundedBox
        args={[0.66, 0.34, 1.7]}
        radius={0.16}
        smoothness={5}
        position={[0, 0.36, 0.0]}
        material={paint}
        castShadow
      />

      {/* ---- nose ---- */}
      <RoundedBox
        args={[0.36, 0.26, 1.5]}
        radius={0.12}
        smoothness={5}
        position={[0, 0.34, -1.35]}
        material={paint}
        castShadow
      />
      <mesh
        position={[0, 0.33, -2.18]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={accent}
        castShadow
      >
        <coneGeometry args={[0.12, 0.5, 20]} />
      </mesh>

      {/* ---- front wing (multi-element) ---- */}
      <RoundedBox
        args={[1.75, 0.04, 0.46]}
        radius={0.02}
        smoothness={3}
        position={[0, 0.13, -2.5]}
        material={accent}
        castShadow
      />
      <RoundedBox
        args={[1.75, 0.04, 0.24]}
        radius={0.02}
        smoothness={3}
        position={[0, 0.2, -2.36]}
        rotation={[-0.25, 0, 0]}
        material={accent}
      />
      {[-0.88, 0.88].map((x) => (
        <RoundedBox
          key={x}
          args={[0.035, 0.34, 0.62]}
          radius={0.02}
          smoothness={3}
          position={[x, 0.26, -2.46]}
          material={carbon}
        />
      ))}

      {/* ---- sidepods ---- */}
      {[-0.52, 0.52].map((x) => (
        <group key={x}>
          <RoundedBox
            args={[0.36, 0.42, 1.5]}
            radius={0.16}
            smoothness={5}
            position={[x, 0.37, 0.35]}
            material={paint}
            castShadow
          />
          {/* intake */}
          <mesh position={[x, 0.42, -0.42]}>
            <boxGeometry args={[0.22, 0.22, 0.08]} />
            <meshStandardMaterial color="#050507" roughness={0.95} />
          </mesh>
          {/* accent strip */}
          <RoundedBox
            args={[0.02, 0.05, 1.3]}
            radius={0.01}
            smoothness={2}
            position={[x < 0 ? x - 0.18 : x + 0.18, 0.5, 0.35]}
            material={cyanMat}
          />
        </group>
      ))}

      {/* ---- cockpit recess + helmet ---- */}
      <mesh position={[0, 0.5, -0.25]}>
        <boxGeometry args={[0.36, 0.16, 0.6]} />
        <meshStandardMaterial color="#050507" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.54, -0.2]} castShadow>
        <sphereGeometry args={[0.13, 20, 20]} />
        <meshStandardMaterial color="#101018" roughness={0.3} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0.55, -0.31]}>
        <boxGeometry args={[0.2, 0.08, 0.04]} />
        <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={0.3} />
      </mesh>

      {/* ---- halo ---- */}
      <group position={[0, 0.62, -0.2]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.3, 0.03, 12, 28, Math.PI]} />
          <meshStandardMaterial color={CARBON} metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.02, -0.3]}>
          <cylinderGeometry args={[0.035, 0.035, 0.28, 10]} />
          <meshStandardMaterial color={CARBON} metalness={0.6} roughness={0.4} />
        </mesh>
      </group>

      {/* ---- mirrors ---- */}
      {[-0.34, 0.34].map((x) => (
        <group key={x} position={[x, 0.52, -0.08]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.012, 0.012, 0.18, 8]} />
            <meshStandardMaterial color={CARBON} />
          </mesh>
          <RoundedBox
            args={[0.11, 0.07, 0.04]}
            radius={0.02}
            smoothness={3}
            position={[x < 0 ? -0.12 : 0.12, 0.02, 0]}
            material={paint}
          />
        </group>
      ))}

      {/* ---- engine cover + airbox + shark fin ---- */}
      <RoundedBox
        args={[0.4, 0.44, 1.4]}
        radius={0.18}
        smoothness={5}
        position={[0, 0.52, 0.78]}
        material={paint}
        castShadow
      />
      <RoundedBox
        args={[0.18, 0.28, 0.7]}
        radius={0.08}
        smoothness={4}
        position={[0, 0.6, 1.45]}
        material={paint}
      />
      <RoundedBox
        args={[0.22, 0.26, 0.34]}
        radius={0.06}
        smoothness={4}
        position={[0, 0.74, 0.18]}
        material={accent}
      />
      <mesh position={[0, 0.78, 0.02]}>
        <boxGeometry args={[0.15, 0.16, 0.06]} />
        <meshStandardMaterial color="#050507" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.74, 1.2]}>
        <boxGeometry args={[0.02, 0.32, 1.0]} />
        <meshStandardMaterial color={CARBON} roughness={0.5} metalness={0.4} />
      </mesh>

      {/* ---- rear wing ---- */}
      {[-0.18, 0.18].map((x) => (
        <mesh key={x} position={[x, 0.78, 1.85]} rotation={[0.2, 0, 0]}>
          <boxGeometry args={[0.05, 0.5, 0.06]} />
          <meshStandardMaterial color={CARBON} metalness={0.5} roughness={0.4} />
        </mesh>
      ))}
      <RoundedBox
        args={[1.5, 0.05, 0.42]}
        radius={0.02}
        smoothness={3}
        position={[0, 1.02, 1.86]}
        material={accent}
        castShadow
      />
      <RoundedBox
        args={[1.5, 0.05, 0.22]}
        radius={0.02}
        smoothness={3}
        position={[0, 1.12, 1.98]}
        rotation={[-0.3, 0, 0]}
        material={accent}
      />
      {[-0.74, 0.74].map((x) => (
        <RoundedBox
          key={x}
          args={[0.04, 0.42, 0.5]}
          radius={0.02}
          smoothness={3}
          position={[x, 1.0, 1.9]}
          material={carbon}
        />
      ))}

      {/* ---- diffuser ---- */}
      <mesh position={[0, 0.2, 1.95]} rotation={[0.4, 0, 0]}>
        <boxGeometry args={[0.86, 0.04, 0.4]} />
        <meshStandardMaterial color={CARBON} roughness={0.6} />
      </mesh>

      {/* ---- suspension wishbones ---- */}
      {([-1, 1] as const).map((s) => (
        <group key={s}>
          {/* front */}
          <Strut a={[s * 0.32, 0.3, -1.6]} b={[s * 0.82, 0.34, -1.62]} />
          <Strut a={[s * 0.32, 0.42, -1.45]} b={[s * 0.82, 0.4, -1.62]} />
          {/* rear */}
          <Strut a={[s * 0.3, 0.3, 1.55]} b={[s * 0.82, 0.34, 1.6]} />
          <Strut a={[s * 0.3, 0.46, 1.7]} b={[s * 0.82, 0.4, 1.6]} />
        </group>
      ))}

      {/* ---- wheels ---- */}
      <Wheel position={[-0.85, 0.34, -1.62]} steer={0.12} />
      <Wheel position={[0.85, 0.34, -1.62]} steer={0.12} />
      <Wheel position={[-0.85, 0.34, 1.6]} />
      <Wheel position={[0.85, 0.34, 1.6]} />
    </group>
  );
}
