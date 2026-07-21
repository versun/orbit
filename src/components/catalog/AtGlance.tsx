/**
 * AtGlance.tsx — 行星图鉴 S4「一眼看尽大小事」对比计量条
 *
 * 4 组横向黏土计量条（直径 / 公转周期 / 距日距离(对数) / 自转快慢），
 * 每组 9 行（太阳 + 八大行星），hover 任一行跨组高亮同一天体。
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ClayBadge, SectionHeading, CLAY_EASE } from '@/components/clay';
import { cn } from '@/lib/utils';
import { BODIES, type BodyProfile } from './catalog-data';

interface Metric {
  key: string;
  title: string;
  note?: string;
  /** 0..1 填充比例 */
  ratio: (b: BodyProfile) => number;
  /** 行尾数值标签 */
  label: (b: BodyProfile) => string;
}

const MAX_ROT_H = 5832.5; // 金星，自转最慢
const LOG_MIN = Math.log10(0.3);
const LOG_MAX = Math.log10(30.07);

const METRICS: Metric[] = [
  {
    key: 'diameter',
    title: '直径对比',
    ratio: (b) => b.diameterKm / 1392700,
    label: (b) => `${b.diameterKm.toLocaleString('en-US')} km`,
  },
  {
    key: 'period',
    title: '公转周期',
    ratio: (b) => (b.periodDays ? b.periodDays / 60182 : 0),
    label: (b) => b.periodLabel,
  },
  {
    key: 'distance',
    title: '距日距离',
    note: '对数刻度',
    ratio: (b) => (b.aAU > 0 ? (Math.log10(b.aAU) - LOG_MIN) / (LOG_MAX - LOG_MIN) : 0),
    label: (b) => b.distanceLabel,
  },
  {
    key: 'rotation',
    title: '自转快慢',
    note: '条越短转得越快',
    ratio: (b) => Math.abs(b.rotationHours) / MAX_ROT_H,
    label: (b) => b.rotationLabel,
  },
];

export default function AtGlance() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <section className="mx-auto mt-32 max-w-content px-6">
      <SectionHeading tag="AT A GLANCE" title="一眼看尽大小事" className="mb-10" />

      <div className="grid gap-8 lg:grid-cols-2">
        {METRICS.map((m, gi) => (
          <motion.div
            key={m.key}
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: gi * 0.1, duration: 0.6, ease: CLAY_EASE }}
            className="clay-panel p-6 md:p-7"
          >
            <div className="mb-5 flex items-center gap-3">
              <h3 className="font-display text-xl font-bold text-ink">{m.title}</h3>
              {m.note && <ClayBadge color="var(--accent-ice)">{m.note}</ClayBadge>}
            </div>

            <div className="flex flex-col gap-2.5">
              {BODIES.map((b, i) => {
                const dim = hovered !== null && hovered !== b.slug;
                const active = hovered === b.slug;
                return (
                  <div
                    key={b.slug}
                    onMouseEnter={() => setHovered(b.slug)}
                    onMouseLeave={() => setHovered(null)}
                    className={cn(
                      'flex cursor-default items-center gap-3 rounded-clay-sm px-2 py-1 transition-all duration-200',
                      active && 'bg-clay-hi/60',
                    )}
                  >
                    <span
                      className="h-3 w-3 shrink-0 rounded-full transition-opacity duration-200"
                      style={{
                        background: `radial-gradient(circle at 32% 28%, color-mix(in srgb, ${b.color} 55%, white), ${b.color} 60%, color-mix(in srgb, ${b.color} 60%, black))`,
                        opacity: dim ? 0.4 : 1,
                      }}
                    />
                    <span
                      className={cn('w-14 shrink-0 text-sm font-semibold transition-colors duration-200')}
                      style={{ color: active ? b.color : 'var(--text-secondary)', opacity: dim ? 0.4 : 1 }}
                    >
                      {b.nameZh}
                    </span>
                    <div className="clay-sunk h-3.5 flex-1 overflow-hidden rounded-full">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          background: `linear-gradient(90deg, ${b.color}, color-mix(in srgb, ${b.color} 55%, white))`,
                          boxShadow: active ? `0 0 12px ${b.color}` : 'none',
                          opacity: dim ? 0.4 : 1,
                        }}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${Math.max(m.ratio(b) * 100, b.periodDays === null && m.key !== 'diameter' ? 0 : 1.5)}%` }}
                        viewport={{ once: true, amount: 0.7 }}
                        transition={{ delay: 0.15 + i * 0.04, duration: 1.2, ease: 'easeOut' }}
                      />
                    </div>
                    <span
                      className="w-24 shrink-0 text-right font-num text-xs text-ink-mute transition-opacity duration-200"
                      style={{ opacity: dim ? 0.4 : 1 }}
                    >
                      {m.label(b)}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
