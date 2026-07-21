/**
 * ephemeris.ts — JPL 近似开普勒轨道根数引擎
 *
 * 数据源：JPL "Keplerian Elements for Approximate Positions of the Major Planets"
 * （J2000 历元，EM Barycenter，有效区间约 1800–2050）。
 * 每颗行星由 6 个根数 (a, e, i, L, ϖ, Ω) 及其儒略世纪变率描述，
 * 通过牛顿迭代解开普勒方程得到日心黄道坐标。
 *
 * 坐标约定：输出为 J2000 日心黄道坐标（AU），x 指向春分点，z 指向黄道北。
 * 本模块为纯函数模块，可在任何页面复用。
 */

export type PlanetSlug =
  | 'mercury' | 'venus' | 'earth' | 'mars'
  | 'jupiter' | 'saturn' | 'uranus' | 'neptune';

/** 开普勒六根数（角度单位：度；a 单位：AU） */
export interface KeplerianElements {
  /** 半长轴 AU */
  a: number;
  /** 离心率 */
  e: number;
  /** 轨道倾角 deg（相对 J2000 黄道面） */
  i: number;
  /** 平黄经 deg */
  L: number;
  /** 近日点黄经 deg */
  lp: number;
  /** 升交点黄经 deg */
  node: number;
}

interface ElementRow extends KeplerianElements {
  aDot: number; eDot: number; iDot: number; LDot: number; lpDot: number; nodeDot: number;
}

/** JPL 近似根数表（J2000 值 + 每儒略世纪变率） */
export const JPL_ELEMENTS: Record<PlanetSlug, ElementRow> = {
  mercury: { a: 0.38709927, e: 0.20563593, i: 7.00497902, L: 252.25032350, lp: 77.45779628, node: 48.33076593, aDot: 0.00000037, eDot: 0.00001906, iDot: -0.00594749, LDot: 149472.67411175, lpDot: 0.16047689, nodeDot: -0.12534081 },
  venus:   { a: 0.72333566, e: 0.00677672, i: 3.39467605, L: 181.97909950, lp: 131.60246718, node: 76.67984255, aDot: 0.00000390, eDot: -0.00004107, iDot: -0.00078890, LDot: 58517.81538729, lpDot: 0.00268329, nodeDot: -0.27769418 },
  earth:   { a: 1.00000261, e: 0.01671123, i: -0.00001531, L: 100.46457166, lp: 102.93768193, node: 0.0, aDot: 0.00000562, eDot: -0.00004392, iDot: -0.01294668, LDot: 35999.37244981, lpDot: 0.32327364, nodeDot: 0.0 },
  mars:    { a: 1.52371034, e: 0.09339410, i: 1.84969142, L: -4.55343205, lp: -23.94362959, node: 49.55953891, aDot: 0.00001847, eDot: 0.00007882, iDot: -0.00813131, LDot: 19140.30268499, lpDot: 0.44441088, nodeDot: -0.29257343 },
  jupiter: { a: 5.20288700, e: 0.04838624, i: 1.30439695, L: 34.39644051, lp: 14.72847983, node: 100.47390909, aDot: -0.00011607, eDot: -0.00013253, iDot: -0.00183714, LDot: 3034.74612775, lpDot: 0.21252668, nodeDot: 0.20469106 },
  saturn:  { a: 9.53667594, e: 0.05386179, i: 2.48599187, L: 49.95424423, lp: 92.59887831, node: 113.66242448, aDot: -0.00125060, eDot: -0.00050991, iDot: 0.00193609, LDot: 1222.49362201, lpDot: -0.41897216, nodeDot: -0.28867794 },
  uranus:  { a: 19.18916464, e: 0.04725744, i: 0.77263783, L: 313.23810451, lp: 170.95427630, node: 74.01692503, aDot: -0.00196176, eDot: -0.00004397, iDot: -0.00242939, LDot: 428.48202785, lpDot: 0.40805281, nodeDot: 0.04240589 },
  neptune: { a: 30.06992276, e: 0.00859048, i: 1.77004347, L: -55.12002969, lp: 44.96476227, node: 131.78422574, aDot: 0.00026291, eDot: 0.00005105, iDot: 0.00035372, LDot: 218.45945325, lpDot: -0.32241464, nodeDot: -0.00508664 },
};

export const PLANET_SLUGS: PlanetSlug[] = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];

/** J2000 历元 = 2000-01-01 12:00 UTC（JD 2451545.0） */
export const J2000_MS = Date.UTC(2000, 0, 1, 12, 0, 0);
const MS_PER_DAY = 86400000;

/** 儒略日 */
export function julianDay(date: Date | number): number {
  const ms = typeof date === 'number' ? date : date.getTime();
  return ms / MS_PER_DAY + 2440587.5;
}

/** 自 J2000 起的儒略世纪数 */
export function julianCenturies(date: Date | number): number {
  return (julianDay(date) - 2451545.0) / 36525.0;
}

const norm360 = (d: number) => ((d % 360) + 360) % 360;
const toRad = (d: number) => (d * Math.PI) / 180;
const toDeg = (r: number) => (r * 180) / Math.PI;

/** 计算某时刻的开普勒根数 */
export function elementsAt(slug: PlanetSlug, date: Date | number): KeplerianElements {
  const T = julianCenturies(date);
  const row = JPL_ELEMENTS[slug];
  return {
    a: row.a + row.aDot * T,
    e: row.e + row.eDot * T,
    i: row.i + row.iDot * T,
    L: norm360(row.L + row.LDot * T),
    lp: norm360(row.lp + row.lpDot * T),
    node: norm360(row.node + row.nodeDot * T),
  };
}

/** 牛顿迭代解开普勒方程 M = E - e·sinE（M、E 为弧度），迭代至 |Δ| < 1e-8 */
export function solveKepler(M: number, e: number): number {
  let E = e < 0.8 ? M : Math.PI;
  for (let k = 0; k < 32; k++) {
    const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < 1e-8) break;
  }
  return E;
}

export interface HelioState {
  /** 日心黄道坐标（AU，J2000 黄道系） */
  x: number; y: number; z: number;
  /** 日心距 AU */
  rAU: number;
  /** 日心黄经 deg */
  lonDeg: number;
  /** 日心黄纬 deg */
  latDeg: number;
  /** 真近点角 deg */
  trueAnomalyDeg: number;
  /** 平黄经 deg */
  meanLongitudeDeg: number;
  /** 使用的根数快照 */
  elements: KeplerianElements;
}

/** 计算行星日心状态（位置、黄经黄纬、日心距） */
export function heliocentricState(slug: PlanetSlug, date: Date | number): HelioState {
  const el = elementsAt(slug, date);
  const iR = toRad(el.i);
  const omega = toRad(el.lp - el.node); // 近点幅角
  const nodeR = toRad(el.node);
  const M = toRad(norm360(el.L - el.lp));
  const E = solveKepler(M, el.e);

  // 轨道面内坐标
  const xp = el.a * (Math.cos(E) - el.e);
  const yp = el.a * Math.sqrt(1 - el.e * el.e) * Math.sin(E);

  // 旋转至黄道系
  const cw = Math.cos(omega), sw = Math.sin(omega);
  const cO = Math.cos(nodeR), sO = Math.sin(nodeR);
  const ci = Math.cos(iR), si = Math.sin(iR);

  const x = (cw * cO - sw * sO * ci) * xp + (-sw * cO - cw * sO * ci) * yp;
  const y = (cw * sO + sw * cO * ci) * xp + (-sw * sO + cw * cO * ci) * yp;
  const z = sw * si * xp + cw * si * yp;

  const rAU = Math.sqrt(x * x + y * y + z * z);
  return {
    x, y, z, rAU,
    lonDeg: norm360(toDeg(Math.atan2(y, x))),
    latDeg: toDeg(Math.asin(z / rAU)),
    trueAnomalyDeg: norm360(toDeg(Math.atan2(yp, xp))),
    meanLongitudeDeg: el.L,
    elements: el,
  };
}

const AU_KM = 149597870.7;
const GM_SUN = 1.32712440018e11; // km^3/s^2

/** 轨道速度 km/s（vis-viva 方程） */
export function orbitalVelocityKmS(slug: PlanetSlug, date: Date | number): number {
  const el = elementsAt(slug, date);
  const r = heliocentricState(slug, date).rAU * AU_KM;
  const a = el.a * AU_KM;
  return Math.sqrt(GM_SUN * (2 / r - 1 / a));
}

/**
 * 完整椭圆轨道采样点（日心黄道坐标 AU 数组）。
 * 基于当前根数构型生成整条椭圆（含真实轨道倾角）。
 */
export function orbitPathPoints(slug: PlanetSlug, date: Date | number, segments = 256): [number, number, number][] {
  const el = elementsAt(slug, date);
  const iR = toRad(el.i);
  const omega = toRad(el.lp - el.node);
  const nodeR = toRad(el.node);
  const cw = Math.cos(omega), sw = Math.sin(omega);
  const cO = Math.cos(nodeR), sO = Math.sin(nodeR);
  const ci = Math.cos(iR), si = Math.sin(iR);
  const b = el.a * Math.sqrt(1 - el.e * el.e);
  const pts: [number, number, number][] = [];
  for (let k = 0; k <= segments; k++) {
    const nu = (k / segments) * Math.PI * 2;
    const xp = el.a * Math.cos(nu) - el.a * el.e;
    const yp = b * Math.sin(nu);
    pts.push([
      (cw * cO - sw * sO * ci) * xp + (-sw * cO - cw * sO * ci) * yp,
      (cw * sO + sw * cO * ci) * xp + (-sw * sO + cw * cO * ci) * yp,
      sw * si * xp + cw * si * yp,
    ]);
  }
  return pts;
}

/** 黄经对应的黄道十二星座（近似：每宫 30°，自春分点起） */
const ZODIAC = ['白羊座', '金牛座', '双子座', '巨蟹座', '狮子座', '处女座', '天秤座', '天蝎座', '射手座', '摩羯座', '水瓶座', '双鱼座'];
export function zodiacSign(lonDeg: number): string {
  return ZODIAC[Math.floor(norm360(lonDeg) / 30) % 12];
}

export interface OppositionEvent {
  /** 事件日期 */
  date: Date;
  /** 距参考日的天数 */
  days: number;
  /** 事件类型：冲日（外行星）/ 合日（内行星） */
  kind: 'opposition' | 'conjunction';
}

/**
 * 估算下一次"冲日"（外行星与地球黄经相合）或"合日"（内行星）。
 * 逐日扫描（粗扫 1 天步长）+ 局部细化，供数据条/彩蛋区展示。
 */
export function nextAlignment(slug: PlanetSlug, fromDate: Date | number, maxDays = 800): OppositionEvent | null {
  if (slug === 'earth') return null;
  const inner = slug === 'mercury' || slug === 'venus';
  const startMs = typeof fromDate === 'number' ? fromDate : fromDate.getTime();
  const diff = (ms: number) => {
    const p = heliocentricState(slug, ms).lonDeg;
    const e = heliocentricState('earth', ms).lonDeg;
    let d = norm360(p - e);
    if (d > 180) d -= 360;
    return d;
  };
  let prev = diff(startMs);
  for (let day = 1; day <= maxDays; day++) {
    const ms = startMs + day * MS_PER_DAY;
    const cur = diff(ms);
    if (prev !== 0 && Math.sign(prev) !== Math.sign(cur) && Math.abs(prev - cur) < 10) {
      // 线性插值细化到小时级
      const frac = Math.abs(prev) / (Math.abs(prev) + Math.abs(cur));
      const refined = new Date(ms - MS_PER_DAY + frac * MS_PER_DAY);
      return { date: refined, days: day - 1 + frac, kind: inner ? 'conjunction' : 'opposition' };
    }
    prev = cur;
  }
  return null;
}

/** 时间倍率档（秒/现实秒） */
export const TIME_RATES = [
  { value: 1, label: '1×', hint: '真实实时' },
  { value: 60, label: '60×', hint: '1分钟/秒' },
  { value: 3600, label: '1h/s', hint: '1小时/秒' },
  { value: 86400, label: '1d/s', hint: '1天/秒' },
  { value: 864000, label: '10d/s', hint: '10天/秒' },
] as const;
export type TimeRateValue = (typeof TIME_RATES)[number]['value'];
export const DEFAULT_RATE: TimeRateValue = 3600;

/** 日期跳转合法区间 */
export const MIN_DATE_MS = Date.UTC(1900, 0, 1);
export const MAX_DATE_MS = Date.UTC(2100, 11, 31, 23, 59, 59);

/** 格式化 UTC 日期时间：2025-06-21 14:32 UTC */
export function formatUTC(ms: number, withSeconds = false): string {
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, '0');
  const base = `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}`;
  return withSeconds ? `${base}:${p(d.getUTCSeconds())} UTC` : `${base} UTC`;
}

export function formatDateOnly(ms: number): string {
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}`;
}
