"use client";
import { useRef, useState, useEffect, useMemo, useCallback, forwardRef, useImperativeHandle, Suspense } from "react";
import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
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
};

export const BODIES: Body[] = [
  { id: "sun", name: "太阳", texture: "/assets/textures/sun.jpg", radius: 3.5, distance: 0, speed: 0, rotation: 0.04, emissive: true, glow: "#fbbf24" },
  { id: "mercury", name: "水星", texture: "/assets/textures/mercury.jpg", radius: 0.55, distance: 7, speed: 0.32, rotation: 0.02, glow: "#a8a29e", biome: "void", collectible: "crystal", sky: "#1a1a2e", ground: "#78716c" },
  { id: "venus", name: "金星", texture: "/assets/textures/venus.jpg", radius: 0.75, distance: 10, speed: 0.26, rotation: 0.01, glow: "#fbbf24", biome: "lava", collectible: "ruby", sky: "#7c2d12", ground: "#a16207" },
  { id: "earth", name: "地球", texture: "/assets/textures/earth.jpg", radius: 0.85, distance: 13, speed: 0.22, rotation: 0.04, glow: "#3b82f6", biome: "green", collectible: "apple", sky: "#1e3a8a", ground: "#10b981" },
  { id: "mars", name: "火星", texture: "/assets/textures/mars.jpg", radius: 0.7, distance: 16, speed: 0.18, rotation: 0.038, glow: "#dc2626", biome: "sand", collectible: "ankh", sky: "#7c2d12", ground: "#ea580c" },
  { id: "jupiter", name: "木星", texture: "/assets/textures/jupiter.jpg", radius: 1.7, distance: 22, speed: 0.12, rotation: 0.08, glow: "#fbbf24", biome: "gas", collectible: "star", sky: "#1e1b4b", ground: "#a16207" },
  { id: "saturn", name: "土星", texture: "/assets/textures/saturn.jpg", radius: 1.5, distance: 28, speed: 0.1, rotation: 0.07, glow: "#fbbf24", hasRing: true, ringInner: 1.9, ringOuter: 2.7, biome: "ice", collectible: "crystal", sky: "#854d0e", ground: "#fbbf24" },
  { id: "uranus", name: "天王星", texture: "/assets/textures/uranus.jpg", radius: 1.1, distance: 34, speed: 0.08, rotation: 0.06, glow: "#22d3ee", biome: "cloud", collectible: "star", sky: "#0e7490", ground: "#67e8f9" },
  { id: "neptune", name: "海王星", texture: "/assets/textures/neptune.webp", radius: 1.05, distance: 40, speed: 0.07, rotation: 0.055, glow: "#3b82f6", biome: "crystal", collectible: "ruby", sky: "#1e3a8a", ground: "#6366f1" }
];

function Stars({ count = 1500, radius = 120 }: { count?: number; radius?: number }) {
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
  useFrame((state) => { if (ref.current) ref.current.rotation.y = state.clock.getElapsedTime() * 0.005; });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#ffffff" size={0.35} sizeAttenuation transparent opacity={0.85} depthWrite={false} />
    </points>
  );
}

function Block({ position, size = 2, color, texture, height = 0.6, emissive }: { position: [number, number, number]; size?: number; color: string; texture?: THREE.Texture; height?: number; emissive?: string }) {
  return (
    <mesh position={[position[0], position[1] + height / 2, position[2]]} receiveShadow castShadow>
      <boxGeometry args={[size, height, size]} />
      <meshStandardMaterial color={color} map={texture || undefined} emissive={emissive ? new THREE.Color(emissive) : new THREE.Color("#000")} emissiveIntensity={emissive ? 0.4 : 0} roughness={0.7} metalness={0.15} />
    </mesh>
  );
}

function Hazard({ position, size = 0.7 }: { position: [number, number, number]; size?: number }) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((state, delta) => { if (ref.current) { ref.current.rotation.x += delta; ref.current.rotation.y += delta * 0.7; ref.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() * 1.5) * 0.15; } });
  return (
    <group position={position}>
      <mesh ref={ref} castShadow>
        <dodecahedronGeometry args={[size, 0]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.8} roughness={0.5} metalness={0.2} toneMapped={false} />
      </mesh>
      <pointLight color="#ef4444" intensity={0.5} distance={2.5} />
    </group>
  );
}

function Collectible({ position, kind, onCollect }: { position: [number, number, number]; kind: "star" | "crystal" | "ankh" | "ruby" | "apple"; onCollect: () => void }) {
  const ref = useRef<THREE.Mesh>(null!);
  const collectedRef = useRef(false);
  const haloRef = useRef<THREE.Mesh>(null!);
  const colorMap: Record<string, string> = { star: "#fbbf24", crystal: "#22d3ee", ankh: "#a855f7", ruby: "#dc2626", apple: "#10b981" };
  useFrame((state) => {
    if (ref.current && !collectedRef.current) {
      ref.current.rotation.y = state.clock.getElapsedTime() * 2;
      ref.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() * 3) * 0.2;
    }
    if (haloRef.current && !collectedRef.current) {
      haloRef.current.rotation.z = state.clock.getElapsedTime() * 0.5;
    }
  });
  return (
    <group position={position}>
      <mesh ref={haloRef}>
        <ringGeometry args={[0.6, 0.7, 24]} />
        <meshBasicMaterial color={colorMap[kind]} transparent opacity={0.4} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      <mesh
        ref={ref}
        onClick={(e) => { e.stopPropagation(); if (!collectedRef.current) { collectedRef.current = true; ref.current.visible = false; haloRef.current.visible = false; onCollect(); } }}
      >
        <octahedronGeometry args={[0.45, 0]} />
        <meshStandardMaterial color={colorMap[kind]} emissive={colorMap[kind]} emissiveIntensity={1.4} toneMapped={false} transparent opacity={0.95} />
      </mesh>
      <pointLight color={colorMap[kind]} intensity={0.6} distance={3} />
    </group>
  );
}

const Player = forwardRef<THREE.Group, { onPositionUpdate: (x: number, y: number, z: number) => void; onStateChange: (state: { grounded: boolean; dead: boolean }) => void; getBlocksAt: (z: number) => { x: number; y: number }[] }>(function Player({ onPositionUpdate, onStateChange, getBlocksAt }, ref) {
  const flameRef = useRef<THREE.Mesh>(null!);
  const flame2Ref = useRef<THREE.Mesh>(null!);
  const keysRef = useRef<Record<string, boolean>>({});
  const velRef = useRef({ x: 0, y: 0 });
  const groundedRef = useRef(false);
  const lastReportRef = useRef(0);
  const deadRef = useRef(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      keysRef.current[k] = true;
      if ((e.code === "Space" || k === "w" || k === "arrowup") && groundedRef.current && !deadRef.current) {
        velRef.current.y = 12;
        groundedRef.current = false;
      }
    };
    const up = (e: KeyboardEvent) => { keysRef.current[e.key.toLowerCase()] = false; };
    window.addEventListener("keydown", down); window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);

  useFrame((state, delta) => {
    if (!ref.current) return;
    if (deadRef.current) { onStateChange({ grounded: false, dead: true }); return; }
    const t = state.clock.getElapsedTime();
    const k = keysRef.current;
    const speed = 7;
    if (k["a"] || k["arrowleft"]) velRef.current.x = -speed;
    else if (k["d"] || k["arrowright"]) velRef.current.x = speed;
    else velRef.current.x *= 0.7;
    ref.current.position.x = Math.max(-5.5, Math.min(5.5, ref.current.position.x + velRef.current.x * delta));
    ref.current.position.z -= 8 * delta;
    velRef.current.y -= 22 * delta;
    ref.current.position.y += velRef.current.y * delta;
    const blocks = getBlocksAt(ref.current.position.z);
    const px = ref.current.position.x;
    let onBlock = false;
    for (const b of blocks) {
      if (Math.abs(px - b.x) < 0.95) {
        const top = b.y + 0.6 + 0.4;
        if (ref.current.position.y <= top && velRef.current.y <= 0) {
          ref.current.position.y = top;
          velRef.current.y = 0;
          onBlock = true;
        }
      }
    }
    groundedRef.current = onBlock;
    if (ref.current.position.y < -8) {
      deadRef.current = true;
      onStateChange({ grounded: false, dead: true });
    }
    if (Math.abs(velRef.current.x) > 0.5) ref.current.rotation.z -= velRef.current.x * delta * 0.4;
    else ref.current.rotation.z *= 0.85;
    ref.current.position.y += Math.sin(t * 0.7) * 0.01;
    if (flameRef.current) {
      const fs = 1 + Math.sin(t * 22) * 0.3;
      flameRef.current.scale.set(fs, fs * 1.6, fs);
      (flameRef.current.material as THREE.MeshBasicMaterial).opacity = 0.6 + Math.sin(t * 17) * 0.2;
    }
    if (flame2Ref.current) {
      const fs = 0.8 + Math.sin(t * 18 + 1) * 0.3;
      flame2Ref.current.scale.set(fs, fs * 1.4, fs);
    }
    onStateChange({ grounded: groundedRef.current, dead: false });
    if (t - lastReportRef.current > 0.1) {
      lastReportRef.current = t;
      onPositionUpdate(ref.current.position.x, ref.current.position.y, ref.current.position.z);
    }
  });

  return (
    <group ref={ref} position={[0, 1.5, 18]}>
      <mesh castShadow>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color="#e0e7ff" emissive="#a5b4fc" emissiveIntensity={0.5} metalness={0.7} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0, -0.5]} rotation={[Math.PI / 2, 0, 0]} ref={flameRef}>
        <coneGeometry args={[0.2, 0.7, 8]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.85} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh position={[0.15, 0.2, -0.4]} rotation={[Math.PI / 2, 0.2, 0]} ref={flame2Ref}>
        <coneGeometry args={[0.08, 0.4, 6]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.7} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <pointLight color="#22d3ee" intensity={0.6} distance={4} decay={1.5} />
    </group>
  );
});

function FollowCamera({ targetRef, offset = [0, 3.2, 5] }: { targetRef: React.MutableRefObject<THREE.Group | null>; offset?: [number, number, number] }) {
  const { camera } = useThree();
  useFrame(() => {
    if (targetRef.current) {
      const p = targetRef.current.position;
      camera.position.lerp(new THREE.Vector3(p.x + offset[0], p.y + offset[1], p.z + offset[2]), 0.12);
      camera.lookAt(p.x, p.y - 0.3, p.z - 4);
    }
  });
  return null;
}

function Level({ planetId, onCollect, onHazard, onComplete, onPosition }: { planetId: PlanetId; onCollect: (kind: string) => void; onHazard: () => void; onComplete: () => void; onPosition: (z: number) => void }) {
  const body = BODIES.find((b) => b.id === planetId) as Body;
  const playerRef = useRef<THREE.Group | null>(null);
  const blocksRef = useRef<{ x: number; y: number; z: number }[]>([]);
  const hazardsRef = useRef<{ x: number; y: number; z: number; hit: boolean }[]>([]);
  const lastHazardCheck = useRef(0);

  // 在 Level 顶层 load body texture，如果加载失败则不使用
  let bodyTexture: THREE.Texture | undefined;
  try {
    bodyTexture = useLoader(THREE.TextureLoader, body.texture);
  } catch (e) {
    bodyTexture = undefined;
  }
  // 远景行星
  const nextBody = BODIES[(BODIES.findIndex((b) => b.id === planetId) + 1) % BODIES.length] || body;
  let nextTexture: THREE.Texture | undefined;
  try {
    nextTexture = useLoader(THREE.TextureLoader, nextBody.texture);
  } catch (e) {
    nextTexture = undefined;
  }

  const segments = useMemo(() => {
    const segs: { z: number; blocks: { x: number; y: number }[]; hazards: { x: number; y: number }[]; collectibles: { x: number; y: number; kind: "star" | "crystal" | "ankh" | "ruby" | "apple" }[] }[] = [];
    const collectibleKinds: ("star" | "crystal" | "ankh" | "ruby" | "apple")[] = ["star", "crystal", "ankh", "ruby", "apple"];
    for (let i = 0; i < 50; i++) {
      const z = -i * 5;
      const isStart = i < 6;
      const isEnd = i >= 47;
      const blocks: { x: number; y: number }[] = [];
      if (isStart) {
        for (let x = -6; x <= 6; x += 2) blocks.push({ x, y: 0 });
      } else if (isEnd) {
        for (let x = -6; x <= 6; x += 1.5) blocks.push({ x, y: 0 });
      } else {
        const blockCount = 2 + Math.floor(Math.random() * 3);
        const usedX = new Set<number>();
        for (let b = 0; b < blockCount; b++) {
          let x: number;
          do { x = -5 + Math.floor(Math.random() * 6) * 2; } while (usedX.has(x));
          usedX.add(x);
          const yOffset = Math.random() < 0.2 ? 0.6 + Math.random() * 1.4 : 0;
          blocks.push({ x, y: yOffset });
        }
        if (i % 5 === 0) {
          for (let x = -6; x <= 6; x += 2) {
            if (!usedX.has(x)) blocks.push({ x, y: 0 });
          }
        }
      }
      const hazards: { x: number; y: number }[] = [];
      if (!isStart && !isEnd) {
        const hCount = 1 + Math.floor(Math.random() * 2);
        for (let h = 0; h < hCount; h++) {
          hazards.push({ x: -5 + Math.random() * 10, y: 1.5 + Math.random() * 1.0 });
        }
      }
      const collectibles: { x: number; y: number; kind: "star" | "crystal" | "ankh" | "ruby" | "apple" }[] = [];
      if (!isStart) {
        const cCount = 2 + Math.floor(Math.random() * 2);
        for (let c = 0; c < cCount; c++) {
          const kind = c === 0 ? (body.collectible || "crystal") : collectibleKinds[Math.floor(Math.random() * collectibleKinds.length)];
          collectibles.push({ x: -5 + Math.random() * 10, y: 1.5 + Math.random() * 0.5, kind });
        }
      }
      segs.push({ z, blocks, hazards, collectibles });
    }
    return segs;
  }, [body.collectible, planetId]);

  useEffect(() => {
    const allBlocks: { x: number; y: number; z: number }[] = [];
    segments.forEach((seg) => seg.blocks.forEach((b) => allBlocks.push({ x: b.x, y: b.y, z: seg.z })));
    blocksRef.current = allBlocks;
    const allHazards: { x: number; y: number; z: number; hit: boolean }[] = [];
    segments.forEach((seg) => seg.hazards.forEach((h) => allHazards.push({ x: h.x, y: h.y, z: seg.z, hit: false })));
    hazardsRef.current = allHazards;
  }, [segments]);

  const getBlocksAt = useCallback((z: number) => {
    const segZ = Math.round(-z / 5) * 5;
    return blocksRef.current.filter((b) => Math.abs(b.z - segZ) < 0.5);
  }, []);

  useFrame((state, delta) => {
    if (!playerRef.current) return;
    const p = playerRef.current.position;
    onPosition(p.z);
    if (p.z < -240) onComplete();
    if (state.clock.getElapsedTime() - lastHazardCheck.current > 0.1) {
      lastHazardCheck.current = state.clock.getElapsedTime();
      for (const h of hazardsRef.current) {
        if (h.hit) continue;
        const dz = Math.abs(p.z - h.z);
        if (dz < 0.8 && Math.abs(p.x - h.x) < 0.6 && Math.abs(p.y - h.y) < 0.7) {
          h.hit = true;
          onHazard();
        }
      }
    }
  });

  return (
    <group>
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
      {/* 天空背景 */}
      <mesh renderOrder={-1}>
        <sphereGeometry args={[120, 24, 24]} />
        <meshBasicMaterial color={body.sky || "#1a1a2e"} side={THREE.BackSide} depthWrite={false} />
      </mesh>
      <Stars count={1500} radius={120} />
      {/* 远景行星 */}
      {nextTexture && (
        <mesh position={[-30, 8, -80]}>
          <sphereGeometry args={[nextBody.radius * 4, 16, 16]} />
          <meshStandardMaterial map={nextTexture} emissive={nextBody.glow ? new THREE.Color(nextBody.glow) : new THREE.Color("#000")} emissiveIntensity={0.18} roughness={0.9} />
        </mesh>
      )}
      <group>
        {segments.map((seg, i) => (
          <group key={"s" + i} position={[0, 0, seg.z]}>
            {seg.blocks.map((b, j) => (
              <Block key={"b" + i + "_" + j} position={[b.x, b.y, 0]} size={1.9} color={body.ground || "#4b5563"} texture={bodyTexture} height={0.6} />
            ))}
            {seg.hazards.map((h, j) => (
              <Hazard key={"h" + i + "_" + j} position={[h.x, h.y, 0]} size={0.5 + Math.random() * 0.3} />
            ))}
            {seg.collectibles.map((c, j) => (
              <Collectible key={"c" + i + "_" + j} position={[c.x, c.y, 0]} kind={c.kind} onCollect={() => onCollect(c.kind)} />
            ))}
            {i === 49 && (
              <group position={[0, 3, 0]}>
                <mesh>
                  <sphereGeometry args={[1.8, 16, 16]} />
                  <meshStandardMaterial color={body.glow || "#fbbf24"} emissive={body.glow || "#fbbf24"} emissiveIntensity={2} toneMapped={false} />
                </mesh>
                <pointLight color={body.glow || "#fbbf24"} intensity={3} distance={15} />
              </group>
            )}
          </group>
        ))}
      </group>
      <Player ref={playerRef} onPositionUpdate={() => {}} onStateChange={() => {}} getBlocksAt={getBlocksAt} />
      <FollowCamera targetRef={playerRef} offset={[0, 3.2, 5]} />
    </group>
  );
}

export type GameWorldHandle = { setSelected: (id: string | null) => void };

type CameraMode = "INTRO" | "CRUISE" | "APPROACH" | "WARP" | "TUNNEL" | "LANDING" | "CLUE";

export const GameWorld = forwardRef<GameWorldHandle, {
  mode: CameraMode;
  targetId: string | null;
  onApproachComplete?: () => void;
  onPlanetClick?: (id: string) => void;
  onWorldEvent?: (e: { kind: string; payload?: any }) => void;
  startTime: number;
  selectedId: string | null;
  shields?: number;
  onCollect?: (kind: string) => void;
  onHazard?: () => void;
  onComplete?: () => void;
  onPosition?: (z: number) => void;
}>((function GameWorld({ mode, targetId, onApproachComplete, onPlanetClick, onWorldEvent, startTime, selectedId, shields = 100, onCollect, onHazard, onComplete, onPosition }, ref) {
  useImperativeHandle(ref, () => ({ setSelected: () => {} }));
  return (
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 5, 10], fov: 60, near: 0.1, far: 300 }} gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}>
      <Suspense fallback={null}>
        <Level
          planetId={(targetId as PlanetId) || "earth"}
          onCollect={(kind) => onCollect && onCollect(kind)}
          onHazard={() => onHazard && onHazard()}
          onComplete={() => onComplete && onComplete()}
          onPosition={(z) => onPosition && onPosition(z)}
        />
      </Suspense>
    </Canvas>
  );
}));
