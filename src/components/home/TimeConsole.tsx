/**
 * TimeConsole.tsx — 时间控制台（home.md §S1.2，底部悬浮黏土条）
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, CalendarDays, RotateCcw, X } from 'lucide-react';
import { ClayToggle, ClaySlider, CLAY_EASE } from '@/components/clay';
import { TIME_RATES, formatUTC, formatDateOnly, type TimeRateValue } from '@/lib/ephemeris';
import type { SimulationControls } from '@/lib/simulation';

const SLIDER_RATES: TimeRateValue[] = [60, 3600, 86400, 864000];

export default function TimeConsole({ sim, onResetView }: { sim: SimulationControls; onResetView: () => void }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [dateStr, setDateStr] = useState(() => formatDateOnly(Date.now()));

  const sliderIdx = Math.max(0, SLIDER_RATES.indexOf(sim.rate as TimeRateValue));
  const currentRateInfo = TIME_RATES.find((r) => r.value === sim.rate);

  const openModal = () => {
    setDateStr(formatDateOnly(sim.simMs));
    setModalOpen(true);
  };

  const applyDate = (v: string) => {
    setDateStr(v);
    const ms = Date.parse(`${v}T00:00:00Z`);
    if (!Number.isNaN(ms)) sim.jumpTo(ms);
  };

  return (
    <>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.7, ease: CLAY_EASE }}
        className="pointer-events-auto flex items-center gap-3 md:gap-5 rounded-full bg-clay/85 px-4 md:px-7 py-3 shadow-clay backdrop-blur-[18px] border border-white/10 max-w-[94vw] overflow-x-auto no-scrollbar"
      >
        {/* 播放/暂停 */}
        <button
          type="button"
          onClick={sim.togglePlay}
          aria-label={sim.playing ? '暂停' : '播放'}
          className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-sun text-[#4A3418] shadow-clay transition-all hover:-translate-y-0.5 active:scale-95 active:shadow-clay-inset cursor-pointer"
        >
          {sim.playing ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 translate-x-0.5" />}
        </button>

        {/* 真实实时 */}
        <div className="hidden sm:flex flex-col items-center gap-0.5 shrink-0">
          <ClayToggle checked={sim.realTime} onChange={sim.setRealTime} />
          <span className="text-[11px] font-semibold tracking-wider text-ink-mute">实时</span>
        </div>

        {/* 倍率滑块 */}
        <div className="flex flex-col gap-0.5 w-40 md:w-52 shrink-0">
          <ClaySlider
            value={sim.realTime ? 0 : sliderIdx}
            min={0}
            max={SLIDER_RATES.length - 1}
            step={1}
            ticks={4}
            disabled={sim.realTime}
            onChange={(i) => sim.setRate(SLIDER_RATES[i])}
          />
          <div className="flex justify-between px-3 text-[10px] font-num text-ink-mute">
            <span>60×</span><span>1h/s</span><span>1d/s</span><span>10d/s</span>
          </div>
        </div>

        {/* 当前模拟日期 */}
        <div className="flex flex-col items-center shrink-0 min-w-[150px]">
          <span className="font-num text-base md:text-lg text-sun leading-tight">{formatUTC(sim.simMs)}</span>
          <span className="text-[11px] font-semibold tracking-wider text-ink-mute">
            {sim.realTime ? '与真实时间同步' : sim.playing ? `推进中 · ${currentRateInfo?.hint ?? ''}` : '已暂停'}
          </span>
        </div>

        {/* 日期跳转 */}
        <button
          type="button"
          onClick={openModal}
          aria-label="日期跳转"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-clay-hi text-ink shadow-clay transition-all hover:-translate-y-0.5 active:scale-95 active:shadow-clay-inset cursor-pointer"
        >
          <CalendarDays className="h-5 w-5" />
        </button>

        {/* 重置视角 */}
        <button
          type="button"
          onClick={onResetView}
          aria-label="重置视角"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-clay-hi text-ink shadow-clay transition-all hover:-translate-y-0.5 active:scale-95 active:shadow-clay-inset cursor-pointer"
        >
          <RotateCcw className="h-5 w-5" />
        </button>
      </motion.div>

      {/* 日期跳转模态 */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center bg-[rgba(20,21,48,0.6)] backdrop-blur-[8px] p-6"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ duration: 0.4, ease: CLAY_EASE }}
              className="clay-panel w-full max-w-sm p-7 flex flex-col gap-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl font-bold text-ink">跳转到任意日期</h3>
                <button
                  type="button"
                  aria-label="关闭"
                  onClick={() => setModalOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-clay-hi text-ink-soft cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="clay-sunk rounded-clay-md p-4">
                <input
                  type="date"
                  value={dateStr}
                  min="1900-01-01"
                  max="2100-12-31"
                  onChange={(e) => applyDate(e.target.value)}
                  className="w-full bg-transparent font-num text-lg text-ink outline-none"
                />
              </div>
              <p className="text-sm text-ink-mute">有效区间 1900 – 2100，轨道根数在该范围内保持可靠精度。</p>
              <button
                type="button"
                onClick={() => {
                  sim.backToNow();
                  setModalOpen(false);
                }}
                className="h-12 rounded-full bg-sun font-display font-bold text-[#4A3418] shadow-clay transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer"
              >
                回到现在
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
