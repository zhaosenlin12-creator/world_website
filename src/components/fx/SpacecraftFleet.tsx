"use client";

import { Canvas, ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { Float, OrbitControls, Stars, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useRef } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

export interface FleetModel {
  slug: string;
  title: string;
  url: string;
  description: string;
  narration: string;
  scale?: number;
}

interface Props {
  models: FleetModel[];
  selectedSlug: string | null;
  onSelect: (slug: string) => void;
}

type Placement = {
  position: [number, number, number];
  driftAmp: number;
  driftPhase: number;
  driftSpeed: number;
  spinY: number;
  spinZ: number;
};

function buildPlacement(index: number, total: number): Placement {
  const ringIndex = Math.floor(index / 4);
  const ringSize = ringIndex === 0 ? Math.min(4, total) : Math.min(3, Math.max(1, total - ringIndex * 4));
  const ringRadius = 22 + ringIndex * 16;
  const angleBase = (index % Math.max(ringSize, 1)) / Math.max(ringSize, 1);
  const angle = angleBase * Math.PI * 2 + ringIndex * 0.55;
  const verticalBand = ((index % 5) - 2) * 4.5;
  const depthBias = ringIndex % 2 === 0 ? -10 - index * 1.5 : 10 + index * 1.2;

  return {
    position: [
      Math.cos(angle) * ringRadius,
      verticalBand + Math.sin(angle * 2.3) * 3.2,
      Math.sin(angle) * (ringRadius * 0.9) + depthBias,
    ],
    driftAmp: 1.8 + (index % 3) * 0.55,
    driftPhase: index * 0.8,
    driftSpeed: 0.18 + (index % 4) * 0.04,
    spinY: 0.1 + (index % 4) * 0.03,
    spinZ: ((index % 5) - 2) * 0.018,
  };
}

function BackgroundSun() {
  return (
    <mesh position={[-120, 36, -120]}>
      <sphereGeometry args={[18, 32, 32]} />
      <meshBasicMaterial color="#f9d86f" />
    </mesh>
  );
}

function FocusRig({
  selectedSlug,
  positionsRef,
  controlsRef,
}: {
  selectedSlug: string | null;
  positionsRef: React.MutableRefObject<Record<string, THREE.Vector3>>;
  controlsRef: React.MutableRefObject<OrbitControlsImpl | null>;
}) {
  const { camera } = useThree();
  const lookAtRef = useRef(new THREE.Vector3(0, 0, 0));
  const desiredCamera = useRef(new THREE.Vector3(0, 14, 110));

  useFrame((_, delta) => {
    const selectedPosition = selectedSlug ? positionsRef.current[selectedSlug] : null;
    if (selectedPosition) {
      const offset = new THREE.Vector3(0, 10, 30);
      desiredCamera.current.copy(selectedPosition).add(offset);
      lookAtRef.current.lerp(selectedPosition, 1 - Math.pow(0.08, delta));
    } else {
      desiredCamera.current.lerp(new THREE.Vector3(0, 14, 110), 1 - Math.pow(0.08, delta));
      lookAtRef.current.lerp(new THREE.Vector3(0, 0, 0), 1 - Math.pow(0.08, delta));
    }
    camera.position.lerp(desiredCamera.current, 1 - Math.pow(0.12, delta));
    if (controlsRef.current) {
      controlsRef.current.target.lerp(lookAtRef.current, 1 - Math.pow(0.12, delta));
      controlsRef.current.update();
    } else {
      camera.lookAt(lookAtRef.current);
    }
  });

  return null;
}

function SelectionHalo({ active }: { active: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    ref.current.rotation.z = t * 0.55;
    const scale = active ? 1.1 + Math.sin(t * 4) * 0.08 : 0.9 + Math.sin(t * 3) * 0.04;
    ref.current.scale.setScalar(scale);
  });

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.2, 0]}>
      <ringGeometry args={[2.9, 3.4, 64]} />
      <meshBasicMaterial
        color={active ? "#67e8f9" : "#5b6b8d"}
        transparent
        opacity={active ? 0.95 : 0.4}
        toneMapped={false}
      />
    </mesh>
  );
}

function ModelNode({
  model,
  placement,
  selected,
  onSelect,
  onPositionChange,
}: {
  model: FleetModel;
  placement: Placement;
  selected: boolean;
  onSelect: (slug: string) => void;
  onPositionChange: (slug: string, position: THREE.Vector3) => void;
}) {
  const gltf = useGLTF(model.url);
  const group = useRef<THREE.Group>(null);
  const hoverRef = useRef(false);

  useFrame((state, delta) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime();
    const [baseX, baseY, baseZ] = placement.position;
    group.current.position.x = baseX + Math.sin(t * placement.driftSpeed + placement.driftPhase) * placement.driftAmp;
    group.current.position.y = baseY + Math.cos(t * (placement.driftSpeed * 0.8) + placement.driftPhase) * (placement.driftAmp * 0.5);
    group.current.position.z = baseZ + Math.sin(t * (placement.driftSpeed * 0.55) + placement.driftPhase) * (placement.driftAmp * 0.7);
    group.current.rotation.y += delta * placement.spinY;
    group.current.rotation.z = Math.sin(t * 0.4 + placement.driftPhase) * placement.spinZ;

    const scaleTarget = selected ? 1.16 : hoverRef.current ? 1.08 : 1;
    const currentScale = group.current.scale.x;
    const nextScale = THREE.MathUtils.lerp(currentScale, scaleTarget * (model.scale ?? 1), 0.08);
    group.current.scale.setScalar(nextScale);

    onPositionChange(model.slug, group.current.position);
  });

  const handlePointerOver = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    hoverRef.current = true;
    document.body.style.cursor = "pointer";
  };

  const handlePointerOut = () => {
    hoverRef.current = false;
    document.body.style.cursor = "default";
  };

  return (
    <Float floatIntensity={0.35} rotationIntensity={0.08} speed={0.9}>
      <group
        ref={group}
        onClick={(event) => {
          event.stopPropagation();
          onSelect(model.slug);
        }}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <primitive object={gltf.scene} />
        <SelectionHalo active={selected} />
      </group>
    </Float>
  );
}

function SceneInner({
  models,
  selectedSlug,
  onSelect,
  onPositionChange,
}: {
  models: FleetModel[];
  selectedSlug: string | null;
  onSelect: (slug: string) => void;
  onPositionChange: (slug: string, position: THREE.Vector3) => void;
}) {
  return (
    <>
      <color attach="background" args={["#03050c"]} />
      <fog attach="fog" args={["#03050c", 120, 220]} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[45, 24, 26]} intensity={1.5} color="#fff4d6" />
      <directionalLight position={[-35, -16, -18]} intensity={0.8} color="#7dd3fc" />
      <pointLight position={[-80, 25, -70]} intensity={2.2} color="#ffd76a" distance={220} />
      <Stars radius={220} depth={90} count={5000} factor={4} saturation={0} fade speed={0.35} />
      <BackgroundSun />
      {models.map((model, index) => {
        const placement = buildPlacement(index, models.length);
        return (
          <Suspense key={model.slug} fallback={null}>
            <ModelNode
              model={model}
              placement={placement}
              selected={selectedSlug === model.slug}
              onSelect={onSelect}
              onPositionChange={(slug, position) => {
                onPositionChange(slug, position);
              }}
            />
          </Suspense>
        );
      })}
    </>
  );
}

export function SpacecraftFleet({ models, selectedSlug, onSelect }: Props) {
  const positionsRef = useRef<Record<string, THREE.Vector3>>({});
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  useEffect(() => {
    return () => {
      document.body.style.cursor = "default";
    };
  }, []);

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 14, 110], fov: 42, near: 0.1, far: 700 }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      onPointerMissed={() => {
        document.body.style.cursor = "default";
      }}
    >
      <Suspense fallback={null}>
        <SceneInner
          models={models}
          selectedSlug={selectedSlug}
          onSelect={onSelect}
          onPositionChange={(slug, position) => {
            positionsRef.current[slug] = position.clone();
          }}
        />
      </Suspense>
      <FocusRig selectedSlug={selectedSlug} positionsRef={positionsRef} controlsRef={controlsRef} />
      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.08}
        enablePan
        minDistance={12}
        maxDistance={260}
        maxPolarAngle={Math.PI * 0.92}
        autoRotate={!selectedSlug}
        autoRotateSpeed={0.12}
      />
    </Canvas>
  );
}
