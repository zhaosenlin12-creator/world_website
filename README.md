# 宇宙探索网站 / World Website

一个基于 `Next.js 14 + React 18 + Three.js + React Three Fiber` 的宇宙探索交互网站，包含：

- 首页 3D 太阳系与宇宙氛围动画
- 行星点击与沉浸式介绍
- `/play` 宇宙迷宫游戏入口
- 飞船接近、降落、地表采样等多阶段任务体验

## 环境要求

- `Node.js 18.18+` 或更高版本
- `npm 9+`

## 安装

```bash
npm install
```

## 本地开发

默认启动在 `3000` 端口：

```bash
npm run dev
```

如果 `3000` 端口被占用，可改用：

```bash
npx next dev -p 3001
```

## 生产构建

```bash
npm run build
npm run start
```

## 主要页面

- 首页：`http://localhost:3000/`
- 游戏页：`http://localhost:3000/play`
- 游戏调试入口：`http://localhost:3000/play?qa=1`

如果你本地改用了 `3001` 端口，把上面的 `3000` 替换成 `3001` 即可。

## 项目校验

已内置几条关键回归脚本，可在开发后手动执行：

```bash
npx tsx scripts/test-descent-flight.ts
npx tsx scripts/surface-runtime-check.ts
npx tsx scripts/surface-component-stability-check.ts
npx tsx scripts/surface-boost-check.ts
```

完整构建校验：

```bash
npm run build
```

## 技术说明

- `src/components/GameWorld.tsx`：主 3D 世界与飞行演出
- `src/components/GameClient.tsx`：游戏总流程与阶段切换
- `src/components/SurfaceMission.tsx`：地表采样与最终任务
- `src/lib/play/descentFlight.ts`：飞行接近与阶段推进逻辑
- `src/lib/play/surfaceMissionRuntime.ts`：地表任务运行时、敌对装置与冲刺参数

## 发布建议

上线前建议至少执行一次：

```bash
npm run build
```

如果需要部署到云平台，可直接按标准 `Next.js` 项目部署。
