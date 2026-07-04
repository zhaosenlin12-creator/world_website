"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  active: boolean;
  accent: string;
  groundColor: string;
  onCollect: () => void;
  onHazard: () => void;
  onComplete: () => void;
};

const W = 720;
const H = 720;
const GRAV = 2200;
const JUMP = -820;
const SPEED = 360;
const PLAYER_W = 36;
const PLAYER_H = 44;

type Platform = { x: number; y: number; w: number; h: number; rot: number; rotSpeed: number; kind: "rock" | "ice" | "lava" | "crystal" };
type Orb = { x: number; y: number; r: number; collected: boolean; phase: number };
type Spark = { x: number; y: number; vx: number; vy: number; life: number; color: string };
type Player = { x: number; y: number; vx: number; vy: number; onGround: boolean; dead: boolean; facing: 1 | -1; jumpHold: number };

// 8 行星独立关卡参数: 数量 / 间距 / 危险比 / 能量球 / 调色板
const PLANET_PRESETS: Record<string, { count: number; gap: [number, number]; hazard: number; orbs: number; palette: { p1: string; p2: string; sky1: string; sky2: string; ground: string } }> = {
  mercury: { count: 11, gap: [120, 160], hazard: 0.15, orbs: 3, palette: { p1: "#a8a29e", p2: "#57534e", sky1: "#0a0a18", sky2: "#1f1d2e", ground: "#3f3f46" } },
  venus:   { count: 12, gap: [110, 150], hazard: 0.35, orbs: 4, palette: { p1: "#fb923c", p2: "#7c2d12", sky1: "#3a0d04", sky2: "#1a0606", ground: "#7c2d12" } },
  earth:   { count: 12, gap: [115, 155], hazard: 0.20, orbs: 5, palette: { p1: "#22d3ee", p2: "#0e7490", sky1: "#0c1d3a", sky2: "#020617", ground: "#0e3b5c" } },
  mars:    { count: 13, gap: [120, 165], hazard: 0.30, orbs: 4, palette: { p1: "#f97316", p2: "#9a3412", sky1: "#1c0608", sky2: "#0c0303", ground: "#7c2d12" } },
  jupiter: { count: 14, gap: [105, 145], hazard: 0.25, orbs: 5, palette: { p1: "#fbbf24", p2: "#7c2d12", sky1: "#0a0815", sky2: "#02010a", ground: "#1e1b4b" } },
  saturn:  { count: 13, gap: [115, 155], hazard: 0.20, orbs: 5, palette: { p1: "#fde68a", p2: "#a16207", sky1: "#1a1407", sky2: "#0a0805", ground: "#3a2c10" } },
  uranus:  { count: 12, gap: [110, 150], hazard: 0.20, orbs: 4, palette: { p1: "#67e8f9", p2: "#0e7490", sky1: "#042029", sky2: "#020a0a", ground: "#0a3a45" } },
  neptune: { count: 13, gap: [110, 150], hazard: 0.25, orbs: 4, palette: { p1: "#818cf8", p2: "#3730a3", sky1: "#070b25", sky2: "#02030a", ground: "#101a4d" } },
};

function rand(a: number, b: number) { return a + Math.random() * (b - a); }

function usePlatformerSound() {
  const ctxRef = useRef<AudioContext | null>(null);
  useEffect(() => {
    if (typeof window !== "undefined" && !ctxRef.current) {
      const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (Ctx) ctxRef.current = new Ctx();
    }
  }, []);
  const play = useCallback((freq: number, dur: number, type: OscillatorType = "sine", vol = 0.12) => {
    if (!ctxRef.current) return;
    try {
      const ctx = ctxRef.current;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, ctx.currentTime);
      g.gain.setValueAtTime(vol, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + dur);
    } catch {}
  }, []);
  return {
    jump: () => play(420, 0.08, "square", 0.08),
    land: () => play(220, 0.05, "sine", 0.06),
    collect: () => { play(880, 0.08, "sine", 0.13); setTimeout(() => play(1320, 0.1, "sine", 0.1), 50); },
    die: () => play(160, 0.18, "sawtooth", 0.18),
    complete: () => [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => play(f, 0.2, "sine", 0.16), i * 90))
  };
}

export default function LandingPlatformer({ active, accent, groundColor, onCollect, onHazard, onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sfx = usePlatformerSound();
  const keysRef = useRef<Record<string, boolean>>({});
  const playerRef = useRef<Player>({ x: W / 2, y: 60, vx: 0, vy: 0, onGround: false, dead: false, facing: 1, jumpHold: 0 });
  const platformsRef = useRef<Platform[]>([]);
  const orbsRef = useRef<Orb[]>([]);
  const sparksRef = useRef<Spark[]>([]);
  const camYRef = useRef(0);
  const startedRef = useRef(false);
  const lastHazardTRef = useRef(0);
  const completedRef = useRef(false);
  const presetRef = useRef(PLANET_PRESETS.earth);
  const [hudDist, setHudDist] = useState(0);
  const [hudOrbs, setHudOrbs] = useState(0);
  const [showReady, setShowReady] = useState(true);
  const [hintFlash, setHintFlash] = useState(true);
  const planetIdRef = useRef<string>("earth");

  useEffect(() => {
    if (!active) return;
    const id = (typeof window !== "undefined" && (window as any).__landingPlanetId) || "earth";
    planetIdRef.current = id;
    presetRef.current = PLANET_PRESETS[id] || PLANET_PRESETS.earth;
    playerRef.current = { x: W / 2, y: 60, vx: 0, vy: 0, onGround: false, dead: false, facing: 1, jumpHold: 0 };
    platformsRef.current = [];
    orbsRef.current = [];
    sparksRef.current = [];
    camYRef.current = 0;
    startedRef.current = false;
    completedRef.current = false;
    setHudDist(0);
    setHudOrbs(0);
    setShowReady(true);
    setHintFlash(true);
    const t = setTimeout(() => { startedRef.current = true; setShowReady(false); }, 1100);
    return () => clearTimeout(t);
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const down = (e: KeyboardEvent) => { keysRef.current[e.key.toLowerCase()] = true; };
    const up = (e: KeyboardEvent) => { keysRef.current[e.key.toLowerCase()] = false; };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const ps = presetRef.current;
    const plats: Platform[] = [];
    plats.push({ x: W / 2 - 80, y: 180, w: 160, h: 18, rot: 0, rotSpeed: 0, kind: "rock" });
    let y = 180;
    for (let i = 0; i < ps.count; i++) {
      y += rand(ps.gap[0], ps.gap[1]);
      const w = rand(70, 130);
      const x = rand(40, W - 40 - w);
      const isHazard = Math.random() < ps.hazard;
      plats.push({ x, y, w, h: 14, rot: rand(-0.15, 0.15), rotSpeed: rand(-0.4, 0.4), kind: isHazard ? "lava" : "rock" });
    }
    plats.push({ x: 0, y: y + 200, w: W, h: 60, rot: 0, rotSpeed: 0, kind: "crystal" });
    platformsRef.current = plats;
    const orbs: Orb[] = [];
    for (let i = 0; i < ps.orbs; i++) {
      const p = plats[1 + i * 2];
      if (p) orbs.push({ x: p.x + p.w / 2, y: p.y - 40, r: 14, collected: false, phase: Math.random() * Math.PI * 2 });
    }
    orbsRef.current = orbs;
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let last = performance.now();
    const loop = (t: number) => {
      const dt = Math.min(0.04, (t - last) / 1000);
      last = t;
      if (!startedRef.current) { draw(ctx, 0); raf = requestAnimationFrame(loop); return; }
      if (completedRef.current) { draw(ctx, dt); raf = requestAnimationFrame(loop); return; }
      step(dt);
      draw(ctx, dt);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  const step = (dt: number) => {
    const p = playerRef.current;
    if (p.dead || completedRef.current) return;
    const k = keysRef.current;
    if (k["a"] || k["arrowleft"]) { p.vx = -SPEED; p.facing = -1; }
    else if (k["d"] || k["arrowright"]) { p.vx = SPEED; p.facing = 1; }
    else p.vx *= 0.78;
    if (k[" "] || k["w"] || k["arrowup"]) {
      if (p.onGround) { p.vy = JUMP; p.onGround = false; p.jumpHold = 0.15; sfx.jump(); }
      else if (p.jumpHold > 0) { p.vy = JUMP * 0.9; p.jumpHold = 0; }
    }
    p.vy += GRAV * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.x < PLAYER_W / 2) p.x = PLAYER_W / 2;
    if (p.x > W - PLAYER_W / 2) p.x = W - PLAYER_W / 2;
    const targetCam = p.y - H * 0.66;
    camYRef.current += (targetCam - camYRef.current) * 0.18;
    p.onGround = false;
    for (const plat of platformsRef.current) {
      const top = plat.y;
      const left = plat.x;
      const right = plat.x + plat.w;
      const bottom = plat.y + plat.h;
      const px0 = p.x - PLAYER_W / 2;
      const px1 = p.x + PLAYER_W / 2;
      const py0 = p.y - PLAYER_H;
      const py1 = p.y;
      if (px1 > left + 4 && px0 < right - 4 && py1 > top && py0 < bottom) {
        if (p.vy > 0 && py1 - p.vy * dt <= top + 2) {
          p.y = top;
          p.vy = 0;
          if (!p.onGround) sfx.land();
          p.onGround = true;
          if (plat.kind === "lava") die();
        } else if (p.vy < 0 && py0 - p.vy * dt >= bottom - 2) {
          p.vy = 200;
          if (plat.kind === "lava") die();
        } else {
          if (plat.kind === "lava") { die(); }
          else { p.vx *= -0.6; p.x += (p.vx > 0 ? -2 : 2); }
        }
      }
    }
    for (const o of orbsRef.current) {
      if (o.collected) continue;
      o.phase += dt * 3;
      o.y += Math.sin(o.phase) * 0.3;
      const dx = o.x - p.x, dy = o.y - (p.y - PLAYER_H / 2);
      if (Math.hypot(dx, dy) < o.r + 22) {
        o.collected = true;
        onCollect();
        sfx.collect();
        setHudOrbs((c) => c + 1);
        for (let i = 0; i < 12; i++) {
          sparksRef.current.push({ x: o.x, y: o.y, vx: rand(-120, 120), vy: rand(-200, -40), life: 0.5, color: accent });
        }
      }
    }
    const groundY = platformsRef.current[platformsRef.current.length - 1].y;
    if (p.y > groundY + 40) {
      completedRef.current = true;
      sfx.complete();
      setTimeout(() => onComplete(), 350);
    }
    if (p.y < camYRef.current - 100) {
      p.y = camYRef.current - 50;
      p.vy = 0;
    }
    for (const s of sparksRef.current) {
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.vy += 300 * dt;
      s.life -= dt;
    }
    sparksRef.current = sparksRef.current.filter((s) => s.life > 0);
    for (const plat of platformsRef.current) plat.rot += plat.rotSpeed * dt;
    setHudDist(Math.max(0, Math.round((p.y - 60) / 8)));
  };

  const die = () => {
    const p = playerRef.current;
    if (p.dead) return;
    p.dead = true;
    sfx.die();
    onHazard();
    for (let i = 0; i < 24; i++) {
      sparksRef.current.push({ x: p.x, y: p.y - PLAYER_H / 2, vx: rand(-220, 220), vy: rand(-300, -60), life: 0.8, color: "#fb923c" });
    }
    setTimeout(() => {
      const plats = platformsRef.current;
      let nearest = plats[0];
      for (const plat of plats) {
        if (Math.abs(plat.y - p.y) < Math.abs(nearest.y - p.y)) nearest = plat;
      }
      p.x = nearest.x + nearest.w / 2;
      p.y = nearest.y - 10;
      p.vx = 0;
      p.vy = 0;
      p.dead = false;
    }, 700);
  };

  const draw = (ctx: CanvasRenderingContext2D, dt: number) => {
    const ps = presetRef.current.palette;
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, ps.sky2);
    grad.addColorStop(1, ps.sky1);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    const p = playerRef.current;
    const progress = Math.min(1, (p.y - 60) / 800);
    const planetR = 240 - progress * 140;
    const planetX = W / 2;
    const planetY = H * 1.45 - progress * H * 0.45;
    const planetGrad = ctx.createRadialGradient(planetX, planetY, planetR * 0.2, planetX, planetY, planetR);
    planetGrad.addColorStop(0, ps.p1);
    planetGrad.addColorStop(0.7, ps.p2);
    planetGrad.addColorStop(1, "#000");
    ctx.fillStyle = planetGrad;
    ctx.beginPath();
    ctx.arc(planetX, planetY, planetR, 0, Math.PI * 2);
    ctx.fill();
    const haloGrad = ctx.createRadialGradient(planetX, planetY, planetR, planetX, planetY, planetR * 1.15);
    haloGrad.addColorStop(0, "rgba(255,255,255,0.18)");
    haloGrad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = haloGrad;
    ctx.beginPath();
    ctx.arc(planetX, planetY, planetR * 1.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    for (let i = 0; i < 60; i++) {
      const sx = (i * 137) % W;
      const sy = ((i * 53) % H);
      const tw = ((i * 31) % 3) * 0.5 + 0.5;
      ctx.globalAlpha = 0.3 + ((i * 17) % 7) * 0.08;
      ctx.fillRect(sx, sy, tw, tw);
    }
    ctx.globalAlpha = 1;
    ctx.save();
    ctx.translate(0, -camYRef.current);
    for (const plat of platformsRef.current) {
      ctx.save();
      ctx.translate(plat.x + plat.w / 2, plat.y + plat.h / 2);
      ctx.rotate(plat.rot);
      const isHazard = plat.kind === "lava";
      ctx.fillStyle = isHazard ? "#7c2d12" : ps.p1;
      ctx.strokeStyle = isHazard ? "#fb923c" : ps.p2;
      ctx.lineWidth = 2;
      const rw = plat.w, rh = plat.h;
      ctx.beginPath();
      const points = 6;
      for (let i = 0; i < points; i++) {
        const a = (i / points) * Math.PI * 2;
        const rr = 0.7 + ((i * 17) % 5) * 0.06;
        const px = Math.cos(a) * (rw / 2) * rr;
        const py = Math.sin(a) * (rh / 2) * rr;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = isHazard ? "rgba(251,146,60,0.5)" : "rgba(255,255,255,0.2)";
      ctx.beginPath();
      ctx.ellipse(-rw * 0.18, -rh * 0.18, rw * 0.18, rh * 0.18, 0, 0, Math.PI * 2);
      ctx.fill();
      if (isHazard) {
        ctx.fillStyle = "rgba(251,146,60,0.6)";
        ctx.beginPath();
        ctx.arc(rw * 0.15, -rh * 0.1, rh * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    for (const o of orbsRef.current) {
      if (o.collected) continue;
      const yy = o.y + Math.sin(o.phase) * 4;
      const og = ctx.createRadialGradient(o.x, yy, 4, o.x, yy, o.r * 1.6);
      og.addColorStop(0, accent);
      og.addColorStop(0.5, accent + "aa");
      og.addColorStop(1, accent + "00");
      ctx.fillStyle = og;
      ctx.beginPath();
      ctx.arc(o.x, yy, o.r * 1.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(o.x, yy, o.r * 0.45, 0, Math.PI * 2);
      ctx.fill();
    }
    if (!p.dead) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.beginPath();
      ctx.ellipse(0, 2, PLAYER_W * 0.55, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      const bodyG = ctx.createLinearGradient(-PLAYER_W / 2, -PLAYER_H, PLAYER_W / 2, 0);
      bodyG.addColorStop(0, "#e0e7ff");
      bodyG.addColorStop(1, "#a5b4fc");
      ctx.fillStyle = bodyG;
      roundRect(ctx, -PLAYER_W / 2, -PLAYER_H, PLAYER_W, PLAYER_H, 10);
      ctx.fill();
      ctx.strokeStyle = "#312e81";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = "#1e293b";
      roundRect(ctx, -PLAYER_W / 2 + 4, -PLAYER_H + 2, PLAYER_W - 8, PLAYER_H * 0.4, 6);
      ctx.fill();
      ctx.fillStyle = "rgba(34,211,238,0.7)";
      ctx.beginPath();
      ctx.arc(-4, -PLAYER_H + PLAYER_H * 0.2, 4, 0, Math.PI * 2);
      ctx.fill();
      if (p.vy < -50) {
        ctx.fillStyle = "#22d3ee";
        ctx.beginPath();
        ctx.moveTo(-6, 0);
        ctx.lineTo(6, 0);
        ctx.lineTo(0, 14 + Math.random() * 6);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }
    for (const s of sparksRef.current) {
      ctx.globalAlpha = Math.max(0, s.life / 0.8);
      ctx.fillStyle = s.color;
      ctx.fillRect(s.x - 2, s.y - 2, 4, 4);
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  };

  return (
    <AnimatePresence>
      {active && (
        <motion.div data-testid="landing-2d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-40 flex items-center justify-center pointer-events-auto" style={{ background: "radial-gradient(circle at center, rgba(2,1,10,0.7), rgba(2,1,10,0.95))", backdropFilter: "blur(6px)" }}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ duration: 0.4 }} className="relative w-full h-full max-w-[1200px] max-h-[96vh] flex items-center justify-center p-3">
            <div className="relative" style={{ width: "min(95vw, 92vh)", height: "min(95vw, 92vh)", maxWidth: 1080, maxHeight: 1080 }}>
              <canvas ref={canvasRef} width={W} height={H} className="w-full h-full rounded-3xl border border-cyan-400/40 shadow-2xl" style={{ display: "block" }} />
              <div className="absolute top-3 left-3 right-3 flex items-start justify-between pointer-events-none">
                <div className="glass-strong rounded-lg px-3 py-1.5 text-[11px] font-mono">
                  <div className="text-cyan-300 uppercase tracking-widest text-[9px] mb-0.5">{"降落距离"}</div>
                  <div className="text-white font-bold text-base">{hudDist} m</div>
                </div>
                <div className="glass-strong rounded-lg px-3 py-1.5 text-[11px] font-mono text-right">
                  <div className="text-amber-300 uppercase tracking-widest text-[9px] mb-0.5">{"能量样本"}</div>
                  <div className="text-white font-bold text-base">{hudOrbs} / {presetRef.current.orbs}</div>
                </div>
              </div>
              {hintFlash && !showReady && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 glass-strong rounded-full px-4 py-1.5 text-xs text-white/85 pointer-events-none">
                  {"WASD / 方向键 移动 · 空格 / W 跳跃 · 落到行星表面即完成"}
                </div>
              )}
              {showReady && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <div className="text-amber-300/80 text-xs tracking-[0.5em] uppercase mb-2">{"大气层穿越中"}</div>
                    <div className="text-white/95 text-2xl font-display gradient-text">{"准备着陆"}</div>
                  </div>
                </motion.div>
              )}
            </div>
            </motion.div>
          </motion.div>
          )}
        </AnimatePresence>
      );
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
