"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { planetAssetCatalog } from "@/lib/play/assetCatalog";
import type { PlanetId, SurfaceHazard, SurfaceNode } from "@/lib/play/missionData";
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
  now,
}: {
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  runtime: MissionRuntime;
  texture: HTMLImageElement | null;
  decor: MissionDecor;
  accent: string;
  now: number;
}) {
  const width = canvas.clientWidth || canvas.width;
  const height = canvas.clientHeight || canvas.height;
  const time = now * 0.001;
  const collectedCount = runtime.nodes.filter((node) => node.collected).length;

  ctx.clearRect(0, 0, width, height);

  const bg = ctx.createLinearGradient(0, 0, 0, height);
  bg.addColorStop(0, "#070b1a");
  bg.addColorStop(0.55, "#040812");
  bg.addColorStop(1, "#02040b");
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

  const camX = runtime.cameraX;
  const camY = runtime.cameraY;

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

  const playerScreen = worldToScreen(runtime.player.x, runtime.player.y, camX, camY);
  drawPlayer(
    ctx,
    playerScreen.x,
    playerScreen.y,
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

  ctx.fillStyle = hitFlash > 0 ? "rgba(251,113,133,0.28)" : `${hexToRgba(accent, 0.18)}`;
  ctx.beginPath();
  ctx.arc(0, 0, 34 + Math.sin(time * 4) * 2, 0, Math.PI * 2);
  ctx.fill();

  const hull = ctx.createLinearGradient(0, -26, 0, 24);
  hull.addColorStop(0, "rgba(226,232,240,0.96)");
  hull.addColorStop(0.42, "rgba(51,65,85,0.96)");
  hull.addColorStop(1, "rgba(8,15,28,0.96)");
  ctx.fillStyle = hull;
  ctx.beginPath();
  ctx.moveTo(0, -24);
  ctx.lineTo(14, -8);
  ctx.lineTo(18, 14);
  ctx.lineTo(8, 20);
  ctx.lineTo(-8, 20);
  ctx.lineTo(-18, 14);
  ctx.lineTo(-14, -8);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "rgba(125,211,252,0.95)";
  ctx.beginPath();
  ctx.ellipse(0, -6, 6, 11, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(148,163,184,0.92)";
  ctx.beginPath();
  ctx.moveTo(-22, 10);
  ctx.lineTo(-7, 2);
  ctx.lineTo(-3, 16);
  ctx.lineTo(-16, 18);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(22, 10);
  ctx.lineTo(7, 2);
  ctx.lineTo(3, 16);
  ctx.lineTo(16, 18);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = hitFlash > 0 ? "rgba(251,113,133,0.94)" : "rgba(226,232,240,0.82)";
  ctx.lineWidth = 1.4;
  ctx.stroke();

  const thrusterLength = boostTimer > 0 ? 32 : 18 + Math.sin(time * 15) * 3;
  const thrusterGradient = ctx.createLinearGradient(0, 18, 0, 18 + thrusterLength);
  thrusterGradient.addColorStop(0, "rgba(255,255,255,0.96)");
  thrusterGradient.addColorStop(0.3, `${hexToRgba(accent, 0.94)}`);
  thrusterGradient.addColorStop(1, "rgba(34,211,238,0)");
  ctx.fillStyle = thrusterGradient;
  ctx.beginPath();
  ctx.moveTo(-6, 16);
  ctx.lineTo(6, 16);
  ctx.lineTo(0, 18 + thrusterLength);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  camX: number,
  camY: number
) {
  const step = 80;
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.03)";
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
    craters: Array.from({ length: 22 }, () => ({
      x: 80 + rand() * (WORLD_WIDTH - 160),
      y: 80 + rand() * (WORLD_HEIGHT - 160),
      radius: 38 + rand() * 92,
      alpha: 0.08 + rand() * 0.08,
      depth: 0.18 + rand() * 0.18,
    })),
    ridges: Array.from({ length: 14 }, () => ({
      x: 120 + rand() * (WORLD_WIDTH - 240),
      y: 120 + rand() * (WORLD_HEIGHT - 240),
      width: 120 + rand() * 260,
      height: 24 + rand() * 44,
      rotation: rand() * Math.PI,
      alpha: 0.12 + rand() * 0.08,
    })),
    debris: Array.from({ length: 20 }, () => ({
      x: 100 + rand() * (WORLD_WIDTH - 200),
      y: 100 + rand() * (WORLD_HEIGHT - 200),
      width: 26 + rand() * 56,
      height: 8 + rand() * 18,
      rotation: rand() * Math.PI,
      alpha: 0.12 + rand() * 0.12,
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
