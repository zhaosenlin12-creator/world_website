"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useRef } from "react";
import * as THREE from "three";

function Model({ url }: { url: string }) {
  const gltf = useGLTF(url);
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.25;
  });
  useEffect(() => {
    gltf.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
  }, [gltf]);
  return (
    <group ref={ref}>
      <primitive object={gltf.scene} />
    </group>
  );
}

export function SingleModelViewer({ url }: { url: string }) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [4, 2, 6], fov: 45, near: 0.1, far: 200 }}
      gl={{ antialias: true, alpha: false }}
    >
      <color attach="background" args={["#03050c"]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 6, 5]} intensity={1.4} color="#fff5d6" />
      <directionalLight position={[-5, -2, -5]} intensity={0.5} color="#60a5fa" />
      <Suspense fallback={null}>
        <Model url={url} />
      </Suspense>
      <OrbitControls
        enableDamping
        dampingFactor={0.08}
        minDistance={2}
        maxDistance={30}
        autoRotate
        autoRotateSpeed={1.2}
      />
    </Canvas>
  );
}

