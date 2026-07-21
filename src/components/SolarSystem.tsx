/**
 * SolarSystem.tsx — 实时太阳系 3D 场景（全站复用，design.md §8）
 *
 * 特性：
 *  - JPL 开普勒根数实时定位（clock 驱动，见 lib/simulation.ts）
 *  - 行星真实等比半径，双模式（real / enhanced），尺寸弹性过渡
 *  - 每颗行星 MeshStandardMaterial + 写实纹理；地球独立云层壳；土星环；真实轴倾角；相对自转速率
 *  - 完整椭圆轨道线（含真实轨道倾角），选中行星轨道高亮
 *  - 太阳自发光 + 双层加色光晕 + 3s 脉动
 *  - 点击行星相机飞行（1.2s ease-in-out）并跟随；点击空白/再次点击归位
 *  - 3D 斜视 / 俯视双视角
 *
 * 复用方式：
 *   const clock = new SimulationClock() 或 useSimulationClock()
 *   <SolarSystem clock={clock} scaleMode="enhanced" selectedSlug={sel} onSelectPlanet={setSel} />
 *   通过 ref.resetView() 重置视角。
 */

import {
  forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState,
  type CSSProperties,
} from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, Line, OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { heliocentricState, orbitPathPoints, type PlanetSlug } from '@/lib/ephemeris';
import {
  PLANETS, SCENE, SATURN_RING_RADII,
  heliocentricToScene, planetSceneRadius, rotationRate, formatAU,
  type DistanceMode, type PlanetMeta, type ScaleMode,
} from '@/lib/planets';
import { useSRGBTexture, buildRingGeometry } from '@/lib/three-utils';
import type { SimulationClock } from '@/lib/simulation';

export type ViewMode = 'perspective' | 'top';

export interface SolarSystemRef {
  /** 相机回到默认全景视角 */
  resetView: () => void;
}

export interface SolarSystemProps {
  clock: SimulationClock;
  scaleMode?: ScaleMode;
  distanceMode?: DistanceMode;
  viewMode?: ViewMode;
  selectedSlug?: PlanetSlug | null;
  onSelectPlanet?: (slug: PlanetSlug | null) => void;
  onHoverPlanet?: (slug: PlanetSlug | null) => void;
  /** low：移动端（星点减半、球体分段降低） */
  quality?: 'high' | 'low';
  interactive?: boolean;
  showOrbits?: boolean;
  className?: string;
  style?: CSSProperties;
}

type PosMap = Record<string, THREE.Vector3>;

const EASE_IN_OUT = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
/** 自转可视限幅（弧度/真实秒 ≈ 2.5 圈/秒）：1 天/秒档以下完全按真实比例，10 天/秒档防频闪 */
const MAX_SPIN_RAD_S = 16;
const damp = (cur: number, target: number, lambda: number, dt: number) =>
  cur + (target - cur) * (1 - Math.exp(-lambda * dt));

function defaultCamPos(viewMode: ViewMode): THREE.Vector3 {
  const d = SCENE.CAM_DIST;
  const alt = viewMode === 'top' ? THREE.MathUtils.degToRad(88) : THREE.MathUtils.degToRad(38);
  return new THREE.Vector3(0, d * Math.sin(alt), d * Math.cos(alt));
}

/* ---------------- 太阳 ---------------- */
function SunMesh({ quality }: { quality: 'high' | 'low' }) {
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
  const seg = quality === 'low' ? 32 : 64;

  useFrame(({ clock: three }) => {
    const s = 1 + 0.01 * Math.sin((three.elapsedTime * Math.PI * 2) / 3);
    meshRef.current?.scale.setScalar(s);
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[SCENE.SUN_VISUAL_R, seg, seg]} />
        <meshBasicMaterial map={tex} color="#FFE9C4" toneMapped={false} />
      </mesh>
      {/* 双层加色光晕 */}
      <sprite scale={[SCENE.SUN_VISUAL_R * 3.6, SCENE.SUN_VISUAL_R * 3.6, 1]}>
        <spriteMaterial map={glowTex} blending={THREE.AdditiveBlending} depthWrite={false} transparent opacity={0.85} />
      </sprite>
      <sprite scale={[SCENE.SUN_VISUAL_R * 6.4, SCENE.SUN_VISUAL_R * 6.4, 1]}>
        <spriteMaterial map={glowTex} blending={THREE.AdditiveBlending} depthWrite={false} transparent opacity={0.4} />
      </sprite>
      {/* 中心光源（decay 0：各行星均匀受光） */}
      <pointLight intensity={2.2} distance={0} decay={0} color="#FFF2D8" />
    </group>
  );
}

/* ---------------- 地球云层壳 ---------------- */
function EarthClouds({ seg, cloudRef }: { seg: number; cloudRef: React.RefObject<THREE.Mesh | null> }) {
  const cloudsTex = useSRGBTexture('/tex-earth-clouds.png');
  return (
    <mesh ref={cloudRef} scale={1.025}>
      <sphereGeometry args={[1, seg, seg]} />
      <meshStandardMaterial map={cloudsTex} transparent depthWrite={false} roughness={0.9} opacity={0.85} />
    </mesh>
  );
}

/* ---------------- 土星环 ---------------- */
function SaturnRing() {
  const ringTex = useSRGBTexture('/tex-saturn-rings.png');
  const ringGeo = useMemo(
    () => buildRingGeometry(SATURN_RING_RADII.inner, SATURN_RING_RADII.outer, 128),
    [],
  );
  return (
    <mesh geometry={ringGeo} rotation={[Math.PI / 2, 0, 0]}>
      <meshBasicMaterial
        map={ringTex}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
        toneMapped={false}
        opacity={0.95}
      />
    </mesh>
  );
}

/* ---------------- 单颗行星 ---------------- */
interface PlanetMeshProps {
  meta: PlanetMeta;
  clock: SimulationClock;
  scaleMode: ScaleMode;
  distanceMode: DistanceMode;
  quality: 'high' | 'low';
  selected: boolean;
  hovered: boolean;
  positionsRef: React.RefObject<PosMap>;
  onSelect?: (slug: PlanetSlug | null) => void;
  onHover?: (slug: PlanetSlug | null) => void;
}

function PlanetMesh({
  meta, clock, scaleMode, distanceMode, quality, selected, hovered, positionsRef, onSelect, onHover,
}: PlanetMeshProps) {
  const tex = useSRGBTexture(meta.texture);
  const orbitRef = useRef<THREE.Group>(null);
  const scaleRef = useRef<THREE.Group>(null);
  const spinRef = useRef<THREE.Mesh>(null);
  const cloudRef = useRef<THREE.Mesh>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const curRadius = useRef(planetSceneRadius(meta.radiusEarth, scaleMode));
  const hoverMul = useRef(1);
  /** 平滑后的自转角速度（弧度/真实秒），跟随模拟时钟速率 */
  const spinOmega = useRef(0);
  const seg = quality === 'low' ? 24 : 48;

  /** 真实自转角速度（弧度/模拟小时；金星、天王星为负 = 逆向自转） */
  const omega = rotationRate(meta);

  useFrame((_, delta) => {
    const now = clock.now();
    const s = heliocentricState(meta.slug, now);
    const [x, y, z] = heliocentricToScene(s.x, s.y, s.z, distanceMode);
    orbitRef.current?.position.set(x, y, z);
    if (positionsRef.current) {
      (positionsRef.current[meta.slug] ??= new THREE.Vector3()).set(x, y, z);
    }
    // 半径弹性过渡（0.6s 左右）
    const targetR = planetSceneRadius(meta.radiusEarth, scaleMode);
    curRadius.current = damp(curRadius.current, targetR, 5, delta);
    hoverMul.current = damp(hoverMul.current, hovered ? 1.15 : 1, 8, delta);
    scaleRef.current?.scale.setScalar(curRadius.current * hoverMul.current);
    // 自转严格跟随模拟时钟：角速度 = 2π/自转周期 × 模拟速率（小时/真实秒）。
    // 暂停归零、1× 实时档为真实自转速率、倍率档按比例加速；
    // 高倍率限幅 MAX_SPIN_RAD_S 防频闪，速率切换经 damp 平滑过渡。
    const simHoursPerRealSec = clock.playing ? clock.rate / 3600 : 0;
    const targetOmega = THREE.MathUtils.clamp(
      omega * simHoursPerRealSec,
      -MAX_SPIN_RAD_S,
      MAX_SPIN_RAD_S,
    );
    spinOmega.current = damp(spinOmega.current, targetOmega, 4, delta);
    if (spinRef.current) spinRef.current.rotation.y += spinOmega.current * delta;
    // 云层随行星同步自转（略快于地表 + 播放中微小漂移）
    if (cloudRef.current) {
      cloudRef.current.rotation.y += (spinOmega.current * 1.15 + (clock.playing ? 0.004 : 0)) * delta;
    }
    // 悬停名牌（DOM 直写，避免重渲染）
    if (hovered && labelRef.current) {
      labelRef.current.textContent = `${meta.nameZh} · ${formatAU(s.rAU, 3)} AU`;
    }
  });

  return (
    <group ref={orbitRef}>
      <group rotation={[0, 0, THREE.MathUtils.degToRad(meta.axialTiltDeg)]}>
        <group ref={scaleRef}>
          <mesh
            ref={spinRef}
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.(selected ? null : meta.slug);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              document.body.style.cursor = 'pointer';
              onHover?.(meta.slug);
            }}
            onPointerOut={() => {
              document.body.style.cursor = 'default';
              onHover?.(null);
            }}
          >
            <sphereGeometry args={[1, seg, seg]} />
            <meshStandardMaterial map={tex} roughness={meta.roughness} metalness={meta.metalness} />
          </mesh>
          {meta.slug === 'earth' && <EarthClouds seg={seg} cloudRef={cloudRef} />}
          {meta.slug === 'saturn' && <SaturnRing />}
        </group>
      </group>
      {hovered && (
        <Html center distanceFactor={60} position={[0, curRadius.current * 1.6 + 0.6, 0]} zIndexRange={[30, 0]}>
          <div className="pointer-events-none whitespace-nowrap rounded-full bg-clay px-3.5 py-1.5 shadow-clay font-num text-xs text-ink">
            <span ref={labelRef}>{meta.nameZh}</span>
          </div>
        </Html>
      )}
    </group>
  );
}

/* ---------------- 轨道线 ---------------- */
function OrbitLines({
  distanceMode, selectedSlug, positionsDate,
}: {
  distanceMode: DistanceMode;
  selectedSlug: PlanetSlug | null | undefined;
  positionsDate: number;
}) {
  const lines = useMemo(
    () =>
      PLANETS.map((p) => ({
        slug: p.slug,
        color: p.color,
        points: orbitPathPoints(p.slug, positionsDate, 256).map(([x, y, z]) =>
          heliocentricToScene(x, y, z, distanceMode),
        ) as [number, number, number][],
      })),
    [distanceMode, positionsDate],
  );
  return (
    <group>
      {lines.map((l) => (
        <Line
          key={l.slug}
          points={l.points}
          color={l.color}
          lineWidth={selectedSlug === l.slug ? 2.5 : 1.5}
          transparent
          opacity={selectedSlug === l.slug ? 0.9 : 0.4}
        />
      ))}
    </group>
  );
}

/* ---------------- 相机飞行 ---------------- */
function CameraRig({
  viewMode, selectedSlug, scaleMode, positionsRef, resetRef,
}: {
  viewMode: ViewMode;
  selectedSlug: PlanetSlug | null | undefined;
  scaleMode: ScaleMode;
  positionsRef: React.RefObject<PosMap>;
  resetRef: React.RefObject<{ token: number }>;
}) {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const tween = useRef<{
    t: number; dur: number;
    fromPos: THREE.Vector3; toPos: THREE.Vector3;
    fromTgt: THREE.Vector3; toTgt: THREE.Vector3;
    followAfter: boolean;
  } | null>(null);
  const prevPlanetPos = useRef(new THREE.Vector3());
  const lastResetToken = useRef(0);

  const flyTo = useCallback((toPos: THREE.Vector3, toTgt: THREE.Vector3, dur: number, followAfter: boolean) => {
    tween.current = {
      t: 0, dur,
      fromPos: camera.position.clone(), toPos: toPos.clone(),
      fromTgt: controlsRef.current ? controlsRef.current.target.clone() : new THREE.Vector3(),
      toTgt: toTgt.clone(),
      followAfter,
    };
  }, [camera]);

  // 选中变化 → 飞行
  useEffect(() => {
    if (selectedSlug && positionsRef.current?.[selectedSlug]) {
      const pp = positionsRef.current[selectedSlug].clone();
      const meta = PLANETS.find((p) => p.slug === selectedSlug)!;
      const r = planetSceneRadius(meta.radiusEarth, scaleMode);
      const dir = camera.position.clone().sub(pp).normalize();
      if (dir.lengthSq() < 1e-6) dir.set(0.5, 0.4, 1).normalize();
      const dist = Math.max(r * 6, r + 2.2);
      flyTo(pp.clone().add(dir.multiplyScalar(dist)), pp, 1.2, true);
      prevPlanetPos.current.copy(pp);
    } else if (selectedSlug === null) {
      flyTo(defaultCamPos(viewMode), new THREE.Vector3(0, 0, 0), 1.2, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSlug]);

  // 视角切换（未选中时）
  useEffect(() => {
    if (!selectedSlug) flyTo(defaultCamPos(viewMode), new THREE.Vector3(0, 0, 0), 1.0, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  useFrame((_, delta) => {
    const controls = controlsRef.current;
    if (!controls) return;

    // 外部重置
    if (resetRef.current && resetRef.current.token !== lastResetToken.current) {
      lastResetToken.current = resetRef.current.token;
      flyTo(defaultCamPos(viewMode), new THREE.Vector3(0, 0, 0), 1.0, false);
    }

    if (tween.current) {
      const tw = tween.current;
      tw.t += delta;
      const k = EASE_IN_OUT(Math.min(tw.t / tw.dur, 1));
      camera.position.lerpVectors(tw.fromPos, tw.toPos, k);
      controls.target.lerpVectors(tw.fromTgt, tw.toTgt, k);
      // 目标行星在飞行中也在移动：跟随其位移
      if (selectedSlug && positionsRef.current?.[selectedSlug]) {
        const pp = positionsRef.current[selectedSlug];
        const move = pp.clone().sub(prevPlanetPos.current);
        tw.toPos.add(move);
        tw.toTgt.add(move);
        camera.position.add(move);
        controls.target.add(move);
        prevPlanetPos.current.copy(pp);
      }
      if (tw.t >= tw.dur) tween.current = null;
    } else if (selectedSlug && positionsRef.current?.[selectedSlug]) {
      // 选中后：随行星平移（保留用户轨道操作）
      const pp = positionsRef.current[selectedSlug];
      const move = pp.clone().sub(prevPlanetPos.current);
      if (move.lengthSq() > 0) {
        camera.position.add(move);
        controls.target.add(move);
        prevPlanetPos.current.copy(pp);
      }
    }
    controls.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      minDistance={selectedSlug ? 1 : 18}
      maxDistance={160}
      enablePan={false}
    />
  );
}

/* ---------------- 主组件 ---------------- */
const SolarSystem = forwardRef<SolarSystemRef, SolarSystemProps>(function SolarSystem(
  {
    clock, scaleMode = 'enhanced', distanceMode = 'compressed', viewMode = 'perspective',
    selectedSlug = null, onSelectPlanet, onHoverPlanet,
    quality = 'high', interactive = true, showOrbits = true, className, style,
  },
  ref,
) {
  const positionsRef = useRef<PosMap>({});
  const resetRef = useRef({ token: 0 });
  const [hoveredSlug, setHoveredSlug] = useState<PlanetSlug | null>(null);
  const [initialDate] = useState(() => clock.now());

  useImperativeHandle(ref, () => ({
    resetView: () => {
      resetRef.current.token += 1;
    },
  }), []);

  const handleHover = useCallback((slug: PlanetSlug | null) => {
    setHoveredSlug(slug);
    onHoverPlanet?.(slug);
  }, [onHoverPlanet]);

  return (
    <div className={className} style={{ position: 'absolute', inset: 0, ...style }}>
      <Canvas
        dpr={[1, 2]}
        camera={{ fov: 45, near: 0.1, far: 800, position: defaultCamPos(viewMode).toArray() }}
        gl={{ antialias: true, alpha: true }}
        onPointerMissed={() => onSelectPlanet?.(null)}
      >
        <ambientLight intensity={0.18} />
        <Stars radius={300} depth={80} count={quality === 'low' ? 750 : 1500} factor={5} saturation={0} fade speed={0.6} />
        <SunMesh quality={quality} />
        {PLANETS.map((meta) => (
          <PlanetMesh
            key={meta.slug}
            meta={meta}
            clock={clock}
            scaleMode={scaleMode}
            distanceMode={distanceMode}
            quality={quality}
            selected={selectedSlug === meta.slug}
            hovered={hoveredSlug === meta.slug}
            positionsRef={positionsRef}
            onSelect={interactive ? onSelectPlanet : undefined}
            onHover={interactive ? handleHover : undefined}
          />
        ))}
        {showOrbits && (
          <OrbitLines distanceMode={distanceMode} selectedSlug={selectedSlug} positionsDate={initialDate} />
        )}
        {interactive ? (
          <CameraRig
            viewMode={viewMode}
            selectedSlug={selectedSlug}
            scaleMode={scaleMode}
            positionsRef={positionsRef}
            resetRef={resetRef}
          />
        ) : (
          <OrbitControls makeDefault enableDamping dampingFactor={0.08} minDistance={18} maxDistance={160} enablePan={false} />
        )}
      </Canvas>
    </div>
  );
});

export default SolarSystem;
