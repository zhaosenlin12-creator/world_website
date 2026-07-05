"use client";
import { useRef, useEffect, useMemo, useCallback, forwardRef, useImperativeHandle, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Clone, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { planetAssetCatalog, shipAssetCatalog } from "@/lib/play/assetCatalog";
import {
  computeTargetPlanetState,
  createFlightHazards,
  createFlightOrbs,
  getDescentSpeed,
  getFlightCompleteZ,
  getLandingTriggerZ,
} from "@/lib/play/descentFlight";
import { missionData } from "@/lib/play/missionData";

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
  { id: "sun", name: "太阳", texture: planetAssetCatalog.sun.texture, radius: 3.5, distance: planetAssetCatalog.sun.distance, speed: 0, rotation: 0.04, emissive: true, glow: "#fbbf24", initialAngle: planetAssetCatalog.sun.initialAngle },
  { id: "mercury", name: "水星", texture: planetAssetCatalog.mercury.texture, radius: 0.55, distance: planetAssetCatalog.mercury.distance, speed: 0.32, rotation: 0.02, glow: "#a8a29e", biome: "void", collectible: "crystal", sky: "#0a0a18", ground: "#737373", accent: "#a8a29e", initialAngle: planetAssetCatalog.mercury.initialAngle },
  { id: "venus", name: "金星", texture: planetAssetCatalog.venus.texture, radius: 0.75, distance: planetAssetCatalog.venus.distance, speed: 0.26, rotation: 0.01, glow: "#fb923c", biome: "lava", collectible: "ruby", sky: "#3a0d04", ground: "#9a3412", accent: "#fb923c", initialAngle: planetAssetCatalog.venus.initialAngle },
  { id: "earth", name: "地球", texture: planetAssetCatalog.earth.texture, radius: 0.85, distance: planetAssetCatalog.earth.distance, speed: 0.22, rotation: 0.04, glow: "#3b82f6", biome: "green", collectible: "apple", sky: "#0c1d3a", ground: "#0e3b5c", accent: "#22d3ee", initialAngle: planetAssetCatalog.earth.initialAngle },
  { id: "mars", name: "火星", texture: planetAssetCatalog.mars.texture, radius: 0.7, distance: planetAssetCatalog.mars.distance, speed: 0.18, rotation: 0.038, glow: "#dc2626", biome: "sand", collectible: "ankh", sky: "#1c0608", ground: "#5c1a08", accent: "#f97316", initialAngle: planetAssetCatalog.mars.initialAngle },
  { id: "jupiter", name: "木星", texture: planetAssetCatalog.jupiter.texture, radius: 1.7, distance: planetAssetCatalog.jupiter.distance, speed: 0.12, rotation: 0.08, glow: "#fbbf24", biome: "gas", collectible: "star", sky: "#0a0815", ground: "#1e1b4b", accent: "#a78bfa", initialAngle: planetAssetCatalog.jupiter.initialAngle },
  { id: "saturn", name: "土星", texture: planetAssetCatalog.saturn.texture, radius: 1.5, distance: planetAssetCatalog.saturn.distance, speed: 0.1, rotation: 0.07, glow: "#fbbf24", hasRing: true, ringInner: 1.9, ringOuter: 2.7, biome: "ice", collectible: "crystal", sky: "#1a1407", ground: "#3a2c10", accent: "#fde68a", ringColor: "#e7c98a", initialAngle: planetAssetCatalog.saturn.initialAngle },
  { id: "uranus", name: "天王星", texture: planetAssetCatalog.uranus.texture, radius: 1.1, distance: planetAssetCatalog.uranus.distance, speed: 0.08, rotation: 0.06, glow: "#22d3ee", biome: "cloud", collectible: "star", sky: "#042029", ground: "#0a3a45", accent: "#67e8f9", initialAngle: planetAssetCatalog.uranus.initialAngle },
  { id: "neptune", name: "海王星", texture: planetAssetCatalog.neptune.texture, radius: 1.05, distance: planetAssetCatalog.neptune.distance, speed: 0.07, rotation: 0.055, glow: "#3b82f6", biome: "crystal", collectible: "ruby", sky: "#070b25", ground: "#101a4d", accent: "#818cf8", initialAngle: planetAssetCatalog.neptune.initialAngle }
];

// 杩滄櫙鏄熺┖ (闈欐€?
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

// 楂橀€熸祦鏄熺┖: 绮掑瓙娌?z 杞撮珮閫熷啿鍚戠帺瀹? 钀ラ€?WARP 閫熷害鎰?
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

function getOrbitAngle(body: Body, elapsedTime: number) {
  return (body.initialAngle ?? 0) + elapsedTime * body.speed;
}

function getOrbitPosition(body: Body, elapsedTime: number) {
  const angle = getOrbitAngle(body, elapsedTime);
  return {
    x: Math.cos(angle) * body.distance,
    z: Math.sin(angle) * body.distance,
  };
}

function tuneAssetMaterial(material: THREE.Material) {
  const maybeStandard = material as THREE.MeshStandardMaterial;
  if ("roughness" in maybeStandard) maybeStandard.roughness = Math.max(maybeStandard.roughness ?? 0.4, 0.42);
  if ("metalness" in maybeStandard) maybeStandard.metalness = Math.max(maybeStandard.metalness ?? 0, 0.18);
  if ("envMapIntensity" in maybeStandard) maybeStandard.envMapIntensity = 1.2;
  material.needsUpdate = true;
}

function usePreparedGlb(url: string, targetSize: number) {
  const gltf = useGLTF(url);
  return useMemo(() => {
    const root = gltf.scene.clone(true);
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;

    root.position.sub(center);
    root.scale.setScalar(targetSize / maxDim);
    root.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        if (Array.isArray(node.material)) node.material.forEach(tuneAssetMaterial);
        else if (node.material) tuneAssetMaterial(node.material);
      }
    });
    return root;
  }, [gltf.scene, targetSize]);
}

// ============ 澶槼绯?(SOLAR) ============
function Sun({ onClick }: { onClick?: () => void }) {
  const ref = useRef<THREE.Mesh>(null!);
  // Procedural sun: 涓嶄緷璧栬创鍥? 绾彂鍏夌悆浣?(sun.jpg 姝ゅ墠璇敤鐏槦杞﹀浘鐗?
  const tex = null;
  useFrame((state) => { if (ref.current) ref.current.rotation.y = state.clock.getElapsedTime() * 0.04; });
  return (
    <group onClick={onClick}>
      <mesh ref={ref}>
        <sphereGeometry args={[3.5, 48, 48]} />
        <meshBasicMaterial map={tex || undefined} color={tex ? "#ffffff" : "#fbbf24"} />
      </mesh>
      <pointLight color="#fbbf24" intensity={2.75} distance={112} decay={1.25} />
      <mesh>
        <sphereGeometry args={[4.2, 32, 32]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.14} side={THREE.BackSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

function NearFieldParticles({ count = 96, speed = 26, color = "#67e8f9" }: { count?: number; speed?: number; color?: string }) {
  const ref = useRef<THREE.Points>(null!);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 26;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 16;
      arr[i * 3 + 2] = -Math.random() * 120;
    }
    return arr;
  }, [count]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    const pos = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const base = i * 3;
      arr[base] += Math.sin(t * 0.8 + i * 0.37) * delta * 0.7;
      arr[base + 1] += Math.cos(t * 0.65 + i * 0.21) * delta * 0.45;
      arr[base + 2] += speed * delta * (0.9 + (i % 5) * 0.06);

      if (arr[base + 2] > 12) {
        arr[base] = (Math.random() - 0.5) * 26;
        arr[base + 1] = (Math.random() - 0.5) * 16;
        arr[base + 2] = -90 - Math.random() * 40;
      }
    }

    pos.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={0.18}
        sizeAttenuation
        transparent
        opacity={0.34}
        depthWrite={false}
        toneMapped={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function Planet({ body, angle, onClick, highlight }: { body: Body; angle: number; onClick?: () => void; highlight?: boolean }) {
  const pRef = useRef<THREE.Mesh>(null!);
  const gRef = useRef<THREE.Group>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);
  const tex = useMemo(() => loadTex(body.texture), [body.texture]);
  const ringTex = useMemo(() => body.hasRing ? loadTex(planetAssetCatalog.saturn.ringTexture || "/assets/textures/saturn_ring.jpg") : null, [body.hasRing]);
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
  const haloRef = useRef<THREE.Mesh>(null!);
  const bankRef = useRef<number>(0);
  const target = BODIES.find((b) => b.id === targetId);
  const accent = (target?.accent as string) || shipAssetCatalog.hullAccentColor;
  const hull = new THREE.Color(shipAssetCatalog.hullBaseColor);
  const accentCol = new THREE.Color(accent);

  useFrame((state, delta) => {
    if (!sRef.current) return;
    const t = state.clock.getElapsedTime();
    if (target && target.distance > 0) {
      const { x: tx, z: tz } = getOrbitPosition(target, t);
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
    if (haloRef.current) {
      const hs = 1 + Math.sin(t * 6) * 0.08;
      haloRef.current.scale.set(hs, hs, hs);
    }
    // 微幅 bank 倾斜，让飞行更有动感
    bankRef.current = THREE.MathUtils.lerp(bankRef.current, Math.sin(t * 1.4) * 0.18, 0.08);
    sRef.current.rotation.z = bankRef.current;
  });

  return (
    <group ref={sRef}>
      {/* 主船体：模块化 PBR 飞船（不用 GLB 渲染假模型）
          - 推进舱 (圆柱) + 居住舱 (六棱柱) + 通讯舱 (球) + 太阳能翼
          - 中等光滑 hull + accent 边缘发光 */}
      <group rotation={[0.15, -Math.PI / 2, 0]} position={[0, 0, 0]}>
        {/* 主推进器 */}
        <mesh position={[0, 0, 1.5]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.42, 0.55, 1.4, 24]} />
          <meshStandardMaterial color={hull} metalness={0.55} roughness={0.38} />
        </mesh>
        {/* 主发动机喷口 */}
        <mesh position={[0, 0, 2.32]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.42, 0.12, 16, 32]} />
          <meshStandardMaterial color={accentCol} metalness={0.85} roughness={0.22} emissive={accentCol} emissiveIntensity={0.65} />
        </mesh>
        {/* 居住舱中段 */}
        <mesh position={[0, 0, 0.3]}>
          <cylinderGeometry args={[0.55, 0.55, 1.3, 6]} />
          <meshStandardMaterial color={hull} metalness={0.4} roughness={0.46} />
        </mesh>
        {/* 舷窗环带 */}
        <mesh position={[0, 0, 0.3]}>
          <torusGeometry args={[0.62, 0.04, 12, 36]} />
          <meshStandardMaterial color={accentCol} emissive={accentCol} emissiveIntensity={0.6} roughness={0.3} />
        </mesh>
        {/* 指令舱（圆头）*/}
        <mesh position={[0, 0, -1.05]}>
          <sphereGeometry args={[0.55, 32, 24]} />
          <meshStandardMaterial color={hull} metalness={0.6} roughness={0.32} />
        </mesh>
        {/* 驾驶舱玻璃 */}
        <mesh position={[0, 0.42, -1.05]} scale={[1.02, 0.32, 1.02]}>
          <sphereGeometry args={[0.42, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={"#93c5fd"} emissive={"#93c5fd"} emissiveIntensity={0.5} metalness={0.9} roughness={0.18} transparent opacity={0.85} />
        </mesh>
        {/* 左右太阳能翼 */}
        {[-1, 1].map((side) => (
          <group key={side} position={[side * 1.4, 0, 0.2]} rotation={[0, 0, side * 0.04]}>
            <mesh>
              <boxGeometry args={[1.6, 0.04, 0.9]} />
              <meshStandardMaterial color={"#1e3a8a"} metalness={0.2} roughness={0.32} />
            </mesh>
            {/* 电池格 */}
            {Array.from({ length: 6 }).map((_, i) => (
              <mesh key={i} position={[(i - 2.5) * 0.24, 0.04, 0]}>
                <boxGeometry args={[0.2, 0.02, 0.7]} />
                <meshStandardMaterial color={"#0b1c4d"} metalness={0.4} roughness={0.24} emissive={"#1e3a8a"} emissiveIntensity={0.18} />
              </mesh>
            ))}
            {/* 桅杆 */}
            <mesh position={[-side * 0.6, 0, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.6, 8]} />
              <meshStandardMaterial color={accentCol} metalness={0.7} roughness={0.3} />
            </mesh>
          </group>
        ))}
        {/* 通讯抛物面天线 */}
        <mesh position={[0, 0.55, -1.4]} rotation={[Math.PI / 2, 0.3, 0]}>
          <sphereGeometry args={[0.36, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={"#cbd5e1"} metalness={0.7} roughness={0.45} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.7, -1.4]}>
          <cylinderGeometry args={[0.025, 0.025, 0.5, 8]} />
          <meshStandardMaterial color={accentCol} metalness={0.6} roughness={0.4} />
        </mesh>
        {/* 姿态控制小喷口（4 个） */}
        {[
          [0.7, 0, -0.3, 0],
          [-0.7, 0, -0.3, 0],
          [0, 0.6, 0.4, 0],
          [0, -0.6, 0.4, 0]
        ].map((p, i) => (
          <mesh key={"thruster-" + i} position={p as unknown as [number, number, number]}>
            <sphereGeometry args={[0.12, 12, 10]} />
            <meshStandardMaterial color={accentCol} emissive={accentCol} emissiveIntensity={0.5} />
          </mesh>
        ))}
        {/* 表面高光面板线 */}
        <mesh position={[0, 0.53, 0.3]}>
          <boxGeometry args={[0.02, 0.02, 1.3]} />
          <meshStandardMaterial color={accentCol} emissive={accentCol} emissiveIntensity={0.8} />
        </mesh>
      </group>

      {/* 核心引擎火焰（多层 blending） */}
      <mesh position={[0, 0, 1.0]} rotation={[Math.PI / 2, 0, 0]} ref={flameRef}>
        <coneGeometry args={[0.34, 1.6, 14]} />
        <meshBasicMaterial color={shipAssetCatalog.engineGlow} transparent opacity={0.85} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0, 1.7]} rotation={[Math.PI / 2, 0, 0]} ref={haloRef}>
        <coneGeometry args={[0.22, 1.0, 12]} />
        <meshBasicMaterial color={"#bae6fd"} transparent opacity={0.45} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0, 2.32]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.12, 0.5, 8]} />
        <meshBasicMaterial color={"#ffffff"} transparent opacity={0.35} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      <pointLight color={shipAssetCatalog.engineGlow} intensity={1.05} distance={6} decay={1.4} />
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
      <Stars count={1320} radius={118} />
      {BODIES.filter(b => b.distance > 0).map((b) => (
        <OrbitRing key={"orbit-" + b.id} distance={b.distance} />
      ))}
      <Sun />
      {BODIES.filter((b) => b.id !== "sun").map((b) => {
        const angle = b.initialAngle ?? 0;
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
      const a = t * 0.06;
      const r = 34 + Math.sin(t * 0.2) * 4;
      camera.position.set(Math.cos(a) * r, 12 + Math.sin(t * 0.15) * 3, Math.sin(a) * r);
      camera.lookAt(0, 0, 0);
    } else if (mode === "APPROACH" && targetId) {
      const target = BODIES.find((b) => b.id === targetId);
      if (target) {
        const elapsed = (Date.now() - startTime) / 1000;
        const k = Math.min(1, elapsed / 2.5);
        const { x: tx, z: tz } = getOrbitPosition(target, t);
        const dist = 22 - k * 14;
        const cx = tx + Math.cos(t * 0.4 + 1) * dist * 0.24;
        const cy = 5 - k * 3;
        const cz = tz + Math.sin(t * 0.4 + 1) * dist * 0.24;
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

// ============ WARP 椋炶鍏冲崱 (PLAY) ============

// 琛屾槦: 3 闃舵鍔ㄦ€佹斁澶?
function TargetPlanet({ body, getPlayerZ }: { body: Body; getPlayerZ: () => number }) {
  const groupRef = useRef<THREE.Group>(null!);
  const meshRef = useRef<THREE.Mesh>(null!);
  const atmosRef = useRef<THREE.Mesh>(null!);
  const glowRef = useRef<THREE.Mesh>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);
  const tex = useMemo(() => loadTex(body.texture), [body.texture]);

  useFrame((state) => {
    if (!groupRef.current || !meshRef.current || !atmosRef.current || !glowRef.current) return;

    const view = computeTargetPlanetState(getPlayerZ(), Boolean(body.hasRing));
    const planetMaterial = meshRef.current.material as THREE.MeshStandardMaterial;
    const atmosphereMaterial = atmosRef.current.material as THREE.MeshBasicMaterial;
    const glowMaterial = glowRef.current.material as THREE.MeshBasicMaterial;

    groupRef.current.position.set(view.offsetX, view.offsetY, view.worldZ);
    groupRef.current.scale.setScalar(view.groupScale);
    atmosRef.current.scale.setScalar(view.atmosphereScale);
    glowRef.current.scale.setScalar(view.glowScale);
    atmosphereMaterial.opacity = view.atmosphereOpacity;
    glowMaterial.opacity = view.glowOpacity;
    planetMaterial.emissiveIntensity = 0.08 + view.glowOpacity * 0.2;
    meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.04;

    if (ringRef.current) {
      ringRef.current.scale.setScalar(view.ringScale);
      ringRef.current.rotation.z += 0.0025;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -180]}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[4, 48, 48]} />
        <meshStandardMaterial map={tex || undefined} color={tex ? "#ffffff" : (body.glow || "#475569")} emissive={new THREE.Color(body.glow || "#000")} emissiveIntensity={0.08} roughness={0.9} metalness={0} />
      </mesh>
      <mesh ref={atmosRef}>
        <sphereGeometry args={[4, 32, 32]} />
        <meshBasicMaterial color={body.accent || body.glow || "#22d3ee"} transparent opacity={0.15} side={THREE.BackSide} depthWrite={false} />
      </mesh>
      <mesh ref={glowRef}>
        <sphereGeometry args={[4.4, 32, 32]} />
        <meshBasicMaterial color={body.glow || body.accent || "#22d3ee"} transparent opacity={0.14} side={THREE.BackSide} depthWrite={false} toneMapped={false} blending={THREE.AdditiveBlending} />
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

// 闄ㄧ煶: 鑷浆 + 鐏劙灏捐抗 (鎷栧熬)
function Meteor({ position, scale, kind = "asteroid" }: { position: [number, number, number]; scale: number; kind?: "asteroid" | "debris" | "crystal" }) {
  const ref = useRef<THREE.Group>(null!);
  const trailRef = useRef<THREE.Mesh>(null!);
  const asteroidModel = usePreparedGlb(shipAssetCatalog.hazardModel, 1);
  const baseRotation = useMemo(
    () =>
      new THREE.Euler(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      ),
    []
  );
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
      <group ref={ref} rotation={baseRotation} scale={[scale * 1.65, scale * 1.65, scale * 1.65]}>
        <Clone object={asteroidModel} />
      </group>
      {/* 灏捐抗 (鏈濆悜鐜╁) */}
      <mesh ref={trailRef} position={[0, 0, 2]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[scale * 0.4, scale * 2, 6]} />
        <meshBasicMaterial color="#fb923c" transparent opacity={0.35} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

// 鑳介噺鐞? 澶氬眰鍏夌幆 + 鍐呮牳鏃嬭浆 + 鎺ヨ繎鏃跺彂鍏?+ 鏀堕泦鏃跺脊缂?
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
    // 鐜╁璺濈 < 2.4 鏃跺惛鍏?
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

const ShipPlayer = forwardRef<THREE.Group, { onPositionUpdate: (x: number, y: number, z: number) => void; getPlayer: () => THREE.Vector3 | null; paused: boolean; onHazardHit: () => void; getHazards: () => { x: number; y: number; z: number; hit: boolean }[]; speed: number; envTilt?: number; envWind?: number }>(function ShipPlayer({ onPositionUpdate, getPlayer, paused, onHazardHit, getHazards, speed, envTilt = 0, envWind = 0 }, ref) {
  const innerRef = useRef<THREE.Group | null>(null);
  useImperativeHandle(ref, () => innerRef.current as THREE.Group, []);
  const flameRef = useRef<THREE.Mesh>(null!);
  const flame2Ref = useRef<THREE.Mesh>(null!);
  const trailRef = useRef<THREE.Mesh>(null!);
  const shipModel = usePreparedGlb(shipAssetCatalog.cruiseModel, 1.9);
  const hitCountRef = useRef(0); // 鎾炲嚮娆℃暟, 瑙﹀彂鍐插嚮娉㈠姩鐢?
  const keysRef = useRef<Record<string, boolean>>({});
  const velRef = useRef({ x: 0, y: 0 });
  const lastReportRef = useRef(0);
  const lastHazardTRef = useRef(0); // 鎾炲嚮鑺傛祦, 閬垮厤缁堢偣鍓嶈繛缁彯鍙搷

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
    // 4 鍚?+ 闃诲凹
    const accel = 22;
    if (k["a"] || k["arrowleft"]) velRef.current.x -= accel * delta;
    else if (k["d"] || k["arrowright"]) velRef.current.x += accel * delta;
    else velRef.current.x *= 0.92;
    if (k["w"] || k["arrowup"]) velRef.current.y += accel * delta;
    else if (k["s"] || k["arrowdown"]) velRef.current.y -= accel * delta;
    else velRef.current.y *= 0.92;
    velRef.current.x = Math.max(-9, Math.min(9, velRef.current.x));
    velRef.current.y = Math.max(-7, Math.min(7, velRef.current.y));
    // 行星环境的 wind 推动飞船偏移 + tilt 倾斜
    const windX = Math.sin(state.clock.getElapsedTime() * 0.6) * envWind * 0.45;
    innerRef.current.position.x = Math.max(-6, Math.min(6, innerRef.current.position.x + velRef.current.x * delta + windX * delta));
    innerRef.current.position.y = Math.max(-4, Math.min(4, innerRef.current.position.y + velRef.current.y * delta));
    // roll 持续叠加 tilt
    innerRef.current.rotation.z += envTilt * delta * 0.6;
    // 楂橀€熷墠杩?(z 瓒呰繃 -300 瑙﹀彂 onLandingStart, 缁х画椋炲埌 -380 閿佷綇, 閬垮厤鍗犵敤 GPU)
    if (innerRef.current.position.z > getFlightCompleteZ() - 20) {
      innerRef.current.position.z -= speed * delta;
    } else {
      innerRef.current.position.z = getFlightCompleteZ() - 20;
    }
    // 鍊炬枩 (roll + pitch)
    const rollTarget = -velRef.current.x * 0.05;
    innerRef.current.rotation.z += (rollTarget - innerRef.current.rotation.z) * 0.15;
    const pitchTarget = velRef.current.y * 0.04;
    innerRef.current.rotation.x += (pitchTarget - innerRef.current.rotation.x) * 0.15;
    // 鐏劙 (寮哄害璺熼€熷害鑱斿姩)
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
    // 纰版挒 (鐞冨舰, r=0.7) + 缁堢偣瀹堝崼 + 鑺傛祦: 閬垮厤缁堢偣鍓嶅悗杩炲嚮浜х敓杩炵画鍙彯鍝?
    const px = innerRef.current.position;
    // 宸茶繃缁堢偣 (z < -200) 涓嶅啀瑙﹀彂鎾炲嚮, 闃叉 onComplete 寮傛鍒锋柊 paused 鏈熼棿杩炵画鍛戒腑
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
          // 鎾炲嚮鑺傛祦 220ms: 闃叉瀵嗛泦 hazard 鍖哄揩閫熻繛鍑?
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
      <group rotation={[0.22, -Math.PI / 2, 0]} position={[0, -0.08, 0.18]}>
        <Clone object={shipModel} />
      </group>
      <mesh position={[0, -0.06, 0.26]}>
        <sphereGeometry args={[0.2, 18, 18]} />
        <meshBasicMaterial color={shipAssetCatalog.cockpitGlow} transparent opacity={0.75} toneMapped={false} />
      </mesh>
      {/* 涓荤伀鐒?*/}
      <mesh position={[0, -0.03, 1.1]} rotation={[-Math.PI / 2, 0, 0]} ref={flameRef}>
        <coneGeometry args={[0.2, 1.5, 10]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.9} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* 渚х考鐏劙 */}
      <mesh position={[0.28, 0.1, 0.82]} rotation={[-Math.PI / 2, 0.25, 0]} ref={flame2Ref}>
        <coneGeometry args={[0.08, 0.82, 6]} />
        <meshBasicMaterial color="#a855f7" transparent opacity={0.85} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* 闀垮熬杩?*/}
      <mesh position={[0, -0.04, 2]} rotation={[-Math.PI / 2, 0, 0]} ref={trailRef}>
        <coneGeometry args={[0.12, 2.7, 8]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.22} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <pointLight color="#22d3ee" intensity={1.1} distance={6.5} decay={1.35} />
      <Shockwave active={hitCountRef.current} />
    </group>
  );
});

// 璺熼殢鐩告満: 绗笁浜虹О + 鎾炲嚮鎶栧姩, 鎶栧姩閫氳繃鐩告満鍋忕Щ瀹炵幇 (涓嶇牬鍧忛鑸圭墿鐞?
function FollowCamera({ targetRef, shakeRef, speedRef }: { targetRef: React.MutableRefObject<THREE.Group | null>; shakeRef?: React.MutableRefObject<number>; speedRef?: React.MutableRefObject<number> }) {
  const { camera } = useThree();
  const lastTargetRef = useRef(new THREE.Vector3());
  const velocityRef = useRef(new THREE.Vector3());
  const baseFov = 66;
  useFrame((state, delta) => {
    if (!targetRef.current) return;
    const p = targetRef.current.position;
    if (lastTargetRef.current.lengthSq() === 0) lastTargetRef.current.copy(p);
    velocityRef.current.copy(p).sub(lastTargetRef.current).divideScalar(Math.max(delta, 0.001));
    lastTargetRef.current.copy(p);

    const depth = THREE.MathUtils.clamp((-p.z) / 380, 0, 1);
    const speedFactor = speedRef ? THREE.MathUtils.clamp(speedRef.current / 28, 0, 1) : 0;
    const leadX = THREE.MathUtils.clamp(velocityRef.current.x * 0.08, -1.15, 1.15);
    const leadY = THREE.MathUtils.clamp(velocityRef.current.y * 0.05, -0.8, 0.8);
    const baseX = p.x * 0.18 - leadX * 0.85;
    const baseY = p.y * 0.28 + THREE.MathUtils.lerp(2.85, 1.35, depth) - leadY * 0.25;
    const baseZ = p.z + THREE.MathUtils.lerp(6.8, 4.15, depth) + Math.sin(state.clock.getElapsedTime() * (1.4 + speedFactor)) * 0.08;
    let sx = 0, sy = 0, sz = 0;
    if (shakeRef && shakeRef.current > 0) {
      const s = shakeRef.current;
      const t = state.clock.getElapsedTime() * 60;
      sx = (Math.sin(t * 1.7) + Math.cos(t * 2.3)) * s * 0.4;
      sy = (Math.sin(t * 2.1) + Math.cos(t * 1.3)) * s * 0.4;
      sz = Math.sin(t * 1.9) * s * 0.2;
    }
    camera.position.lerp(new THREE.Vector3(baseX + sx, baseY + sy, baseZ + sz), 0.09 + speedFactor * 0.05);
    camera.lookAt(
      p.x * 0.34 + leadX * 0.7,
      p.y * 0.18 + leadY * 0.45,
      p.z - THREE.MathUtils.lerp(13, 21, Math.min(1, depth * 0.5 + speedFactor * 0.75))
    );
    const targetFov = baseFov + (speedRef ? Math.min(speedRef.current * 0.46, 18) : 0) + depth * 4.5;
    if ("fov" in camera) {
      (camera as THREE.PerspectiveCamera).fov += (targetFov - (camera as THREE.PerspectiveCamera).fov) * 0.06;
      (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
    }
  });
  return null;
}

// 鎾炲嚮鍐插嚮娉? 鐭殏鎵╂暎鐨勫彂鍏夌幆, 缁欑帺瀹跺己鐑?鎾炲埌浜?鍙嶉
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

function Level({ planetId, paused, onCollect, onHazard, onComplete, onPosition, onLandingStart }: { planetId: PlanetId; paused: boolean; onCollect: (kind: string) => void; onHazard: () => void; onComplete: () => void; onPosition: (z: number) => void; onLandingStart?: () => void }) {
  const body = BODIES.find((b) => b.id === planetId) as Body;
  const env = missionData[planetId]?.environment;
  const envColor = env?.atmosphereColor ?? body.accent ?? "#22d3ee";
  const envTilt = env?.tilt ?? 0;
  const envWind = env?.wind ?? 0;
  const playerRef = useRef<THREE.Group | null>(null);
  const playerZRef = useRef(0);
  const shakeRef = useRef(0);
  const completedRef = useRef(false);
  const landingTriggeredRef = useRef(false);
  const cameraShakeRef = useRef(0);
  const speedRef = useRef(18); // 褰撳墠闃舵閫熷害, 缁欑浉鏈?FOV 鐢?

  // 澶氭牱鍖栭殰纰嶅竷灞€: 鍗曢櫒鐭?/ 闄ㄧ煶瀵?/ 閿欎綅涓夎繛, 鐜╁闇€鐏垫椿绌挎
  const allHazards = useMemo(() => createFlightHazards(planetId), [planetId]);

  // 鑳介噺鐞? 濮嬬粓鍦?3 lane 涓ぎ, 闂撮殧杩?
  const allOrbs = useMemo(() => createFlightOrbs(planetId), [planetId]);

  const hazardsRef = useRef(allHazards);
  const orbsRef = useRef(allOrbs);

  useEffect(() => {
    hazardsRef.current = allHazards.map((h) => ({ ...h, hit: false }));
    orbsRef.current = allOrbs.map((o) => ({ ...o, collected: false }));
    completedRef.current = false;
    landingTriggeredRef.current = false;
    shakeRef.current = 0;
  }, [allHazards, allOrbs]);

  const getPlayer = useCallback(() => playerRef.current ? playerRef.current.position : null, []);

  // 閫熷害鎸夐樁娈? WARP 18, APPROACH 26, ENTRY 34 (鎻愬崌绌胯秺鎰?
  const playerSpeed = useCallback(() => {
    return getDescentSpeed(playerZRef.current);
  }, []);

  // 鍚屾褰撳墠閫熷害鍒?speedRef, 缁欑浉鏈虹敤
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
    if (p.z < getLandingTriggerZ() && !landingTriggeredRef.current && onLandingStart) { landingTriggeredRef.current = true; onLandingStart(); }
    if (p.z < getFlightCompleteZ() && !paused && !completedRef.current) {
      completedRef.current = true;
      onComplete();
    }
    // 鎾炲嚮闇囧姩: 浠呰褰曞己搴? 鐢?FollowCamera 璇诲彇鍚庡仛鐩告満鎶栧姩, 涓嶅啀鐩存帴淇敼椋炶埞鍧愭爣 (閬垮厤鐮村潖鐗╃悊)
    if (shakeRef.current > 0) {
      shakeRef.current = Math.max(0, shakeRef.current - delta * 2.5);
    }
  });

  const accent = body.accent || body.glow || "#22d3ee";
  const baseSpeed = playerSpeed();
  const envMissionspeed = (env?.hazardSpeed ?? 1) * baseSpeed;

  return (
    <group>
      <ambientLight intensity={0.42} color={envColor} />
      <directionalLight position={[5, 12, 8]} intensity={0.95} color="#ffffff" />
      <pointLight position={[0, 0, -100]} intensity={2.5} color={envColor} distance={60} />
      <pointLight position={[0, 6, -120]} intensity={3.2} color={envColor} distance={50} />
      <fog attach="fog" args={[envColor, 38, 220]} />
      <mesh renderOrder={-2}>
        <sphereGeometry args={[220, 32, 32]} />
        <meshBasicMaterial color={body.sky || "#02010a"} side={THREE.BackSide} depthWrite={false} />
      </mesh>
      <Stars count={220} radius={80} />
      <WarpStars count={Math.max(160, Math.min(360, Math.round(280 * (env?.hazardSpeed ?? 1))))} speed={envMissionspeed * 4.6} />
      <NearFieldParticles count={Math.max(40, Math.round(60 + 32 * (env?.wind ?? 0.4)))} speed={envMissionspeed * 1.4} color={envColor} />
      <EnvEffects env={env} />
      <TargetPlanet body={body} getPlayerZ={() => playerZRef.current} />
      {allHazards.map((h, i) => (
        <Meteor key={"h" + i} position={[h.x, h.y, h.z]} scale={h.size} kind={(["asteroid","debris","crystal"] as const)[i % 3]} />
      ))}
      {allOrbs.map((o, i) => (
        <EnergyOrb key={"o" + i} position={[o.x, o.y, o.z]} color={envColor}
          getPlayer={getPlayer}
          onCollect={() => onCollect("crystal")} />
      ))}
      <ShipPlayer
        ref={playerRef}
        envTilt={envTilt}
        envWind={envWind}
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

function EnvEffects({ env }: { env: import("@/lib/play/missionData").EnvironmentTuning | undefined }) {
  const dustPoints = useMemo(() => {
    const arr: Array<[number, number, number]> = [];
    for (let i = 0; i < 220; i++) {
      arr.push([(Math.random() - 0.5) * 60, (Math.random() - 0.5) * 24, -40 - Math.random() * 180]);
    }
    return arr;
  }, []);
  const ringDebris = useMemo(() => {
    const arr: Array<[number, number, number]> = [];
    for (let i = 0; i < 180; i++) {
      arr.push([(Math.random() - 0.5) * 28, (Math.random() - 0.5) * 4, -60 - Math.random() * 120]);
    }
    return arr;
  }, []);
  const spotRef = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    if (spotRef.current && env?.missionType === "gravitySlingshot") {
      spotRef.current.rotation.z = state.clock.getElapsedTime() * 0.8;
    }
  });
  if (!env) return null;
  if (env.missionType === "dustCrossing") {
    return (
      <>
        {dustPoints.map((p, i) => (
          <mesh key={"dust-" + i} position={p}>
            <sphereGeometry args={[0.04 + (i % 7) * 0.012, 6, 6]} />
            <meshBasicMaterial color={"#fb923c"} transparent opacity={0.22} depthWrite={false} />
          </mesh>
        ))}
      </>
    );
  }
  if (env.missionType === "ringTraversal") {
    return (
      <>
        {ringDebris.map((p, i) => (
          <mesh key={"ring-" + i} position={p}>
            <icosahedronGeometry args={[0.05 + (i % 6) * 0.018, 0]} />
            <meshStandardMaterial color={"#fde68a"} emissive={"#fde68a"} emissiveIntensity={0.45} transparent opacity={0.85} />
          </mesh>
        ))}
      </>
    );
  }
  if (env.missionType === "atmosphericDrill") {
    return (
      <>
        {[-40, -70, -110, -150].map((z, i) => (
          <mesh key={"vapor-" + i} position={[0, -2, z]}>
            <planeGeometry args={[60, 6]} />
            <meshBasicMaterial color={"#65a30d"} transparent opacity={0.14} depthWrite={false} />
          </mesh>
        ))}
      </>
    );
  }
  if (env.missionType === "gravitySlingshot") {
    return (
      <mesh ref={spotRef} position={[0, 0, -160]}>
        <ringGeometry args={[8, 14, 64]} />
        <meshBasicMaterial color={"#fbbf24"} transparent opacity={0.16} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    );
  }
  if (env.missionType === "windRun") {
    return (
      <>
        {[-30, -65, -110, -150, -190].map((z, i) => (
          <mesh key={"wind-" + i} position={[0, 0, z]}>
            <planeGeometry args={[64, 0.4]} />
            <meshBasicMaterial color={"#60a5fa"} transparent opacity={0.2} depthWrite={false} />
          </mesh>
        ))}
      </>
    );
  }
  if (env.missionType === "thermalSurvey") {
    return (
      <>
        {[-40, -90, -140].map((z, i) => (
          <mesh key={"heat-" + i} position={[0, 0, z]}>
            <planeGeometry args={[50, 12]} />
            <meshBasicMaterial color={"#fb923c"} transparent opacity={0.18} depthWrite={false} />
          </mesh>
        ))}
      </>
    );
  }
  if (env.missionType === "orbitalScan") {
    return (
      <>
        {[-50, -90, -140, -190].map((z, i) => (
          <group key={"satellite-" + i} position={[Math.sin(i) * 6, Math.cos(i) * 3, z]}>
            <mesh>
              <boxGeometry args={[0.6, 0.18, 0.32]} />
              <meshStandardMaterial color={"#94a3b8"} metalness={0.4} roughness={0.5} />
            </mesh>
            <mesh position={[0.5, 0, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 1, 8]} />
              <meshStandardMaterial color={"#fb923c"} emissive={"#fb923c"} emissiveIntensity={0.5} />
            </mesh>
            <pointLight color={"#38bdf8"} intensity={0.6} distance={4} decay={2} />
          </group>
        ))}
      </>
    );
  }
  if (env.missionType === "rollLanding") {
    return (
      <group rotation={[env.tilt, 0, 0]}>
        <mesh position={[0, 8, -130]}>
          <torusGeometry args={[18, 0.06, 8, 64]} />
          <meshBasicMaterial color={"#22d3ee"} transparent opacity={0.22} toneMapped={false} />
        </mesh>
      </group>
    );
  }
  return null;
}

useGLTF.preload(shipAssetCatalog.cruiseModel);
useGLTF.preload(shipAssetCatalog.hazardModel);

export type GameWorldHandle = { setSelected: (id: string | null) => void };

type Scene =
  | "INTRO"
  | "SOLAR_IDLE"
  | "MISSION_CONFIRM"
  | "APPROACH"
  | "DESCENT"
  | "SURFACE"
  | "QUIZ"
  | "FINISHED";

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
  onLandingStart?: () => void;
}>((function GameWorld({ scene, targetId, onPlanetClick, startTime, shields = 100, paused = false, onCollect, onHazard, onComplete, onPosition, onLandingStart }, ref) {
  useImperativeHandle(ref, () => ({ setSelected: () => {} }));
  return (
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 2, 6], fov: 65, near: 0.1, far: 500 }} gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }} shadows={false}>
      <Suspense fallback={null}>
        {(scene === "INTRO" || scene === "SOLAR_IDLE" || scene === "MISSION_CONFIRM" || scene === "APPROACH") && (
          <>
            <SolarSystem targetId={targetId} onPlanetClick={onPlanetClick} />
            <SolarCamera targetId={targetId} mode={scene === "APPROACH" ? "APPROACH" : "CRUISE"} startTime={startTime} />
          </>
        )}
        {(scene === "DESCENT" || scene === "SURFACE" || scene === "QUIZ") && targetId && (
          <Level
            planetId={targetId}
            paused={paused}
            onCollect={(kind) => onCollect && onCollect(kind)}
            onHazard={() => onHazard && onHazard()}
            onComplete={() => onComplete && onComplete()}
            onPosition={(z) => onPosition && onPosition(z)}
            onLandingStart={() => onLandingStart && onLandingStart()}
          />
        )}
      </Suspense>
    </Canvas>
  );
}));

