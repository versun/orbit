/**
 * HomeSections.tsx — 落地页 S2–S6 区块（数据实时条 / 双比例说明 / 行星卡带 / 今日彩蛋 / CTA）
 */

import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowRight, MoveRight } from 'lucide-react';
import { ClayBadge, ClayToggle, DataStat, SectionHeading, PlanetOrb, CLAY_EASE } from '@/components/clay';
import {
  heliocentricState, orbitalVelocityKmS, nextAlignment, formatUTC, formatDateOnly,
  zodiacSign, PLANET_SLUGS, type PlanetSlug,
} from '@/lib/ephemeris';
import { PLANETS, SUN, planetBadgeKind, formatKm } from '@/lib/planets';

const viewportOnce = { once: true, amount: 0.35 } as const;

/* ================= S2 数据实时条 ================= */
export function DataStrip({ simMs }: { simMs: number }) {
  const earth = heliocentricState('earth', simMs);
  const earthVel = orbitalVelocityKmS('earth', simMs);
  const dayFrac = (simMs % 86400000) / 86400000;
  const mercuryLaps = dayFrac / 87.97;

  // 最近的冲日/合日事件（按模拟日粒度缓存）
  const dayKey = Math.floor(simMs / 86400000);
  const alignment = useMemo(() => {
    let best: { name: string; kind: string; days: number } | null = null;
    for (const slug of PLANET_SLUGS) {
      if (slug === 'earth') continue;
      const ev = nextAlignment(slug as PlanetSlug, dayKey * 86400000);
      if (ev && (!best || ev.days < best.days)) {
        best = {
          name: PLANETS.find((p) => p.slug === slug)!.nameZh,
          kind: ev.kind === 'opposition' ? '冲日' : '合日',
          days: ev.days,
        };
      }
    }
    return best;
  }, [dayKey]);

  const stats = [
    { label: '模拟时刻', value: formatUTC(simMs), accent: 'var(--accent-sun)' },
    { label: '地球日心距', value: earth.rAU.toFixed(4), unit: 'AU' },
    { label: '地球轨道速度', value: earthVel.toFixed(2), unit: 'km/s' },
    { label: '水星今日公转进度', value: (mercuryLaps * 100).toFixed(2), unit: '%' },
    {
      label: alignment ? `距下次${alignment.kind}` : '距下次冲日',
      value: alignment ? `${alignment.name} · ${Math.round(alignment.days)}天后` : '—',
      accent: 'var(--accent-mint)',
    },
  ];

  return (
    <section className="mx-auto max-w-content px-6">
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={viewportOnce}
        transition={{ duration: 0.7, ease: CLAY_EASE }}
        className="clay-sunk mt-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-4 rounded-[44px] px-8 py-7 md:flex-nowrap md:overflow-x-auto md:no-scrollbar"
      >
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ y: 24, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={viewportOnce}
            transition={{ delay: 0.08 * i, duration: 0.5, ease: CLAY_EASE }}
            className="min-w-[150px] flex-1"
          >
            <DataStat label={s.label} value={s.value} unit={s.unit} accent={s.accent} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

/* ================= S3 双比例模式说明 ================= */
function ScaleOrb({ name, realR, enhanced, color }: { name: string; realR: number; enhanced: boolean; color: string }) {
  // 真实等比：px = r*3（太阳 109.2 → 截断展示局部）；可视增强：幂次压缩
  const realPx = Math.max(realR * 3, 3);
  const enhPx = Math.pow(realR, 0.55) * 12;
  const px = enhanced ? enhPx : Math.min(realPx, 300);
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex h-[150px] items-end overflow-visible">
        <motion.div
          className="rounded-full"
          animate={{ width: px, height: px }}
          transition={{ duration: 0.6, ease: CLAY_EASE }}
          style={{
            background: `radial-gradient(circle at 32% 28%, color-mix(in srgb, ${color} 55%, white), ${color} 55%, color-mix(in srgb, ${color} 60%, black))`,
            boxShadow: 'inset -6px -8px 14px rgba(10,11,30,0.45), inset 3px 4px 8px rgba(255,255,255,0.28), 8px 10px 20px rgba(13,14,36,0.4)',
          }}
        />
      </div>
      <span className="text-sm font-semibold text-ink-soft">{name}</span>
      <span className="font-num text-xs text-ink-mute">×{realR}</span>
    </div>
  );
}

export function ScaleHonestySection() {
  const [enhanced, setEnhanced] = useState(true);
  return (
    <section className="mx-auto mt-32 grid max-w-content gap-12 px-6 md:grid-cols-12 md:items-center">
      <motion.div
        initial={{ y: 32, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={viewportOnce}
        transition={{ duration: 0.7, ease: CLAY_EASE }}
        className="flex flex-col items-start gap-5 md:col-span-5"
      >
        <SectionHeading tag="SCALE HONESTY" title="震撼的实际等比" />
        <p className="text-[17px] leading-[1.75] text-ink-soft">
          木星直径是地球的 11.2 倍，太阳则是 109 倍——严格等比下，地球只剩几个像素。
          所以我们提供两种看法：模拟器右上角的开关，随时在「真实等比」与「可视增强」之间切换。
        </p>
        <Link
          to="/scale"
          className="inline-flex h-[52px] items-center gap-2 rounded-full bg-sun px-7 font-display font-bold text-[#4A3418] shadow-clay transition-all hover:-translate-y-0.5 hover:shadow-clay-hover"
        >
          去体验完整比例之旅
          <ArrowRight className="h-5 w-5" />
        </Link>
      </motion.div>

      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={viewportOnce}
        transition={{ duration: 0.7, ease: CLAY_EASE }}
        className="clay-panel flex flex-col gap-6 p-8 md:col-span-7"
      >
        <div className="flex items-center justify-between">
          <span className="font-num text-sm tracking-wider text-ink-mute">
            {enhanced ? '可视增强（小天体已放大）' : '真实等比（地球仅 3px）'}
          </span>
          <ClayToggle checked={enhanced} onChange={setEnhanced} label={enhanced ? '可视增强' : '真实等比'} />
        </div>
        <div className="flex items-end justify-around gap-4">
          <ScaleOrb name="太阳" realR={SUN.radiusEarth} enhanced={enhanced} color="#FFC65C" />
          <ScaleOrb name="木星" realR={11.21} enhanced={enhanced} color="#D9A066" />
          <ScaleOrb name="地球" realR={1} enhanced={enhanced} color="#6FB7FF" />
        </div>
        <p className="text-center text-xs text-ink-mute">
          直径比 — 太阳 109.2 : 木星 11.21 : 地球 1
        </p>
      </motion.div>
    </section>
  );
}

/* ================= S4 行星速览黏土卡带 ================= */
export function PlanetBelt() {
  const cards = [
    ...PLANETS.map((p) => ({
      key: p.slug,
      nameZh: p.nameZh,
      nameEn: p.nameEn,
      color: p.color,
      texture: p.texture,
      diameter: p.diameterKm,
      au: p.aAU,
      badge: planetBadgeKind(p) === 'gas' ? '巨行星' : planetBadgeKind(p) === 'ice' ? '冰巨星' : '类地行星',
      to: `/planets/${p.slug}`,
    })),
    {
      key: 'sun',
      nameZh: SUN.nameZh,
      nameEn: SUN.nameEn,
      color: SUN.color,
      texture: SUN.texture,
      diameter: SUN.diameterKm,
      au: 0,
      badge: '恒星',
      to: '/planets',
    },
  ];

  return (
    <section className="mx-auto mt-32 max-w-content px-6">
      <SectionHeading tag="PLANET INDEX" title="八大行星，一手掌握" className="mb-10" />
      {/* 移动端横向滑动卡带；桌面端换行平铺，9 张卡全部可见（4+4+1 居中） */}
      <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4 snap-x snap-mandatory md:snap-none md:flex-wrap md:justify-center md:overflow-visible">
        {cards.map((c, i) => (
          <motion.div
            key={c.key}
            initial={{ x: 120, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.06 * i, duration: 0.6, ease: CLAY_EASE }}
            className="snap-center shrink-0"
          >
            <Link
              to={c.to}
              className="clay-panel clay-panel-hover group flex h-[360px] w-[280px] flex-col items-center p-6"
            >
              <div className="flex h-[160px] items-center justify-center">
                <PlanetOrb size={c.key === 'sun' ? 128 : 112} texture={c.texture} floatDelay={i * 0.55} />
              </div>
              <h3 className="mt-2 font-display text-2xl font-bold text-ink">{c.nameZh}</h3>
              <p className="font-num text-sm tracking-[0.15em] text-ink-mute">{c.nameEn}</p>
              <div className="mt-3 flex w-full flex-col gap-1 font-num text-[15px] text-ink-soft">
                <div className="flex justify-between"><span className="text-ink-mute">直径</span><span>{formatKm(c.diameter)} km</span></div>
                <div className="flex justify-between"><span className="text-ink-mute">日心距</span><span>{c.au === 0 ? '—' : `${c.au} AU`}</span></div>
              </div>
              <div className="mt-auto flex w-full items-center justify-between">
                <ClayBadge color={c.color}>{c.badge}</ClayBadge>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-clay-hi shadow-clay transition-transform duration-300 group-hover:rotate-90">
                  <MoveRight className="h-5 w-5 text-ink" />
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ================= S5 今日太阳系彩蛋 ================= */
export function TodaySection({ simMs }: { simMs: number }) {
  const dayKey = Math.floor(simMs / 86400000);
  const insights = useMemo(() => {
    const t = dayKey * 86400000;
    const earth = heliocentricState('earth', t);
    const jup = heliocentricState('jupiter', t);
    const sat = heliocentricState('saturn', t);
    const mer = heliocentricState('mercury', t);
    const ven = heliocentricState('venus', t);

    const list: { color: string; text: string }[] = [];
    // 1. 地球日心距 vs 远/近日点
    const r = earth.rAU;
    const note = r > 1.01 ? '接近远日点' : r < 0.99 ? '接近近日点' : '距离适中';
    list.push({ color: '#6FB7FF', text: `今天地球距太阳 ${r.toFixed(3)} AU（${note}），轨道速度 ${orbitalVelocityKmS('earth', t).toFixed(2)} km/s` });
    // 2. 木土黄经差
    let d = Math.abs(jup.lonDeg - sat.lonDeg) % 360;
    if (d > 180) d = 360 - d;
    list.push({ color: '#D9A066', text: `木星与土星黄经相差 ${d.toFixed(0)}°${d < 30 ? '，二者在天空中相距很近' : ''}` });
    // 3. 水星星座方向
    list.push({ color: '#B8A99A', text: `水星当前位于${zodiacSign(mer.lonDeg)}方向（日心黄经 ${mer.lonDeg.toFixed(0)}°）` });
    // 4. 金星
    list.push({ color: '#E8C07D', text: `金星位于${zodiacSign(ven.lonDeg)}方向，日心距 ${ven.rAU.toFixed(3)} AU` });
    return list.slice(0, 3);
  }, [dayKey]);

  return (
    <section className="mx-auto mt-32 max-w-[760px] px-6">
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={viewportOnce}
        transition={{ duration: 0.7, ease: CLAY_EASE }}
        className="clay-panel rounded-clay-xl p-8 md:p-10"
      >
        <h3 className="font-display text-2xl md:text-3xl font-extrabold text-ink">
          今日太阳系 · <span className="font-num text-sun">{formatDateOnly(simMs)}</span>
        </h3>
        <div className="mt-6 flex flex-col gap-3.5">
          {insights.map((it, i) => (
            <motion.div
              key={i}
              initial={{ x: -32, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={viewportOnce}
              transition={{ delay: 0.12 * i, duration: 0.55, ease: CLAY_EASE }}
              className="flex items-center gap-4 rounded-clay-md bg-clay-hi px-5 py-4"
            >
              <span className="h-8 w-1.5 shrink-0 rounded-full" style={{ background: it.color }} />
              <p className="text-[15px] leading-relaxed text-ink-soft">{it.text}</p>
            </motion.div>
          ))}
        </div>
        <p className="mt-5 text-xs text-ink-mute">数据由 JPL 近似开普勒根数实时计算，随模拟时间变化。</p>
      </motion.div>
    </section>
  );
}

/* ================= S6 CTA ================= */
export function CtaSection() {
  return (
    <section className="mx-auto mt-32 flex max-w-content flex-col items-center gap-8 px-6 text-center">
      <motion.h2
        initial={{ y: 32, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={viewportOnce}
        transition={{ duration: 0.6, ease: CLAY_EASE }}
        className="font-display text-4xl md:text-5xl font-extrabold text-ink"
      >
        想知道<span className="text-sun">太阳</span>有多大？
      </motion.h2>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={viewportOnce}
        transition={{ delay: 0.3, duration: 0.6, ease: CLAY_EASE }}
      >
        <Link
          to="/scale"
          className="group inline-flex h-16 items-center gap-3 rounded-full bg-sun px-10 font-display text-lg font-bold text-[#4A3418] shadow-clay transition-all hover:-translate-y-1 hover:shadow-clay-hover"
        >
          开启比例之旅
          <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
        </Link>
      </motion.div>
    </section>
  );
}
