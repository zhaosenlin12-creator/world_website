"use client";
import { Canvas, useFrame, useThree, ThreeEvent } from "@react-three/fiber";
import { Stars, OrbitControls, Html, useTexture } from "@react-three/drei";
import { Suspense, useMemo, useRef, useState, useEffect, useLayoutEffect, useCallback, MutableRefObject } from "react";
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

const TEXTURES: Record<string, string> = {
  sun:     "/assets/textures/sun.jpg",
  mercury: "/assets/textures/mercury.jpg",
  venus:   "/assets/textures/venus.jpg",
  earth:   "/assets/textures/earth.jpg",
  mars:    "/assets/textures/mars.jpg",
  jupiter: "/assets/textures/jupiter.jpg",
  saturn:  "/assets/textures/saturn.jpg",
  uranus:  "/assets/textures/uranus.jpg",
  neptune: "/assets/textures/neptune.webp",
  pluto:   "/assets/textures/pluto.jpg",
  ceres:   "/assets/textures/ceres.jpg",
  moon:    "/assets/textures/moon.jpg",
};
const SATURN_RING = "/assets/textures/saturn_ring.jpg";

function nameOf(b: SolarBody) { return b.nameZh || b.name; }

// 程序化生成凹凸贴图
function makeBumpMap(seed: number, scale = 1): THREE.DataTexture {
  const size = 256;
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const u = (x / size) * Math.PI * 2 * scale;
      const v = (y / size) * Math.PI * 2 * scale;
      let n = 0;
      let amp = 1;
      let freq = 1;
      for (let o = 0; o < 4; o++) {
        n += amp * Math.sin((u * freq) + seed * 1.3) * Math.cos((v * freq) + seed * 0.7);
        n += amp * 0.5 * Math.sin((u * freq * 2.1) + seed * 0.9);
        amp *= 0.5;
        freq *= 2;
      }
      n = (n + 2.0) / 4.0;
      const v8 = Math.max(0, Math.min(255, Math.floor(n * 255)));
      data[i] = data[i+1] = data[i+2] = v8;
      data[i+3] = 255;
    }
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
}

// 太阳 shader
const sunVertex = `
  varying vec2 vUv;
  varying vec3 vNormal;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const sunFragment = `
  precision highp float;
  uniform sampler2D map;
  uniform float uTime;
  uniform float uIntensity;
  varying vec2 vUv;
  varying vec3 vNormal;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }
  float fbm(vec2 p) {
    float v = 0.0; float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p *= 2.05; a *= 0.5;
    }
    return v;
  }
  void main() {
    vec2 uv = vUv;
    float t = uTime * 0.06;
    float n1 = fbm(uv * 18.0 + vec2(t, -t * 0.6));
    float n2 = fbm(uv * 7.0 - vec2(t * 0.3, t * 0.5));
    float plasma = n1 * 0.6 + n2 * 0.4;
    vec4 base = texture2D(map, uv);
    vec3 hot = vec3(1.0, 0.95, 0.7);
    vec3 cool = vec3(1.0, 0.55, 0.2);
    vec3 col = mix(cool, hot, plasma) * (0.5 + 0.5 * base.rgb);
    float rim = pow(1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0), 2.0);
    col += vec3(1.0, 0.6, 0.2) * rim * 0.6;
    col *= uIntensity;
    gl_FragColor = vec4(col, 1.0);
  }
`;

function Sun({ paused }: { paused: boolean }) {
  const ref = useRef<THREE.Mesh>(null!);
  const halo = useRef<THREE.Mesh>(null!);
  const halo2 = useRef<THREE.Mesh>(null!);
  const halo3 = useRef<THREE.Mesh>(null!);
  const tex = useTexture(TEXTURES.sun);
  useEffect(() => { tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 2; }, [tex]);

  const materialRef = useRef<THREE.ShaderMaterial>(null!);
  useFrame((_, dt) => {
    if (!paused) {
      if (ref.current) ref.current.rotation.y += dt * 0.04;
      if (materialRef.current) materialRef.current.uniforms.uTime.value += dt;
    }
    const t = Date.now() * 0.001;
    if (halo.current) halo.current.scale.setScalar(1.18 + 0.05 * Math.sin(t * 1.3));
    if (halo2.current) halo2.current.scale.setScalar(1.45 + 0.04 * Math.sin(t * 0.9 + 1));
    if (halo3.current) halo3.current.scale.setScalar(1.9 + 0.03 * Math.sin(t * 0.7 + 2));
  });

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uIntensity: { value: 1.6 },
  }), []);

  return (
    <group>
      <mesh
        ref={ref}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { document.body.style.cursor = "auto"; }}
      >
        <sphereGeometry args={[SCENE.sunSize, 96, 96]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={sunVertex}
          fragmentShader={sunFragment}
          uniforms={{ ...uniforms, map: { value: tex } }}
          toneMapped={false}
        />
        <pointLight color="#fde68a" intensity={5.0} distance={400} decay={1.2} />
        <pointLight color="#f59e0b" intensity={1.4} distance={500} />
      </mesh>
      <mesh ref={halo} scale={1.18}>
        <sphereGeometry args={[SCENE.sunSize, 48, 48]} />
        <meshBasicMaterial color="#fde68a" transparent opacity={0.22} side={THREE.BackSide} depthWrite={false} />
      </mesh>
      <mesh ref={halo2} scale={1.45}>
        <sphereGeometry args={[SCENE.sunSize, 48, 48]} />
        <meshBasicMaterial color="#fb923c" transparent opacity={0.1} side={THREE.BackSide} depthWrite={false} />
      </mesh>
      <mesh ref={halo3} scale={1.9}>
        <sphereGeometry args={[SCENE.sunSize, 48, 48]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.05} side={THREE.BackSide} depthWrite={false} />
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
      <lineBasicMaterial color={color} transparent opacity={0.22} />
    </lineLoop>
  );
}

export interface BodyHandle {
  group: THREE.Group | null;
  mesh: THREE.Mesh | null;
}

interface PlanetProps {
  body: SolarBody;
  onSelect: (id: string) => void;
  paused: boolean;
  showLabel: boolean;
  registerHandle: (id: string, h: BodyHandle) => void;
  unregisterHandle: (id: string) => void;
  highlight: boolean;
}

function Planet({ body, onSelect, paused, showLabel, registerHandle, unregisterHandle, highlight }: PlanetProps) {
  const ref = useRef<THREE.Mesh>(null!);
  const groupRef = useRef<THREE.Group>(null!);
  const [hover, setHover] = useState(false);

  const radius = SCENE.distance(body.orbitAu);
  const size = useMemo(() => {
    const r = body.radiusKm || 1000;
    const s = 0.18 + Math.log10(Math.max(r, 50)) * 0.42;
    return Math.max(0.22, Math.min(2.4, s));
  }, [body.radiusKm]);

  const angleRef = useRef(Math.random() * Math.PI * 2);
  const speed = useMemo(() => 0.18 / Math.sqrt(Math.max(body.orbitAu, 0.05)), [body.orbitAu]);
  const axialTilt = (body.axialTiltDeg || 0) * Math.PI / 180;
  const retrograde = (body.rotationHours || 0) < 0;

  const texPath = TEXTURES[body.id];
  const texture = useTexture(texPath || TEXTURES.earth);
  useEffect(() => {
    if (!texture) return;
    texture.wrapS = THREE.RepeatWrapping;
    texture.anisotropy = 4;
    texture.colorSpace = THREE.SRGBColorSpace;
  }, [texture]);

  const bumpMap = useMemo(() => makeBumpMap((body.id || "x").charCodeAt(0) + (body.id || "x").length, 1.0), [body.id]);

  useLayoutEffect(() => {
    registerHandle(body.id, { group: groupRef.current, mesh: ref.current });
    return () => unregisterHandle(body.id);
  }, [body.id, registerHandle, unregisterHandle]);

  useFrame((_, dt) => {
    if (!paused) angleRef.current += dt * speed;
    if (groupRef.current) {
      const a = angleRef.current;
      groupRef.current.position.set(Math.cos(a) * radius, 0, Math.sin(a) * radius);
    }
    if (ref.current) {
      ref.current.rotation.y += dt * (retrograde ? -0.6 : 0.6) * (size > 0.5 ? 1 : 0.4);
      ref.current.rotation.x = axialTilt;
    }
  });

  const hasAtmosphere = body.id === "earth" || body.id === "venus" || body.id === "jupiter" || body.id === "saturn" || body.id === "uranus" || body.id === "neptune";
  const atmoColor = body.id === "venus" ? "#fcd34d"
    : body.id === "jupiter" ? "#fde68a"
    : body.id === "saturn" ? "#fcd34d"
    : body.id === "uranus" ? "#7dd3fc"
    : body.id === "neptune" ? "#60a5fa"
    : "#60a5fa";

  return (
    <group ref={groupRef}>
      <mesh
        ref={ref}

        onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onSelect(body.id); }}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); setHover(true); document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { setHover(false); document.body.style.cursor = "auto"; }}
        scale={hover || highlight ? size * 1.08 : size}
      >
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          map={texture}
          bumpMap={bumpMap}
          bumpScale={body.id === "jupiter" || body.id === "saturn" ? 0.04 : 0.018}
          roughness={body.id === "mercury" ? 0.85 : body.id === "earth" ? 0.85 : body.id === "mars" ? 0.95 : body.id === "venus" ? 0.7 : body.id === "jupiter" || body.id === "saturn" || body.id === "uranus" || body.id === "neptune" ? 0.55 : 0.85}
          metalness={body.id === "mercury" ? 0.4 : body.id === "venus" ? 0.15 : body.id === "earth" ? 0.05 : body.id === "mars" ? 0.05 : body.id === "jupiter" || body.id === "saturn" ? 0.0 : body.id === "uranus" || body.id === "neptune" ? 0.0 : 0.1}
          emissive={highlight ? body.color : body.color}
          emissiveIntensity={highlight ? 0.18 : 0.04}
        />
      </mesh>

      {hasAtmosphere && (
        <mesh scale={size * 1.12}>
          <sphereGeometry args={[1, 48, 48]} />
          <meshBasicMaterial color={atmoColor} transparent opacity={body.id === "earth" ? 0.12 : body.id === "venus" ? 0.18 : 0.08} side={THREE.BackSide} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      )}

      {body.id === "earth" && <EarthClouds size={size} paused={paused} />}
      {body.id === "saturn" && <SaturnRings size={size} />}
      {body.id === "earth" && <Moon size={size} paused={paused} />}

      {showLabel && (
        <Html position={[0, size * 1.4, 0]} center distanceFactor={10} className="pointer-events-none">
          <div className={`text-[10px] tracking-widest px-1.5 py-0.5 rounded ${highlight ? "bg-white/20 text-white" : "text-white/60"}`} style={{ textShadow: "0 0 4px black" }}>
            {nameOf(body)}
          </div>
        </Html>
      )}
    </group>
  );
}

function EarthClouds({ size, paused }: { size: number; paused: boolean }) {
  const cloudsRef = useRef<THREE.Mesh>(null!);
  useFrame((_, dt) => {
    if (!paused && cloudsRef.current) cloudsRef.current.rotation.y += dt * 0.05;
  });
  return (
    <mesh ref={cloudsRef} scale={size * 1.02}>
      <sphereGeometry args={[1, 48, 48]} />
      <meshStandardMaterial color="#ffffff" transparent opacity={0.32} depthWrite={false} roughness={1} />
    </mesh>
  );
}

function SaturnRings({ size }: { size: number }) {
  const ringTex = useTexture(SATURN_RING);
  useEffect(() => {
    if (ringTex) {
      ringTex.colorSpace = THREE.SRGBColorSpace;
      ringTex.anisotropy = 4;
    }
  }, [ringTex]);
  return (
    <group rotation={[Math.PI / 2.4, 0, 0]}>
      <mesh>
        <ringGeometry args={[size * 1.35, size * 2.4, 128]} />
        <meshStandardMaterial map={ringTex} transparent opacity={0.92} side={THREE.DoubleSide} depthWrite={false} roughness={0.7} metalness={0.1} />
      </mesh>
      <mesh>
        <ringGeometry args={[size * 1.32, size * 1.36, 96]} />
        <meshBasicMaterial color="#1a1530" transparent opacity={0.85} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh>
        <ringGeometry args={[size * 2.2, size * 2.25, 96]} />
        <meshBasicMaterial color="#0f0a1f" transparent opacity={0.7} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Moon({ size, paused }: { size: number; paused: boolean }) {
  const moonTex = useTexture(TEXTURES.moon);
  useEffect(() => { if (moonTex) { moonTex.colorSpace = THREE.SRGBColorSpace; moonTex.anisotropy = 4; } }, [moonTex]);
  const moonRef = useRef<THREE.Mesh>(null!);
  const mAngle = useRef(0);
  useFrame((_, dt) => {
    if (!paused) mAngle.current += dt * 0.6;
    if (moonRef.current) {
      const m = mAngle.current;
      const mr = size * 2.4;
      moonRef.current.position.set(Math.cos(m) * mr, 0, Math.sin(m) * mr);
      moonRef.current.rotation.y += dt * 0.05;
    }
  });
  const moonBump = useMemo(() => makeBumpMap(7, 1.4), []);
  return (
    <mesh ref={moonRef}>
      <sphereGeometry args={[size * 0.27, 32, 32]} />
      <meshStandardMaterial map={moonTex} bumpMap={moonBump} bumpScale={0.04} roughness={0.95} metalness={0.0} />
    </mesh>
  );
}

function AsteroidBelt({ paused }: { paused: boolean }) {
  const ref = useRef<THREE.Points>(null!);
  const { positions, count } = useMemo(() => {
    const c = 800;
    const pos = new Float32Array(c * 3);
    for (let i = 0; i < c; i++) {
      const r = 14 + Math.random() * 3.5;
      const a = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 0.6;
      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(a) * r;
    }
    return { positions: pos, count: c };
  }, []);
  useFrame((_, dt) => {
    if (ref.current && !paused) ref.current.rotation.y += dt * 0.005;
  });
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, [positions]);
  return (
    <points ref={ref} geometry={geom}>
      <pointsMaterial color="#94a3b8" size={0.08} sizeAttenuation transparent opacity={0.85} depthWrite={false} />
    </points>
  );
}

function FocusDriver({ handlesRef, selectedIdRef, enabled, focusDistance }: { handlesRef: MutableRefObject<Map<string, BodyHandle>>; selectedIdRef: MutableRefObject<string | null>; enabled: boolean; focusDistance: number }) {
  const { camera, controls } = useThree() as any;
  const targetVec = useMemo(() => new THREE.Vector3(), []);
  const desiredPos = useMemo(() => new THREE.Vector3(), []);
  const offsetVec = useMemo(() => new THREE.Vector3(), []);
  const lastTargetId = useRef<string | null>(null);

  // 每次切换目标时,记录一个从旧位置看新目标的方向,保持视角连续
  useFrame((_, dt) => {
    if (!enabled) return;
    const id = selectedIdRef.current;
    if (!id) return;
    const h = handlesRef.current.get(id);
    if (!h || !h.group) return;

    h.group.getWorldPosition(targetVec);

    if (lastTargetId.current !== id) {
      lastTargetId.current = id;
      offsetVec.copy(camera.position).sub(targetVec);
      if (offsetVec.lengthSq() < 1e-3) offsetVec.set(0.6, 0.5, 1);
      offsetVec.normalize();
    }

    const dist = focusDistance;
    const t = Math.min(1, dt * 2.4);
    desiredPos.copy(targetVec).add(offsetVec.clone().multiplyScalar(dist));
    camera.position.lerp(desiredPos, t);

    if (controls) {
      controls.target.lerp(targetVec, t);
      controls.update?.();
    } else {
      camera.lookAt(targetVec);
    }
  });
  return null;
}

function Scene({ selectedId, onSelect, paused, speed, showOrbits, showLabels }: SceneProps) {
  // 使用 ref 而非 state 避免 re-render 循环
  const handlesRef = useRef<Map<string, BodyHandle>>(new Map());
  const selectedIdRef = useRef<string | null>(selectedId);
  const [focusDistance, setFocusDistance] = useState(6);
  const registerHandle = useCallback((id: string, h: BodyHandle) => {
    handlesRef.current.set(id, h);
  }, []);
  const unregisterHandle = useCallback((id: string) => {
    handlesRef.current.delete(id);
  }, []);

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  useEffect(() => {
    if (!selectedId) { setFocusDistance(6); return; }
    const b = ALL_BODIES.find(x => x.id === selectedId);
    if (!b) return;
    const r = b.radiusKm || 1000;
    const s = Math.max(0.22, Math.min(2.4, 0.18 + Math.log10(Math.max(r, 50)) * 0.42));
    if (selectedId === "sun") setFocusDistance(SCENE.sunSize * 5.5);
    else if (selectedId === "jupiter" || selectedId === "saturn") setFocusDistance(Math.max(5, s * 6.0));
    else if (selectedId === "mercury" || selectedId === "mars") setFocusDistance(4.5);
    else setFocusDistance(Math.max(3.5, s * 4.5));
  }, [selectedId]);

  return (
    <>
      <ambientLight intensity={0.55} color="#fff1d6" />
      <directionalLight position={[5, 10, 5]} intensity={0.85} color="#fff7e6" />
      <Stars radius={150} depth={50} count={4000} factor={4} fade speed={0.6} />
      <Sun paused={paused} />
      {showOrbits && BODIES.map((b) => (
        <Orbit key={"o-" + b.id} radius={SCENE.distance(b.orbitAu)} color="#4f46e5" />
      ))}
      {showOrbits && <AsteroidBelt paused={paused} />}
      {BODIES.map((b) => (
        <Planet
          key={b.id}
          body={b}
          onSelect={onSelect}
          paused={paused}
          showLabel={showLabels}
          registerHandle={registerHandle}
          unregisterHandle={unregisterHandle}
          highlight={selectedId === b.id}
        />
      ))}
      <FocusDriver handlesRef={handlesRef} selectedIdRef={selectedIdRef} enabled={!!selectedId} focusDistance={focusDistance} />
      <OrbitControls
        enablePan
        enableZoom
        minDistance={1.2}
        maxDistance={600}
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
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance", stencil: false, depth: true }}
      camera={{ position: [0, 25, 55], fov: 50, near: 0.1, far: 1000 }}
      onPointerMissed={() => props.onSelect("")}
      dpr={[1, 1.5]}
      performance={{ min: 0.5 }}
    >
      <color attach="background" args={["#05060f"]} />
      <fog attach="fog" args={["#020617", 80, 300]} />
      <Suspense fallback={null}>
        <Scene {...props} />
      </Suspense>
    </Canvas>
  );
}