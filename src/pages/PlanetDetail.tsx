/**
 * PlanetDetail.tsx — 行星档案（/planets/:slug，太阳 + 八大行星共 9 个实例）
 * S1 档案 Hero（巨型 3D 展台 + 实时状态）· S2 数据仪表盘 · S3 材质解析
 * S4 轨道实时小窗 · S5 等比对比卡 · S6 冷知识 + 页尾导航
 */

import { useMemo } from 'react';
import { Link, useParams } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ChevronRight, Crosshair, Layers } from 'lucide-react';
import BodySphere from '@/components/catalog/BodySphere';
import MaterialPanel from '@/components/catalog/MaterialPanel';
import CompareCard from '@/components/catalog/CompareCard';
import { OrbitMiniMapSection } from '@/components/catalog/OrbitMiniMap';
import { DashboardSection, FunFactsSection, PlanetSwitcher } from '@/components/catalog/DetailSections';
import { ClayBadge, SectionHeading, CLAY_EASE } from '@/components/clay';
import { BODIES, BODY_MAP, isBodySlug } from '@/components/catalog/catalog-data';
import { useSimulationClock } from '@/lib/simulation';
import { heliocentricState, orbitalVelocityKmS } from '@/lib/ephemeris';
import type { PlanetSlug } from '@/lib/ephemeris';

/* ---------------- S1 Hero ---------------- */
function Hero({ slug, simMs }: { slug: keyof typeof BODY_MAP; simMs: number }) {
  const body = BODY_MAP[slug];

  const live = useMemo(() => {
    if (body.isStar) return null;
    const s = heliocentricState(slug as PlanetSlug, simMs);
    return { rAU: s.rAU, lon: s.lonDeg, vel: orbitalVelocityKmS(slug as PlanetSlug, simMs) };
  }, [body.isStar, slug, simMs]);

  const textStagger = (i: number) => ({ delay: 0.25 + i * 0.07, duration: 0.5, ease: CLAY_EASE });

  return (
    <section className="mx-auto flex min-h-[calc(100dvh-92px)] max-w-content flex-col justify-center gap-10 px-6 pb-10 pt-6">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        {/* 左：巨型 3D 展台 */}
        <div className="relative flex items-center justify-center">
          {/* 行星色底光 */}
          <div
            className="pointer-events-none absolute bottom-0 left-1/2 h-40 w-[80%] -translate-x-1/2 rounded-full blur-3xl"
            style={{ background: `radial-gradient(ellipse, ${body.color}38, transparent 70%)` }}
          />
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: CLAY_EASE }}
            className="clay-sunk relative aspect-square w-[min(520px,86vw)] rounded-full"
            style={{ boxShadow: `var(--clay-inset-shadow), inset 0 -36px 70px -24px ${body.color}66` }}
          >
            {/* 球体（略超出展台，呼之欲出） */}
            <motion.div
              key={body.slug}
              initial={{ scale: 0.3, rotate: -30, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.9, ease: CLAY_EASE }}
              className="absolute -inset-5"
            >
              <BodySphere body={body} interactive showMoon={body.slug === 'earth'} />
            </motion.div>
            {/* 操作提示 */}
            <span className="pointer-events-none absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-clay px-4 py-1.5 font-num text-[11px] text-ink-mute shadow-clay">
              拖拽旋转 · 滚轮缩放 0.8–1.6×{body.slug === 'earth' ? ' · 地月同框' : ''}
            </span>
          </motion.div>
        </div>

        {/* 右：档案信息 */}
        <div className="flex flex-col items-start gap-4">
          <motion.nav
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={textStagger(0)}
            className="flex items-center gap-1.5 font-num text-[13px] text-ink-mute"
          >
            <Link to="/planets" className="transition-colors hover:text-ice">行星图鉴</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span style={{ color: body.color }}>{body.nameZh}</span>
          </motion.nav>

          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={textStagger(1)}
            className="font-display text-6xl md:text-[88px] font-black leading-[1.05] text-ink"
          >
            {body.nameZh}
          </motion.h1>
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={textStagger(2)}
            className="font-display text-2xl md:text-[32px] font-bold tracking-[0.12em]"
            style={{ color: body.color }}
          >
            {body.nameEn}
          </motion.p>

          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={textStagger(3)}
            className="max-w-[480px] text-lg md:text-xl leading-relaxed text-ink-soft"
          >
            {body.definition}
          </motion.p>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={textStagger(4)}
            className="flex flex-wrap gap-2.5"
          >
            {body.badges.map((b) => (
              <ClayBadge key={b} color={body.color}>{b}</ClayBadge>
            ))}
          </motion.div>

          {/* 实时状态胶囊 */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={textStagger(5)}
            className="clay-panel inline-flex items-center gap-2 rounded-full px-5 py-2.5"
          >
            <span className="h-2 w-2 animate-breathe rounded-full" style={{ background: body.color }} />
            <span className="font-num text-sm text-ink-soft">
              {live
                ? `此刻距太阳 ${live.rAU.toFixed(2)} AU · 轨道速度 ${live.vel.toFixed(1)} km/s · 今日黄经 ${live.lon.toFixed(0)}°`
                : '此刻它正照亮整个太阳系 · 表面 5,505℃ · 核心 1,500 万℃'}
            </span>
          </motion.div>

          {/* CTA 按钮 */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={textStagger(6)}
            className="mt-2 flex flex-wrap gap-4"
          >
            <Link
              to={body.isStar ? '/' : `/?focus=${body.slug}`}
              className="inline-flex h-[52px] items-center gap-2 rounded-full bg-sun px-7 font-display font-bold text-[#4A3418] shadow-clay transition-all hover:-translate-y-0.5 hover:shadow-clay-hover active:scale-95"
            >
              <Crosshair className="h-5 w-5" />
              在实时模拟中定位它
            </Link>
            <Link
              to={`/scale?focus=${body.slug}`}
              className="inline-flex h-[52px] items-center gap-2 rounded-full bg-clay-hi px-7 font-display font-bold text-ink shadow-clay transition-all hover:-translate-y-0.5 hover:shadow-clay-hover active:scale-95"
            >
              <Layers className="h-5 w-5" />
              加入比例对比
            </Link>
          </motion.div>
        </div>
      </div>

      {/* 行星切换器 */}
      <PlanetSwitcher current={body} />
    </section>
  );
}

/* ---------------- S3 材质解析区 ---------------- */
function MaterialSection({ slug }: { slug: keyof typeof BODY_MAP }) {
  const body = BODY_MAP[slug];
  return (
    <section className="mx-auto mt-32 grid max-w-content items-center gap-10 px-6 lg:grid-cols-12">
      <div className="flex flex-col gap-6 lg:col-span-5">
        <SectionHeading tag="SURFACE MATERIAL" title="这颗星球的表面，为什么长这样" />
        {body.materialSections.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ y: 32, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ delay: 0.1 * i, duration: 0.55, ease: CLAY_EASE }}
            className="flex gap-4"
          >
            <span className="mt-1.5 h-10 w-1.5 shrink-0 rounded-full" style={{ background: body.color }} />
            <div>
              <h3 className="font-display text-xl font-bold text-ink">{s.title}</h3>
              <p className="mt-1.5 text-[15px] leading-[1.8] text-ink-soft">{s.body}</p>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="lg:col-span-7">
        <MaterialPanel body={body} />
      </div>
    </section>
  );
}

/* ---------------- S6 页尾导航 ---------------- */
function PrevNextNav({ slug }: { slug: keyof typeof BODY_MAP }) {
  const body = BODY_MAP[slug];
  const prev = body.order > 0 ? BODIES[body.order - 1] : null;
  const next = body.order < BODIES.length - 1 ? BODIES[body.order + 1] : null;
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.6 }}
      className="mx-auto mt-16 flex max-w-content items-center justify-between gap-4 px-6"
    >
      {prev ? (
        <Link
          to={`/planets/${prev.slug}`}
          className="clay-panel clay-panel-hover group flex items-center gap-3 rounded-full py-3.5 pl-5 pr-7"
        >
          <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" style={{ color: prev.color }} />
          <span className="text-sm text-ink-mute">上一颗：<span className="font-bold text-ink">{prev.nameZh}</span></span>
        </Link>
      ) : (
        <span />
      )}
      {next && (
        <Link
          to={`/planets/${next.slug}`}
          className="clay-panel clay-panel-hover group flex items-center gap-3 rounded-full py-3.5 pl-7 pr-5"
        >
          <span className="text-sm text-ink-mute">
            {body.isStar ? '第一站' : '下一颗'}：<span className="font-bold text-ink">{next.nameZh}</span>
          </span>
          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" style={{ color: next.color }} />
        </Link>
      )}
    </motion.section>
  );
}

/* ---------------- 页面 ---------------- */
export default function PlanetDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { simMs } = useSimulationClock();

  if (!isBodySlug(slug)) {
    return (
      <div className="mx-auto max-w-content px-6 py-16">
        <SectionHeading tag="PLANET ARCHIVE" title="行星档案" />
        <div className="clay-panel mt-10 flex flex-col items-center gap-4 p-14 text-center">
          <img src="/empty-state.svg" alt="" className="w-56 opacity-90" />
          <p className="text-ink-soft">这片空域没有名为「{slug}」的天体档案。</p>
          <Link to="/planets" className="font-bold text-ice underline-offset-4 hover:underline">返回行星图鉴</Link>
        </div>
      </div>
    );
  }

  const body = BODY_MAP[slug];

  return (
    <div key={slug} className="pb-8">
      {/* S1 档案 Hero */}
      <Hero slug={slug} simMs={simMs} />

      {/* S2 数据仪表盘 */}
      <DashboardSection body={body} />

      {/* S3 材质解析 */}
      <MaterialSection slug={slug} />

      {/* S4 轨道实时小窗（太阳：全家福小图） */}
      <section className="mx-auto mt-32 max-w-content px-6">
        <SectionHeading
          tag={body.isStar ? 'SOLAR FAMILY' : 'LIVE ORBIT'}
          title={body.isStar ? '太阳系全家福 · 实时位置' : `${body.nameZh}此刻在哪里`}
          className="mb-10"
        />
        <OrbitMiniMapSection body={body} simMs={simMs} />
      </section>

      {/* S5 等比对比卡 */}
      <CompareCard body={body} />

      {/* S6 冷知识 + 页尾导航 */}
      <FunFactsSection body={body} />
      <PrevNextNav slug={slug} />
    </div>
  );
}
