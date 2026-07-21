/**
 * catalog-data.ts — 行星图鉴 / 行星档案页共用的天体档案数据
 *
 * 以 lib/planets.ts 的 PLANETS / SUN 为骨架，补充两页所需的展示数据：
 * 分类、质量、温度、卫星、重力、材质解读、热点、冷知识等。
 * 卡片数值文案严格采用 design/planets.md §S3 数据表。
 */

import type { PlanetSlug } from '@/lib/ephemeris';
import { PLANET_MAP, SUN } from '@/lib/planets';

export type BodySlug = PlanetSlug | 'sun';

export type CategoryKey = 'star' | 'terrestrial' | 'giant' | 'ice';

export interface MaterialSection {
  title: string;
  body: string;
}

export interface Hotspot {
  /** 在等距圆柱纹理上的位置（百分比） */
  x: number;
  y: number;
  title: string;
  text: string;
}

export interface FunFact {
  title: string;
  text: string;
}

export interface BodyProfile {
  slug: BodySlug;
  isStar: boolean;
  /** 0 = 太阳，1..8 按距日序 */
  order: number;
  nameZh: string;
  nameEn: string;
  color: string;
  texture: string;
  categoryKey: CategoryKey;
  categoryZh: string;
  radiusEarth: number;
  diameterKm: number;
  /** 半长轴 AU（太阳为 0） */
  aAU: number;
  /** 公转周期（天，太阳为 null） */
  periodDays: number | null;
  /** 自转周期（小时，负值 = 逆行） */
  rotationHours: number;
  axialTiltDeg: number;
  roughness: number;
  metalness: number;
  /* ---- 卡片展示文案（planets.md §S3 数据表） ---- */
  distanceLabel: string;
  periodLabel: string;
  rotationLabel: string;
  materialLine: string;
  /* ---- 详情页 ---- */
  definition: string;
  /** 3 个关键徽章：分类 / 宜居带 / 光环 */
  badges: [string, string, string];
  massLabel: string;
  /** 质量 kg（用于排序与比例条） */
  massKg: number;
  tempLabel: string;
  tempC: number;
  moonsLabel: string;
  moonsCount: number;
  gravityG: number;
  materialSections: MaterialSection[];
  hotspots: Hotspot[];
  funFacts: FunFact[];
}

/* 行星物理参数补充（NASA Planetary Fact Sheet 近似值） */
const EXTRA: Record<BodySlug, {
  massLabel: string; massKg: number; tempLabel: string; tempC: number;
  moonsLabel: string; moonsCount: number; gravityG: number;
}> = {
  sun:     { massLabel: '1.989×10³⁰', massKg: 1.989e30, tempLabel: '5,505', tempC: 5505, moonsLabel: '8 颗行星', moonsCount: 8, gravityG: 27.9 },
  mercury: { massLabel: '3.30×10²³', massKg: 3.30e23, tempLabel: '167', tempC: 167, moonsLabel: '0', moonsCount: 0, gravityG: 0.38 },
  venus:   { massLabel: '4.87×10²⁴', massKg: 4.87e24, tempLabel: '465', tempC: 465, moonsLabel: '0', moonsCount: 0, gravityG: 0.90 },
  earth:   { massLabel: '5.97×10²⁴', massKg: 5.97e24, tempLabel: '15', tempC: 15, moonsLabel: '1', moonsCount: 1, gravityG: 1.0 },
  mars:    { massLabel: '6.42×10²³', massKg: 6.42e23, tempLabel: '-63', tempC: -63, moonsLabel: '2', moonsCount: 2, gravityG: 0.38 },
  jupiter: { massLabel: '1.90×10²⁷', massKg: 1.90e27, tempLabel: '-108', tempC: -108, moonsLabel: '95', moonsCount: 95, gravityG: 2.53 },
  saturn:  { massLabel: '5.68×10²⁶', massKg: 5.68e26, tempLabel: '-139', tempC: -139, moonsLabel: '274', moonsCount: 274, gravityG: 1.07 },
  uranus:  { massLabel: '8.68×10²⁵', massKg: 8.68e25, tempLabel: '-197', tempC: -197, moonsLabel: '28', moonsCount: 28, gravityG: 0.89 },
  neptune: { massLabel: '1.02×10²⁶', massKg: 1.02e26, tempLabel: '-201', tempC: -201, moonsLabel: '16', moonsCount: 16, gravityG: 1.14 },
};

const p = PLANET_MAP;

/** 全部 9 个天体档案（太阳在最前） */
export const BODIES: BodyProfile[] = [
  {
    slug: 'sun', isStar: true, order: 0,
    nameZh: SUN.nameZh, nameEn: SUN.nameEn, color: SUN.color, texture: SUN.texture,
    categoryKey: 'star', categoryZh: '恒星',
    radiusEarth: SUN.radiusEarth, diameterKm: 1392700, aAU: 0,
    periodDays: null, rotationHours: 25.05 * 24, axialTiltDeg: 7.25,
    roughness: 1, metalness: 0,
    distanceLabel: '0 AU', periodLabel: '—', rotationLabel: '25.05 天',
    materialLine: '沸腾的金色米粒组织，太阳系 99.86% 的质量',
    definition: '太阳系的中心恒星——一颗占整个系统 99.86% 质量的等离子体火球。',
    badges: ['恒星', '能量之源', '太阳系中心'],
    ...EXTRA.sun,
    materialSections: [
      { title: '米粒组织', body: '太阳表面布满沸腾的等离子体米粒——每个颗粒约 1,000 公里宽，是热对流从内部带上的能量，寿命只有约 8 分钟，生生不息地翻滚。' },
      { title: '色球与日冕', body: '光球之上是玫瑰色的色球层与延伸数百万公里的日冕。日冕温度高达百万度，比表面还热数百倍，至今仍是太阳物理最大的谜题之一。' },
      { title: '黑子与耀斑', body: '磁场打结处温度略低，看起来发暗，这就是黑子；磁能突然释放则形成耀斑与日冕物质抛射，抵达地球时扰动电网，也点亮两极极光。' },
    ],
    hotspots: [
      { x: 38, y: 46, title: '米粒组织', text: '每个米粒约 1,000 km · 寿命约 8 分钟' },
      { x: 66, y: 58, title: '黑子区域', text: '温度约 3,500℃ · 比周围暗所以显黑' },
    ],
    funFacts: [
      { title: '99.86% 的质量', text: '太阳系全部行星、卫星、小行星加起来，也只占总质量的 0.14%。' },
      { title: '核心 1,500 万℃', text: '在核心，每秒有 6 亿吨氢聚变成氦，400 万吨质量直接化为能量。' },
      { title: '8 分 20 秒的旅程', text: '此刻照在你身上的阳光，8 分 20 秒前才刚从太阳表面出发。' },
    ],
  },
  {
    slug: 'mercury', isStar: false, order: 1,
    nameZh: p.mercury.nameZh, nameEn: p.mercury.nameEn, color: p.mercury.color, texture: p.mercury.texture,
    categoryKey: 'terrestrial', categoryZh: '类地行星',
    radiusEarth: p.mercury.radiusEarth, diameterKm: p.mercury.diameterKm, aAU: p.mercury.aAU,
    periodDays: p.mercury.periodDays, rotationHours: p.mercury.rotationHours, axialTiltDeg: p.mercury.axialTiltDeg,
    roughness: p.mercury.roughness, metalness: p.mercury.metalness,
    distanceLabel: '0.387 AU', periodLabel: '88 天', rotationLabel: '58.6 天',
    materialLine: '陨坑密布的灰褐风化壳，最像月球的行星',
    definition: '离太阳最近的行星——一颗陨坑密布、温差极端的铁核小世界。',
    badges: ['类地行星', '非宜居带', '无光环'],
    ...EXTRA.mercury,
    materialSections: [
      { title: '陨石坑风化壳', body: '没有大气与板块活动，40 亿年来的每一次撞击都被完整保留：卡路里盆地直径约 1,550 公里，是太阳系最大的撞击遗迹之一。' },
      { title: '昼夜温差 600℃', body: '白天赤道被烤到 430℃，夜晚又骤降至 -180℃——没有大气保温，水星表面经历着太阳系最剧烈的温度循环。' },
      { title: '会进动的轨道', body: '水星近日点每世纪多进动 43 角秒，牛顿力学无法解释。1915 年，爱因斯坦用广义相对论完美预言了它，成为新理论的首个证据。' },
    ],
    hotspots: [
      { x: 30, y: 42, title: '卡路里盆地', text: '直径约 1,550 km · 太阳系最大撞击坑之一' },
      { x: 64, y: 60, title: '辐射纹', text: '年轻撞击坑的溅射物 · 比月球的更偏棕' },
    ],
    funFacts: [
      { title: '一天比一年长', text: '水星上的一个昼夜（176 个地球日）是它一年（88 天）的两倍长。' },
      { title: '会缩水的行星', text: '铁核冷却收缩，水星表面布满数百公里长的皱脊，迄今已缩小约 7 公里。' },
      { title: '极地有冰', text: '尽管离太阳最近，极地永久阴影的陨石坑里竟封存着水冰。' },
    ],
  },
  {
    slug: 'venus', isStar: false, order: 2,
    nameZh: p.venus.nameZh, nameEn: p.venus.nameEn, color: p.venus.color, texture: p.venus.texture,
    categoryKey: 'terrestrial', categoryZh: '类地行星',
    radiusEarth: p.venus.radiusEarth, diameterKm: p.venus.diameterKm, aAU: p.venus.aAU,
    periodDays: p.venus.periodDays, rotationHours: p.venus.rotationHours, axialTiltDeg: p.venus.axialTiltDeg,
    roughness: p.venus.roughness, metalness: p.venus.metalness,
    distanceLabel: '0.723 AU', periodLabel: '225 天', rotationLabel: '243 天(逆行)',
    materialLine: '浓硫酸云下的奶油涡旋，温室失控的世界',
    definition: '天空中最亮的行星——被浓硫酸云与失控温室包裹的炙热炼狱。',
    badges: ['类地行星', '宜居带内缘', '无光环'],
    ...EXTRA.venus,
    materialSections: [
      { title: '硫酸云', body: '我们看到的奶油黄褐色并非地表，而是约 65 公里高空浓硫酸云层的顶部。云滴由二氧化硫与水汽化合而成，反射了约 75% 的阳光。' },
      { title: '失控温室 465℃', body: '96% 的二氧化碳大气把热量锁得严严实实，表面恒定在 465℃——比水星还热，足以熔化铅，昼夜与极地几乎没有温差。' },
      { title: '逆向慢转', body: '金星自转一圈要 243 个地球日，比它 225 天的一年还长，而且方向相反——在金星上，太阳从西边升起，一天比一年更漫长。' },
    ],
    hotspots: [
      { x: 42, y: 38, title: 'Y 形云纹', text: '硫酸云 4 天绕行星一圈 · 超级旋转大气' },
      { x: 60, y: 62, title: '云顶涡旋', text: '高空风速 360 km/h · 地表却只有微风' },
    ],
    funFacts: [
      { title: '一天比一年长', text: '金星自转一圈 243 天，公转一圈只要 225 天——一天比一年还长。' },
      { title: '92 倍大气压', text: '站在金星表面，相当于潜入地球海洋 900 米深处。' },
      { title: '启明与长庚', text: '它是全天最亮的行星，古人把清晨与黄昏出现的它当作两颗星。' },
    ],
  },
  {
    slug: 'earth', isStar: false, order: 3,
    nameZh: p.earth.nameZh, nameEn: p.earth.nameEn, color: p.earth.color, texture: p.earth.texture,
    categoryKey: 'terrestrial', categoryZh: '类地行星',
    radiusEarth: p.earth.radiusEarth, diameterKm: p.earth.diameterKm, aAU: p.earth.aAU,
    periodDays: p.earth.periodDays, rotationHours: p.earth.rotationHours, axialTiltDeg: p.earth.axialTiltDeg,
    roughness: p.earth.roughness, metalness: p.earth.metalness,
    distanceLabel: '1.000 AU', periodLabel: '365.25 天', rotationLabel: '23.9 小时',
    materialLine: '蓝色大理石：海洋、大陆与流转的白云',
    definition: '目前已知唯一存在生命的行星——悬浮在黑暗中的蓝色大理石。',
    badges: ['类地行星', '宜居带', '无光环'],
    ...EXTRA.earth,
    materialSections: [
      { title: '蓝色大理石', body: '71% 的表面被液态海洋覆盖，从太空看是一颗蔚蓝的玻璃弹珠。水吸收红光、散射蓝紫光，染出了这颗行星标志性的颜色。' },
      { title: '板块与液态水', body: '地球是唯一有活跃板块构造的行星：大陆漂移、造山、火山循环不断更新表面，也让碳循环稳定了气候，保住了液态水 40 亿年。' },
      { title: '月球与潮汐锁定', body: '月球引力掀起潮汐，也把地球自转从 6 小时拖慢到 24 小时；作为回报，月球被潮汐锁定，永远以同一面朝向地球。' },
    ],
    hotspots: [
      { x: 45, y: 35, title: '云层系统', text: '独立云层壳 · 覆盖约 67% 的天空' },
      { x: 62, y: 90, title: '极地冰盖', text: '反射 80% 阳光 · 地球的白色遮阳伞' },
    ],
    funFacts: [
      { title: '唯一有生命的行星', text: '在已确认的 6,000 多颗系外行星中，地球仍是唯一存在生命的地方。' },
      { title: '月球正在远去', text: '激光测距显示，月球正以每年 3.8 厘米的速度离开地球。' },
      { title: '并非正球体', text: '自转让赤道微微鼓起——赤道直径比两极多出约 43 公里。' },
    ],
  },
  {
    slug: 'mars', isStar: false, order: 4,
    nameZh: p.mars.nameZh, nameEn: p.mars.nameEn, color: p.mars.color, texture: p.mars.texture,
    categoryKey: 'terrestrial', categoryZh: '类地行星',
    radiusEarth: p.mars.radiusEarth, diameterKm: p.mars.diameterKm, aAU: p.mars.aAU,
    periodDays: p.mars.periodDays, rotationHours: p.mars.rotationHours, axialTiltDeg: p.mars.axialTiltDeg,
    roughness: p.mars.roughness, metalness: p.mars.metalness,
    distanceLabel: '1.524 AU', periodLabel: '687 天', rotationLabel: '24.6 小时',
    materialLine: '氧化铁红沙与干涸河床，极冠依旧',
    definition: '红色的沙漠行星——拥有太阳系最高火山的干涸世界。',
    badges: ['类地行星', '宜居带外缘', '无光环'],
    ...EXTRA.mars,
    materialSections: [
      { title: '氧化铁红', body: '火星表面覆盖着富含氧化铁的尘埃——就是铁锈。数米厚的红色风化层在阳光下呈现出铁橙色调，连天空都被沙尘染成奶油粉。' },
      { title: '奥林帕斯山', body: '太阳系最高的火山：高 21.9 公里，是珠穆朗玛峰的 2.5 倍，底部宽 600 公里。它如此平缓，站在山坡上甚至看不见山脚。' },
      { title: '干涸河床与极冠', body: '蜿蜒的峡谷与三角洲证明火星曾河流纵横。如今水大多锁在两级冰盖里——干冰与水冰混合的极冠随季节消长。' },
    ],
    hotspots: [
      { x: 30, y: 40, title: '奥林帕斯山', text: '高 21.9 km · 珠穆朗玛峰的 2.5 倍' },
      { x: 58, y: 88, title: '极冠', text: '干冰 + 水冰 · 随季节生长与退缩' },
    ],
    funFacts: [
      { title: '蓝色日落', text: '火星尘埃散射红光、透过蓝光——在火星上看日落，太阳周围是蓝色的。' },
      { title: '两颗土豆卫星', text: '火卫一与火卫二形状像土豆，直径只有 22 和 12 公里。' },
      { title: '一年 687 天', text: '火星年约等于 1.88 个地球年，每个季节的长度几乎是地球的两倍。' },
    ],
  },
  {
    slug: 'jupiter', isStar: false, order: 5,
    nameZh: p.jupiter.nameZh, nameEn: p.jupiter.nameEn, color: p.jupiter.color, texture: p.jupiter.texture,
    categoryKey: 'giant', categoryZh: '巨行星',
    radiusEarth: p.jupiter.radiusEarth, diameterKm: p.jupiter.diameterKm, aAU: p.jupiter.aAU,
    periodDays: p.jupiter.periodDays, rotationHours: p.jupiter.rotationHours, axialTiltDeg: p.jupiter.axialTiltDeg,
    roughness: p.jupiter.roughness, metalness: p.jupiter.metalness,
    distanceLabel: '5.203 AU', periodLabel: '11.9 年', rotationLabel: '9.9 小时',
    materialLine: '奶油赭石云带间，大红斑刮了数百年',
    definition: '太阳系最大的行星——一颗足以装下 1300 个地球的气态巨人。',
    badges: ['巨行星', '非宜居带', '微弱环系'],
    ...EXTRA.jupiter,
    materialSections: [
      { title: '纬向云带', body: '木星高速自转（不足 10 小时）把氨与硫化氢氨云层拉扯成环绕整颗行星的明暗带纹：亮带是上升气流，暗带是下沉气流。' },
      { title: '大红斑', body: '一场持续数百年的反气旋风暴，东西宽约 1.6 万公里，足以吞下整个地球。' },
      { title: '色彩来源', body: '磷化氢、硫与有机化合物在不同高度被阳光分解，染出奶油、赭石与棕红的层次。' },
    ],
    hotspots: [
      { x: 55, y: 63, title: '大红斑', text: '风速约 400 km/h · 宽约 1.6 万 km' },
      { x: 26, y: 44, title: '纬向云带', text: '亮带上升气流 · 暗带下沉气流' },
    ],
    funFacts: [
      { title: '转得最快的行星', text: '木星的一天不足 10 小时，是太阳系自转最快的行星。' },
      { title: '正在缩小的大红斑', text: '一个世纪前大红斑还能装下 4 个地球，如今只装得下 1 个多。' },
      { title: '95 颗卫星', text: '伽利略卫星中的木卫二冰壳之下，藏着比地球更深的液态海洋。' },
    ],
  },
  {
    slug: 'saturn', isStar: false, order: 6,
    nameZh: p.saturn.nameZh, nameEn: p.saturn.nameEn, color: p.saturn.color, texture: p.saturn.texture,
    categoryKey: 'giant', categoryZh: '巨行星',
    radiusEarth: p.saturn.radiusEarth, diameterKm: p.saturn.diameterKm, aAU: p.saturn.aAU,
    periodDays: p.saturn.periodDays, rotationHours: p.saturn.rotationHours, axialTiltDeg: p.saturn.axialTiltDeg,
    roughness: p.saturn.roughness, metalness: p.saturn.metalness,
    distanceLabel: '9.537 AU', periodLabel: '29.4 年', rotationLabel: '10.7 小时',
    materialLine: '淡金云带与一圈冰晶光环，优雅的巨人',
    definition: '戴着冰晶光环的优雅巨人——轻到能浮在水面上的行星。',
    badges: ['巨行星', '非宜居带', '壮观光环'],
    ...EXTRA.saturn,
    materialSections: [
      { title: '冰晶光环', body: '光环由 99% 纯水冰粒与少量岩屑组成，从微米到房屋大小不等，宽达 28 万公里，平均厚度却只有约 10 米——薄得像一张纸。' },
      { title: '能浮于水的巨人', body: '土星平均密度只有 0.687 g/cm³，比水还轻。如果有一片足够大的海洋，这颗气态巨行星会像软木塞一样浮起来。' },
      { title: '六边形北极风暴', body: '土星北极盘踞着一个宽 3 万公里的完美六边形涡旋，每边长过地球直径。它在 30 多年里保持形状不变，成因至今成谜。' },
    ],
    hotspots: [
      { x: 40, y: 46, title: '细腻云带', text: '对比柔和 · 高空风速可达 1,800 km/h' },
      { x: 63, y: 14, title: '北极六边形', text: '宽 3 万 km · 能装下 2 个地球' },
    ],
    funFacts: [
      { title: '密度比水低', text: '土星是唯一密度小于水的行星——有一片足够大的海它就能浮起来。' },
      { title: '纸一样薄的环', text: '环宽 28 万公里，平均厚度却只有约 10 米。' },
      { title: '274 颗卫星', text: '已确认卫星数太阳系第一，土卫六还有甲烷湖泊与橙色浓雾。' },
    ],
  },
  {
    slug: 'uranus', isStar: false, order: 7,
    nameZh: p.uranus.nameZh, nameEn: p.uranus.nameEn, color: p.uranus.color, texture: p.uranus.texture,
    categoryKey: 'ice', categoryZh: '冰巨星',
    radiusEarth: p.uranus.radiusEarth, diameterKm: p.uranus.diameterKm, aAU: p.uranus.aAU,
    periodDays: p.uranus.periodDays, rotationHours: p.uranus.rotationHours, axialTiltDeg: p.uranus.axialTiltDeg,
    roughness: p.uranus.roughness, metalness: p.uranus.metalness,
    distanceLabel: '19.19 AU', periodLabel: '84 年', rotationLabel: '17.2 小时(逆行)',
    materialLine: '青绿色甲烷冰球，躺着自转的行星',
    definition: '躺着自转的青绿色冰巨星——太阳系最寒冷的行星。',
    badges: ['冰巨星', '非宜居带', '微弱环系'],
    ...EXTRA.uranus,
    materialSections: [
      { title: '甲烷青绿', body: '高层大气中的甲烷吸收阳光中的红光，反射蓝绿光，给天王星染上一层均匀的青绿。云层之下是水、氨与甲烷组成的高温冰幔。' },
      { title: '97.8° 躺转', body: '一次远古大撞击把天王星撞倒：自转轴几乎躺进轨道面，像颗侧滚的球。两极轮流正对太阳，每个极区有 42 年极昼与 42 年极夜。' },
      { title: '极寒 -224℃', body: '天王星几乎不向太空释放内热，大气温度低至 -224℃，是太阳系最冷的行星——比更远的海王星还要冷。' },
    ],
    hotspots: [
      { x: 44, y: 42, title: '甲烷大气', text: '甲烷吸收红光 → 均匀青绿色调' },
      { x: 60, y: 18, title: '躺转的极区', text: '轴倾角 97.8° · 极昼极夜各 42 年' },
    ],
    funFacts: [
      { title: '躺着滚的行星', text: '97.8° 的轴倾角让天王星像皮球一样侧躺着绕太阳滚动。' },
      { title: '最冷行星', text: '最低温 -224℃，比海王星还冷——它几乎没有内部热源。' },
      { title: '望远镜时代的首星', text: '1781 年赫歇尔用望远镜发现它，是人类史上第一颗被「发现」的行星。' },
    ],
  },
  {
    slug: 'neptune', isStar: false, order: 8,
    nameZh: p.neptune.nameZh, nameEn: p.neptune.nameEn, color: p.neptune.color, texture: p.neptune.texture,
    categoryKey: 'ice', categoryZh: '冰巨星',
    radiusEarth: p.neptune.radiusEarth, diameterKm: p.neptune.diameterKm, aAU: p.neptune.aAU,
    periodDays: p.neptune.periodDays, rotationHours: p.neptune.rotationHours, axialTiltDeg: p.neptune.axialTiltDeg,
    roughness: p.neptune.roughness, metalness: p.neptune.metalness,
    distanceLabel: '30.07 AU', periodLabel: '164.8 年', rotationLabel: '16.1 小时',
    materialLine: '深宝蓝大气中的暗风暴与超音速风',
    definition: '最遥远的行星——刮着太阳系最快风暴的深蓝色世界。',
    badges: ['冰巨星', '非宜居带', '微弱环系'],
    ...EXTRA.neptune,
    materialSections: [
      { title: '深蓝天风', body: '与天王星相似的甲烷大气，却呈现出更深的宝蓝色——某种未知成分加深了它。高层漂浮的甲烷冰晶卷云，在阳光下投下细长阴影。' },
      { title: '超音速风暴', body: '海王星上的风速可达 2,100 km/h，超过音速，是太阳系最快的风。1989 年旅行者 2 号拍到的大暗斑，大小足以吞下整个地球。' },
      { title: '数学预测的行星', body: '它是唯一先被算出来、再被看到的行星：1846 年，勒维耶根据天王星轨道的异常算出其位置，望远镜当晚就对准了它。' },
    ],
    hotspots: [
      { x: 48, y: 52, title: '暗风暴斑', text: '大暗斑 · 足以吞下整个地球' },
      { x: 66, y: 34, title: '白色卷云', text: '风速 2,100 km/h · 太阳系最快的风' },
    ],
    funFacts: [
      { title: '最快的风', text: '2,100 km/h 的超音速风暴，让海王星成为太阳系风之王者。' },
      { title: '笔尖上的发现', text: '先用数学预测位置、再用望远镜找到的行星，只此一颗。' },
      { title: '一年 164.8 地球年', text: '自 1846 年被发现至今，海王星才刚绕太阳转完一圈多。' },
    ],
  },
];

export const BODY_MAP: Record<BodySlug, BodyProfile> = Object.fromEntries(
  BODIES.map((b) => [b.slug, b]),
) as Record<BodySlug, BodyProfile>;

export function isBodySlug(slug: string | undefined): slug is BodySlug {
  return !!slug && slug in BODY_MAP;
}

/** 分类筛选分组 */
export const CATEGORY_FILTERS: { key: CategoryKey | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'terrestrial', label: '类地行星' },
  { key: 'giant', label: '巨行星' },
  { key: 'ice', label: '冰巨星' },
  { key: 'star', label: '恒星' },
];

export type SortKey = 'default' | 'diameter' | 'mass' | 'rotation';

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'default', label: '距日远近' },
  { key: 'diameter', label: '直径' },
  { key: 'mass', label: '质量' },
  { key: 'rotation', label: '自转周期' },
];

export function sortBodies(bodies: BodyProfile[], sort: SortKey): BodyProfile[] {
  const arr = [...bodies];
  switch (sort) {
    case 'diameter':
      return arr.sort((a, b) => b.diameterKm - a.diameterKm);
    case 'mass':
      return arr.sort((a, b) => b.massKg - a.massKg);
    case 'rotation':
      return arr.sort((a, b) => Math.abs(b.rotationHours) - Math.abs(a.rotationHours));
    default:
      return arr.sort((a, b) => a.order - b.order);
  }
}
