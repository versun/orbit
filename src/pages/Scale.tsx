/**
 * Scale.tsx — 比例之旅（/scale）
 *
 * 滚动驱动的真实等比叙事（scale.md）：
 *   S1 开场（100vh，字符级弹入 + 日黄滚动提示）
 *   S2 第一幕 · 大小：8 行星严格等比列队（GSAP pin 300vh）—— components/scale/ActPlanets
 *   S3 第二幕 · 太阳：109.2× 弧幕登场（pin 200vh）—— components/scale/ActSun
 *   S4 第三幕 · 距离：真实日心距卷尺（pin 250vh / 移动自动巡游）—— components/scale/ActDistance
 *   S5 总结卡 + CTA（数字滚动计数）
 * 移动端降级：pin 区间减半、基准缩小、卷尺幕自动播放（scale.md 移动端适配 / design.md §9）。
 */

import { Link } from 'react-router';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { ClayBadge, CLAY_EASE } from '@/components/clay';
import { useIsMobile } from '@/hooks/use-mobile';
import ActPlanets from '@/components/scale/ActPlanets';
import ActSun from '@/components/scale/ActSun';
import ActDistance from '@/components/scale/ActDistance';
import CountUp from '@/components/scale/CountUp';

/* ================= S1 开场 ================= */

const titleChars = '真实比例之旅'.split('');

const charContainer: Variants = {
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
};
const charVar: Variants = {
  hidden: { opacity: 0, y: '0.55em', scale: 0.8 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: CLAY_EASE } },
};

function ScaleHero() {
  const scrollToAct1 = () => {
    document.getElementById('scale-act-1')?.scrollIntoView({ behavior: 'smooth' });
  };
  return (
    <section className="relative flex min-h-[calc(100dvh-92px)] flex-col items-center justify-center gap-6 px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <ClayBadge color="var(--accent-ice)">TRUE SCALE JOURNEY</ClayBadge>
      </motion.div>

      <motion.h1
        className="font-display text-[44px] font-black leading-[1.08] tracking-tight text-ink md:text-[72px]"
        initial="hidden"
        animate="show"
        variants={charContainer}
        aria-label="真实比例之旅"
      >
        {titleChars.map((ch, i) => (
          <motion.span key={i} className="inline-block" variants={charVar} aria-hidden>
            {ch}
          </motion.span>
        ))}
      </motion.h1>

      <motion.p
        className="max-w-[520px] text-[15px] leading-[1.8] text-ink-soft md:text-[17px]"
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6, ease: CLAY_EASE }}
      >
        接下来的每一像素，都严格遵守比例。系好安全带。
      </motion.p>

      <motion.button
        type="button"
        onClick={scrollToAct1}
        aria-label="向下滚动开始"
        className="mt-4 flex h-16 w-16 cursor-pointer items-center justify-center rounded-full bg-sun text-[#4A3418] shadow-clay transition-all duration-200 hover:-translate-y-0.5 hover:shadow-clay-hover active:scale-[0.97] active:shadow-clay-inset"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.9, duration: 0.6, ease: CLAY_EASE }}
      >
        <ChevronDown className="h-7 w-7 animate-clay-float" />
      </motion.button>
      <motion.span
        className="-mt-2 text-[13px] font-semibold tracking-[0.14em] text-ink-mute"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.15, duration: 0.5 }}
      >
        向下滚动开始
      </motion.span>
    </section>
  );
}

/* ================= S5 总结卡 + CTA ================= */

function SummaryStat({
  label,
  children,
  delay,
}: {
  label: string;
  children: React.ReactNode;
  delay: number;
}) {
  return (
    <motion.div
      className="flex flex-col items-center gap-2"
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ delay, duration: 0.6, ease: CLAY_EASE }}
    >
      <span className="font-num text-4xl leading-none text-sun md:text-5xl">{children}</span>
      <span className="text-[13px] font-semibold tracking-[0.08em] text-ink-mute">{label}</span>
    </motion.div>
  );
}

function ScaleSummary() {
  return (
    <section className="relative mx-auto flex max-w-content justify-center px-6 py-24 md:py-32">
      <motion.div
        className="clay-panel w-full max-w-[900px] rounded-clay-xl p-8 text-center md:p-14"
        initial={{ y: 80, scale: 0.94, opacity: 0 }}
        whileInView={{ y: 0, scale: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.7, ease: CLAY_EASE }}
      >
        <ClayBadge color="var(--accent-mint)">JOURNEY COMPLETE</ClayBadge>
        <h2 className="mt-5 font-display text-3xl font-extrabold text-ink md:text-[40px]">
          现在，你亲手丈量过它了
        </h2>
        <p className="mx-auto mt-4 max-w-[520px] text-[15px] leading-[1.8] text-ink-soft md:text-base">
          大小与距离的数字不再是数字——它们刚刚从你的指尖滚过。
        </p>

        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <SummaryStat label="太阳直径 ÷ 地球直径" delay={0.15}>
            ×<CountUp to={109.2} format={(v) => v.toFixed(1)} />
          </SummaryStat>
          <SummaryStat label="木星体积 ÷ 地球体积" delay={0.3}>
            ×<CountUp to={1321} format={(v) => Math.round(v).toLocaleString('en-US')} />
          </SummaryStat>
          <SummaryStat label="光从太阳到海王星" delay={0.45}>
            <CountUp
              to={250}
              format={(v) => `${Math.floor(v / 60)}h${String(Math.round(v % 60)).padStart(2, '0')}m`}
            />
          </SummaryStat>
        </div>

        <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.55, duration: 0.55, ease: CLAY_EASE }}
          >
            <Link
              to="/"
              className="group inline-flex h-16 items-center gap-3 rounded-full bg-sun px-9 font-display text-lg font-bold text-[#4A3418] shadow-clay transition-all hover:-translate-y-1 hover:shadow-clay-hover"
            >
              回到实时模拟
              <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.68, duration: 0.55, ease: CLAY_EASE }}
          >
            <Link
              to="/about"
              className="inline-flex h-16 items-center rounded-full bg-clay-hi px-9 font-display text-lg font-bold text-ink shadow-clay transition-all hover:-translate-y-1 hover:shadow-clay-hover"
            >
              看看数据从哪来
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

/* ================= 页面 ================= */

export default function Scale() {
  const isMobile = useIsMobile();
  return (
    <div className="relative">
      <ScaleHero />
      <ActPlanets isMobile={isMobile} />
      <ActSun isMobile={isMobile} />
      <ActDistance isMobile={isMobile} />
      <ScaleSummary />
    </div>
  );
}
