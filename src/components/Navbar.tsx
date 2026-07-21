/**
 * Navbar.tsx — 悬浮黏土导航舱（design.md §7.1）
 * position: fixed；Layout 负责为内容插槽补偿导航高度，页面无需关心。
 */

import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CLAY_EASE } from './clay';

export const NAV_LINKS = [
  { to: '/', label: '实时模拟' },
  { to: '/planets', label: '行星图鉴' },
  { to: '/scale', label: '比例之旅' },
  { to: '/about', label: '关于数据' },
] as const;

/** 导航高度（含距顶 20px），Layout 用其做内容插槽顶部 padding */
export const NAV_HEIGHT = 72;
export const NAV_OFFSET = 20;
export const NAV_TOTAL_OFFSET = NAV_HEIGHT + NAV_OFFSET; // 92px

function useTheme() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window === 'undefined') return 'dark';
    return (localStorage.getItem('orbit-theme') as 'dark' | 'light') || 'dark';
  });
  useEffect(() => {
    if (theme === 'light') document.documentElement.dataset.theme = 'light';
    else delete document.documentElement.dataset.theme;
    localStorage.setItem('orbit-theme', theme);
  }, [theme]);
  return { theme, toggle: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')) };
}

/** “现在时刻”徽章（真实设备 UTC，DM Mono） */
function NowBadge() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const p = (n: number) => String(n).padStart(2, '0');
  return (
    <span className="clay-sunk hidden lg:inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-num text-xs text-sun">
      <span className="h-1.5 w-1.5 rounded-full bg-sun animate-breathe" />
      {`${now.getUTCFullYear()}-${p(now.getUTCMonth() + 1)}-${p(now.getUTCDate())} ${p(now.getUTCHours())}:${p(now.getUTCMinutes())}:${p(now.getUTCSeconds())}`}
    </span>
  );
}

export default function Navbar() {
  const { theme, toggle } = useTheme();
  const [scrolled, setScrolled] = useState(() => typeof window !== 'undefined' && window.scrollY > 120);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 120);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // 路由变化时收起移动端抽屉（渲染期派生状态，React 推荐模式）
  const [prevPath, setPrevPath] = useState(location.pathname);
  if (prevPath !== location.pathname) {
    setPrevPath(location.pathname);
    setDrawerOpen(false);
  }

  return (
    <>
      <motion.header
        initial={{ y: -90, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: CLAY_EASE }}
        className="fixed inset-x-0 top-5 z-[100] flex justify-center px-4 pointer-events-none"
      >
        <nav
          className={cn(
            'pointer-events-auto flex w-full max-w-[880px] items-center justify-between gap-3 rounded-full px-5 transition-all duration-300',
            'border border-white/10 backdrop-blur-[18px] shadow-clay',
            scrolled ? 'h-[60px] bg-clay/95' : 'h-[72px] bg-clay/85',
          )}
          style={{ background: scrolled ? 'color-mix(in srgb, var(--clay-surface) 95%, transparent)' : 'color-mix(in srgb, var(--clay-surface) 88%, transparent)' }}
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <img src="/logo.svg" alt="Orbit Clay" className="h-9 w-9 transition-transform duration-300 group-hover:rotate-12" />
            <span className="font-display text-xl font-bold text-ink hidden sm:inline">Orbit Clay</span>
          </Link>

          {/* 中部链接（桌面） */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'relative px-4 py-2 text-[15px] font-semibold transition-all duration-300 hover:-translate-y-0.5',
                    isActive ? 'text-sun' : 'text-ink-soft hover:text-ink',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {l.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-dot"
                        className="absolute -bottom-0.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-sun"
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* 右侧：主题开关 + 现在时刻 */}
          <div className="flex items-center gap-3 shrink-0">
            <NowBadge />
            <button
              type="button"
              onClick={toggle}
              aria-label="切换主题"
              className="clay-sunk relative h-9 w-[68px] rounded-full cursor-pointer"
            >
              <Sun className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-sun" />
              <Moon className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-ice" />
              <span
                className={cn(
                  'absolute top-1 h-7 w-7 rounded-full transition-all duration-300 shadow-clay',
                  theme === 'dark' ? 'left-[36px]' : 'left-1',
                )}
                style={{ background: 'radial-gradient(circle at 35% 30%, var(--clay-surface-hi), var(--clay-surface))' }}
              />
            </button>
          </div>
        </nav>
      </motion.header>

      {/* 移动端：右下悬浮按钮 + 全屏抽屉 */}
      <button
        type="button"
        aria-label="打开菜单"
        onClick={() => setDrawerOpen(true)}
        className="md:hidden fixed bottom-6 right-6 z-[100] flex h-16 w-16 items-center justify-center rounded-full bg-clay shadow-clay cursor-pointer active:scale-95 transition-transform"
      >
        <Menu className="h-7 w-7 text-ink" />
      </button>
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex flex-col bg-deep/95 backdrop-blur-xl p-8"
          >
            <div className="flex justify-end">
              <button
                type="button"
                aria-label="关闭菜单"
                onClick={() => setDrawerOpen(false)}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-clay shadow-clay cursor-pointer"
              >
                <X className="h-6 w-6 text-ink" />
              </button>
            </div>
            <div className="flex flex-1 flex-col items-center justify-center gap-6">
              {NAV_LINKS.map((l, i) => (
                <motion.div
                  key={l.to}
                  initial={{ y: 32, opacity: 0, scale: 0.9 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  transition={{ delay: 0.07 * i, duration: 0.5, ease: CLAY_EASE }}
                >
                  <NavLink
                    to={l.to}
                    end={l.to === '/'}
                    className={({ isActive }) =>
                      cn('font-display text-4xl font-extrabold', isActive ? 'text-sun' : 'text-ink')
                    }
                  >
                    {l.label}
                  </NavLink>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
