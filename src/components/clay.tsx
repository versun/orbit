/**
 * clay.tsx — 黏土拟态通用组件库（design.md §7.3）
 * ClayButton / ClayCard / ClayToggle / ClayBadge / PlanetOrb / DataStat / SectionHeading / ClaySlider
 */

import { forwardRef, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/* ---------------- ClayButton ---------------- */
export interface ClayButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
}

const btnSizes = { sm: 'h-10 px-5 text-sm', md: 'h-[52px] px-7 text-[15px]', lg: 'h-16 px-9 text-lg' } as const;

export const ClayButton = forwardRef<HTMLButtonElement, ClayButtonProps>(
  ({ variant = 'primary', size = 'md', icon, className, children, ...rest }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full font-display font-bold transition-all duration-200 cursor-pointer select-none',
        'shadow-clay hover:-translate-y-0.5 hover:shadow-clay-hover active:translate-y-0 active:scale-[0.97] active:shadow-clay-inset',
        variant === 'primary' && 'bg-sun text-[#4A3418]',
        variant === 'secondary' && 'bg-clay-hi text-ink',
        variant === 'ghost' && 'bg-clay text-ink-soft',
        btnSizes[size],
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  ),
);
ClayButton.displayName = 'ClayButton';

/* ---------------- ClayCard ---------------- */
export function ClayCard({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('clay-panel clay-panel-hover p-6', className)} {...rest}>
      {children}
    </div>
  );
}

/* ---------------- ClayToggle（内凹槽 + 圆球滑块） ---------------- */
export interface ClayToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}
export function ClayToggle({ checked, onChange, label, disabled, className }: ClayToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'group inline-flex items-center gap-2.5 cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed',
        className,
      )}
    >
      <span className="clay-sunk relative h-8 w-14 rounded-full shrink-0 transition-colors">
        <span
          className={cn(
            'absolute top-1 left-1 h-6 w-6 rounded-full transition-all duration-300',
            'bg-gradient-to-br from-white/70 to-white/10',
            checked ? 'translate-x-6 bg-sun shadow-[0_2px_8px_rgba(255,198,92,0.55)]' : 'translate-x-0 bg-clay-hi',
          )}
          style={{
            background: checked
              ? 'radial-gradient(circle at 35% 30%, #FFE3A6, #FFC65C 60%, #F0932B)'
              : 'radial-gradient(circle at 35% 30%, var(--clay-surface-hi), var(--clay-inset))',
          }}
        />
      </span>
      {label && <span className="text-sm font-semibold text-ink-soft group-hover:text-ink transition-colors">{label}</span>}
    </button>
  );
}

/* ---------------- ClayBadge ---------------- */
export interface ClayBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: string;
}
export function ClayBadge({ color, className, style, children, ...rest }: ClayBadgeProps) {
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 rounded-clay-sm px-3 py-1 text-xs font-bold tracking-wider', className)}
      style={{
        color: color ?? 'var(--accent-ice)',
        border: `1.5px solid ${color ?? 'var(--accent-ice)'}`,
        background: `color-mix(in srgb, ${color ?? 'var(--accent-ice)'} 14%, transparent)`,
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  );
}

/* ---------------- PlanetOrb（CSS 径向渐变装饰球，支持纹理） ---------------- */
export interface PlanetOrbProps {
  size?: number;
  color?: string;
  /** 纹理图片路径（优先于纯色） */
  texture?: string;
  /** 漂浮动画相位偏移（s） */
  floatDelay?: number;
  className?: string;
}
export function PlanetOrb({ size = 56, color = '#6FB7FF', texture, floatDelay = 0, className }: PlanetOrbProps) {
  return (
    <div
      className={cn('rounded-full shrink-0 animate-clay-float', className)}
      style={{
        width: size,
        height: size,
        animationDelay: `${floatDelay}s`,
        background: texture
          ? `url(${texture}) center/cover`
          : `radial-gradient(circle at 32% 28%, color-mix(in srgb, ${color} 55%, white), ${color} 55%, color-mix(in srgb, ${color} 60%, black))`,
        boxShadow:
          'inset -6px -8px 14px rgba(10,11,30,0.45), inset 3px 4px 8px rgba(255,255,255,0.28), 8px 10px 20px rgba(13,14,36,0.4)',
      }}
    />
  );
}

/* ---------------- DataStat（DM Mono 大数字 + 小标签） ---------------- */
export interface DataStatProps {
  label: string;
  value: string;
  unit?: string;
  accent?: string;
  className?: string;
}
export function DataStat({ label, value, unit, accent, className }: DataStatProps) {
  return (
    <div className={cn('flex flex-col items-center gap-1 px-2 text-center', className)}>
      <span className="text-[13px] font-semibold tracking-[0.08em] text-ink-mute">{label}</span>
      <span className="font-num text-lg md:text-xl" style={{ color: accent ?? 'var(--text-primary)' }}>
        {value}
        {unit && <span className="ml-1 text-sm text-ink-mute">{unit}</span>}
      </span>
    </div>
  );
}

/* ---------------- SectionHeading（冰蓝标签 + 大标题 + 波浪线） ---------------- */
export function SectionHeading({ tag, title, className, align = 'left' }: { tag: string; title: string; className?: string; align?: 'left' | 'center' }) {
  return (
    <div className={cn('flex flex-col gap-3', align === 'center' && 'items-center text-center', className)}>
      <ClayBadge color="var(--accent-ice)" className="w-fit">{tag}</ClayBadge>
      <h2 className="font-display text-3xl md:text-5xl font-extrabold leading-tight text-ink">{title}</h2>
      <svg width="120" height="10" viewBox="0 0 120 10" fill="none" aria-hidden>
        <path d="M2 5 Q 12 0, 22 5 T 42 5 T 62 5 T 82 5 T 102 5 T 122 5" stroke="var(--accent-ice)" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
      </svg>
    </div>
  );
}

/* ---------------- ClaySlider（内凹滑轨 + 球形拇指，分段档位） ---------------- */
export interface ClaySliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (v: number) => void;
  disabled?: boolean;
  className?: string;
  /** 档位刻度点数量（含端点） */
  ticks?: number;
}
export function ClaySlider({ value, min = 0, max = 100, step = 1, onChange, disabled, className, ticks }: ClaySliderProps) {
  return (
    <div className={cn('relative flex items-center', className)}>
      {ticks && ticks > 1 && (
        <div className="pointer-events-none absolute inset-x-[14px] top-1/2 flex -translate-y-1/2 justify-between">
          {Array.from({ length: ticks }).map((_, i) => (
            <span key={i} className="h-1.5 w-1.5 rounded-full bg-ink-mute/60" />
          ))}
        </div>
      )}
      <input
        type="range"
        aria-label="clay slider"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className={cn('clay-slider w-full', disabled && 'opacity-40 pointer-events-none')}
      />
    </div>
  );
}

/* 供 framer-motion 使用的回弹缓动 */
export const CLAY_EASE = [0.34, 1.56, 0.64, 1] as [number, number, number, number];
