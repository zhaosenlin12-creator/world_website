"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Props = {
  active: boolean;
  accent: string;
  groundColor: string;
  onCollect: () => void;
  onHazard: () => void;
  onComplete: () => void;
  onVoiceCue?: (cue: "fragileWarning" | "respawn" | "sample") => void;
};

type PlanetKey =
  | "mercury"
  | "venus"
  | "earth"
  | "mars"
  | "jupiter"
  | "saturn"
  | "uranus"
  | "neptune";

type Phase = "ready" | "active" | "touchdown" | "complete";
type PlatformKind = "dock" | "fragile" | "rock" | "landing";

type Platform = {
  id: string;
  kind: PlatformKind;
  baseX: number;
  x: number;
  y: number;
  w: number;
  h: number;
  driftAmp: number;
  driftSpeed: number;
  driftPhase: number;
  angle: number;
  spin: number;
  seed: number;
  checkpoint?: boolean;
  crumbleAt?: number;
  broken?: boolean;
};

type HazardMeteor = {
  id: string;
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  r: number;
  driftAmp: number;
  driftSpeed: number;
  driftPhase: number;
  angle: number;
  spin: number;
  heat: number;
};

type Orb = {
  id: string;
  x: number;
  y: number;
  r: number;
  collected: boolean;
  phase: number;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
};

type Star = {
  x: number;
  y: number;
  size: number;
  alpha: number;
  speed: number;
};

type DriftLine = {
  x: number;
  y: number;
  len: number;
  alpha: number;
  speed: number;
};

type SkyDebris = {
  x: number;
  y: number;
  size: number;
  alpha: number;
  speed: number;
  parallax: number;
  angle: number;
};

type Player = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  onGround: boolean;
  coyote: number;
  facing: 1 | -1;
  respawning: boolean;
  platformId: string | null;
};

type Theme = {
  name: string;
  skyTop: string;
  skyBottom: string;
  haze: string;
  planetLight: string;
  planetDark: string;
  dust: string;
};

type HudState = {
  stage: string;
  stageDetail: string;
  distance: number;
  collected: number;
  total: number;
  stability: number;
  progress: number;
};

type LevelState = {
  platforms: Platform[];
  hazards: HazardMeteor[];
  orbs: Orb[];
  landingY: number;
  landingX: number;
  worldBottom: number;
};

const VIEW_W = 1600;
const VIEW_H = 900;
const PLAYER_W = 58;
const PLAYER_H = 70;
const GRAVITY = 2550;
const RUN_ACCEL = 2200;
const AIR_ACCEL = 1500;
const MAX_RUN_SPEED = 460;
const JUMP_SPEED = -1040;
const RESPAWN_DELAY_MS = 760;
const COMPLETE_DELAY_MS = 700;
const READY_DELAY_MS = 1100;
const JUMP_BUFFER_MS = 160;
const COYOTE_TIME = 0.12;
const HUD_INTERVAL_MS = 90;

const PLANET_THEMES: Record<PlanetKey, Theme> = {
  mercury: { name: "水星", skyTop: "#07060d", skyBottom: "#1a1624", haze: "#c4b5fd", planetLight: "#cbd5e1", planetDark: "#52525b", dust: "#a1a1aa" },
  venus: { name: "金星", skyTop: "#120405", skyBottom: "#341109", haze: "#fb923c", planetLight: "#fed7aa", planetDark: "#9a3412", dust: "#fdba74" },
  earth: { name: "地球", skyTop: "#020817", skyBottom: "#0b1e4d", haze: "#38bdf8", planetLight: "#7dd3fc", planetDark: "#1d4ed8", dust: "#93c5fd" },
  mars: { name: "火星", skyTop: "#090304", skyBottom: "#2f0f0c", haze: "#f97316", planetLight: "#fdba74", planetDark: "#9a3412", dust: "#fb923c" },
  jupiter: { name: "木星", skyTop: "#08060d", skyBottom: "#27160c", haze: "#f59e0b", planetLight: "#fde68a", planetDark: "#92400e", dust: "#fcd34d" },
  saturn: { name: "土星", skyTop: "#09080a", skyBottom: "#2a210f", haze: "#facc15", planetLight: "#fef3c7", planetDark: "#a16207", dust: "#fde68a" },
  uranus: { name: "天王星", skyTop: "#021014", skyBottom: "#073042", haze: "#22d3ee", planetLight: "#a5f3fc", planetDark: "#0e7490", dust: "#67e8f9" },
  neptune: { name: "海王星", skyTop: "#040718", skyBottom: "#101a4d", haze: "#818cf8", planetLight: "#a5b4fc", planetDark: "#3730a3", dust: "#93c5fd" }
};

const STAGE_LABELS = [
  { max: 0.22, title: "姿态锁定", detail: "站稳飞船残骸，确认下降姿态" },
  { max: 0.5, title: "陨石链路", detail: "沿移动陨石继续向下转移" },
  { max: 0.82, title: "碎裂坠层", detail: "脆弱陨石会崩裂，必须继续下落" },
  { max: 1.01, title: "终端着陆", detail: "对准发光着陆环，完成最后减速" }
];

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function mix(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function noise(seed: number, index: number) {
  const value = Math.sin(seed * 127.1 + index * 311.7) * 43758.5453123;
  return value - Math.floor(value);
}

function hexToRgba(input: string, alpha: number) {
  const color = input.trim();
  if (color.startsWith("#")) {
    const hex = color.slice(1);
    if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    if (hex.length >= 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
  }
  return `rgba(255, 255, 255, ${alpha})`;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function makeTheme(planetId: PlanetKey | null, accent: string, groundColor: string): Theme {
  if (planetId && PLANET_THEMES[planetId]) return PLANET_THEMES[planetId];
  return {
    name: "目标行星",
    skyTop: "#02010a",
    skyBottom: "#08152f",
    haze: accent,
    planetLight: accent,
    planetDark: groundColor,
    dust: accent
  };
}

function usePlatformerSound() {
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || ctxRef.current) return;
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    if (Ctx) ctxRef.current = new Ctx();
  }, []);

  const playTone = useCallback((freq: number, dur: number, type: OscillatorType, vol: number, sweepTo?: number) => {
    if (!ctxRef.current) return;
    const ctx = ctxRef.current;
    try {
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
      if (typeof sweepTo === "number") {
        oscillator.frequency.exponentialRampToValueAtTime(Math.max(50, sweepTo), ctx.currentTime + dur);
      }
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start();
      oscillator.stop(ctx.currentTime + dur);
    } catch {}
  }, []);

  return useMemo(() => ({
    jump() {
      playTone(360, 0.12, "triangle", 0.06, 520);
    },
    land() {
      playTone(180, 0.07, "sine", 0.05, 140);
    },
    collect() {
      playTone(760, 0.08, "sine", 0.08, 980);
      setTimeout(() => playTone(1180, 0.12, "triangle", 0.06, 1360), 50);
    },
    hazard() {
      playTone(220, 0.16, "sawtooth", 0.08, 130);
      setTimeout(() => playTone(160, 0.22, "triangle", 0.06, 110), 80);
    },
    touchdown() {
      [420, 560, 740, 980].forEach((freq, index) => {
        setTimeout(() => playTone(freq, 0.18, "sine", 0.08, freq * 1.1), index * 90);
      });
    }
  }), [playTone]);
}

function createPlatform(
  id: string,
  kind: PlatformKind,
  x: number,
  y: number,
  w: number,
  h: number,
  driftAmp: number,
  driftSpeed: number,
  driftPhase: number,
  seed: number,
  checkpoint?: boolean
): Platform {
  return {
    id,
    kind,
    baseX: x,
    x,
    y,
    w,
    h,
    driftAmp,
    driftSpeed,
    driftPhase,
    angle: 0,
    spin: rand(-0.25, 0.25),
    seed,
    checkpoint
  };
}

function createHazard(id: string, x: number, y: number, r: number, driftAmp: number, driftSpeed: number, driftPhase: number, heat: number): HazardMeteor {
  return {
    id,
    baseX: x,
    baseY: y,
    x,
    y,
    r,
    driftAmp,
    driftSpeed,
    driftPhase,
    angle: 0,
    spin: rand(-0.9, 0.9),
    heat
  };
}

function buildLevel(): LevelState {
  const platforms: Platform[] = [
    createPlatform("dock", "dock", 170, 220, 360, 54, 18, 0.42, 0.1, 0.31, true),
    createPlatform("rock-1", "rock", 560, 470, 200, 56, 28, 0.76, 0.2, 0.48, true),
    createPlatform("fragile-1", "fragile", 1010, 710, 188, 52, 22, 0.92, 0.55, 0.84),
    createPlatform("rock-2", "rock", 760, 930, 176, 52, 34, 0.88, 0.34, 1.23, true),
    createPlatform("rock-3", "rock", 360, 1170, 226, 60, 18, 0.66, 0.42, 1.61, true),
    createPlatform("rock-4", "rock", 980, 1430, 182, 54, 30, 0.73, 0.38, 2.12, true),
    createPlatform("fragile-2", "fragile", 620, 1710, 168, 48, 24, 0.94, 0.76, 2.56),
    createPlatform("rock-5", "rock", 270, 1970, 220, 56, 26, 0.7, 0.28, 3.05, true),
    createPlatform("rock-6", "rock", 1000, 2250, 210, 58, 16, 0.52, 0.18, 3.44, true),
    createPlatform("landing", "landing", 630, 2540, 420, 72, 10, 0.2, 0.12, 4.01, true)
  ];

  const hazards: HazardMeteor[] = [
    createHazard("hazard-1", 860, 610, 42, 140, 1.4, 0.5, 0.85),
    createHazard("hazard-2", 520, 1050, 48, 180, 1.2, 1.2, 0.9),
    createHazard("hazard-3", 1110, 1320, 40, 120, 1.6, 2.1, 0.72),
    createHazard("hazard-4", 780, 1600, 44, 150, 1.1, 2.8, 0.88),
    createHazard("hazard-5", 460, 2140, 50, 170, 1.45, 3.6, 0.94)
  ];

  const orbs: Orb[] = [
    { id: "orb-1", x: 655, y: 380, r: 16, collected: false, phase: Math.PI * 0.2 },
    { id: "orb-2", x: 840, y: 860, r: 16, collected: false, phase: Math.PI * 0.6 },
    { id: "orb-3", x: 1115, y: 1365, r: 16, collected: false, phase: Math.PI * 1.1 },
    { id: "orb-4", x: 1100, y: 2200, r: 16, collected: false, phase: Math.PI * 1.6 }
  ];

  return {
    platforms,
    hazards,
    orbs,
    landingY: 2540,
    landingX: 840,
    worldBottom: 3000
  };
}

export default function LandingPlatformer({
  active,
  accent,
  groundColor,
  onCollect,
  onHazard,
  onComplete,
  onVoiceCue
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sfx = usePlatformerSound();
  const levelRef = useRef<LevelState>(buildLevel());
  const playerRef = useRef<Player>({
    x: 340,
    y: 220,
    vx: 0,
    vy: 0,
    onGround: true,
    coyote: COYOTE_TIME,
    facing: 1,
    respawning: false,
    platformId: "dock"
  });
  const keysRef = useRef<Record<string, boolean>>({});
  const phaseRef = useRef<Phase>("ready");
  const cameraYRef = useRef(0);
  const starsRef = useRef<Star[]>([]);
  const driftsRef = useRef<DriftLine[]>([]);
  const skyDebrisRef = useRef<SkyDebris[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const prevGroundRef = useRef(true);
  const checkpointRef = useRef({ x: 340, y: 220, platformId: "dock" });
  const jumpQueuedUntilRef = useRef(0);
  const lastHazardRef = useRef(0);
  const lastHudRef = useRef(0);
  const lastTouchRef = useRef(0);
  const rafRef = useRef(0);
  const readyTimerRef = useRef<number | null>(null);
  const respawnTimerRef = useRef<number | null>(null);
  const completeTimerRef = useRef<number | null>(null);
  const bannerTimerRef = useRef<number | null>(null);
  const planetIdRef = useRef<PlanetKey>("earth");
  const completedRef = useRef(false);
  const touchdownRef = useRef(false);
  const fragileHintShownRef = useRef(false);

  const [phase, setPhase] = useState<Phase>("ready");
  const [planetName, setPlanetName] = useState("地球");
  const [banner, setBanner] = useState("姿态锁正在解除");
  const [hud, setHud] = useState<HudState>({
    stage: "姿态锁定",
    stageDetail: "站稳飞船残骸，确认下降姿态",
    distance: 0,
    collected: 0,
    total: 4,
    stability: 100,
    progress: 0
  });

  const theme = useMemo(() => makeTheme(active ? planetIdRef.current : null, accent, groundColor), [active, accent, groundColor]);

  const pushBanner = useCallback((text: string, sticky = false) => {
    setBanner(text);
    if (bannerTimerRef.current) {
      window.clearTimeout(bannerTimerRef.current);
      bannerTimerRef.current = null;
    }
    if (!sticky) {
      bannerTimerRef.current = window.setTimeout(() => {
        setBanner("");
        bannerTimerRef.current = null;
      }, 1500);
    }
  }, []);

  const clearTimers = useCallback(() => {
    if (readyTimerRef.current) {
      window.clearTimeout(readyTimerRef.current);
      readyTimerRef.current = null;
    }
    if (respawnTimerRef.current) {
      window.clearTimeout(respawnTimerRef.current);
      respawnTimerRef.current = null;
    }
    if (completeTimerRef.current) {
      window.clearTimeout(completeTimerRef.current);
      completeTimerRef.current = null;
    }
    if (bannerTimerRef.current) {
      window.clearTimeout(bannerTimerRef.current);
      bannerTimerRef.current = null;
    }
  }, []);

  const spawnBurst = useCallback((x: number, y: number, color: string, count: number, spread = 180) => {
    for (let index = 0; index < count; index += 1) {
      particlesRef.current.push({
        x,
        y,
        vx: rand(-spread, spread),
        vy: rand(-260, 80),
        life: rand(0.45, 0.9),
        maxLife: 0.9,
        size: rand(2.5, 8),
        color
      });
    }
  }, []);

  const resetLevel = useCallback(() => {
    const id = ((typeof window !== "undefined" && (window as any).__landingPlanetId) || "earth") as PlanetKey;
    planetIdRef.current = PLANET_THEMES[id] ? id : "earth";
    const currentTheme = makeTheme(planetIdRef.current, accent, groundColor);
    setPlanetName(currentTheme.name);
    levelRef.current = buildLevel();
    playerRef.current = {
      x: 340,
      y: 220,
      vx: 0,
      vy: 0,
      onGround: true,
      coyote: COYOTE_TIME,
      facing: 1,
      respawning: false,
      platformId: "dock"
    };
    checkpointRef.current = { x: 340, y: 220, platformId: "dock" };
    starsRef.current = Array.from({ length: 90 }, () => ({
      x: rand(0, VIEW_W),
      y: rand(0, VIEW_H),
      size: rand(0.8, 2.8),
      alpha: rand(0.16, 0.92),
      speed: rand(0.4, 1.4)
    }));
    driftsRef.current = Array.from({ length: 18 }, () => ({
      x: rand(-120, VIEW_W + 120),
      y: rand(-120, VIEW_H + 120),
      len: rand(70, 190),
      alpha: rand(0.08, 0.24),
      speed: rand(1, 2.8)
    }));
    skyDebrisRef.current = Array.from({ length: 9 }, () => ({
      x: rand(-140, VIEW_W + 140),
      y: rand(-120, VIEW_H + 220),
      size: rand(20, 68),
      alpha: rand(0.08, 0.18),
      speed: rand(0.8, 1.8),
      parallax: rand(0.16, 0.42),
      angle: rand(-0.8, 0.8)
    }));
    particlesRef.current = [];
    cameraYRef.current = 0;
    prevGroundRef.current = true;
    completedRef.current = false;
    touchdownRef.current = false;
    fragileHintShownRef.current = false;
    lastHazardRef.current = 0;
    lastHudRef.current = 0;
    lastTouchRef.current = 0;
    jumpQueuedUntilRef.current = 0;
    keysRef.current = {};
    phaseRef.current = "ready";
    setPhase("ready");
    setBanner("残骸下降通道已开启，准备二次制动");
    setHud({
      stage: "姿态锁定",
      stageDetail: "站稳飞船残骸，确认下降姿态",
      distance: Math.round((levelRef.current.landingY - 220) / 2.6),
      collected: 0,
      total: levelRef.current.orbs.length,
      stability: 100,
      progress: 0
    });
  }, [accent, groundColor]);

  const triggerRespawn = useCallback((reason: "hazard" | "void") => {
    const player = playerRef.current;
    if (player.respawning || phaseRef.current !== "active" || completedRef.current) return;
    player.respawning = true;
    player.vx = 0;
    player.vy = 0;
    player.onGround = false;
    player.platformId = null;

    const now = performance.now();
    if (now - lastHazardRef.current > 420) {
      lastHazardRef.current = now;
      sfx.hazard();
      onHazard();
    }

    onVoiceCue?.("respawn");
    pushBanner(reason === "hazard" ? "碰撞警报，正在回收到最近残骸" : "偏离下降走廊，返回上一安全落点");
    spawnBurst(player.x, player.y - PLAYER_H * 0.5, reason === "hazard" ? "#fb923c" : accent, 24, 220);

    respawnTimerRef.current = window.setTimeout(() => {
      const checkpoint = checkpointRef.current;
      playerRef.current = {
        x: checkpoint.x,
        y: checkpoint.y,
        vx: 0,
        vy: 0,
        onGround: true,
        coyote: COYOTE_TIME,
        facing: player.facing,
        respawning: false,
        platformId: checkpoint.platformId
      };
      prevGroundRef.current = true;
    }, RESPAWN_DELAY_MS);
  }, [accent, onHazard, onVoiceCue, pushBanner, sfx, spawnBurst]);

  const triggerTouchdown = useCallback(() => {
    if (touchdownRef.current || completedRef.current) return;
    touchdownRef.current = true;
    completedRef.current = true;
    phaseRef.current = "touchdown";
    setPhase("touchdown");
    pushBanner("着陆缓冲完成，正在接入地表任务", true);
    sfx.touchdown();

    const player = playerRef.current;
    player.vx = 0;
    player.vy = 0;
    player.onGround = true;

    spawnBurst(levelRef.current.landingX, levelRef.current.landingY - 20, accent, 32, 240);

    completeTimerRef.current = window.setTimeout(() => {
      if (!completedRef.current) return;
      phaseRef.current = "complete";
      setPhase("complete");
      onComplete();
    }, COMPLETE_DELAY_MS);
  }, [accent, onComplete, pushBanner, sfx, spawnBurst]);

  useEffect(() => {
    if (!active) {
      cancelAnimationFrame(rafRef.current);
      clearTimers();
      return;
    }

    resetLevel();
    readyTimerRef.current = window.setTimeout(() => {
      phaseRef.current = "active";
      setPhase("active");
      pushBanner("前方陨石残骸会漂移和碎裂，持续向下转移");
    }, READY_DELAY_MS);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimers();
    };
  }, [active, clearTimers, pushBanner, resetLevel]);

  useEffect(() => {
    if (!active) return;

    const isJumpKey = (key: string) => key === " " || key === "w" || key === "arrowup";
    const isControlKey = (key: string) =>
      key === " " || key === "w" || key === "a" || key === "d" || key === "arrowup" || key === "arrowleft" || key === "arrowright";

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (isControlKey(key)) event.preventDefault();
      keysRef.current[key] = true;
      if (isJumpKey(key)) jumpQueuedUntilRef.current = performance.now() + JUMP_BUFFER_MS;
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      keysRef.current[event.key.toLowerCase()] = false;
    };

    window.addEventListener("keydown", handleKeyDown, { passive: false });
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [active]);

  const updateHud = useCallback((now: number) => {
    if (now - lastHudRef.current < HUD_INTERVAL_MS) return;
    lastHudRef.current = now;

    const player = playerRef.current;
    const level = levelRef.current;
    const progress = clamp((player.y - 220) / (level.landingY - 220), 0, 1);
    const stageInfo = STAGE_LABELS.find((item) => progress <= item.max) || STAGE_LABELS[STAGE_LABELS.length - 1];
    const collected = level.orbs.filter((orb) => orb.collected).length;
    const stability = clamp(Math.round(100 - Math.abs(player.vx) * 0.08 - Math.abs(player.vy) * 0.03), 28, 100);

    setHud({
      stage: stageInfo.title,
      stageDetail: stageInfo.detail,
      distance: Math.max(0, Math.round((level.landingY - player.y) / 2.45)),
      collected,
      total: level.orbs.length,
      stability,
      progress
    });
  }, []);

  const stepWorld = useCallback((dt: number, now: number) => {
    const player = playerRef.current;
    const level = levelRef.current;
    const keys = keysRef.current;

    for (const platform of level.platforms) {
      if (platform.broken) continue;
      platform.x = platform.baseX + Math.sin(now * 0.001 * platform.driftSpeed + platform.driftPhase) * platform.driftAmp;
      platform.angle += platform.spin * dt * 0.25;
      if (platform.kind === "fragile" && platform.crumbleAt && now >= platform.crumbleAt) {
        platform.broken = true;
        spawnBurst(platform.x + platform.w * 0.5, platform.y + platform.h * 0.35, "#f59e0b", 20);
        if (player.platformId === platform.id) {
          player.onGround = false;
          player.vy = Math.max(player.vy, 180);
          player.platformId = null;
        }
      }
    }

    for (const hazard of level.hazards) {
      hazard.x = hazard.baseX + Math.sin(now * 0.001 * hazard.driftSpeed + hazard.driftPhase) * hazard.driftAmp;
      hazard.y = hazard.baseY + Math.cos(now * 0.00085 * hazard.driftSpeed + hazard.driftPhase) * 16;
      hazard.angle += hazard.spin * dt;
    }

    for (const orb of level.orbs) {
      if (!orb.collected) orb.phase += dt * 2.4;
    }

    for (const particle of particlesRef.current) {
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vy += 420 * dt;
      particle.life -= dt;
    }
    particlesRef.current = particlesRef.current.filter((particle) => particle.life > 0);

    const targetCameraIdle = clamp(player.y - VIEW_H * 0.26, 0, level.worldBottom - VIEW_H);
    if (phaseRef.current !== "active") {
      cameraYRef.current = mix(cameraYRef.current, targetCameraIdle, 0.12);
      updateHud(now);
      return;
    }

    if (!player.respawning) {
      if (player.onGround) player.coyote = COYOTE_TIME;
      else player.coyote = Math.max(0, player.coyote - dt);

      const moveDir = (keys["d"] || keys["arrowright"] ? 1 : 0) - (keys["a"] || keys["arrowleft"] ? 1 : 0);
      const accel = player.onGround ? RUN_ACCEL : AIR_ACCEL;
      if (moveDir !== 0) {
        player.vx += moveDir * accel * dt;
        player.facing = moveDir > 0 ? 1 : -1;
      } else {
        player.vx *= player.onGround ? 0.82 : 0.95;
      }
      player.vx = clamp(player.vx, -MAX_RUN_SPEED, MAX_RUN_SPEED);

      if (jumpQueuedUntilRef.current > now && (player.onGround || player.coyote > 0)) {
        player.vy = JUMP_SPEED;
        player.onGround = false;
        player.coyote = 0;
        player.platformId = null;
        jumpQueuedUntilRef.current = 0;
        sfx.jump();
      }

      const previousY = player.y;
      player.vy += GRAVITY * dt;
      player.x = clamp(player.x + player.vx * dt, PLAYER_W * 0.5, VIEW_W - PLAYER_W * 0.5);
      player.y += player.vy * dt;

      const playerCenterX = player.x;
      const playerCenterY = player.y - PLAYER_H * 0.58;
      for (const hazard of level.hazards) {
        const dx = playerCenterX - hazard.x;
        const dy = playerCenterY - hazard.y;
        if (Math.hypot(dx, dy) < hazard.r + 26) {
          triggerRespawn("hazard");
          break;
        }
      }

      let landedPlatform: Platform | null = null;
      let landingY = Number.POSITIVE_INFINITY;
      const left = player.x - PLAYER_W * 0.42;
      const right = player.x + PLAYER_W * 0.42;

      for (const platform of level.platforms) {
        if (platform.broken) continue;
        const withinX = right > platform.x + 10 && left < platform.x + platform.w - 10;
        const crossedTop = player.vy >= 0 && previousY <= platform.y + 2 && player.y >= platform.y;
        if (withinX && crossedTop && platform.y < landingY) {
          landedPlatform = platform;
          landingY = platform.y;
        }
      }

      if (!player.respawning && landedPlatform) {
        player.y = landedPlatform.y;
        player.vy = 0;
        player.onGround = true;
        player.platformId = landedPlatform.id;

        if (landedPlatform.checkpoint) {
          checkpointRef.current = {
            x: landedPlatform.x + landedPlatform.w * 0.5,
            y: landedPlatform.y,
            platformId: landedPlatform.id
          };
        }

        if (landedPlatform.kind === "fragile" && !landedPlatform.crumbleAt) {
          landedPlatform.crumbleAt = now + 900;
          if (!fragileHintShownRef.current) {
            fragileHintShownRef.current = true;
            onVoiceCue?.("fragileWarning");
            pushBanner("警告，当前陨石正在碎裂，立即跳向下一个落点");
          }
        }

        if (landedPlatform.kind === "landing") triggerTouchdown();
      } else if (!player.respawning) {
        player.onGround = false;
      }

      if (!prevGroundRef.current && player.onGround && !touchdownRef.current) sfx.land();
      prevGroundRef.current = player.onGround;

      for (const orb of level.orbs) {
        if (orb.collected) continue;
        const orbY = orb.y + Math.sin(orb.phase) * 6;
        const dx = orb.x - playerCenterX;
        const dy = orbY - playerCenterY;
        if (Math.hypot(dx, dy) < orb.r + 28) {
          orb.collected = true;
          spawnBurst(orb.x, orbY, accent, 16, 200);
          pushBanner("能源样本回收成功，推进器响应提升");
          onVoiceCue?.("sample");
          sfx.collect();
          onCollect();
        }
      }

      const touchDistance = Math.abs(level.landingY - player.y);
      if (touchDistance < 8 && now - lastTouchRef.current > 150) {
        lastTouchRef.current = now;
      }

      const voidY = cameraYRef.current + VIEW_H + 220;
      if (!player.respawning && player.y > Math.max(voidY, level.worldBottom + 50)) {
        triggerRespawn("void");
      }
    }

    cameraYRef.current = mix(cameraYRef.current, targetCameraIdle, 0.13);
    updateHud(now);
  }, [accent, onCollect, onVoiceCue, pushBanner, sfx, spawnBurst, triggerRespawn, triggerTouchdown, updateHud]);

  const drawWorld = useCallback((ctx: CanvasRenderingContext2D, now: number) => {
    const level = levelRef.current;
    const player = playerRef.current;
    const cameraY = cameraYRef.current;
    const progress = clamp((player.y - 220) / (level.landingY - 220), 0, 1);
    const descentBoost = clamp((player.vy + 260) / 1200, 0.3, 1.8);

    const bg = ctx.createLinearGradient(0, 0, 0, VIEW_H);
    bg.addColorStop(0, theme.skyTop);
    bg.addColorStop(1, theme.skyBottom);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);

    const haze = ctx.createRadialGradient(VIEW_W * 0.5, VIEW_H * 0.62, 120, VIEW_W * 0.5, VIEW_H * 0.62, VIEW_W * 0.7);
    haze.addColorStop(0, hexToRgba(theme.haze, 0.06 + progress * 0.08));
    haze.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = haze;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);

    for (const star of starsRef.current) {
      const flicker = 0.7 + Math.sin(now * 0.0012 * star.speed + star.x * 0.03) * 0.3;
      ctx.globalAlpha = star.alpha * flicker;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(star.x, star.y, star.size, star.size);
    }
    ctx.globalAlpha = 1;

    for (const drift of driftsRef.current) {
      const driftY = (((drift.y - now * 0.02 * drift.speed * descentBoost) % (VIEW_H + 260)) + (VIEW_H + 260)) % (VIEW_H + 260) - 140;
      ctx.strokeStyle = hexToRgba(theme.dust, drift.alpha);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(drift.x, driftY - drift.len);
      ctx.lineTo(drift.x + mix(-30, 45, progress), driftY);
      ctx.stroke();
    }

    for (const debris of skyDebrisRef.current) {
      const y = (((debris.y - cameraY * debris.parallax - now * 0.018 * debris.speed * descentBoost) % (VIEW_H + 240)) + (VIEW_H + 240)) % (VIEW_H + 240) - 120;
      ctx.save();
      ctx.translate(debris.x, y);
      ctx.rotate(debris.angle + now * 0.0002 * debris.speed);
      ctx.fillStyle = hexToRgba(theme.dust, debris.alpha);
      ctx.beginPath();
      ctx.ellipse(0, 0, debris.size, debris.size * 0.42, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    const planetRadius = mix(210, 610, progress);
    const planetX = mix(VIEW_W * 0.74, VIEW_W * 0.5, progress);
    const planetY = mix(VIEW_H + 340, VIEW_H * 1.02, progress);
    const planetGrad = ctx.createRadialGradient(planetX - planetRadius * 0.18, planetY - planetRadius * 0.22, planetRadius * 0.14, planetX, planetY, planetRadius);
    planetGrad.addColorStop(0, theme.planetLight);
    planetGrad.addColorStop(0.62, theme.planetDark);
    planetGrad.addColorStop(1, "#02010a");
    ctx.fillStyle = planetGrad;
    ctx.beginPath();
    ctx.arc(planetX, planetY, planetRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.2 + progress * 0.18;
    ctx.strokeStyle = hexToRgba(theme.haze, 0.4);
    ctx.lineWidth = 20;
    ctx.beginPath();
    ctx.ellipse(planetX, planetY, planetRadius * 1.08, planetRadius * 0.9, -0.12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;

    ctx.save();
    ctx.translate(0, -cameraY);

    for (let index = 0; index < 4; index += 1) {
      const y = 430 + index * 620;
      ctx.strokeStyle = hexToRgba(theme.haze, 0.06);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(100, y);
      ctx.lineTo(VIEW_W - 100, y);
      ctx.stroke();
    }

    for (const hazard of level.hazards) {
      drawHazardMeteor(ctx, hazard, now);
    }

    for (const platform of level.platforms) {
      if (platform.broken) continue;
      drawPlatform(ctx, platform, now, theme, accent, groundColor);
    }

    for (const orb of level.orbs) {
      if (orb.collected) continue;
      const orbY = orb.y + Math.sin(orb.phase) * 6;
      const glow = ctx.createRadialGradient(orb.x, orbY, 4, orb.x, orbY, orb.r * 2.8);
      glow.addColorStop(0, "#ffffff");
      glow.addColorStop(0.28, accent);
      glow.addColorStop(1, hexToRgba(accent, 0));
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(orb.x, orbY, orb.r * 2.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = hexToRgba(accent, 0.75);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(orb.x, orbY, orb.r, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(orb.x, orbY, orb.r * 0.45, 0, Math.PI * 2);
      ctx.fill();
    }

    if (!player.respawning) drawLander(ctx, player, accent, now);

    for (const particle of particlesRef.current) {
      const alpha = particle.life / particle.maxLife;
      ctx.fillStyle = hexToRgba(particle.color, alpha);
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }, [accent, groundColor, theme]);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.034, (now - last) / 1000);
      last = now;
      stepWorld(dt, now);
      drawWorld(ctx, now);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, drawWorld, stepWorld]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          data-testid="landing-2d"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-40 bg-[radial-gradient(circle_at_center,rgba(2,6,23,0.45),rgba(2,1,10,0.96))] backdrop-blur-[6px]"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.28 }}
            className="relative flex h-full w-full items-center justify-center p-3 md:p-5"
          >
            <div className="relative h-full w-full overflow-hidden rounded-[28px] border border-cyan-400/30 bg-[#04030b] shadow-[0_0_60px_rgba(34,211,238,0.12)]">
              <canvas ref={canvasRef} width={VIEW_W} height={VIEW_H} className="h-full w-full" style={{ display: "block" }} />

              <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-col gap-1.5 px-2 py-1.5 md:flex-row md:items-center md:justify-between md:gap-2 md:px-3 md:py-2">
                <div className="pointer-events-auto flex items-center gap-1.5 overflow-hidden rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-[10px] text-white/75 backdrop-blur-md md:gap-2 md:px-3 md:py-1.5 md:text-[11px]">
                  <span className="font-semibold uppercase tracking-[0.22em] text-cyan-300/85">着陆阶段</span>
                  <span className="font-semibold text-white">{hud.stage}</span>
                </div>
                <div className="pointer-events-auto flex items-center gap-1.5 overflow-hidden rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-[10px] text-white/75 backdrop-blur-md md:gap-2 md:px-3 md:py-1.5 md:text-[11px]">
                  <span className="font-semibold uppercase tracking-[0.22em] text-fuchsia-300/85">{planetName} 着陆窗</span>
                  <span className="font-mono font-semibold tabular-nums text-white">{hud.distance} m</span>
                </div>
              </div>
              <AnimatePresence>
                {!!banner && (
                  <motion.div
                    key={banner}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="pointer-events-none absolute left-1/2 top-[196px] z-20 -translate-x-1/2 rounded-full border border-cyan-400/30 bg-black/38 px-5 py-2 text-sm text-white/90 shadow-[0_0_25px_rgba(34,211,238,0.12)] backdrop-blur-md"
                  >
                    {banner}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="pointer-events-none absolute bottom-3 left-3 right-3 z-10 flex flex-col gap-2 md:bottom-5 md:left-5 md:right-5 md:flex-row md:items-end md:justify-between">
                <div className="rounded-2xl border border-white/10 bg-black/28 px-4 py-3 text-sm text-white/78 backdrop-blur-md">
                  <span className="text-cyan-300">控制：</span>
                  <span>A / D 或 ← / → 横移</span>
                  <span className="mx-2 text-white/30">·</span>
                  <span>空格 / W 脉冲跃升</span>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/28 px-4 py-3 text-sm text-white/78 backdrop-blur-md">
                  <span className="text-amber-300">目标：</span>
                  <span>沿陨石残骸持续下降，避开高速碎石并落入着陆环</span>
                </div>
              </div>

              <AnimatePresence>
                {phase === "ready" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-[radial-gradient(circle_at_center,rgba(5,8,20,0.25),rgba(2,1,10,0.2))]"
                  >
                    <div className="text-center">
                      <div className="mb-3 text-[11px] uppercase tracking-[0.55em] text-amber-300/80">大气层穿越完成</div>
                      <div className="text-3xl font-semibold text-white">切入残骸下降通道</div>
                      <div className="mt-3 text-sm text-white/70">顺着漂移陨石与飞船碎片缓慢下落，最后落入着陆区</div>
                    </div>
                  </motion.div>
                )}

                {phase === "touchdown" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.12),rgba(2,1,10,0.08))]"
                  >
                    <div className="rounded-[28px] border border-cyan-300/30 bg-black/28 px-8 py-6 text-center shadow-[0_0_50px_rgba(34,211,238,0.16)] backdrop-blur-md">
                      <div className="text-[11px] uppercase tracking-[0.45em] text-cyan-300/80">终端确认</div>
                      <div className="mt-2 text-3xl font-semibold text-white">着陆成功</div>
                      <div className="mt-2 text-sm text-white/72">正在打开舱门并接入地表探索任务</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function drawAsteroid(ctx: CanvasRenderingContext2D, width: number, height: number, seed: number, fillA: string, fillB: string, outline: string) {
  const points: Array<{ x: number; y: number }> = [];
  const total = 9;
  for (let index = 0; index < total; index += 1) {
    const angle = (index / total) * Math.PI * 2;
    const rx = width * (0.38 + noise(seed, index) * 0.16);
    const ry = height * (0.42 + noise(seed, index + 20) * 0.18);
    points.push({
      x: Math.cos(angle) * rx,
      y: Math.sin(angle) * ry
    });
  }

  const grad = ctx.createLinearGradient(-width * 0.5, -height * 0.5, width * 0.5, height * 0.5);
  grad.addColorStop(0, fillA);
  grad.addColorStop(1, fillB);
  ctx.fillStyle = grad;
  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = outline;
  ctx.lineWidth = 2.2;
  ctx.stroke();

  for (let index = 0; index < 3; index += 1) {
    const craterX = (noise(seed, index + 60) - 0.5) * width * 0.42;
    const craterY = (noise(seed, index + 70) - 0.5) * height * 0.34;
    const craterR = 7 + noise(seed, index + 80) * 10;
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.beginPath();
    ctx.arc(craterX, craterY, craterR, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPlatform(ctx: CanvasRenderingContext2D, platform: Platform, now: number, theme: Theme, accent: string, groundColor: string) {
  const cx = platform.x + platform.w * 0.5;
  const cy = platform.y + platform.h * 0.5;

  if (platform.kind === "dock") {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(Math.sin(now * 0.0004 + platform.seed) * 0.02);
    const shell = ctx.createLinearGradient(-platform.w * 0.5, -platform.h * 0.5, platform.w * 0.5, platform.h * 0.5);
    shell.addColorStop(0, "rgba(148,163,184,0.95)");
    shell.addColorStop(0.55, "rgba(30,41,59,0.95)");
    shell.addColorStop(1, "rgba(8,15,32,0.95)");
    ctx.fillStyle = shell;
    roundRect(ctx, -platform.w * 0.5, -platform.h * 0.5, platform.w, platform.h, 22);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = hexToRgba(accent, 0.55);
    for (let index = 0; index < 4; index += 1) {
      const lightX = -platform.w * 0.32 + index * platform.w * 0.22;
      roundRect(ctx, lightX, -6, 42, 12, 6);
      ctx.fill();
    }
    ctx.restore();
    return;
  }

  if (platform.kind === "landing") {
    ctx.save();
    ctx.translate(cx, cy);
    const glow = ctx.createRadialGradient(0, 0, 20, 0, 0, platform.w * 0.55);
    glow.addColorStop(0, hexToRgba(accent, 0.35));
    glow.addColorStop(1, hexToRgba(accent, 0));
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.ellipse(0, 0, platform.w * 0.6, platform.h * 1.35, 0, 0, Math.PI * 2);
    ctx.fill();

    const base = ctx.createLinearGradient(-platform.w * 0.5, -platform.h, platform.w * 0.5, platform.h);
    base.addColorStop(0, "rgba(17,24,39,0.95)");
    base.addColorStop(0.5, "rgba(56,78,119,0.95)");
    base.addColorStop(1, "rgba(12,18,32,0.95)");
    ctx.fillStyle = base;
    roundRect(ctx, -platform.w * 0.5, -platform.h * 0.45, platform.w, platform.h * 0.9, 26);
    ctx.fill();

    ctx.strokeStyle = hexToRgba(accent, 0.92);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 0, platform.w * 0.28, platform.h * 0.8, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0, 0, platform.w * 0.42, platform.h * 1.05, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = "bold 18px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("着陆环", 0, -platform.h * 1.05);
    ctx.restore();
    return;
  }

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(platform.angle);
  ctx.shadowColor = platform.kind === "fragile" ? "rgba(244,114,182,0.26)" : hexToRgba(theme.haze, 0.16);
  ctx.shadowBlur = platform.kind === "fragile" ? 18 : 12;

  drawAsteroid(
    ctx,
    platform.w,
    platform.h,
    platform.seed,
    platform.kind === "fragile" ? "rgba(129,140,248,0.96)" : "rgba(148,163,184,0.92)",
    platform.kind === "fragile" ? "rgba(76,29,149,0.96)" : "rgba(51,65,85,0.96)",
    platform.kind === "fragile" ? "rgba(244,114,182,0.45)" : "rgba(255,255,255,0.16)"
  );

  if (platform.kind === "fragile") {
    ctx.strokeStyle = "rgba(255,255,255,0.42)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-platform.w * 0.28, -platform.h * 0.1);
    ctx.lineTo(platform.w * 0.04, platform.h * 0.18);
    ctx.lineTo(platform.w * 0.34, -platform.h * 0.06);
    ctx.stroke();
  }

  if (platform.checkpoint) {
    ctx.fillStyle = hexToRgba(accent, 0.42);
    ctx.beginPath();
    ctx.ellipse(0, platform.h * 0.65, platform.w * 0.18, 8, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawHazardMeteor(ctx: CanvasRenderingContext2D, hazard: HazardMeteor, now: number) {
  ctx.save();
  ctx.translate(hazard.x, hazard.y);
  ctx.rotate(hazard.angle);

  const tail = ctx.createLinearGradient(-hazard.r * 1.4, 0, hazard.r * 1.1, 0);
  tail.addColorStop(0, "rgba(251,146,60,0)");
  tail.addColorStop(0.42, "rgba(251,146,60,0.18)");
  tail.addColorStop(1, "rgba(255,255,255,0.08)");
  ctx.fillStyle = tail;
  ctx.beginPath();
  ctx.ellipse(-hazard.r * 0.9, 0, hazard.r * 2.1, hazard.r * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();

  const fillA = `rgba(${Math.round(255 * hazard.heat)}, 182, 80, 0.96)`;
  const fillB = "rgba(120,44,14,0.96)";
  drawAsteroid(ctx, hazard.r * 2.1, hazard.r * 1.85, hazard.heat * 10 + 2.7, fillA, fillB, "rgba(255,255,255,0.2)");

  ctx.fillStyle = `rgba(255, 210, 120, ${0.3 + Math.sin(now * 0.01 + hazard.heat) * 0.08})`;
  ctx.beginPath();
  ctx.arc(0, 0, hazard.r * 0.32, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawLander(ctx: CanvasRenderingContext2D, player: Player, accent: string, now: number) {
  ctx.save();
  ctx.translate(player.x, player.y - PLAYER_H * 0.58);

  const tilt = clamp(player.vx / MAX_RUN_SPEED, -1, 1) * 0.22;
  ctx.rotate(tilt);

  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath();
  ctx.ellipse(0, PLAYER_H * 0.74, 38, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  const hull = ctx.createLinearGradient(-36, -46, 34, 28);
  hull.addColorStop(0, "#f8fafc");
  hull.addColorStop(0.45, "#cbd5e1");
  hull.addColorStop(1, "#475569");
  ctx.fillStyle = hull;
  roundRect(ctx, -30, -44, 60, 58, 18);
  ctx.fill();
  ctx.strokeStyle = "rgba(15,23,42,0.66)";
  ctx.lineWidth = 2;
  ctx.stroke();

  const glass = ctx.createLinearGradient(-14, -34, 14, -6);
  glass.addColorStop(0, "#93c5fd");
  glass.addColorStop(1, "#1d4ed8");
  ctx.fillStyle = glass;
  roundRect(ctx, -16, -32, 32, 24, 11);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.2)";
  roundRect(ctx, -11, -28, 9, 15, 5);
  ctx.fill();

  ctx.fillStyle = "#64748b";
  ctx.fillRect(-40, -8, 16, 7);
  ctx.fillRect(24, -8, 16, 7);
  ctx.fillRect(-22, 18, 5, 22);
  ctx.fillRect(17, 18, 5, 22);
  ctx.fillRect(-34, 34, 20, 5);
  ctx.fillRect(14, 34, 20, 5);
  ctx.fillRect(-6, 8, 12, 10);

  ctx.fillStyle = hexToRgba(accent, 0.6);
  roundRect(ctx, -22, 6, 8, 10, 4);
  ctx.fill();
  roundRect(ctx, 14, 6, 8, 10, 4);
  ctx.fill();

  const thrusterPower = player.onGround ? 0.12 : clamp(Math.abs(player.vy) / 680 + 0.24, 0.25, 1);
  const flameHeight = 18 + thrusterPower * 34 + Math.sin(now * 0.03) * 3;
  const flameGrad = ctx.createLinearGradient(0, 16, 0, 16 + flameHeight);
  flameGrad.addColorStop(0, "#ffffff");
  flameGrad.addColorStop(0.26, "#67e8f9");
  flameGrad.addColorStop(1, hexToRgba(accent, 0));
  ctx.fillStyle = flameGrad;
  ctx.beginPath();
  ctx.moveTo(-11, 18);
  ctx.lineTo(11, 18);
  ctx.lineTo(0, 18 + flameHeight);
  ctx.closePath();
  ctx.fill();

  if (!player.onGround || Math.abs(player.vx) > 40) {
    const sideFlame = 10 + thrusterPower * 14;
    ctx.fillStyle = hexToRgba("#a855f7", 0.42);
    ctx.beginPath();
    ctx.moveTo(-30, 0);
    ctx.lineTo(-30 - sideFlame, 4);
    ctx.lineTo(-30, 8);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(30, 0);
    ctx.lineTo(30 + sideFlame, 4);
    ctx.lineTo(30, 8);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}
