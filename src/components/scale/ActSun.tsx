/**
 * ActSun.tsx — 比例之旅 · 第二幕「太阳登场」（scale.md S3）
 *
 * GSAP pin 定格（桌面 200vh / 移动 120vh），scrub 驱动：
 *   0–18%   8 行星列队整体缩小、移至右侧成为豆粒（承接第一幕全景状态）
 *  10–60%   太阳弧幕自左侧推入——只显示弧面边缘的金色弧墙（桌面占左 2/3 屏；
 *           移动端为上方 1/2 屏弧面）
 *  45–75%   中央数据气泡浮现，×109.2 数字随滚动计数 0→109.2
 *  75–85%   收尾小字「太阳占太阳系总质量的 99.86%」
 *  90–100%  谢幕：弧幕向左滑出，×109.2 缩小淡出（飞向总结卡的隐喻）
 */

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ClayBadge } from '@/components/clay';
import { SUN } from '@/lib/planets';
import { LineupRow } from './Lineup';
import { computeLineup, lineupK, lineupFitScale, useViewportWidth } from './shared';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export interface ActSunProps {
  isMobile: boolean;
}

export default function ActSun({ isMobile }: ActSunProps) {
  const root = useRef<HTMLElement>(null);
  const rowWrap = useRef<HTMLDivElement>(null);
  const arc = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const vw = useViewportWidth();

  const K = lineupK(isMobile);
  const gap = isMobile ? 20 : 28;
  const labelH = isMobile ? 40 : 46;
  const geo = computeLineup(K, gap);

  useGSAP(
    () => {
      if (!root.current || !rowWrap.current || !arc.current) return;
      const q = gsap.utils.selector(root);
      const vh = window.innerHeight;
      const { rowW } = geo;

      /* ---- 行星列队：承接第一幕全景状态（fit 缩放、居中），缩小成豆粒移到右侧 ---- */
      const fit = lineupFitScale(rowW, vw, isMobile);
      const beanScale = fit * (isMobile ? 0.07 : 0.05);
      const startX = (vw - rowW * fit) / 2;
      const beanW = rowW * beanScale;
      const beanX = (isMobile ? vw * 0.5 : vw * 0.8) - beanW / 2;
      gsap.set(rowWrap.current, { x: startX, scale: fit, transformOrigin: 'left bottom' });

      /* ---- 太阳弧幕几何：桌面左侧巨大弧墙 / 移动上方半屏弧面 ---- */
      const R = isMobile ? vw * 1.45 : vh * 1.35;
      const centerX = isMobile ? vw * 0.5 : vw * 0.66 - R;
      const centerY = isMobile ? vh * 0.52 - R : vh * 0.55;
      gsap.set(arc.current, { xPercent: -50, yPercent: -50 });
      gsap.set(q('.arc-glow'), { opacity: 0.85 });
      gsap.set(q('.sun-bubble'), { yPercent: isMobile ? 0 : -50 });
      gsap.set(q('.sun-counter'), { transformOrigin: 'center center' });

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: () => `+=${vh * (isMobile ? 1.2 : 2)}`,
          scrub: 0.8,
          pin: true,
          anticipatePin: 1,
        },
      });

      /* 列队缩小退场 */
      tl.to(rowWrap.current, { scale: beanScale, x: beanX, duration: 0.16, ease: 'power1.inOut' }, 0);

      /* 太阳弧幕推入（桌面沿 x / 移动沿 y，从屏外到定格） */
      if (isMobile) {
        tl.fromTo(arc.current, { y: -(centerY + R + 60) }, { y: 0, duration: 0.5, ease: 'power1.out' }, 0.06);
      } else {
        tl.fromTo(arc.current, { x: -(centerX + R + 60) }, { x: 0, duration: 0.5, ease: 'power1.out' }, 0.06);
      }
      tl.fromTo(q('.arc-glow'), { opacity: 0 }, { opacity: 0.85, duration: 0.3 }, 0.2);

      /* 数据气泡 + ×109.2 滚动计数 */
      tl.fromTo(
        q('.sun-bubble'),
        { autoAlpha: 0, y: 60, scale: 0.94 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.1, ease: 'power1.out' },
        0.44,
      );
      const counter = { v: 0 };
      tl.to(
        counter,
        {
          v: SUN.radiusEarth,
          duration: 0.3,
          ease: 'power1.inOut',
          onUpdate: () => {
            if (counterRef.current) counterRef.current.textContent = `×${counter.v.toFixed(1)}`;
          },
        },
        0.46,
      );

      /* 收尾小字 */
      tl.fromTo(q('.sun-endline'), { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.06 }, 0.78);

      /* 谢幕：弧幕滑出 + 数字缩小飞向总结卡 */
      if (isMobile) {
        tl.to(arc.current, { y: -vh * 0.22, duration: 0.08, ease: 'power1.in' }, 0.92);
      } else {
        tl.to(arc.current, { x: -vw * 0.26, duration: 0.08, ease: 'power1.in' }, 0.92);
      }
      tl.to(q('.sun-counter'), { scale: 0.45, autoAlpha: 0, duration: 0.07, ease: 'power1.in' }, 0.92);
      tl.to(q('.sun-endline'), { autoAlpha: 0, duration: 0.04 }, 0.94);
      tl.to({}, { duration: 0.005 }, 0.995);

      const t = setTimeout(() => ScrollTrigger.refresh(), 600);
      return () => clearTimeout(t);
    },
    { scope: root, dependencies: [isMobile, vw] },
  );

  /* 弧幕定位几何（与 useGSAP 内一致，供 JSX style 使用） */
  const vh = typeof window === 'undefined' ? 800 : window.innerHeight;
  const R = isMobile ? vw * 1.45 : vh * 1.35;
  const D = R * 2;
  const centerX = isMobile ? vw * 0.5 : vw * 0.66 - R;
  const centerY = isMobile ? vh * 0.52 - R : vh * 0.55;
  const rimGradient = isMobile
    ? 'radial-gradient(circle at 50% 96%, rgba(255,232,170,0.55), rgba(255,160,60,0.14) 42%, transparent 66%)'
    : 'radial-gradient(circle at 96% 50%, rgba(255,232,170,0.55), rgba(255,160,60,0.14) 42%, transparent 66%)';

  return (
    <section ref={root} className="relative h-[100dvh] overflow-hidden">
      {/* HUD */}
      <div className="absolute left-5 top-6 z-30 flex items-center gap-3 md:left-8">
        <ClayBadge color="var(--accent-sun)">ACT 2 · 太阳</ClayBadge>
        <span className="hidden text-xs font-semibold tracking-wider text-ink-mute lg:inline">
          真实等比 · 太阳直径 = 地球 × 109.2
        </span>
      </div>

      {/* 太阳弧幕（只露弧面边缘的金色弧墙） */}
      <div
        ref={arc}
        className="pointer-events-none absolute left-0 top-0 z-0 will-change-transform"
        style={{ left: centerX, top: centerY, width: D, height: D }}
      >
        <div
          className="arc-pulse absolute inset-0 rounded-full"
          style={{
            background: `url(${SUN.texture}) center / 1200px repeat`,
            boxShadow:
              '0 0 160px rgba(255, 180, 70, 0.4), inset -40px 0 120px rgba(255, 214, 130, 0.35)',
          }}
        />
        <div className="arc-glow absolute inset-0 rounded-full" style={{ background: rimGradient, opacity: 0 }} />
      </div>

      {/* 行星列队（缩小成豆粒，定格右侧） */}
      <div
        ref={rowWrap}
        className={`absolute left-0 z-10 will-change-transform ${isMobile ? 'bottom-[9%]' : 'bottom-[24%]'}`}
      >
        <LineupRow K={K} gap={gap} labelH={labelH} labels={false} />
      </div>

      {/* 中央数据气泡 */}
      <div
        className="sun-bubble clay-panel absolute z-20 rounded-clay-xl p-6 text-center md:p-8 max-md:inset-x-6 max-md:bottom-[5%] md:right-[5%] md:top-1/2 md:w-[380px]"
        style={{ opacity: 0 }}
      >
        <p className="text-[15px] leading-[1.85] text-ink-soft md:text-base">
          如果把地球缩成一颗 <b className="text-ink">1cm</b> 的弹珠，
          太阳将是一个直径 <b className="text-ink">1.09m</b> 的瑜伽球。
        </p>
        <div className="sun-counter mt-4 font-num text-6xl leading-none text-sun md:text-7xl">
          <span ref={counterRef}>×0.0</span>
        </div>
        <p className="mt-3 text-xs font-semibold tracking-[0.12em] text-ink-mute">
          太阳直径 ÷ 地球直径
        </p>
      </div>

      {/* 收尾小字 */}
      <div
        className="sun-endline absolute z-20 font-num text-sm tracking-wider text-ice max-md:inset-x-6 max-md:top-[54%] max-md:text-center md:bottom-9 md:right-[6%]"
        style={{ opacity: 0 }}
      >
        太阳占太阳系总质量的 99.86%
      </div>

      {/* 弧幕轻微脉动（局部 keyframes，避免改动全局样式） */}
      <style>{`
        @keyframes orbit-arc-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.012); }
        }
        .arc-pulse { animation: orbit-arc-pulse 3s ease-in-out infinite; }
      `}</style>
    </section>
  );
}
