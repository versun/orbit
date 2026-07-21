/**
 * Footer.tsx — 黏土浅滩（design.md §7.2）
 */

import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { NAV_LINKS } from './Navbar';
import { PLANETS } from '@/lib/planets';
import { CLAY_EASE } from './clay';

export default function Footer() {
  return (
    <footer
      className="clay-sunk mt-32 px-6 pb-10 pt-16"
      style={{ borderRadius: '44px 44px 0 0' }}
    >
      <div className="mx-auto grid max-w-content gap-10 md:grid-cols-4">
        {/* 品牌 */}
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: CLAY_EASE }}
          className="flex flex-col gap-4"
        >
          <div className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="Orbit Clay" className="h-10 w-10" />
            <span className="font-display text-2xl font-bold text-ink">Orbit Clay</span>
          </div>
          <p className="text-[15px] leading-relaxed text-ink-soft">
            掌心宇宙 · 软陶星球。以真实天文数据驱动的黏土质感太阳系实时模拟。
          </p>
        </motion.div>

        {/* 页面导航 */}
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, delay: 0.1, ease: CLAY_EASE }}
          className="flex flex-col gap-3"
        >
          <h3 className="font-display text-lg font-bold text-ink">页面导航</h3>
          {NAV_LINKS.map((l) => (
            <Link key={l.to} to={l.to} className="w-fit text-[15px] text-ink-soft transition-colors hover:text-sun">
              {l.label}
            </Link>
          ))}
        </motion.div>

        {/* 行星速查 */}
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, delay: 0.2, ease: CLAY_EASE }}
          className="flex flex-col gap-3"
        >
          <h3 className="font-display text-lg font-bold text-ink">行星速查</h3>
          <div className="grid grid-cols-4 gap-2.5">
            {PLANETS.map((p) => (
              <Link
                key={p.slug}
                to={`/planets/${p.slug}`}
                title={p.nameZh}
                className="group flex flex-col items-center gap-1.5"
              >
                <span
                  className="h-8 w-8 rounded-full transition-transform duration-300 group-hover:-translate-y-1"
                  style={{
                    background: `radial-gradient(circle at 32% 28%, color-mix(in srgb, ${p.color} 55%, white), ${p.color} 55%, color-mix(in srgb, ${p.color} 60%, black))`,
                    boxShadow: 'inset -3px -4px 7px rgba(10,11,30,0.45), inset 2px 2px 4px rgba(255,255,255,0.28), 4px 5px 10px rgba(13,14,36,0.4)',
                  }}
                />
                <span className="text-xs text-ink-mute group-hover:text-ink">{p.nameZh}</span>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* 数据来源 */}
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, delay: 0.3, ease: CLAY_EASE }}
          className="flex flex-col gap-3"
        >
          <h3 className="font-display text-lg font-bold text-ink">数据来源</h3>
          <p className="text-[15px] leading-relaxed text-ink-soft">
            轨道计算基于 JPL 近似开普勒根数表（J2000 历元）；行星物理参数来自 NASA Planetary Fact Sheet；表面纹理为按真实影像风格制作的等距圆柱投影贴图。
          </p>
        </motion.div>
      </div>

      <div className="mx-auto mt-12 max-w-content border-t border-white/10 pt-6 text-center">
        <p className="font-num text-xs tracking-wider text-ink-mute">
          © 2026 Orbit Clay · 模拟数据为近似开普勒根数计算，仅供科普演示
        </p>
      </div>
    </footer>
  );
}
