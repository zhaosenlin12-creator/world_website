"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { Suspense, useMemo, useRef, useState } from "react";
// 圆形星点贴图 (生成一次)
const STAR_TEX_CACHE = (() => {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = 64; c.height = 64;
  const ctx = c.getContext("2d");
  if (!ctx) return null;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.2, "rgba(255,255,255,0.8)");
  g.addColorStop(0.5, "rgba(255,255,255,0.3)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return c;
})();
import * as THREE from "three";

type Body = {
  id: string;
  name: string;
  texture: string;
  radius: number;
  distance: number;
  speed: number;
  tilt: number;
  rotation: number;
  hasRing?: boolean;
  ringInner?: number;
  ringOuter?: number;
  glow?: string;
  emissive?: boolean;
};

const BODIES: Body[] = [
  { id: "sun",     name: "太阳",   texture: "/assets/textures/sun.jpg",     radius: 4.0,  distance: 0,    speed: 0,      tilt: 0.3, rotation: 0.06,  emissive: true },
  { id: "mercury", name: "水星",   texture: "/assets/textures/mercury.jpg", radius: 0.45, distance: 8,    speed: 0.32,   tilt: 0.0, rotation: 0.04 },
  { id: "venus",   name: "金星",   texture: "/assets/textures/venus.jpg",   radius: 0.7,  distance: 11.5, speed: 0.24,   tilt: 0.05, rotation: -0.02, glow: "#eab308" },
  { id: "earth",   name: "地球",   texture: "/assets/textures/earth.jpg",   radius: 0.75, distance: 15,   speed: 0.20,   tilt: 0.23, rotation: 0.5,  glow: "#3b82f6" },
  { id: "mars",    name: "火星",   texture: "/assets/textures/mars.jpg",    radius: 0.55, distance: 19,   speed: 0.16,   tilt: 0.25, rotation: 0.48, glow: "#dc2626" },
  { id: "jupiter", name: "木星",   texture: "/assets/textures/jupiter.jpg", radius: 1.7,  distance: 26,   speed: 0.085,  tilt: 0.06, rotation: 0.85 },
  { id: "saturn",  name: "土星",   texture: "/assets/textures/saturn.jpg",  radius: 1.4,  distance: 32,   speed: 0.062,  tilt: 0.32, rotation: 0.78, hasRing: true, ringInner: 1.8, ringOuter: 2.8 },
  { id: "uranus",  name: "天王星", texture: "/assets/textures/uranus.jpg",  radius: 1.0,  distance: 38,   speed: 0.045,  tilt: 1.4,  rotation: 0.6,  glow: "#22d3ee" },
  { id: "neptune", name: "海王星", texture: "/assets/textures/neptune.webp", radius: 0.95, distance: 44,   speed: 0.035,  tilt: 0.5,  rotation: 0.55, glow: "#1d4ed8" }
];

// 单个行星
function Planet({ body, onClick }: { body: Body; onClick?: (id: string) => void }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const groupRef = useRef<THREE.Group>(null!);
  const atmosphereRef = useRef<THREE.Mesh>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  const texture = useTexture(body.texture);

  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += body.rotation * delta;
    if (atmosphereRef.current) {
      const s = 1 + Math.sin(performance.now() * 0.0015) * 0.02;
      atmosphereRef.current.scale.setScalar(s);
    }
    if (ringRef.current) ringRef.current.rotation.z += 0.02 * delta;
  });

  return (
    <group ref={groupRef} position={[body.distance, 0, 0]}>
      <mesh
        ref={meshRef}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = "auto"; }}
        onClick={(e) => { e.stopPropagation(); onClick?.(body.id); }}
        scale={hovered ? 1.15 : 1}
      >
        <sphereGeometry args={[body.radius, 48, 48]} />
        <meshStandardMaterial
          map={texture}
          emissive={body.emissive ? new THREE.Color("#f59e0b") : new THREE.Color(body.glow || "#222244")}
          emissiveIntensity={body.emissive ? 0.6 : 0.12}
          roughness={0.85}
          metalness={0.05}
        />
      </mesh>

      {!body.emissive && body.glow && (
        <mesh ref={atmosphereRef} scale={1.08}>
          <sphereGeometry args={[body.radius, 32, 32]} />
          <meshBasicMaterial color={body.glow} transparent opacity={0.12} side={THREE.BackSide} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      )}

      {body.hasRing && (
        <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0.3]}>
          <ringGeometry args={[body.ringInner!, body.ringOuter!, 80]} />
          <meshBasicMaterial color="#fde68a" transparent opacity={0.55} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

// 太阳
function Sun() {
  const sunBody = BODIES[0];
  const meshRef = useRef<THREE.Mesh>(null!);
  const halo1Ref = useRef<THREE.Mesh>(null!);
  const halo2Ref = useRef<THREE.Mesh>(null!);
  const texture = useTexture(sunBody.texture);
  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += 0.06 * delta;
    if (halo1Ref.current) halo1Ref.current.rotation.z -= 0.02 * delta;
    if (halo2Ref.current) halo2Ref.current.rotation.z += 0.015 * delta;
  });
  return (
    <group>
      <pointLight color="#fde68a" intensity={1.8} distance={100} decay={1.6} />
      <ambientLight intensity={0.4} color="#a78bfa" />
      <mesh ref={meshRef}>
        <sphereGeometry args={[sunBody.radius, 64, 64]} />
        <meshStandardMaterial
          map={texture}
          emissive={new THREE.Color("#fbbf24")}
          emissiveMap={texture}
          emissiveIntensity={1.4}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={halo1Ref} scale={1.4}>
        <sphereGeometry args={[sunBody.radius, 32, 32]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.18} side={THREE.BackSide} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh ref={halo2Ref} scale={2.2}>
        <sphereGeometry args={[sunBody.radius, 24, 24]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.06} side={THREE.BackSide} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}

// 公转
function OrbitSystem({ onPlanetClick }: { onPlanetClick: (id: string) => void }) {
  const groupRef = useRef<THREE.Group>(null!);
  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += 0.02 * delta;
  });
  return (
    <group ref={groupRef}>
      {BODIES.filter((b) => !b.emissive).map((b) => (
        <group key={b.id} rotation={[0, Math.random() * Math.PI * 2, 0]}>
          <Planet body={b} onClick={onPlanetClick} />
        </group>
      ))}
    </group>
  );
}

// 轨道环
function OrbitRings() {
  const rings = BODIES.filter((b) => b.distance > 0);
  return (
    <>
      {rings.map((b) => (
        <mesh key={b.id} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[b.distance - 0.04, b.distance + 0.04, 128]} />
          <meshBasicMaterial color="#a855f7" transparent opacity={0.06} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </>
  );
}

// 小行星带 (火星与木星之间, 距离 22-24)
function AsteroidBelt() {
  const ref = useRef<THREE.InstancedMesh>(null!);
  const COUNT = 350;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const asteroids = useMemo(() => {
    const arr: { angle: number; distance: number; size: number; y: number; speed: number; color: THREE.Color }[] = [];
    const colors = [new THREE.Color("#a8a29e"), new THREE.Color("#9ca3af"), new THREE.Color("#78716c"), new THREE.Color("#d6d3d1")];
    for (let i = 0; i < COUNT; i++) {
      arr.push({
        angle: Math.random() * Math.PI * 2,
        distance: 22 + Math.random() * 2.5,
        size: 0.04 + Math.random() * 0.12,
        y: (Math.random() - 0.5) * 0.6,
        speed: 0.04 + Math.random() * 0.03,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    if (!ref.current) return;
    for (let i = 0; i < COUNT; i++) {
      const a = asteroids[i];
      a.angle += a.speed * delta;
      dummy.position.set(Math.cos(a.angle) * a.distance, a.y, Math.sin(a.angle) * a.distance);
      dummy.rotation.set(a.angle * 2, a.angle * 3, 0);
      dummy.scale.setScalar(a.size);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
      ref.current.setColorAt(i, a.color);
    }
    ref.current.instanceMatrix.needsUpdate = true;
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, COUNT]}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial roughness={0.9} metalness={0.1} />
    </instancedMesh>
  );
}

// 柯伊伯带 (海王星外, 距离 48-52) - 冰质碎屑
function KuiperBelt() {
  const ref = useRef<THREE.InstancedMesh>(null!);
  const COUNT = 220;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const objects = useMemo(() => {
    const arr: { angle: number; distance: number; size: number; y: number; speed: number; color: THREE.Color }[] = [];
    const colors = [new THREE.Color("#bae6fd"), new THREE.Color("#a5f3fc"), new THREE.Color("#7dd3fc"), new THREE.Color("#67e8f9")];
    for (let i = 0; i < COUNT; i++) {
      arr.push({
        angle: Math.random() * Math.PI * 2,
        distance: 48 + Math.random() * 4,
        size: 0.06 + Math.random() * 0.18,
        y: (Math.random() - 0.5) * 1.0,
        speed: 0.015 + Math.random() * 0.015,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    if (!ref.current) return;
    for (let i = 0; i < COUNT; i++) {
      const a = objects[i];
      a.angle += a.speed * delta;
      dummy.position.set(Math.cos(a.angle) * a.distance, a.y, Math.sin(a.angle) * a.distance);
      dummy.rotation.set(a.angle, a.angle * 2, 0);
      dummy.scale.setScalar(a.size);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
      ref.current.setColorAt(i, a.color);
    }
    ref.current.instanceMatrix.needsUpdate = true;
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, COUNT]}>
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial roughness={0.7} metalness={0.2} emissive={new THREE.Color("#0c4a6e")} emissiveIntensity={0.1} />
    </instancedMesh>
  );
}

// 彗星 - 椭圆轨道, 拖尾用 Line + Points
function Comet() {
  const lineRef = useRef<THREE.Line>(null!);
  const headRef = useRef<THREE.Mesh>(null!);
  const POINTS = 60;
  const positions = useMemo(() => new Float32Array(POINTS * 3), []);
  const colors = useMemo(() => {
    const arr = new Float32Array(POINTS * 3);
    for (let i = 0; i < POINTS; i++) {
      const t = i / POINTS;
      arr[i * 3 + 0] = 1;
      arr[i * 3 + 1] = 1 - t * 0.5;
      arr[i * 3 + 2] = 1 - t * 0.8;
    }
    return arr;
  }, []);

  // 彗星参数: 椭圆轨道 (半长轴 a, 偏心率 e)
  const a = 38; // 半长轴
  const e = 0.85; // 偏心率
  const tilt = 0.4; // 轨道倾角

  useFrame((_, delta) => {
    const t = performance.now() * 0.0003;
    // 当前彗星位置 (基于开普勒轨道近似)
    const M = t % (Math.PI * 2);
    let E = M;
    for (let i = 0; i < 5; i++) E = M + e * Math.sin(E);
    const x = a * (Math.cos(E) - e);
    const z = a * Math.sqrt(1 - e * e) * Math.sin(E);
    const y = Math.sin(E) * Math.sin(tilt) * 6;

    headRef.current.position.set(x, y, z);

    // 拖尾: 从头部反方向延伸
    for (let i = 0; i < POINTS; i++) {
      const tailT = i / POINTS;
      const M2 = M - tailT * 0.15;
      let E2 = M2;
      for (let k = 0; k < 5; k++) E2 = M2 + e * Math.sin(E2);
      const px = a * (Math.cos(E2) - e);
      const pz = a * Math.sqrt(1 - e * e) * Math.sin(E2);
      const py = Math.sin(E2) * Math.sin(tilt) * 6;
      positions[i * 3 + 0] = px;
      positions[i * 3 + 1] = py;
      positions[i * 3 + 2] = pz;
    }
    lineRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <group>
      {/* 彗发 (头) */}
      <mesh ref={headRef}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial color="#a5f3fc" transparent opacity={0.9} toneMapped={false} />
      </mesh>
      {/* 彗发光晕 */}
      <mesh ref={headRef as any}>
        <sphereGeometry args={[0.7, 16, 16]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.25} side={THREE.BackSide} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      {/* 拖尾 */}
      <line ref={lineRef as any}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <lineBasicMaterial vertexColors transparent opacity={0.8} linewidth={2} />
      </line>
    </group>
  );
}

// 自建星空 - 分级 + 闪烁 (大星点 + 小星点两层)
function Starfield({ count = 6000, radius = 150 }: { count?: number; radius?: number }) {
  const ref = useRef<THREE.Points>(null!);
  const twinkleRef = useRef<THREE.Points>(null!);
  const starTex = useMemo(() => { if (typeof document === "undefined") return null; const c = document.createElement("canvas"); c.width = 64; c.height = 64; const ctx = c.getContext("2d"); if (!ctx) return null; const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.2, "rgba(255,255,255,0.85)"); g.addColorStop(0.5, "rgba(255,255,255,0.3)"); g.addColorStop(1, "rgba(255,255,255,0)"); ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 64); const t = new THREE.CanvasTexture(c); t.needsUpdate = true; return t; }, []);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const palette = [
      [1, 1, 1],
      [1, 0.96, 0.78],
      [0.78, 0.86, 1],
      [1, 0.78, 0.86],
      [0.86, 0.78, 1],
      [1, 0.84, 0.66] // 橙红巨星
    ];
    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * Math.PI * 2;
      const phi = Math.acos(2 * v - 1);
      const r = radius * (0.7 + Math.random() * 0.3);
      arr[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
      const c = palette[Math.floor(Math.random() * palette.length)];
      const brightness = 0.5 + Math.random() * 0.5;
      colors[i * 3 + 0] = c[0] * brightness;
      colors[i * 3 + 1] = c[1] * brightness;
      colors[i * 3 + 2] = c[2] * brightness;
    }
    return { positions: arr, colors };
  }, [count, radius]);

  // 闪烁星 (额外的 80 颗, 大尺寸, 缓慢闪)
  const twinklePositions = useMemo(() => {
    const arr = new Float32Array(80 * 3);
    for (let i = 0; i < 80; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * Math.PI * 2;
      const phi = Math.acos(2 * v - 1);
      const r = 50 + Math.random() * 80;
      arr[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += 0.008 * delta;
    if (twinkleRef.current) twinkleRef.current.rotation.y -= 0.012 * delta;
  });

  return (
    <>
      <points ref={ref}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[positions.colors, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.7} sizeAttenuation vertexColors map={starTex as any} alphaTest={0.01} transparent opacity={0.9} depthWrite={false} />
      </points>
      {/* 大颗闪烁星 (艺术点缀) */}
      <points ref={twinkleRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[twinklePositions, 3]} />
        </bufferGeometry>
        <pointsMaterial size={2.5} sizeAttenuation color="#ffffff" map={starTex as any} alphaTest={0.01} transparent opacity={0.7} depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
    </>
  );
}

// 自动 orbit 相机 - 每 8 秒切一个视角; 点击行星时锁定该行星
function AutoCamera({ focusId }: { focusId: string | null }) {
  const { camera } = useThree();
  const startTime = useRef(performance.now());
  const currentTarget = useRef(0);
  const nextSwitchAt = useRef(8);
  const targetPos = useRef(new THREE.Vector3());
  const targetLook = useRef(new THREE.Vector3());
  const focusTime = useRef(0);

  // 视角列表
  const shots: { dist: number; height: number; y: number; target: number }[] = [
    { dist: 60, height: 18, y: -3, target: 0 },
    { dist: 8,  height: 4,  y: 4, target: 15 },
    { dist: 9,  height: 5,  y: 3, target: 26 },
    { dist: 10, height: 4,  y: 5, target: 32 },
    { dist: 8,  height: 4,  y: -2, target: 19 },
    { dist: 70, height: 14, y: -3, target: 0 },
    { dist: 9,  height: 4,  y: 4, target: 8 },
    { dist: 11, height: 6,  y: 4, target: 38 }
  ];

  useFrame((_, delta) => {
    const now = performance.now() / 1000;
    const t = now - startTime.current / 1000;

    // 飞向行星逻辑
    if (focusId) {
      focusTime.current += delta;
      const body = BODIES.find((b) => b.id === focusId);
      if (body) {
        // 目标位置: 行星侧前方
        const dist = body.radius * 4 + 3;
        targetPos.current.set(body.distance + dist, body.radius * 1.5, dist);
        targetLook.current.set(body.distance, 0, 0);
        camera.position.lerp(targetPos.current, 0.05);
        camera.lookAt(targetLook.current);
        return;
      }
    } else {
      // 自动切换
      if (t > nextSwitchAt.current) {
        currentTarget.current = (currentTarget.current + 1) % shots.length;
        nextSwitchAt.current = t + 8;
      }
      const shot = shots[currentTarget.current];
      const orbitT = t * 0.06;
      const x = Math.sin(orbitT) * shot.dist;
      const z = Math.cos(orbitT) * shot.dist;
      const y = shot.height + Math.sin(t * 0.4) * 1.5;
      camera.position.lerp(new THREE.Vector3(x, y, z), 0.025);
      const target = BODIES.find((b) => b.distance === shot.target);
      if (target) {
        const tx = Math.cos(orbitT) * shot.target;
        const tz = -Math.sin(orbitT) * shot.target;
        camera.lookAt(tx, 0, tz);
      } else {
        camera.lookAt(0, -3, 0);
      }
    }
  });

  return null;
}

// 内层 Canvas 场景
function Scene({ focusId, onPlanetClick }: { focusId: string | null; onPlanetClick: (id: string) => void }) {
  return (
    <>
      <color attach="background" args={["#05060f"]} />
      <Starfield count={6000} radius={150} />
      <OrbitRings />
      <Sun />
      <OrbitSystem onPlanetClick={onPlanetClick} />
      <AsteroidBelt />
      <KuiperBelt />
      <Comet />
      <AutoCamera focusId={focusId} />
    </>
  );
}

export function Hero3DScene({ className = "" }: { className?: string }) {
  const [focusId, setFocusId] = useState<string | null>(null);
  const handleClick = (id: string) => {
    setFocusId(id);
    // 5 秒后回到自动模式
    setTimeout(() => setFocusId((cur) => (cur === id ? null : cur)), 5000);
  };
  return (
    <div className={"absolute inset-0 " + className}>
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 18, 60], fov: 55, near: 0.1, far: 200 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <Scene focusId={focusId} onPlanetClick={handleClick} />
        </Suspense>
      </Canvas>
      {focusId && (
        <div className="absolute top-32 left-1/2 -translate-x-1/2 z-10 px-4 py-2 rounded-full glass text-sm text-white/80 pointer-events-none">
          飞向 {BODIES.find((b) => b.id === focusId)?.name} · 5 秒后返回
        </div>
      )}
    </div>
  );
}