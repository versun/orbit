/**
 * Lineup.tsx — 8 行星严格等比列队（比例之旅 S2 主舞台 / S3 缩小退场复用）
 *
 * 每颗行星直径 = radiusEarth × K（严格真实等比），土星占位含整环宽度。
 * 球体底部落在同一条「等比基线」上，下方为名牌（行星名 + 真实直径 DM Mono）。
 * 结构类名约定（供 GSAP context 选择器）：
 *   [data-lineup-item="<slug>"] .planet-move / .planet-spin / .planet-label
 */

import { cn } from '@/lib/utils';
import { formatKm } from '@/lib/planets';
import { TextureSphere } from './TextureSphere';
import { computeLineup } from './shared';

export interface LineupRowProps {
  /** 每地球直径 px 数（shared.lineupK） */
  K: number;
  gap: number;
  /** 名牌区高度（同时决定基线位置） */
  labelH: number;
  labels?: boolean;
  className?: string;
}

export function LineupRow({ K, gap, labelH, labels = true, className }: LineupRowProps) {
  const { items, maxD } = computeLineup(K, gap);
  const rowH = maxD + labelH;
  return (
    <div className={cn('relative flex items-end', className)} style={{ height: rowH, gap }}>
      {items.map(({ meta, d, w }) => (
        <div
          key={meta.slug}
          data-lineup-item={meta.slug}
          className="relative flex flex-col items-center justify-end"
          style={{ width: w, height: rowH }}
        >
          <TextureSphere
            texture={meta.texture}
            diameter={d}
            ring={meta.slug === 'saturn'}
            moveClassName="planet-move"
            spinClassName="planet-spin"
            style={{ marginBottom: labelH }}
          />
          {labels && (
            <div
              className="planet-label pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center justify-start gap-1 text-center"
              style={{ height: labelH }}
            >
              <span className="font-display text-[13px] font-bold leading-none text-ink">
                {meta.nameZh}
              </span>
              <span className="font-num text-[10.5px] leading-none text-ink-mute">
                {formatKm(meta.diameterKm)} km
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default LineupRow;
