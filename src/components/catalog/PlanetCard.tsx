/**
 * PlanetCard.tsx — 行星图鉴卡片（planets.md §S3）
 *
 * 460px 高黏土卡：220px 内凹 3D 预览窝 + 名称 + 2×2 数据格 + 材质一句话 + 档案链接。
 * 等比球径开启时按真实直径等比渲染，超出裁切并标注「局部」。
 */

import { useRef, useState } from 'react';
import { Link } from 'react-router';
import { motion, useInView } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import PlanetSphere from '@/components/PlanetSphere';
import BodySphere from '@/components/catalog/BodySphere';
import { ClayBadge, CLAY_EASE } from '@/components/clay';
import { PLANET_MAP, formatKm } from '@/lib/planets';
import { cn } from '@/lib/utils';
import type { BodyProfile } from './catalog-data';

interface PlanetCardProps {
  body: BodyProfile;
  /** 等比球径开关 */
  realScale: boolean;
  index: number;
}

function DataCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-[11px] font-semibold tracking-[0.08em] text-ink-mute">{label}</span>
      <span className="font-num text-[15px] text-ink">{value}</span>
    </div>
  );
}

export default function PlanetCard({ body, realScale, index }: PlanetCardProps) {
  const [hovered, setHovered] = useState(false);
  const wellRef = useRef<HTMLDivElement>(null);
  // 纹理懒加载：进入视口才挂载 WebGL 画布
  const inView = useInView(wellRef, { once: true, margin: '120px' });

  const planetMeta = body.isStar ? null : PLANET_MAP[body.slug as keyof typeof PLANET_MAP];
  const cropped = realScale && body.radiusEarth > 2.5;

  return (
    <motion.div
      layout
      initial={{ y: 60, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ delay: Math.floor(index / 3) * 0.08, duration: 0.55, ease: CLAY_EASE }}
    >
      <Link
        to={`/planets/${body.slug}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="clay-panel group relative flex h-[460px] flex-col overflow-visible p-4 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-clay-hover"
      >
        {/* 行星色 4px 顶边光条（hover 渐显） */}
        <span
          className="pointer-events-none absolute inset-x-8 top-0 h-1 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: `linear-gradient(90deg, transparent, ${body.color}, transparent)`, boxShadow: `0 0 12px ${body.color}` }}
        />

        {/* 3D 预览窝 */}
        <div
          ref={wellRef}
          className="clay-sunk relative h-[220px] shrink-0 overflow-hidden"
          style={{ borderRadius: '32px 32px 24px 24px' }}
        >
          {inView && (
            <div
              className="h-full w-full transition-transform ease-out"
              style={{ transform: hovered ? 'scale(1.07)' : 'scale(1)', transitionDuration: '400ms' }}
            >
              {realScale || body.isStar ? (
                <BodySphere body={body} mode={realScale ? 'real' : 'uniform'} speed={hovered ? 2 : 1} fit={body.isStar ? 2.9 : body.slug === 'saturn' ? 3.6 : 2.55} />
              ) : (
                planetMeta && <PlanetSphere meta={planetMeta} speed={hovered ? 2 : 1} />
              )}
            </div>
          )}

          {/* 等比标注 */}
          {realScale && (
            <span className="absolute bottom-2.5 right-3 rounded-full bg-clay/90 px-2.5 py-1 font-num text-[11px] text-ink-soft shadow-clay">
              ×{body.radiusEarth} 地球
            </span>
          )}
          {cropped && (
            <span
              className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider"
              style={{ color: body.color, border: `1.5px solid ${body.color}`, background: `color-mix(in srgb, ${body.color} 14%, transparent)` }}
            >
              局部
            </span>
          )}
        </div>

        {/* 名称区 */}
        <div className="mt-4 flex items-start justify-between gap-3 px-1">
          <div>
            <h3 className="font-display text-2xl font-bold leading-tight text-ink">{body.nameZh}</h3>
            <p className="font-num text-[13px] tracking-[0.18em] text-ink-mute">{body.nameEn}</p>
          </div>
          <ClayBadge color={body.color} className="mt-1 shrink-0">{body.categoryZh}</ClayBadge>
        </div>

        {/* 数据区 2×2 */}
        <div className="mt-3 grid grid-cols-2 gap-x-2 gap-y-2.5 px-1">
          <DataCell label="直径" value={`${formatKm(body.diameterKm)} km`} />
          <DataCell label="日心距" value={body.distanceLabel} />
          <DataCell label="公转周期" value={body.periodLabel} />
          <DataCell label="自转周期" value={body.rotationLabel} />
        </div>

        {/* 材质一句话 */}
        <p className="mt-3 px-1 text-sm leading-relaxed text-ink-soft">{body.materialLine}</p>

        {/* 底部链接 */}
        <div className="mt-auto flex items-center justify-end px-1 pt-2">
          <span
            className={cn('inline-flex items-center gap-1.5 text-sm font-bold transition-colors')}
            style={{ color: body.color }}
          >
            查看档案
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
