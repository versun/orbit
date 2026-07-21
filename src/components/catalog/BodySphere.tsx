/**
 * BodySphere.tsx — 图鉴/档案页通用天体 3D 球
 *
 * 与共享 PlanetSphere 同源的材质与光照配方，额外支持：
 *  - 太阳（自发光 + 双层光晕 + 3s 脉动）
 *  - mode="real"：按真实直径等比缩放（地球 = 1），超出视口自然裁切
 *  - interactive：OrbitControls 拖拽旋转 + 滚轮缩放（0.8–1.6×）
 *  - showMoon：地月同框小演示（tex-moon.jpg）
 */

import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { SATURN_RING_RADII, rotationRate, PLANET_MAP } from '@/lib/planets';
import { useSRGBTexture, buildRingGeometry } from '@/lib/three-utils';
import type { BodyProfile } from './catalog-data';

const TWO_PI = Math.PI * 2;

/* ---------------- 地球云层壳 ---------------- */
function Clouds({ spinRate }: { spinRate: number }) {
  const cloudsTex = useSRGBTexture('/tex-earth-clouds.png');
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += (spinRate * 1.25 + 0.004) * delta;
  });
  return (
    <mesh ref={ref} scale={1.025}>
      <sphereGeometry args={[1, 48, 48]} />
      <meshStandardMaterial map={cloudsTex} transparent depthWrite={false} opacity={0.85} roughness={0.9} />
    </mesh>
  );
}

/* ---------------- 土星环 ---------------- */
function Rings() {
  const ringTex = useSRGBTexture('/tex-saturn-rings.png');
  const ringGeo = useMemo(
    () => buildRingGeometry(SATURN_RING_RADII.inner, SATURN_RING_RADII.outer, 96),
    [],
  );
  return (
    <mesh geometry={ringGeo} rotation={[Math.PI / 2, 0, 0]}>
      <meshBasicMaterial map={ringTex} transparent side={THREE.DoubleSide} depthWrite={false} toneMapped={false} opacity={0.95} />
    </mesh>
  );
}

/* ---------------- 月球（地月演示） ---------------- */
function Moon() {
  const tex = useSRGBTexture('/tex-moon.jpg');
  const orbitRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (orbitRef.current) orbitRef.current.rotation.y += delta * 0.22;
  });
  return (
    <group ref={orbitRef} rotation={[0.09, 0, 0]}>
      <mesh position={[1.9, 0, 0]} scale={0.2727}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial map={tex} roughness={1} metalness={0} />
      </mesh>
    </group>
  );
}

/* ---------------- 行星体 ---------------- */
function PlanetBody({ body, speed }: { body: BodyProfile; speed: number }) {
  const tex = useSRGBTexture(body.texture);
  const spinRef = useRef<THREE.Mesh>(null);
  // 与共享 PlanetSphere 一致：按真实相对速率的归一化自转
  const omega = rotationRate(PLANET_MAP[body.slug as keyof typeof PLANET_MAP] ?? PLANET_MAP.earth) * speed;

  useFrame((_, delta) => {
    if (spinRef.current) spinRef.current.rotation.y += omega * delta;
  });

  return (
    <group rotation={[0.14, 0, THREE.MathUtils.degToRad(body.axialTiltDeg)]}>
      <mesh ref={spinRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial map={tex} roughness={body.roughness} metalness={body.metalness} />
      </mesh>
      {body.slug === 'earth' && <Clouds spinRate={omega} />}
      {body.slug === 'saturn' && <Rings />}
    </group>
  );
}

/* ---------------- 太阳体 ---------------- */
function SunBody() {
  const tex = useSRGBTexture('/tex-sun.jpg');
  const meshRef = useRef<THREE.Mesh>(null);
  const glowTex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const ctx = c.getContext('2d')!;
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, 'rgba(255,214,140,0.9)');
    g.addColorStop(0.35, 'rgba(255,178,80,0.38)');
    g.addColorStop(1, 'rgba(255,160,60,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }, []);

  useFrame(({ clock }) => {
    const s = 1 + 0.01 * Math.sin((clock.elapsedTime * TWO_PI) / 3);
    meshRef.current?.scale.setScalar(s);
    if (meshRef.current) meshRef.current.rotation.y += 0.0016;
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshBasicMaterial map={tex} color="#FFE9C4" toneMapped={false} />
      </mesh>
      <sprite scale={[2.2, 2.2, 1]}>
        <spriteMaterial map={glowTex} blending={THREE.AdditiveBlending} depthWrite={false} transparent opacity={0.75} />
      </sprite>
      <sprite scale={[3.6, 3.6, 1]}>
        <spriteMaterial map={glowTex} blending={THREE.AdditiveBlending} depthWrite={false} transparent opacity={0.32} />
      </sprite>
    </group>
  );
}

/* ---------------- 主组件 ---------------- */
export interface BodySphereProps {
  body: BodyProfile;
  /** uniform = 统一观感尺寸；real = 真实等比（地球 = 1，超出自然裁切） */
  mode?: 'uniform' | 'real';
  /** 自转速率倍率 */
  speed?: number;
  /** 可交互：拖拽旋转 + 滚轮缩放（0.8–1.6×） */
  interactive?: boolean;
  /** 地月同框小演示（仅 earth 生效） */
  showMoon?: boolean;
  /** 相机基准距离覆盖 */
  fit?: number;
  className?: string;
}

export default function BodySphere({
  body,
  mode = 'uniform',
  speed = 1,
  interactive = false,
  showMoon = false,
  fit,
  className,
}: BodySphereProps) {
  const isSaturn = body.slug === 'saturn';
  // fov 40° 下的取景距离：普通天体球径占画面 ~80%（NDC≈0.8）；
  // 土星按环外径 2.27 取景（NDC≈0.88）；地月同框按月球轨道 2.17 取景（NDC≈0.9）
  const baseFit = fit ?? (body.isStar ? 3.4 : isSaturn ? 7.0 : showMoon ? 6.6 : 3.4);
  // 真实等比：地球 = 1 → 半径 1；其余按 radiusEarth 缩放（太阳 109.2 → 自然充满并裁切）
  const scale = mode === 'real' ? body.radiusEarth : 1;
  // 等比模式下相机随尺寸外移，保证地球观感与统一模式一致；巨行星/太阳只显示弧形局部
  const camZ = mode === 'real' ? Math.max(baseFit * scale, baseFit) : baseFit;

  return (
    <div className={className} style={{ width: '100%', height: '100%' }}>
      <Canvas
        dpr={[1, 2]}
        camera={{ fov: 40, position: [0, 0, camZ] }}
        gl={{ antialias: true, alpha: true }}
        resize={{ offsetSize: true }}
      >
        <ambientLight intensity={body.isStar ? 0 : 0.35} />
        {!body.isStar && <directionalLight position={[4, 3, 5]} intensity={1.8} color="#FFF2D8" />}
        <Suspense fallback={null}>
          <group scale={scale}>
            {body.isStar ? <SunBody /> : <PlanetBody body={body} speed={speed} />}
            {showMoon && body.slug === 'earth' && <Moon />}
          </group>
        </Suspense>
        {interactive && (
          <OrbitControls
            makeDefault
            enablePan={false}
            enableDamping
            dampingFactor={0.08}
            rotateSpeed={0.55}
            minDistance={baseFit / 1.6}
            maxDistance={baseFit / 0.8}
          />
        )}
      </Canvas>
    </div>
  );
}
