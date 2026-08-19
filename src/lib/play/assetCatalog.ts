import type { PlanetId } from "./missionData";
import { publicUrl } from "@/lib/assetPath";

type PlanetAsset = {
  texture: string;
  distance: number;
  initialAngle: number;
  ringTexture?: string;
};

export const planetAssetCatalog: Record<PlanetId | "sun", PlanetAsset> = {
  sun: {
    texture: publicUrl("/assets/textures/sun.jpg"),
    distance: 0,
    initialAngle: 0,
  },
  mercury: {
    texture: publicUrl("/assets/textures/mercury.jpg"),
    distance: 7,
    initialAngle: 0.45,
  },
  venus: {
    texture: publicUrl("/assets/textures/venus.jpg"),
    distance: 10.6,
    initialAngle: 1.25,
  },
  earth: {
    texture: publicUrl("/assets/textures/earth.jpg"),
    distance: 14.4,
    initialAngle: 2.05,
  },
  mars: {
    texture: publicUrl("/assets/textures/mars.jpg"),
    distance: 18.8,
    initialAngle: 2.78,
  },
  jupiter: {
    texture: publicUrl("/assets/textures/jupiter.jpg"),
    distance: 24.8,
    initialAngle: 3.62,
  },
  saturn: {
    texture: publicUrl("/assets/textures/saturn.jpg"),
    distance: 31.4,
    initialAngle: 4.4,
    ringTexture: publicUrl("/assets/textures/saturn_ring.jpg"),
  },
  uranus: {
    texture: publicUrl("/assets/textures/uranus.jpg"),
    distance: 37.8,
    initialAngle: 5.12,
  },
  neptune: {
    texture: publicUrl("/assets/textures/neptune.webp"),
    distance: 44.2,
    initialAngle: 5.86,
  },
};

export const shipAssetCatalog = {
  cruiseModel: publicUrl("/assets/models/nasa/voyager-probe-b/voyager-probe-b.glb"),
  hazardModel: publicUrl("/assets/models/nasa/1999-rq36-asteroid/rq36-asteroid.glb"),
  hullBaseColor: "#e2e8f0",
  hullAccentColor: "#38bdf8",
  hullShadowColor: "#334155",
  cockpitGlow: "#93c5fd",
  engineGlow: "#22d3ee",
};

export const missionSubtitleCatalog = {
  targetLocked: "目标已锁定，任务简报正在展开。",
  approach: "进入接近窗口，准备修正飞行姿态。",
  entry: "正在切入目标轨道，注意引力和障碍变化。",
  atmosphere: "即将穿越大气层，请同步控制热防护与减速。",
  landingTransition: "进入缓降通道，准备执行着陆程序。",
  fragileWarning: "前方平台结构脆弱，请尽快转移。",
  hazardWarning: "检测到危险干扰，请立即规避。",
  respawn: "已回收到最近安全点，重新规划路线。",
  sample: "关键样本已回收，任务进度提升。",
  touchdown: "着陆确认完成，准备展开地表探索。",
};
