import type { SurfaceHazard, SurfaceNode } from "./missionData";

export const SURFACE_WORLD = {
  width: 1760,
  height: 1120,
  margin: 150,
  nodeRadius: 54,
  extractionRadius: 88,
  extractionX: 1760 - 220,
  extractionY: 220,
} as const;

export const SURFACE_PLAYER_TUNING = {
  acceleration: 820,
  maxSpeed: 315,
  friction: 0.84,
  boostMultiplier: 2.6,
  boostDuration: 0.78,
  boostCooldown: 2.65,
  boostImpulse: 255,
} as const;

export type SurfaceInputVector = {
  x: number;
  y: number;
};

export type SurfacePlayerMotionState = {
  vx: number;
  vy: number;
  heading: number;
  boostTimer: number;
  boostCooldown: number;
};

export type RuntimeNode = {
  id: string;
  label: string;
  x: number;
  y: number;
  radius: number;
  progress: number;
  collected: boolean;
  pulseSeed: number;
};

export type RuntimeHazard = {
  id: string;
  label: string;
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  radius: number;
  amplitude: number;
  speed: number;
  axis: "x" | "y";
  phase: number;
};

export type RuntimeEmitter = {
  id: string;
  label: string;
  x: number;
  y: number;
  radius: number;
  range: number;
  fireInterval: number;
  cooldown: number;
  projectileSpeed: number;
  activeFrom: number;
  pulseSeed: number;
};

export type RuntimeGuardian = {
  id: string;
  label: string;
  anchorX: number;
  anchorY: number;
  x: number;
  y: number;
  radius: number;
  orbitRadius: number;
  angularSpeed: number;
  phase: number;
  activeFrom: number;
};

export type RuntimeProjectile = {
  id: string;
  label: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  life: number;
  pulseSeed: number;
};

export type ProtectedZone = {
  x: number;
  y: number;
  radius: number;
};

export type CheckpointState = {
  x: number;
  y: number;
  safeElapsed: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function resolveInputVector(direction: SurfaceInputVector) {
  const length = Math.hypot(direction.x, direction.y);
  if (length <= 0.001) {
    return { x: 0, y: 0, hasMovement: false };
  }

  return {
    x: direction.x / length,
    y: direction.y / length,
    hasMovement: true,
  };
}

function resolveBoostVector(player: SurfacePlayerMotionState, direction: SurfaceInputVector) {
  const inputVector = resolveInputVector(direction);
  if (inputVector.hasMovement) {
    return inputVector;
  }

  const velocityLength = Math.hypot(player.vx, player.vy);
  if (velocityLength > 1) {
    return {
      x: player.vx / velocityLength,
      y: player.vy / velocityLength,
      hasMovement: true,
    };
  }

  return {
    x: Math.cos(player.heading),
    y: Math.sin(player.heading),
    hasMovement: true,
  };
}

export function triggerSurfaceBoost<T extends SurfacePlayerMotionState>(player: T, direction: SurfaceInputVector): T {
  const vector = resolveBoostVector(player, direction);

  return {
    ...player,
    vx: player.vx + vector.x * SURFACE_PLAYER_TUNING.boostImpulse,
    vy: player.vy + vector.y * SURFACE_PLAYER_TUNING.boostImpulse,
    boostTimer: SURFACE_PLAYER_TUNING.boostDuration,
    boostCooldown: SURFACE_PLAYER_TUNING.boostCooldown,
  };
}

export function stepSurfacePlayerVelocity<T extends SurfacePlayerMotionState>(
  player: T,
  direction: SurfaceInputVector,
  dt: number
): T {
  const vector = resolveInputVector(direction);
  const next = {
    ...player,
    boostTimer: Math.max(0, player.boostTimer - dt),
    boostCooldown: Math.max(0, player.boostCooldown - dt),
  };

  next.vx += vector.x * SURFACE_PLAYER_TUNING.acceleration * dt;
  next.vy += vector.y * SURFACE_PLAYER_TUNING.acceleration * dt;

  const damping = vector.hasMovement ? 0.94 : SURFACE_PLAYER_TUNING.friction;
  next.vx *= damping;
  next.vy *= damping;

  const speedCap =
    SURFACE_PLAYER_TUNING.maxSpeed *
    (next.boostTimer > 0 ? SURFACE_PLAYER_TUNING.boostMultiplier : 1);
  const velocityLength = Math.hypot(next.vx, next.vy);
  if (velocityLength > speedCap) {
    const ratio = speedCap / velocityLength;
    next.vx *= ratio;
    next.vy *= ratio;
  }

  if (Math.abs(next.vx) > 1 || Math.abs(next.vy) > 1) {
    next.heading = Math.atan2(next.vy, next.vx);
  }

  return next;
}

export function mapSurfacePercent(value: number, min: number, max: number) {
  return min + (value / 100) * (max - min);
}

export function distance(ax: number, ay: number, bx: number, by: number) {
  return Math.hypot(ax - bx, ay - by);
}

export function buildRuntimeNodes(nodes: SurfaceNode[]) {
  return nodes.map((node, index) => ({
    id: node.id,
    label: node.label,
    x: mapSurfacePercent(node.x, SURFACE_WORLD.margin, SURFACE_WORLD.width - SURFACE_WORLD.margin),
    y: mapSurfacePercent(node.y, SURFACE_WORLD.margin, SURFACE_WORLD.height - SURFACE_WORLD.margin),
    radius: SURFACE_WORLD.nodeRadius,
    progress: 0,
    collected: false,
    pulseSeed: index * 0.9 + 0.3,
  })) satisfies RuntimeNode[];
}

export function createProtectedZones(nodes: RuntimeNode[]): ProtectedZone[] {
  return [
    ...nodes.map((node) => ({
      x: node.x,
      y: node.y,
      radius: node.radius + 94,
    })),
    {
      x: SURFACE_WORLD.extractionX,
      y: SURFACE_WORLD.extractionY,
      radius: SURFACE_WORLD.extractionRadius + 84,
    },
  ];
}

export function buildRuntimeHazards(hazards: SurfaceHazard[], protectedZones: ProtectedZone[] = []) {
  return hazards.map((hazard, index) => {
    const radius = 28 + hazard.radius * 7.5;
    const amplitude = 22 + hazard.amplitude * 6.5;
    const speed = hazard.speed * 2;
    const initial = keepPointOutsideZones(
      {
        x: mapSurfacePercent(hazard.x, SURFACE_WORLD.margin, SURFACE_WORLD.width - SURFACE_WORLD.margin),
        y: mapSurfacePercent(hazard.y, SURFACE_WORLD.margin, SURFACE_WORLD.height - SURFACE_WORLD.margin),
      },
      radius,
      protectedZones
    );
    return {
      id: hazard.id,
      label: hazard.label,
      baseX: initial.x,
      baseY: initial.y,
      x: initial.x,
      y: initial.y,
      radius,
      amplitude,
      speed,
      axis: hazard.axis,
      phase: index * 0.75,
    };
  }) satisfies RuntimeHazard[];
}

export function buildRuntimeDefense(nodes: RuntimeNode[]) {
  const emitters: RuntimeEmitter[] = [];
  const guardians: RuntimeGuardian[] = [];

  const pushEmitter = (
    id: string,
    label: string,
    origin: { x: number; y: number },
    offsetX: number,
    offsetY: number,
    activeFrom: number,
    fireInterval: number,
    range: number,
    projectileSpeed: number
  ) => {
    emitters.push({
      id,
      label,
      x: clamp(origin.x + offsetX, SURFACE_WORLD.margin, SURFACE_WORLD.width - SURFACE_WORLD.margin),
      y: clamp(origin.y + offsetY, SURFACE_WORLD.margin, SURFACE_WORLD.height - SURFACE_WORLD.margin),
      radius: 30,
      range,
      fireInterval,
      cooldown: Math.max(0.18, fireInterval * 0.55),
      projectileSpeed,
      activeFrom,
      pulseSeed: emitters.length * 0.9 + 0.2,
    });
  };

  const pushGuardian = (
    id: string,
    label: string,
    anchor: { x: number; y: number },
    orbitRadius: number,
    angularSpeed: number,
    phase: number,
    activeFrom: number
  ) => {
    guardians.push({
      id,
      label,
      anchorX: anchor.x,
      anchorY: anchor.y,
      x: anchor.x,
      y: anchor.y,
      radius: 26,
      orbitRadius,
      angularSpeed,
      phase,
      activeFrom,
    });
  };

  if (nodes[1]) {
    pushEmitter("e-1", "电磁干扰塔", nodes[1], 156, -118, 1, 1.12, 340, 298);
    pushGuardian("g-1", "外星哨卫", nodes[1], 148, 1.2, 0.4, 1);
  }

  if (nodes[2]) {
    pushEmitter("e-2", "地磁脉冲塔", nodes[2], -174, 138, 2, 0.96, 360, 324);
    pushGuardian("g-2", "巡逻守卫", nodes[2], 162, 1.36, 1.4, 2);
  }

  pushEmitter(
    "e-x",
    "回传区压制塔",
    { x: SURFACE_WORLD.extractionX, y: SURFACE_WORLD.extractionY },
    -162,
    126,
    nodes.length,
    0.82,
    390,
    340
  );

  return { emitters, guardians };
}

export function pointThreatened(x: number, y: number, hazards: RuntimeHazard[], buffer = 0) {
  return hazards.some((hazard) => distance(x, y, hazard.x, hazard.y) < hazard.radius + buffer);
}

export function advanceCheckpoint(
  previous: CheckpointState,
  player: { x: number; y: number; vx: number; vy: number },
  hazards: RuntimeHazard[],
  dt: number
) {
  const movingSpeed = Math.hypot(player.vx, player.vy);
  const threatened = pointThreatened(player.x, player.y, hazards, 44);
  if (threatened) {
    return {
      ...previous,
      safeElapsed: 0,
    };
  }

  const safeElapsed = previous.safeElapsed + dt;
  const traveled = distance(previous.x, previous.y, player.x, player.y);

  if (movingSpeed > 36 && traveled > 140 && safeElapsed >= 0.42) {
    return {
      x: clamp(player.x, 60, SURFACE_WORLD.width - 60),
      y: clamp(player.y, 60, SURFACE_WORLD.height - 60),
      safeElapsed: 0,
    };
  }

  return {
    ...previous,
    safeElapsed,
  };
}

function keepPointOutsideZones(point: { x: number; y: number }, radius: number, zones: ProtectedZone[]) {
  let nextX = point.x;
  let nextY = point.y;

  for (const zone of zones) {
    const dx = nextX - zone.x;
    const dy = nextY - zone.y;
    const length = Math.hypot(dx, dy) || 1;
    const minDistance = zone.radius + radius + 24;
    if (length < minDistance) {
      nextX = zone.x + (dx / length) * minDistance;
      nextY = zone.y + (dy / length) * minDistance;
    }
  }

  return {
    x: clamp(nextX, SURFACE_WORLD.margin, SURFACE_WORLD.width - SURFACE_WORLD.margin),
    y: clamp(nextY, SURFACE_WORLD.margin, SURFACE_WORLD.height - SURFACE_WORLD.margin),
  };
}

export function updateGuardians(guardians: RuntimeGuardian[], dt: number) {
  guardians.forEach((guardian) => {
    guardian.phase += dt * guardian.angularSpeed;
    guardian.x = clamp(
      guardian.anchorX + Math.cos(guardian.phase) * guardian.orbitRadius,
      SURFACE_WORLD.margin,
      SURFACE_WORLD.width - SURFACE_WORLD.margin
    );
    guardian.y = clamp(
      guardian.anchorY + Math.sin(guardian.phase * 1.18) * guardian.orbitRadius * 0.62,
      SURFACE_WORLD.margin,
      SURFACE_WORLD.height - SURFACE_WORLD.margin
    );
  });

  return guardians;
}

export function fireEmitterProjectiles(
  emitters: RuntimeEmitter[],
  projectiles: RuntimeProjectile[],
  player: { x: number; y: number },
  dt: number,
  collectedCount: number
) {
  const next = [...projectiles];

  emitters.forEach((emitter) => {
    emitter.cooldown = Math.max(0, emitter.cooldown - dt);

    if (collectedCount < emitter.activeFrom) {
      return;
    }

    const rangeToPlayer = distance(emitter.x, emitter.y, player.x, player.y);
    if (rangeToPlayer > emitter.range || emitter.cooldown > 0) {
      return;
    }

    const dx = player.x - emitter.x;
    const dy = player.y - emitter.y;
    const length = Math.hypot(dx, dy) || 1;
    const normalX = dx / length;
    const normalY = dy / length;

    next.push({
      id: `${emitter.id}-${Math.round((player.x + player.y + next.length) * 100)}`,
      label: emitter.label,
      x: emitter.x + normalX * (emitter.radius + 16),
      y: emitter.y + normalY * (emitter.radius + 16),
      vx: normalX * emitter.projectileSpeed,
      vy: normalY * emitter.projectileSpeed,
      radius: 13,
      life: 2.4,
      pulseSeed: emitter.pulseSeed + next.length * 0.1,
    });

    emitter.cooldown = emitter.fireInterval;
  });

  return next;
}

export function advanceProjectiles(projectiles: RuntimeProjectile[], dt: number) {
  return projectiles
    .map((projectile) => ({
      ...projectile,
      x: projectile.x + projectile.vx * dt,
      y: projectile.y + projectile.vy * dt,
      life: projectile.life - dt,
    }))
    .filter(
      (projectile) =>
        projectile.life > 0 &&
        projectile.x > -80 &&
        projectile.x < SURFACE_WORLD.width + 80 &&
        projectile.y > -80 &&
        projectile.y < SURFACE_WORLD.height + 80
    );
}
