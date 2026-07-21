/**
 * PlanetInfoPanel.tsx — 选中行星信息黏土面板（design.md §8.4 / home.md §S1）
 * 右侧滑入（桌面）/ 底部上滑抽屉（移动端），实时数据随模拟时钟更新。
 */

import { useMemo } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';
import PlanetSphere from '@/components/PlanetSphere';
import { ClayBadge, CLAY_EASE } from '@/components/clay';
import { heliocentricState, orbitalVelocityKmS, type PlanetSlug } from '@/lib/ephemeris';
import { PLANET_MAP, formatAU, formatKm, planetBadgeKind, type ScaleMode } from '@/lib/planets';

interface Props {
  slug: PlanetSlug | null;
  simMs: number;
  scaleMode: ScaleMode;
  onClose: () => void;
}

function Row({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-white/8 py-2.5 last:border-0">
      <span className="text-sm text-ink-mute">{label}</span>
      <span className="font-num text-[15px]" style={{ color: accent ?? 'var(--text-primary)' }}>{value}</span>
    </div>
  );
}

export default function PlanetInfoPanel({ slug, simMs, scaleMode, onClose }: Props) {
  const meta = slug ? PLANET_MAP[slug] : null;

  const live = useMemo(() => {
    if (!slug) return null;
    const s = heliocentricState(slug, simMs);
    return {
      rAU: s.rAU,
      lon: s.lonDeg,
      vel: orbitalVelocityKmS(slug, simMs),
    };
  }, [slug, simMs]);

  return (
    <AnimatePresence>
      {meta && live && (
        <motion.aside
          key={meta.slug}
          initial={{ x: 460, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 460, opacity: 0 }}
          transition={{ duration: 0.55, ease: CLAY_EASE }}
          className="pointer-events-auto absolute right-0 top-0 bottom-0 w-full sm:w-[400px] p-4 sm:p-5 z-20"
        >
          <div className="clay-panel flex h-full flex-col gap-4 overflow-y-auto no-scrollbar rounded-clay-xl p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display text-3xl font-extrabold text-ink">{meta.nameZh}</h3>
                <p className="font-num text-sm tracking-[0.18em] text-ink-mute">{meta.nameEn}</p>
              </div>
              <button
                type="button"
                aria-label="关闭面板"
                onClick={onClose}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-clay-hi text-ink shadow-clay cursor-pointer active:scale-95"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* 特写 3D 球（观察镜） */}
            <div className="clay-sunk relative mx-auto h-44 w-44 overflow-hidden rounded-full">
              <PlanetSphere meta={meta} />
              {scaleMode === 'real' && (
                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-clay/90 px-2.5 py-0.5 text-[10px] font-semibold text-ink-soft">
                  观察镜已放大 · 真实等比下仅数像素
                </span>
              )}
            </div>

            <ClayBadge color={meta.color} className="w-fit">
              {planetBadgeKind(meta) === 'gas' ? '巨行星' : planetBadgeKind(meta) === 'ice' ? '冰巨星' : '类地行星'}
            </ClayBadge>

            {/* 实时数据 */}
            <div className="flex flex-col">
              <Row label="日心距" value={`${formatAU(live.rAU)} AU`} accent="var(--accent-ice)" />
              <Row label="轨道速度" value={`${live.vel.toFixed(2)} km/s`} accent="var(--accent-ice)" />
              <Row label="当日黄经" value={`${live.lon.toFixed(1)}°`} accent="var(--accent-ice)" />
              <Row label="半径" value={`${formatKm(meta.radiusKm)} km`} />
            </div>

            {/* 与地球大小比 */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-ink-mute">与地球大小比</span>
                <span className="font-num text-ink">×{meta.radiusEarth}</span>
              </div>
              <div className="clay-sunk h-3.5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${meta.color}, color-mix(in srgb, ${meta.color} 55%, white))` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (meta.radiusEarth / 11.21) * 100)}%` }}
                  transition={{ duration: 0.8, ease: CLAY_EASE }}
                />
              </div>
              <span className="text-[11px] text-ink-mute">基准：地球 = 1 · 最大木星 11.21</span>
            </div>

            {/* 材质说明 */}
            <div className="clay-sunk rounded-clay-md p-4">
              <p className="text-sm leading-relaxed text-ink-soft">{meta.materialNote}</p>
            </div>

            <Link
              to={`/planets/${meta.slug}`}
              className="mt-auto inline-flex h-[52px] items-center justify-center gap-2 rounded-full bg-sun font-display font-bold text-[#4A3418] shadow-clay transition-all hover:-translate-y-0.5 hover:shadow-clay-hover"
            >
              查看行星档案
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
