import type { PlanetId } from "./missionData";

export type FlightStage = "WARP" | "APPROACH" | "ENTRY" | "ATMOSPHERE" | "LANDING";

export type FlightHazard = {
  x: number;
  y: number;
  z: number;
  size: number;
  hit: boolean;
};

export type FlightOrb = {
  x: number;
  y: number;
  z: number;
  collected: boolean;
};

export type TargetPlanetState = {
  stage: FlightStage;
  radius: number;
  worldZ: number;
  offsetX: number;
  offsetY: number;
  groupScale: number;
  atmosphereScale: number;
  atmosphereOpacity: number;
  glowScale: number;
  glowOpacity: number;
  ringScale: number;
};

const BASE_RADIUS = 4;
const LANDING_TRIGGER_Z = -356;
const FLIGHT_COMPLETE_Z = -440;

const PLANET_SEEDS: Record<PlanetId, number> = {
  mercury: 1.17,
  venus: 2.31,
  earth: 3.43,
  mars: 4.59,
  jupiter: 5.71,
  saturn: 6.83,
  uranus: 7.97,
  neptune: 8.61,
};

const BASE_GUIDE_PATH = [
  { z: -18, x: 0, y: 0 },
  { z: -44, x: -1.8, y: 1.1 },
  { z: -72, x: 2.5, y: -1.1 },
  { z: -104, x: -3.3, y: 2.2 },
  { z: -136, x: 1.8, y: -2.2 },
  { z: -170, x: 3.8, y: 1.6 },
  { z: -206, x: -3.7, y: -1.5 },
  { z: -242, x: 2.7, y: 2.7 },
  { z: -278, x: -1.4, y: -2.8 },
  { z: -314, x: 1.9, y: 1.4 },
  { z: -342, x: -0.4, y: 0.5 },
  { z: -362, x: 0, y: -0.1 },
] as const;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function mix(start: number, end: number, amount: number) {
  return start + (end - start) * amount;
}

function normalize(value: number, start: number, end: number) {
  if (start === end) return 0;
  return clamp((value - start) / (end - start), 0, 1);
}

function seeded(seed: number, index: number) {
  const raw = Math.sin(seed * 127.1 + index * 311.7) * 43758.5453123;
  return raw - Math.floor(raw);
}

type StageConfig = {
  stage: FlightStage;
  radius: [number, number];
  gap: [number, number];
  x: [number, number];
  y: [number, number];
  atmosphereOpacity: [number, number];
  glowOpacity: [number, number];
  glowScale: [number, number];
  ringScale: [number, number];
};

const STAGE_CONFIGS: StageConfig[] = [
  {
    stage: "WARP",
    radius: [4.4, 8.6],
    gap: [182, 140],
    x: [4.5, 3.2],
    y: [1.5, 0.9],
    atmosphereOpacity: [0.12, 0.18],
    glowOpacity: [0.08, 0.15],
    glowScale: [1.18, 1.22],
    ringScale: [1.02, 1.04],
  },
  {
    stage: "APPROACH",
    radius: [8.6, 24],
    gap: [140, 98],
    x: [3.2, 1.8],
    y: [0.9, 0.35],
    atmosphereOpacity: [0.18, 0.34],
    glowOpacity: [0.15, 0.34],
    glowScale: [1.22, 1.28],
    ringScale: [1.04, 1.08],
  },
  {
    stage: "ENTRY",
    radius: [24, 52],
    gap: [98, 64],
    x: [1.8, 0.85],
    y: [0.35, 0.08],
    atmosphereOpacity: [0.34, 0.56],
    glowOpacity: [0.34, 0.56],
    glowScale: [1.28, 1.33],
    ringScale: [1.08, 1.11],
  },
  {
    stage: "ATMOSPHERE",
    radius: [52, 104],
    gap: [64, 28],
    x: [0.85, 0.2],
    y: [0.08, -0.1],
    atmosphereOpacity: [0.56, 0.82],
    glowOpacity: [0.56, 0.86],
    glowScale: [1.33, 1.38],
    ringScale: [1.11, 1.15],
  },
  {
    stage: "LANDING",
    radius: [104, 176],
    gap: [28, 8],
    x: [0.2, 0],
    y: [-0.1, -0.22],
    atmosphereOpacity: [0.82, 0.96],
    glowOpacity: [0.86, 1.06],
    glowScale: [1.38, 1.46],
    ringScale: [1.15, 1.2],
  },
];

function getGuidePath(planetId: PlanetId) {
  const seed = PLANET_SEEDS[planetId];
  return BASE_GUIDE_PATH.map((point, index, all) => {
    if (index === 0 || index === all.length - 1) return { ...point };

    const lateralJitter = (seeded(seed, index * 2) - 0.5) * (index < 4 ? 1.1 : index < 8 ? 1.8 : 0.8);
    const verticalJitter = (seeded(seed, index * 2 + 1) - 0.5) * (index < 4 ? 0.7 : index < 8 ? 1.3 : 0.6);

    return {
      z: point.z,
      x: clamp(point.x + lateralJitter, -4.8, 4.8),
      y: clamp(point.y + verticalJitter, -3.2, 3.2),
    };
  });
}

function createGateHazards(
  hazards: FlightHazard[],
  from: { x: number; y: number; z: number },
  to: { x: number; y: number; z: number },
  index: number
) {
  const direction = index % 2 === 0 ? 1 : -1;
  const midZ = mix(from.z, to.z, 0.54);
  const midX = mix(from.x, to.x, 0.58);
  const midY = mix(from.y, to.y, 0.58);
  const lateralSpread = 2.1 + (index % 3) * 0.45;
  const verticalSpread = 1.5 + ((index + 1) % 3) * 0.55;

  hazards.push({
    x: clamp(midX + direction * lateralSpread, -5.7, 5.7),
    y: clamp(midY - verticalSpread * 0.45, -3.8, 3.8),
    z: midZ,
    size: 0.72 + (index % 2) * 0.08,
    hit: false,
  });

  hazards.push({
    x: clamp(midX - direction * lateralSpread * 0.38, -5.7, 5.7),
    y: clamp(midY + verticalSpread, -3.8, 3.8),
    z: midZ - 4.4,
    size: 0.56 + ((index + 1) % 3) * 0.08,
    hit: false,
  });

  if (index >= 2) {
    hazards.push({
      x: clamp(mix(from.x, to.x, 0.35) - direction * 1.2, -5.7, 5.7),
      y: clamp(mix(from.y, to.y, 0.35) + direction * 0.9, -3.8, 3.8),
      z: midZ - 8.8,
      size: 0.48 + (index % 3) * 0.06,
      hit: false,
    });
  }

  if (index >= 7) {
    hazards.push({
      x: clamp(midX + direction * 0.65, -5.7, 5.7),
      y: clamp(midY - direction * 1.4, -3.8, 3.8),
      z: midZ - 11.6,
      size: 0.6 + (index % 2) * 0.06,
      hit: false,
    });
  }
}

export function getFlightStage(playerZ: number): FlightStage {
  if (playerZ > -110) return "WARP";
  if (playerZ > -200) return "APPROACH";
  if (playerZ > -280) return "ENTRY";
  if (playerZ > -340) return "ATMOSPHERE";
  return "LANDING";
}

export function getDescentSpeed(playerZ: number) {
  if (playerZ > -110) return mix(10, 12, normalize(-playerZ, 0, 110));
  if (playerZ > -200) return mix(12, 16, normalize(-playerZ, 110, 200));
  if (playerZ > -280) return mix(16, 20, normalize(-playerZ, 200, 280));
  if (playerZ > -340) return mix(20, 24, normalize(-playerZ, 280, 340));
  return mix(24, 27, normalize(-playerZ, 340, 380));
}

export function getLandingTriggerZ() {
  return LANDING_TRIGGER_Z;
}

export function getFlightCompleteZ() {
  return FLIGHT_COMPLETE_Z;
}

export function computeTargetPlanetState(playerZ: number, hasRing: boolean): TargetPlanetState {
  const stage = getFlightStage(playerZ);
  const depth = -playerZ;
  const config =
    stage === "WARP"
      ? STAGE_CONFIGS[0]
      : stage === "APPROACH"
        ? STAGE_CONFIGS[1]
        : stage === "ENTRY"
          ? STAGE_CONFIGS[2]
          : stage === "ATMOSPHERE"
            ? STAGE_CONFIGS[3]
            : STAGE_CONFIGS[4];

  const amount =
    stage === "WARP"
      ? normalize(depth, 0, 110)
      : stage === "APPROACH"
        ? normalize(depth, 110, 200)
        : stage === "ENTRY"
          ? normalize(depth, 200, 280)
          : stage === "ATMOSPHERE"
            ? normalize(depth, 280, 340)
            : normalize(depth, 340, 380);

  const radius = mix(config.radius[0], config.radius[1], amount);
  const gap = mix(config.gap[0], config.gap[1], amount);

  return {
    stage,
    radius,
    worldZ: playerZ - gap,
    offsetX: mix(config.x[0], config.x[1], amount),
    offsetY: mix(config.y[0], config.y[1], amount),
    groupScale: radius / BASE_RADIUS,
    atmosphereScale: 1.06 + amount * 0.05,
    atmosphereOpacity: mix(config.atmosphereOpacity[0], config.atmosphereOpacity[1], amount),
    glowScale: mix(config.glowScale[0], config.glowScale[1], amount),
    glowOpacity: mix(config.glowOpacity[0], config.glowOpacity[1], amount),
    ringScale: hasRing ? mix(config.ringScale[0], config.ringScale[1], amount) : 1,
  };
}

export function createFlightHazards(planetId: PlanetId): FlightHazard[] {
  const path = getGuidePath(planetId);
  const hazards: FlightHazard[] = [];

  for (let index = 1; index < path.length; index += 1) {
    createGateHazards(hazards, path[index - 1], path[index], index);
  }

  return hazards.sort((left, right) => left.z - right.z);
}

export function createFlightOrbs(planetId: PlanetId): FlightOrb[] {
  const path = getGuidePath(planetId);
  const seed = PLANET_SEEDS[planetId];
  const orbs: FlightOrb[] = [];

  path.slice(1, -1).forEach((point, index) => {
    orbs.push({
      x: point.x,
      y: point.y,
      z: point.z + 1.8,
      collected: false,
    });

    if (index % 3 === 1) {
      const lateral = (seeded(seed, 100 + index) > 0.5 ? 1 : -1) * 1.15;
      const vertical = (seeded(seed, 120 + index) > 0.5 ? 1 : -1) * 0.85;
      orbs.push({
        x: clamp(point.x + lateral, -4.8, 4.8),
        y: clamp(point.y + vertical, -3.2, 3.2),
        z: point.z - 3.4,
        collected: false,
      });
    }
  });

  return orbs.sort((left, right) => left.z - right.z);
}
