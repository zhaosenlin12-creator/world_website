"use client";
import { useEffect, useRef, useState, Suspense } from "react";
import { useGLTF } from "@react-three/drei";
import { publicUrl } from "@/lib/assetPath";
import { useFrame } from "@react-three/fiber";
import { ErrorBoundary } from "@/components/fx/ErrorBoundary";
import * as THREE from "three";

// 延迟加载 4 个 NASA GLB 模型 (2 voyager + 2 asteroid)
// 与主场景隔离, 失败时不影响行星/太阳/星场渲染

function SpacecraftModels() {
  const voyager = useGLTF(publicUrl("/assets/models/nasa/voyager-probe-b/voyager-probe-b.glb"));
  const rq36 = useGLTF(publicUrl("/assets/models/nasa/1999-rq36-asteroid/rq36-asteroid.glb"));
  const ref = useRef<THREE.Group>(null!);
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.04;
    ref.current.children.forEach((c, i) => {
      c.rotation.y += delta * 0.5;
      c.rotation.z += delta * 0.1 * (i % 2 ? 1 : -1);
    });
  });
  return (
    <group ref={ref} position={[0, 8, 0]}>
      <primitive object={voyager.scene.clone()} position={[-9, 0, 0]} scale={0.6} />
      <primitive object={voyager.scene.clone()} position={[10, 2, -4]} scale={0.5} />
      <primitive object={rq36.scene.clone()} position={[6, -3, 4]} scale={0.35} />
      <primitive object={rq36.scene.clone()} position={[-7, 3, -6]} scale={0.4} />
    </group>
  );
}

export function SpacecraftTrails() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    // 等首屏行星绘制完毕再加载 GLB
    const t = setTimeout(() => setEnabled(true), 1500);
    return () => clearTimeout(t);
  }, []);
  if (!enabled) return null;
  return (
    <ErrorBoundary fallback={null}>
      <Suspense fallback={null}>
        <SpacecraftModels />
      </Suspense>
    </ErrorBoundary>
  );
}
