/**
 * simulation.ts — 模拟时钟与 React Hook
 *
 * SimulationClock 是可变时钟对象（ref 稳定），渲染循环每帧调用 now()
 * 获取当前模拟 UTC 毫秒；React UI 通过 useSimulationClock 以 ~10Hz
 * 节流镜像状态（日期显示、数据条），避免 60fps 重渲染。
 *
 * 默认锁定设备真实 UTC 时间，默认倍率 1 小时/秒（DEFAULT_RATE）。
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_RATE, MIN_DATE_MS, MAX_DATE_MS, type TimeRateValue } from './ephemeris';

export class SimulationClock {
  /** 设置基准时的真实性能时间 ms */
  private basePerf = performance.now();
  /** 基准模拟时刻（UTC ms） */
  private baseSim = Date.now();
  /** 时间倍率（模拟秒 / 现实秒） */
  rate: number = DEFAULT_RATE;
  /** 是否推进 */
  playing = true;

  /** 当前模拟时刻 UTC ms */
  now(): number {
    if (!this.playing) return this.baseSim;
    return this.baseSim + (performance.now() - this.basePerf) * this.rate;
  }

  private anchor() {
    this.baseSim = this.now();
    this.basePerf = performance.now();
  }

  setRate(rate: number) {
    this.anchor();
    this.rate = rate;
  }

  play() {
    if (this.playing) return;
    this.basePerf = performance.now();
    this.playing = true;
  }

  pause() {
    if (!this.playing) return;
    this.anchor();
    this.playing = false;
  }

  togglePlay() {
    if (this.playing) this.pause();
    else this.play();
  }

  /** 跳转至任意 UTC 毫秒（自动夹在 1900–2100） */
  jumpTo(ms: number) {
    this.baseSim = Math.min(MAX_DATE_MS, Math.max(MIN_DATE_MS, ms));
    this.basePerf = performance.now();
  }
}

export interface SimulationControls {
  clock: SimulationClock;
  /** 当前模拟时刻（~10Hz 节流镜像，仅用于 UI 显示） */
  simMs: number;
  rate: TimeRateValue | number;
  playing: boolean;
  /** 真实实时模式（1× 锁定） */
  realTime: boolean;
  setRate: (r: TimeRateValue) => void;
  togglePlay: () => void;
  setRealTime: (on: boolean) => void;
  jumpTo: (ms: number) => void;
  /** 回到设备真实当前时刻 */
  backToNow: () => void;
}

export function useSimulationClock(): SimulationControls {
  // 惰性初始化一次（实例可变，ref/state 稳定）
  const [clock] = useState(() => new SimulationClock());

  const [simMs, setSimMs] = useState(() => clock.now());
  const [playing, setPlaying] = useState(clock.playing);
  const [rate, setRateState] = useState<number>(clock.rate);
  const [realTime, setRealTimeState] = useState(false);
  /** 真实实时开启前的倍率，用于切回 */
  const prevRate = useRef<number>(DEFAULT_RATE);

  // ~10Hz 节流镜像时钟 → React state
  useEffect(() => {
    let raf = 0;
    let last = 0;
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (t - last < 100) return;
      last = t;
      setSimMs(clock.now());
      setPlaying(clock.playing);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [clock]);

  const setRate = useCallback((r: TimeRateValue) => {
    clock.setRate(r);
    setRateState(r);
    setRealTimeState(r === 1);
  }, [clock]);

  const togglePlay = useCallback(() => {
    clock.togglePlay();
    setPlaying(clock.playing);
  }, [clock]);

  const setRealTime = useCallback((on: boolean) => {
    if (on) {
      prevRate.current = clock.rate === 1 ? DEFAULT_RATE : clock.rate;
      clock.setRate(1);
      clock.jumpTo(Date.now());
      setRateState(1);
      setRealTimeState(true);
      if (!clock.playing) clock.play();
      setPlaying(true);
    } else {
      clock.setRate(prevRate.current);
      setRateState(prevRate.current);
      setRealTimeState(false);
    }
  }, [clock]);

  const jumpTo = useCallback((ms: number) => {
    clock.jumpTo(ms);
    setSimMs(clock.now());
  }, [clock]);

  const backToNow = useCallback(() => {
    clock.jumpTo(Date.now());
    setSimMs(clock.now());
  }, [clock]);

  return { clock, simMs, rate, playing, realTime, setRate, togglePlay, setRealTime, jumpTo, backToNow };
}
