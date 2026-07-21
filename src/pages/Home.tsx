/**
 * Home.tsx — 实时模拟（/）：全屏 Three.js 实时太阳系模拟器 + 落地页区块
 */

import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProgress } from '@react-three/drei';
import { MousePointerClick, Info } from 'lucide-react';
import { useSearchParams } from 'react-router';
import { useSimulationClock } from '@/lib/simulation';
import type { SolarSystemRef, ViewMode } from '@/components/SolarSystem';
import TimeConsole from '@/components/home/TimeConsole';
import PlanetInfoPanel from '@/components/home/PlanetInfoPanel';
import { DataStrip, ScaleHonestySection, PlanetBelt, TodaySection, CtaSection } from '@/components/home/HomeSections';
import { NAV_TOTAL_OFFSET } from '@/components/Navbar';
import { CLAY_EASE } from '@/components/clay';
import { enhanceFactor, type ScaleMode } from '@/lib/planets';
import { PLANET_SLUGS, type PlanetSlug } from '@/lib/ephemeris';
import { cn } from '@/lib/utils';

const SolarSystem = lazy(() => import('@/components/SolarSystem'));

/** 加载遮罩：跟随真实纹理加载进度 */
function LoadingOverlay() {
  const { progress, active } = useProgress();
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-5 bg-deep"
        >
          <img src="/logo.svg" alt="Orbit Clay" className="h-16 w-16 animate-breathe" />
          <div className="clay-sunk h-3 w-56 overflow-hidden rounded-full">
            <div className="h-full rounded-full bg-sun transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <p className="font-num text-sm text-ink-mute">正在加载星图 {Math.round(progress)}%</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** 双段胶囊开关（内凹槽 + 滑动指示） */
function SegmentedSwitch<T extends string>({
  options, value, onChange, delay = 0,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay, duration: 0.5, ease: CLAY_EASE }}
      className="clay-sunk relative flex rounded-full p-1"
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            'relative z-10 rounded-full px-4 py-2 text-sm font-bold transition-colors duration-300 cursor-pointer',
            value === o.value ? 'text-[#4A3418]' : 'text-ink-soft hover:text-ink',
          )}
        >
          {value === o.value && (
            <motion.span
              layoutId={options.map((x) => x.label).join('-')}
              className="absolute inset-0 -z-10 rounded-full bg-sun shadow-clay"
              transition={{ duration: 0.35, ease: CLAY_EASE }}
            />
          )}
          {o.label}
        </button>
      ))}
    </motion.div>
  );
}

const TITLE = '太阳系';

export default function Home() {
  const sim = useSimulationClock();
  const [scaleMode, setScaleMode] = useState<ScaleMode>('enhanced');
  const [viewMode, setViewMode] = useState<ViewMode>('perspective');
  const [selected, setSelected] = useState<PlanetSlug | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const ssRef = useRef<SolarSystemRef>(null);
  const quality = useMemo<'high' | 'low'>(() => (typeof window !== 'undefined' && window.innerWidth < 768 ? 'low' : 'high'), []);

  // 跨页契约：/?focus=<slug> 自动选中行星（详情页 CTA 跳转）
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const focus = searchParams.get('focus');
    if (focus && (PLANET_SLUGS as string[]).includes(focus)) {
      setSelected(focus as PlanetSlug);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ESC 关闭信息面板
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelected(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleScaleMode = useCallback((m: ScaleMode) => {
    setScaleMode(m);
    if (m === 'real') setToast('已切换真实等比：类地行星仅数像素，点击行星可用观察镜放大');
    else setToast(null);
  }, []);

  // Toast 自动消失
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(id);
  }, [toast]);

  const resetView = useCallback(() => {
    setSelected(null);
    ssRef.current?.resetView();
  }, []);

  return (
    <div>
      {/* ============ S1 Hero 模拟器区 ============ */}
      <section className="relative h-[100dvh]" style={{ marginTop: -NAV_TOTAL_OFFSET }}>
        {/* 3D 画布 */}
        <motion.div
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="absolute inset-0"
        >
          <Suspense fallback={null}>
            <SolarSystem
              ref={ssRef}
              clock={sim.clock}
              scaleMode={scaleMode}
              viewMode={viewMode}
              selectedSlug={selected}
              onSelectPlanet={setSelected}
              quality={quality}
            />
          </Suspense>
          <LoadingOverlay />
        </motion.div>

        {/* 左上：站点标题组 */}
        <div className="pointer-events-none absolute left-6 top-28 md:left-10 md:top-32 z-10 max-w-[520px]">
          <motion.span
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5, ease: CLAY_EASE }}
            className="inline-block rounded-full border border-ice/60 bg-ice/10 px-4 py-1.5 font-num text-xs tracking-[0.2em] text-ice"
          >
            REAL-TIME ORBIT SIMULATION
          </motion.span>
          <h1 className="mt-4 font-display text-6xl md:text-[88px] font-extrabold leading-[1.05] text-ink">
            {TITLE.split('').map((ch, i) => (
              <motion.span
                key={i}
                className="inline-block"
                initial={{ y: 40, rotate: 6, opacity: 0 }}
                animate={{ y: 0, rotate: 0, opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.05, duration: 0.6, ease: CLAY_EASE }}
              >
                {ch}
              </motion.span>
            ))}
          </h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.65, duration: 0.5, ease: CLAY_EASE }}
            className="mt-3 text-[17px] tracking-[0.02em] text-ink-soft"
          >
            八大行星 · 真实轨道 · 实际等比 · 此时此刻
          </motion.p>
        </div>

        {/* 右上：模式开关组 + 比例诚实徽章 */}
        <div className="absolute right-6 top-28 md:right-10 md:top-32 z-10 flex flex-col items-end gap-3">
          <SegmentedSwitch
            options={[
              { value: 'real' as ScaleMode, label: '真实等比' },
              { value: 'enhanced' as ScaleMode, label: '可视增强' },
            ]}
            value={scaleMode}
            onChange={handleScaleMode}
            delay={0.65}
          />
          <SegmentedSwitch
            options={[
              { value: 'perspective' as ViewMode, label: '3D 斜视' },
              { value: 'top' as ViewMode, label: '俯视' },
            ]}
            value={viewMode}
            onChange={setViewMode}
            delay={0.75}
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="flex flex-wrap justify-end gap-2"
          >
            <span className="group relative inline-flex cursor-help items-center gap-1 rounded-full bg-clay/70 px-3 py-1 text-[11px] font-semibold text-ink-soft backdrop-blur">
              <Info className="h-3 w-3 text-ice" />
              {scaleMode === 'real' ? '真实等比 · 半径严格按比例' : `可视增强 · 地球放大 ×${enhanceFactor(1).toFixed(1)}`}
              <span className="pointer-events-none absolute right-0 top-full mt-2 w-52 rounded-clay-sm bg-clay p-3 text-left text-[11px] leading-relaxed text-ink-soft opacity-0 shadow-clay transition-opacity group-hover:opacity-100 z-20">
                {scaleMode === 'real'
                  ? '行星直径严格按真实比值渲染（地球 = 1）。'
                  : '行星直径 = 真实等比 × 对数增强系数，保证小行星可辨认。'}
              </span>
            </span>
            <span className="group relative inline-flex cursor-help items-center gap-1 rounded-full bg-clay/70 px-3 py-1 text-[11px] font-semibold text-ink-soft backdrop-blur">
              <Info className="h-3 w-3 text-sun" />
              太阳未按等比
              <span className="pointer-events-none absolute right-0 top-full mt-2 w-52 rounded-clay-sm bg-clay p-3 text-left text-[11px] leading-relaxed text-ink-soft opacity-0 shadow-clay transition-opacity group-hover:opacity-100 z-20">
                太阳真实直径为地球 109.2 倍，若等比显示将吞没内太阳系。请前往「比例之旅」查看严格等比序列。
              </span>
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-clay/70 px-3 py-1 text-[11px] font-semibold text-ink-soft backdrop-blur">
              <Info className="h-3 w-3 text-coral" />
              距离已压缩
            </span>
          </motion.div>
        </div>

        {/* 左下：操作提示 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 3, duration: 1 }}
          className="absolute bottom-32 left-6 md:left-10 z-10 hidden md:block"
        >
          <div className="clay-panel flex animate-breathe items-center gap-2.5 rounded-full px-5 py-3">
            <MousePointerClick className="h-4 w-4 text-ice" />
            <span className="text-sm text-ink-soft">拖拽旋转 · 滚轮缩放 · 点击行星查看档案</span>
          </div>
        </motion.div>

        {/* 底部居中：时间控制台 */}
        <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2">
          <TimeConsole sim={sim} onResetView={resetView} />
        </div>

        {/* 右侧：行星信息面板 */}
        <PlanetInfoPanel slug={selected} simMs={sim.simMs} scaleMode={scaleMode} onClose={() => setSelected(null)} />

        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ y: -16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: CLAY_EASE }}
              className="absolute left-1/2 top-24 z-20 -translate-x-1/2"
            >
              <div className="clay-panel rounded-full px-6 py-3 text-sm font-semibold text-ink">{toast}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ============ S2 数据实时条 ============ */}
      <DataStrip simMs={sim.simMs} />

      {/* ============ S3 双比例模式说明 ============ */}
      <ScaleHonestySection />

      {/* ============ S4 行星速览卡带 ============ */}
      <PlanetBelt />

      {/* ============ S5 今日太阳系彩蛋 ============ */}
      <TodaySection simMs={sim.simMs} />

      {/* ============ S6 CTA ============ */}
      <CtaSection />
    </div>
  );
}
