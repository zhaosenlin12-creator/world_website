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
  initialAngle?: number;
  biome?: "green" | "sand" | "cloud" | "ice" | "lava" | "crystal" | "gas" | "void";
  collectible?: "star" | "crystal" | "ankh" | "ruby" | "apple";
  sky?: string;
  ground?: string;
  accent?: string;
  ringColor?: string;
};

export const BODIES: Body[] = [
  { id: "sun", name: "太阳", texture: "/assets/textures/sun.jpg", radius: 3.5, distance: 0, speed: 0, rotation: 0.04, emissive: true, glow: "#fbbf24" },
  { id: "mercury", name: "水星", texture: "/assets/textures/mercury.jpg", radius: 0.55, distance: 7, speed: 0.32, rotation: 0.02, glow: "#a8a29e", biome: "void", collectible: "crystal", sky: "#0a0a18", ground: "#737373", accent: "#a8a29e" },
  { id: "venus", name: "金星", texture: "/assets/textures/venus.jpg", radius: 0.75, distance: 10, speed: 0.26, rotation: 0.01, glow: "#fb923c", biome: "lava", collectible: "ruby", sky: "#3a0d04", ground: "#9a3412", accent: "#fb923c" },
  { id: "earth", name: "地球", texture: "/assets/textures/earth.jpg", radius: 0.85, distance: 13, speed: 0.22, rotation: 0.04, glow: "#3b82f6", biome: "green", collectible: "apple", sky: "#0c1d3a", ground: "#0e3b5c", accent: "#22d3ee" },
  { id: "mars", name: "火星", texture: "/assets/textures/mars.jpg", radius: 0.7, distance: 16, speed: 0.18, rotation: 0.038, glow: "#dc2626", biome: "sand", collectible: "ankh", sky: "#1c0608", ground: "#5c1a08", accent: "#f97316" },
  { id: "jupiter", name: "木星", texture: "/assets/textures/jupiter.jpg", radius: 1.7, distance: 22, speed: 0.12, rotation: 0.08, glow: "#fbbf24", biome: "gas", collectible: "star", sky: "#0a0815", ground: "#1e1b4b", accent: "#a78bfa" },
  { id: "saturn", name: "土星", texture: "/assets/textures/saturn.jpg", radius: 1.5, distance: 28, speed: 0.1, rotation: 0.07, glow: "#fbbf24", hasRing: true, ringInner: 1.9, ringOuter: 2.7, biome: "ice", collectible: "crystal", sky: "#1a1407", ground: "#3a2c10", accent: "#fde68a", ringColor: "#e7c98a" },
  { id: "uranus", name: "天王星", texture: "/assets/textures/uranus.jpg", radius: 1.1, distance: 34, speed: 0.08, rotation: 0.06, glow: "#22d3ee", biome: "cloud", collectible: "star", sky: "#042029", ground: "#0a3a45", accent: "#67e8f9" },
  { id: "neptune", name: "海王星", texture: "/assets/textures/neptune.webp", radius: 1.05, distance: 40, speed: 0.07, rotation: 0.055, glow: "#3b82f6", biome: "crystal", collectible: "ruby", sky: "#070b25", ground: "#101a4d", accent: "#818cf8" }
];

// 远景星空 (静态)
function Stars({ count = 600, radius = 80 }: { count?: number; radius?: number }) {
  const ref = useRef<THREE.Points>(null!);
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
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#ffffff" size={0.3} sizeAttenuation transparent opacity={0.9} depthWrite={false} />
    </points>
  );
}

// 高速流星空: 粒子沿 z 轴高速冲向玩家, 营造 WARP 速度感
function WarpStars({ count = 400, speed = 60 }: { count?: number; speed?: number }) {
  const ref = useRef<THREE.Points>(null!);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 60;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 30;
      arr[i * 3 + 2] = -Math.random() * 200;
    }
    return arr;
  }, [count]);
  const lengths = useMemo(() => {
    const arr = new Float32Array(count);
    for (let i = 0; i < count; i++) arr[i] = 0.5 + Math.random() * 1.5;
    return arr;
  }, [count]);
  useFrame((state, delta) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 2] += speed * delta;
      if (arr[i * 3 + 2] > 20) arr[i * 3 + 2] -= 220;
    }
    pos.needsUpdate = true;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#ffffff" size={0.15} sizeAttenuation transparent opacity={0.7} depthWrite={false} />
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

// ============ 太阳系 (SOLAR) ============
function Sun({ onClick }: { onClick?: () => void }) {
  const ref = useRef<THREE.Mesh>(null!);
  // Procedural sun: 不依赖贴图, 纯发光球体 (sun.jpg 此前误用火星车图片)
  const tex = null;
  useFrame((state) => { if (ref.current) ref.current.rotation.y = state.clock.getElapsedTime() * 0.04; });
  return (
    <group onClick={onClick}>
      <mesh ref={ref}>
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
  // ????: ref ????? (?? prop ????????)
  const angRef = useRef<number>(angle);
  const x = Math.cos(angle) * body.distance;
  const z = Math.sin(angle) * body.distance;
  useFrame((state, delta) => {
    if (pRef.current) pRef.current.rotation.y += body.rotation * delta * 60;
    if (gRef.current) {
      angRef.current += body.speed * delta;
      const a = angRef.current;
      gRef.current.position.set(Math.cos(a) * body.distance, 0, Math.sin(a) * body.distance);
    }
    if (ringRef.current) ringRef.current.rotation.z += delta * 0.05;
  });
  return (
    <group ref={gRef} position={[x, 0, z]}>
      <mesh ref={pRef} onClick={(e) => { e.stopPropagation(); onClick && onClick(); }} onPointerOver={() => { document.body.style.cursor = "pointer"; }} onPointerOut={() => { document.body.style.cursor = "default"; }}>
        <sphereGeometry args={[body.radius, 48, 48]} />
        <meshStandardMaterial map={tex || undefined} color={tex ? "#ffffff" : (body.glow || "#94a3b8")} emissive={highlight ? new THREE.Color(body.glow || "#fbbf24") : new THREE.Color("#000")} emissiveIntensity={highlight ? 0.55 : 0} roughness={0.75} metalness={0.05} />
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
      // 持续旋转: 相机绕中心公转, 行星自然公转
      const a = t * 0.06;
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

// ============ WARP 飞行关卡 (PLAY) ============

// 行星: 3 阶段动态放大
function TargetPlanet({ body, getPlayerZ }: { body: Body; getPlayerZ: () => number }) {
  const groupRef = useRef<THREE.Group>(null!);
  const meshRef = useRef<THREE.Mesh>(null!);
  const atmosRef = useRef<THREE.Mesh>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);
  const tex = useMemo(() => loadTex(body.texture), [body.texture]);
  useFrame((state) => {
    if (!groupRef.current) return;
    const pz = getPlayerZ();
    let radius, atmosRadius, atmosOpacity, dist, glowOpacity;
    if (pz > -80) {
      // WARP: 远处小行星, 4 -> 7
      const kk = Math.max(0, Math.min(1, -pz / 80));
      radius = 4 + kk * 3;
      atmosRadius = radius * 1.08;
      atmosOpacity = 0.1 + kk * 0.05;
      dist = -110;
      glowOpacity = 0.05;
    } else if (pz > -150) {
      // APPROACH: 7 -> 28
      const k = (-pz - 80) / 70;
      radius = 7 + k * 21;
      atmosRadius = radius * 1.06;
      atmosOpacity = 0.15 + k * 0.3;
      dist = -110 + k * 30;
      glowOpacity = 0.1 + k * 0.3;
    } else if (pz > -260) {
      // ENTRY: 28 -> 60
      const k = (-pz - 150) / 110;
      radius = 28 + k * 32;
      atmosRadius = radius * 1.05;
      atmosOpacity = 0.45 + k * 0.25;
      dist = -80 + k * 40;
      glowOpacity = 0.4 + k * 0.3;
    } else if (pz > -320) {
      // ATMOSPHERE: 60 -> 100
      const k = (-pz - 260) / 60;
      radius = 60 + k * 40;
      atmosRadius = radius * 1.03;
      atmosOpacity = 0.7 + k * 0.2;
      dist = -40 + k * 30;
      glowOpacity = 0.7 + k * 0.2;
    } else {
      // LANDING: 100 -> 200
      const k = Math.min(1, (-pz - 320) / 80);
      radius = 100 + k * 100;
      atmosRadius = radius * 1.02;
      atmosOpacity = 0.85 + k * 0.1;
      dist = -10 + k * 5;
      glowOpacity = 0.85 + k * 0.1;
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

// 陨石: 自转 + 火焰尾迹 (拖尾)
function Meteor({ position, scale }: { position: [number, number, number]; scale: number }) {
  const ref = useRef<THREE.Mesh>(null!);
  const trailRef = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x += 0.6 * 0.016;
      ref.current.rotation.y += 0.5 * 0.016;
    }
    if (trailRef.current) {
      const a = state.clock.getElapsedTime() * 4;
      trailRef.current.scale.z = 1 + Math.sin(a) * 0.1;
    }
  });
  return (
    <group position={position}>
      <mesh ref={ref} castShadow>
        <dodecahedronGeometry args={[scale, 0]} />
        <meshStandardMaterial color="#94a3b8" emissive="#fb923c" emissiveIntensity={0.5} roughness={0.85} metalness={0.2} flatShading />
      </mesh>
      {/* 尾迹 (朝向玩家) */}
      <mesh ref={trailRef} position={[0, 0, 2]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[scale * 0.4, scale * 2, 6]} />
        <meshBasicMaterial color="#fb923c" transparent opacity={0.35} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

// 能量球: 多层光环 + 内核旋转 + 接近时发光 + 收集时弹缩
function EnergyOrb({ position, color, getPlayer, onCollect }: { position: [number, number, number]; color: string; getPlayer: () => THREE.Vector3 | null; onCollect: () => void }) {
  const groupRef = useRef<THREE.Group>(null!);
  const halo1Ref = useRef<THREE.Mesh>(null!);
  const halo2Ref = useRef<THREE.Mesh>(null!);
  const innerRef = useRef<THREE.Mesh>(null!);
  const collected = useRef(false);
  useFrame((state) => {
    if (!groupRef.current || collected.current) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.y = t * 1.5;
    if (halo1Ref.current) {
      halo1Ref.current.rotation.z = t * 0.8;
      halo1Ref.current.scale.setScalar(1 + Math.sin(t * 3) * 0.12);
    }
    if (halo2Ref.current) {
      halo2Ref.current.rotation.z = -t * 1.2;
      halo2Ref.current.scale.setScalar(0.9 + Math.sin(t * 2 + 1) * 0.08);
    }
    if (innerRef.current) {
      innerRef.current.rotation.x = t * 1.2;
      innerRef.current.rotation.y = t * 0.9;
    }
    // 玩家距离 < 2.4 时吸入
    const p = getPlayer();
    if (p) {
      const dx = p.x - position[0];
      const dy = p.y - position[1];
      const dz = p.z - position[2];
      const d = Math.hypot(dx, dy, dz);
      if (d < 2.4) {
        collected.current = true;
        onCollect();
      }
    }
  });
  return (
    <group ref={groupRef} position={position} visible={!collected.current}>
      <mesh ref={halo1Ref}>
        <ringGeometry args={[0.55, 0.78, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.55} side={THREE.DoubleSide} toneMapped={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh ref={halo2Ref}>
        <ringGeometry args={[0.95, 1.05, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} side={THREE.DoubleSide} toneMapped={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh ref={innerRef}>
        <icosahedronGeometry args={[0.4, 0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.0} toneMapped={false} metalness={0.5} roughness={0.2} />
      </mesh>
      
    </group>
  );
}

const ShipPlayer = forwardRef<THREE.Group, { onPositionUpdate: (x: number, y: number, z: number) => void; getPlayer: () => THREE.Vector3 | null; paused: boolean; onHazardHit: () => void; getHazards: () => { x: number; y: number; z: number; hit: boolean }[]; speed: number }>(function ShipPlayer({ onPositionUpdate, getPlayer, paused, onHazardHit, getHazards, speed }, ref) {
  const innerRef = useRef<THREE.Group | null>(null);
  useImperativeHandle(ref, () => innerRef.current as THREE.Group, []);
  const flameRef = useRef<THREE.Mesh>(null!);
  const flame2Ref = useRef<THREE.Mesh>(null!);
  const trailRef = useRef<THREE.Mesh>(null!);
  const hitCountRef = useRef(0); // 撞击次数, 触发冲击波动画
  const keysRef = useRef<Record<string, boolean>>({});
  const velRef = useRef({ x: 0, y: 0 });
  const lastReportRef = useRef(0);
  const lastHazardTRef = useRef(0); // 撞击节流, 避免终点前连续叮叮响

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
    // 4 向 + 阻尼
    const accel = 22;
    if (k["a"] || k["arrowleft"]) velRef.current.x -= accel * delta;
    else if (k["d"] || k["arrowright"]) velRef.current.x += accel * delta;
    else velRef.current.x *= 0.92;
    if (k["w"] || k["arrowup"]) velRef.current.y += accel * delta;
    else if (k["s"] || k["arrowdown"]) velRef.current.y -= accel * delta;
    else velRef.current.y *= 0.92;
    velRef.current.x = Math.max(-9, Math.min(9, velRef.current.x));
    velRef.current.y = Math.max(-7, Math.min(7, velRef.current.y));
    innerRef.current.position.x = Math.max(-6, Math.min(6, innerRef.current.position.x + velRef.current.x * delta));
    innerRef.current.position.y = Math.max(-4, Math.min(4, innerRef.current.position.y + velRef.current.y * delta));
    // 高速前进 (超过 -310 锁住, 避免 onComplete 抢跑 2D 跳跃)
    if (innerRef.current.position.z > -310) {
      innerRef.current.position.z -= speed * delta;
    } else {
      innerRef.current.position.z = -310;
    }
    // 倾斜 (roll + pitch)
    const rollTarget = -velRef.current.x * 0.05;
    innerRef.current.rotation.z += (rollTarget - innerRef.current.rotation.z) * 0.15;
    const pitchTarget = velRef.current.y * 0.04;
    innerRef.current.rotation.x += (pitchTarget - innerRef.current.rotation.x) * 0.15;
    // 火焰 (强度跟速度联动)
    if (flameRef.current) {
      const fs = 1 + Math.sin(t * 24) * 0.3 + speed * 0.05;
      flameRef.current.scale.set(fs, fs * 1.8, fs);
    }
    if (flame2Ref.current) {
      const fs = 0.8 + Math.sin(t * 18 + 1) * 0.3;
      flame2Ref.current.scale.set(fs, fs * 1.6, fs);
    }
    if (trailRef.current) {
      trailRef.current.scale.z = 1 + Math.sin(t * 12) * 0.15 + speed * 0.05;
    }
    // 碰撞 (球形, r=0.7) + 终点守卫 + 节流: 避免终点前后连击产生连续叮叮响
    const px = innerRef.current.position;
    // 已过终点 (z < -200) 不再触发撞击, 防止 onComplete 异步刷新 paused 期间连续命中
    if (px.z > -400) {
      const hazards = getHazards();
      for (const h of hazards) {
        if (h.hit) continue;
        const dx = Math.abs(px.x - h.x);
        const dy = Math.abs(px.y - h.y);
        const dz = Math.abs(px.z - h.z);
        if (dz < 1.0 && dx < 0.9 && dy < 0.9) {
          h.hit = true;
          hitCountRef.current++;
          // 撞击节流 220ms: 防止密集 hazard 区快速连击
          if (t - lastHazardTRef.current > 0.22) {
            lastHazardTRef.current = t;
            onHazardHit();
          }
        }
      }
    }
    if (t - lastReportRef.current > 0.05) {
      lastReportRef.current = t;
      onPositionUpdate(px.x, px.y, px.z);
    }
  });

  return (
    <group ref={innerRef} position={[0, 0, 0]}>
      {/* 飞船主体 */}
      <mesh castShadow>
        <coneGeometry args={[0.35, 0.9, 12]} />
        <meshStandardMaterial color="#e0e7ff" emissive="#a5b4fc" emissiveIntensity={0.5} metalness={0.85} roughness={0.15} />
      </mesh>
      {/* 主火焰 */}
      <mesh position={[0, 0, 0.7]} rotation={[-Math.PI / 2, 0, 0]} ref={flameRef}>
        <coneGeometry args={[0.22, 1.2, 10]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.9} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* 侧翼火焰 */}
      <mesh position={[0.18, 0.15, 0.55]} rotation={[-Math.PI / 2, 0.2, 0]} ref={flame2Ref}>
        <coneGeometry args={[0.1, 0.7, 6]} />
        <meshBasicMaterial color="#a855f7" transparent opacity={0.85} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* 长尾迹 */}
      <mesh position={[0, 0, 1.6]} rotation={[-Math.PI / 2, 0, 0]} ref={trailRef}>
        <coneGeometry args={[0.12, 2.2, 8]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.25} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <pointLight color="#22d3ee" intensity={0.8} distance={5} decay={1.5} />
      <Shockwave active={hitCountRef.current} />
    </group>
  );
});

// 跟随相机: 第三人称 + 撞击抖动, 抖动通过相机偏移实现 (不破坏飞船物理)
function FollowCamera({ targetRef, shakeRef, speedRef }: { targetRef: React.MutableRefObject<THREE.Group | null>; shakeRef?: React.MutableRefObject<number>; speedRef?: React.MutableRefObject<number> }) {
  const { camera } = useThree();
  const baseFov = 65;
  useFrame((state, delta) => {
    if (!targetRef.current) return;
    const p = targetRef.current.position;
    const baseX = p.x * 0.2;
    const baseY = p.y + 2.2;
    const baseZ = p.z + 5.5;
    let sx = 0, sy = 0, sz = 0;
    if (shakeRef && shakeRef.current > 0) {
      const s = shakeRef.current;
      const t = state.clock.getElapsedTime() * 60;
      sx = (Math.sin(t * 1.7) + Math.cos(t * 2.3)) * s * 0.4;
      sy = (Math.sin(t * 2.1) + Math.cos(t * 1.3)) * s * 0.4;
      sz = Math.sin(t * 1.9) * s * 0.2;
    }
    camera.position.lerp(new THREE.Vector3(baseX + sx, baseY + sy, baseZ + sz), 0.14);
    camera.lookAt(p.x * 0.4, p.y, p.z - 12);
    const targetFov = baseFov + (speedRef ? Math.min(speedRef.current * 0.4, 18) : 0);
    if ("fov" in camera) {
      (camera as THREE.PerspectiveCamera).fov += (targetFov - (camera as THREE.PerspectiveCamera).fov) * 0.06;
      (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
    }
  });
  return null;
}

// 撞击冲击波: 短暂扩散的发光环, 给玩家强烈"撞到了"反馈
function Shockwave({ active }: { active: number }) {
  const ref = useRef<THREE.Mesh>(null!);
  const matRef = useRef<THREE.MeshBasicMaterial>(null!);
  const startTime = useRef(0);
  const lastActive = useRef(0);
  useFrame((state) => {
    if (!ref.current) return;
    if (active !== lastActive.current) {
      lastActive.current = active;
      startTime.current = state.clock.getElapsedTime();
    }
    const t = state.clock.getElapsedTime() - startTime.current;
    if (t > 0.4) { ref.current.visible = false; return; }
    ref.current.visible = true;
    const k = t / 0.4;
    const s = 0.3 + k * 2.5;
    ref.current.scale.set(s, s, s);
    if (matRef.current) matRef.current.opacity = 0.6 * (1 - k);
  });
  return (
    <mesh ref={ref} position={[0, 0, 2.5]}>
      <ringGeometry args={[0.5, 0.7, 32]} />
      <meshBasicMaterial ref={matRef} color="#fb923c" transparent opacity={0} side={THREE.DoubleSide} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  );
}

function Level({ planetId, paused, onCollect, onHazard, onComplete, onPosition }: { planetId: PlanetId; paused: boolean; onCollect: (kind: string) => void; onHazard: () => void; onComplete: () => void; onPosition: (z: number) => void }) {
  const body = BODIES.find((b) => b.id === planetId) as Body;
  const playerRef = useRef<THREE.Group | null>(null);
  const playerZRef = useRef(0);
  const shakeRef = useRef(0);
  const completedRef = useRef(false);
  const cameraShakeRef = useRef(0);
  const speedRef = useRef(18); // 当前阶段速度, 给相机 FOV 用

  // 多样化障碍布局: 单陨石 / 陨石对 / 错位三连, 玩家需灵活穿梭
  const allHazards = useMemo(() => {
    const arr: { x: number; y: number; z: number; hit: boolean; size: number; lane: number }[] = [];
    // WARP (z 0 ~ -80) - 7 颗, 间距大, 随机 lane
    for (let i = 0; i < 7; i++) {
      const z = -12 - i * 10;
      const lane = Math.floor(Math.random() * 3);
      arr.push({ x: -3 + lane * 3, y: (Math.random() - 0.5) * 1.4, z, hit: false, size: 0.5 + Math.random() * 0.25, lane });
    }
    // APPROACH (z -80 ~ -150) - 9 颗, 有时双陨石并排
    for (let i = 0; i < 9; i++) {
      const z = -88 - i * 7;
      const isPair = i % 3 === 1;
      if (isPair) {
        const lanes = [0, 2];
        for (const lane of lanes) {
          arr.push({ x: -3 + lane * 3, y: (Math.random() - 0.5) * 1.5, z, hit: false, size: 0.5 + Math.random() * 0.3, lane });
        }
      } else {
        const lane = Math.floor(Math.random() * 3);
        arr.push({ x: -3 + lane * 3, y: (Math.random() - 0.5) * 1.8, z, hit: false, size: 0.5 + Math.random() * 0.35, lane });
      }
    }
    // ENTRY (z -150 ~ -200) - 5 颗, 间距大, 飞向大气层
    for (let i = 0; i < 5; i++) {
      const z = -158 - i * 8;
      const lane = i % 3;
      arr.push({ x: -3 + lane * 3, y: (Math.random() - 0.5) * 1, z, hit: false, size: 0.4 + Math.random() * 0.25, lane });
    }
        // ATMOSPHERE (z -260 ~ -320) - 6 棰? 澶ф皵灞傛诞绉? 蹇
    for (let i = 0; i < 6; i++) {
      const z = -268 - i * 9;
      const lane = i % 3;
      arr.push({ x: -3 + lane * 3, y: (Math.random() - 0.5) * 1.4, z, hit: false, size: 0.5 + Math.random() * 0.3, lane });
    }
    // LANDING (z -320 ~ -400) - 5 棰? 闂磋窛闀? 钀藉湴鍓
    for (let i = 0; i < 5; i++) {
      const z = -330 - i * 14;
      const lane = i % 3;
      arr.push({ x: -3 + lane * 3, y: (Math.random() - 0.5) * 0.8, z, hit: false, size: 0.5 + Math.random() * 0.25, lane });
    }
    return arr;
  }, [planetId]);

  // 能量球: 始终在 3 lane 中央, 间隔远
  const allOrbs = useMemo(() => {
    const arr: { x: number; y: number; z: number; collected: boolean }[] = [];
    // WARP
    for (let i = 0; i < 5; i++) {
      const lane = (i + 1) % 3;
      arr.push({ x: -3 + lane * 3, y: 0, z: -8 - i * 14, collected: false });
    }
    // APPROACH
    for (let i = 0; i < 12; i++) {
      const lane = (i + 1) % 3;
      arr.push({ x: -3 + lane * 3, y: (Math.random() - 0.5) * 1, z: -88 - i * 5.2, collected: false });
    }
    // ENTRY
    for (let i = 0; i < 6; i++) {
      const lane = (i + 1) % 3;
      arr.push({ x: -3 + lane * 3, y: 0, z: -152 - i * 8, collected: false });
    }
        // ATMOSPHERE
    for (let i = 0; i < 5; i++) {
      const lane = (i + 1) % 3;
      arr.push({ x: -3 + lane * 3, y: 0, z: -272 - i * 10, collected: false });
    }
    // LANDING
    for (let i = 0; i < 3; i++) {
      const lane = (i + 1) % 3;
      arr.push({ x: -3 + lane * 3, y: 0, z: -340 - i * 18, collected: false });
    }
    return arr;
  }, [planetId]);

  const hazardsRef = useRef(allHazards);
  const orbsRef = useRef(allOrbs);

  useEffect(() => {
    hazardsRef.current = allHazards.map((h) => ({ ...h, hit: false }));
    orbsRef.current = allOrbs.map((o) => ({ ...o, collected: false }));
    completedRef.current = false;
    shakeRef.current = 0;
  }, [allHazards, allOrbs]);

  const getPlayer = useCallback(() => playerRef.current ? playerRef.current.position : null, []);

  // 速度按阶段: WARP 18, APPROACH 26, ENTRY 34 (提升穿越感)
  const playerSpeed = useCallback(() => {
    const z = playerZRef.current;
    if (z > -100) return 10;
    if (z > -180) return 14;
    if (z > -260) return 18;
    if (z > -320) return 24;
    return 30;
  }, []);

  // 同步当前速度到 speedRef, 给相机用
  useFrame(() => {
    speedRef.current = playerSpeed();
  });

  useFrame((state, delta) => {
    if (!playerRef.current) return;
    if (paused) return;
    if (completedRef.current) return;
    const p = playerRef.current.position;
    playerZRef.current = p.z;
    onPosition(p.z);
    if (p.z < -400 && !paused && !completedRef.current) {
      completedRef.current = true;
      onComplete();
    }
    // 撞击震动: 仅记录强度, 由 FollowCamera 读取后做相机抖动, 不再直接修改飞船坐标 (避免破坏物理)
    if (shakeRef.current > 0) {
      shakeRef.current = Math.max(0, shakeRef.current - delta * 2.5);
    }
  });

  const accent = body.accent || body.glow || "#22d3ee";
  const baseSpeed = playerSpeed();

  return (
    <group>
      <ambientLight intensity={0.4} color={accent} />
      <directionalLight position={[5, 12, 8]} intensity={0.9} color="#ffffff" />
      <pointLight position={[0, 0, -100]} intensity={2.5} color={accent} distance={50} />
      <pointLight position={[0, 6, -120]} intensity={3.5} color={body.glow || "#fbbf24"} distance={40} />
      <mesh renderOrder={-2}>
        <sphereGeometry args={[200, 24, 24]} />
        <meshBasicMaterial color={body.sky || "#02010a"} side={THREE.BackSide} depthWrite={false} />
      </mesh>
      <Stars count={250} radius={80} />
      <WarpStars count={300} speed={baseSpeed * 6} />
      <TargetPlanet body={body} getPlayerZ={() => playerZRef.current} />
      {allHazards.map((h, i) => <Meteor key={"h" + i} position={[h.x, h.y, h.z]} scale={h.size} />)}
      {allOrbs.map((o, i) => (
        <EnergyOrb key={"o" + i} position={[o.x, o.y, o.z]} color={accent}
          getPlayer={getPlayer}
          onCollect={() => onCollect("crystal")} />
      ))}
      <ShipPlayer
        ref={playerRef}
        onPositionUpdate={(x, y, z) => { playerZRef.current = z; onPosition(z); }}
        getPlayer={getPlayer}
        getHazards={() => hazardsRef.current}
        paused={paused}
        speed={baseSpeed}
        onHazardHit={() => { shakeRef.current = 0.7; cameraShakeRef.current = 0.5; onHazard(); }}
      />
      <FollowCamera targetRef={playerRef} shakeRef={shakeRef} speedRef={speedRef} />
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
