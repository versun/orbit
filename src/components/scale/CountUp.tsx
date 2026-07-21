/**
 * CountUp.tsx — 滚动入场数字计数（framer-motion animate + ref 直写，不触发重渲染）
 */

import { useEffect, useRef } from 'react';
import { animate, useInView } from 'framer-motion';

export interface CountUpProps {
  to: number;
  format?: (v: number) => string;
  duration?: number;
  delay?: number;
  className?: string;
}

export default function CountUp({ to, format, duration = 1.6, delay = 0, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -18% 0px' });

  useEffect(() => {
    if (!inView || !ref.current) return;
    const fmt = format ?? ((n: number) => String(Math.round(n)));
    const controls = animate(0, to, {
      duration,
      delay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = fmt(v);
      },
    });
    return () => controls.stop();
  }, [inView, to, format, duration, delay]);

  return (
    <span ref={ref} className={className}>
      {format ? format(0) : '0'}
    </span>
  );
}
