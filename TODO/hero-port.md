# Hero / Discovery 内容迁移计划（来自 C:\Users\Administrator\Desktop\senlin）

参考站点：senlin/app 的 Hero / FeaturedVideo / Topics / About / Philosophy / Sources / Facts。
目标：在 world_website 主站合适位置引入更"炫酷高级"的动态模块，
同时适配静态导出（output: "export"）。

## Phase A — 公共组件
- [ ] 抽出 `LiquidGlassPanel` 组件（framer-motion + 玻璃质感 + pointer glow）
- [ ] 抽出 `FeaturedVideoPanel`（视频背景循环、淡入淡出、滚动揭示）
- [ ] 抽出 `AsciiTitle`（轻量 CSS 版，无 Three 依赖）
- [ ] 在 globals.css 增加 `liquid-glass` / `pointer-glow` 类

## Phase B — 接入主站
- [ ] `/`：Hero 之后增加 `<FeaturedVideoPanel>` 嵌入星云/银河 NASA 视频
- [ ] `/`：增加 `<TopicsGrid>` 主题卡（银河 / 黑洞 / 恒星 / 星系）
- [ ] `/explore`：在 Explorer 顶部加 `<FeaturedVideoPanel>` 作 banner
- [ ] `/facts`：用 `<LiquidGlassPanel>` 包裹 FactsView
- [ ] `/stories`：StoriesIndex 升级卡片的 hover 动效为 liquid-glass

## Phase C — 验证
- [ ] `npx tsc --noEmit` 通过
- [ ] 启动 dev server，`/`, `/explore`, `/stories`, `/facts` 均返回 200
- [ ] 检查页面在浏览器中渲染无错（PlayHud 顶部紧凑 HUD 不被遮）

## Phase D — NASA 3D Resources
- [ ] 在 `scripts/scrape_nasa_3d.py` 实现 Scrapling 爬取（fallback: requests）
- [ ] 输出 `data/nasa3d.json`
- [ ] `scripts/fetch_nasa_3d.py` 下载 GLB/缩略图
- [ ] 新增路由 `/spacecrafts`：模型库列表 + 详情页

## Phase E — 自由飞行宇宙
- [ ] 新增 `<SpacecraftFleet>` 组件：所有飞行器 + GLB 模型漂浮
- [ ] 在 `Hero3DScene` / `SolarSystem3D` 中加"切换"按钮 → 切换到自由宇宙视图

## Phase F — 游戏打磨
- [ ] 通读 GameClient.tsx / descentFlight.ts / surfaceMissionRuntime.ts
- [ ] 列出碰撞/UI 问题清单
- [ ] 修复碰撞检测、AABB/圆-矩分离
- [ ] 统一 HUD 风格、修复按钮 hover、状态条同步

## Phase G — 最终验证
- [ ] `npm run build` 通过（静态导出）
- [ ] 所有页面 `200`
- [ ] 报告
