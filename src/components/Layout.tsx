/**
 * Layout.tsx — 全站共享布局（路由模式 B：嵌套路由 + <Outlet/>）
 *
 * - 内含 Navbar（fixed 悬浮导航舱），内容插槽已补偿导航高度（NAV_TOTAL_OFFSET），
 *   页面代理【不要】再自行添加导航高度 padding/margin。
 * - 全屏黏土 Hero 可在页面内用负 margin（-mt-[92px]）顶回导航下方之外（仅 home 使用）。
 * - 背景：2 层视差星点 Canvas + 鼠标视差柔光斑 + Lenis 平滑滚动。
 */

import { useEffect, useRef } from 'react';
import { useLocation, useOutlet } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import Lenis from 'lenis';
import Navbar, { NAV_TOTAL_OFFSET } from './Navbar';
import Footer from './Footer';

/** 页面级绒面星空背景（近层缓移 90 颗 + 远层静止 220 颗 + 2 团柔光） */
function StarBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const blobsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0, h = 0, raf = 0;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const isMobile = window.innerWidth < 768;
    const NEAR = isMobile ? 45 : 90;
    const FAR = isMobile ? 110 : 220;

    interface Star { x: number; y: number; r: number; o: number; vx: number; vy: number }
    let near: Star[] = [];
    let far: Star[] = [];

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * DPR;
      canvas.height = h * DPR;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      const mk = (n: number, drift: boolean): Star[] =>
        Array.from({ length: n }, () => ({
          x: Math.random() * w,
          y: Math.random() * h,
          r: 0.5 + Math.random() * 1.0,
          o: 0.2 + Math.random() * 0.7,
          vx: drift ? (Math.random() - 0.5) * 0.06 : 0,
          vy: drift ? (Math.random() - 0.5) * 0.04 : 0,
        }));
      near = mk(NEAR, true);
      far = mk(FAR, false);
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      raf = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#FFFFFF';
      for (const s of far) {
        ctx.globalAlpha = s.o;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      for (const s of near) {
        s.x = (s.x + s.vx + w) % w;
        s.y = (s.y + s.vy + h) % h;
        ctx.globalAlpha = s.o;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r + 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };
    raf = requestAnimationFrame(draw);

    // 柔光斑鼠标微视差（±12px）
    const onMove = (e: MouseEvent) => {
      const el = blobsRef.current;
      if (!el) return;
      const dx = (e.clientX / window.innerWidth - 0.5) * 24;
      const dy = (e.clientY / window.innerHeight - 0.5) * 24;
      el.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
    };
    window.addEventListener('mousemove', onMove, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div ref={blobsRef} className="absolute inset-0 transition-transform duration-700 ease-out will-change-transform">
        <div
          className="absolute -left-32 -top-32 h-[480px] w-[480px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139,211,255,0.12) 0%, transparent 70%)', filter: 'blur(60px)' }}
        />
        <div
          className="absolute -bottom-40 -right-32 h-[520px] w-[520px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255,198,92,0.08) 0%, transparent 70%)', filter: 'blur(60px)' }}
        />
      </div>
    </div>
  );
}

export default function Layout() {
  const outlet = useOutlet();
  const location = useLocation();

  // Lenis 平滑滚动（全站）
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.09 });
    let raf = 0;
    const loop = (t: number) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  // 路由切换回顶
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [location.pathname]);

  return (
    <div className="relative min-h-[100dvh]">
      <StarBackground />
      <Navbar />
      {/* 内容插槽：已补偿 fixed 导航高度，页面从导航下方开始 */}
      <main style={{ paddingTop: NAV_TOTAL_OFFSET }} className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, scale: 0.98, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 12 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {outlet}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}
