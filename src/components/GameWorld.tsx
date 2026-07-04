"use client";
import { useRef, useEffect, useMemo, useCallback, forwardRef, useImperativeHandle, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

export type PlanetId = "mercury" | "venus" | "earth" | "mars" | "jupiter" | "saturn" | "uranus" | "neptune";

export type Body = {
  id: PlanetId | "sun";
  name: string;
  texture: string;
  radius: number;
  distance: number;
  speed: number;
  rotation: number;
  glow?: string;
  emissive?: boolean;
  hasRing?: boolean;
  ringInner?: number;
  ringOuter?: number;
  ringColor?: string;
  initialAngle?: number;
  biome?: "green" | "sand" | "cloud" | "ice" | "lava" | "crystal" | "gas" | "void";
  collectible?: "star" | "crystal" | "ankh" | "ruby" | "apple";
  sky?: string;
  ground?: string;
  accent?: string;
};

export const BODIES: Body[] = [
  { id: "sun", name: "太阳", texture: "/assets/textures/sun.jpg", radius: 3.5, distance: 0, speed: 0, rotation: 0.04, emissive: true, glow: "#fbbf24" },
  { id: "mercury", name: "水星", texture: "/assets/textures/mercury.jpg", radius: 0.55, distance: 7, speed: 0.32, rotation: 0.02, glow: "#a8a29e", biome: "void", collectible: "crystal", sky: "#0a0a18", ground: "#737373", accent: "#a8a29e" },
  { id: "venus", name: "金星", texture: "/assets/textures/venus.jpg", radius: 0.75, distance: 10, speed: 0.26, rotation: 0.01, glow: "#fb923c", biome: "lava", collectible: "ruby", sky: "#3a0d04", ground: "#9a3412", accent: "#fb923c" },
  { id: "earth", name: "地球", texture: "/assets/textures/earth.jpg", radius: 0.85, distance: 13, speed: 0.22, rotation: 0.04, glow: "#3b82f6", biome: "green", collectible: "apple", sky: "#0c1d3a", ground: "#0e3b5c", accent: "#22d3ee" },
  { id: "mars", name: "火星", texture: "/assets/textures/mars.jpg", radius: 0.7, distance: 16, speed: 0.18, rotation: 0.038, glow: "#dc2626", biome: "sand", collectible: "ankh", sky: "#1c0608", ground: "#5c1a08", accent: "#f97316" },
  { id: "jupiter", name: "木星", texture: "/assets/textures/jupiter.jpg", radius: 1.7, distance: 22, speed: 0.12, rotation: 0.08, glow: "#fbbf24", biome: "gas", collectible: "star", sky: "#0a0815", ground: "#1e1b4b", accent: "#a78bfa" },
  { id: "saturn", name: "土星", texture: "/assets/textures/saturn.jpg", radius: 1.5, distance: 28, speed: 0.1, rotation: 0.07, glow: "#fbbf24", hasRing: true, ringInner: 1.9, ringOuter: 2.7, biome: "ice", collectible: "crystal", sky: "#1a1407", ground: "#3a2c10", accent: "#fde68a" },
  { id: "uranus", name: "天王星", texture: "/assets/textures/uranus.jpg", radius: 1.1, distance: 34, speed: 0.08, rotation: 0.06, glow: "#22d3ee", biome: "cloud", collectible: "star", sky: "#042029", ground: "#0a3a45", accent: "#67e8f9" },
  { id: "neptune", name: "海王星", texture: "/assets/textures/neptune.webp", radius: 1.05, distance: 40, speed: 0.07, rotation: 0.055, glow: "#3b82f6", biome: "crystal", collectible: "ruby", sky: "#070b25", ground: "#101a4d", accent: "#818cf8" }
];

function Stars({ count = 800, radius = 80 }: { count?: number; radius?: number }) {
  const localRef = useRef<THREE.Points>(null!);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = radius * (0.5 + Math.random() * 0.5);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, [count, radius]);
  useFrame((state) => { if (localRef.current) localRef.current.rotation.y = state.clock.getElapsedTime() * 0.005; });
  return (
    <points ref={localRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#ffffff" size={0.25} sizeAttenuation transparent opacity={0.85} depthWrite={false} />
    </points>
  );
}

// 高速流星空 (玩家往前飞时的扑面感)
function StreamStars({ count = 200, color = "#ffffff" }: { count?: number; color?: string }) {
  const ref = useRef<THREE.Points>(null!);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 80;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 40;
      arr[i * 3 + 2] = -Math.random() * 200;
    }
    return arr;
  }, [count]);
  useFrame((state, delta) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 2] += 80 * delta;
      if (arr[i * 3 + 2] > 30) arr[i * 3 + 2] -= 200;
    }
    pos.needsUpdate = true;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.18} sizeAttenuation transparent opacity={0.75} depthWrite={false} />
    </points>
  );
}

const textureCache = new Map<string, THREE.Texture>();
const loader = new THREE.TextureLoader();
function loadTex(url: string): THREE.Texture | null {
  try {
    if (textureCache.has(url)) return textureCache.get(url)!;
    const t = loader.load(url, undefined, undefined, () => {});
    textureCache.set(url, t);
    return t;
  } catch { return null; }
}

function Sun({ onClick }: { onClick?: () => void }) {
  const sunRef = useRef<THREE.Mesh>(null!);
  const tex = useMemo(() => loadTex("/assets/textures/sun.jpg"), []);
  useFrame((state) => { if (sunRef.current) sunRef.current.rotation.y = state.clock.getElapsedTime() * 0.04; });
  return (
    <group onClick={onClick}>
      <mesh ref={sunRef}>
        <sphereGeometry args={[3.5, 48, 48]} />
        <meshBasicMaterial map={tex || undefined} color={tex ? "#ffffff" : "#fbbf24"} />
      </mesh>
      <pointLight color="#fbbf24" intensity={3.5} distance={120} decay={1.2} />
      <mesh>
        <sphereGeometry args={[4.2, 32, 32]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.18} side={THREE.BackSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Planet({ body, angle, onClick, highlight }: { body: Body; angle: number; onClick?: () => void; highlight?: boolean }) {
  const pRef = useRef<THREE.Mesh>(null!);
  const gRef = useRef<THREE.Group>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);
  const tex = useMemo(() => loadTex(body.texture), [body.texture]);
  const ringTex = useMemo(() => body.hasRing ? loadTex("/assets/textures/saturn_ring.jpg") : null, [body.hasRing]);
  const x = Math.cos(angle) * body.distance;
  const z = Math.sin(angle) * body.distance;
  useFrame((state, delta) => {
    if (pRef.current) pRef.current.rotation.y += body.rotation * delta * 60;
    if (gRef.current) {
      const a = angle + body.speed * delta;
      gRef.current.position.set(Math.cos(a) * body.distance, 0, Math.sin(a) * body.distance);
    }
    if (ringRef.current) ringRef.current.rotation.z += delta * 0.05;
  });
  return (
    <group ref={gRef} position={[x, 0, z]}>
      <mesh ref={pRef} onClick={(e) => { e.stopPropagation(); onClick && onClick(); }} onPointerOver={() => { document.body.style.cursor = "pointer"; }} onPointerOut={() => { document.body.style.cursor = "default"; }}>
        <sphereGeometry args={[body.radius, 32, 32]} />
        <meshStandardMaterial map={tex || undefined} color={tex ? "#ffffff" : (body.glow || "#94a3b8")} emissive={highlight ? new THREE.Color(body.glow || "#fbbf24") : new THREE.Color("#000")} emissiveIntensity={highlight ? 0.45 : 0} roughness={0.85} metalness={0.05} />
      </mesh>
      {highlight && (
        <mesh>
          <sphereGeometry args={[body.radius * 1.4, 24, 24]} />
          <meshBasicMaterial color={body.glow || "#fbbf24"} transparent opacity={0.18} side={THREE.BackSide} depthWrite={false} />
        </mesh>
      )}
      {body.hasRing && (
        <mesh ref={ringRef} rotation={[Math.PI / 2.2, 0, 0]}>
          <ringGeometry args={[body.ringInner || 1.9, body.ringOuter || 2.7, 64]} />
          <meshStandardMaterial map={ringTex || undefined} color={ringTex ? "#ffffff" : "#e7c98a"} side={THREE.DoubleSide} transparent opacity={0.85} roughness={0.6} metalness={0.3} />
        </mesh>
      )}
      {body.id !== "sun" && <pointLight color={body.glow || "#ffffff"} intensity={0.25} distance={body.radius * 8} decay={2} />}
    </group>
  );
}

function Ship({ targetId }: { targetId: PlanetId | null }) {
  const sRef = useRef<THREE.Group>(null!);
  const flameRef = useRef<THREE.Mesh>(null!);
  const target = BODIES.find((b) => b.id === targetId);
  useFrame((state, delta) => {
    if (!sRef.current) return;
    const t = state.clock.getElapsedTime();
    if (target && target.distance > 0) {
      const tx = target.distance;
      const tz = 0;
      const px = sRef.current.position.x;
      const pz = sRef.current.position.z;
      const dx = tx - px, dz = tz - pz;
      const dist = Math.hypot(dx, dz);
      if (dist > 0.5) {
        sRef.current.position.x += (dx / dist) * 3.5 * delta;
        sRef.current.position.z += (dz / dist) * 3.5 * delta;
        sRef.current.position.y = Math.sin(t * 2) * 0.3;
      }
      sRef.current.lookAt(tx, 0, tz);
    } else {
      const a = t * 0.15;
      sRef.current.position.set(Math.cos(a) * 5.5, Math.sin(t * 0.8) * 0.4, Math.sin(a) * 5.5);
      sRef.current.lookAt(0, 0, 0);
    }
    if (flameRef.current) {
      const fs = 1 + Math.sin(t * 24) * 0.3;
      flameRef.current.scale.set(fs, fs * 1.4, fs);
    }
  });
  return (
    <group ref={sRef}>
      <mesh castShadow>
        <coneGeometry args={[0.25, 0.7, 12]} />
        <meshStandardMaterial color="#e0e7ff" emissive="#a5b4fc" emissiveIntensity={0.4} metalness={0.8} roughness={0.18} />
      </mesh>
      <mesh position={[0, 0, -0.5]} rotation={[Math.PI / 2, 0, 0]} ref={flameRef}>
        <coneGeometry args={[0.18, 0.55, 8]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.85} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <pointLight color="#22d3ee" intensity={0.6} distance={3.5} decay={1.5} />
    </group>
  );
}

function OrbitRing({ distance }: { distance: number }) {
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 96; i++) {
      const a = (i / 96) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * distance, 0, Math.sin(a) * distance));
    }
    return pts;
  }, [distance]);
  const geom = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);
  return (
    <line>
      <primitive object={geom} attach="geometry" />
      <lineBasicMaterial color="#ffffff" transparent opacity={0.12} depthWrite={false} />
    </line>
  );
}

function SolarSystem({ targetId, onPlanetClick }: { targetId: PlanetId | null; onPlanetClick?: (id: string) => void }) {
  return (
    <group>
      <ambientLight intensity={0.35} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} color="#a5b4fc" />
      <mesh renderOrder={-1}>
        <sphereGeometry args={[120, 32, 32]} />
        <meshBasicMaterial color="#02010a" side={THREE.BackSide} depthWrite={false} />
      </mesh>
      <Stars count={1200} radius={110} />
      {BODIES.filter(b => b.distance > 0).map((b) => (
        <OrbitRing key={"orbit-" + b.id} distance={b.distance} />
      ))}
      <Sun />
      {BODIES.filter((b) => b.id !== "sun").map((b) => {
        const angle = b.initialAngle ?? Math.random() * Math.PI * 2;
        return <Planet key={b.id} body={b} angle={angle} onClick={() => onPlanetClick && onPlanetClick(b.id as string)} highlight={targetId === b.id} />;
      })}
      <Ship targetId={targetId} />
    </group>
  );
}

function SolarCamera({ targetId, mode, startTime }: { targetId: PlanetId | null; mode: string; startTime: number }) {
  const { camera } = useThree();
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (mode === "CRUISE") {
      const a = t * 0.05;
      const r = 28 + Math.sin(t * 0.2) * 4;
      camera.position.set(Math.cos(a) * r, 12 + Math.sin(t * 0.15) * 3, Math.sin(a) * r);
      camera.lookAt(0, 0, 0);
    } else if (mode === "APPROACH" && targetId) {
      const target = BODIES.find((b) => b.id === targetId);
      if (target) {
        const elapsed = (Date.now() - startTime) / 1000;
        const k = Math.min(1, elapsed / 2.5);
        const ang = (target.initialAngle ?? 0);
        const tx = Math.cos(ang) * target.distance;
        const tz = Math.sin(ang) * target.distance;
        const dist = 20 - k * 16;
        const cx = tx + Math.cos(t * 0.4 + 1) * dist * 0.2;
        const cy = 4 - k * 3;
        const cz = tz + Math.sin(t * 0.4 + 1) * dist * 0.2;
        camera.position.set(cx, cy, cz);
        camera.lookAt(tx, 0, tz);
        const fov = 60 - k * 25;
        if ("fov" in camera) (camera as THREE.PerspectiveCamera).fov = fov;
        (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
      }
    }
  });
  return null;
}

// ============================================================
// 行星关卡 (PLAY) - 飞行躲避 + 行星接近 + 大气层着陆
// ============================================================

// 行星: 4 阶段动态放大 (WARP 远处 4 半径 -> APPROACH 28 -> ENTRY 80 -> 充满画面)
function TargetPlanet({ body, getPlayerZ }: { body: Body; getPlayerZ: () => number }) {
  const groupRef = useRef<THREE.Group>(null!);
  const meshRef = useRef<THREE.Mesh>(null!);
  const atmosRef = useRef<THREE.Mesh>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);
  const tex = useMemo(() => loadTex(body.texture), [body.texture]);
  useFrame((state) => {
    if (!groupRef.current) return;
    const pz = getPlayerZ();
    let radius, atmosRadius, atmosOpacity, dist;
    if (pz > -80) {
      const kk = Math.max(0, Math.min(1, -pz / 80));
      radius = 4 + kk * 3;
      atmosRadius = radius * 1.08;
      atmosOpacity = 0.1;
      dist = -110;
    } else if (pz > -150) {
      const k = (-pz - 80) / 70;
      radius = 7 + k * 21;
      atmosRadius = radius * 1.06;
      atmosOpacity = 0.15 + k * 0.25;
      dist = -110;
    } else {
      const k = Math.min(1, (-pz - 150) / 50);
      radius = 28 + k * 52;
      atmosRadius = radius * 1.05;
      atmosOpacity = 0.4 + k * 0.5;
      dist = -80 + k * 50;
    }
    groupRef.current.position.set(0, 0, dist);
    meshRef.current.scale.setScalar(radius / 4);
    atmosRef.current.scale.setScalar(atmosRadius / 4);
    (atmosRef.current.material as THREE.MeshBasicMaterial).opacity = atmosOpacity;
    if (ringRef.current) {
      ringRef.current.scale.setScalar(radius / 4);
      ringRef.current.rotation.z = state.clock.getElapsedTime() * 0.05;
    }
    meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.04;
  });
  return (
    <group ref={groupRef} position={[0, 0, -110]}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[4, 48, 48]} />
        <meshStandardMaterial map={tex || undefined} color={tex ? "#ffffff" : (body.glow || "#475569")} emissive={new THREE.Color(body.glow || "#000")} emissiveIntensity={0.08} roughness={0.9} metalness={0} />
      </mesh>
      <mesh ref={atmosRef}>
        <sphereGeometry args={[4, 32, 32]} />
        <meshBasicMaterial color={body.accent || body.glow || "#22d3ee"} transparent opacity={0.15} side={THREE.BackSide} depthWrite={false} />
      </mesh>
      {body.hasRing && (
        <mesh ref={ringRef} rotation={[Math.PI / 2.4, 0, 0]}>
          <ringGeometry args={[5, 7, 64]} />
          <meshStandardMaterial color={body.ringColor || "#e7c98a"} side={THREE.DoubleSide} transparent opacity={0.7} roughness={0.6} metalness={0.3} />
        </mesh>
      )}
    </group>
  );
}

// 大气层进入火球 (玩家在 z<-150 时显示)
function AtmosphericFire({ color, getPlayerZ }: { color: string; getPlayerZ: () => number }) {
  const groupRef = useRef<THREE.Group>(null!);
  const innerRef = useRef<THREE.Mesh>(null!);
  useFrame(() => {
    if (!groupRef.current) return;
    const pz = getPlayerZ();
    const k = Math.max(0, Math.min(1, (-pz - 150) / 50));
    groupRef.current.scale.setScalar(0.8 + k * 1.2);
    (innerRef.current.material as THREE.MeshBasicMaterial).opacity = 0.3 + k * 0.6;
  });
  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <mesh ref={innerRef}>
        <sphereGeometry args={[1.2, 24, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} side={THREE.BackSide} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}
// 陨石 / 太空碎片 (WARP 隧道)
function Meteor({ position, scale, speed }: { position: [number, number, number]; scale: number; speed: number }) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x += delta * 0.6;
      ref.current.rotation.y += delta * 0.5;
      ref.current.position.z += speed * delta;
      if (ref.current.position.z > 15) ref.current.position.z = -160;
    }
  });
  return (
    <mesh ref={ref} position={position} castShadow>
      <dodecahedronGeometry args={[scale, 0]} />
      <meshStandardMaterial color="#94a3b8" emissive="#fb923c" emissiveIntensity={0.4} roughness={0.85} metalness={0.2} flatShading />
    </mesh>
  );
}

// 能量球 (WARP 中可收集补给)
function EnergyOrb({ position, color }: { position: [number, number, number]; color: string }) {
  const ref = useRef<THREE.Group>(null!);
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.getElapsedTime() * 1.5;
      ref.current.position.z += 35 * delta;
      if (ref.current.position.z > 15) ref.current.position.z = -160;
    }
  });
  return (
    <group ref={ref} position={position}>
      <mesh>
        <octahedronGeometry args={[0.45, 0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.8} toneMapped={false} />
      </mesh>
      <mesh>
        <ringGeometry args={[0.6, 0.8, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      <pointLight color={color} intensity={0.5} distance={3} />
    </group>
  );
}

// 跟随相机: 玩家飞向 -z, 相机在玩家后上方, 强跟随
function FollowCamera({ targetRef }: { targetRef: React.MutableRefObject<THREE.Group | null> }) {
  const { camera } = useThree();
  useFrame(() => {
    if (targetRef.current) {
      const p = targetRef.current.position;
      // 相机在玩家后 6m, 上 3m, 看向玩家前方 8m
      camera.position.lerp(new THREE.Vector3(p.x * 0.3, p.y + 3, p.z + 6), 0.15);
      camera.lookAt(p.x * 0.5, p.y, p.z - 8);
    }
  });
  return null;
}

const ShipPlayer = forwardRef<THREE.Group, { onPositionUpdate: (x: number, y: number, z: number) => void; getHazardsAt: (z: number) => { x: number; y: number; z: number; hit: boolean }[]; getOrbsAt: (z: number) => { x: number; y: number; z: number; collected: boolean }[]; paused: boolean; onHazardHit: () => void; onOrbCollect: () => void }>(function ShipPlayer({ onPositionUpdate, getHazardsAt, getOrbsAt, paused, onHazardHit, onOrbCollect }, ref) {
  const innerRef = useRef<THREE.Group | null>(null);
  useImperativeHandle(ref, () => innerRef.current as THREE.Group, []);
  const flameRef = useRef<THREE.Mesh>(null!);
  const flame2Ref = useRef<THREE.Mesh>(null!);
  const trailRef = useRef<THREE.Mesh>(null!);
  const keysRef = useRef<Record<string, boolean>>({});
  const velRef = useRef({ x: 0, y: 0 });
  const lastReportRef = useRef(0);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      keysRef.current[k] = true;
    };
    const up = (e: KeyboardEvent) => { keysRef.current[e.key.toLowerCase()] = false; };
    window.addEventListener("keydown", down); window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);

  useFrame((state, delta) => {
    if (!innerRef.current) return;
    if (paused) return;
    const t = state.clock.getElapsedTime();
    const k = keysRef.current;
    // 4 向飞行 (无重力, 阻尼小)
    const accel = 18;
    if (k["a"] || k["arrowleft"]) velRef.current.x -= accel * delta;
    else if (k["d"] || k["arrowright"]) velRef.current.x += accel * delta;
    else velRef.current.x *= 0.92;
    if (k["w"] || k["arrowup"]) velRef.current.y += accel * delta;
    else if (k["s"] || k["arrowdown"]) velRef.current.y -= accel * delta;
    else velRef.current.y *= 0.92;
    // 限速
    velRef.current.x = Math.max(-12, Math.min(12, velRef.current.x));
    velRef.current.y = Math.max(-10, Math.min(10, velRef.current.y));
    innerRef.current.position.x = Math.max(-7, Math.min(7, innerRef.current.position.x + velRef.current.x * delta));
    innerRef.current.position.y = Math.max(-5, Math.min(5, innerRef.current.position.y + velRef.current.y * delta));
    // 自动向行星推进 (按 z 阶段加速: WARP 11, APPROACH 14, ENTRY 18)
    const curZ = innerRef.current.position.z;
    const auto = curZ > -80 ? 11 : curZ > -150 ? 14 : 18;
    innerRef.current.position.z -= auto * delta;
    // 倾斜
    if (Math.abs(velRef.current.x) > 0.5) innerRef.current.rotation.z -= velRef.current.x * delta * 0.5;
    else innerRef.current.rotation.z *= 0.85;
    innerRef.current.rotation.x = velRef.current.y * delta * 0.4;
    // 火焰
    if (flameRef.current) {
      const fs = 1 + Math.sin(t * 24) * 0.3;
      flameRef.current.scale.set(fs, fs * 1.8, fs);
    }
    if (flame2Ref.current) {
      const fs = 0.8 + Math.sin(t * 18 + 1) * 0.3;
      flame2Ref.current.scale.set(fs, fs * 1.6, fs);
    }
    if (trailRef.current) {
      trailRef.current.scale.z = 1 + Math.sin(t * 12) * 0.15;
    }
    // 碰撞检测
    const hz = getHazardsAt(innerRef.current.position.z);
    for (const h of hz) {
      if (h.hit) continue;
      const dx = Math.abs(innerRef.current.position.x - h.x);
      const dy = Math.abs(innerRef.current.position.y - h.y);
      const dz = Math.abs(innerRef.current.position.z - h.z);
      if (dz < 1.0 && dx < 1.2 && dy < 1.2) { h.hit = true; onHazardHit(); }
    }
    const oz = getOrbsAt(innerRef.current.position.z);
    for (const o of oz) {
      if (o.collected) continue;
      const dx = Math.abs(innerRef.current.position.x - o.x);
      const dy = Math.abs(innerRef.current.position.y - o.y);
      const dz = Math.abs(innerRef.current.position.z - o.z);
      if (dz < 1.5 && dx < 1.2 && dy < 1.2) { o.collected = true; onOrbCollect(); }
    }
    if (t - lastReportRef.current > 0.05) {
      lastReportRef.current = t;
      onPositionUpdate(innerRef.current.position.x, innerRef.current.position.y, innerRef.current.position.z);
    }
  });

  return (
    <group ref={innerRef} position={[0, 0, 0]}>
      <mesh castShadow>
        <sphereGeometry args={[0.42, 16, 16]} />
        <meshStandardMaterial color="#e0e7ff" emissive="#a5b4fc" emissiveIntensity={0.6} metalness={0.85} roughness={0.15} />
      </mesh>
      <mesh position={[0, 0, -0.6]} rotation={[Math.PI / 2, 0, 0]} ref={flameRef}>
        <coneGeometry args={[0.22, 0.9, 10]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.9} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh position={[0.15, 0.15, -0.5]} rotation={[Math.PI / 2, 0.2, 0]} ref={flame2Ref}>
        <coneGeometry args={[0.1, 0.5, 6]} />
        <meshBasicMaterial color="#a855f7" transparent opacity={0.8} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0, -1.2]} rotation={[Math.PI / 2, 0, 0]} ref={trailRef}>
        <coneGeometry args={[0.12, 1.2, 8]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.3} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <pointLight color="#22d3ee" intensity={0.8} distance={5} decay={1.5} />
    </group>
  );
});

function Level({ planetId, paused, onCollect, onHazard, onComplete, onPosition }: { planetId: PlanetId; paused: boolean; onCollect: (kind: string) => void; onHazard: () => void; onComplete: () => void; onPosition: (z: number) => void }) {
  const body = BODIES.find((b) => b.id === planetId) as Body;
  const playerRef = useRef<THREE.Group | null>(null);
  const hazardsRef = useRef<{ x: number; y: number; z: number; hit: boolean }[]>([]);
  const orbsRef = useRef<{ x: number; y: number; z: number; collected: boolean }[]>([]);
  const completedRef = useRef(false);
  const lastHazardCheck = useRef(0);

  // 3 阶段陨石带 + 能量球
  const allHazards = useMemo(() => {
    const arr: { x: number; y: number; z: number; hit: boolean; stage: number }[] = [];
    for (let i = 0; i < 14; i++) arr.push({ x: -6 + Math.random() * 12, y: -4 + Math.random() * 8, z: -i * 6 - 4, hit: false, stage: 1 });
    for (let i = 0; i < 22; i++) arr.push({ x: -5.5 + Math.random() * 11, y: -3.5 + Math.random() * 7, z: -82 - i * 3.1, hit: false, stage: 2 });
    for (let i = 0; i < 18; i++) arr.push({ x: -4 + Math.random() * 8, y: -3 + Math.random() * 6, z: -152 - i * 2.7, hit: false, stage: 3 });
    return arr;
  }, [planetId]);

  const allOrbs = useMemo(() => {
    const arr: { x: number; y: number; z: number; collected: boolean }[] = [];
    for (let i = 0; i < 10; i++) arr.push({ x: -5 + Math.random() * 10, y: -3 + Math.random() * 6, z: -i * 8 - 6, collected: false });
    for (let i = 0; i < 16; i++) arr.push({ x: -4.5 + Math.random() * 9, y: -3 + Math.random() * 6, z: -84 - i * 4.1, collected: false });
    for (let i = 0; i < 6; i++) arr.push({ x: -3 + Math.random() * 6, y: -2.5 + Math.random() * 5, z: -154 - i * 7.5, collected: false });
    return arr;
  }, [planetId]);

  const playerZRef = useRef(0);
  const shakeRef = useRef(0);

  useEffect(() => {
    hazardsRef.current = allHazards.map((h) => ({ ...h, hit: false }));
    orbsRef.current = allOrbs.map((o) => ({ ...o, collected: false }));
    completedRef.current = false;
  }, [allHazards, allOrbs]);

  const getHazardsAt = useCallback((z: number) => {
    return hazardsRef.current.filter((h) => Math.abs(h.z - z) < 1.0 && !h.hit);
  }, []);

  const getOrbsAt = useCallback((z: number) => {
    return orbsRef.current.filter((o) => Math.abs(o.z - z) < 1.5 && !o.collected);
  }, []);

  useFrame((state, delta) => {
    if (!playerRef.current) return;
    if (paused) return;
    if (completedRef.current) return;
    const p = playerRef.current.position;
    playerZRef.current = p.z;
    onPosition(p.z);
    if (p.z < -200) {
      completedRef.current = true;
      onComplete();
    }
    if (shakeRef.current > 0) {
      shakeRef.current = Math.max(0, shakeRef.current - delta * 4);
      const ss = shakeRef.current;
      p.x += (Math.random() - 0.5) * ss * 0.3;
      p.y += (Math.random() - 0.5) * ss * 0.3;
    }
  });

  const accent = body.accent || body.glow || "#22d3ee";
  const ground = body.ground || "#1e293b";

  return (
    <group>
      <ambientLight intensity={0.5} color={accent} />
      <directionalLight position={[5, 12, 8]} intensity={0.9} color="#ffffff" />
      <pointLight position={[0, 0, -100]} intensity={3} color={accent} distance={50} />
      <pointLight position={[0, 6, -120]} intensity={4} color={body.glow || "#fbbf24"} distance={40} />
      {/* 太空背景 */}
      <mesh renderOrder={-2}>
        <sphereGeometry args={[200, 24, 24]} />
        <meshBasicMaterial color={body.sky || "#02010a"} side={THREE.BackSide} depthWrite={false} />
      </mesh>
      <Stars count={600} radius={90} />
      <StreamStars count={300} color={accent} />
      <StreamStars count={200} color="#ffffff" />
      {/* 远景行星 (会越来越大) */}
      <TargetPlanet body={body} getPlayerZ={() => playerZRef.current} />
      {/* 陨石带 + 能量球 (固定在 z 段, 随 player 前进靠近) */}
      {allHazards.map((h, i) => <Meteor key={"h" + i} position={[h.x, h.y, h.z]} scale={0.5 + Math.random() * 0.5} speed={0} />)}
      {allOrbs.map((o, i) => <EnergyOrb key={"o" + i} position={[o.x, o.y, o.z]} color={accent} />)}
      <AtmosphericFire color={accent} getPlayerZ={() => playerZRef.current} />
      <ShipPlayer
        ref={playerRef}
        onPositionUpdate={(x, y, z) => { playerZRef.current = z; onPosition(z); }}
        getHazardsAt={getHazardsAt}
        getOrbsAt={getOrbsAt}
        paused={paused}
        onHazardHit={() => { shakeRef.current = 1; onHazard(); }}
        onOrbCollect={() => onCollect("crystal")}
      />
      <FollowCamera targetRef={playerRef} />
    </group>
  );
}

export type GameWorldHandle = { setSelected: (id: string | null) => void };

type Scene = "INTRO" | "SOLAR" | "APPROACH" | "PLAY" | "FINISHED";

export const GameWorld = forwardRef<GameWorldHandle, {
  scene: Scene;
  targetId: PlanetId | null;
  onPlanetClick?: (id: string) => void;
  startTime: number;
  shields?: number;
  paused?: boolean;
  onCollect?: (kind: string) => void;
  onHazard?: () => void;
  onComplete?: () => void;
  onPosition?: (z: number) => void;
}>((function GameWorld({ scene, targetId, onPlanetClick, startTime, shields = 100, paused = false, onCollect, onHazard, onComplete, onPosition }, ref) {
  useImperativeHandle(ref, () => ({ setSelected: () => {} }));
  return (
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 2, 6], fov: 65, near: 0.1, far: 500 }} gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }} shadows={false}>
      <Suspense fallback={null}>
        {(scene === "INTRO" || scene === "SOLAR" || scene === "APPROACH") && (
          <>
            <SolarSystem targetId={targetId} onPlanetClick={onPlanetClick} />
            <SolarCamera targetId={targetId} mode={scene === "APPROACH" ? "APPROACH" : "CRUISE"} startTime={startTime} />
          </>
        )}
        {scene === "PLAY" && targetId && (
          <Level
            planetId={targetId}
            paused={paused}
            onCollect={(kind) => onCollect && onCollect(kind)}
            onHazard={() => onHazard && onHazard()}
            onComplete={() => onComplete && onComplete()}
            onPosition={(z) => onPosition && onPosition(z)}
          />
        )}
      </Suspense>
    </Canvas>
  );
}));

