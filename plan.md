# Plan: 太阳系实时行星轨迹可视化（Claymorphism 风格）

## 需求
- 太阳系八大行星实时运动轨迹展示（基于真实星历/开普勒轨道参数计算）
- 行星按实际等比尺寸显示（提供对数缩放选项以兼顾可视性）
- 每个星球材质按实际情况制作（地球云层、木星大红斑、土星环、金星硫酸云等）
- 视觉风格：Claymorphism（粘土拟物、柔和圆角、多层柔和阴影、低饱和暖色）

## Stage 1 — 技术设计（Orchestrator 直接设计）
- 技术选型：Three.js + WebGL，程序化生成行星纹理（canvas 生成，无需外部素材，保证版权合规）
- 轨道力学：开普勒轨道要素（半长轴 a、偏心率 e、倾角 i、升交点 Ω、近日点 ω、平近点角 M0），J2000 历元起算，实时求解开普勒方程（牛顿迭代）
- 行星尺寸比例：真实等比（太阳:地球直径比 ≈109:1），支持"真实比例/演示比例"切换
- UI：Claymorphism 控制面板（圆角卡片、内外阴影、柔和配色），时间流速控制、行星信息卡片

## Stage 2 — 构建（加载 vibecoding-webapp-swarm）
- 派发 coder 子代理实现：
  1. 星历计算模块（ephemeris.js）
  2. 程序化纹理生成（mercury/venus/earth/mars/jupiter/saturn/uranus/neptune + 土星环）
  3. Three.js 场景：轨道线、行星网格、光照、星空背景
  4. Claymorphism UI 面板：时间控制、缩放模式、行星信息
- 验证：构建通过 + 浏览器截图检查

## Stage 3 — 交付
- website_version_manager build_version，返回预览 URL
