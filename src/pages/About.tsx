/**
 * About.tsx — 关于数据（/about）
 *
 * 内容页（about.md）：模拟原理三步图解 / 精度诚实清单 / 材质出处 / 数据来源与致谢 / 理念收尾。
 * 全部为 framer-motion 入场动效（本页不使用 GSAP，避免与滚动叙事混用）。
 */

import { Link } from 'react-router';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  Database,
  Orbit,
  Ruler,
  Satellite,
  Sun,
  Zap,
  Image as ImageIcon,
} from 'lucide-react';
import { ClayBadge, PlanetOrb, SectionHeading, CLAY_EASE } from '@/components/clay';
import { PLANETS } from '@/lib/planets';

const viewport75 = { once: true, amount: 0.35 } as const;

/* ================= S1 页头 ================= */

const titleChars = '关于数据与模拟'.split('');
const charContainer: Variants = {
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};
const charVar: Variants = {
  hidden: { opacity: 0, y: '0.55em', scale: 0.8 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: CLAY_EASE } },
};

function AboutHero() {
  return (
    <section className="mx-auto flex max-w-content flex-col items-center px-6 pt-14 text-center md:pt-20">
      <motion.img
        src="/logo.svg"
        alt="Orbit Clay"
        className="h-14 w-14 animate-clay-float"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: CLAY_EASE }}
      />
      <motion.div
        className="mt-5"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
      >
        <ClayBadge color="var(--accent-ice)">HOW IT WORKS</ClayBadge>
      </motion.div>
      <motion.h1
        className="mt-5 font-display text-4xl font-black leading-[1.1] text-ink md:text-[56px]"
        initial="hidden"
        animate="show"
        variants={charContainer}
        aria-label="关于数据与模拟"
      >
        {titleChars.map((ch, i) => (
          <motion.span key={i} className="inline-block" variants={charVar} aria-hidden>
            {ch}
          </motion.span>
        ))}
      </motion.h1>
      <motion.p
        className="mt-5 max-w-[560px] text-[15px] leading-[1.8] text-ink-soft md:text-[17px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.6, ease: CLAY_EASE }}
      >
        真实的轨道、真实的比例、真实的材质——以及我们坦承的每一处近似。
      </motion.p>
    </section>
  );
}

/* ================= S2 模拟原理（三步图解） ================= */

const STEPS = [
  {
    n: 1,
    title: '开普勒根数',
    body: '我们从 JPL 近似行星轨道根数表出发：半长轴 a、偏心率 e、倾角 i、平黄经 L、近日点经度 ϖ、升交点经度 Ω，以及它们的世纪变率。',
  },
  {
    n: 2,
    title: '时间推进',
    body: '以 J2000.0 为历元，把你的设备 UTC 时间换算为儒略世纪，逐项推进根数，解开普勒方程得到每颗行星的日心位置。',
  },
  {
    n: 3,
    title: '渲染呈现',
    body: '位置映射进 Three.js 场景：轨道按真实半长轴与偏心率绘制，行星直径按真实等比，材质按真实影像风格制作。',
  },
];

const stepsContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};
const stepVar: Variants = {
  hidden: { opacity: 0, y: 44, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: CLAY_EASE } },
};

/** 卡间弯曲虚线箭头（滚动入场 1s 描画） */
function CurveArrow({ delay }: { delay: number }) {
  return (
    <motion.svg
      viewBox="0 0 64 44"
      fill="none"
      className="mt-24 hidden w-14 shrink-0 md:block"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.3 }}
    >
      <motion.path
        d="M4 34 Q 32 0 56 26 M47 15 L 56 26 L 42 27"
        stroke="var(--accent-ice)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="1 9"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ delay, duration: 1, ease: 'easeInOut' }}
      />
    </motion.svg>
  );
}

function EngineSection() {
  return (
    <section className="mx-auto mt-24 max-w-content px-6 md:mt-32">
      <motion.div
        initial={{ y: 32, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={viewport75}
        transition={{ duration: 0.7, ease: CLAY_EASE }}
      >
        <SectionHeading tag="THE ENGINE" title="这个太阳系是怎么转起来的" />
      </motion.div>

      <motion.div
        className="mt-12 flex flex-col gap-6 md:flex-row md:items-start md:gap-4"
        initial="hidden"
        whileInView="show"
        viewport={viewport75}
        variants={stepsContainer}
      >
        {STEPS.map((s, i) => (
          <div key={s.n} className="flex flex-1 flex-col gap-6 md:flex-row md:gap-4">
            <motion.div variants={stepVar} className="clay-panel clay-panel-hover flex-1 rounded-clay-lg p-7">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sun font-display text-2xl font-extrabold text-[#4A3418] shadow-clay">
                {s.n}
              </div>
              <h3 className="mt-5 font-display text-xl font-bold text-ink">{s.title}</h3>
              <p className="mt-3 text-[15px] leading-[1.8] text-ink-soft">{s.body}</p>
            </motion.div>
            {i < STEPS.length - 1 && <CurveArrow delay={0.45 + i * 0.25} />}
          </div>
        ))}
      </motion.div>
    </section>
  );
}

/* ================= S3 精度与近似声明（诚实清单） ================= */

const HONESTY_ROWS = [
  {
    icon: Orbit,
    color: 'var(--accent-ice)',
    text: '轨道根数为 J2000 历元的长期平均值，短期（数十年）内位置误差通常小于 1°，长期会累积——它适合科普演示，不适合星历预报。',
  },
  {
    icon: Zap,
    color: 'var(--accent-coral)',
    text: '未模拟行星间引力摄动、章动与光行差。',
  },
  {
    icon: Sun,
    color: 'var(--accent-sun)',
    text: '首页场景中太阳未按等比（它的真实直径是地球 109.2 倍，将吞没整个内太阳系视图），严格等比请见「比例之旅」。',
    link: { to: '/scale', label: '「比例之旅」' },
  },
  {
    icon: Ruler,
    color: 'var(--accent-mint)',
    text: '为容纳海王星，首页轨道距离默认经对数压缩，界面始终标注当前刻度模式。',
  },
  {
    icon: ImageIcon,
    color: '#6E8CFF',
    text: '行星纹理按真实探测影像制作，用于视觉呈现，非科学测绘产品。',
  },
];

const rowsContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const rowVar: Variants = {
  hidden: { opacity: 0, x: -32 },
  show: { opacity: 1, x: 0, transition: { duration: 0.55, ease: CLAY_EASE } },
};

function HonestySection() {
  return (
    <section className="mx-auto mt-24 max-w-content px-6 md:mt-32">
      <motion.div
        initial={{ y: 32, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={viewport75}
        transition={{ duration: 0.7, ease: CLAY_EASE }}
      >
        <SectionHeading tag="HONESTY LIST" title="我们做了哪些近似" />
      </motion.div>

      <motion.div
        className="clay-panel mt-12 rounded-clay-xl p-7 md:p-10"
        initial={{ y: 50, opacity: 0, scale: 0.97 }}
        whileInView={{ y: 0, opacity: 1, scale: 1 }}
        viewport={viewport75}
        transition={{ duration: 0.7, ease: CLAY_EASE }}
      >
        <motion.ul
          className="flex flex-col gap-6"
          initial="hidden"
          whileInView="show"
          viewport={viewport75}
          variants={rowsContainer}
        >
          {HONESTY_ROWS.map((r, i) => (
            <motion.li key={i} variants={rowVar} className="flex items-start gap-4">
              <span
                className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                style={{
                  color: r.color,
                  border: `1.5px solid ${r.color}`,
                  background: `color-mix(in srgb, ${r.color} 14%, transparent)`,
                }}
              >
                <r.icon className="h-5 w-5" />
              </span>
              <p className="text-[15px] leading-[1.8] text-ink-soft">
                {r.link ? (
                  <>
                    {r.text.split(r.link.label)[0]}
                    <Link to={r.link.to} className="font-semibold text-sun underline decoration-sun/40 underline-offset-4 transition-colors hover:decoration-sun">
                      {r.link.label}
                    </Link>
                    {r.text.split(r.link.label)[1]}
                  </>
                ) : (
                  r.text
                )}
              </p>
            </motion.li>
          ))}
        </motion.ul>
      </motion.div>
    </section>
  );
}

/* ================= S4 材质制作说明 ================= */

/** 每颗行星的材质出处（about.md S4，30 字内） */
const MATERIAL_SOURCES: Record<string, string> = {
  mercury: '依信使号影像风格：风化壳与密集陨坑',
  venus: '依麦哲伦/金星快车风格：硫酸云涡旋',
  earth: '依 NASA 蓝色大理石风格：海陆与云层',
  mars: '依海盗号/勘测者风格：氧化铁沙漠与极冠',
  jupiter: '依朱诺号风格：纬向云带与大红斑',
  saturn: '依卡西尼号风格：淡金云带与冰环',
  uranus: '依旅行者 2 号风格：均匀甲烷青绿',
  neptune: '依旅行者 2 号风格：深蓝与暗风暴',
};

const matsContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const matVar: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.94 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: CLAY_EASE } },
};

function MaterialsSection() {
  return (
    <section className="mx-auto mt-24 max-w-content px-6 md:mt-32">
      <motion.div
        initial={{ y: 32, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={viewport75}
        transition={{ duration: 0.7, ease: CLAY_EASE }}
      >
        <SectionHeading tag="THE MATERIALS" title="每颗星球的皮肤，都有出处" />
      </motion.div>

      <motion.div
        className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={matsContainer}
      >
        {PLANETS.map((p) => (
          <motion.div
            key={p.slug}
            variants={matVar}
            className="clay-panel clay-panel-hover flex items-center gap-4 rounded-clay-lg p-5"
          >
            <PlanetOrb size={56} texture={p.texture} color={p.color} />
            <div className="min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-lg font-bold text-ink">{p.nameZh}</span>
                <span className="font-num text-[10px] tracking-[0.14em] text-ink-mute">{p.nameEn}</span>
              </div>
              <p className="mt-1.5 text-[13.5px] leading-[1.7] text-ink-soft">
                {MATERIAL_SOURCES[p.slug]}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

/* ================= S5 数据来源与致谢 ================= */

const SOURCES = [
  {
    icon: Database,
    text: 'JPL Solar System Dynamics — Approximate Positions of the Planets (Keplerian Elements)',
  },
  {
    icon: BookOpen,
    text: 'NASA Planetary Fact Sheet（直径/质量/温度/卫星数）',
  },
  {
    icon: Satellite,
    text: 'NASA / JPL-Caltech 各探测器公开影像（材质风格参考）',
  },
];

const srcContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const srcVar: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: CLAY_EASE } },
};

function SourcesSection() {
  return (
    <section className="mx-auto mt-24 max-w-content px-6 md:mt-32">
      <motion.div
        initial={{ y: 32, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={viewport75}
        transition={{ duration: 0.7, ease: CLAY_EASE }}
      >
        <SectionHeading tag="DATA SOURCES" title="数据来源与致谢" />
      </motion.div>

      <motion.div
        className="clay-panel mt-12 rounded-clay-xl p-7 md:p-10"
        initial={{ y: 40, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={viewport75}
        transition={{ duration: 0.7, ease: CLAY_EASE }}
      >
        <motion.ul
          className="flex flex-col gap-5"
          initial="hidden"
          whileInView="show"
          viewport={viewport75}
          variants={srcContainer}
        >
          {SOURCES.map((s, i) => (
            <motion.li key={i} variants={srcVar} className="flex items-start gap-3.5">
              <s.icon className="mt-0.5 h-5 w-5 shrink-0 text-ice" />
              <span className="font-num text-[13px] leading-[1.8] text-ink-soft md:text-sm">
                {s.text}
              </span>
            </motion.li>
          ))}
        </motion.ul>
        <motion.div
          className="mt-8 border-t border-white/10 pt-6 text-[13px] leading-[1.9] text-ink-mute"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={viewport75}
          transition={{ delay: 0.35, duration: 0.5 }}
        >
          <p>字体：Baloo 2 / Nunito / Noto Sans SC / DM Mono（Google Fonts）</p>
          <p className="mt-1">本站点为科普演示项目，非实时星历服务。</p>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ================= S6 理念收尾 + CTA ================= */

function OutroSection() {
  return (
    <section className="mx-auto mt-24 flex max-w-content flex-col items-center px-6 text-center md:mt-32">
      <motion.blockquote
        className="max-w-[640px] font-display text-[22px] font-bold leading-[1.7] text-ink-soft md:text-[28px]"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewport75}
        transition={{ duration: 0.7, ease: CLAY_EASE }}
      >
        “把太阳系捏成一颗软陶模型，是为了让你敢伸手去摸它。”
      </motion.blockquote>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.25, duration: 0.6, ease: CLAY_EASE }}
        className="mt-10"
      >
        <Link
          to="/"
          className="group inline-flex h-16 items-center gap-3 rounded-full bg-sun px-10 font-display text-lg font-bold text-[#4A3418] shadow-clay transition-all hover:-translate-y-1 hover:shadow-clay-hover"
        >
          回到实时模拟
          <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
        </Link>
      </motion.div>
    </section>
  );
}

/* ================= 页面 ================= */

export default function About() {
  return (
    <div className="relative pb-4">
      <AboutHero />
      <EngineSection />
      <HonestySection />
      <MaterialsSection />
      <SourcesSection />
      <OutroSection />
    </div>
  );
}
