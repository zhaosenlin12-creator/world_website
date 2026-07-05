import type { PlanetId } from "./missionData";

type PlanetAsset = {
  texture: string;
  distance: number;
  initialAngle: number;
  ringTexture?: string;
};

export const planetAssetCatalog: Record<PlanetId | "sun", PlanetAsset> = {
  sun: {
    texture: "/assets/textures/sun.jpg",
    distance: 0,
    initialAngle: 0,
  },
  mercury: {
    texture: "/assets/textures/mercury.jpg",
    distance: 7,
    initialAngle: 0.45,
  },
  venus: {
    texture: "/assets/textures/venus.jpg",
    distance: 10.6,
    initialAngle: 1.25,
  },
  earth: {
    texture: "/assets/textures/earth.jpg",
    distance: 14.4,
    initialAngle: 2.05,
  },
  mars: {
    texture: "/assets/textures/mars.jpg",
    distance: 18.8,
    initialAngle: 2.78,
  },
  jupiter: {
    texture: "/assets/textures/jupiter.jpg",
    distance: 24.8,
    initialAngle: 3.62,
  },
  saturn: {
    texture: "/assets/textures/saturn.jpg",
    distance: 31.4,
    initialAngle: 4.4,
    ringTexture: "/assets/textures/saturn_ring.jpg",
  },
  uranus: {
    texture: "/assets/textures/uranus.jpg",
    distance: 37.8,
    initialAngle: 5.12,
  },
  neptune: {
    texture: "/assets/textures/neptune.webp",
    distance: 44.2,
    initialAngle: 5.86,
  },
};

export const shipAssetCatalog = {
  cruiseModel: "/assets/models/nasa/voyager-probe-b.glb",
  hazardModel: "/assets/models/nasa/rq36-asteroid.glb",
  hullBaseColor: "#e2e8f0",
  hullAccentColor: "#38bdf8",
  hullShadowColor: "#334155",
  cockpitGlow: "#93c5fd",
  engineGlow: "#22d3ee",
};

export const missionSubtitleCatalog = {
  targetLocked: "目标锁定，任务简报已展开。",
  approach: "进入接近窗口，准备修正姿态。",
  entry: "切入目标轨道，注意引力与障碍变化。",
  atmosphere: "即将穿越大气层，控制热防护与减速节奏。",
  landingTransition: "进入残骸缓降通道，准备着陆程序。",
  fragileWarning: "前方脆弱平台即将崩裂，立即转移。",
  hazardWarning: "检测到危险干扰，注意避让。",
  respawn: "已回收到最近安全点，重新规划路线。",
  sample: "已回收关键样本，任务进度提升。",
  touchdown: "着陆确认完成，准备展开地表探索。",
};
