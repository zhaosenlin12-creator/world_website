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

type PlatformKind = "dock" | "fragile" | "rock" | "hazard" | "landing";

type Platform = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  kind: PlatformKind;
  crumbleAt?: number;
  broken?: boolean;
  checkpoint?: boolean;
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

const VIEW_W = 1600;
const VIEW_H = 900;
const PLAYER_W = 58;
const PLAYER_H = 64;
const GRAVITY = 2600;
const RUN_ACCEL = 2100;
const AIR_ACCEL = 1500;
const MAX_RUN_SPEED = 440;
const JUMP_SPEED = -1020;
const RESPAWN_DELAY_MS = 720;
const COMPLETE_DELAY_MS = 620;
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
  { max: 0.24, title: "姿态校准", detail: "穿过中继平台，保持喷口稳定" },
  { max: 0.56, title: "碎片平台", detail: "中转台会碎裂，继续推进" },
  { max: 0.86, title: "低空修正", detail: "收住横向速度，对准着陆走廊" },
  { max: 1.01, title: "终端着陆", detail: "落入发光着陆环，完成二次制动" }
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
  if (planetId && PLANET_THEMES[planetId]) {
    return PLANET_THEMES[planetId];
  }
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
    },
    touchdown() {
      [420, 560, 740, 980].forEach((freq, index) => {
        setTimeout(() => playTone(freq, 0.18, "sine", 0.08, freq * 1.1), index * 90);
      });
    }
  }), [playTone]);
}

function buildLevel() {
  const platforms: Platform[] = [
    { id: "dock", x: 170, y: 240, w: 300, h: 26, kind: "dock", checkpoint: true },
    { id: "fragile-1", x: 470, y: 470, w: 250, h: 22, kind: "fragile" },
    { id: "rock-1", x: 850, y: 700, w: 180, h: 22, kind: "rock", checkpoint: true },
    { id: "rock-2", x: 1120, y: 930, w: 170, h: 22, kind: "rock", checkpoint: true },
    { id: "hazard-1", x: 760, y: 1115, w: 230, h: 26, kind: "hazard" },
    { id: "rock-3", x: 420, y: 1320, w: 220, h: 24, kind: "rock", checkpoint: true },
    { id: "rock-4", x: 720, y: 1545, w: 180, h: 24, kind: "rock", checkpoint: true },
    { id: "rock-5", x: 1040, y: 1780, w: 220, h: 26, kind: "rock", checkpoint: true },
    { id: "hazard-2", x: 790, y: 1960, w: 170, h: 24, kind: "hazard" },
    { id: "landing", x: 660, y: 2190, w: 380, h: 42, kind: "landing", checkpoint: true }
  ];

  const orbs: Orb[] = [
    { id: "orb-1", x: 580, y: 400, r: 16, collected: false, phase: Math.PI * 0.2 },
    { id: "orb-2", x: 1190, y: 860, r: 16, collected: false, phase: Math.PI * 0.6 },
    { id: "orb-3", x: 530, y: 1250, r: 16, collected: false, phase: Math.PI * 1.1 },
    { id: "orb-4", x: 1130, y: 1710, r: 16, collected: false, phase: Math.PI * 1.6 }
  ];

  return {
    platforms,
    orbs,
    landingY: 2190,
    landingX: 850,
    worldBottom: 2520
  };
}

export default function LandingPlatformer({
  active,
  accent,
  groundColor,
  onCollect,
  onHazard,
  onComplete
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sfx = usePlatformerSound();
  const levelRef = useRef(buildLevel());
  const playerRef = useRef<Player>({
    x: 320,
    y: 240,
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
  const particlesRef = useRef<Particle[]>([]);
  const prevGroundRef = useRef(true);
  const checkpointRef = useRef({ x: 320, y: 240, platformId: "dock" });
  const jumpQueuedUntilRef = useRef(0);
  const lastHazardRef = useRef(0);
  const lastHudRef = useRef(0);
  const rafRef = useRef(0);
  const readyTimerRef = useRef<number | null>(null);
  const respawnTimerRef = useRef<number | null>(null);
  const completeTimerRef = useRef<number | null>(null);
  const planetIdRef = useRef<PlanetKey>("earth");
  const bannerTimerRef = useRef<number | null>(null);
  const completedRef = useRef(false);
  const touchdownRef = useRef(false);
  const fragileHintShownRef = useRef(false);

  const [phase, setPhase] = useState<Phase>("ready");
  const [planetName, setPlanetName] = useState("地球");
  const [banner, setBanner] = useState("姿态锁正在解除");
  const [hud, setHud] = useState<HudState>({
    stage: "姿态校准",
    stageDetail: "穿过中继平台，保持喷口稳定",
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

  const resetLevel = useCallback(() => {
    const id = ((typeof window !== "undefined" && (window as any).__landingPlanetId) || "earth") as PlanetKey;
    planetIdRef.current = PLANET_THEMES[id] ? id : "earth";
    const currentTheme = makeTheme(planetIdRef.current, accent, groundColor);
    setPlanetName(currentTheme.name);
    levelRef.current = buildLevel();
    playerRef.current = {
      x: 320,
      y: 240,
      vx: 0,
      vy: 0,
      onGround: true,
      coyote: COYOTE_TIME,
      facing: 1,
      respawning: false,
      platformId: "dock"
    };
    checkpointRef.current = { x: 320, y: 240, platformId: "dock" };
    starsRef.current = Array.from({ length: 120 }, () => ({
      x: rand(0, VIEW_W),
      y: rand(0, VIEW_H),
      size: rand(0.8, 2.8),
      alpha: rand(0.18, 0.92),
      speed: rand(0.2, 1.2)
    }));
    driftsRef.current = Array.from({ length: 24 }, () => ({
      x: rand(0, VIEW_W),
      y: rand(0, VIEW_H),
      len: rand(60, 180),
      alpha: rand(0.08, 0.22),
      speed: rand(0.8, 2.4)
    }));
    particlesRef.current = [];
    cameraYRef.current = 0;
    prevGroundRef.current = true;
    completedRef.current = false;
    touchdownRef.current = false;
    fragileHintShownRef.current = false;
    lastHazardRef.current = 0;
    lastHudRef.current = 0;
    jumpQueuedUntilRef.current = 0;
    keysRef.current = {};
    phaseRef.current = "ready";
    setPhase("ready");
    setBanner("准备二次制动，进入着陆走廊");
    setHud({
      stage: "姿态校准",
      stageDetail: "穿过中继平台，保持喷口稳定",
      distance: Math.round((levelRef.current.landingY - 240) / 2.5),
      collected: 0,
      total: levelRef.current.orbs.length,
      stability: 100,
      progress: 0
    });
  }, [accent, groundColor]);

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

  const spawnBurst = useCallback((x: number, y: number, color: string, count: number) => {
    for (let index = 0; index < count; index += 1) {
      particlesRef.current.push({
        x,
        y,
        vx: rand(-180, 180),
        vy: rand(-240, 40),
        life: rand(0.45, 0.85),
        maxLife: 0.85,
        size: rand(3, 8),
        color
      });
    }
  }, []);

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
    pushBanner(reason === "hazard" ? "撞入碎片带，正在重新校正姿态" : "偏离着陆走廊，自动回收至最近平台");
    spawnBurst(player.x, player.y - PLAYER_H * 0.5, reason === "hazard" ? "#fb923c" : accent, 22);
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
  }, [accent, onHazard, pushBanner, sfx, spawnBurst]);

  const triggerTouchdown = useCallback(() => {
    if (touchdownRef.current || completedRef.current) return;
    touchdownRef.current = true;
    completedRef.current = true;
    phaseRef.current = "touchdown";
    setPhase("touchdown");
    pushBanner("着陆成功，正在建立生命维持链路", true);
    sfx.touchdown();
    const player = playerRef.current;
    player.vx = 0;
    player.vy = 0;
    player.onGround = true;
    spawnBurst(levelRef.current.landingX, levelRef.current.landingY - 20, accent, 30);
    completeTimerRef.current = window.setTimeout(() => {
      if (completedRef.current) {
        phaseRef.current = "complete";
        setPhase("complete");
        onComplete();
      }
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
      pushBanner("中转平台会碎裂，尽快推进到发光着陆区");
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
      if (isJumpKey(key)) {
        jumpQueuedUntilRef.current = performance.now() + JUMP_BUFFER_MS;
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
  }, [active, accent, theme]);

  const stepWorld = useCallback((dt: number, now: number) => {
    const player = playerRef.current;
    const level = levelRef.current;
    const keys = keysRef.current;

    for (const platform of level.platforms) {
      if (platform.kind === "fragile" && !platform.broken && platform.crumbleAt && now >= platform.crumbleAt) {
        platform.broken = true;
        spawnBurst(platform.x + platform.w * 0.5, platform.y, "#f59e0b", 18);
        if (player.platformId === platform.id) {
          player.onGround = false;
          player.vy = Math.max(player.vy, 140);
          player.platformId = null;
        }
      }
    }

    for (const orb of level.orbs) {
      if (!orb.collected) {
        orb.phase += dt * 2.4;
      }
    }

    for (const particle of particlesRef.current) {
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vy += 420 * dt;
      particle.life -= dt;
    }
    particlesRef.current = particlesRef.current.filter((particle) => particle.life > 0);

    if (phaseRef.current !== "active") {
      const targetCamera = clamp(player.y - VIEW_H * 0.42, 0, level.worldBottom - VIEW_H);
      cameraYRef.current = mix(cameraYRef.current, targetCamera, 0.12);
      updateHud(now);
      return;
    }

    if (!player.respawning) {
      if (player.onGround) {
        player.coyote = COYOTE_TIME;
      } else {
        player.coyote = Math.max(0, player.coyote - dt);
      }

      const moveDir = (keys["d"] || keys["arrowright"] ? 1 : 0) - (keys["a"] || keys["arrowleft"] ? 1 : 0);
      const accel = player.onGround ? RUN_ACCEL : AIR_ACCEL;
      if (moveDir !== 0) {
        player.vx += moveDir * accel * dt;
        player.facing = moveDir > 0 ? 1 : -1;
      } else {
        player.vx *= player.onGround ? 0.82 : 0.94;
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

      const previousX = player.x;
      const previousY = player.y;
      player.vy += GRAVITY * dt;
      player.x += player.vx * dt;
      player.y += player.vy * dt;
      player.x = clamp(player.x, PLAYER_W * 0.5, VIEW_W - PLAYER_W * 0.5);

      let landedPlatform: Platform | null = null;
      let landingY = Number.POSITIVE_INFINITY;
      const prevBottom = previousY;
      const nextBottom = player.y;
      const left = player.x - PLAYER_W * 0.42;
      const right = player.x + PLAYER_W * 0.42;

      for (const platform of level.platforms) {
        if (platform.broken) continue;
        if (platform.kind === "hazard") {
          const playerTop = player.y - PLAYER_H;
          const overlaps =
            right > platform.x + 10 &&
            left < platform.x + platform.w - 10 &&
            player.y > platform.y &&
            playerTop < platform.y + platform.h;
          if (overlaps) {
            triggerRespawn("hazard");
            break;
          }
          continue;
        }

        const withinX = right > platform.x + 8 && left < platform.x + platform.w - 8;
        const crossedTop = player.vy >= 0 && prevBottom <= platform.y + 2 && nextBottom >= platform.y;
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
          landedPlatform.crumbleAt = now + 850;
          if (!fragileHintShownRef.current) {
            fragileHintShownRef.current = true;
            pushBanner("中转平台开始碎裂，立即推进到下一个平台");
          }
        }

        if (landedPlatform.kind === "landing") {
          triggerTouchdown();
        }
      } else if (!player.respawning) {
        player.onGround = false;
        if (Math.abs(player.x - previousX) < 1) {
          player.vx *= 0.995;
        }
      }

      if (!prevGroundRef.current && player.onGround && !touchdownRef.current) {
        sfx.land();
      }
      prevGroundRef.current = player.onGround;

      if (!player.respawning) {
        const voidY = cameraYRef.current + VIEW_H + 180;
        if (player.y > Math.max(voidY, level.worldBottom + 40)) {
          triggerRespawn("void");
        }
      }
    }

    if (!player.respawning) {
      for (const orb of level.orbs) {
        if (orb.collected) continue;
        const orbY = orb.y + Math.sin(orb.phase) * 6;
        const dx = orb.x - player.x;
        const dy = orbY - (player.y - PLAYER_H * 0.58);
        if (Math.hypot(dx, dy) < orb.r + 28) {
          orb.collected = true;
          spawnBurst(orb.x, orbY, accent, 14);
          pushBanner("回收能源样本，推进器输出更稳定");
          sfx.collect();
          onCollect();
        }
      }
    }

    const targetCamera = clamp(player.y - VIEW_H * 0.42, 0, level.worldBottom - VIEW_H);
    cameraYRef.current = mix(cameraYRef.current, targetCamera, 0.12);
    updateHud(now);
  }, [pushBanner, sfx, spawnBurst, triggerRespawn, triggerTouchdown]);

  const updateHud = useCallback((now: number) => {
    if (now - lastHudRef.current < HUD_INTERVAL_MS) return;
    lastHudRef.current = now;
    const player = playerRef.current;
    const level = levelRef.current;
    const progress = clamp((player.y - 240) / (level.landingY - 240), 0, 1);
    const stageInfo = STAGE_LABELS.find((item) => progress <= item.max) || STAGE_LABELS[STAGE_LABELS.length - 1];
    const collected = level.orbs.filter((orb) => orb.collected).length;
    const stability = clamp(Math.round(100 - Math.abs(player.vx) * 0.08 - Math.abs(player.vy) * 0.03), 24, 100);
    setHud({
      stage: stageInfo.title,
      stageDetail: stageInfo.detail,
      distance: Math.max(0, Math.round((level.landingY - player.y) / 2.4)),
      collected,
      total: level.orbs.length,
      stability,
      progress
    });
  }, []);

  const drawWorld = useCallback((ctx: CanvasRenderingContext2D, now: number) => {
    const level = levelRef.current;
    const player = playerRef.current;
    const cameraY = cameraYRef.current;
    const progress = clamp((player.y - 240) / (level.landingY - 240), 0, 1);

    const bg = ctx.createLinearGradient(0, 0, 0, VIEW_H);
    bg.addColorStop(0, theme.skyTop);
    bg.addColorStop(1, theme.skyBottom);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);

    const haze = ctx.createRadialGradient(VIEW_W * 0.5, VIEW_H * 0.65, 120, VIEW_W * 0.5, VIEW_H * 0.65, VIEW_W * 0.65);
    haze.addColorStop(0, hexToRgba(theme.haze, 0.08 + progress * 0.08));
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
      const driftY = (drift.y + now * 0.015 * drift.speed) % (VIEW_H + 220);
      ctx.strokeStyle = hexToRgba(theme.dust, drift.alpha);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(drift.x, driftY - drift.len);
      ctx.lineTo(drift.x + mix(-40, 40, progress), driftY);
      ctx.stroke();
    }

    const planetRadius = mix(210, 540, progress);
    const planetX = mix(VIEW_W * 0.7, VIEW_W * 0.52, progress);
    const planetY = mix(VIEW_H + 280, VIEW_H * 0.92, progress);
    const planetGrad = ctx.createRadialGradient(planetX - planetRadius * 0.18, planetY - planetRadius * 0.22, planetRadius * 0.12, planetX, planetY, planetRadius);
    planetGrad.addColorStop(0, theme.planetLight);
    planetGrad.addColorStop(0.58, theme.planetDark);
    planetGrad.addColorStop(1, "#02010a");
    ctx.fillStyle = planetGrad;
    ctx.beginPath();
    ctx.arc(planetX, planetY, planetRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.2 + progress * 0.15;
    ctx.strokeStyle = hexToRgba(theme.haze, 0.38);
    ctx.lineWidth = 18;
    ctx.beginPath();
    ctx.ellipse(planetX, planetY, planetRadius * 1.07, planetRadius * 0.92, -0.18, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;

    ctx.save();
    ctx.translate(0, -cameraY);

    for (let index = 0; index < 3; index += 1) {
      const y = 520 + index * 640;
      ctx.strokeStyle = hexToRgba(theme.haze, 0.06);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(140, y);
      ctx.lineTo(VIEW_W - 140, y);
      ctx.stroke();
    }

    for (const platform of level.platforms) {
      if (platform.broken) continue;
      drawPlatform(ctx, platform, now, theme, accent, groundColor);
    }

    for (const orb of level.orbs) {
      if (orb.collected) continue;
      const orbY = orb.y + Math.sin(orb.phase) * 6;
      const glow = ctx.createRadialGradient(orb.x, orbY, 4, orb.x, orbY, orb.r * 2.6);
      glow.addColorStop(0, "#ffffff");
      glow.addColorStop(0.3, accent);
      glow.addColorStop(1, hexToRgba(accent, 0));
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(orb.x, orbY, orb.r * 2.6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(orb.x, orbY, orb.r * 0.45, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = hexToRgba(accent, 0.7);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(orb.x, orbY, orb.r, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (!player.respawning) {
      drawLander(ctx, player, accent, now);
    }

    for (const particle of particlesRef.current) {
      const alpha = particle.life / particle.maxLife;
      ctx.fillStyle = hexToRgba(particle.color, alpha);
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }, [accent, groundColor, theme]);

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
              <canvas
                ref={canvasRef}
                width={VIEW_W}
                height={VIEW_H}
                className="h-full w-full"
                style={{ display: "block" }}
              />

              <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 p-3 md:p-5">
                <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 backdrop-blur-md">
                  <div className="text-[10px] uppercase tracking-[0.35em] text-cyan-300/80">着陆阶段</div>
                  <div className="mt-1 text-lg font-semibold text-white">{hud.stage}</div>
                  <div className="mt-1 max-w-[220px] text-xs leading-relaxed text-white/70">{hud.stageDetail}</div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-right backdrop-blur-md">
                  <div className="text-[10px] uppercase tracking-[0.35em] text-fuchsia-300/80">{planetName} 着陆窗</div>
                  <div className="mt-1 text-2xl font-semibold text-white">{hud.distance} m</div>
                  <div className="mt-1 text-xs text-white/65">距最终着陆环剩余高度</div>
                </div>
              </div>

              <div className="pointer-events-none absolute left-3 right-3 top-[108px] z-10 flex gap-3 md:left-5 md:right-5 md:top-[118px]">
                <div className="min-w-[160px] rounded-2xl border border-white/10 bg-black/28 px-4 py-3 backdrop-blur-md">
                  <div className="flex items-center justify-between text-[11px] text-white/65">
                    <span>姿态稳定度</span>
                    <span className="font-mono text-cyan-300">{hud.stability}%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/8">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-300 to-emerald-300 transition-all duration-200"
                      style={{ width: `${hud.stability}%` }}
                    />
                  </div>
                </div>

                <div className="min-w-[160px] rounded-2xl border border-white/10 bg-black/28 px-4 py-3 backdrop-blur-md">
                  <div className="flex items-center justify-between text-[11px] text-white/65">
                    <span>能源样本</span>
                    <span className="font-mono text-amber-300">{hud.collected} / {hud.total}</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/8">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-300 via-orange-300 to-fuchsia-300 transition-all duration-200"
                      style={{ width: `${(hud.collected / Math.max(1, hud.total)) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="hidden flex-1 rounded-2xl border border-white/10 bg-black/28 px-4 py-3 backdrop-blur-md md:block">
                  <div className="flex items-center justify-between text-[11px] text-white/65">
                    <span>着陆进度</span>
                    <span className="font-mono text-white/80">{Math.round(hud.progress * 100)}%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/8">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-fuchsia-400 via-violet-400 to-cyan-300 transition-all duration-200"
                      style={{ width: `${hud.progress * 100}%` }}
                    />
                  </div>
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
                  <span>穿过中继平台，落入发光着陆环后再进入答题任务</span>
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
                      <div className="text-3xl font-semibold text-white">准备二次制动</div>
                      <div className="mt-3 text-sm text-white/70">先稳住姿态，再沿平台下落到最终着陆区</div>
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

function drawPlatform(
  ctx: CanvasRenderingContext2D,
  platform: Platform,
  now: number,
  theme: Theme,
  accent: string,
  groundColor: string
) {
  if (platform.kind === "hazard") {
    const hazardGrad = ctx.createLinearGradient(platform.x, platform.y, platform.x + platform.w, platform.y);
    hazardGrad.addColorStop(0, "rgba(249,115,22,0.15)");
    hazardGrad.addColorStop(0.5, "rgba(251,146,60,0.72)");
    hazardGrad.addColorStop(1, "rgba(249,115,22,0.15)");
    ctx.fillStyle = hazardGrad;
    roundRect(ctx, platform.x, platform.y, platform.w, platform.h, 12);
    ctx.fill();
    ctx.strokeStyle = "rgba(251,146,60,0.85)";
    ctx.lineWidth = 2;
    ctx.stroke();
    for (let index = 0; index < 5; index += 1) {
      const offset = (now * 0.18 + index * 40) % platform.w;
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.beginPath();
      ctx.moveTo(platform.x + offset, platform.y + 4);
      ctx.lineTo(platform.x + offset - 30, platform.y + platform.h - 4);
      ctx.stroke();
    }
    return;
  }

  const baseColor =
    platform.kind === "landing"
      ? accent
      : platform.kind === "fragile"
        ? "#7c3aed"
        : platform.kind === "dock"
          ? groundColor
          : theme.planetDark;

  const glowColor =
    platform.kind === "landing"
      ? hexToRgba(accent, 0.5)
      : platform.kind === "fragile"
        ? "rgba(244,114,182,0.28)"
        : hexToRgba(theme.haze, 0.18);

  ctx.save();
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = platform.kind === "landing" ? 28 : 14;

  const bodyGrad = ctx.createLinearGradient(platform.x, platform.y, platform.x + platform.w, platform.y + platform.h);
  bodyGrad.addColorStop(0, hexToRgba(baseColor, 0.96));
  bodyGrad.addColorStop(1, platform.kind === "landing" ? hexToRgba(baseColor, 0.42) : "rgba(12,18,32,0.96)");
  ctx.fillStyle = bodyGrad;
  roundRect(ctx, platform.x, platform.y, platform.w, platform.h, platform.kind === "landing" ? 18 : 12);
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = platform.kind === "landing" ? hexToRgba(accent, 0.95) : "rgba(255,255,255,0.18)";
  ctx.lineWidth = platform.kind === "landing" ? 3 : 2;
  ctx.stroke();

  if (platform.kind === "fragile") {
    ctx.strokeStyle = "rgba(255,255,255,0.38)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(platform.x + 32, platform.y + 8);
    ctx.lineTo(platform.x + platform.w * 0.52, platform.y + platform.h - 4);
    ctx.lineTo(platform.x + platform.w - 28, platform.y + 7);
    ctx.stroke();
  }

  if (platform.kind === "landing") {
    ctx.strokeStyle = hexToRgba(accent, 0.6);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(platform.x + platform.w * 0.5, platform.y + platform.h * 0.5, platform.w * 0.28, platform.h * 0.95, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.font = "bold 18px system-ui, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.textAlign = "center";
    ctx.fillText("着陆区", platform.x + platform.w * 0.5, platform.y - 14);
  }
}

function drawLander(ctx: CanvasRenderingContext2D, player: Player, accent: string, now: number) {
  ctx.save();
  ctx.translate(player.x, player.y - PLAYER_H * 0.54);

  const tilt = clamp(player.vx / MAX_RUN_SPEED, -1, 1) * 0.22;
  ctx.rotate(tilt);

  ctx.fillStyle = "rgba(0,0,0,0.26)";
  ctx.beginPath();
  ctx.ellipse(0, PLAYER_H * 0.72, 34, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  const bodyGrad = ctx.createLinearGradient(-28, -36, 28, 30);
  bodyGrad.addColorStop(0, "#eef2ff");
  bodyGrad.addColorStop(1, "#94a3b8");
  ctx.fillStyle = bodyGrad;
  roundRect(ctx, -26, -38, 52, 52, 18);
  ctx.fill();

  ctx.strokeStyle = "rgba(15,23,42,0.65)";
  ctx.lineWidth = 2;
  ctx.stroke();

  const cockpit = ctx.createLinearGradient(-14, -30, 14, -6);
  cockpit.addColorStop(0, "#67e8f9");
  cockpit.addColorStop(1, "#312e81");
  ctx.fillStyle = cockpit;
  roundRect(ctx, -14, -28, 28, 20, 10);
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = "#94a3b8";
  ctx.fillRect(-34, -8, 14, 6);
  ctx.fillRect(20, -8, 14, 6);
  ctx.fillRect(-18, 18, 4, 18);
  ctx.fillRect(14, 18, 4, 18);
  ctx.fillRect(-28, 32, 18, 4);
  ctx.fillRect(10, 32, 18, 4);

  const thrusterPower = player.onGround ? 0.12 : clamp(Math.abs(player.vy) / 700 + 0.25, 0.25, 1);
  const flameHeight = 16 + thrusterPower * 30 + Math.sin(now * 0.03) * 3;
  const flameGrad = ctx.createLinearGradient(0, 12, 0, 12 + flameHeight);
  flameGrad.addColorStop(0, "#ffffff");
  flameGrad.addColorStop(0.28, "#67e8f9");
  flameGrad.addColorStop(1, hexToRgba(accent, 0));
  ctx.fillStyle = flameGrad;
  ctx.beginPath();
  ctx.moveTo(-10, 16);
  ctx.lineTo(10, 16);
  ctx.lineTo(0, 16 + flameHeight);
  ctx.closePath();
  ctx.fill();

  if (!player.onGround || Math.abs(player.vx) > 40) {
    const sideFlame = 10 + thrusterPower * 12;
    ctx.fillStyle = hexToRgba("#a855f7", 0.42);
    ctx.beginPath();
    ctx.moveTo(-28, 0);
    ctx.lineTo(-28 - sideFlame, 4);
    ctx.lineTo(-28, 8);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(28, 0);
    ctx.lineTo(28 + sideFlame, 4);
    ctx.lineTo(28, 8);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}
