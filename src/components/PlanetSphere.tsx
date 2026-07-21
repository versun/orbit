/**
 * PlanetSphere.tsx — 单颗行星 3D 预览球（可复用：信息面板 / 图鉴卡片 / 详情页）
 *
 * 一个独立的小型 R3F Canvas，渲染带真实纹理、轴倾角与自转的行星。
 */

import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  SATURN_RING_RADII, rotationRate,
  type PlanetMeta,
} from '@/lib/planets';
import { useSRGBTexture, buildRingGeometry } from '@/lib/three-utils';

function Clouds() {
  const cloudsTex = useSRGBTexture('/tex-earth-clouds.png');
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += 0.02 * delta;
  });
  return (
    <mesh ref={ref} scale={1.025}>
      <sphereGeometry args={[1, 48, 48]} />
      <meshStandardMaterial map={cloudsTex} transparent depthWrite={false} opacity={0.85} roughness={0.9} />
    </mesh>
  );
}

function Rings() {
  const ringTex = useSRGBTexture('/tex-saturn-rings.png');
  const ringGeo = useMemo(
    () => buildRingGeometry(SATURN_RING_RADII.inner, SATURN_RING_RADII.outer, 96),
    [],
  );
  return (
    <mesh geometry={ringGeo} rotation={[Math.PI / 2, 0, 0]}>
      <meshBasicMaterial map={ringTex} transparent side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

function Body({ meta, speed }: { meta: PlanetMeta; speed: number }) {
  const tex = useSRGBTexture(meta.texture);
  const spinRef = useRef<THREE.Mesh>(null);
  const omega = rotationRate(meta) * speed;

  useFrame((_, delta) => {
    if (spinRef.current) spinRef.current.rotation.y += omega * delta;
  });

  return (
    <group rotation={[0.18, 0, THREE.MathUtils.degToRad(Math.min(meta.axialTiltDeg, 60) * 0.6)]}>
      <mesh ref={spinRef}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshStandardMaterial map={tex} roughness={meta.roughness} metalness={meta.metalness} />
      </mesh>
      {meta.slug === 'earth' && <Clouds />}
      {meta.slug === 'saturn' && <Rings />}
    </group>
  );
}

export interface PlanetSphereProps {
  meta: PlanetMeta;
  /** 自转速率倍率（默认 1：地球约 24s 一圈） */
  speed?: number;
  className?: string;
  /** 相机距离（含环天体需更远） */
  fit?: number;
}

export default function PlanetSphere({ meta, speed = 1, className, fit }: PlanetSphereProps) {
  const camZ = fit ?? (meta.slug === 'saturn' ? 3.4 : 2.6);
  return (
    <div className={className} style={{ width: '100%', height: '100%' }}>
      <Canvas
        dpr={[1, 2]}
        camera={{ fov: 40, position: [0, 0, camZ] }}
        gl={{ antialias: true, alpha: true }}
        resize={{ offsetSize: true }}
      >
        <ambientLight intensity={0.35} />
        <directionalLight position={[4, 3, 5]} intensity={1.8} color="#FFF2D8" />
        <Suspense fallback={null}>
          <Body meta={meta} speed={speed} />
        </Suspense>
      </Canvas>
    </div>
  );
}
