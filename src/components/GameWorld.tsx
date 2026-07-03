"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { Suspense, useMemo, useRef, useState, useEffect, useImperativeHandle, forwardRef } from "react";
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
  axialTilt: number;
  hasRing?: boolean;
  ringInner?: number;
  ringOuter?: number;
  glow?: string;
  emissive?: boolean;
  bodyColor?: string;
  initialAngle?: number;
};

// Distance scaled for visual readability; Earth = 12.5
export const BODIES: Body[] = [
  { id: "sun",     name: "\u592a\u9633",   texture: "/assets/textures/sun.jpg",     radius: 3.0,  distance: 0,    speed: 0,      rotation: 0.05, axialTilt: 0.3, emissive: true },
  { id: "mercury", name: "\u6c34\u661f",   texture: "/assets/textures/mercury.jpg", radius: 0.5, distance: 6,    speed: 0.42,   rotation: 0.04, axialTilt: 0.0, glow: "#a8a29e" },
  { id: "venus",   name: "\u91d1\u661f",   texture: "/assets/textures/venus.jpg",   radius: 0.85, distance: 9,    speed: 0.32,   rotation: -0.02, axialTilt: 0.05, glow: "#fbbf24" },
  { id: "earth",   name: "\u5730\u7403",   texture: "/assets/textures/earth.jpg",   radius: 0.95,  distance: 12.5, speed: 0.26,   rotation: 0.5, axialTilt: 0.23, glow: "#3b82f6" },
  { id: "mars",    name: "\u706b\u661f",   texture: "/assets/textures/mars.jpg",    radius: 0.65,  distance: 16,   speed: 0.21,   rotation: 0.48, axialTilt: 0.25, glow: "#dc2626" },
  { id: "jupiter", name: "\u6728\u661f",   texture: "/assets/textures/jupiter.jpg", radius: 2.1,  distance: 23,   speed: 0.11,   rotation: 0.85, axialTilt: 0.06, glow: "#d97706" },
  { id: "saturn",  name: "\u571f\u661f",   texture: "/assets/textures/saturn.jpg",  radius: 1.7,  distance: 30,   speed: 0.082,  rotation: 0.78, axialTilt: 0.32, hasRing: true, ringInner: 1.7, ringOuter: 2.7, glow: "#fde68a" },
  { id: "uranus",  name: "\u5929\u738b\u661f", texture: "/assets/textures/uranus.jpg",  radius: 1.2, distance: 37,   speed: 0.058,  rotation: 0.6, axialTilt: 1.4, glow: "#22d3ee" },
  { id: "neptune", name: "\u6d77\u738b\u661f", texture: "/assets/textures/neptune.webp", radius: 1.15,  distance: 44,   speed: 0.045,  rotation: 0.55, axialTilt: 0.5, glow: "#3b82f6" }
];

// Procedural Sun texture (avoids dependency on a wrong external image)
function makeSunTexture() {
  const c = document.createElement("canvas");
  c.width = 1024; c.height = 512;
  const ctx = c.getContext("2d");
  const grd = ctx.createLinearGradient(0, 0, 0, 512);
  grd.addColorStop(0, "#fde047");
  grd.addColorStop(0.4, "#facc15");
  grd.addColorStop(0.55, "#fb923c");
  grd.addColorStop(0.8, "#ea580c");
  grd.addColorStop(1, "#c2410c");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, 1024, 512);
  for (let i = 0; i < 4500; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 512;
    const r = 1 + Math.random() * 3;
    const dark = Math.random() > 0.5;
    ctx.fillStyle = dark ? "rgba(180, 60, 20, 0.5)" : "rgba(255, 240, 200, 0.55)";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  for (let i = 0; i < 25; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 512;
    const w = 30 + Math.random() * 90;
    const h = 8 + Math.random() * 18;
    const rot = (Math.random() - 0.5) * 0.6;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, w / 2);
    g.addColorStop(0, "rgba(255, 255, 220, 0.95)");
    g.addColorStop(0.5, "rgba(255, 200, 80, 0.6)");
    g.addColorStop(1, "rgba(255, 120, 0, 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(0, 0, w / 2, h, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  for (let i = 0; i < 8; i++) {
    const x = 100 + Math.random() * 824;
    const y = 80 + Math.random() * 352;
    const r = 6 + Math.random() * 14;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, "rgba(20, 0, 0, 0.95)");
    g.addColorStop(0.7, "rgba(80, 30, 10, 0.7)");
    g.addColorStop(1, "rgba(180, 80, 20, 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function makeStarTex() {
  const c = document.createElement("canvas");
  c.width = 64; c.height = 64;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.2, "rgba(255,255,255,0.85)");
  g.addColorStop(0.5, "rgba(255,255,255,0.3)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}
let STAR_TEX: THREE.Texture | null = null;
let _sunTex: THREE.Texture | null = null;
function getSunTex() { if (!_sunTex) _sunTex = makeSunTexture(); return _sunTex; }

// Single planet (texture + atmosphere + selection ring + selected light)
function Planet({ body, angle, onHover, onClick, onUnhover, selected }: { body: Body; angle: number; onHover: (id: string) => void; onClick: (id: string) => void; onUnhover: () => void; selected: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const atmosphereRef = useRef<THREE.Mesh>(null!);
  const atmosphere2Ref = useRef<THREE.Mesh>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  const texture = useTexture(body.texture);
  texture.anisotropy = 8;

  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += body.rotation * delta;
    if (atmosphereRef.current) {
      const t = performance.now() * 0.001;
      const s = 1.0 + Math.sin(t * 1.5) * 0.025;
      atmosphereRef.current.scale.setScalar(s);
    }
    if (ringRef.current) ringRef.current.rotation.z += 0.04 * delta;
  });

  const x = Math.cos(angle) * body.distance;
  const z = Math.sin(angle) * body.distance;
  const scale = selected ? 1.45 : hovered ? 1.18 : 1;

  return (
    <group position={[x, 0, z]}>
      {/* Invisible larger hitbox for easier clicking */}
      <mesh
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); onHover(body.id); document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { setHovered(false); onUnhover(); document.body.style.cursor = "auto"; }}
        onClick={(e) => { e.stopPropagation(); onClick(body.id); }}
      >
        <sphereGeometry args={[body.radius * 1.5, 12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <mesh
        ref={meshRef}
        scale={scale}
      >
        <sphereGeometry args={[body.radius, 20, 20]} />
        <meshStandardMaterial
          map={texture}
          emissive={new THREE.Color(body.glow || "#222244")}
          emissiveIntensity={body.emissive ? 0.4 : 0.05}
          roughness={0.85}
          metalness={0.05}
        />
      </mesh>

      {body.glow && (
        <mesh ref={atmosphereRef} scale={1.22}>
          <sphereGeometry args={[body.radius, 20, 20]} />
          <meshBasicMaterial color={body.glow} transparent opacity={0.18} side={THREE.BackSide} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </mesh>
      )}

      {body.hasRing && (
        <mesh ref={ringRef} rotation={[Math.PI / 2.3, 0, 0.3]}>
          <ringGeometry args={[body.ringInner!, body.ringOuter!, 128]} />
          <meshBasicMaterial color="#fde68a" transparent opacity={0.75} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
        </mesh>
      )}
      {body.hasRing && (
        <mesh rotation={[Math.PI / 2.3, 0, 0.3]}>
          <ringGeometry args={[body.ringInner! * 0.85, body.ringOuter! * 1.05, 128]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.2} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
        </mesh>
      )}

      {(hovered || selected) && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[body.radius * 1.6, body.radius * 1.72, 64]} />
          <meshBasicMaterial color="#a855f7" transparent opacity={0.75} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
        </mesh>
      )}
      {selected && (
        <pointLight color="#a855f7" intensity={1.0} distance={body.radius * 8} decay={1.5} />
      )}
    </group>
  );
}
// Sun: procedural texture + 6-layer halo + corona + flames
function Sun({ shields = 100 }: { shields?: number }) {
  const sun = BODIES[0];
  const meshRef = useRef<THREE.Mesh>(null!);
  const halo1Ref = useRef<THREE.Mesh>(null!);
  const halo2Ref = useRef<THREE.Mesh>(null!);
  const halo3Ref = useRef<THREE.Mesh>(null!);
  const coronaRef = useRef<THREE.Mesh>(null!);
  const flameRef = useRef<THREE.Mesh>(null!);
  const tex = useMemo(() => { if (typeof document === "undefined") return null as any; return getSunTex(); }, []);
  useFrame((_, delta) => {
    const t = performance.now() * 0.001;
    if (meshRef.current) meshRef.current.rotation.y += 0.05 * delta;
    if (halo1Ref.current) halo1Ref.current.rotation.z -= 0.02 * delta;
    if (halo2Ref.current) halo2Ref.current.rotation.z += 0.012 * delta;
    if (halo3Ref.current) {
      const s = 1 + Math.sin(t * 0.7) * 0.06;
      halo3Ref.current.scale.setScalar(s);
    }
    if (coronaRef.current) {
      const s = 1 + Math.sin(t * 0.4) * 0.04;
      coronaRef.current.scale.setScalar(s);
      coronaRef.current.rotation.y -= 0.03 * delta;
    }
    if (flameRef.current) {
      const s = 1 + Math.sin(t * 1.6) * 0.05;
      flameRef.current.scale.setScalar(s);
    }
  });
  return (
    <group>
      <pointLight color="#fde68a" intensity={shields < 30 ? 2.4 : 1.8} distance={150} decay={1.5} />
      <pointLight color="#f97316" intensity={0.6} distance={70} decay={1.8} />
      <ambientLight intensity={0.55} color="#a78bfa" />
      <mesh ref={meshRef}>
        <sphereGeometry args={[sun.radius, 14, 14]} />
        <meshStandardMaterial
          map={tex}
          emissive={new THREE.Color("#fbbf24")}
          emissiveMap={tex}
          emissiveIntensity={1.6}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={halo1Ref} scale={1.18}>
        <sphereGeometry args={[sun.radius, 32, 32]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.32} side={THREE.BackSide} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      <mesh ref={halo2Ref} scale={1.55}>
        <sphereGeometry args={[sun.radius, 16, 16]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.16} side={THREE.BackSide} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      <mesh ref={halo3Ref} scale={2.0}>
        <sphereGeometry args={[sun.radius, 20, 20]} />
        <meshBasicMaterial color="#fde68a" transparent opacity={0.08} side={THREE.BackSide} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      <mesh ref={coronaRef} scale={1.15}>
        <sphereGeometry args={[sun.radius, 32, 32]} />
        <meshBasicMaterial color="#fef3c7" transparent opacity={0.1} side={THREE.FrontSide} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      <mesh ref={flameRef} scale={1.45}>
        <sphereGeometry args={[sun.radius, 20, 20]} />
        <meshBasicMaterial color="#fb923c" transparent opacity={0.05} side={THREE.BackSide} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
    </group>
  );
}

// Starfield (with subtle rotation)
function Starfield({ count = 8000, radius = 220 }: { count?: number; radius?: number }) {
  const ref = useRef<THREE.Points>(null!);
  const starTex = useMemo(() => { if (typeof document === "undefined") return null; if (!STAR_TEX) STAR_TEX = makeStarTex(); return STAR_TEX; }, []);
  const { positions, colors, sizes } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const palette = [
      [1, 1, 1],
      [1, 0.96, 0.78],
      [0.78, 0.86, 1],
      [0.65, 0.78, 1],
      [1, 0.78, 0.65],
      [0.9, 0.7, 1]
    ];
    for (let i = 0; i < count; i++) {
      const u = Math.random(), v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const r = radius * (0.7 + Math.random() * 0.3);
      positions[i*3+0] = r * Math.sin(phi) * Math.cos(theta);
      positions[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i*3+2] = r * Math.cos(phi);
      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i*3+0] = c[0]; colors[i*3+1] = c[1]; colors[i*3+2] = c[2];
      sizes[i] = 0.3 + Math.random() * 1.0;
    }
    return { positions, colors, sizes };
  }, [count, radius]);
  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.00008;
      ref.current.rotation.x += 0.00002;
    }
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial size={0.7} sizeAttenuation transparent vertexColors map={starTex || undefined} alphaTest={0.01} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
    </points>
  );
}

// Orbit rings (double layer)
function OrbitRings() {
  const rings = BODIES.filter((b) => b.distance > 0);
  return (
    <>{rings.map((b) => (
      <group key={b.id}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[b.distance - 0.06, b.distance + 0.06, 128]} />
          <meshBasicMaterial color="#a855f7" transparent opacity={0.07} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[b.distance - 0.02, b.distance + 0.02, 128]} />
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.04} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
        </mesh>
      </group>
    ))}</>
  );
}
// Asteroid belt (Mars-Jupiter)
function AsteroidBelt() {
  const ref = useRef<THREE.InstancedMesh>(null!);
  const COUNT = 200;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const asteroids = useMemo(() => {
    const arr = [];
    const colors = [new THREE.Color("#a8a29e"), new THREE.Color("#9ca3af"), new THREE.Color("#78716c"), new THREE.Color("#d6d3d1"), new THREE.Color("#92400e")];
    for (let i = 0; i < COUNT; i++) {
      arr.push({ angle: Math.random() * Math.PI * 2, distance: 19 + Math.random() * 2.5, size: 0.04 + Math.random() * 0.12, y: (Math.random() - 0.5) * 0.5, speed: 0.05 + Math.random() * 0.04, color: colors[Math.floor(Math.random() * colors.length)], rotSpeed: Math.random() * 0.5, rotPhase: Math.random() * Math.PI });
    }
    return arr;
  }, []);
  useFrame((_, delta) => {
    if (!ref.current) return;
    for (let i = 0; i < COUNT; i++) {
      const a = asteroids[i];
      a.angle += a.speed * delta;
      dummy.position.set(Math.cos(a.angle) * a.distance, a.y, Math.sin(a.angle) * a.distance);
      dummy.rotation.set(a.angle * 2 + a.rotPhase, a.angle * 3 + a.rotPhase, 0);
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

// Kuiper belt (beyond Neptune)
function KuiperBelt() {
  const ref = useRef<THREE.InstancedMesh>(null!);
  const COUNT = 350;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const objects = useMemo(() => {
    const arr = [];
    const colors = [new THREE.Color("#bae6fd"), new THREE.Color("#a5f3fc"), new THREE.Color("#7dd3fc"), new THREE.Color("#67e8f9")];
    for (let i = 0; i < COUNT; i++) {
      arr.push({ angle: Math.random() * Math.PI * 2, distance: 48 + Math.random() * 4, size: 0.06 + Math.random() * 0.16, y: (Math.random() - 0.5) * 1.0, speed: 0.018 + Math.random() * 0.018, color: colors[Math.floor(Math.random() * colors.length)] });
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
      <meshStandardMaterial roughness={0.7} metalness={0.2} emissive={new THREE.Color("#0c4a6e")} emissiveIntensity={0.2} />
    </instancedMesh>
  );
}

// Comet (Kepler orbit + 80-point tail)
function Comet() {
  const lineRef = useRef<any>(null!);
  const headRef = useRef<THREE.Mesh>(null!);
  const POINTS = 80;
  const positions = useMemo(() => new Float32Array(POINTS * 3), []);
  const colors = useMemo(() => {
    const arr = new Float32Array(POINTS * 3);
    for (let i = 0; i < POINTS; i++) {
      const t = i / POINTS;
      arr[i * 3 + 0] = 0.6 + (1 - t) * 0.4;
      arr[i * 3 + 1] = 0.85 - t * 0.4;
      arr[i * 3 + 2] = 1 - t * 0.5;
    }
    return arr;
  }, []);
  const a = 38, e = 0.85, tilt = 0.4;
  useFrame(() => {
    const t = performance.now() * 0.0002;
    const M = t % (Math.PI * 2);
    let E = M;
    for (let i = 0; i < 5; i++) E = M + e * Math.sin(E);
    const x = a * (Math.cos(E) - e);
    const z = a * Math.sqrt(1 - e * e) * Math.sin(E);
    const y = Math.sin(E) * Math.sin(tilt) * 8;
    if (headRef.current) headRef.current.position.set(x, y, z);
    for (let i = 0; i < POINTS; i++) {
      const tailT = i / POINTS;
      const M2 = M - tailT * 0.15;
      let E2 = M2;
      for (let k = 0; k < 5; k++) E2 = M2 + e * Math.sin(E2);
      positions[i * 3 + 0] = a * (Math.cos(E2) - e);
      positions[i * 3 + 1] = Math.sin(E2) * Math.sin(tilt) * 8;
      positions[i * 3 + 2] = a * Math.sqrt(1 - e * e) * Math.sin(E2);
    }
    if (lineRef.current) lineRef.current.geometry.attributes.position.needsUpdate = true;
  });
  return (
    <group>
      <mesh ref={headRef}>
        <sphereGeometry args={[0.35, 10, 10]} />
        <meshBasicMaterial color="#a5f3fc" transparent opacity={0.95} toneMapped={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.9, 10, 10]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.3} side={THREE.BackSide} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      <line ref={lineRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <lineBasicMaterial vertexColors transparent opacity={0.85} linewidth={2} toneMapped={false} />
      </line>
    </group>
  );
}

// Meteors (random flashes)
function Meteors() {
  const COUNT = 6;
  const refs = useRef<THREE.Mesh[]>([]);
  const metaRef = useRef(Array.from({ length: COUNT }, () => ({ active: false, startTime: 0, duration: 0.8, start: new THREE.Vector3(), end: new THREE.Vector3() })));
  useFrame(() => {
    const now = performance.now() / 1000;
    for (let i = 0; i < COUNT; i++) {
      const m = refs.current[i];
      if (!m) continue;
      const meta = metaRef.current[i];
      if (!meta.active && Math.random() < 0.008) {
        meta.active = true;
        meta.startTime = now;
        meta.duration = 0.6 + Math.random() * 0.6;
        const ang = Math.random() * Math.PI * 2;
        const r = 60 + Math.random() * 30;
        meta.start.set(Math.cos(ang) * r, 20 + Math.random() * 15, Math.sin(ang) * r);
        meta.end.set(meta.start.x - 30 - Math.random() * 30, meta.start.y - 20, meta.start.z - 30);
      }
      if (meta.active) {
        const t = (now - meta.startTime) / meta.duration;
        if (t >= 1) { meta.active = false; m.visible = false; continue; }
        m.visible = true;
        m.position.lerpVectors(meta.start, meta.end, t);
        const opacity = (1 - t) * 0.9;
        const mat = m.material as THREE.MeshBasicMaterial;
        if (mat) mat.opacity = opacity;
      }
    }
  });
  return (
    <>{Array.from({ length: 6 }).map((_, i) => (
      <mesh key={i} ref={(el) => { if (el) refs.current[i] = el; }} visible={false}>
        <sphereGeometry args={[0.2, 6, 6]} />
        <meshBasicMaterial color="#fef3c7" transparent opacity={0.9} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    ))}</>
  );
}
// Camera rig: auto-orbit during CRUISE, fly to planet during APPROACH
type CameraMode = "INTRO" | "CRUISE" | "APPROACH" | "WARP" | "TUNNEL" | "LANDING" | "CLUE";
function CameraRig({ mode, targetId, onApproachComplete, startTime, warpFrom, warpTo }: { mode: CameraMode; targetId: string | null; onApproachComplete: () => void; startTime: number; warpFrom?: [number, number, number]; warpTo?: [number, number, number] }) {
  const { camera } = useThree();
  const approachStart = useRef<number | null>(null);
  const warpT = useRef(0);
  const targetPos = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    const now = performance.now() / 1000;
    const t = now - startTime;

    if (mode === "INTRO") {
      const phase = Math.min(1, t / 6);
      const dist = 90 - phase * 50;
      const angle = phase * Math.PI * 0.4;
      const x = Math.sin(angle) * dist;
      const z = Math.cos(angle) * dist;
      const y = 28 - phase * 14;
      targetPos.set(x, y, z);
      camera.position.lerp(targetPos, 0.04);
      camera.lookAt(0, 0, 0);
    } else if (mode === "CRUISE") {
      const orbitT = t * 0.04;
      const dist = 58 + Math.sin(t * 0.25) * 8;
      const x = Math.sin(orbitT) * dist;
      const z = Math.cos(orbitT) * dist;
      const y = 14 + Math.sin(t * 0.35) * 2.5;
      targetPos.set(x, y, z);
      camera.position.lerp(targetPos, 0.035);
      camera.lookAt(0, 0, 0);
    } else if (mode === "TUNNEL") {
      // 穿梭模式: 镜头跟随飞船 (在 z=0), 视角从飞船后上方
      const baseX = 0, baseY = 0, baseZ = 0;
      const orbitT = t * 0.2;
      targetPos.set(
        baseX + Math.sin(orbitT) * 0.6,
        baseY + 1.5,
        baseZ + 5.5
      );
      camera.position.lerp(targetPos, 0.08);
      camera.lookAt(baseX, baseY, baseZ - 3);
    } else if (mode === "LANDING") {
      // 降落模式: 镜头从飞船后上方俯视
      const orbitT = t * 0.15;
      targetPos.set(Math.sin(orbitT) * 0.4, 3.5, 5.5);
      camera.position.lerp(targetPos, 0.08);
      camera.lookAt(0, 0.8, 0);
    } else if (mode === "CLUE") {
      // 线索模式: 拉远看到 3 个发光点
      const orbitT = t * 0.1;
      targetPos.set(Math.sin(orbitT) * 0.6, 4.5, 7.5);
      camera.position.lerp(targetPos, 0.06);
      camera.lookAt(0, 0, 0);
    } else if (mode === "APPROACH" && targetId) {
      if (approachStart.current === null) approachStart.current = now;
      const elapsed = now - approachStart.current;
      const body = BODIES.find((b) => b.id === targetId);
      if (body) {
        const angle = body.initialAngle || 0;
        const px = Math.cos(angle) * body.distance;
        const pz = Math.sin(angle) * body.distance;
        const phase = Math.min(1, elapsed / 3.5);
        const startDist = 50;
        const endDist = body.radius * 3 + 2.5;
        const dist = startDist + (endDist - startDist) * (1 - Math.pow(1 - phase, 3));
        const height = 7 - phase * 5;
        const dirX = (px > 0 ? 1 : -1) * 0.5;
        const dirZ = (pz > 0 ? 1 : -1) * 0.5;
        const x = px + dirX * dist * (1 - phase * 0.3);
        const z = pz + dirZ * dist * (1 - phase * 0.3);
        targetPos.set(x, height, z);
        camera.position.lerp(targetPos, 0.07);
        camera.lookAt(px, 0, pz);
        if (phase >= 0.99 && onApproachComplete) {
          onApproachComplete();
          approachStart.current = null;
        }
      }
    } else if (mode === "WARP" && warpFrom && warpTo) {
      warpT.current += 0.012;
      const phase = Math.min(1, warpT.current);
      const eased = phase * phase * (3 - 2 * phase);
      targetPos.set(
        warpFrom[0] + (warpTo[0] - warpFrom[0]) * eased,
        warpFrom[1] + (warpTo[1] - warpFrom[1]) * eased,
        warpFrom[2] + (warpTo[2] - warpFrom[2]) * eased
      );
      camera.position.copy(targetPos);
      const mid = new THREE.Vector3(0, 5, 0);
      camera.lookAt(mid);
    }
  });
  return null;
}

// ====== 能量晶体 (在小行星带和行星附近) ======
function EnergyCrystals({ onCollect }: { onCollect: (idx: number) => void }) {
  const refs = useRef<THREE.Mesh[]>([]);
  const collectedRef = useRef<Set<number>>(new Set());
  const CRYSTAL_COUNT = 12;
  const positions = useMemo(() => {
    const arr: { pos: [number, number, number]; color: string }[] = [];
    const colors = ["#22d3ee", "#a855f7", "#10b981", "#fbbf24", "#f472b6"];
    // 6 在小行星带 (19-21)
    for (let i = 0; i < 6; i++) {
      const ang = (i / 6) * Math.PI * 2 + Math.random() * 0.5;
      const r = 19 + Math.random() * 2;
      arr.push({ pos: [Math.cos(ang) * r, (Math.random() - 0.5) * 1.5, Math.sin(ang) * r], color: colors[i % colors.length] });
    }
    // 3 在金星/地球/火星之间 (8-16)
    for (let i = 0; i < 3; i++) {
      const ang = Math.random() * Math.PI * 2;
      const r = 8 + Math.random() * 8;
      arr.push({ pos: [Math.cos(ang) * r, (Math.random() - 0.5) * 2, Math.sin(ang) * r], color: colors[(i + 2) % colors.length] });
    }
    // 3 在外行星区 (24-44)
    for (let i = 0; i < 3; i++) {
      const ang = Math.random() * Math.PI * 2;
      const r = 24 + Math.random() * 20;
      arr.push({ pos: [Math.cos(ang) * r, (Math.random() - 0.5) * 2, Math.sin(ang) * r], color: colors[(i + 3) % colors.length] });
    }
    return arr;
  }, []);
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    for (let i = 0; i < positions.length; i++) {
      if (collectedRef.current.has(i)) continue;
      const m = refs.current[i];
      if (!m) continue;
      m.rotation.y = t * 1.5;
      m.rotation.x = t * 0.7;
      m.position.y = positions[i].pos[1] + Math.sin(t * 1.2 + i) * 0.3;
    }
  });
  return (
    <>{positions.map((p, i) => (
      <mesh
        key={i}
        ref={(el) => { if (el) refs.current[i] = el; }}
        position={p.pos}
        onClick={(e) => {
          e.stopPropagation();
          if (collectedRef.current.has(i)) return;
          collectedRef.current.add(i);
          const m = refs.current[i];
          if (m) m.visible = false;
          onCollect(i);
        }}
      >
        <octahedronGeometry args={[0.35, 0]} />
        <meshStandardMaterial color={p.color} emissive={p.color} emissiveIntensity={1.5} toneMapped={false} />
      </mesh>
    ))}</>
  );
}

// ====== NASA 探测器 (旅行者号/卡西尼号/水手号) ======
function Probes({ onPick }: { onPick: (id: string) => void }) {
  const refs = useRef<Record<string, THREE.Mesh>>({});
  const pickedRef = useRef<Set<string>>(new Set());
  const probes = useMemo(() => [
    { id: "voyager", dist: 50, label: "旅行者 1 号", color: "#a5f3fc" },
    { id: "cassini", dist: 18, label: "卡西尼号", color: "#fde68a" },
    { id: "mariner", dist: 7, label: "水手 10 号", color: "#fca5a5" }
  ], []);
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    for (let i = 0; i < probes.length; i++) {
      const p = probes[i];
      if (pickedRef.current.has(p.id)) continue;
      const m = refs.current[p.id];
      if (!m) continue;
      const ang = (i / probes.length) * Math.PI * 2 + t * 0.05;
      m.position.set(Math.cos(ang) * p.dist, Math.sin(t * 0.4 + i) * 0.5, Math.sin(ang) * p.dist);
      m.rotation.y = t * 0.5;
    }
  });
  return (
    <>{probes.map((p) => (
      <mesh
        key={p.id}
        ref={(el) => { if (el) refs.current[p.id] = el; }}
        onClick={(e) => {
          e.stopPropagation();
          if (pickedRef.current.has(p.id)) return;
          pickedRef.current.add(p.id);
          const m = refs.current[p.id];
          if (m) m.visible = false;
          onPick(p.id);
        }}
      >
        <coneGeometry args={[0.25, 0.6, 4]} />
        <meshStandardMaterial color={p.color} emissive={p.color} emissiveIntensity={1.0} toneMapped={false} metalness={0.6} roughness={0.3} />
      </mesh>
    ))}</>
  );
}

// ====== 区域触发 (小行星带/柯伊伯带) ======
function ZoneTriggers({ onEnter }: { onEnter: (zone: string) => void }) {
  const firedRef = useRef<Set<string>>(new Set());
  // 简化: 通过帧时间累积和随机事件触发
  useFrame(() => {
    if (Math.random() < 0.001) {
      const r = Math.random();
      if (r < 0.5 && !firedRef.current.has("enterAsteroidBelt")) {
        firedRef.current.add("enterAsteroidBelt");
        onEnter("enterAsteroidBelt");
      } else if (!firedRef.current.has("enterKuiperBelt")) {
        firedRef.current.add("enterKuiperBelt");
        onEnter("enterKuiperBelt");
      }
    }
  });
  return null;
}

// ====== 玩家飞船 ======
function Ship() {
  const ref = useRef<THREE.Group>(null!);
  const flameRef = useRef<THREE.Mesh>(null!);
  const tRef = useRef(0);
  const keysRef = useRef<Record<string, boolean>>({});
  useEffect(() => {
    const down = (e: KeyboardEvent) => { keysRef.current[e.key.toLowerCase()] = true; };
    const up = (e: KeyboardEvent) => { keysRef.current[e.key.toLowerCase()] = false; };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);
  useFrame((state, delta) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    tRef.current += delta;
    const k = keysRef.current;
    const speed = 8;
    let dx = 0, dz = 0;
    if (k["w"] || k["arrowup"]) dz -= 1;
    if (k["s"] || k["arrowdown"]) dz += 1;
    if (k["a"] || k["arrowleft"]) dx -= 1;
    if (k["d"] || k["arrowright"]) dx += 1;
    if (dx !== 0 || dz !== 0) {
      const len = Math.sqrt(dx * dx + dz * dz);
      dx /= len; dz /= len;
      ref.current.position.x += dx * speed * delta;
      ref.current.position.z += dz * speed * delta;
    } else {
      // 自动巡航: 绕中心慢转
      ref.current.position.x = Math.cos(t * 0.05) * 22;
      ref.current.position.z = Math.sin(t * 0.05) * 22;
    }
    // 限制范围 5-55
    const dist = Math.sqrt(ref.current.position.x ** 2 + ref.current.position.z ** 2);
    if (dist > 55) { ref.current.position.x *= 55 / dist; ref.current.position.z *= 55 / dist; }
    if (dist < 5) { ref.current.position.x *= 5 / dist; ref.current.position.z *= 5 / dist; }
    // 朝向
    const ang = Math.atan2(ref.current.position.x, ref.current.position.z);
    ref.current.rotation.y = ang;
    // 轻微浮动
    ref.current.position.y = Math.sin(t * 1.2) * 0.3;
    if (flameRef.current) {
      const flameScale = 1 + Math.sin(t * 20) * 0.3;
      flameRef.current.scale.set(flameScale, flameScale * 1.5, flameScale);
      flameRef.current.material.opacity = 0.6 + Math.sin(t * 15) * 0.2;
    }
  });
  return (
    <group ref={ref} position={[0, 0, 22]}>
      {/* 主体 */}
      <mesh>
        <coneGeometry args={[0.4, 1.2, 8]} />
        <meshStandardMaterial color="#e0e7ff" emissive="#a5b4fc" emissiveIntensity={0.3} metalness={0.7} roughness={0.2} />
      </mesh>
      {/* 驾驶舱 */}
      <mesh position={[0, 0.2, 0.3]}>
        <sphereGeometry args={[0.25, 12, 12]} />
        <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.6} transparent opacity={0.7} toneMapped={false} />
      </mesh>
      {/* 尾焰 */}
      <mesh ref={flameRef} position={[0, 0, -0.9]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.18, 0.7, 8]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.7} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* 侧翼 */}
      <mesh position={[0.5, 0, -0.2]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.5, 0.05, 0.4]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[-0.5, 0, -0.2]} rotation={[0, 0, 0.3]}>
        <boxGeometry args={[0.5, 0.05, 0.4]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* 点光源 */}
      <pointLight color="#22d3ee" intensity={0.6} distance={6} decay={1.5} />
    </group>
  );
}

// ====== 事件视觉效果 (太阳耀斑等) ======
function EventEffects({ shields }: { shields: number }) {
  // shields 低时: 屏幕边缘红色 vignette (用一个全屏 quad, 不拦截 raycast)
  return null;
}

function OrbitingBodies({ planetAngles, onHover, onClick, onUnhover, selected }: { planetAngles: React.MutableRefObject<Record<string, number>>; onHover: (id: string) => void; onClick: (id: string) => void; onUnhover: () => void; selected: string | null }) {
  const ref = useRef<THREE.Group>(null!);
  useFrame((_, delta) => {
    for (const b of BODIES) {
      if (b.speed > 0) planetAngles.current[b.id] = (planetAngles.current[b.id] || 0) + b.speed * delta;
    }
  });
  return (
    <group ref={ref}>
      {BODIES.filter((b) => !b.emissive).map((b) => (
        <group key={b.id}>
          <PlanetBody body={b} planetAngles={planetAngles} onHover={onHover} onClick={onClick} onUnhover={onUnhover} selected={selected} />
        </group>
      ))}
    </group>
  );
}

function PlanetBody({ body, planetAngles, onHover, onClick, onUnhover, selected }: { body: Body; planetAngles: React.MutableRefObject<Record<string, number>>; onHover: (id: string) => void; onClick: (id: string) => void; onUnhover: () => void; selected: string | null }) {
  const angle = planetAngles.current[body.id] || 0;
  return <Planet body={body} angle={angle} onHover={onHover} onClick={onClick} onUnhover={onUnhover} selected={selected === body.id} />;
}


// ====== TUNNEL 穿梭模式: 大量陨石迎面飞来 ======
function Tunnel({ onComplete, onShieldHit, onFuelPickup, targetId }: { onComplete: () => void; onShieldHit: (d: number) => void; onFuelPickup: (n: number) => void; targetId: string | null }) {
  const shipRef = useRef<THREE.Group>(null!);
  const keysRef = useRef<Record<string, boolean>>({});
  const startTimeRef = useRef(performance.now() / 1000);
  const doneRef = useRef(false);
  useEffect(() => {
    const down = (e: KeyboardEvent) => { keysRef.current[e.key.toLowerCase()] = true; };
    const up = (e: KeyboardEvent) => { keysRef.current[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', down); window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);
  const ASTEROID_COUNT = 60;
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const asteroids = useRef(Array.from({ length: ASTEROID_COUNT }, () => ({
    pos: new THREE.Vector3((Math.random() - 0.5) * 30, (Math.random() - 0.5) * 18, Math.random() * 60 + 10),
    size: 0.3 + Math.random() * 0.5, rot: 0, rotV: (Math.random() - 0.5) * 2,
  })));
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const FUEL_COUNT = 6;
  const fuelRefs = useRef<THREE.Mesh[]>([]);
  const fuels = useRef(Array.from({ length: FUEL_COUNT }, () => ({
    pos: new THREE.Vector3((Math.random() - 0.5) * 18, (Math.random() - 0.5) * 10, Math.random() * 50 + 15),
    collected: false,
  })));
  useFrame((state, delta) => {
    const now = performance.now() / 1000;
    const t = state.clock.getElapsedTime();
    const elapsed = now - startTimeRef.current;
    const p = Math.min(1, elapsed / 12);
    if (shipRef.current) {
      const k = keysRef.current;
      const spd = 12;
      let dx = 0, dy = 0;
      if (k['w'] || k['arrowup']) dy += 1;
      if (k['s'] || k['arrowdown']) dy -= 1;
      if (k['a'] || k['arrowleft']) dx -= 1;
      if (k['d'] || k['arrowright']) dx += 1;
      if (dx !== 0 || dy !== 0) {
        const len = Math.sqrt(dx * dx + dy * dy);
        shipRef.current.position.x = Math.max(-14, Math.min(14, shipRef.current.position.x + (dx / len) * spd * delta));
        shipRef.current.position.y = Math.max(-8, Math.min(8, shipRef.current.position.y + (dy / len) * spd * delta));
      } else {
        shipRef.current.position.x += (0 - shipRef.current.position.x) * 0.5 * delta;
        shipRef.current.position.y += (0 - shipRef.current.position.y) * 0.5 * delta;
      }
      shipRef.current.position.z = 0;
      shipRef.current.rotation.z = -dx * 0.3;
      shipRef.current.rotation.x = dy * 0.25;
      shipRef.current.rotation.y = t * 0.3;
    }
    if (meshRef.current) {
      for (let i = 0; i < ASTEROID_COUNT; i++) {
        const a = asteroids.current[i];
        a.pos.z -= 22 * delta;
        if (a.pos.z < -15) {
          a.pos.set((Math.random() - 0.5) * 30, (Math.random() - 0.5) * 18, 40 + Math.random() * 15);
          a.size = 0.3 + Math.random() * 0.5;
        }
        a.rot += a.rotV * delta;
        dummy.position.copy(a.pos);
        dummy.rotation.set(a.rot, a.rot * 0.5, 0);
        dummy.scale.setScalar(a.size);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
        if (shipRef.current && Math.abs(a.pos.z) < 1.5) {
          const ddx = a.pos.x - shipRef.current.position.x;
          const ddy = a.pos.y - shipRef.current.position.y;
          const d = Math.sqrt(ddx * ddx + ddy * ddy);
          if (d < a.size + 0.7) { a.pos.z = -50; onShieldHit(15); }
        }
      }
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
    for (let i = 0; i < FUEL_COUNT; i++) {
      const fm = fuels.current[i];
      const f = fuelRefs.current[i];
      if (!f) continue;
      if (fm.collected) { f.visible = false; continue; }
      f.visible = true;
      fm.pos.z -= 14 * delta;
      if (fm.pos.z < -10) { fm.pos.set((Math.random() - 0.5) * 18, (Math.random() - 0.5) * 10, 40 + Math.random() * 10); fm.collected = false; }
      f.position.copy(fm.pos);
      f.rotation.y = t * 2; f.rotation.x = t * 1.5;
      f.scale.setScalar(1 + Math.sin(t * 4 + i) * 0.25);
      if (shipRef.current && Math.abs(fm.pos.z) < 1.5) {
        const ddx = fm.pos.x - shipRef.current.position.x;
        const ddy = fm.pos.y - shipRef.current.position.y;
        const d = Math.sqrt(ddx * ddx + ddy * ddy);
        if (d < 1.3) { fm.collected = true; f.visible = false; onFuelPickup(8); }
      }
    }
    if (p >= 1 && !doneRef.current) { doneRef.current = true; setTimeout(() => onComplete(), 400); }
  });
  return (
    <group>
      <group ref={shipRef} position={[0, 0, 0]}>
        <mesh><coneGeometry args={[0.4, 1.2, 8]} /><meshStandardMaterial color="#e0e7ff" emissive="#a5b4fc" emissiveIntensity={0.6} metalness={0.85} roughness={0.15} /></mesh>
        <mesh position={[0.6, 0, -0.1]} rotation={[0, 0, -0.3]}><boxGeometry args={[0.7, 0.05, 0.5]} /><meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.25} emissive="#475569" emissiveIntensity={0.2} /></mesh>
        <mesh position={[-0.6, 0, -0.1]} rotation={[0, 0, 0.3]}><boxGeometry args={[0.7, 0.05, 0.5]} /><meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.25} emissive="#475569" emissiveIntensity={0.2} /></mesh>
        <mesh position={[0, 0.25, 0.35]}><sphereGeometry args={[0.22, 12, 12]} /><meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={1.0} transparent opacity={0.9} toneMapped={false} metalness={0.2} roughness={0.1} /></mesh>
        <mesh position={[0, 0, -0.85]} rotation={[Math.PI / 2, 0, 0]}><coneGeometry args={[0.22, 0.9, 8]} /><meshBasicMaterial color="#fbbf24" transparent opacity={0.9} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
        <mesh position={[0, 0, -1.4]} rotation={[Math.PI / 2, 0, 0]}><coneGeometry args={[0.4, 1.2, 8]} /><meshBasicMaterial color="#f97316" transparent opacity={0.4} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
        <pointLight color="#22d3ee" intensity={1.0} distance={8} decay={1.5} />
      </group>
      <instancedMesh ref={meshRef} args={[undefined, undefined, ASTEROID_COUNT]}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#6b7280" roughness={0.95} metalness={0.1} />
      </instancedMesh>
      {Array.from({ length: FUEL_COUNT }).map((_, i) => (
        <mesh key={'f' + i} ref={(el) => { if (el) fuelRefs.current[i] = el; }}>
          <octahedronGeometry args={[0.4, 0]} />
          <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={1.0} toneMapped={false} />
        </mesh>
      ))}
      {[-12, 0, 12].map((x) => (
        <mesh key={'w' + x} position={[x, 0, 8]}>
          <boxGeometry args={[0.1, 18, 70]} />
          <meshBasicMaterial color="#a855f7" transparent opacity={0.05} toneMapped={false} />
        </mesh>
      ))}
      <mesh position={[0, 0, 40]}><sphereGeometry args={[2.5, 24, 24]} /><meshBasicMaterial color="#22d3ee" transparent opacity={0.55} toneMapped={false} /></mesh>
      <pointLight position={[0, 0, 40]} color="#22d3ee" intensity={1.5} distance={25} />
    </group>
  );
}

// ====== LANDING 降落挑战: 行星表面障碍 ======
function LandingHazards({ planetId, onHit, onDestroy, onComplete }: { planetId: string | null; onHit: (d: number) => void; onDestroy: () => void; onComplete: () => void }) {
  const shipRef = useRef<THREE.Group>(null!);
  const keysRef = useRef<Record<string, boolean>>({});
  const startRef = useRef(performance.now() / 1000);
  const doneRef = useRef(false);
  useEffect(() => {
    const down = (e: KeyboardEvent) => { keysRef.current[e.key.toLowerCase()] = true; };
    const up = (e: KeyboardEvent) => { keysRef.current[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', down); window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);
  const HAZARD_COUNT = 14;
  const hazardRefs = useRef<THREE.Mesh[]>([]);
  const hazards = useRef(Array.from({ length: HAZARD_COUNT }, (_, i) => ({
    pos: new THREE.Vector3((Math.random() - 0.5) * 12, Math.random() * 4 + 2, 18 + i * 3.5),
    color: '#94a3b8', size: 0.4 + Math.random() * 0.4, rot: 0, rotV: (Math.random() - 0.5) * 2, alive: true,
  })));
  const config = useMemo(() => {
    const id = (planetId || 'earth') as string;
    if (id === 'mercury' || id === 'venus') return { ground: '#92400e', sky: '#fb923c', hazard: '#dc2626' };
    if (id === 'earth') return { ground: '#1e3a8a', sky: '#3b82f6', hazard: '#10b981' };
    if (id === 'mars') return { ground: '#7c2d12', sky: '#ea580c', hazard: '#f59e0b' };
    if (id === 'jupiter' || id === 'neptune') return { ground: '#1e1b4b', sky: '#6366f1', hazard: '#a855f7' };
    if (id === 'saturn') return { ground: '#a16207', sky: '#fbbf24', hazard: '#fbbf24' };
    if (id === 'uranus') return { ground: '#0e7490', sky: '#06b6d4', hazard: '#67e8f9' };
    return { ground: '#374151', sky: '#6b7280', hazard: '#94a3b8' };
  }, [planetId]);
  useEffect(() => { for (const h of hazards.current) h.color = config.hazard; }, [config]);
  useFrame((state, delta) => {
    const now = performance.now() / 1000;
    const t = state.clock.getElapsedTime();
    const elapsed = now - startRef.current;
    const p = Math.min(1, elapsed / 10);
    if (shipRef.current) {
      const k = keysRef.current;
      const spd = 9;
      let dx = 0, dy = 0;
      if (k['a'] || k['arrowleft']) dx -= 1;
      if (k['d'] || k['arrowright']) dx += 1;
      if (k['w'] || k['arrowup']) dy += 1;
      if (k['s'] || k['arrowdown']) dy -= 1;
      if (dx !== 0 || dy !== 0) {
        const len = Math.sqrt(dx * dx + dy * dy);
        shipRef.current.position.x = Math.max(-7, Math.min(7, shipRef.current.position.x + (dx / len) * spd * delta));
        shipRef.current.position.y = Math.max(0.3, Math.min(4, shipRef.current.position.y + (dy / len) * spd * delta));
      } else {
        shipRef.current.position.x += (0 - shipRef.current.position.x) * 0.4 * delta;
      }
      shipRef.current.position.z = 0;
      shipRef.current.rotation.z = -dx * 0.3;
      shipRef.current.rotation.y = t * 0.3;
    }
    for (let i = 0; i < HAZARD_COUNT; i++) {
      const h = hazards.current[i];
      const m = hazardRefs.current[i];
      if (!m || !h.alive) { if (m) m.visible = false; continue; }
      m.visible = true;
      h.pos.z -= 9 * delta;
      if (h.pos.z < -8 || h.pos.y < 0) {
        h.pos.set((Math.random() - 0.5) * 12, Math.random() * 4 + 2, 20 + Math.random() * 25);
        h.alive = true;
      }
      h.rot += h.rotV * delta;
      m.position.copy(h.pos);
      m.rotation.set(h.rot, h.rot * 0.5, 0);
      const mat = m.material as THREE.MeshStandardMaterial;
      if (mat) mat.color.set(h.color);
      m.scale.setScalar(h.size * (1 + Math.sin(t * 4 + i) * 0.15));
      if (shipRef.current && Math.abs(h.pos.z) < 1.2) {
        const ddx = h.pos.x - shipRef.current.position.x;
        const ddy = h.pos.y - shipRef.current.position.y;
        const d = Math.sqrt(ddx * ddx + ddy * ddy);
        if (d < h.size + 0.6) { h.alive = false; m.visible = false; onHit(10); }
      }
    }
    if (p >= 1 && !doneRef.current) { doneRef.current = true; setTimeout(() => onComplete(), 400); }
  });
  const handleClickHazard = (e: any, idx: number) => {
    e.stopPropagation();
    const h = hazards.current[idx];
    if (h && h.alive) {
      h.alive = false;
      const m = hazardRefs.current[idx];
      if (m) m.visible = false;
      onDestroy();
    }
  };
  return (
    <group>
      <mesh position={[0, -2, 5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[60, 100]} />
        <meshStandardMaterial color={config.ground} roughness={0.9} />
      </mesh>
      <mesh position={[0, 15, -10]}>
        <sphereGeometry args={[35, 32, 32]} />
        <meshBasicMaterial color={config.sky} side={THREE.BackSide} transparent opacity={0.7} />
      </mesh>
      {/* 行星天空粉色 雨点 */}
      {Array.from({ length: 200 }).map((_, i) => (
        <mesh key={"p" + i} position={[(Math.random() - 0.5) * 30, Math.random() * 12, (Math.random() - 0.5) * 30]}>
          <sphereGeometry args={[0.04, 4, 4]} />
          <meshBasicMaterial color={config.hazard} transparent opacity={0.5} toneMapped={false} />
        </mesh>
      ))}
      <group ref={shipRef} position={[0, 1, 0]}>
        <mesh><coneGeometry args={[0.35, 1.0, 8]} /><meshStandardMaterial color="#e0e7ff" emissive="#a5b4fc" emissiveIntensity={0.6} metalness={0.85} roughness={0.15} /></mesh>
        <mesh position={[0.5, 0, -0.05]} rotation={[0, 0, -0.3]}><boxGeometry args={[0.55, 0.04, 0.4]} /><meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.25} /></mesh>
        <mesh position={[-0.5, 0, -0.05]} rotation={[0, 0, 0.3]}><boxGeometry args={[0.55, 0.04, 0.4]} /><meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.25} /></mesh>
        <mesh position={[0, 0.2, 0.3]}><sphereGeometry args={[0.2, 12, 12]} /><meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={1.0} transparent opacity={0.9} toneMapped={false} /></mesh>
        <mesh position={[0, 0, -0.65]} rotation={[Math.PI / 2, 0, 0]}><coneGeometry args={[0.18, 0.7, 8]} /><meshBasicMaterial color="#fbbf24" transparent opacity={0.9} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
        <mesh position={[0, 0, -1.1]} rotation={[Math.PI / 2, 0, 0]}><coneGeometry args={[0.32, 0.9, 8]} /><meshBasicMaterial color="#f97316" transparent opacity={0.4} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
        <pointLight color="#22d3ee" intensity={0.9} distance={6} decay={1.5} />
      </group>
      {Array.from({ length: HAZARD_COUNT }).map((_, i) => (
        <mesh key={'hz' + i} ref={(el) => { if (el) hazardRefs.current[i] = el; }} onClick={(e) => handleClickHazard(e, i)}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={config.hazard} emissive={config.hazard} emissiveIntensity={0.6} roughness={0.6} metalness={0.2} />
        </mesh>
      ))}
      <pointLight position={[0, 8, 5]} color={config.sky} intensity={1.0} distance={20} />
    </group>
  );
}

// ====== CLUE 线索收集: 3 个发光点 ======
function CluePoints({ onCollect, onComplete, planetId }: { onCollect: (i: number) => void; onComplete: () => void; planetId: string | null }) {
  const shipRef = useRef<THREE.Group>(null!);
  const keysRef = useRef<Record<string, boolean>>({});
  const CLUE_COUNT = 3;
  const clueRefs = useRef<THREE.Mesh[]>([]);
  const clues = useRef(Array.from({ length: CLUE_COUNT }, (_, i) => ({
    pos: new THREE.Vector3(Math.cos((i / CLUE_COUNT) * Math.PI * 2) * 6, 1 + Math.random() * 2, Math.sin((i / CLUE_COUNT) * Math.PI * 2) * 6),
    collected: false,
  })));
  const startRef = useRef(performance.now() / 1000);
  const doneRef = useRef(false);
  useEffect(() => {
    const down = (e: KeyboardEvent) => { keysRef.current[e.key.toLowerCase()] = true; };
    const up = (e: KeyboardEvent) => { keysRef.current[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', down); window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);
  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const now = performance.now() / 1000;
    const elapsed = now - startRef.current;
    if (shipRef.current) {
      const k = keysRef.current;
      const spd = 7;
      let dx = 0, dz = 0;
      if (k['a'] || k['arrowleft']) dx -= 1;
      if (k['d'] || k['arrowright']) dx += 1;
      if (k['w'] || k['arrowup']) dz -= 1;
      if (k['s'] || k['arrowdown']) dz += 1;
      if (dx !== 0 || dz !== 0) {
        const len = Math.sqrt(dx * dx + dz * dz);
        shipRef.current.position.x = Math.max(-8, Math.min(8, shipRef.current.position.x + (dx / len) * spd * delta));
        shipRef.current.position.z = Math.max(-8, Math.min(8, shipRef.current.position.z + (dz / len) * spd * delta));
      } else {
        shipRef.current.position.x += (0 - shipRef.current.position.x) * 0.3 * delta;
        shipRef.current.position.z += (0 - shipRef.current.position.z) * 0.3 * delta;
      }
      shipRef.current.position.y = 1 + Math.sin(t * 1.2) * 0.3;
      shipRef.current.rotation.y = Math.atan2(dx, -dz);
    }
    let collected = 0;
    for (let i = 0; i < CLUE_COUNT; i++) {
      const c = clues.current[i];
      const m = clueRefs.current[i];
      if (!m) continue;
      if (c.collected) { m.visible = false; collected++; continue; }
      m.visible = true;
      m.position.copy(c.pos);
      m.position.y = c.pos.y + Math.sin(t * 1.5 + i) * 0.4;
      m.rotation.y = t * 1.5;
      m.scale.setScalar(1 + Math.sin(t * 3 + i) * 0.2);
      if (shipRef.current) {
        const ddx = c.pos.x - shipRef.current.position.x;
        const ddz = c.pos.z - shipRef.current.position.z;
        const d = Math.sqrt(ddx * ddx + ddz * ddz);
        if (d < 1.5) { c.collected = true; m.visible = false; onCollect(i); collected++; }
      }
    }
    if (collected >= CLUE_COUNT && !doneRef.current) { doneRef.current = true; setTimeout(() => onComplete(), 600); }
    else if (elapsed > 30 && !doneRef.current) { doneRef.current = true; setTimeout(() => onComplete(), 200); }
  });
  return (
    <group>
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#1f2937" roughness={0.95} />
      </mesh>
      <group ref={shipRef} position={[0, 1, 0]}>
        <mesh><coneGeometry args={[0.35, 1.0, 8]} /><meshStandardMaterial color="#e0e7ff" emissive="#a5b4fc" emissiveIntensity={0.6} metalness={0.85} roughness={0.15} /></mesh>
        <mesh position={[0.5, 0, -0.05]} rotation={[0, 0, -0.3]}><boxGeometry args={[0.55, 0.04, 0.4]} /><meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.25} /></mesh>
        <mesh position={[-0.5, 0, -0.05]} rotation={[0, 0, 0.3]}><boxGeometry args={[0.55, 0.04, 0.4]} /><meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.25} /></mesh>
        <mesh position={[0, 0.2, 0.3]}><sphereGeometry args={[0.2, 12, 12]} /><meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={1.0} transparent opacity={0.9} toneMapped={false} /></mesh>
        <mesh position={[0, 0, -0.65]} rotation={[Math.PI / 2, 0, 0]}><coneGeometry args={[0.18, 0.7, 8]} /><meshBasicMaterial color="#fbbf24" transparent opacity={0.9} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
        <pointLight color="#22d3ee" intensity={0.8} distance={6} decay={1.5} />
      </group>
      {Array.from({ length: CLUE_COUNT }).map((_, i) => (
        <group key={'c' + i}>
          <mesh ref={(el) => { if (el) clueRefs.current[i] = el; }}
            onClick={() => { const c = clues.current[i]; if (c && !c.collected) { c.collected = true; const m = clueRefs.current[i]; if (m) m.visible = false; onCollect(i); } }}>
            <sphereGeometry args={[0.4, 16, 16]} />
            <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={1.2} toneMapped={false} transparent opacity={0.85} />
          </mesh>
          <pointLight color="#fbbf24" intensity={1.0} distance={4} decay={1.5} />
        </group>
      ))}
    </group>
  );
}

function WorldScene({ mode, targetId, onApproachComplete, startTime, planetAngles, hoveredId, setHoveredId, selectedId, onPlanetClick, onWorldEvent, warpFrom, warpTo, shields = 100 }: any) {
  const isImmersive = mode === "TUNNEL" || mode === "LANDING" || mode === "CLUE";
  return (
    <>
      <color attach="background" args={[isImmersive ? "#0a0a1a" : "#02010a"]} />
      <fog attach="fog" args={[isImmersive ? "#0a0a1a" : "#02010a", isImmersive ? 25 : 70, isImmersive ? 90 : 200]} />
      <Starfield count={isImmersive ? 1500 : 4000} radius={isImmersive ? 60 : 220} />
      {!isImmersive && <OrbitRings />}
      {!isImmersive && <Sun shields={shields} />}
      {!isImmersive && <OrbitingBodies planetAngles={planetAngles} onHover={setHoveredId} onClick={onPlanetClick} onUnhover={() => setHoveredId(null)} selected={selectedId} />}
      {!isImmersive && <AsteroidBelt />}
      {!isImmersive && <KuiperBelt />}
      {!isImmersive && <Comet />}
      {!isImmersive && <Meteors />}
      {!isImmersive && <EnergyCrystals onCollect={(idx) => onWorldEvent && onWorldEvent({ kind: "collectCrystal", payload: { idx } })} />}
      {!isImmersive && <Probes onPick={(id) => onWorldEvent && onWorldEvent({ kind: "pickProbe", payload: { id } })} />}
      {!isImmersive && <ZoneTriggers onEnter={(zone) => onWorldEvent && onWorldEvent({ kind: zone })} />}
      {!isImmersive && <Ship />}
      <EventEffects shields={shields} />
      {mode === "TUNNEL" && <Tunnel onComplete={onApproachComplete} onShieldHit={onWorldEvent ? (d) => onWorldEvent({ kind: "tunnelHit", payload: { dmg: d } }) : () => {}} onFuelPickup={onWorldEvent ? (n) => onWorldEvent({ kind: "tunnelPickup", payload: { fuel: n } }) : () => {}} targetId={targetId} />}
        {mode === "LANDING" && <LandingHazards planetId={targetId} onHit={onWorldEvent ? (d) => onWorldEvent({ kind: "landingHit", payload: { dmg: d } }) : () => {}} onDestroy={onWorldEvent ? () => onWorldEvent({ kind: "landingDestroy" }) : () => {}} onComplete={onApproachComplete} />}
        {mode === "CLUE" && <CluePoints onCollect={onWorldEvent ? (i) => onWorldEvent({ kind: "cluePickup", payload: { idx: i } }) : () => {}} onComplete={onApproachComplete} planetId={targetId} />}
        <CameraRig mode={mode} targetId={targetId} onApproachComplete={onApproachComplete} startTime={startTime} warpFrom={warpFrom} warpTo={warpTo} />
    </>
  );
}

export type GameWorldHandle = { setSelected: (id: string | null) => void };
export const GameWorld = forwardRef<GameWorldHandle, { mode: CameraMode; targetId: string | null; onApproachComplete: () => void; onPlanetClick: (id: string) => void; onWorldEvent?: (e: { kind: string; payload?: any }) => void; warpFrom?: [number, number, number]; warpTo?: [number, number, number]; startTime: number; selectedId: string | null; shields?: number }>(function GameWorld({ mode, targetId, onApproachComplete, onPlanetClick, onWorldEvent, warpFrom, warpTo, startTime, selectedId, shields = 100 }, ref) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const planetAngles = useRef<Record<string, number>>({});
  if (Object.keys(planetAngles.current).length === 0) {
    for (let idx = 0; idx < BODIES.length; idx++) {
      const b = BODIES[idx];
      if (b.emissive) { b.initialAngle = 0; continue; }
      planetAngles.current[b.id] = (idx / (BODIES.length - 1)) * Math.PI * 2 + Math.random() * 0.4;
      b.initialAngle = planetAngles.current[b.id];
    }
  }
  useImperativeHandle(ref, () => ({ setSelected: () => {} }));
  return (
    <Canvas dpr={[1, 1.5]} camera={{ position: [40, 30, 60], fov: 55, near: 0.1, far: 500 }} gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}>
      <Suspense fallback={null}>
        <WorldScene mode={mode} targetId={targetId} onApproachComplete={onApproachComplete} startTime={startTime} planetAngles={planetAngles} hoveredId={hoveredId} setHoveredId={setHoveredId} selectedId={selectedId} onPlanetClick={onPlanetClick} warpFrom={warpFrom} warpTo={warpTo} />
      </Suspense>
    </Canvas>
  );
});
