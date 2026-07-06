"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { planetAssetCatalog } from "@/lib/play/assetCatalog";
import type { MissionType, PlanetId, SurfaceHazard, SurfaceNode } from "@/lib/play/missionData";
import {
  SURFACE_WORLD,
  advanceCheckpoint,
  advanceProjectiles,
  buildRuntimeDefense,
  buildRuntimeHazards,
  buildRuntimeNodes,
  createProtectedZones,
  distance,
  fireEmitterProjectiles,
  stepSurfacePlayerVelocity,
  triggerSurfaceBoost,
  updateGuardians,
  type RuntimeEmitter,
  type RuntimeGuardian,
  type RuntimeHazard,
  type RuntimeNode,
  type RuntimeProjectile,
} from "@/lib/play/surfaceMissionRuntime";

type Props = {
  active: boolean;
  planetId: PlanetId;
  planetName: string;
  accent: string;
  summary: string;
  goal: string;
  missionType?: MissionType;
  nodes: SurfaceNode[];
  hazards: SurfaceHazard[];
  onCollect: () => void;
  onHazard: () => void;
  onComplete: () => void;
  onVoiceCue?: (cue: "sample" | "hazardWarning") => void;
};

type Particle = {
  x: number;
  y: number;
  size: number;
  driftX: number;
  driftY: number;
  alpha: number;
};

type TerrainFeature = {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  depth: number;
};

type RidgeFeature = {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  alpha: number;
};

type DebrisFeature = {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  alpha: number;
};

type ScreenStar = {
  x: number;
  y: number;
  size: number;
  alpha: number;
};

type ScreenNebula = {
  x: number;
  y: number;
  width: number;
  height: number;
  alpha: number;
};

type MissionDecor = {
  stars: ScreenStar[];
  nebulas: ScreenNebula[];
  craters: TerrainFeature[];
  ridges: RidgeFeature[];
  debris: DebrisFeature[];
  particles: Particle[];
};

type MissionRuntime = {
  player: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    heading: number;
    boostTimer: number;
    boostCooldown: number;
    checkpointX: number;
    checkpointY: number;
    safeElapsed: number;
    hitFlash: number;
    shake: number;
    knockbackX: number;
    knockbackY: number;
    knockbackTimer: number;
  };
  nodes: RuntimeNode[];
  hazards: RuntimeHazard[];
  emitters: RuntimeEmitter[];
  guardians: RuntimeGuardian[];
  projectiles: RuntimeProjectile[];
  cameraX: number;
  cameraY: number;
  extraction: {
    x: number;
    y: number;
    radius: number;
  };
  extractionProgress: number;
  lastHitAt: number;
  banner: string;
  bannerUntil: number;
  completed: boolean;
  collectBurst: { x: number; y: number; t: number; color: string } | null;
};

type HudSnapshot = {
  collectedCount: number;
  integrity: number;
  banner: string;
  scanLabel: string;
  scanProgress: number;
  extractionVisible: boolean;
  extractionProgress: number;
  objectiveText: string;
  hintText: string;
  boostReady: boolean;
  uploadText: string;
  statusText: string;
  warningText: string;
};

const WORLD_WIDTH = SURFACE_WORLD.width;
const WORLD_HEIGHT = SURFACE_WORLD.height;
const PLAYER_RADIUS = 18;
const SCAN_DURATION = 1.35;
const UPLOAD_DURATION = 1.15;
const HIT_COOLDOWN_MS = 1150;
const START_X = 220;
const START_Y = WORLD_HEIGHT - 240;

export default function SurfaceMission({
  active,
  planetId,
  planetName,
  accent,
  summary,
  goal,
  missionType,
  nodes,
  hazards,
  onCollect,
  onHazard,
  onComplete,
  onVoiceCue,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef(0);
  const finishTimerRef = useRef<number | null>(null);
  const keysRef = useRef<Record<string, boolean>>({});
  const boostLatchRef = useRef(false);
  const textureRef = useRef<HTMLImageElement | null>(null);
  const runtimeRef = useRef<MissionRuntime | null>(null);
  const integrityRef = useRef(100);
  const lastHudUpdateRef = useRef(0);
  const callbacksRef = useRef({
    onCollect,
    onHazard,
    onComplete,
    onVoiceCue,
  });
  const [ready, setReady] = useState(false);
  const [hud, setHud] = useState<HudSnapshot>(() => createInitialHud(goal, nodes.length));

  callbacksRef.current = {
    onCollect,
    onHazard,
    onComplete,
    onVoiceCue,
  };

  const decor = useMemo(() => createDecor(planetId), [planetId]);
  const texturePath = planetAssetCatalog[planetId].texture;

  const resetHud = useCallback(() => {
    integrityRef.current = 100;
    setHud(createInitialHud(goal, nodes.length));
  }, [goal, nodes.length]);

  useEffect(() => {
    if (!active) return;
    resetHud();
    setReady(false);

    const timer = window.setTimeout(() => setReady(true), 320);
    return () => window.clearTimeout(timer);
  }, [active, planetId, resetHud]);

  useEffect(() => {
    if (!active) return;

    const image = new Image();
    image.decoding = "async";
    image.src = texturePath;
    image.onload = () => {
      textureRef.current = image;
    };

    return () => {
      textureRef.current = null;
    };
  }, [active, texturePath]);

  useEffect(() => {
    if (!active) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (
        [
          "w",
          "a",
          "s",
          "d",
          " ",
          "shift",
          "arrowup",
          "arrowleft",
          "arrowdown",
          "arrowright",
        ].includes(key)
      ) {
        event.preventDefault();
        keysRef.current[key] = true;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      keysRef.current[key] = false;
    };

    window.addEventListener("keydown", handleKeyDown, { passive: false });
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const runtime = createRuntime(nodes, hazards, performance.now());
    runtimeRef.current = runtime;
    boostLatchRef.current = false;
    lastHudUpdateRef.current = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    let disposed = false;
    let last = performance.now();

    const loop = (now: number) => {
      if (disposed) return;
      const dt = Math.min(0.032, (now - last) / 1000);
      last = now;

      updateRuntime({
        runtime,
        dt,
        now,
        keys: keysRef.current,
        onCollect: callbacksRef.current.onCollect,
        onHazard: callbacksRef.current.onHazard,
        onComplete: callbacksRef.current.onComplete,
        onVoiceCue: callbacksRef.current.onVoiceCue,
        integrityRef,
        finishTimerRef,
        boostLatchRef,
      });

      drawMission({
        ctx,
        canvas,
        runtime,
        texture: textureRef.current,
        decor,
        accent,
        planetId,
        now,
      });

      if (now - lastHudUpdateRef.current > 90) {
        const nextHud = createHudSnapshot(runtime, integrityRef.current, now, goal);
        setHud((prev) => (isSameHud(prev, nextHud) ? prev : nextHud));
        lastHudUpdateRef.current = now;
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      disposed = true;
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      clearFinishTimer(finishTimerRef);
    };
  }, [active, accent, decor, goal, hazards, nodes, planetId]);

  const warningTone =
    hud.warningText === "低干扰"
      ? "text-white/76"
      : hud.warningText.includes("脉冲")
        ? "text-rose-200"
        : hud.warningText.includes("守卫")
          ? "text-fuchsia-200"
          : "text-amber-200";

  const integrityTone =
    hud.integrity > 60 ? "text-emerald-200" : hud.integrity > 30 ? "text-amber-200" : "text-rose-200";

  return (
    <AnimatePresence>
      {active ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-[45] bg-[radial-gradient(circle_at_center,rgba(2,6,23,0.28),rgba(2,1,10,0.94))] backdrop-blur-[4px]"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.988 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative h-full w-full p-3 md:p-5"
          >
            <div className="relative h-full w-full overflow-hidden rounded-[32px] border border-white/10 bg-[#04050e] shadow-[0_0_90px_rgba(34,211,238,0.08)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_8%,rgba(255,255,255,0.05),transparent_24%),linear-gradient(180deg,rgba(5,9,20,0.7),rgba(2,5,12,0.98))]" />
              <div
                className="pointer-events-none absolute inset-0 opacity-90"
                style={{
                  background: `radial-gradient(circle at 50% 118%, ${accent}2e, transparent 34%), radial-gradient(circle at 82% 12%, ${accent}16, transparent 20%)`,
                }}
              />

              <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

              <MissionTypeChip missionType={missionType} accent={accent} planetId={planetId} />
              <div className="pointer-events-none absolute left-4 top-4 z-10 md:left-6 md:top-6">
                <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-black/28 px-4 py-2 text-sm text-white/88 backdrop-blur-md">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ background: accent, boxShadow: `0 0 12px ${accent}` }}
                  />
                  <span className="text-[10px] uppercase tracking-[0.32em] text-cyan-200/72">地表任务</span>
                  <span>{planetName}</span>
                  <span className="text-xs text-white/52">{hud.statusText}</span>
                </div>
              </div>

              <AnimatePresence>
                {hud.banner ? (
                  <motion.div
                    key={hud.banner}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="pointer-events-none absolute bottom-[152px] left-1/2 z-20 -translate-x-1/2 rounded-full border border-cyan-400/16 bg-black/46 px-4 py-2 text-xs text-white/88 backdrop-blur-md md:text-sm"
                  >
                    {hud.banner}
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <div className="pointer-events-none absolute bottom-4 left-1/2 z-10 w-[min(720px,calc(100%-1.5rem))] -translate-x-1/2 md:bottom-6 md:w-[min(760px,calc(100%-8rem))]">
                <div className="rounded-[28px] border border-white/10 bg-black/34 px-4 py-4 shadow-[0_0_36px_rgba(15,23,42,0.34)] backdrop-blur-md md:px-5">
                  <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-white/44">
                    <span>{hud.extractionVisible ? "回传阶段" : "任务推进"}</span>
                    <span className="rounded-full border border-white/10 bg-white/6 px-2.5 py-1 text-[10px] tracking-[0.24em] text-white/70">
                      {hud.statusText}
                    </span>
                  </div>
                  <div className="mt-2 text-sm font-medium text-white/92 md:text-[15px]">{hud.objectiveText}</div>
                  <div className="mt-1 text-xs leading-6 text-white/62 md:text-sm">{hud.hintText}</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <HudPill label="机体" value={`${hud.integrity}%`} tone={integrityTone} />
                    <HudPill label="推进" value={hud.boostReady ? "就绪" : "冷却"} tone={hud.boostReady ? "text-cyan-200" : "text-white/76"} />
                    <HudPill label="回传" value={hud.uploadText} tone={hud.extractionVisible ? "text-cyan-200" : "text-white/72"} />
                    <HudPill label="干扰" value={hud.warningText} tone={warningTone} />
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/8">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.max(
                          0,
                          Math.min(100, (hud.extractionVisible ? hud.extractionProgress : hud.scanProgress) * 100)
                        )}%`,
                      }}
                      transition={{ type: "spring", stiffness: 90, damping: 18 }}
                      className="h-full rounded-full"
                      style={{ background: accent, boxShadow: `0 0 14px ${accent}` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pointer-events-none absolute bottom-4 left-4 z-10 md:bottom-6 md:left-6">
                <div className="rounded-full border border-white/10 bg-black/28 px-4 py-2 text-[11px] text-white/76 backdrop-blur-md">
                  <span className="text-cyan-200">控制</span>
                  <span className="mx-2 text-white/24">·</span>
                  <span>W / A / S / D 移动</span>
                  <span className="mx-2 text-white/24">·</span>
                  <span>空格扫描 / 上传</span>
                  <span className="mx-2 text-white/24">·</span>
                  <span>Shift 冲刺</span>
                </div>
              </div>

              <div className="pointer-events-none absolute bottom-4 right-4 z-10 md:bottom-6 md:right-6">
                <div className="rounded-full border border-white/10 bg-black/28 px-4 py-2 text-[11px] text-white/76 backdrop-blur-md">
                  <span className="text-amber-200">当前锁定</span>
                  <span className="mx-2 text-white/24">·</span>
                  <span>{hud.scanLabel || "前往下一处信标"}</span>
                </div>
              </div>

              {!ready ? (
                <div className="pointer-events-none absolute inset-0 z-20 bg-black/24 backdrop-blur-[1px]" />
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function updateRuntime({
  runtime,
  dt,
  now,
  keys,
  onCollect,
  onHazard,
  onComplete,
  onVoiceCue,
  integrityRef,
  finishTimerRef,
  boostLatchRef,
}: {
  runtime: MissionRuntime;
  dt: number;
  now: number;
  keys: Record<string, boolean>;
  onCollect: () => void;
  onHazard: () => void;
  onComplete: () => void;
  onVoiceCue?: (cue: "sample" | "hazardWarning") => void;
  integrityRef: React.MutableRefObject<number>;
  finishTimerRef: React.MutableRefObject<number | null>;
  boostLatchRef: React.MutableRefObject<boolean>;
}) {
  if (runtime.completed) return;

  const player = runtime.player;
  if (player.shake > 0) player.shake = Math.max(0, player.shake - dt * 60);
  if (player.knockbackTimer > 0) {
    player.knockbackTimer = Math.max(0, player.knockbackTimer - dt);
    player.x += player.knockbackX * 220 * dt;
    player.y += player.knockbackY * 220 * dt;
  }
  if (player.hitFlash > 0) player.hitFlash = Math.max(0, player.hitFlash - dt * 1.2);
  if (runtime.collectBurst) {
    runtime.collectBurst.t += dt;
    if (runtime.collectBurst.t > 0.95) runtime.collectBurst = null;
  }

  const moveX = Number(Boolean(keys.d || keys.arrowright)) - Number(Boolean(keys.a || keys.arrowleft));
  const moveY = Number(Boolean(keys.s || keys.arrowdown)) - Number(Boolean(keys.w || keys.arrowup));
  const moveLength = Math.hypot(moveX, moveY) || 1;
  const directionX = moveX / moveLength;
  const directionY = moveY / moveLength;
  const scanHeld = Boolean(keys[" "]);
  const boostHeld = Boolean(keys.shift);
  const collectedCount = runtime.nodes.filter((node) => node.collected).length;
  const movementVector = { x: directionX, y: directionY };

  if (boostHeld && !boostLatchRef.current && player.boostCooldown <= 0) {
    const boosted = triggerSurfaceBoost(player, movementVector);
    player.vx = boosted.vx;
    player.vy = boosted.vy;
    player.heading = boosted.heading;
    player.boostTimer = boosted.boostTimer;
    player.boostCooldown = boosted.boostCooldown;
    setMissionBanner(runtime, "推进器点火，保持侧移穿过危险火线。", now);
  }
  boostLatchRef.current = boostHeld;

  const nextMotion = stepSurfacePlayerVelocity(player, movementVector, dt);
  player.vx = nextMotion.vx;
  player.vy = nextMotion.vy;
  player.heading = nextMotion.heading;
  player.boostTimer = nextMotion.boostTimer;
  player.boostCooldown = nextMotion.boostCooldown;
  player.hitFlash = Math.max(0, player.hitFlash - dt * 2.8);

  player.x = clamp(player.x + player.vx * dt, 60, WORLD_WIDTH - 60);
  player.y = clamp(player.y + player.vy * dt, 60, WORLD_HEIGHT - 60);

  const targetCamX = clamp(player.x - 640, 0, WORLD_WIDTH - 1280);
  const targetCamY = clamp(player.y - 360, 0, WORLD_HEIGHT - 720);
  runtime.cameraX += (targetCamX - runtime.cameraX) * 0.08;
  runtime.cameraY += (targetCamY - runtime.cameraY) * 0.08;

  runtime.hazards.forEach((hazard) => {
    hazard.phase += dt * hazard.speed;
    const offset = Math.sin(hazard.phase) * hazard.amplitude;
    hazard.x = hazard.axis === "x" ? hazard.baseX + offset : hazard.baseX;
    hazard.y = hazard.axis === "y" ? hazard.baseY + offset : hazard.baseY;
  });

  updateGuardians(runtime.guardians, dt);
  runtime.projectiles = fireEmitterProjectiles(
    runtime.emitters,
    runtime.projectiles,
    { x: player.x, y: player.y },
    dt,
    collectedCount
  );
  runtime.projectiles = advanceProjectiles(runtime.projectiles, dt);

  const activeGuardians = runtime.guardians.filter((guardian) => collectedCount >= guardian.activeFrom);
  const activeEmitters = runtime.emitters.filter((emitter) => collectedCount >= emitter.activeFrom);
  const checkpointThreats = [
    ...runtime.hazards,
    ...activeGuardians.map((guardian) => asThreat(guardian.id, guardian.label, guardian.x, guardian.y, guardian.radius + 14)),
    ...activeEmitters.map((emitter) => asThreat(emitter.id, emitter.label, emitter.x, emitter.y, emitter.radius + 20)),
    ...runtime.projectiles.map((projectile) => asThreat(projectile.id, projectile.label, projectile.x, projectile.y, projectile.radius + 20)),
  ];
  const checkpointState = advanceCheckpoint(
    {
      x: player.checkpointX,
      y: player.checkpointY,
      safeElapsed: player.safeElapsed,
    },
    player,
    checkpointThreats,
    dt
  );
  player.checkpointX = checkpointState.x;
  player.checkpointY = checkpointState.y;
  player.safeElapsed = checkpointState.safeElapsed;

  let hitResolved = false;

  const applyHit = (label: string, integrityLoss: number, banner: string) => {
    runtime.lastHitAt = now;
    integrityRef.current = Math.max(0, integrityRef.current - integrityLoss);
    onHazard();
    onVoiceCue?.("hazardWarning");
    setMissionBanner(runtime, banner, now, 2400);
    // Knockback direction: from impact point back toward player
    const dkx = (player.x - player.checkpointX);
    const dky = (player.y - player.checkpointY);
    const dkl = Math.hypot(dkx, dky) || 1;
    const knockStrength = Math.min(1, integrityLoss / 24);
    player.knockbackX = dkx / dkl;
    player.knockbackY = dky / dkl;
    player.knockbackTimer = 0.32;
    player.shake = Math.max(player.shake, 14 + knockStrength * 8);
    player.x = player.checkpointX;
    player.y = player.checkpointY;
    player.vx = 0;
    player.vy = 0;
    player.safeElapsed = 0;
    player.hitFlash = 1;
    runtime.projectiles = runtime.projectiles.filter(
      (projectile) => distance(projectile.x, projectile.y, player.checkpointX, player.checkpointY) > 160
    );
    if (label === "回传区压制塔") {
      runtime.extractionProgress = Math.max(0, runtime.extractionProgress - 0.3);
    }
    hitResolved = true;
  };

  runtime.hazards.forEach((hazard) => {
    if (hitResolved || now - runtime.lastHitAt <= HIT_COOLDOWN_MS) return;
    const dist = distance(player.x, player.y, hazard.x, hazard.y);
    if (dist < hazard.radius + PLAYER_RADIUS * 0.72) {
      applyHit(hazard.label, 18, `遭遇 ${hazard.label}，已回撤到最近安全点。`);
    }
  });

  activeEmitters.forEach((emitter) => {
    if (hitResolved || now - runtime.lastHitAt <= HIT_COOLDOWN_MS) return;
    const dist = distance(player.x, player.y, emitter.x, emitter.y);
    if (dist < emitter.radius + PLAYER_RADIUS * 0.85) {
      applyHit(emitter.label, 14, `${emitter.label} 电场压制，立即调整航迹。`);
    }
  });

  activeGuardians.forEach((guardian) => {
    if (hitResolved || now - runtime.lastHitAt <= HIT_COOLDOWN_MS) return;
    const dist = distance(player.x, player.y, guardian.x, guardian.y);
    if (dist < guardian.radius + PLAYER_RADIUS * 0.82) {
      applyHit(guardian.label, 16, `${guardian.label} 近距拦截，已回退到上一安全点。`);
    }
  });

  runtime.projectiles.forEach((projectile) => {
    if (hitResolved || now - runtime.lastHitAt <= HIT_COOLDOWN_MS) return;
    const dist = distance(player.x, player.y, projectile.x, projectile.y);
    if (dist < projectile.radius + PLAYER_RADIUS * 0.82) {
      applyHit(projectile.label, 12, "电脉冲命中，建议切向闪避并避开直线火力。");
    }
  });

  let activeNode: RuntimeNode | null = null;
  let closestNodeDistance = Number.POSITIVE_INFINITY;

  runtime.nodes.forEach((node) => {
    if (node.collected) return;
    const dist = distance(player.x, player.y, node.x, node.y);
    if (dist < node.radius * 1.32 && dist < closestNodeDistance) {
      activeNode = node;
      closestNodeDistance = dist;
    }
  });

  runtime.nodes.forEach((node) => {
    if (node.collected) return;
    if (activeNode?.id === node.id && scanHeld) {
      node.progress = Math.min(1, node.progress + dt / SCAN_DURATION);
      player.vx *= 0.96;
      player.vy *= 0.96;
      if (node.progress >= 1) {
        node.collected = true;
        node.progress = 1;
        player.checkpointX = node.x;
        player.checkpointY = node.y;
        player.safeElapsed = 0;
        setMissionBanner(runtime, `已完成 ${node.label} 扫描，继续前往下一处信标。`, now, 2200);
        runtime.collectBurst = { x: node.x, y: node.y, t: 0, color: "#22d3ee" };
        onCollect();
        onVoiceCue?.("sample");
      }
    } else {
      node.progress = Math.max(0, node.progress - dt * 0.38);
    }
  });

  const extractionVisible = runtime.nodes.every((node) => node.collected);
  if (extractionVisible) {
    if (runtime.banner !== "全部信标已完成，返回金色回传环上传样本。") {
      setMissionBanner(runtime, "全部信标已完成，返回金色回传环上传样本。", now, 2600);
    }
    const extractionDistance = distance(player.x, player.y, runtime.extraction.x, runtime.extraction.y);
    if (extractionDistance < runtime.extraction.radius && scanHeld) {
      runtime.extractionProgress = Math.min(1, runtime.extractionProgress + dt / UPLOAD_DURATION);
      player.vx *= 0.95;
      player.vy *= 0.95;
      if (runtime.extractionProgress >= 1 && !runtime.completed) {
        runtime.completed = true;
        setMissionBanner(runtime, "样本回传完成，正在切入最终科学考验。", now, 2600);
        clearFinishTimer(finishTimerRef);
        finishTimerRef.current = window.setTimeout(() => onComplete(), 720);
      }
    } else {
      runtime.extractionProgress = Math.max(0, runtime.extractionProgress - dt * 0.42);
    }
  } else {
    runtime.extractionProgress = 0;
  }
}

function drawMission({
  ctx,
  canvas,
  runtime,
  texture,
  decor,
  accent,
  planetId,
  now,
}: {
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  runtime: MissionRuntime;
  texture: HTMLImageElement | null;
  decor: MissionDecor;
  accent: string;
  planetId: PlanetId;
  now: number;
}) {
  const width = canvas.clientWidth || canvas.width;
  const height = canvas.clientHeight || canvas.height;
  const time = now * 0.001;
  const collectedCount = runtime.nodes.filter((node) => node.collected).length;

  ctx.clearRect(0, 0, width, height);

  const _bgStops = {"venus":["#3d1a0e","#1a0805","#0a0403"],"mercury":["#0a0612","#05030a","#02010a"],"earth":["#021a1f","#010e14","#000608"],"mars":["#2a0e08","#150603","#08020a"],"jupiter":["#1a1106","#0d0703","#05030a"],"saturn":["#1f1810","#100c08","#080503"],"uranus":["#062028","#031820","#010a14"],"neptune":["#06122a","#030e1f","#010614"]}[planetId] || ["#070b1a", "#040812", "#02040b"];
  const bg = ctx.createLinearGradient(0, 0, 0, height);
  bg.addColorStop(0, _bgStops[0]);
  bg.addColorStop(0.55, _bgStops[1]);
  bg.addColorStop(1, _bgStops[2]);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  decor.stars.forEach((star) => {
    ctx.fillStyle = `rgba(255,255,255,${star.alpha})`;
    ctx.beginPath();
    ctx.arc(star.x * width, star.y * height, star.size, 0, Math.PI * 2);
    ctx.fill();
  });

  decor.nebulas.forEach((nebula, index) => {
    const nebulaX = nebula.x * width + Math.sin(time * 0.1 + index) * 18;
    const nebulaY = nebula.y * height + Math.cos(time * 0.08 + index * 0.5) * 10;
    const gradient = ctx.createRadialGradient(nebulaX, nebulaY, 0, nebulaX, nebulaY, nebula.width);
    gradient.addColorStop(0, `rgba(255,255,255,${nebula.alpha})`);
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(nebulaX, nebulaY, nebula.width, nebula.height, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  // ===== per-planet 大气层（每颗行星独特的色彩氛围） =====
  const atmosphereTint = hexToRgba(accent, 0.32);
  const tintGrad = ctx.createLinearGradient(0, 0, 0, height);
  tintGrad.addColorStop(0, atmosphereTint);
  tintGrad.addColorStop(0.5, hexToRgba(accent, 0.18));
  tintGrad.addColorStop(1, hexToRgba(accent, 0.06));
  ctx.fillStyle = tintGrad;
  ctx.fillRect(0, 0, width, height);

  if (planetId === "venus" || planetId === "uranus") {
    for (let i = 0; i < 6; i++) {
      const stripeY = height * 0.2 + i * 40 + Math.sin(time * (0.4 + i * 0.1)) * 12;
      const stripeAlpha = 0.18 + (i % 2) * 0.08;
      const stripeGrad = ctx.createLinearGradient(0, stripeY - 14, 0, stripeY + 14);
      stripeGrad.addColorStop(0, "rgba(0,0,0,0)");
      stripeGrad.addColorStop(0.5, hexToRgba(planetId === "venus" ? "#facc15" : "#22d3ee", stripeAlpha));
      stripeGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = stripeGrad;
      ctx.fillRect(0, stripeY - 18, width, 36);
    }
  }
  if (planetId === "mars") {
    for (let i = 0; i < 40; i++) {
      const dustY = (i / 40) * height;
      const dustX = (i * 137 + time * (60 + (i % 3) * 20)) % (width + 80) - 40;
      const dustA = 0.12 + ((i * 13) % 7) * 0.025;
      ctx.fillStyle = "rgba(251,113,80," + dustA + ")";
      ctx.beginPath();
      ctx.arc(dustX, dustY, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  if (planetId === "saturn") {
    ctx.save();
    ctx.translate(width * 0.5, height * 0.32);
    ctx.rotate(-0.25);
    for (let ring = 0; ring < 5; ring++) {
      const ringW = width * 0.55 + ring * 40;
      const ringH = 6 + ring * 2;
      ctx.strokeStyle = hexToRgba("#e7c98a", 0.18 - ring * 0.025);
      ctx.lineWidth = ringH;
      ctx.beginPath();
      ctx.ellipse(0, 0, ringW / 2, ringH * 1.5, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }
  if (planetId === "jupiter") {
    const spotX = width * 0.75;
    const spotY = height * 0.78;
    ctx.save();
    ctx.translate(spotX, spotY);
    ctx.rotate(time * 0.3);
    const spotGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 60);
    spotGrad.addColorStop(0, "rgba(251,113,80,0.45)");
    spotGrad.addColorStop(0.7, "rgba(251,191,80,0.25)");
    spotGrad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = spotGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, 60, 28, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  if (planetId === "mercury") {
    for (let i = 0; i < 3; i++) {
      const t = (time * 0.6 + i * 0.33) % 1;
      const mx = width * (0.2 + i * 0.3) + t * width * 0.4;
      const my = -20 + t * (height + 40);
      const mAlpha = (1 - Math.abs(t - 0.5) * 2) * 0.4;
      ctx.strokeStyle = "rgba(255,255,255," + mAlpha + ")";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(mx - 60, my + 30);
      ctx.lineTo(mx, my);
      ctx.stroke();
    }
  }
  if (planetId === "earth") {
    for (let i = 0; i < 3; i++) {
      const cx = width * 0.3 + i * width * 0.2;
      const cy = height * 0.25 + Math.sin(time + i) * 30;
      ctx.strokeStyle = hexToRgba("#22d3ee", 0.18);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 36, 14, Math.sin(time * 0.5 + i) * 0.3, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  if (planetId === "neptune") {
    for (let i = 0; i < 3; i++) {
      const stripeY = height * (0.35 + i * 0.18);
      const offset = (time * (80 + i * 30)) % (width + 200) - 100;
      ctx.strokeStyle = hexToRgba("#3b82f6", 0.15 + i * 0.04);
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(offset, stripeY);
      ctx.lineTo(offset + width * 0.4, stripeY);
      ctx.stroke();
    }
  }

    const camX = runtime.cameraX;
  const camY = runtime.cameraY;
  // Camera shake (decaying sin offset from impact)
  const shakeAmp = runtime.player.shake;
  const shakeDx = shakeAmp > 0 ? Math.sin(time * 64) * shakeAmp : 0;
  const shakeDy = shakeAmp > 0 ? Math.cos(time * 78) * shakeAmp * 0.6 : 0;
  const camXeff = camX + shakeDx;
  const camYeff = camY + shakeDy;
  // === Hazard proximity pulse (red ring around hazards within 80px) ===
  runtime.hazards.forEach((hazard) => {
    const hScreen = worldToScreen(hazard.x, hazard.y, camX, camY);
    const dist = distance(runtime.player.x, runtime.player.y, hazard.x, hazard.y);
    if (dist < hazard.radius + 90) {
      const warnIntensity = 1 - Math.max(0, (dist - hazard.radius) / 90);
      const pulse = 0.5 + Math.sin(time * 9) * 0.4;
      ctx.strokeStyle = "rgba(248,113,113," + (0.5 * warnIntensity * pulse) + ")";
      ctx.lineWidth = 1.5 + warnIntensity * 1.5;
      ctx.beginPath();
      ctx.arc(hScreen.x, hScreen.y, hazard.radius + 4, 0, Math.PI * 2);
      ctx.stroke();
    }
  });
  runtime.emitters.forEach((emitter) => {
    if (emitter.activeFrom > runtime.nodes.filter(n => n.collected).length) return;
    const eScreen = worldToScreen(emitter.x, emitter.y, camX, camY);
    const dist = distance(runtime.player.x, runtime.player.y, emitter.x, emitter.y);
    if (dist < emitter.radius + 110) {
      const warnIntensity = 1 - Math.max(0, (dist - emitter.radius) / 110);
      const pulse = 0.5 + Math.sin(time * 12) * 0.4;
      ctx.strokeStyle = "rgba(244,114,182," + (0.55 * warnIntensity * pulse) + ")";
      ctx.lineWidth = 1.5 + warnIntensity * 2;
      ctx.beginPath();
      ctx.arc(eScreen.x, eScreen.y, emitter.radius + 4, 0, Math.PI * 2);
      ctx.stroke();
    }
  });



  if (texture) {
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.globalCompositeOperation = "soft-light";
    ctx.drawImage(texture, -camX, -camY, WORLD_WIDTH, WORLD_HEIGHT);
    ctx.restore();
  }

  const terrainGlow = ctx.createRadialGradient(width * 0.5, height * 0.96, 0, width * 0.5, height * 0.96, width * 0.48);
  terrainGlow.addColorStop(0, `${hexToRgba(accent, 0.2)}`);
  terrainGlow.addColorStop(1, `${hexToRgba(accent, 0)}`);
  ctx.fillStyle = terrainGlow;
  ctx.fillRect(0, height * 0.4, width, height);

  drawGrid(ctx, width, height, camX, camY);

  decor.craters.forEach((crater) => {
    const { x, y } = worldToScreen(crater.x, crater.y, camX, camY);
    if (x < -crater.radius || x > width + crater.radius || y < -crater.radius || y > height + crater.radius) return;

    const gradient = ctx.createRadialGradient(x, y, crater.radius * 0.12, x, y, crater.radius);
    gradient.addColorStop(0, `rgba(0,0,0,${crater.depth})`);
    gradient.addColorStop(0.65, `rgba(7,15,24,${crater.alpha})`);
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, crater.radius, 0, Math.PI * 2);
    ctx.fill();
  });

  decor.ridges.forEach((ridge) => {
    const { x, y } = worldToScreen(ridge.x, ridge.y, camX, camY);
    if (x < -ridge.width || x > width + ridge.width || y < -ridge.height || y > height + ridge.height) return;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ridge.rotation);
    const gradient = ctx.createLinearGradient(0, -ridge.height * 0.5, 0, ridge.height * 0.5);
    gradient.addColorStop(0, `rgba(255,255,255,${ridge.alpha * 0.15})`);
    gradient.addColorStop(1, `rgba(5,8,16,${ridge.alpha})`);
    ctx.fillStyle = gradient;
    roundRect(ctx, -ridge.width * 0.5, -ridge.height * 0.5, ridge.width, ridge.height, ridge.height * 0.45);
    ctx.fill();
    ctx.restore();
  });

  decor.debris.forEach((debris) => {
    const { x, y } = worldToScreen(debris.x, debris.y, camX, camY);
    if (x < -debris.width || x > width + debris.width || y < -debris.height || y > height + debris.height) return;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(debris.rotation);
    ctx.fillStyle = `rgba(148,163,184,${debris.alpha})`;
    roundRect(ctx, -debris.width * 0.5, -debris.height * 0.5, debris.width, debris.height, debris.height * 0.5);
    ctx.fill();
    ctx.restore();
  });

  const remainingNodes = runtime.nodes.filter((node) => !node.collected);
  const routePoints = remainingNodes.length
    ? [{ x: runtime.player.checkpointX, y: runtime.player.checkpointY }, ...remainingNodes.slice(0, 2).map((node) => ({ x: node.x, y: node.y }))]
    : [{ x: runtime.player.checkpointX, y: runtime.player.checkpointY }, { x: runtime.extraction.x, y: runtime.extraction.y }];

  ctx.save();
  ctx.strokeStyle = "rgba(34,211,238,0.16)";
  ctx.lineWidth = 2;
  ctx.setLineDash([9, 12]);
  ctx.beginPath();
  routePoints.forEach((point, index) => {
    const screen = worldToScreen(point.x, point.y, camX, camY);
    if (index === 0) ctx.moveTo(screen.x, screen.y);
    else ctx.lineTo(screen.x, screen.y);
  });
  ctx.stroke();
  ctx.restore();

  runtime.hazards.forEach((hazard, index) => {
    const { x, y } = worldToScreen(hazard.x, hazard.y, camX, camY);
    if (x < -hazard.radius || x > width + hazard.radius || y < -hazard.radius || y > height + hazard.radius) return;

    const pulse = 0.9 + Math.sin(time * 2.2 + index) * 0.06;
    const field = ctx.createRadialGradient(x, y, 0, x, y, hazard.radius * 1.35);
    field.addColorStop(0, "rgba(251,113,133,0.24)");
    field.addColorStop(0.68, "rgba(251,113,133,0.08)");
    field.addColorStop(1, "rgba(251,113,133,0)");
    ctx.fillStyle = field;
    ctx.beginPath();
    ctx.arc(x, y, hazard.radius * 1.35 * pulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(251,113,133,0.48)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(x, y, hazard.radius, 0, Math.PI * 2);
    ctx.stroke();
  });

  runtime.emitters.forEach((emitter, index) => {
    const active = collectedCount >= emitter.activeFrom;
    const { x, y } = worldToScreen(emitter.x, emitter.y, camX, camY);
    if (x < -64 || x > width + 64 || y < -64 || y > height + 64) return;

    const pulse = 1 + Math.sin(time * 2.4 + emitter.pulseSeed) * 0.08;
    const rangeGradient = ctx.createRadialGradient(x, y, 0, x, y, emitter.range * 0.18);
    rangeGradient.addColorStop(0, active ? "rgba(125,211,252,0.22)" : "rgba(148,163,184,0.08)");
    rangeGradient.addColorStop(1, "rgba(125,211,252,0)");
    ctx.fillStyle = rangeGradient;
    ctx.beginPath();
    ctx.arc(x, y, emitter.range * 0.18 * pulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.sin(time * 0.8 + index) * 0.08);

    const bodyGradient = ctx.createLinearGradient(0, -24, 0, 24);
    bodyGradient.addColorStop(0, active ? "rgba(226,232,240,0.95)" : "rgba(148,163,184,0.72)");
    bodyGradient.addColorStop(1, "rgba(15,23,42,0.92)");
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.moveTo(0, -24);
    ctx.lineTo(18, 12);
    ctx.lineTo(10, 24);
    ctx.lineTo(-10, 24);
    ctx.lineTo(-18, 12);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = active ? "rgba(34,211,238,0.85)" : "rgba(148,163,184,0.5)";
    ctx.beginPath();
    ctx.ellipse(0, -4, 6, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = active ? "rgba(125,211,252,0.75)" : "rgba(148,163,184,0.34)";
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(-20, 2);
    ctx.lineTo(20, 2);
    ctx.moveTo(0, -20);
    ctx.lineTo(0, 26);
    ctx.stroke();

    if (active) {
      ctx.strokeStyle = "rgba(125,211,252,0.55)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, 28 + Math.sin(time * 3.2 + index) * 2, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  });

  runtime.guardians.forEach((guardian, index) => {
    const active = collectedCount >= guardian.activeFrom;
    const { x, y } = worldToScreen(guardian.x, guardian.y, camX, camY);
    if (x < -56 || x > width + 56 || y < -56 || y > height + 56) return;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(time * 1.1 + index);

    const halo = ctx.createRadialGradient(0, 0, 0, 0, 0, 34);
    halo.addColorStop(0, active ? "rgba(217,70,239,0.2)" : "rgba(148,163,184,0.08)");
    halo.addColorStop(1, "rgba(217,70,239,0)");
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(0, 0, 34, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = active ? "rgba(217,70,239,0.58)" : "rgba(148,163,184,0.24)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = active ? "rgba(15,23,42,0.96)" : "rgba(30,41,59,0.72)";
    ctx.beginPath();
    ctx.moveTo(0, -18);
    ctx.lineTo(16, 0);
    ctx.lineTo(0, 18);
    ctx.lineTo(-16, 0);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = active ? "rgba(244,114,182,0.92)" : "rgba(148,163,184,0.55)";
    ctx.beginPath();
    ctx.ellipse(0, 0, 5, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  });

  const extractionVisible = runtime.nodes.every((node) => node.collected);

  runtime.nodes.forEach((node) => {
    const { x, y } = worldToScreen(node.x, node.y, camX, camY);
    if (x < -node.radius || x > width + node.radius || y < -node.radius || y > height + node.radius) return;

    const pulse = 1 + Math.sin(time * 1.8 + node.pulseSeed) * 0.08;
    const glow = ctx.createRadialGradient(x, y, 0, x, y, node.radius * 1.45);
    glow.addColorStop(0, node.collected ? "rgba(16,185,129,0.24)" : `${hexToRgba(accent, 0.24)}`);
    glow.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, node.radius * 1.45 * pulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.lineWidth = 2;
    ctx.strokeStyle = node.collected ? "rgba(16,185,129,0.9)" : "rgba(125,211,252,0.72)";
    ctx.beginPath();
    ctx.arc(x, y, node.radius, 0, Math.PI * 2);
    ctx.stroke();

    if (!node.collected) {
      ctx.strokeStyle = `${hexToRgba(accent, 0.95)}`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(x, y, node.radius + 7, -Math.PI / 2, -Math.PI / 2 + node.progress * Math.PI * 2);
      ctx.stroke();
    }

    ctx.fillStyle = node.collected ? "rgba(167,243,208,0.92)" : "rgba(224,242,254,0.94)";
    ctx.font = "600 12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(node.collected ? `已完成 · ${node.label}` : node.label, x, y + 4);
  });

  if (extractionVisible) {
    const { x, y } = worldToScreen(runtime.extraction.x, runtime.extraction.y, camX, camY);
    const extractionPulse = 1 + Math.sin(time * 2.1) * 0.04;
    const field = ctx.createRadialGradient(x, y, 0, x, y, runtime.extraction.radius * 1.8);
    field.addColorStop(0, "rgba(250,204,21,0.22)");
    field.addColorStop(1, "rgba(250,204,21,0)");
    ctx.fillStyle = field;
    ctx.beginPath();
    ctx.arc(x, y, runtime.extraction.radius * 1.8 * extractionPulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(250,204,21,0.78)";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(x, y, runtime.extraction.radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "rgba(255,251,235,0.96)";
    ctx.font = "700 13px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("回传环", x, y + 4);
  }

  runtime.projectiles.forEach((projectile, index) => {
    const { x, y } = worldToScreen(projectile.x, projectile.y, camX, camY);
    if (x < -40 || x > width + 40 || y < -40 || y > height + 40) return;

    const length = Math.hypot(projectile.vx, projectile.vy) || 1;
    const normalX = projectile.vx / length;
    const normalY = projectile.vy / length;
    const tailX = x - normalX * 20;
    const tailY = y - normalY * 20;

    ctx.strokeStyle = `rgba(125,211,252,${0.52 + Math.sin(time * 8 + projectile.pulseSeed + index) * 0.12})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(tailX, tailY);
    ctx.lineTo(x, y);
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.beginPath();
    ctx.arc(x, y, projectile.radius * 0.54, 0, Math.PI * 2);
    ctx.fill();
  });

  // === Collect burst particles (8-cardinal radial spray) ===
  if (runtime.collectBurst) {
    const cb = runtime.collectBurst;
    const cbScreen = worldToScreen(cb.x, cb.y, camX, camY);
    const elapsed = cb.t;
    const burstAlpha = Math.max(0, 1 - elapsed / 0.95);
    const burstRadius = 14 + elapsed * 70;
    if (burstAlpha > 0) {
      // Outer expanding ring
      ctx.strokeStyle = hexToRgba(cb.color, 0.85 * burstAlpha);
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(cbScreen.x, cbScreen.y, burstRadius, 0, Math.PI * 2);
      ctx.stroke();
      // Inner flash
      const flashGrad = ctx.createRadialGradient(cbScreen.x, cbScreen.y, 0, cbScreen.x, cbScreen.y, 22);
      flashGrad.addColorStop(0, hexToRgba("#ffffff", 0.95 * burstAlpha));
      flashGrad.addColorStop(0.4, hexToRgba(cb.color, 0.6 * burstAlpha));
      flashGrad.addColorStop(1, hexToRgba(cb.color, 0));
      ctx.fillStyle = flashGrad;
      ctx.beginPath();
      ctx.arc(cbScreen.x, cbScreen.y, 26, 0, Math.PI * 2);
      ctx.fill();
      // 8 cardinal sparks
      for (let k = 0; k < 8; k++) {
        const ang = (k / 8) * Math.PI * 2 + elapsed * 0.5;
        const sparkDist = 8 + elapsed * 80;
        const sx = cbScreen.x + Math.cos(ang) * sparkDist;
        const sy = cbScreen.y + Math.sin(ang) * sparkDist;
        const sparkAlpha = Math.max(0, 1 - elapsed / 0.7) * 0.9;
        ctx.fillStyle = hexToRgba(k % 2 === 0 ? "#ffffff" : cb.color, sparkAlpha);
        ctx.beginPath();
        ctx.arc(sx, sy, 1.5 + (1 - elapsed) * 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  const playerScreen = worldToScreen(runtime.player.x, runtime.player.y, camX, camY);
  const playerScreenX = playerScreen.x + shakeDx;
  const playerScreenY = playerScreen.y + shakeDy;
  // === Boost trail (trailing cyan exhaust) ===
  if (runtime.player.boostTimer > 0) {
    for (let t = 1; t <= 5; t++) {
      const trailAlpha = 0.7 - t * 0.13;
      if (trailAlpha <= 0) break;
      const tx = playerScreenX - Math.cos(runtime.player.heading) * t * 6;
      const ty = playerScreenY - Math.sin(runtime.player.heading) * t * 6;
      ctx.fillStyle = hexToRgba(accent, trailAlpha);
      ctx.beginPath();
      ctx.arc(tx, ty, 4 - t * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawPlayer(
    ctx,
    playerScreenX,
    playerScreenY,
    runtime.player.heading,
    runtime.player.boostTimer,
    runtime.player.hitFlash,
    accent,
    time
  );

  decor.particles.forEach((particle, index) => {
    const px = ((particle.x - camX * 0.22 + time * particle.driftX * 36 + width) % width + width) % width;
    const py = ((particle.y - camY * 0.22 + time * particle.driftY * 36 + height) % height + height) % height;
    ctx.fillStyle = `rgba(255,255,255,${particle.alpha + Math.sin(time + index) * 0.04})`;
    ctx.beginPath();
    ctx.arc(px, py, particle.size, 0, Math.PI * 2);
    ctx.fill();
  });

  // === Hit flash red vignette ===
  if (runtime.player.hitFlash > 0.05) {
    const flashAlpha = runtime.player.hitFlash * 0.55;
    const flashGrad = ctx.createRadialGradient(width * 0.5, height * 0.5, width * 0.18, width * 0.5, height * 0.5, width * 0.85);
    flashGrad.addColorStop(0, "rgba(255,0,0,0)");
    flashGrad.addColorStop(0.6, "rgba(248,113,113," + (flashAlpha * 0.4) + ")");
    flashGrad.addColorStop(1, "rgba(190,18,60," + flashAlpha + ")");
    ctx.fillStyle = flashGrad;
    ctx.fillRect(0, 0, width, height);
  }

  const vignette = ctx.createRadialGradient(width * 0.5, height * 0.5, width * 0.16, width * 0.5, height * 0.5, width * 0.78);
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(1,2,7,0.64)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);
}

function drawPlayer(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  heading: number,
  boostTimer: number,
  hitFlash: number,
  accent: string,
  time: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(heading + Math.PI / 2);

  // 1) Shield aura
  const shieldPulse = 30 + Math.sin(time * 4) * 2;
  const shieldGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, shieldPulse);
  shieldGrad.addColorStop(0, hexToRgba(accent, 0.0));
  shieldGrad.addColorStop(0.72, hexToRgba(accent, hitFlash > 0 ? 0.45 : 0.18));
  shieldGrad.addColorStop(1, hexToRgba(accent, 0));
  ctx.fillStyle = shieldGrad;
  ctx.beginPath();
  ctx.arc(0, 0, shieldPulse, 0, Math.PI * 2);
  ctx.fill();

  // 2) Solar wing LEFT (parallel rib panel)
  const wingGradL = ctx.createLinearGradient(-26, -6, -26, 14);
  wingGradL.addColorStop(0, "rgba(30,58,138,0.94)");
  wingGradL.addColorStop(1, "rgba(11,28,77,0.94)");
  ctx.fillStyle = wingGradL;
  roundRect(ctx, -28, -5, 26, 11, 2);
  ctx.fill();
  // wing rib highlights
  ctx.fillStyle = "rgba(125,211,252,0.6)";
  for (let i = 0; i < 3; i++) {
    ctx.fillRect(-27 + i * 8, -4, 4, 9);
  }
  // wing RED LED tip
  ctx.fillStyle = "#fb7185";
  ctx.beginPath();
  ctx.arc(-26, 0, 2, 0, Math.PI * 2);
  ctx.fill();

  // 3) Solar wing RIGHT (mirror)
  const wingGradR = ctx.createLinearGradient(26, -6, 26, 14);
  wingGradR.addColorStop(0, "rgba(30,58,138,0.94)");
  wingGradR.addColorStop(1, "rgba(11,28,77,0.94)");
  ctx.fillStyle = wingGradR;
  roundRect(ctx, 2, -5, 26, 11, 2);
  ctx.fill();
  ctx.fillStyle = "rgba(125,211,252,0.6)";
  for (let i = 0; i < 3; i++) {
    ctx.fillRect(4 + i * 8, -4, 4, 9);
  }
  ctx.fillStyle = "#fb7185";
  ctx.beginPath();
  ctx.arc(26, 0, 2, 0, Math.PI * 2);
  ctx.fill();

  // 4) Main thruster (rear cylinder - drawn first since behind hull)
  ctx.save();
  ctx.translate(0, 14);
  ctx.fillStyle = "#cbd5e1";
  roundRect(ctx, -10, -2, 20, 8, 2);
  ctx.fill();
  ctx.fillStyle = hexToRgba(accent, 0.8);
  roundRect(ctx, -10, 0, 20, 3, 1);
  ctx.fill();
  // thruster torus ring
  ctx.strokeStyle = hexToRgba(accent, 0.95);
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.ellipse(0, 1, 9, 3, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // 5) Hull (main body - hexagonal)
  const hullGrad = ctx.createLinearGradient(0, -22, 0, 14);
  hullGrad.addColorStop(0, "rgba(248,250,252,0.98)");
  hullGrad.addColorStop(0.35, "rgba(148,163,184,0.96)");
  hullGrad.addColorStop(1, "rgba(30,41,59,0.96)");
  ctx.fillStyle = hullGrad;
  ctx.beginPath();
  ctx.moveTo(0, -22);
  ctx.lineTo(11, -10);
  ctx.lineTo(13, 6);
  ctx.lineTo(6, 14);
  ctx.lineTo(-6, 14);
  ctx.lineTo(-13, 6);
  ctx.lineTo(-11, -10);
  ctx.closePath();
  ctx.fill();
  // hull edge highlight
  ctx.strokeStyle = "rgba(255,255,255,0.55)";
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // 6) Cockpit dome (glass canopy)
  const cockpitGrad = ctx.createRadialGradient(0, -10, 1, 0, -10, 8);
  cockpitGrad.addColorStop(0, "rgba(186,230,253,0.98)");
  cockpitGrad.addColorStop(0.5, "rgba(125,211,252,0.92)");
  cockpitGrad.addColorStop(1, "rgba(29,78,216,0.85)");
  ctx.fillStyle = cockpitGrad;
  ctx.beginPath();
  ctx.ellipse(0, -10, 5, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  // cockpit reflection
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.beginPath();
  ctx.ellipse(-1, -12, 1.5, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // 7) Nose accent stripe (front)
  ctx.strokeStyle = hexToRgba(accent, 0.92);
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(0, -22);
  ctx.lineTo(0, -2);
  ctx.stroke();

  // 8) Hull vent stripes (cyan accent strips)
  ctx.fillStyle = hexToRgba(accent, 0.7);
  ctx.fillRect(-2, -4, 4, 1.2);
  ctx.fillRect(-2, 2, 4, 1.2);
  ctx.fillRect(-2, 8, 4, 1.2);

  // 9) Damage / hit flash overlay
  if (hitFlash > 0) {
    ctx.fillStyle = "rgba(251,113,133," + (0.4 + hitFlash * 0.5) + ")";
    ctx.beginPath();
    ctx.arc(0, 0, 30, 0, Math.PI * 2);
    ctx.fill();
  }

  // 10) Thruster flame (rear)
  const thrusterLength = boostTimer > 0 ? 38 : 22 + Math.sin(time * 15) * 3;
  const flameGrad = ctx.createLinearGradient(0, 16, 0, 16 + thrusterLength);
  flameGrad.addColorStop(0, "rgba(255,255,255,0.98)");
  flameGrad.addColorStop(0.25, "rgba(186,230,253,0.95)");
  flameGrad.addColorStop(0.55, hexToRgba(accent, 0.9));
  flameGrad.addColorStop(1, hexToRgba(accent, 0));
  ctx.fillStyle = flameGrad;
  ctx.beginPath();
  ctx.moveTo(-7, 16);
  ctx.lineTo(7, 16);
  ctx.lineTo(0, 16 + thrusterLength);
  ctx.closePath();
  ctx.fill();

  // 11) Side RCS jets when boosting
  if (boostTimer > 0) {
    ctx.fillStyle = hexToRgba("#a855f7", 0.5);
    ctx.beginPath();
    ctx.moveTo(-13, 8);
    ctx.lineTo(-22, 12);
    ctx.lineTo(-13, 13);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(13, 8);
    ctx.lineTo(22, 12);
    ctx.lineTo(13, 13);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}


type MissionTypeChipProps = {
  missionType?: MissionType;
  accent: string;
  planetId: PlanetId;
};

const MISSION_TYPE_META: Record<MissionType, { label: string; subtitle: string; icon: string }> = {
  thermalSurvey:     { label: "热成像勘测",   subtitle: "Thermal Survey",     icon: "🔥" },
  atmosphericDrill:  { label: "酸云垂直钻探", subtitle: "Atmospheric Drill",  icon: "☁️" },
  orbitalScan:       { label: "极地卫星扫描", subtitle: "Orbital Scan",       icon: "🛰️" },
  dustCrossing:      { label: "沙尘带穿越",   subtitle: "Dust Crossing",      icon: "🌪️" },
  gravitySlingshot:  { label: "引力弹弓绕飞", subtitle: "Gravity Slingshot",  icon: "🌌" },
  ringTraversal:     { label: "环缝穿越",     subtitle: "Ring Traversal",     icon: "💫" },
  rollLanding:       { label: "倾轴滚降着陆", subtitle: "Roll Landing",       icon: "🌀" },
  windRun:           { label: "高速风带竞速", subtitle: "Wind Run",           icon: "💨" },
};

function MissionTypeChip({ missionType, accent, planetId }: MissionTypeChipProps) {
  if (!missionType) return null;
  const meta = MISSION_TYPE_META[missionType];
  return (
    <div className="pointer-events-none absolute right-4 top-4 z-10 md:right-6 md:top-6">
      <div
        className="rounded-full border px-4 py-2 backdrop-blur-md"
        style={{
          borderColor: accent + "55",
          background: "rgba(4, 8, 18, 0.55)",
          boxShadow: "0 0 18px " + accent + "33",
        }}
      >
        <div className="flex items-center gap-2 text-[11px]">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: accent, boxShadow: "0 0 8px " + accent }}
          />
          <span className="font-mono text-[10px] uppercase tracking-[0.28em]" style={{ color: accent }}>
            {meta.subtitle}
          </span>
          <span className="text-white/72">{meta.label}</span>
        </div>
      </div>
    </div>
  );
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  camX: number,
  camY: number
) {
  const step = 180;
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.012)";
  ctx.lineWidth = 1;
  ctx.beginPath();

  const startX = -((camX % step) + step) % step;
  const startY = -((camY % step) + step) % step;

  for (let x = startX; x <= width; x += step) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
  }
  for (let y = startY; y <= height; y += step) {
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }
  ctx.stroke();
  ctx.restore();
}

function createRuntime(nodes: SurfaceNode[], hazards: SurfaceHazard[], startedAt: number): MissionRuntime {
  const runtimeNodes = buildRuntimeNodes(nodes);
  const protectedZones = createProtectedZones(runtimeNodes);
  const runtimeHazards = buildRuntimeHazards(hazards, protectedZones);
  const defense = buildRuntimeDefense(runtimeNodes);

  return {
    player: {
      x: START_X,
      y: START_Y,
      vx: 0,
      vy: 0,
      heading: -Math.PI / 2,
      boostTimer: 0,
      boostCooldown: 0,
      checkpointX: START_X,
      checkpointY: START_Y,
      safeElapsed: 0,
      hitFlash: 0,
      shake: 0,
      knockbackX: 0,
      knockbackY: 0,
      knockbackTimer: 0,
    },
    nodes: runtimeNodes,
    hazards: runtimeHazards,
    emitters: defense.emitters,
    guardians: defense.guardians,
    projectiles: [],
    cameraX: 0,
    cameraY: WORLD_HEIGHT - 720,
    extraction: {
      x: SURFACE_WORLD.extractionX,
      y: SURFACE_WORLD.extractionY,
      radius: SURFACE_WORLD.extractionRadius,
    },
    extractionProgress: 0,
    lastHitAt: 0,
    collectBurst: null,
    banner: "地表扫描启动，先锁定第一处信标。",
    bannerUntil: startedAt + 2400,
    completed: false,
  };
}

function createHudSnapshot(runtime: MissionRuntime, integrity: number, now: number, goal: string): HudSnapshot {
  const collectedCount = runtime.nodes.filter((node) => node.collected).length;
  const nextNode = runtime.nodes.find((node) => !node.collected) ?? null;
  const activeNode = runtime.nodes.find((node) => !node.collected && node.progress > 0.001) ?? nextNode;
  const extractionVisible = collectedCount === runtime.nodes.length;
  const scanProgress = activeNode && !extractionVisible ? activeNode.progress : 0;
  const extractionProgress = extractionVisible ? runtime.extractionProgress : 0;
  const activeGuardians = runtime.guardians.filter((guardian) => collectedCount >= guardian.activeFrom);
  const activeEmitters = runtime.emitters.filter((emitter) => collectedCount >= emitter.activeFrom);

  let warningText = "低干扰";
  if (runtime.projectiles.some((projectile) => distance(projectile.x, projectile.y, runtime.player.x, runtime.player.y) < 180)) {
    warningText = "电脉冲逼近";
  } else if (activeGuardians.some((guardian) => distance(guardian.x, guardian.y, runtime.player.x, runtime.player.y) < 180)) {
    warningText = "守卫逼近";
  } else if (activeEmitters.some((emitter) => distance(emitter.x, emitter.y, runtime.player.x, runtime.player.y) < 260)) {
    warningText = "电磁锁定";
  } else if (runtime.hazards.some((hazard) => distance(hazard.x, hazard.y, runtime.player.x, runtime.player.y) < hazard.radius + 120)) {
    warningText = "风暴区";
  }

  const objectiveText = extractionVisible
    ? extractionProgress > 0
      ? "保持稳定，正在回传全部样本。"
      : "前往金色回传环并长按空格上传样本。"
    : activeNode && activeNode.progress > 0.04
      ? `保持稳定，扫描「${activeNode.label}」`
      : nextNode
        ? `前往「${nextNode.label}」完成本轮扫描。`
        : goal;

  const hintText = extractionVisible
    ? "回传环附近会有最终火力压制，进入后尽量不要离开光圈。"
    : warningText === "电脉冲逼近"
      ? "向侧面切开火线，不要长时间停在电磁塔的正前方。"
      : warningText === "守卫逼近"
        ? "先绕到守卫外圈再回切信标，贴身硬扫会更危险。"
        : activeNode && activeNode.progress > 0
          ? "长按空格保持扫描，离开扫描圈后进度会缓慢回退。"
          : "Shift 可做短促冲刺，优先沿虚线路径推进到下一处信标。";

  return {
    collectedCount,
    integrity,
    banner: now <= runtime.bannerUntil ? runtime.banner : "",
    scanLabel: activeNode?.label ?? "",
    scanProgress,
    extractionVisible,
    extractionProgress,
    objectiveText,
    hintText,
    boostReady: runtime.player.boostCooldown <= 0.01,
    uploadText: extractionVisible
      ? extractionProgress >= 1
        ? "完成"
        : extractionProgress > 0
          ? "上传中"
          : "待上传"
      : `${runtime.nodes.length - collectedCount} 处待扫`,
    statusText: `信标 ${collectedCount}/${runtime.nodes.length}`,
    warningText,
  };
}

function createDecor(seedKey: string): MissionDecor {
  const rand = mulberry32(hashString(seedKey));

  return {
    stars: Array.from({ length: 90 }, () => ({
      x: rand(),
      y: rand(),
      size: 0.8 + rand() * 1.6,
      alpha: 0.18 + rand() * 0.35,
    })),
    nebulas: Array.from({ length: 11 }, () => ({
      x: rand(),
      y: rand(),
      width: 70 + rand() * 110,
      height: 18 + rand() * 42,
      alpha: 0.02 + rand() * 0.04,
    })),
    craters: Array.from({ length: 6 }, () => ({
      x: 80 + rand() * (WORLD_WIDTH - 160),
      y: 80 + rand() * (WORLD_HEIGHT - 160),
      radius: 38 + rand() * 92,
      alpha: 0.05 + rand() * 0.05, depth: 0.08 + rand() * 0.08,
    })),
    ridges: Array.from({ length: 4 }, () => ({
      x: 120 + rand() * (WORLD_WIDTH - 240),
      y: 120 + rand() * (WORLD_HEIGHT - 240),
      width: 80 + rand() * 140, height: 12 + rand() * 22, rotation: rand() * Math.PI, alpha: 0.05 + rand() * 0.04,
    })),
    debris: Array.from({ length: 6 }, () => ({
      x: 100 + rand() * (WORLD_WIDTH - 200),
      y: 100 + rand() * (WORLD_HEIGHT - 200),
      width: 14 + rand() * 24, height: 4 + rand() * 8, rotation: rand() * Math.PI, alpha: 0.06 + rand() * 0.06,
    })),
    particles: Array.from({ length: 48 }, () => ({
      x: rand() * 1200,
      y: rand() * 760,
      size: 0.6 + rand() * 2.1,
      driftX: -0.35 + rand() * 0.7,
      driftY: -0.25 + rand() * 0.5,
      alpha: 0.08 + rand() * 0.14,
    })),
  };
}

function HudPill({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-[11px] backdrop-blur-sm">
      <span className="uppercase tracking-[0.24em] text-white/46">{label}</span>
      <span className={tone}>{value}</span>
    </div>
  );
}

function createInitialHud(goal: string, totalNodes: number): HudSnapshot {
  return {
    collectedCount: 0,
    integrity: 100,
    banner: "地表扫描启动，先锁定第一处信标。",
    scanLabel: "",
    scanProgress: 0,
    extractionVisible: false,
    extractionProgress: 0,
    objectiveText: "锁定第一处地表信标。",
    hintText: goal,
    boostReady: true,
    uploadText: "待命",
    statusText: `信标 0/${totalNodes}`,
    warningText: "低干扰",
  };
}

function worldToScreen(x: number, y: number, camX: number, camY: number) {
  return { x: x - camX, y: y - camY };
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace("#", "");
  const full = normalized.length === 3
    ? normalized.split("").map((value) => value + value).join("")
    : normalized.padEnd(6, "0");
  const bigint = Number.parseInt(full, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function hashString(input: string) {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index);
    hash |= 0;
  }
  return hash >>> 0;
}

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function isSameHud(a: HudSnapshot, b: HudSnapshot) {
  return (
    a.collectedCount === b.collectedCount &&
    a.integrity === b.integrity &&
    a.banner === b.banner &&
    a.scanLabel === b.scanLabel &&
    Math.abs(a.scanProgress - b.scanProgress) < 0.01 &&
    a.extractionVisible === b.extractionVisible &&
    Math.abs(a.extractionProgress - b.extractionProgress) < 0.01 &&
    a.objectiveText === b.objectiveText &&
    a.hintText === b.hintText &&
    a.boostReady === b.boostReady &&
    a.uploadText === b.uploadText &&
    a.statusText === b.statusText &&
    a.warningText === b.warningText
  );
}

function setMissionBanner(runtime: MissionRuntime, message: string, now: number, duration = 2200) {
  runtime.banner = message;
  runtime.bannerUntil = now + duration;
}

function clearFinishTimer(timerRef: React.MutableRefObject<number | null>) {
  if (timerRef.current) {
    window.clearTimeout(timerRef.current);
    timerRef.current = null;
  }
}

function asThreat(id: string, label: string, x: number, y: number, radius: number): RuntimeHazard {
  return {
    id,
    label,
    baseX: x,
    baseY: y,
    x,
    y,
    radius,
    amplitude: 0,
    speed: 0,
    axis: "x",
    phase: 0,
  };
}
