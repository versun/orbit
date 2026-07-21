/**
 * ActDistance.tsx — 比例之旅 · 第三幕「距离 · 空旷的太阳系」（scale.md S4）
 *
 * 纵向滚动驱动一根水平「距离卷尺」（桌面 pin 250vh / 移动不 pin、自动巡游）：
 *  - 卷尺按真实日心距定位：默认对数压缩（顶部徽章明确标注），
 *    ClayToggle 可切到线性刻度——海王星远在极右，卷尺需冲过漫长空白（设计意图）。
 *  - 行星在卷尺上仍为严格真实等比的纹理小球（地球直径 = 7px/移动 5px），
 *    每抵达一颗弹跳落定 + 名牌浮出。
 *  - 地球日黄旗标「我们在这里 · 1 AU」；海王星终点旗标「光到这里需 4 小时 10 分」。
 *
 * 实现要点：ScrollTrigger 只创建一次（pin 结构稳定），滚动进度经 onUpdate 回调
 * 驱动卷尺平移与抵达动画；对数/线性几何写入 ref，切换刻度时用最新几何重放
 * 当前进度，画面即时更新且不发生 pin 重建导致的滚动跳变。
 */

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ClayBadge, ClayToggle } from '@/components/clay';
import { PLANETS, SUN, formatAU } from '@/lib/planets';
import { TextureSphere } from './TextureSphere';
import { useViewportWidth } from './shared';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** 海王星半长轴（AU），距离归一基准 */
const NEPTUNE_AU = 30.07;
/** 火星→木星之间「刻意漫长的空白」气泡的放置位置（AU，两者中点附近） */
const BLANK_AU = 3.36;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export interface ActDistanceProps {
  isMobile: boolean;
}

interface TapeGeo {
  maxShift: number;
  /** 移动端自动巡游全程秒数 */
  total: number;
  arrivals: { slug: string; at: number }[];
  blankAt: number;
}

export default function ActDistance({ isMobile }: ActDistanceProps) {
  const root = useRef<HTMLElement>(null);
  const tape = useRef<HTMLDivElement>(null);
  const [linear, setLinear] = useState(false);
  const vw = useViewportWidth();

  /* ---- 卷尺几何（render 写入 ref，动画回调实时读取） ---- */
  const Kt = isMobile ? 5 : 7; // 卷尺上的地球直径 px（严格等比基准）
  const padL = vw * 0.55;
  const padR = vw * 0.62;
  const trackLen = (linear ? 13 : isMobile ? 4.4 : 4.6) * vw;
  const f = (au: number) => (linear ? au / NEPTUNE_AU : Math.pow(au / NEPTUNE_AU, 0.45));
  const x = (au: number) => padL + trackLen * f(au);
  const tapeW = padL + trackLen + padR;
  const maxShift = Math.max(tapeW - vw, 1);
  const sunD = SUN.radiusEarth * Kt;

  const geo = useRef<TapeGeo>({ maxShift: 1, total: 26, arrivals: [], blankAt: 0.5 });
  const at = (au: number) => clamp01((x(au) - vw * 0.5) / maxShift);
  geo.current = {
    maxShift,
    total: linear ? 42 : 26,
    arrivals: PLANETS.map((p) => ({ slug: p.slug, at: at(p.aAU) })),
    blankAt: at(BLANK_AU),
  };

  const progress = useRef(0);
  const shown = useRef(new Set<string>());
  const applyRef = useRef<(p: number) => void>(() => {});

  useGSAP(
    () => {
      if (!root.current || !tape.current) return;
      const q = gsap.utils.selector(root);

      /* 初始状态 */
      gsap.set(q('.tape-ball'), { scale: 0 });
      gsap.set(q('.tape-pop'), { autoAlpha: 0, y: 10 });
      gsap.set(q('.tape-blank'), { autoAlpha: 0, y: 26 });
      gsap.set(tape.current, { x: 0 });
      shown.current.clear();
      progress.current = 0;

      /* 太阳开场 */
      gsap.fromTo(
        q('.tape-sun'),
        { scale: 0.5, opacity: 0.5 },
        { scale: 1, opacity: 1, duration: 0.8, ease: 'power1.out' },
      );

      const tapeX = gsap.quickTo(tape.current, 'x', { duration: 0.55, ease: 'power2.out' });

      const popIn = (slug: string) => {
        gsap.fromTo(
          q(`[data-tape-planet="${slug}"] .tape-ball`),
          { scale: 0 },
          { scale: 1, duration: 0.55, ease: 'back.out(2.2)', overwrite: 'auto' },
        );
        gsap.fromTo(
          q(`[data-tape-planet="${slug}"] .tape-pop`),
          { autoAlpha: 0, y: 10 },
          { autoAlpha: 1, y: 0, duration: 0.4, delay: 0.12, ease: 'power1.out', overwrite: 'auto' },
        );
      };
      const popOut = (slug: string) => {
        gsap.to(q(`[data-tape-planet="${slug}"] .tape-ball`), {
          scale: 0, duration: 0.22, ease: 'power1.in', overwrite: 'auto',
        });
        gsap.to(q(`[data-tape-planet="${slug}"] .tape-pop`), {
          autoAlpha: 0, y: 10, duration: 0.18, overwrite: 'auto',
        });
      };

      /* 进度驱动：卷尺平移 + 抵达/收回动画（双向滚动均可逆） */
      const apply = (p: number) => {
        progress.current = p;
        const g = geo.current;
        if (root.current && root.current.scrollLeft !== 0) root.current.scrollLeft = 0; // 防御：旧浏览器无 overflow:clip 时兜底
        tapeX(-p * g.maxShift);
        for (const a of g.arrivals) {
          const is = shown.current.has(a.slug);
          if (p >= a.at && !is) {
            shown.current.add(a.slug);
            popIn(a.slug);
          } else if (p < a.at && is) {
            shown.current.delete(a.slug);
            popOut(a.slug);
          }
        }
        const inWin = p > g.blankAt - 0.06 && p < g.blankAt + 0.09;
        const bShown = shown.current.has('blank');
        if (inWin && !bShown) {
          shown.current.add('blank');
          gsap.to(q('.tape-blank'), { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power1.out', overwrite: 'auto' });
        } else if (!inWin && bShown) {
          shown.current.delete('blank');
          gsap.to(q('.tape-blank'), { autoAlpha: 0, y: -22, duration: 0.35, ease: 'power1.in', overwrite: 'auto' });
        }
      };
      applyRef.current = apply;

      if (isMobile) {
        /* 自动巡游：ticker 推进进度，切换线性即时生效、无需重建 */
        let last = 0;
        const tick = (time: number) => {
          const dt = last ? Math.min(time - last, 0.1) : 0;
          last = time;
          let np = progress.current + dt / geo.current.total;
          if (np > 1.06) np = 0; // 终点停留一拍再重播
          apply(Math.min(np, 1));
        };
        gsap.ticker.add(tick);
        return () => gsap.ticker.remove(tick);
      }

      const st = ScrollTrigger.create({
        trigger: root.current,
        start: 'top top',
        end: () => `+=${window.innerHeight * 2.5}`,
        pin: true,
        anticipatePin: 1,
        onUpdate: (self) => apply(self.progress),
        onRefresh: (self) => apply(self.progress),
      });
      const t = setTimeout(() => ScrollTrigger.refresh(), 600);
      return () => {
        st.kill();
        clearTimeout(t);
      };
    },
    { scope: root, dependencies: [isMobile, vw] },
  );

  /* 切换对数/线性、视口变化后：用最新几何重放当前进度，画面即时更新 */
  useEffect(() => {
    applyRef.current(progress.current);
  }, [linear, vw]);

  const ticks = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    // overflow-clip 而非 hidden：clip 不可编程滚动，避免卷尺超宽时
    // scrollIntoView/scrollLeft 把整节内容（HUD/卷尺）横向带偏
    <section ref={root} className={`relative overflow-clip ${isMobile ? 'h-[82dvh]' : 'h-[100dvh]'}`}>
      {/* HUD：刻度徽章 + 线性切换 */}
      {/* top-24：避开 fixed 导航舱（总高 92px），确保切换开关可点击 */}
      <div className="absolute inset-x-0 top-24 z-30 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 px-6">
        <ClayBadge color="var(--accent-ice)">ACT 3 · 距离</ClayBadge>
        <ClayBadge color={linear ? 'var(--accent-coral)' : 'var(--accent-mint)'}>
          {linear ? '线性刻度 · 真实距离（未压缩）' : '对数压缩刻度 · 距离已压缩'}
        </ClayBadge>
        <ClayToggle checked={linear} onChange={setLinear} label="切换线性刻度" />
      </div>

      {/* 卷尺（单根 transform 驱动长条） */}
      <div
        ref={tape}
        className="absolute left-0 will-change-transform"
        style={{ width: tapeW, top: isMobile ? '58%' : '55%', height: 2 }}
      >
        {/* 轨道槽 */}
        <div className="clay-sunk absolute left-0 top-0 h-[6px] -translate-y-1/2 rounded-full" style={{ width: tapeW }} />

        {/* AU 刻度（每 1 AU 一齿，每 5 AU 一读数；对数模式下间距同样被压缩——诚实呈现） */}
        {ticks.map((au) => (
          <div key={au} className="absolute top-0" style={{ left: x(au) }}>
            <div className="h-[10px] w-[2px] -translate-y-1/2 rounded-full bg-ink-mute/40" />
            {au % 5 === 0 && (
              <span className="absolute left-1/2 top-2 w-16 -translate-x-1/2 text-center font-num text-[10px] text-ink-mute">
                {au} AU
              </span>
            )}
          </div>
        ))}

        {/* 太阳（严格等比：109.2 × 地球，弧墙般耸立在卷尺起点） */}
        <TextureSphere
          texture={SUN.texture}
          diameter={sunD}
          className="tape-sun"
          style={{
            position: 'absolute',
            left: x(0) - sunD / 2,
            top: -sunD / 2,
            filter: 'drop-shadow(0 0 42px rgba(255, 180, 70, 0.45))',
          }}
        />

        {/* 行星节点（严格等比纹理小球） */}
        {PLANETS.map((p) => {
          const d = p.radiusEarth * Kt;
          const px = x(p.aAU);
          return (
            <div key={p.slug} data-tape-planet={p.slug} className="absolute left-0 top-0">
              <TextureSphere
                texture={p.texture}
                diameter={d}
                ring={p.slug === 'saturn'}
                moveClassName="tape-ball"
                style={{
                  position: 'absolute',
                  left: px - d / 2,
                  top: -d / 2,
                  filter: `drop-shadow(0 0 9px ${p.color}88)`,
                }}
              />
              {/* 名牌（球上方） */}
              <div
                className="tape-pop pointer-events-none absolute text-center"
                style={{ left: px - 70, width: 140, bottom: d / 2 + 14, opacity: 0 }}
              >
                <div className="font-display text-[13px] font-bold leading-tight text-ink">{p.nameZh}</div>
                <div className="mt-0.5 font-num text-[10.5px] leading-tight text-ice">
                  {formatAU(p.aAU, p.aAU < 1 ? 3 : 2)} AU
                </div>
              </div>
              {/* 地球旗标 */}
              {p.slug === 'earth' && (
                <div
                  className="tape-pop pointer-events-none absolute text-center"
                  style={{ left: px - 80, width: 160, top: d / 2 + 12, opacity: 0 }}
                >
                  <span className="inline-block whitespace-nowrap rounded-full bg-sun px-3 py-1 text-[10.5px] font-bold text-[#4A3418] shadow-clay">
                    我们在这里 · 1 AU
                  </span>
                </div>
              )}
              {/* 海王星终点旗标 */}
              {p.slug === 'neptune' && (
                <div
                  className="tape-pop pointer-events-none absolute text-center"
                  style={{ left: px - 110, width: 220, top: d / 2 + 12, opacity: 0 }}
                >
                  <span className="inline-block whitespace-nowrap rounded-full bg-mint px-3 py-1 text-[10.5px] font-bold text-[#123B2C] shadow-clay">
                    光从太阳来到这里，需要 4 小时 10 分
                  </span>
                </div>
              )}
            </div>
          );
        })}

        {/* 火星→木星：刻意漫长的空白 */}
        <div
          className="tape-blank clay-panel pointer-events-none absolute w-[250px] rounded-clay-lg p-4 text-[13px] leading-[1.75] text-ink-soft"
          style={{ left: x(BLANK_AU) - 125, bottom: 110, opacity: 0 }}
        >
          火星与木星之间的空旷，足以排下约 <b className="text-ink">1,400</b> 个地月距离。
        </div>
      </div>

      {/* 底部提示 */}
      <div className="absolute inset-x-0 bottom-5 z-30 flex justify-center px-6">
        <span className="text-center font-num text-[11px] tracking-wider text-ink-mute">
          {isMobile
            ? `自动巡游中 · 行星同样严格等比（地球 = ${Kt}px）`
            : `继续滚动，把卷尺拉向海王星 · 行星同样严格等比（地球 = ${Kt}px）`}
        </span>
      </div>
    </section>
  );
}
