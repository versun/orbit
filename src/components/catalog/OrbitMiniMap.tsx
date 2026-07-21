/**
 * OrbitMiniMap.tsx — 行星档案 S4「轨道实时小窗」
 *
 * SVG 俯视图：8 条真实椭圆轨道（对数压缩距离），当前行星轨道高亮，
 * 行星以真实模拟时间定位 + 60 采样渐隐拖尾；右侧信息列显示实时黄经、
 * 相位说明与下两个轨道事件（近日点 / 远日点 / 冲日 / 合日倒计时）。
 * 太阳档案页退化为「太阳系全家福小图」（无高亮，展示全部行星实时位置）。
 */

import { useMemo } from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { Orbit } from 'lucide-react';
import {
  heliocentricState, orbitPathPoints, nextAlignment, zodiacSign, formatDateOnly,
  PLANET_SLUGS, type PlanetSlug,
} from '@/lib/ephemeris';
import { PLANET_MAP, SCENE } from '@/lib/planets';
import { CLAY_EASE } from '@/components/clay';
import type { BodyProfile } from './catalog-data';

const DAY = 86400000;
const SIZE = 440;
const C = SIZE / 2;
const R_MAX = 198;

/** AU（黄道面投影）→ SVG 坐标（对数压缩半径） */
function project(x: number, y: number): [number, number] {
  const r = Math.sqrt(x * x + y * y);
  if (r < 1e-9) return [C, C];
  const d = R_MAX * Math.pow(r / SCENE.NEPTUNE_AU, SCENE.DIST_EXP);
  return [C + (x / r) * d, C + (y / r) * d];
}

interface OrbitEvent {
  label: string;
  date: Date;
  days: number;
}

/** 前向扫描下一次近日点（kind=min）或远日点（kind=max） */
function nextExtremum(slug: PlanetSlug, fromMs: number, kind: 'min' | 'max'): OrbitEvent {
  const periodDays = PLANET_MAP[slug].periodDays;
  const stepDays = Math.max(periodDays / 720, 0.25);
  let bestMs = fromMs;
  let best = kind === 'min' ? Infinity : -Infinity;
  for (let d = 0; d <= periodDays + stepDays; d += stepDays) {
    const ms = fromMs + d * DAY;
    const r = heliocentricState(slug, ms).rAU;
    if ((kind === 'min' && r < best) || (kind === 'max' && r > best)) {
      best = r;
      bestMs = ms;
    }
  }
  // 局部细化到 0.05 天
  for (let d = -stepDays; d <= stepDays; d += 0.05) {
    const ms = bestMs + d * DAY;
    const r = heliocentricState(slug, ms).rAU;
    if ((kind === 'min' && r < best) || (kind === 'max' && r > best)) {
      best = r;
      bestMs = ms;
    }
  }
  return {
    label: kind === 'min' ? '近日点' : '远日点',
    date: new Date(bestMs),
    days: (bestMs - fromMs) / DAY,
  };
}

interface OrbitMiniMapProps {
  body: BodyProfile;
  simMs: number;
}

export default function OrbitMiniMap({ body, simMs }: OrbitMiniMapProps) {
  const isSun = body.isStar;
  const slug = body.slug as PlanetSlug;
  const dayKey = Math.floor(simMs / DAY);

  /* 轨道线（按模拟日缓存） */
  const orbits = useMemo(
    () =>
      PLANET_SLUGS.map((s) => {
        const pts = orbitPathPoints(s, dayKey * DAY, 160);
        const dAttr = pts
          .map(([x, y], i) => {
            const [px, py] = project(x, y);
            return `${i === 0 ? 'M' : 'L'}${px.toFixed(1)},${py.toFixed(1)}`;
          })
          .join(' ');
        return { slug: s, color: PLANET_MAP[s].color, d: `${dAttr} Z` };
      }),
    [dayKey],
  );

  /* 全部行星实时位置 */
  const positions = useMemo(
    () =>
      PLANET_SLUGS.map((s) => {
        const st = heliocentricState(s, simMs);
        const [px, py] = project(st.x, st.y);
        return { slug: s, color: PLANET_MAP[s].color, x: px, y: py, lon: st.lonDeg };
      }),
    [simMs],
  );

  /* 当前行星拖尾：最近 60 个采样（占轨道 6% 弧长），渐隐 */
  const trail = useMemo(() => {
    if (isSun) return [];
    const period = PLANET_MAP[slug].periodDays;
    const span = period * 0.06;
    const pts: { x: number; y: number; k: number }[] = [];
    for (let i = 59; i >= 1; i--) {
      const t = simMs - (span * i) / 60 * DAY;
      const st = heliocentricState(slug, t);
      const [px, py] = project(st.x, st.y);
      pts.push({ x: px, y: py, k: 1 - i / 60 });
    }
    return pts;
  }, [isSun, slug, simMs]);

  /* 轨道事件日期与相位基准：扫描昂贵，按模拟周缓存；倒计时由 simMs 实时推算 */
  const weekKey = Math.floor(simMs / (DAY * 8));
  const { eventDates, phaseBase } = useMemo(() => {
    if (isSun) return { eventDates: [] as { label: string; ms: number }[], phaseBase: null as { label: string; ms: number } | null };
    const now = weekKey * DAY * 8;
    const list: { label: string; ms: number }[] = [];
    let base: { label: string; ms: number } | null = null;
    if (slug === 'earth') {
      const peri = nextExtremum('earth', now, 'min');
      const aphe = nextExtremum('earth', now, 'max');
      list.push({ label: '近日点', ms: peri.date.getTime() }, { label: '远日点', ms: aphe.date.getTime() });
      const lastPeri = nextExtremum('earth', now - 370 * DAY, 'min');
      base = { label: '位于近日点后', ms: lastPeri.date.getTime() };
    } else {
      const peri = nextExtremum(slug, now, 'min');
      list.push({ label: '近日点', ms: peri.date.getTime() });
      const align = nextAlignment(slug, now);
      if (align) list.push({ label: align.kind === 'opposition' ? '冲日' : '合日', ms: align.date.getTime() });
      const prev = nextAlignment(slug, now - 400 * DAY, 400);
      if (prev && prev.date.getTime() <= now) {
        base = { label: prev.kind === 'opposition' ? '位于冲日后' : '位于合日后', ms: prev.date.getTime() };
      } else {
        const lastPeri = nextExtremum(slug, now - PLANET_MAP[slug].periodDays * DAY, 'min');
        base = { label: '位于近日点后', ms: lastPeri.date.getTime() };
      }
    }
    list.sort((a, b) => a.ms - b.ms);
    return { eventDates: list.slice(0, 2), phaseBase: base };
  }, [isSun, slug, weekKey]);

  // 实时倒计时与相位天数
  const events: OrbitEvent[] = eventDates.map((e) => ({
    label: e.label,
    date: new Date(e.ms),
    days: (e.ms - simMs) / DAY,
  }));
  const phaseNote = phaseBase
    ? `${phaseBase.label} ${Math.max(0, Math.floor((simMs - phaseBase.ms) / DAY))} 天`
    : '';

  const liveState = isSun ? null : heliocentricState(slug, simMs);

  return (
    <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_290px]">
      {/* 左：SVG 俯视轨道图 */}
      <div className="clay-sunk relative mx-auto w-full max-w-[560px] rounded-clay-xl p-3">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-auto w-full">
          {/* 太阳 */}
          <circle cx={C} cy={C} r={14} fill="#FFC65C" opacity={0.25} />
          <circle cx={C} cy={C} r={7} fill="#FFC65C" />
          <circle cx={C} cy={C} r={3} fill="#FFF3D6" />

          {/* 轨道线 */}
          {orbits.map((o, i) => {
            const active = !isSun && o.slug === body.slug;
            return (
              <motion.path
                key={o.slug}
                d={o.d}
                fill="none"
                stroke={o.color}
                strokeWidth={active ? 2.4 : 1.2}
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ delay: i * 0.08, duration: 1, ease: 'easeInOut' }}
                opacity={isSun ? 0.45 : active ? 0.9 : 0.2}
              />
            );
          })}

          {/* 当前行星拖尾 */}
          {trail.map((t, i) => (
            <circle
              key={i}
              cx={t.x}
              cy={t.y}
              r={1 + t.k * 2.2}
              fill={body.color}
              opacity={0.06 + t.k * 0.4}
            />
          ))}

          {/* 行星实时位置 */}
          {positions.map((p) => {
            const active = !isSun && p.slug === body.slug;
            return (
              <g key={p.slug} opacity={isSun || active ? 1 : 0.45}>
                {active && (
                  <circle cx={p.x} cy={p.y} r={10} fill="none" stroke={p.color} strokeWidth={1.5} opacity={0.5}>
                    <animate attributeName="r" values="7;12;7" dur="2.4s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.6;0.1;0.6" dur="2.4s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={active ? 5.5 : 3}
                  fill={p.color}
                  style={active ? { filter: `drop-shadow(0 0 6px ${p.color})` } : undefined}
                />
              </g>
            );
          })}
        </svg>
        <span className="absolute bottom-5 left-6 font-num text-[11px] text-ink-mute">俯视图 · 距离已按对数压缩</span>
      </div>

      {/* 右：信息列 */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-2 text-sm font-bold text-ink">
            <Orbit className="h-4 w-4" style={{ color: body.color }} />
            {isSun ? '全家福实时位置' : '实时轨道状态'}
          </span>
          <Link to="/" className="text-sm font-bold transition-opacity hover:opacity-80" style={{ color: body.color }}>
            查看完整模拟 →
          </Link>
        </div>

        {isSun ? (
          <div className="clay-sunk flex flex-col gap-2 rounded-clay-md p-4">
            {positions.map((p) => (
              <div key={p.slug} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm text-ink-soft">
                  <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
                  {PLANET_MAP[p.slug as PlanetSlug].nameZh}
                </span>
                <span className="font-num text-xs text-ink-mute">{p.lon.toFixed(1)}°</span>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="clay-sunk rounded-clay-md p-4">
              <span className="text-xs font-semibold tracking-[0.08em] text-ink-mute">当前日心黄经</span>
              <div className="mt-1 font-num text-2xl" style={{ color: body.color }}>
                {liveState!.lonDeg.toFixed(2)}°
              </div>
              <span className="font-num text-xs text-ink-mute">
                {zodiacSign(liveState!.lonDeg)}方向 · {formatDateOnly(simMs)}
              </span>
            </div>

            <div className="clay-sunk rounded-clay-md p-4">
              <span className="text-xs font-semibold tracking-[0.08em] text-ink-mute">当前相位</span>
              <p className="mt-1 text-sm font-semibold text-ink">{phaseNote}</p>
            </div>

            <div className="flex flex-col gap-2.5">
              {events.map((ev) => (
                <div key={ev.label} className="clay-sunk flex items-center justify-between gap-3 rounded-clay-md px-4 py-3">
                  <div>
                    <p className="text-sm font-bold text-ink">{ev.label}</p>
                    <p className="font-num text-[11px] text-ink-mute">{formatDateOnly(ev.date.getTime())}</p>
                  </div>
                  <span className="font-num text-sm" style={{ color: body.color }}>
                    {ev.days >= 730 ? `${(ev.days / 365.25).toFixed(1)} 年后` : `${Math.max(0, Math.round(ev.days))} 天后`}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/** 区块包装（含标题与入场动画），供详情页直接使用 */
export function OrbitMiniMapSection({ body, simMs }: OrbitMiniMapProps) {
  return (
    <motion.div
      initial={{ y: 60, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, ease: CLAY_EASE }}
      className="clay-panel rounded-clay-xl p-6 md:p-9"
    >
      <OrbitMiniMap body={body} simMs={simMs} />
    </motion.div>
  );
}
