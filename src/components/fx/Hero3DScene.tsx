"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";

// 仅太阳 + 8 大行星(NASA 贴图) + 自动 orbit 切换
type Body = {
  id: string;
  name: string;
  texture: string;
  radius: number;        // 显示半径
  distance: number;      // 轨道距离
  speed: number;         // 公转速度 (rad/s)
  tilt: number;          // 自转倾角
  rotation: number;      // 自转速度
  hasRing?: boolean;
  ringInner?: number;
  ringOuter?: number;
  glow?: string;         // 大气辉光颜色
  emissive?: boolean;    // 是否自发光(太阳)
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

// 单个行星 (带贴图 + 自转 + 大气)
function Planet({ body }: { body: Body }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const groupRef = useRef<THREE.Group>(null!);
  const matRef = useRef<THREE.MeshStandardMaterial>(null!);
  const atmosphereRef = useRef<THREE.Mesh>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);
  const ringMatRef = useRef<THREE.MeshBasicMaterial>(null!);
  const texture = useTexture(body.texture);

  useFrame((_, delta) => {
    // 自转
    if (meshRef.current) meshRef.current.rotation.y += body.rotation * delta;
    // 大气呼吸
    if (atmosphereRef.current) {
      const s = 1 + Math.sin(performance.now() * 0.0015) * 0.02;
      atmosphereRef.current.scale.setScalar(s);
    }
    // 土星环缓慢旋转
    if (ringRef.current) ringRef.current.rotation.z += 0.02 * delta;
  });

  return (
    <group ref={groupRef} position={[body.distance, 0, 0]}>
      {/* 行星本体 */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[body.radius, 48, 48]} />
        <meshStandardMaterial
          ref={matRef}
          map={texture}
          emissive={body.emissive ? new THREE.Color("#f59e0b") : new THREE.Color(body.glow || "#222244")}
          emissiveIntensity={body.emissive ? 0.6 : 0.12}
          roughness={0.85}
          metalness={0.05}
        />
      </mesh>

      {/* 大气辉光 (非自发光行星) */}
      {!body.emissive && body.glow && (
        <mesh ref={atmosphereRef} scale={1.08}>
          <sphereGeometry args={[body.radius, 32, 32]} />
          <meshBasicMaterial
            color={body.glow}
            transparent
            opacity={0.12}
            side={THREE.BackSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}

      {/* 太阳辉光 (多向 glow) */}
      {body.emissive && (
        <>
          <mesh scale={1.15}>\n            <sphereGeometry args={[body.radius, 32, 32]} />
            <meshBasicMaterial color="#fbbf24" transparent opacity={0.25} side={THREE.BackSide} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
          <mesh scale={1.4}>
            <sphereGeometry args={[body.radius, 24, 24]} />
            <meshBasicMaterial color="#f59e0b" transparent opacity={0.06} side={THREE.BackSide} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
        </>
      )}

      {/* 土星环 */}
      {body.hasRing && (
        <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0.3]}>
          <ringGeometry args={[body.ringInner!, body.ringOuter!, 80]} />
          <meshBasicMaterial ref={ringMatRef} color="#fde68a" transparent opacity={0.55} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

// 太阳 (自发光 + 点光)
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
      <pointLight color="#fde68a" intensity={2.5} distance={120} decay={1.5} />
      <ambientLight intensity={0.25} color="#a78bfa" />
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
function OrbitSystem() {
  const groupRef = useRef<THREE.Group>(null!);
  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += 0.02 * delta;
  });
  return (
    <group ref={groupRef}>
      {BODIES.filter((b) => !b.emissive).map((b) => (
        <group key={b.id} rotation={[0, Math.random() * Math.PI * 2, 0]}>
          <Planet body={b} />
        </group>
      ))}
    </group>
  );
}

// 轨道环 (细线)
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

// 自动 orbit 相机 - 每 8 秒切一个行星特写, 同时持续缓慢公转
function AutoCamera() {
  const { camera } = useThree();
  const startTime = useRef(performance.now());
  const currentTarget = useRef(0);
  const nextSwitchAt = useRef(8); // 8 秒后切换

  // 视角位置列表: [距离, 高度, lookAt 行星 id]
  const shots: { dist: number; height: number; y: number; target: number }[] = [
    { dist: 60, height: 18, y: -3, target: 0 },     // 俯视全景
    { dist: 8,  height: 4,  y: 4, target: 15 },   // 地球
    { dist: 9,  height: 5,  y: 3, target: 26 },   // 木星
    { dist: 10, height: 4,  y: 5, target: 32 },   // 土星
    { dist: 8,  height: 4,  y: -2, target: 19 },  // 火星
    { dist: 70, height: 14, y: -3, target: 0 },    // 远景
    { dist: 9,  height: 4,  y: 4, target: 8 },    // 水星
    { dist: 11, height: 6,  y: 4, target: 38 }    // 天王星
  ];

  useFrame((_, delta) => {
    const now = performance.now() / 1000;
    const t = now - startTime.current / 1000;
    if (t > nextSwitchAt.current) {
      currentTarget.current = (currentTarget.current + 1) % shots.length;
      nextSwitchAt.current = t + 8;
    }
    const shot = shots[currentTarget.current];
    // 持续缓慢公转
    const orbitT = t * 0.06;
    const x = Math.sin(orbitT) * shot.dist;
    const z = Math.cos(orbitT) * shot.dist;
    const y = shot.height + Math.sin(t * 0.4) * 1.5;
    camera.position.lerp(new THREE.Vector3(x, y, z), 0.025);
    // lookAt 行星
    const target = BODIES.find((b) => b.distance === shot.target);
    if (target) {
      const tx = Math.cos(orbitT) * shot.target;
      const tz = -Math.sin(orbitT) * shot.target;
      camera.lookAt(tx, 0, tz);
    } else {
      camera.lookAt(0, -3, 0);
    }
  });

  return null;
}

// 自建星空 - 6000 颗随机位置的星点
function Starfield({ count = 6000, radius = 150 }: { count?: number; radius?: number }) {
  const ref = useRef<THREE.Points>(null!);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const palette = [
      [1, 1, 1],
      [1, 0.96, 0.78],
      [0.78, 0.86, 1],
      [1, 0.78, 0.86],
      [0.86, 0.78, 1]
    ];
    for (let i = 0; i < count; i++) {
      // 在球壳上分布
      const u = Math.random();
      const v = Math.random();
      const theta = u * Math.PI * 2;
      const phi = Math.acos(2 * v - 1);
      const r = radius * (0.7 + Math.random() * 0.3);
      arr[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
      const c = palette[Math.floor(Math.random() * palette.length)];
      const brightness = 0.4 + Math.random() * 0.6;
      colors[i * 3 + 0] = c[0] * brightness;
      colors[i * 3 + 1] = c[1] * brightness;
      colors[i * 3 + 2] = c[2] * brightness;
    }
    return { positions: arr, colors };
  }, [count, radius]);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += 0.01 * delta;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions.positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[positions.colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.8}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.9}
        depthWrite={false}
      />
    </points>
  );
}
// 内层 Canvas 场景
function Scene() {
  return (
    <>
      <color attach="background" args={["#05060f"]} />
      <Starfield count={6000} radius={150} />
      <OrbitRings />
      <Sun />
      <OrbitSystem />
      <AutoCamera />
    </>
  );
}

export function Hero3DScene({ className = "" }: { className?: string }) {
  return (
    <div className={"absolute inset-0 " + className}>
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 18, 60], fov: 55, near: 0.1, far: 200 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}