/**
 * TextureSphere.tsx — 真实纹理 CSS 球体（比例之旅专用）
 *
 * 用真实行星纹理（public/tex-*.jpg）+ 左上奶油高光 / 右下内阴影模拟球体体积感，
 * 不占用 WebGL 上下文（同屏 8+ 颗行星的滚动叙事场景下比 R3F 更稳）。
 * 纹理层（.planet-spin）与着色层分离：滚入时只有纹理层旋转，看起来像一颗真的在滚的球。
 * 土星附带前后两半的压扁光环（前半用 clip-path 裁出，叠在球体前方）。
 */

import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils';
import { RING_SPAN } from './shared';

/** 土星环同心环带（径向渐变，相对球半径归一：C 环半透明 → B 环亮 → 卡西尼缝 → A 环） */
const RING_GRADIENT = [
  'radial-gradient(circle,',
  'transparent 0 54%,',
  'rgba(214,194,152,0.22) 54.5% 66%,',
  'rgba(238,220,176,0.92) 66.5% 78%,',
  'rgba(219,198,156,0.82) 78% 85.5%,',
  'rgba(38,32,24,0.55) 86% 89.5%,',
  'rgba(208,188,148,0.66) 90% 95.5%,',
  'rgba(150,134,104,0.34) 96% 99%,',
  'transparent 99.5% 100%)',
].join(' ');

function RingDisc({ diameter, front }: { diameter: number; front?: boolean }) {
  const span = diameter * RING_SPAN;
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-1/2 rounded-full"
      style={{
        width: span,
        height: span,
        transform: 'translate(-50%, -50%) scaleY(0.32) rotate(-6deg)',
        background: RING_GRADIENT,
        clipPath: front ? 'inset(50% 0 0 0)' : undefined,
        zIndex: front ? 3 : 1,
      }}
    />
  );
}

export interface TextureSphereProps {
  /** 纹理路径（/tex-*.jpg） */
  texture: string;
  /** 球体直径 px（调用方负责按真实等比换算） */
  diameter: number;
  /** 土星环 */
  ring?: boolean;
  /** 外层（位移/落点）附加类名，供 GSAP 选择器使用 */
  moveClassName?: string;
  /** 纹理旋转层附加类名，供 GSAP 选择器使用 */
  spinClassName?: string;
  className?: string;
  style?: CSSProperties;
}

export function TextureSphere({
  texture,
  diameter,
  ring = false,
  moveClassName,
  spinClassName,
  className,
  style,
}: TextureSphereProps) {
  const d = Math.max(diameter, 1);
  const shading: CSSProperties = {
    boxShadow: [
      `inset ${-d * 0.09}px ${-d * 0.13}px ${d * 0.2}px rgba(10, 11, 30, 0.55)`,
      `inset ${d * 0.045}px ${d * 0.06}px ${d * 0.1}px rgba(255, 255, 255, 0.22)`,
    ].join(', '),
    background:
      'radial-gradient(circle at 33% 27%, rgba(255,255,255,0.26), rgba(255,255,255,0) 46%)',
  };
  return (
    <div
      className={cn('relative shrink-0', moveClassName, className)}
      style={{ width: d, height: d, ...style }}
    >
      {ring && <RingDisc diameter={d} />}
      {/* 纹理层（可独立旋转 → 滚入动效） */}
      <div
        className={cn('absolute inset-0 rounded-full', spinClassName)}
        style={{
          background: `url(${texture}) center / cover no-repeat`,
          backgroundColor: 'var(--clay-inset)',
          zIndex: 2,
        }}
      />
      {/* 体积着色层（静止） */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{ ...shading, zIndex: 2 }}
      />
      {ring && <RingDisc diameter={d} front />}
    </div>
  );
}

export default TextureSphere;
