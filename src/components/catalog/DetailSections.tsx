/**
 * DetailSections.tsx — 行星档案页子区块
 * DashboardSection（S2 数据仪表盘）/ FunFactsSection（S6 冷知识卡带）/ PlanetSwitcher（S1 行星切换器）
 */

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { motion, useInView } from 'framer-motion';
import { Lightbulb, Sparkles, Telescope } from 'lucide-react';
import { SectionHeading, CLAY_EASE } from '@/components/clay';
import { cn } from '@/lib/utils';
import { BODIES, type BodyProfile } from './catalog-data';

/* ---------------- 数字滚动计数（入场 1.2s） ---------------- */
function CountUp({ to, decimals = 0, duration = 1.2 }: { to: number; decimals?: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const k = Math.min((t - t0) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - k, 3);
      setVal(to * eased);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);

  return (
    <span ref={ref}>
      {val.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
    </span>
  );
}

/* ---------------- S2 数据仪表盘 ---------------- */
interface StatDef {
  label: string;
  value: number;
  decimals: number;
  unit: string;
  sub: string;
  ratio: number;
  /** 静态文本（不可计数，如太阳公转 —） */
  staticText?: string;
}

const LOG_MIN = Math.log10(0.3);
const LOG_MAX = Math.log10(30.07);

function buildStats(body: BodyProfile): StatDef[] {
  const rotH = Math.abs(body.rotationHours);
  const rotInDays = rotH >= 48;
  return [
    {
      label: '直径', value: body.diameterKm, decimals: 0, unit: 'km',
      sub: `×${body.radiusEarth} 地球`, ratio: body.diameterKm / 1392700,
    },
    {
      label: '质量', value: parseFloat(body.massLabel.split('×')[0]), decimals: 3,
      unit: `×${body.massLabel.split('×')[1]} kg`, sub: '科学计数',
      ratio: (Math.log10(body.massKg) - Math.log10(3.3e23)) / (Math.log10(1.989e30) - Math.log10(3.3e23)),
    },
    {
      label: '日心距', value: body.aAU, decimals: 3, unit: 'AU',
      sub: body.aAU > 0 ? `≈ ${(body.aAU * 1.496).toFixed(2)} 亿 km` : '太阳系中心',
      ratio: body.aAU > 0 ? (Math.log10(body.aAU) - LOG_MIN) / (LOG_MAX - LOG_MIN) : 0,
    },
    {
      label: '公转周期',
      value: body.periodDays ? body.periodDays / 365.25 : 0,
      decimals: 1, unit: '年',
      sub: body.periodLabel === '—' ? '绕银心 2.3 亿年' : body.periodLabel,
      ratio: body.periodDays ? body.periodDays / 60182 : 0,
      staticText: body.periodDays ? undefined : '—',
    },
    {
      label: '自转周期',
      value: rotInDays ? rotH / 24 : rotH,
      decimals: rotInDays ? (rotH / 24 < 30 ? 2 : 1) : rotH < 20 ? 2 : 1,
      unit: rotInDays ? '天' : '小时',
      sub: body.rotationHours < 0 ? '逆向自转' : body.rotationLabel,
      ratio: rotH / 5832.5,
    },
    {
      label: '表面温度', value: body.tempC, decimals: 0, unit: '℃',
      sub: '均温', ratio: (body.tempC + 224) / (5505 + 224),
    },
    {
      label: body.isStar ? '行星数量' : '卫星数量', value: body.moonsCount, decimals: 0,
      unit: '颗', sub: body.isStar ? '八大行星环绕' : `已确认 ${body.moonsLabel}`,
      ratio: body.moonsCount / 274,
    },
    {
      label: '表面重力', value: body.gravityG, decimals: 2, unit: 'g',
      sub: '地球 = 1 g', ratio: body.gravityG / 27.9,
    },
  ];
}

export function DashboardSection({ body }: { body: BodyProfile }) {
  const stats = buildStats(body);
  return (
    <section className="mx-auto mt-32 max-w-content px-6">
      <SectionHeading tag="DATA DASHBOARD" title={`${body.nameZh}的数字档案`} className="mb-10" />
      <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ delay: i * 0.06, duration: 0.55, ease: CLAY_EASE }}
            className="clay-panel group flex flex-col gap-2 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-clay-hover"
          >
            <span className="text-[12px] font-semibold tracking-[0.1em] text-ink-mute">{s.label}</span>
            <div className="font-num text-xl md:text-2xl text-ink">
              {s.staticText ?? <CountUp to={s.value} decimals={s.decimals} />}
              <span className="ml-1 text-xs text-ink-mute">{s.unit}</span>
            </div>
            <span className="font-num text-[11px] text-ink-mute">{s.sub}</span>
            <div className="clay-sunk mt-1 h-2.5 overflow-hidden rounded-full">
              <motion.div
                className="h-full rounded-full transition-shadow duration-300 group-hover:shadow-[0_0_10px_currentColor]"
                style={{ background: `linear-gradient(90deg, ${body.color}, color-mix(in srgb, ${body.color} 55%, white))`, color: body.color }}
                initial={{ width: 0 }}
                whileInView={{ width: `${Math.max(s.ratio * 100, 2)}%` }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.06, duration: 1, ease: 'easeOut' }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- S6 冷知识卡带 ---------------- */
const FACT_ICONS = [Sparkles, Lightbulb, Telescope];

export function FunFactsSection({ body }: { body: BodyProfile }) {
  return (
    <section className="mx-auto mt-32 max-w-content px-6">
      <SectionHeading tag="DID YOU KNOW" title={`关于${body.nameZh}的冷知识`} className="mb-10" />
      <div className="grid gap-6 md:grid-cols-3">
        {body.funFacts.map((f, i) => {
          const Icon = FACT_ICONS[i % FACT_ICONS.length];
          return (
            <motion.div
              key={f.title}
              initial={{ y: 40, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ delay: i * 0.12, duration: 0.6, ease: CLAY_EASE }}
              className="clay-panel clay-panel-hover flex gap-4 p-6"
            >
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-clay-sm"
                style={{ background: `color-mix(in srgb, ${body.color} 16%, transparent)`, border: `1.5px solid ${body.color}` }}
              >
                <Icon className="h-5 w-5" style={{ color: body.color }} />
              </span>
              <div>
                <h3 className="font-display text-lg font-bold text-ink">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{f.text}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

/* ---------------- S1 行星切换器（9 颗黏土小球） ---------------- */
export function PlanetSwitcher({ current }: { current: BodyProfile }) {
  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.6, duration: 0.6, ease: CLAY_EASE }}
      className="flex flex-wrap items-center justify-center gap-3 md:gap-4"
    >
      {BODIES.map((b) => {
        const active = b.slug === current.slug;
        return (
          <Link
            key={b.slug}
            to={`/planets/${b.slug}`}
            title={b.nameZh}
            className="group flex flex-col items-center gap-1.5"
          >
            <span
              className={cn('block rounded-full transition-transform duration-300 group-hover:-translate-y-1')}
              style={{
                width: active ? 44 : 34,
                height: active ? 44 : 34,
                background: `url(${b.texture}) center/cover`,
                boxShadow: active
                  ? `0 0 0 2.5px ${b.color}, 0 0 14px ${b.color}, inset -4px -5px 9px rgba(10,11,30,0.45), inset 2px 3px 5px rgba(255,255,255,0.28)`
                  : 'inset -4px -5px 9px rgba(10,11,30,0.45), inset 2px 3px 5px rgba(255,255,255,0.28), 4px 6px 12px rgba(13,14,36,0.4)',
                opacity: active ? 1 : 0.75,
              }}
            />
            <span
              className={cn('text-[10px] font-semibold transition-colors', active ? '' : 'text-ink-mute group-hover:text-ink')}
              style={active ? { color: b.color } : undefined}
            >
              {b.nameZh}
            </span>
          </Link>
        );
      })}
    </motion.div>
  );
}
