/**
 * CompareCard.tsx — 行星档案 S5「{行星} vs 地球 · 真实等比」
 *
 * 左侧地球球（固定 120px），右侧天体按真实直径倍数缩放（超出仅显示弧形局部，
 * 动态标注「画面仅容纳其 1/N」）；两球之间分割线可拖拽交换视角。
 * 地球档案页特例：对比月球（tex-moon.jpg，0.2727×）。
 */

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { MoveHorizontal } from 'lucide-react';
import { SectionHeading, CLAY_EASE } from '@/components/clay';
import { formatKm } from '@/lib/planets';
import type { BodyProfile } from './catalog-data';

const EARTH_PX = 120;

interface CompareTarget {
  nameZh: string;
  texture: string;
  color: string;
  /** 相对地球直径比 */
  ratio: number;
  diameterKm: number;
}

/** 纹理球（真实相对尺寸，标签由外部以角标形式覆盖） */
function CompareBall({ texture, size, delay = 0 }: { texture: string; size: number; delay?: number }) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay, duration: 0.6, ease: CLAY_EASE }}
      className="shrink-0 rounded-full"
      style={{
        width: size,
        height: size,
        background: `url(${texture}) center/cover`,
        boxShadow:
          'inset -8px -10px 20px rgba(10,11,30,0.5), inset 4px 5px 10px rgba(255,255,255,0.25), 10px 14px 28px rgba(13,14,36,0.45)',
      }}
    />
  );
}

function BallTag({ name, detail, side }: { name: string; detail: string; side: 'left' | 'right' }) {
  return (
    <div
      className={`absolute bottom-4 z-10 rounded-clay-sm bg-clay/90 px-3.5 py-2 shadow-clay ${side === 'left' ? 'left-4' : 'right-4'}`}
    >
      <p className="text-sm font-bold text-ink">{name}</p>
      <p className="font-num text-[11px] text-ink-mute">{detail}</p>
    </div>
  );
}

export default function CompareCard({ body }: { body: BodyProfile }) {
  const target: CompareTarget =
    body.slug === 'earth'
      ? { nameZh: '月球', texture: '/tex-moon.jpg', color: '#C9CCD6', ratio: 0.2727, diameterKm: 3474 }
      : { nameZh: body.nameZh, texture: body.texture, color: body.color, ratio: body.radiusEarth, diameterKm: body.diameterKm };

  const wrapRef = useRef<HTMLDivElement>(null);
  const [split, setSplit] = useState(42); // 左栏宽度 %
  const [wrapW, setWrapW] = useState(0);
  const dragRef = useRef(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => setWrapW(entries[0].contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const onDividerPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = true;
  };
  const onDividerPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current || !wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    setSplit(Math.min(78, Math.max(22, pct)));
  };
  const onDividerPointerUp = () => {
    dragRef.current = false;
  };

  const planetSize = Math.max(EARTH_PX * target.ratio, 8);
  const rightCellW = (wrapW * (100 - split)) / 100;
  const clipped = planetSize > rightCellW + 4;
  const fitN = clipped ? Math.max(2, Math.ceil(planetSize / Math.max(rightCellW, 1))) : 0;
  const volumeRatio = Math.pow(target.ratio, 3);
  const fmt = (n: number) =>
    n >= 1000
      ? Math.round(n).toLocaleString('en-US')
      : n >= 100
        ? n.toFixed(1)
        : n.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');

  return (
    <section className="mx-auto mt-32 max-w-content px-6">
      <SectionHeading
        tag="TRUE SCALE"
        title={`${target.nameZh} vs 地球 · 真实等比`}
        className="mb-10"
      />

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.7, ease: CLAY_EASE }}
        className="clay-panel rounded-clay-xl p-5 md:p-7"
      >
        <div ref={wrapRef} className="relative flex h-[320px] items-stretch overflow-hidden rounded-[32px] md:h-[360px]">
          {/* 左：地球 */}
          <div
            className="clay-sunk relative flex items-center justify-center overflow-hidden"
            style={{ width: `${split}%`, borderRadius: '32px 0 0 32px' }}
          >
            <CompareBall texture="/tex-earth.jpg" size={EARTH_PX} />
            <BallTag name="地球" detail="直径 12,742 km" side="left" />
          </div>

          {/* 右：目标天体（真实倍数） */}
          <div
            className="clay-sunk relative flex items-center justify-center overflow-hidden"
            style={{ width: `${100 - split}%`, borderRadius: '0 32px 32px 0' }}
          >
            <CompareBall texture={target.texture} size={planetSize} delay={0.2} />
            <BallTag name={target.nameZh} detail={`直径 ${formatKm(target.diameterKm)} km`} side="right" />
            {clipped && (
              <span
                className="absolute right-4 top-4 rounded-full px-3 py-1 text-[11px] font-bold"
                style={{
                  color: target.color,
                  border: `1.5px solid ${target.color}`,
                  background: `color-mix(in srgb, ${target.color} 14%, var(--clay-inset))`,
                }}
              >
                画面仅容纳其 1/{fitN}
              </span>
            )}
          </div>

          {/* 分割线拖拽柄 */}
          <div
            role="separator"
            aria-label="拖拽交换视角"
            aria-orientation="vertical"
            onPointerDown={onDividerPointerDown}
            onPointerMove={onDividerPointerMove}
            onPointerUp={onDividerPointerUp}
            onPointerCancel={onDividerPointerUp}
            className="absolute top-0 bottom-0 z-10 flex w-8 cursor-ew-resize touch-none items-center justify-center"
            style={{ left: `calc(${split}% - 16px)` }}
          >
            <span className="absolute top-3 bottom-3 w-1 rounded-full bg-white/25" />
            <span className="clay-panel relative flex h-11 w-11 items-center justify-center rounded-full shadow-clay">
              <MoveHorizontal className="h-5 w-5 text-ink" />
            </span>
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-5 text-center font-num text-sm text-ink-soft"
        >
          直径比 1 : {fmt(target.ratio)} · 体积比 1 : {fmt(volumeRatio)}
        </motion.p>
      </motion.div>
    </section>
  );
}
