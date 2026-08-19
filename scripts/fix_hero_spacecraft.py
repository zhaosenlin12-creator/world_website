p = 'src/components/fx/Hero3DScene.tsx'
s = open(p, 'r', encoding='utf-8').read()

# 1. 增加 useGLTF import
s = s.replace(
    'import { useTexture } from "@react-three/drei";',
    'import { useTexture, useGLTF } from "@react-three/drei";'
)

# 2. 在 Scene 的 children 中追加 SpacecraftTrails
s = s.replace(
    '      <Comet />\n      <AutoCamera focusId={focusId} />',
    '      <Comet />\n      <SpacecraftTrails />\n      <AutoCamera focusId={focusId} />'
)

# 3. 在文件开头插入组件定义 (在 // 内层 Canvas 场景 之前)
marker = '// 内层 Canvas 场景'
insert = '''// 飞行器漂浮 (NASA 模型)
function SpacecraftTrails() {
  const voyager = useGLTF('/assets/models/nasa/voyager-probe-b/voyager-probe-b.glb');
  const rq36 = useGLTF('/assets/models/nasa/1999-rq36-asteroid/rq36-asteroid.glb');
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

'''
assert marker in s, 'marker not found'
s = s.replace(marker, insert + marker)

open(p, 'w', encoding='utf-8').write(s)
print('OK')
