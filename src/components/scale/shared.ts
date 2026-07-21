/**
 * shared.ts — 比例之旅（/scale）共用几何与工具
 *
 * 比例诚实原则：本页所有球体直径严格按真实比例换算（radiusEarth × K），
 * 任何视觉压缩（如距离卷尺的对数刻度）都在 UI 上明确标注。
 */

import { useEffect, useState } from 'react';
import { PLANETS } from '@/lib/planets';
import type { PlanetMeta } from '@/lib/planets';

/** 土星环外半径 / 行星半径（真实比，见 lib/planets SATURN_RING_RADII.outer） */
export const RING_SPAN = 2.27;

/** 列队单项几何 */
export interface LineupItemGeo {
  meta: PlanetMeta;
  /** 球体直径 px（严格真实等比：radiusEarth × K） */
  d: number;
  /** 占位宽度（土星为整环宽度） */
  w: number;
  /** 球心相对 row 左缘的 x */
  cx: number;
}

export interface LineupGeo {
  items: LineupItemGeo[];
  rowW: number;
  maxD: number;
}

/**
 * 计算 8 行星列队几何。
 * @param K 每「地球直径」对应的 px 数（桌面基准：水星 12px → K = 12 / 0.383 ≈ 31.33）
 * @param gap 行星间距 px
 */
export function computeLineup(K: number, gap: number): LineupGeo {
  const items: LineupItemGeo[] = [];
  let x = 0;
  let maxD = 0;
  for (const meta of PLANETS) {
    const d = meta.radiusEarth * K;
    const w = meta.slug === 'saturn' ? d * RING_SPAN : d;
    items.push({ meta, d, w, cx: x + w / 2 });
    x += w + gap;
    if (d > maxD) maxD = d;
  }
  return { items, rowW: x - gap, maxD };
}

/** 列队基准 K：桌面水星 12px / 移动 8px（scale.md S2、移动端适配） */
export function lineupK(isMobile: boolean): number {
  return (isMobile ? 8 : 12) / PLANETS[0].radiusEarth;
}

/** 列队整体收进视口的缩放比 */
export function lineupFitScale(rowW: number, vw: number, isMobile: boolean): number {
  return Math.min(1, (vw - (isMobile ? 32 : 96)) / rowW);
}

/** 视口宽度（防抖），用于重建依赖像素几何的 GSAP 时间线 */
export function useViewportWidth(fallback = 1440): number {
  const [vw, setVw] = useState(() =>
    typeof window === 'undefined' ? fallback : window.innerWidth,
  );
  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined;
    const onResize = () => {
      if (t) clearTimeout(t);
      t = setTimeout(() => setVw(window.innerWidth), 180);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      if (t) clearTimeout(t);
    };
  }, []);
  return vw;
}
