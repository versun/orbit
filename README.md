# Orbit Clay · 太阳系

以黏土拟态（Claymorphism）风格呈现的**实时太阳系模拟网站**：基于 JPL 开普勒轨道根数实时计算八大行星位置，支持真实等比 / 演示比例双模式渲染，并配有写实的行星材质（地球云层、木星大红斑、土星环等）。

## 功能特性

- 🪐 **实时轨道模拟** — 开普勒轨道六要素 + 牛顿迭代求解开普勒方程，展示"此时此刻"的行星位置
- 🔍 **双比例模式** — 真实等比（太阳：地球直径比 ≈ 109:1）与演示比例自由切换
- 🎨 **写实行星材质** — 本地纹理资源渲染八大行星、月球与土星环
- 🕹️ **时间控制台** — 时间流速调节、行星信息卡片
- 📏 **尺度感知页面** — 行星尺寸对比、日地距离等可视化"剧场"（Acts）
- 🧱 **Claymorphism UI** — 柔和圆角、多层阴影、低饱和暖色

## 技术栈

| 类别 | 技术 |
| --- | --- |
| 框架 | React 19 + TypeScript + Vite 7 |
| 3D 渲染 | Three.js + @react-three/fiber + @react-three/drei |
| 动画 | GSAP / Framer Motion / Lenis |
| 样式 | Tailwind CSS v3 + shadcn/ui（40+ Radix 组件） |
| 路由 | React Router v7 |

## 本地运行

### 环境要求

- **Node.js ≥ 20**（推荐使用 LTS 版本）
- npm（随 Node.js 自带）

### 步骤

```bash
# 1. 克隆仓库
git clone <仓库地址>
cd orbit

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev
```

启动后访问 **http://localhost:3000** 即可预览（端口已在 `vite.config.ts` 中固定为 3000）。

### 其他命令

```bash
npm run build    # 类型检查 + 生产构建（输出到 dist/）
npm run preview  # 本地预览生产构建产物
npm run lint     # ESLint 代码检查
```

## 项目结构

```
orbit/
├── index.html              # 入口 HTML（含字体与 OG 元信息）
├── public/                 # 静态资源（行星纹理、logo、og 封面）
├── src/
│   ├── main.tsx            # 应用入口
│   ├── App.tsx             # 路由与全局布局
│   ├── pages/              # 页面：Home / Planets / PlanetDetail / Scale / About
│   ├── components/
│   │   ├── SolarSystem.tsx # 太阳系 3D 主场景
│   │   ├── PlanetSphere.tsx
│   │   ├── home/           # 首页区块（时间控制台、行星信息面板）
│   │   ├── scale/          # 尺度对比"剧场"组件
│   │   ├── catalog/        # 行星图鉴组件
│   │   └── ui/             # shadcn/ui 组件库
│   ├── lib/
│   │   ├── ephemeris.ts    # 星历计算（开普勒方程求解）
│   │   ├── planets.ts      # 行星数据（轨道根数、物理参数）
│   │   ├── simulation.ts   # 模拟时间/状态管理
│   │   └── three-utils.ts  # Three.js 工具函数
│   └── hooks/              # 自定义 Hooks
├── vite.config.ts          # Vite 配置（端口 3000、@ 别名）
├── tailwind.config.js      # Tailwind 主题配置
└── components.json         # shadcn/ui 配置
```

## 常见问题

**Q: 端口 3000 被占用？**
修改 `vite.config.ts` 中的 `server.port`，或启动时指定：`npm run dev -- --port 5173`。

**Q: 页面空白 / 3D 场景不渲染？**
请使用支持 WebGL2 的现代浏览器（Chrome / Edge / Firefox / Safari 最新版）。

**Q: 部署到静态托管？**
执行 `npm run build` 后将 `dist/` 目录部署即可。注意 `vite.config.ts` 中 `base: './'` 使用相对路径，可直接部署到任意子目录。
