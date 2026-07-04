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

// 流动星空 (跑酷场景专用, 粒子向玩家扑面)
function StreamStars({ count = 300, color = "#ffffff" }: { count?: number; color?: string }) {
  const ref = useRef<THREE.Points>(null!);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 60;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 30 + 4;
      arr[i * 3 + 2] = -Math.random() * 200;
    }
    return arr;
  }, [count]);
  useFrame((state, delta) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 2] += 60 * delta;
      if (arr[i * 3 + 2] > 20) arr[i * 3 + 2] -= 200;
    }
    pos.needsUpdate = true;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.18} sizeAttenuation transparent opacity={0.7} depthWrite={false} />
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
        // 相机: 从环绕位置平滑推进到行星表面
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
// 行星表面跑酷关卡 (PLAY)
// ============================================================

// 漂浮的能量平台 — 倒角盒子 + 玻璃质感 + 行星色发光
function CrystalPlatform({ position, scale, color, accent, glow }: { position: [number, number, number]; scale: [number, number, number]; color: string; accent: string; glow: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh receiveShadow castShadow>
        <boxGeometry args={[1, 0.3, 1]} />
        <meshStandardMaterial color={color} emissive={new THREE.Color(accent)} emissiveIntensity={glow} metalness={0.6} roughness={0.25} transparent opacity={0.95} />
      </mesh>
      <mesh position={[0, -0.25, 0]}>
        <boxGeometry args={[0.7, 0.08, 0.7]} />
        <meshBasicMaterial color={accent} transparent opacity={0.6} toneMapped={false} />
      </mesh>
      <pointLight color={accent} intensity={0.4} distance={3.5} decay={1.8} />
    </group>
  );
}

// 太空陨石 — 不规则八面体 + 旋转 + 灰色
function Asteroid({ position, scale }: { position: [number, number, number]; scale: number }) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x += delta * 0.4;
      ref.current.rotation.y += delta * 0.3;
      ref.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() * 1.2) * 0.18;
    }
  });
  return (
    <group position={position}>
      <mesh ref={ref} castShadow>
        <dodecahedronGeometry args={[scale, 0]} />
        <meshStandardMaterial color="#94a3b8" emissive="#dc2626" emissiveIntensity={0.35} roughness={0.85} metalness={0.2} flatShading />
      </mesh>
      <pointLight color="#dc2626" intensity={0.3} distance={2.5} />
    </group>
  );
}

function Collectible({ position, kind, onCollect }: { position: [number, number, number]; kind: string; onCollect: () => void }) {
  const cRef = useRef<THREE.Mesh>(null!);
  const haloRef = useRef<THREE.Mesh>(null!);
  const colorMap: Record<string, string> = { star: "#fbbf24", crystal: "#22d3ee", ankh: "#a855f7", ruby: "#dc2626", apple: "#10b981" };
  useFrame((state) => {
    if (cRef.current) { cRef.current.rotation.y = state.clock.getElapsedTime() * 2; cRef.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() * 3) * 0.25; }
    if (haloRef.current) { haloRef.current.rotation.z = state.clock.getElapsedTime() * 0.5; haloRef.current.scale.setScalar(1 + Math.sin(state.clock.getElapsedTime() * 4) * 0.15); }
  });
  return (
    <group position={position}>
      <mesh ref={haloRef}>
        <ringGeometry args={[0.55, 0.75, 24]} />
        <meshBasicMaterial color={colorMap[kind]} transparent opacity={0.45} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      <mesh ref={cRef} onClick={(e) => { e.stopPropagation(); onCollect(); }}>
        <octahedronGeometry args={[0.45, 0]} />
        <meshStandardMaterial color={colorMap[kind]} emissive={colorMap[kind]} emissiveIntensity={1.8} toneMapped={false} transparent opacity={0.95} />
      </mesh>
      <pointLight color={colorMap[kind]} intensity={0.6} distance={3.5} />
    </group>
  );
}

// 行星地平线 (巨大的弧形, 玩家在低空掠过)
function PlanetHorizon({ body, z }: { body: Body; z: number }) {
  const tex = useMemo(() => loadTex(body.texture), [body.texture]);
  return (
    <group position={[0, -8, z]}>
      <mesh>
        <sphereGeometry args={[80, 32, 32]} />
        <meshStandardMaterial map={tex || undefined} color={tex ? "#ffffff" : (body.glow || "#475569")} roughness={0.95} metalness={0} side={THREE.FrontSide} emissive={new THREE.Color(body.glow || "#000")} emissiveIntensity={0.05} />
      </mesh>
    </group>
  );
}

const Player = forwardRef<THREE.Group, { onPositionUpdate: (x: number, y: number, z: number) => void; onStateChange: (s: { grounded: boolean; dead: boolean }) => void; getBlocksAt: (z: number) => { x: number; y: number; w: number; h: number; d: number; top: number }[]; paused: boolean }>(function Player({ onPositionUpdate, onStateChange, getBlocksAt, paused }, ref) {
  const innerRef = useRef<THREE.Group | null>(null);
  useImperativeHandle(ref, () => innerRef.current as THREE.Group, []);
  const flameRef = useRef<THREE.Mesh>(null!);
  const flame2Ref = useRef<THREE.Mesh>(null!);
  const trailRef = useRef<THREE.Mesh>(null!);
  const keysRef = useRef<Record<string, boolean>>({});
  const velRef = useRef({ x: 0, y: 0 });
  const groundedRef = useRef(false);
  const lastReportRef = useRef(0);
  const deadRef = useRef(false);
  const lastJump = useRef(0);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      keysRef.current[k] = true;
      if (paused || deadRef.current) return;
      const now = performance.now();
      if ((e.code === "Space" || k === "w" || k === "arrowup") && groundedRef.current && (now - lastJump.current) > 220) {
        velRef.current.y = 8.5;
        groundedRef.current = false;
        lastJump.current = now;
      }
    };
    const up = (e: KeyboardEvent) => { keysRef.current[e.key.toLowerCase()] = false; };
    window.addEventListener("keydown", down); window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, [paused]);

  useFrame((state, delta) => {
    if (!innerRef.current) return;
    if (paused) { onStateChange({ grounded: true, dead: false }); return; }
    if (deadRef.current) {
      innerRef.current.position.y -= 4 * delta;
      onStateChange({ grounded: false, dead: true });
      if (innerRef.current.position.y < -10) {
        deadRef.current = false;
        innerRef.current.position.set(0, 1.5, 0);
        velRef.current.x = 0; velRef.current.y = 0;
      }
      return;
    }
    const t = state.clock.getElapsedTime();
    const k = keysRef.current;
    // 横向 WASD
    const speed = 7;
    if (k["a"] || k["arrowleft"]) velRef.current.x = -speed;
    else if (k["d"] || k["arrowright"]) velRef.current.x = speed;
    else velRef.current.x *= 0.7;
    innerRef.current.position.x = Math.max(-6, Math.min(6, innerRef.current.position.x + velRef.current.x * delta));
    // 自动向前推进 (z 负方向)
    innerRef.current.position.z -= 9 * delta;
    // 重力 + 跳跃
    velRef.current.y -= 18 * delta;
    innerRef.current.position.y += velRef.current.y * delta;
    // 落地检测
    const blocks = getBlocksAt(innerRef.current.position.z);
    const px = innerRef.current.position.x;
    let onBlock = false;
    for (const b of blocks) {
      if (Math.abs(px - b.x) < b.w / 2 + 0.3) {
        if (innerRef.current.position.y <= b.top && velRef.current.y <= 0) {
          innerRef.current.position.y = b.top;
          velRef.current.y = 0;
          onBlock = true;
        }
      }
    }
    groundedRef.current = onBlock;
    // 死亡
    if (innerRef.current.position.y < -8) {
      deadRef.current = true;
      onStateChange({ grounded: false, dead: true });
    }
    // 倾斜
    if (Math.abs(velRef.current.x) > 0.5) innerRef.current.rotation.z -= velRef.current.x * delta * 0.4;
    else innerRef.current.rotation.z *= 0.85;
    // 火焰动画
    if (flameRef.current) {
      const fs = 1 + Math.sin(t * 22) * 0.3;
      flameRef.current.scale.set(fs, fs * 1.8, fs);
    }
    if (flame2Ref.current) {
      const fs = 0.8 + Math.sin(t * 18 + 1) * 0.3;
      flame2Ref.current.scale.set(fs, fs * 1.6, fs);
    }
    if (trailRef.current) {
      trailRef.current.scale.z = 1 + Math.sin(t * 12) * 0.15;
    }
    onStateChange({ grounded: groundedRef.current, dead: false });
    if (t - lastReportRef.current > 0.05) {
      lastReportRef.current = t;
      onPositionUpdate(innerRef.current.position.x, innerRef.current.position.y, innerRef.current.position.z);
    }
  });

  return (
    <group ref={innerRef} position={[0, 1.5, 0]}>
      <mesh castShadow>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color="#e0e7ff" emissive="#a5b4fc" emissiveIntensity={0.6} metalness={0.85} roughness={0.15} />
      </mesh>
      {/* 主火焰 */}
      <mesh position={[0, 0, -0.6]} rotation={[Math.PI / 2, 0, 0]} ref={flameRef}>
        <coneGeometry args={[0.22, 0.9, 10]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.9} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* 侧翼火焰 */}
      <mesh position={[0.15, 0.15, -0.5]} rotation={[Math.PI / 2, 0.2, 0]} ref={flame2Ref}>
        <coneGeometry args={[0.1, 0.5, 6]} />
        <meshBasicMaterial color="#a855f7" transparent opacity={0.8} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* 尾迹 */}
      <mesh position={[0, 0, -1.2]} rotation={[Math.PI / 2, 0, 0]} ref={trailRef}>
        <coneGeometry args={[0.12, 1.2, 8]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.3} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <pointLight color="#22d3ee" intensity={0.8} distance={5} decay={1.5} />
    </group>
  );
});

// 第三人称跟随相机 — 距离更近 + 倾斜感
function FollowCamera({ targetRef }: { targetRef: React.MutableRefObject<THREE.Group | null> }) {
  const { camera } = useThree();
  useFrame((state, delta) => {
    if (targetRef.current) {
      const p = targetRef.current.position;
      // 相机在飞船后上方, 强跟随
      const ox = p.x * 0.35;
      const oy = p.y + 2.4;
      const oz = p.z + 5.5;
      camera.position.lerp(new THREE.Vector3(ox, oy, oz), 0.18);
      // 看向飞船前方, 给前进感
      camera.lookAt(p.x * 0.5, p.y + 0.2, p.z - 8);
    }
  });
  return null;
}

function Level({ planetId, paused, onCollect, onHazard, onComplete, onPosition }: { planetId: PlanetId; paused: boolean; onCollect: (kind: string) => void; onHazard: () => void; onComplete: () => void; onPosition: (z: number) => void }) {
  const body = BODIES.find((b) => b.id === planetId) as Body;
  const playerRef = useRef<THREE.Group | null>(null);
  const blocksRef = useRef<{ x: number; y: number; z: number; w: number; h: number; d: number; top: number }[]>([]);
  const hazardsRef = useRef<{ x: number; y: number; z: number; hit: boolean }[]>([]);
  const lastHazardCheck = useRef(0);

  // 程序化关卡 — 50 段, 4m 间距, 难度递增
  const segments = useMemo(() => {
    const segs: { z: number; blocks: { x: number; y: number; w: number; h: number }[]; hazards: { x: number; y: number }[]; collectibles: { x: number; y: number; kind: string }[] }[] = [];
    const collectibleKinds = ["star", "crystal", "ankh", "ruby", "apple"];
    for (let i = 0; i < 50; i++) {
      const z = -i * 4;
      const blocks: { x: number; y: number; w: number; h: number }[] = [];
      const hazards: { x: number; y: number }[] = [];
      const collectibles: { x: number; y: number; kind: string }[] = [];
      const difficulty = Math.min(1, i / 30);
      if (i < 5) {
        // 起点 5 段: 宽平台跑道
        for (let k = -3; k <= 3; k++) blocks.push({ x: k * 1.4, y: 0, w: 1.3, h: 0.3 });
      } else if (i % 7 === 0) {
        // 每 7 段: 4 块安全带
        for (let k = -1; k <= 2; k++) blocks.push({ x: k * 1.6, y: 0, w: 1.5, h: 0.3 });
      } else {
        // 中段: 2-5 块, 高度变化
        const n = 2 + Math.floor(Math.random() * 4);
        for (let k = 0; k < n; k++) {
          blocks.push({
            x: -4 + Math.random() * 8,
            y: Math.random() * (1 + difficulty * 2),
            w: 1.0 + Math.random() * 0.6,
            h: 0.3
          });
        }
        // 危险陨石
        const hCount = 1 + Math.floor(Math.random() * 2 + difficulty);
        for (let k = 0; k < hCount; k++) {
          hazards.push({ x: -4 + Math.random() * 8, y: 1.0 + Math.random() * 1.5 });
        }
      }
      // 收集物
      const cCount = 1 + Math.floor(Math.random() * 2);
      for (let c = 0; c < cCount; c++) {
        const kind = c === 0 ? (body.collectible || "crystal") : collectibleKinds[Math.floor(Math.random() * collectibleKinds.length)];
        collectibles.push({ x: -4.5 + Math.random() * 9, y: 1.5 + Math.random() * 1.5, kind });
      }
      segs.push({ z, blocks, hazards, collectibles });
    }
    return segs;
  }, [body.collectible, planetId]);

  useEffect(() => {
    const allBlocks: { x: number; y: number; z: number; w: number; h: number; d: number; top: number }[] = [];
    segments.forEach((seg) => seg.blocks.forEach((b) => allBlocks.push({ x: b.x, y: b.y, z: seg.z, w: b.w, h: b.h, d: 1.2, top: b.y + b.h / 2 + 0.3 })));
    blocksRef.current = allBlocks;
    const allHazards: { x: number; y: number; z: number; hit: boolean }[] = [];
    segments.forEach((seg) => seg.hazards.forEach((h) => allHazards.push({ x: h.x, y: h.y, z: seg.z, hit: false })));
    hazardsRef.current = allHazards;
  }, [segments]);

  const getBlocksAt = useCallback((z: number) => {
    const segZ = Math.round(-z / 4) * 4;
    return blocksRef.current.filter((b) => Math.abs(b.z - segZ) < 0.5);
  }, []);

  useFrame((state, delta) => {
    if (!playerRef.current) return;
    const p = playerRef.current.position;
    onPosition(p.z);
    if (p.z < -195) onComplete();
    if (state.clock.getElapsedTime() - lastHazardCheck.current > 0.08) {
      lastHazardCheck.current = state.clock.getElapsedTime();
      for (const h of hazardsRef.current) {
        if (h.hit) continue;
        const dz = Math.abs(p.z - h.z);
        if (dz < 0.7 && Math.abs(p.x - h.x) < 0.8 && Math.abs(p.y - h.y) < 0.8) {
          h.hit = true;
          onHazard();
        }
      }
    }
  });

  const accent = body.accent || body.glow || "#22d3ee";
  const ground = body.ground || "#1e293b";

  return (
    <group>
      {/* 环境光: 行星色调弱光 */}
      <ambientLight intensity={0.4} color={body.glow || "#a5b4fc"} />
      <directionalLight position={[5, 12, 8]} intensity={0.9} color="#ffffff" castShadow />
      {/* 行星反射光: 远下方 (从地平线反射上来) */}
      <pointLight position={[0, -6, -8]} intensity={0.8} color={body.glow || "#fbbf24"} distance={40} decay={1.2} />
      <pointLight position={[0, 4, -20]} intensity={0.6} color={accent} distance={30} />
      {/* 天幕 */}
      <mesh renderOrder={-2}>
        <sphereGeometry args={[100, 24, 24]} />
        <meshBasicMaterial color={body.sky || "#02010a"} side={THREE.BackSide} depthWrite={false} />
      </mesh>
      {/* 流动星空 + 远景行星地平线 */}
      <Stars count={400} radius={70} />
      <StreamStars count={200} color={accent} />
      <PlanetHorizon body={body} z={-80} />
      <PlanetHorizon body={body} z={-180} />
      {/* 关卡内容 */}
      {segments.map((seg, i) => (
        <group key={"s" + i} position={[0, 0, seg.z]}>
          {seg.blocks.map((b, j) => (
            <CrystalPlatform key={"b" + i + "_" + j} position={[b.x, b.y, 0]} scale={[b.w, b.h * 1.5, 1.2]} color={ground} accent={accent} glow={0.4} />
          ))}
          {seg.hazards.map((h, j) => (
            <Asteroid key={"h" + i + "_" + j} position={[h.x, h.y, 0]} scale={0.4 + Math.random() * 0.35} />
          ))}
          {seg.collectibles.map((c, j) => (
            <Collectible key={"c" + i + "_" + j} position={[c.x, c.y, 0]} kind={c.kind} onCollect={() => onCollect(c.kind)} />
          ))}
          {i === 49 && (
            <group position={[0, 3, 0]}>
              <mesh>
                <sphereGeometry args={[2.2, 24, 24]} />
                <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={2.5} toneMapped={false} />
              </mesh>
              <pointLight color={accent} intensity={4} distance={20} />
            </group>
          )}
        </group>
      ))}
      <Player ref={playerRef} onPositionUpdate={() => {}} onStateChange={() => {}} getBlocksAt={getBlocksAt} paused={paused} />
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
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 4, 8], fov: 65, near: 0.1, far: 400 }} gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }} shadows={false}>
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
