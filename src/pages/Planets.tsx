/**
 * Planets.tsx — 行星图鉴（/planets）
 * S1 页头 · S2 筛选排序工具条 · S3 行星卡片网格 · S4 对比小结 · S5 页尾 CTA
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowUpDown, Check, ChevronDown } from 'lucide-react';
import { ClayToggle, CLAY_EASE } from '@/components/clay';
import PlanetCard from '@/components/catalog/PlanetCard';
import AtGlance from '@/components/catalog/AtGlance';
import {
  BODIES, CATEGORY_FILTERS, SORT_OPTIONS, sortBodies,
  type CategoryKey, type SortKey,
} from '@/components/catalog/catalog-data';
import { useSimulationClock } from '@/lib/simulation';
import { formatUTC } from '@/lib/ephemeris';
import { cn } from '@/lib/utils';

const TITLE = '行星图鉴';

/* ---------------- 排序下拉（黏土菜单） ---------------- */
function SortDropdown({ value, onChange }: { value: SortKey; onChange: (v: SortKey) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const current = SORT_OPTIONS.find((o) => o.key === value)!;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="clay-sunk flex h-11 cursor-pointer items-center gap-2 rounded-full px-4 text-sm font-semibold text-ink-soft transition-colors hover:text-ink"
      >
        <ArrowUpDown className="h-4 w-4 text-ice" />
        {current.label}
        <ChevronDown className={cn('h-4 w-4 transition-transform duration-300', open && 'rotate-180')} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -6 }}
            transition={{ duration: 0.25, ease: CLAY_EASE }}
            className="clay-panel absolute right-0 top-full z-50 mt-2 w-44 origin-top rounded-clay-md p-1.5"
          >
            {SORT_OPTIONS.map((o) => (
              <button
                key={o.key}
                type="button"
                onClick={() => {
                  onChange(o.key);
                  setOpen(false);
                }}
                className={cn(
                  'flex w-full cursor-pointer items-center justify-between rounded-clay-sm px-3.5 py-2.5 text-sm font-semibold transition-colors',
                  o.key === value ? 'bg-clay-hi text-sun' : 'text-ink-soft hover:bg-clay-hi/60 hover:text-ink',
                )}
              >
                {o.label}
                {o.key === value && <Check className="h-4 w-4" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Planets() {
  const { simMs } = useSimulationClock();
  const [category, setCategory] = useState<CategoryKey | 'all'>('all');
  const [sort, setSort] = useState<SortKey>('default');
  const [realScale, setRealScale] = useState(false);

  const bodies = useMemo(() => {
    const filtered = category === 'all' ? BODIES : BODIES.filter((b) => b.categoryKey === category);
    return sortBodies(filtered, sort);
  }, [category, sort]);

  return (
    <div className="pb-8">
      {/* ============ S1 页头区 ============ */}
      <section className="mx-auto flex max-w-content flex-col items-center px-6 pt-14 text-center">
        <motion.span
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: CLAY_EASE }}
          className="rounded-full border border-ice/60 bg-ice/10 px-4 py-1.5 font-num text-xs tracking-[0.2em] text-ice"
        >
          PLANET ENCYCLOPEDIA
        </motion.span>

        <h1 className="mt-5 font-display text-5xl md:text-[56px] font-black leading-[1.1] text-ink">
          {TITLE.split('').map((ch, i) => (
            <motion.span
              key={i}
              className="inline-block"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 + i * 0.04, duration: 0.55, ease: CLAY_EASE }}
            >
              {ch}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5, ease: CLAY_EASE }}
          className="mt-3 text-[17px] text-ink-soft"
        >
          九颗天体 · 真实材质 · 实时状态
        </motion.p>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5, ease: CLAY_EASE }}
          className="clay-panel mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5"
        >
          <span className="h-2 w-2 animate-breathe rounded-full bg-mint" />
          <span className="font-num text-[13px] text-ink-soft">
            此刻它们正运行在真实轨道上 · {formatUTC(simMs)}
          </span>
        </motion.div>
      </section>

      {/* ============ S2 筛选与排序黏土工具条 ============ */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4, ease: CLAY_EASE }}
        className="sticky top-[96px] z-40 mx-auto mt-10 max-w-content px-6"
      >
        <div
          className="clay-panel flex flex-wrap items-center justify-center gap-x-5 gap-y-3 rounded-[32px] px-5 py-3.5 backdrop-blur-[18px] md:justify-between md:rounded-full"
          style={{ background: 'color-mix(in srgb, var(--clay-surface) 88%, transparent)' }}
        >
          {/* 分类筛选（内凹槽单选） */}
          <div className="clay-sunk flex flex-wrap justify-center rounded-[28px] p-1 md:rounded-full">
            {CATEGORY_FILTERS.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setCategory(c.key)}
                className={cn(
                  'relative cursor-pointer rounded-full px-3.5 py-2 text-sm font-bold transition-colors duration-300',
                  category === c.key ? 'text-[#4A3418]' : 'text-ink-soft hover:text-ink',
                )}
              >
                {category === c.key && (
                  <motion.span
                    layoutId="catalog-cat-pill"
                    className="absolute inset-0 rounded-full bg-sun shadow-clay"
                    transition={{ duration: 0.35, ease: CLAY_EASE }}
                  />
                )}
                <span className="relative z-10">{c.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <SortDropdown value={sort} onChange={setSort} />
            <ClayToggle checked={realScale} onChange={setRealScale} label="等比球径" />
          </div>
        </div>
      </motion.div>

      {/* ============ S3 行星卡片网格 ============ */}
      <section className="mx-auto mt-10 max-w-content px-6">
        {bodies.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: CLAY_EASE }}
            className="clay-panel flex flex-col items-center gap-4 p-14 text-center"
          >
            <img src="/empty-state.svg" alt="" className="w-56 opacity-90" />
            <p className="text-ink-soft">这片空域暂时没有星球</p>
          </motion.div>
        ) : (
          <motion.div layout className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence>
              {bodies.map((b, i) => (
                <PlanetCard key={b.slug} body={b} realScale={realScale} index={i} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {realScale && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 text-center font-num text-xs text-ink-mute"
          >
            等比球径已开启：所有天体按真实直径等比显示（地球 = 1），超出预览窝的天体以「局部」标注
          </motion.p>
        )}
      </section>

      {/* ============ S4 对比小结区 ============ */}
      <AtGlance />

      {/* ============ S5 页尾 CTA ============ */}
      <section className="mx-auto mt-32 flex max-w-content flex-col items-center gap-7 px-6 text-center">
        <motion.h2
          initial={{ y: 32, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: CLAY_EASE }}
          className="font-display text-3xl md:text-4xl font-extrabold text-ink"
        >
          数据从哪来？
        </motion.h2>
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ delay: 0.15, duration: 0.55, ease: CLAY_EASE }}
        >
          <Link
            to="/about"
            className="group inline-flex h-[52px] items-center gap-2 rounded-full bg-clay-hi px-7 font-display font-bold text-ink shadow-clay transition-all hover:-translate-y-0.5 hover:shadow-clay-hover"
          >
            查看数据来源与模拟原理
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
