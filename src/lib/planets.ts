/**
 * planets.ts — 行星元数据、比例系统与场景映射（全站复用）
 *
 * 比例诚实原则：
 *  - 行星半径严格按真实比值（地球 = 1）保存于 PlanetMeta.radiusEarth；
 *  - 场景渲染提供「真实等比 real / 可视增强 enhanced」双模式；
 *  - 距离默认对数压缩（compressed），可切换真实线性（linear）；
 *  - 太阳默认不按 109.2 倍等比渲染（见 SCENE.SUN_VISUAL_R）。
 */

import type { PlanetSlug } from './ephemeris';

export type ScaleMode = 'real' | 'enhanced';
export type DistanceMode = 'compressed' | 'linear';

export interface PlanetMeta {
  slug: PlanetSlug;
  /** 距日次序 1..8 */
  order: number;
  nameZh: string;
  nameEn: string;
  /** 行星主题色（卡片/轨道线/徽章） */
  color: string;
  /** 真实半径比（地球 = 1） */
  radiusEarth: number;
  /** 真实赤道半径 km */
  radiusKm: number;
  /** 半长轴 AU */
  aAU: number;
  /** 公转周期（天） */
  periodDays: number;
  /** 自转周期（小时，负值 = 逆向自转） */
  rotationHours: number;
  /** 自转轴倾角 deg */
  axialTiltDeg: number;
  /** 表面纹理（public 路径） */
  texture: string;
  roughness: number;
  metalness: number;
  /** 类型标签（图鉴徽章） */
  typeZh: string;
  /** 材质说明（实际情况） */
  materialNote: string;
  /** 一句话简介 */
  blurb: string;
  /** 直径 km */
  diameterKm: number;
}

export const PLANETS: PlanetMeta[] = [
  {
    slug: 'mercury', order: 1, nameZh: '水星', nameEn: 'MERCURY', color: '#B8A99A',
    radiusEarth: 0.383, radiusKm: 2439.7, aAU: 0.387, periodDays: 87.97,
    rotationHours: 1407.6, axialTiltDeg: 0.034, texture: '/tex-mercury.jpg',
    roughness: 1.0, metalness: 0.0, typeZh: '类地行星',
    materialNote: '陨击坑密布的灰褐色风化壳，无大气，昼夜温差超过 600°C。',
    blurb: '离太阳最近、公转最快的行星。', diameterKm: 4879,
  },
  {
    slug: 'venus', order: 2, nameZh: '金星', nameEn: 'VENUS', color: '#E8C07D',
    radiusEarth: 0.949, radiusKm: 6051.8, aAU: 0.723, periodDays: 224.7,
    rotationHours: -5832.5, axialTiltDeg: 177.4, texture: '/tex-venus.jpg',
    roughness: 0.6, metalness: 0.0, typeZh: '类地行星',
    materialNote: '浓硫酸云层覆盖的奶油黄褐色天空，温室效应使表面高达 465°C。',
    blurb: '全天最亮的行星，自转最慢且逆向。', diameterKm: 12104,
  },
  {
    slug: 'earth', order: 3, nameZh: '地球', nameEn: 'EARTH', color: '#6FB7FF',
    radiusEarth: 1.0, radiusKm: 6371.0, aAU: 1.0, periodDays: 365.25,
    rotationHours: 23.93, axialTiltDeg: 23.44, texture: '/tex-earth.jpg',
    roughness: 0.55, metalness: 0.1, typeZh: '类地行星 · 我们的家',
    materialNote: '蓝色海洋、绿褐大陆与白色极冠，独立云层壳缓慢自转。',
    blurb: '目前已知唯一存在生命的行星。', diameterKm: 12742,
  },
  {
    slug: 'mars', order: 4, nameZh: '火星', nameEn: 'MARS', color: '#E07A5F',
    radiusEarth: 0.532, radiusKm: 3389.5, aAU: 1.524, periodDays: 686.98,
    rotationHours: 24.62, axialTiltDeg: 25.19, texture: '/tex-mars.jpg',
    roughness: 0.9, metalness: 0.0, typeZh: '类地行星',
    materialNote: '氧化铁红橙沙漠、暗色撞击盆地与白色极冠，水手谷纵贯赤道。',
    blurb: '红色星球，人类下一站。', diameterKm: 6779,
  },
  {
    slug: 'jupiter', order: 5, nameZh: '木星', nameEn: 'JUPITER', color: '#D9A066',
    radiusEarth: 11.21, radiusKm: 69911, aAU: 5.203, periodDays: 4332.59,
    rotationHours: 9.93, axialTiltDeg: 3.13, texture: '/tex-jupiter.jpg',
    roughness: 0.5, metalness: 0.0, typeZh: '巨行星',
    materialNote: '奶油-赭石-棕红交替纬向云带，大红斑是持续数百年的巨型风暴。',
    blurb: '太阳系行星之王，能装下 1300 个地球。', diameterKm: 139820,
  },
  {
    slug: 'saturn', order: 6, nameZh: '土星', nameEn: 'SATURN', color: '#E3CE9E',
    radiusEarth: 9.45, radiusKm: 58232, aAU: 9.537, periodDays: 10759.22,
    rotationHours: 10.66, axialTiltDeg: 26.73, texture: '/tex-saturn.jpg',
    roughness: 0.55, metalness: 0.0, typeZh: '巨行星',
    materialNote: '淡金米色细腻云带，标志性光环由冰粒与岩屑组成，宽达 28 万公里。',
    blurb: '戴着草帽的优雅巨人。', diameterKm: 116460,
  },
  {
    slug: 'uranus', order: 7, nameZh: '天王星', nameEn: 'URANUS', color: '#9FE3E0',
    radiusEarth: 4.01, radiusKm: 25362, aAU: 19.19, periodDays: 30688.5,
    rotationHours: -17.24, axialTiltDeg: 97.77, texture: '/tex-uranus.jpg',
    roughness: 0.4, metalness: 0.0, typeZh: '冰巨星',
    materialNote: '均匀青绿色甲烷大气，近乎无特征的柔和冰球，躺着自转（轴倾角 97.8°）。',
    blurb: '侧身滚着绕太阳转的冰球。', diameterKm: 50724,
  },
  {
    slug: 'neptune', order: 8, nameZh: '海王星', nameEn: 'NEPTUNE', color: '#6E8CFF',
    radiusEarth: 3.88, radiusKm: 24622, aAU: 30.07, periodDays: 60182,
    rotationHours: 16.11, axialTiltDeg: 28.32, texture: '/tex-neptune.jpg',
    roughness: 0.4, metalness: 0.0, typeZh: '冰巨星',
    materialNote: '深宝蓝色甲烷大气，暗色风暴斑与白色卷云，刮着太阳系最快的风。',
    blurb: '最遥远的行星，深蓝色的风之世界。', diameterKm: 49244,
  },
];

export const PLANET_MAP: Record<PlanetSlug, PlanetMeta> = Object.fromEntries(
  PLANETS.map((p) => [p.slug, p]),
) as Record<PlanetSlug, PlanetMeta>;

export interface SunMeta {
  nameZh: string; nameEn: string; color: string;
  radiusEarth: number; radiusKm: number; diameterKm: number;
  texture: string; blurb: string;
}
export const SUN: SunMeta = {
  nameZh: '太阳', nameEn: 'SUN', color: '#FFC65C',
  radiusEarth: 109.2, radiusKm: 695700, diameterKm: 1391400,
  texture: '/tex-sun.jpg',
  blurb: '占太阳系总质量 99.86% 的恒星。',
};

/** 场景常量 */
export const SCENE = {
  /** 真实等比模式下地球半径对应的场景单位 */
  EARTH_R: 0.5,
  /** 太阳观感半径（固定，不按 109.2 倍等比，UI 须标注「太阳未按等比」） */
  SUN_VISUAL_R: 2.1,
  /** 距离映射最远端（海王星）场景单位 */
  DIST_MAX: 62,
  /** 对数压缩指数（0.45：兼顾内外行星观感） */
  DIST_EXP: 0.45,
  NEPTUNE_AU: 30.07,
  /** 相机默认距离 */
  CAM_DIST: 62,
} as const;

/** 行星场景半径：真实等比 / 可视增强（指数压缩 + 下限保护） */
export function planetSceneRadius(radiusEarth: number, mode: ScaleMode): number {
  if (mode === 'real') return SCENE.EARTH_R * radiusEarth;
  // 可视增强：幂次压缩大小差距，小行星放大至可辨认
  return SCENE.EARTH_R * 2.0 * Math.pow(radiusEarth, 0.55);
}

/** 可视增强模式相对真实等比的放大倍数（用于 UI 诚实标注） */
export function enhanceFactor(radiusEarth: number): number {
  return (2.0 * Math.pow(radiusEarth, 0.55)) / radiusEarth;
}

/** 距离映射：AU → 场景单位。默认对数压缩以容纳海王星；linear 为真实等比 */
export function distanceScene(rAU: number, mode: DistanceMode = 'compressed'): number {
  if (mode === 'linear') return (rAU / SCENE.NEPTUNE_AU) * SCENE.DIST_MAX;
  return SCENE.DIST_MAX * Math.pow(rAU / SCENE.NEPTUNE_AU, SCENE.DIST_EXP);
}

/** 日心黄道坐标（AU）→ Three.js 场景坐标（Y 轴为黄道北） */
export function heliocentricToScene(
  x: number, y: number, z: number,
  distanceMode: DistanceMode = 'compressed',
): [number, number, number] {
  const r = Math.sqrt(x * x + y * y + z * z);
  if (r < 1e-9) return [0, 0, 0];
  const d = distanceScene(r, distanceMode);
  return [(x / r) * d, (z / r) * d, (-y / r) * d];
}

/** 真实自转角速度（弧度/模拟小时）：木星最快、金星最慢；金星与天王星为负值（逆向自转）。渲染层按模拟时钟速率换算为弧度/真实秒并做可视限幅 */
export function rotationRate(planet: PlanetMeta): number {
  return (2 * Math.PI) / planet.rotationHours;
}

/** 土星环贴图路径（径向条带，透明） */
export const SATURN_RING_TEXTURE = '/tex-saturn-rings.png';
/** 地球云层贴图路径（透明） */
export const EARTH_CLOUDS_TEXTURE = '/tex-earth-clouds.png';

/** 土星环相对行星半径的内/外半径比 */
export const SATURN_RING_RADII = { inner: 1.24, outer: 2.27 } as const;

export function formatAU(au: number, digits = 4): string {
  return au.toFixed(digits);
}

export function formatKm(n: number): string {
  return n.toLocaleString('en-US');
}

/** 行星类型徽章配色映射 */
export function planetBadgeKind(p: PlanetMeta): 'gas' | 'ice' | 'rock' {
  if (p.slug === 'jupiter' || p.slug === 'saturn') return 'gas';
  if (p.slug === 'uranus' || p.slug === 'neptune') return 'ice';
  return 'rock';
}
