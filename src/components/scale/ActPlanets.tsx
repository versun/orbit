/**
 * ActPlanets.tsx — 比例之旅 · 第一幕「大小 · 行星列队」（scale.md S2）
 *
 * GSAP ScrollTrigger pin 定格（桌面 300vh / 移动 150vh），滚动 scrub 驱动：
 *   0–25%  水星→火星滚入（聚焦类地行星，相机放大）
 *  25–50%  木星滚入，相机动效后撤
 *  50–70%  土星（带环）滚入，相机右移
 *  70–90%  天王星、海王星滚入
 * 90–100%  全景拉远：8 行星排成一列 + 底部等比基线
 * 所有球体直径严格真实等比（radiusEarth × K，水星 12px/移动 8px 基准）。
 */

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { cn } from '@/lib/utils';
import { ClayBadge } from '@/components/clay';
import { LineupRow } from './Lineup';
import { computeLineup, lineupK, lineupFitScale, useViewportWidth } from './shared';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** 浮层文案黏土气泡（左/右交替，初始隐藏，由 scrub 时间线驱动） */
function Bubble({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute z-20 max-w-[300px] rounded-clay-lg p-5',
        'clay-panel text-[15px] leading-[1.75] text-ink-soft',
        'max-md:inset-x-6 max-md:max-w-none',
        className,
      )}
      style={{ opacity: 0 }}
    >
      {children}
    </div>
  );
}

export interface ActPlanetsProps {
  isMobile: boolean;
}

export default function ActPlanets({ isMobile }: ActPlanetsProps) {
  const root = useRef<HTMLElement>(null);
  const cam = useRef<HTMLDivElement>(null);
  const vw = useViewportWidth();

  const K = lineupK(isMobile);
  const gap = isMobile ? 20 : 28;
  const labelH = isMobile ? 40 : 46;
  const geo = computeLineup(K, gap);

  useGSAP(
    () => {
      if (!root.current || !cam.current) return;
      const q = gsap.utils.selector(root);
      const { items, rowW } = geo;
      const cx = Object.fromEntries(items.map((it) => [it.meta.slug, it.cx]));
      const dOf = Object.fromEntries(items.map((it) => [it.meta.slug, it.d]));

      /* ---- 相机取景（transformOrigin: left bottom，行内坐标 × s + x = 屏幕坐标） ---- */
      const fit = lineupFitScale(rowW, vw, isMobile);
      const rockyMid = (cx.mars + dOf.mars / 2) / 2;
      const saturnRight = cx.saturn + (dOf.saturn * 2.27) / 2;
      const sA = isMobile ? 2.3 : 1.7;
      const sB = isMobile ? 1.05 : 0.95;
      const sC = isMobile ? 0.8 : 0.85;
      const frames = {
        A: { s: sA, x: vw * 0.44 - rockyMid * sA },
        B: { s: sB, x: vw * 0.5 - cx.jupiter * sB },
        C: { s: sC, x: vw * 0.5 - ((cx.jupiter + saturnRight) / 2) * sC },
        D: { s: sC, x: vw * 0.52 - ((saturnRight + rowW) / 2) * sC },
        E: { s: fit, x: (vw - rowW * fit) / 2 },
      };

      gsap.set(cam.current, { x: frames.A.x, scale: frames.A.s, transformOrigin: 'left bottom' });

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: () => `+=${window.innerHeight * (isMobile ? 1.5 : 3)}`,
          scrub: 0.8,
          pin: true,
          anticipatePin: 1,
        },
      });

      /* 行星滚入：自左滚入（x -220 / rotate -110° → 0）+ 落地回弹 + 名牌浮出 */
      const roll = (slug: string, at: number, dur = 0.09) => {
        const move = q(`[data-lineup-item="${slug}"] .planet-move`);
        tl.fromTo(move, { x: -220, opacity: 0 }, { x: 0, opacity: 1, duration: dur, ease: 'power1.out' }, at)
          .fromTo(move, { y: -30 }, { y: 0, duration: dur, ease: 'bounce.out' }, at)
          .fromTo(
            q(`[data-lineup-item="${slug}"] .planet-spin`),
            { rotation: -110 },
            { rotation: 0, duration: dur, ease: 'power1.out' },
            at,
          )
          .fromTo(
            q(`[data-lineup-item="${slug}"] .planet-label`),
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.04 },
            at + dur * 0.55,
          );
      };
      const show = (sel: string, at: number) =>
        tl.fromTo(q(sel), { autoAlpha: 0, y: 44 }, { autoAlpha: 1, y: 0, duration: 0.05, ease: 'power1.out' }, at);
      const hide = (sel: string, at: number) =>
        tl.to(q(sel), { autoAlpha: 0, y: -24, duration: 0.035, ease: 'power1.in' }, at);
      const camTo = (f: { s: number; x: number }, at: number, dur: number) =>
        tl.to(cam.current, { x: f.x, scale: f.s, duration: dur, ease: 'power1.inOut' }, at);

      /* 分镜 */
      roll('mercury', 0.02);
      roll('venus', 0.06);
      roll('earth', 0.1);
      roll('mars', 0.14);
      show('.ov-1', 0.04);
      hide('.ov-1', 0.235);

      camTo(frames.B, 0.25, 0.15);
      roll('jupiter', 0.28, 0.12);
      show('.ov-2', 0.33);
      hide('.ov-2', 0.49);

      camTo(frames.C, 0.5, 0.11);
      roll('saturn', 0.53, 0.1);
      show('.ov-3', 0.57);
      hide('.ov-3', 0.7);

      camTo(frames.D, 0.72, 0.11);
      roll('uranus', 0.74);
      roll('neptune', 0.8);
      show('.ov-4', 0.77);
      hide('.ov-4', 0.9);

      camTo(frames.E, 0.9, 0.09);
      tl.fromTo(q('.baseline'), { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.07, ease: 'power1.out' }, 0.915);
      tl.fromTo(q('.baseline-tag'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.03 }, 0.95);
      tl.to({}, { duration: 0.005 }, 0.995);

      /* 路由入场动效（framer）结束后重新测量，消除 pin 起点误差 */
      const t = setTimeout(() => ScrollTrigger.refresh(), 600);
      return () => clearTimeout(t);
    },
    { scope: root, dependencies: [isMobile, vw] },
  );

  return (
    <section ref={root} id="scale-act-1" className="relative h-[100dvh] overflow-hidden">
      {/* HUD */}
      <div className="absolute left-5 top-6 z-30 flex items-center gap-3 md:left-8">
        <ClayBadge color="var(--accent-sun)">ACT 1 · 大小</ClayBadge>
        <span className="hidden text-xs font-semibold tracking-wider text-ink-mute lg:inline">
          严格等比列队 · 水星直径 = {isMobile ? 8 : 12}px 基准
        </span>
      </div>

      {/* 相机层（整列行星被它缩放/平移取景） */}
      <div ref={cam} className="absolute bottom-[15%] left-0 z-10 will-change-transform">
        <LineupRow K={K} gap={gap} labelH={labelH} />
        {/* 等比基线（90–100% 段落画入） */}
        <div
          className="baseline absolute left-0 h-[3px] rounded-full"
          style={{
            bottom: labelH - 4,
            width: geo.rowW,
            background: 'linear-gradient(90deg, var(--accent-ice), color-mix(in srgb, var(--accent-ice) 15%, transparent))',
            transformOrigin: 'left center',
            opacity: 0,
          }}
        />
        <span
          className="baseline-tag absolute font-num text-[11px] tracking-wider text-ice"
          style={{ bottom: labelH + 8, left: geo.rowW + 14, opacity: 0 }}
        >
          同一把尺子
        </span>
      </div>

      {/* 浮层文案（左/右交替） */}
      <Bubble className="ov-1 md:left-[7%] md:top-[20%] max-md:top-[11%]">
        <b className="text-ink">水星、金星、地球、火星</b>——四颗岩石构成的类地行星。先记住地球的大小。
      </Bubble>
      <Bubble className="ov-2 md:right-[7%] md:left-auto md:top-[18%] max-md:top-[11%]">
        <b className="text-ink">木星</b>，直径是地球的 <span className="font-num text-sun">11.2</span> 倍。
      </Bubble>
      <Bubble className="ov-3 md:left-[7%] md:top-[18%] max-md:top-[11%]">
        <b className="text-ink">土星</b>轻到能浮在水上——如果有足够大的浴缸。
      </Bubble>
      <Bubble className="ov-4 md:right-[7%] md:left-auto md:top-[20%] max-md:top-[11%]">
        <b className="text-ink">天王星与海王星</b>，冰巨星，太阳系最遥远的边疆。
      </Bubble>

      {/* 底部诚实标注 */}
      <div className="absolute bottom-5 right-6 z-30 hidden font-num text-[11px] tracking-wider text-ink-mute md:block">
        所有球体直径严格按真实比例渲染
      </div>
    </section>
  );
}
