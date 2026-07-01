"use client";
import { Canvas, useFrame, useThree, ThreeEvent } from "@react-three/fiber";
import { Stars, OrbitControls, Html } from "@react-three/drei";
import { Suspense, useMemo, useRef, useState, useCallback, useEffect } from "react";
import * as THREE from "three";
import { ALL_BODIES, BODIES, SUN, SCENE, SolarBody } from "@/data/bodies";

interface SceneProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
  paused: boolean;
  speed: number;
  showOrbits: boolean;
  showLabels: boolean;
}

function nameOf(b: SolarBody) {
  return b.nameZh || b.name;
}

function Sun({ paused }: { paused: boolean }) {
  const ref = useRef<THREE.Mesh>(null!);
  const halo = useRef<THREE.Mesh>(null!);
  useFrame((_, dt) => {
    if (!paused && ref.current) ref.current.rotation.y += dt * 0.1;
    if (halo.current) {
      const s = 1 + 0.05 * Math.sin(Date.now() * 0.0015);
      halo.current.scale.setScalar(s);
    }
  });
  return (
    <group>
      <mesh ref={ref} onClick={() => {}} onPointerOver={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); document.body.style.cursor = "pointer"; }} onPointerOut={() => { document.body.style.cursor = "auto"; }}>
        <sphereGeometry args={[SCENE.sunSize, 64, 64]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#fbbf24"
          emissiveIntensity={1.4}
          toneMapped={false}
        />
        <pointLight color="#fde68a" intensity={3.5} distance={200} decay={1.2} />
        <pointLight color="#f59e0b" intensity={0.6} distance={300} />
      </mesh>
      <mesh ref={halo} scale={1.3}>
        <sphereGeometry args={[SCENE.sunSize, 32, 32]} />
        <meshBasicMaterial color="#fcd34d" transparent opacity={0.18} side={THREE.BackSide} />
      </mesh>
      <mesh scale={1.6}>
        <sphereGeometry args={[SCENE.sunSize, 32, 32]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.06} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

function Orbit({ radius, color = "#6366f1" }: { radius: number; color?: string }) {
  const points = useMemo(() => {
    const seg = 256;
    const arr: THREE.Vector3[] = [];
    for (let i = 0; i <= seg; i++) {
      const a = (i / seg) * Math.PI * 2;
      arr.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
    }
    return arr;
  }, [radius]);
  const geom = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);
  return (
    <lineLoop geometry={geom}>
      <lineBasicMaterial color={color} transparent opacity={0.25} />
    </lineLoop>
  );
}

function Planet({
  body,
  onSelect,
  paused,
  showLabel
}: {
  body: SolarBody;
  onSelect: (id: string) => void;
  paused: boolean;
  showLabel: boolean;
}) {
  const ref = useRef<THREE.Mesh>(null!);
  const groupRef = useRef<THREE.Group>(null!);
  const [hover, setHover] = useState(false);

  const radius = SCENE.distance(body.orbitAu);
  const size = useMemo(() => {
    const r = body.radiusKm || 1000;
    return Math.max(0.18, Math.min(1.6, 0.18 + Math.log10(r / 100) * 0.3));
  }, [body.radiusKm]);

  const angleRef = useRef(Math.random() * Math.PI * 2);
  const speed = useMemo(() => 0.04 / Math.sqrt(body.orbitAu), [body.orbitAu]);

  useFrame((_, dt) => {
    if (!paused) {
      angleRef.current += dt * speed;
    }
    const a = angleRef.current;
    if (groupRef.current) {
      groupRef.current.position.set(Math.cos(a) * radius, 0, Math.sin(a) * radius);
    }
    if (ref.current) {
      ref.current.rotation.y += dt * (paused ? 0 : 0.6 / Math.max(0.3, body.rotationHours / 24));
    }
  });

  return (
    <group ref={groupRef}>
      <mesh
        ref={ref}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); setHover(true); document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { setHover(false); document.body.style.cursor = "auto"; }}
        onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onSelect(body.id); }}
      >
        <sphereGeometry args={[size, 48, 48]} />
        <meshStandardMaterial
          color={body.color}
          emissive={body.color}
          emissiveIntensity={hover ? 0.55 : 0.18}
          roughness={0.7}
          metalness={0.15}
        />
        {(body.id === "earth" || body.id === "venus" || body.id === "jupiter" || body.id === "saturn" || body.id === "uranus" || body.id === "neptune") && (
          <mesh scale={1.08}>
            <sphereGeometry args={[size, 32, 32]} />
            <meshBasicMaterial color={body.color} transparent opacity={0.12} side={THREE.BackSide} />
          </mesh>
        )}
      </mesh>
      {body.hasRings && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[size * 1.4, size * 2.1, 96]} />
          <meshBasicMaterial color={body.ringColor || "#fde68a"} transparent opacity={0.55} side={THREE.DoubleSide} />
        </mesh>
      )}
      {(showLabel || hover) && (
        <Html distanceFactor={12} position={[0, size + 0.4, 0]} center>
          <div className="px-2 py-0.5 rounded-md text-[10px] tracking-widest bg-black/60 text-white border border-white/20 backdrop-blur whitespace-nowrap pointer-events-none">
            {nameOf(body)}
          </div>
        </Html>
      )}
    </group>
  );
}

function CameraFocus({ target }: { target: { x: number; y: number; z: number; lookX?: number; lookY?: number; lookZ?: number } | null }) {
  const { camera } = useThree();
  const targetVec = useMemo(() => new THREE.Vector3(), []);
  const lookVec = useMemo(() => new THREE.Vector3(), []);
  useFrame(() => {
    if (!target) return;
    targetVec.set(target.x, target.y, target.z);
    camera.position.lerp(targetVec, 0.05);
    lookVec.set(target.lookX ?? 0, target.lookY ?? 0, target.lookZ ?? 0);
    camera.lookAt(lookVec);
  });
  return null;
}

interface ScenePropsExt extends SceneProps {}

function Scene({ selectedId, onSelect, paused, speed, showOrbits, showLabels }: ScenePropsExt) {
  const focus = useMemo(() => {
    if (!selectedId) return null;
    const b = ALL_BODIES.find((x) => x.id === selectedId);
    if (!b) return null;
    if (b.id === "sun") {
      return { x: 12, y: 6, z: 12, lookX: 0, lookY: 0, lookZ: 0 };
    }
    const r = SCENE.distance(b.orbitAu);
    // Assume planet at angle 0 (positive X axis). Camera offsets back along +Z.
    const camDist = 5 + Math.min(6, Math.max(2, r * 0.18));
    return {
      x: r,
      y: 2 + Math.min(2, r * 0.05),
      z: r + camDist,
      lookX: r,
      lookY: 0,
      lookZ: 0
    };
  }, [selectedId]);

  return (
    <>
      <ambientLight intensity={0.18} color="#312e81" />
      <directionalLight position={[5, 10, 5]} intensity={0.4} color="#c4b5fd" />
      <Stars radius={120} depth={50} count={4000} factor={4} fade speed={1} />
      <Sun paused={paused} />
      {showOrbits && BODIES.map((b) => (
        <Orbit key={"o-" + b.id} radius={SCENE.distance(b.orbitAu)} color="#4f46e5" />
      ))}
      {BODIES.map((b) => (
        <Planet key={b.id} body={b} onSelect={onSelect} paused={paused} showLabel={showLabels} />
      ))}
      <CameraFocus target={focus} />
      <OrbitControls
        enablePan
        enableZoom
        minDistance={3}
        maxDistance={120}
        autoRotate={false}
        dampingFactor={0.08}
      />
    </>
  );
}

export interface SolarSystem3DProps extends SceneProps {}

export function SolarSystem3D(props: SolarSystem3DProps) {
  return (
    <Canvas
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 18, 40], fov: 55, near: 0.1, far: 500 }}
      onPointerMissed={() => props.onSelect("")}
      dpr={[1, 2]}
    >
      <color attach="background" args={["#020617"]} />
      <fog attach="fog" args={["#020617", 30, 100]} />
      <Suspense fallback={null}>
        <Scene {...props} />
      </Suspense>
    </Canvas>
  );
}
