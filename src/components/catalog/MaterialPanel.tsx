/**
 * MaterialPanel.tsx — 行星档案 S3 右侧「材质特写视窗」
 *
 * 行星纹理局部放大平面（背景 220% 放大），可拖拽平移查看细节；
 * 叠加 2 个行星色脉冲热点（随平移按纹理坐标联动），点击弹出黏土 Tooltip。
 */

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hand } from 'lucide-react';
import { CLAY_EASE } from '@/components/clay';
import type { BodyProfile } from './catalog-data';

/** 背景放大倍数（相对容器宽度） */
const ZOOM = 2.2;
/** 等距圆柱纹理宽高比 2:1 */
const TEX_ASPECT = 2;

interface MaterialPanelProps {
  body: BodyProfile;
}

export default function MaterialPanel({ body }: MaterialPanelProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  /** 背景平移（0..1） */
  const [pan, setPan] = useState({ x: 0.5, y: 0.5 });
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [active, setActive] = useState<number | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null);

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      setSize({ w: r.width, h: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 纹理像素尺寸（相对容器）
  const texW = size.w * ZOOM;
  const texH = (size.w * ZOOM) / TEX_ASPECT;
  const spanX = Math.max(texW - size.w, 1);
  const spanY = Math.max(texH - size.h, 1);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = frameRef.current;
    if (!el) return;
    el.setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d) return;
    setPan({
      x: Math.min(1, Math.max(0, d.panX - (e.clientX - d.startX) / spanX)),
      y: Math.min(1, Math.max(0, d.panY - (e.clientY - d.startY) / spanY)),
    });
  };

  const onPointerUp = () => {
    dragRef.current = null;
  };

  return (
    <motion.div
      initial={{ x: 80, opacity: 0 }}
      whileInView={{ x: 0, opacity: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, ease: CLAY_EASE }}
      className="clay-panel rounded-clay-xl p-4 md:p-5"
    >
      {/* 特写视窗 */}
      <div
        ref={frameRef}
        role="img"
        aria-label={`${body.nameZh}表面材质特写`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="clay-sunk relative h-[340px] cursor-grab touch-none select-none overflow-hidden rounded-[32px] active:cursor-grabbing md:h-[420px]"
      >
        {/* 纹理平面 */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${body.texture})`,
            backgroundSize: `${ZOOM * 100}% auto`,
            backgroundPosition: `${pan.x * 100}% ${pan.y * 100}%`,
            backgroundRepeat: 'no-repeat',
          }}
        />

        {/* 操作提示 */}
        <span className="pointer-events-none absolute bottom-3 left-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-clay/85 px-3 py-1.5 text-[11px] font-semibold text-ink-soft shadow-clay">
          <Hand className="h-3.5 w-3.5 text-ice" />
          拖拽平移 · 点击热点
        </span>

        {/* 热点标记（纹理坐标 → 屏幕坐标，随平移联动） */}
        {size.w > 0 &&
          body.hotspots.map((h, i) => {
            const sx = ((h.x / 100) * texW - pan.x * spanX) / size.w;
            const sy = ((h.y / 100) * texH - pan.y * spanY) / size.h;
            const visible = sx > 0.04 && sx < 0.96 && sy > 0.04 && sy < 0.96;
            return (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + i * 0.15, duration: 0.45, ease: CLAY_EASE }}
                className="absolute"
                style={{
                  left: `${sx * 100}%`,
                  top: `${sy * 100}%`,
                  opacity: visible ? 1 : 0,
                  pointerEvents: visible ? 'auto' : 'none',
                }}
              >
                <button
                  type="button"
                  aria-label={h.title}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActive(active === i ? null : i);
                  }}
                  className="relative block h-4 w-4 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                >
                  <span
                    className="absolute inset-0 -m-2 animate-ping rounded-full"
                    style={{ background: body.color, opacity: 0.35, animationDuration: '2s' }}
                  />
                  <span
                    className="block h-4 w-4 rounded-full border-2 border-white/80"
                    style={{ background: body.color, boxShadow: `0 0 10px ${body.color}` }}
                  />
                </button>

                {/* 黏土 Tooltip（外层负责定位，内层负责入场动画，避免 transform 冲突） */}
                <AnimatePresence>
                  {active === i && (
                    <div
                      className="absolute left-0 top-0 z-20"
                      style={{ transform: 'translate(-50%, calc(-100% - 16px))' }}
                    >
                      <motion.div
                        initial={{ scale: 0.7, opacity: 0, y: 8 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.7, opacity: 0, y: 8 }}
                        transition={{ duration: 0.3, ease: CLAY_EASE }}
                        className="clay-panel w-52 rounded-clay-md p-3.5"
                      >
                        <p className="text-sm font-bold" style={{ color: body.color }}>{h.title}</p>
                        <p className="mt-1 font-num text-xs leading-relaxed text-ink-soft">{h.text}</p>
                        <span
                          className="absolute left-1/2 top-full h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45"
                          style={{ background: 'var(--clay-surface)' }}
                        />
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
      </div>

      <p className="mt-3 px-1 text-center font-num text-[11px] text-ink-mute">
        {body.nameZh}表面纹理 · 等距圆柱投影局部放大
      </p>
    </motion.div>
  );
}
