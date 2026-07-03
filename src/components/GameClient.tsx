"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { zh } from "@/i18n/zh";

type Planet = {
  id: string;
  name: string;
  x: number;
  y: number;
  size: number;
  color: string;
  glow: string;
  ringColor?: string;
  hasRing?: boolean;
};

type Particle = { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: string; size: number };
type Ripple = { x: number; y: number; t: number; color: string };
type Star = { x: number; y: number; r: number; phase: number };
type Meteor = { x: number; y: number; vx: number; vy: number; life: number; maxLife: number };

const CANVAS_W = 1000;
const CANVAS_H = 600;

const PLANETS: Planet[] = [
  { id: "mercury", name: "水星", x: 0.18, y: 0.35, size: 14, color: "#a8a29e", glow: "rgba(168,162,158,0.5)" },
  { id: "venus",   name: "金星", x: 0.28, y: 0.62, size: 22, color: "#fcd34d", glow: "rgba(252,211,77,0.6)" },
  { id: "earth",   name: "地球", x: 0.42, y: 0.30, size: 24, color: "#3b82f6", glow: "rgba(59,130,246,0.7)" },
  { id: "mars",    name: "火星", x: 0.52, y: 0.68, size: 18, color: "#dc2626", glow: "rgba(220,38,38,0.6)" },
  { id: "jupiter", name: "木星", x: 0.65, y: 0.32, size: 48, color: "#d97706", glow: "rgba(217,119,6,0.55)" },
  { id: "saturn",  name: "土星", x: 0.76, y: 0.66, size: 42, color: "#eab308", glow: "rgba(234,179,8,0.5)", ringColor: "#fde68a", hasRing: true },
  { id: "uranus",  name: "天王星", x: 0.85, y: 0.30, size: 30, color: "#22d3ee", glow: "rgba(34,211,238,0.6)" },
  { id: "neptune", name: "海王星", x: 0.92, y: 0.66, size: 28, color: "#1d4ed8", glow: "rgba(29,78,216,0.7)" }
];

const SUN_X = 0.08;
const SUN_Y = 0.50;
const SUN_R = 60;
const BEST_KEY = "cosmic-maze-best";

const QUESTIONS = zh.game.questions;
const Q_BY_PLANET: Record<string, (typeof QUESTIONS)[number]> = {};
QUESTIONS.forEach((q) => { Q_BY_PLANET[q.planet] = q; });

export function GameClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [activePlanet, setActivePlanet] = useState<string | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [finished, setFinished] = useState(false);
  
  const [newRecord, setNewRecord] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: "ok" | "bad"; x: number; y: number; key: number } | null>(null);

  const shipRef = useRef({ x: 0.5, y: 0.5, vx: 0, vy: 0, dragging: false, angle: 0 });
  const keysRef = useRef<Record<string, boolean>>({});
  const starsRef = useRef<Star[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const ripplesRef = useRef<Ripple[]>([]);
  const meteorsRef = useRef<Meteor[]>([]);

  // 加载最高分
  useEffect(() => {
    try {
      const v = parseInt(localStorage.getItem(BEST_KEY) || "0", 10);
      if (!Number.isNaN(v)) setBestScore(v);
    } catch {}
  }, []);

  // 初始化星空
  useEffect(() => {
    const stars: Star[] = [];
    for (let i = 0; i < 280; i++) {
      stars.push({ x: Math.random() * CANVAS_W, y: Math.random() * CANVAS_H, r: Math.random() * 1.4 + 0.3, phase: Math.random() * Math.PI * 2 });
    }
    starsRef.current = stars;
  }, []);

  // 键盘
  useEffect(() => {
    const dn = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " ", "w", "a", "s", "d", "W", "A", "S", "D"].includes(e.key)) {
        e.preventDefault();
        keysRef.current[e.key.toLowerCase()] = true;
      }
      if (e.key === "Escape") {
        setShowQuiz(false);
        setActivePlanet(null);
      }
    };
    const up = (e: KeyboardEvent) => { keysRef.current[e.key.toLowerCase()] = false; };
    window.addEventListener("keydown", dn);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", dn); window.removeEventListener("keyup", up); };
  }, []);

  // 飞船交互
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const getPos = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const cx = "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const cy = "touches" in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      return { x: (cx - rect.left) / rect.width, y: (cy - rect.top) / rect.height };
    };
    const onDown = (e: MouseEvent) => {
      const p = getPos(e);
      // 点击行星
      for (const pl of PLANETS) {
        const dx = (p.x - pl.x) * CANVAS_W;
        const dy = (p.y - pl.y) * CANVAS_H;
        if (Math.hypot(dx, dy) <= pl.size + 6) {
          setActivePlanet(pl.id);
          setShowQuiz(true);
          setSelectedAnswer(null);
          setAnswered(false);
          ripplesRef.current.push({ x: pl.x * CANVAS_W, y: pl.y * CANVAS_H, t: 0, color: pl.color });
          return;
        }
      }
      shipRef.current.x = p.x; shipRef.current.y = p.y; shipRef.current.dragging = true;
    };
    const onMove = (e: MouseEvent) => {
      if (!shipRef.current.dragging) return;
      const p = getPos(e);
      shipRef.current.x = p.x; shipRef.current.y = p.y;
    };
    const onUp = () => { shipRef.current.dragging = false; };
    canvas.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      canvas.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  const handleAnswer = useCallback((i: number) => {
    if (answered || !activePlanet) return;
    setSelectedAnswer(i);
    setAnswered(true);
    const q = Q_BY_PLANET[activePlanet];
    const ok = i === q.a;
    const pl = PLANETS.find(p => p.id === activePlanet)!;
    if (ok) {
      setScore(s => s + 100);
      setVisited(v => {
        const next = new Set(v); next.add(activePlanet);
        if (next.size === PLANETS.length) {
          setTimeout(() => setFinished(true), 600);
        }
        return next;
      });
    }
    setFeedback({ kind: ok ? "ok" : "bad", x: pl.x, y: pl.y, key: Date.now() });
    setTimeout(() => setFeedback(null), 1100);
  }, [answered, activePlanet]);

  const handleNext = useCallback(() => {
    setShowQuiz(false);
    setActivePlanet(null);
    setSelectedAnswer(null);
    setAnswered(false);
  }, []);

  const handleRestart = useCallback(() => {
    setScore(0); setVisited(new Set()); setActivePlanet(null); setShowQuiz(false);
    setSelectedAnswer(null); setAnswered(false); setFinished(false);  setNewRecord(false);
  }, []);

  // 完成时保存最高分
  useEffect(() => {
    if (finished && score > bestScore) {
      setBestScore(score);
      setNewRecord(true);
      try { localStorage.setItem(BEST_KEY, String(score)); } catch {}
    }
  }, [finished, score, bestScore]);

  const total = PLANETS.length;
  const currentQ = activePlanet ? Q_BY_PLANET[activePlanet] : null;
  const activePlanetData = activePlanet ? PLANETS.find(p => p.id === activePlanet) : null;

  // 渲染循环
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let t0 = performance.now();
    let lastSpawn = 0;
    let lastMeteor = 0;
    const render = (now: number) => {
      const t = (now - t0) / 1000;
      const dt = Math.min(0.05, (now - (raf ? now - 16 : now)) / 1000);
      const W = canvas.width, H = canvas.height;

      // 键盘移动
      const k = keysRef.current;
      const sp = 0.45 * dt;
      let dx = 0, dy = 0;
      if (k["arrowup"] || k["w"]) dy -= sp;
      if (k["arrowdown"] || k["s"]) dy += sp;
      if (k["arrowleft"] || k["a"]) dx -= sp;
      if (k["arrowright"] || k["d"]) dx += sp;
      if (dx || dy) {
        shipRef.current.x = Math.max(0.02, Math.min(0.98, shipRef.current.x + dx));
        shipRef.current.y = Math.max(0.02, Math.min(0.98, shipRef.current.y + dy));
        shipRef.current.vx = dx / dt; shipRef.current.vy = dy / dt;
        shipRef.current.angle = Math.atan2(dy, dx);
      } else {
        shipRef.current.vx *= 0.92; shipRef.current.vy *= 0.92;
      }

      // 引擎粒子
      if (now - lastSpawn > 30 && (Math.abs(shipRef.current.vx) + Math.abs(shipRef.current.vy) > 0.05 || k["arrowup"] || k["w"] || k["arrowdown"] || k["s"] || k["arrowleft"] || k["a"] || k["arrowright"] || k["d"])) {
        lastSpawn = now;
        const sx = shipRef.current.x * W, sy = shipRef.current.y * H;
        for (let i = 0; i < 2; i++) {
          const ang = shipRef.current.angle + Math.PI + (Math.random() - 0.5) * 0.6;
          const speed = 80 + Math.random() * 80;
          particlesRef.current.push({
            x: sx, y: sy,
            vx: Math.cos(ang) * speed, vy: Math.sin(ang) * speed,
            life: 0, maxLife: 0.6 + Math.random() * 0.4,
            color: Math.random() < 0.5 ? "#a855f7" : "#22d3ee",
            size: 1.5 + Math.random() * 2
          });
        }
      }

      // 流星
      if (now - lastMeteor > 2200) {
        lastMeteor = now;
        if (Math.random() < 0.7) {
          const startX = Math.random() * W;
          meteorsRef.current.push({ x: startX, y: -20, vx: 100 + Math.random() * 100, vy: 200 + Math.random() * 150, life: 0, maxLife: 2.2 });
        }
      }

      // 更新粒子
      for (const p of particlesRef.current) { p.life += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.98; p.vy *= 0.98; }
      particlesRef.current = particlesRef.current.filter(p => p.life < p.maxLife);
      for (const m of meteorsRef.current) { m.life += dt; m.x += m.vx * dt; m.y += m.vy * dt; }
      meteorsRef.current = meteorsRef.current.filter(m => m.life < m.maxLife && m.y < H + 50);
      for (const r of ripplesRef.current) { r.t += dt; }
      ripplesRef.current = ripplesRef.current.filter(r => r.t < 1.2);

      // 背景
      const grad = ctx.createRadialGradient(W * 0.5, H * 0.5, 0, W * 0.5, H * 0.5, W * 0.7);
      grad.addColorStop(0, "#0a0820");
      grad.addColorStop(0.5, "#050414");
      grad.addColorStop(1, "#02010a");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // 远景星点
      for (const s of starsRef.current) {
        const a = 0.35 + 0.45 * Math.sin(t * 0.8 + s.phase);
        ctx.globalAlpha = a;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;

      // 小行星带
      for (let i = 0; i < 50; i++) {
        const ang = t * 0.05 + i * 0.5;
        const r = 360 + (i % 3) * 10;
        const ax = W * 0.5 + Math.cos(ang) * r;
        const ay = H * 0.5 + Math.sin(ang) * r * 0.4;
        ctx.fillStyle = "rgba(180,170,150,0.4)";
        ctx.beginPath(); ctx.arc(ax, ay, 1.2, 0, Math.PI * 2); ctx.fill();
      }

      // 太阳
      const sx = SUN_X * W, sy = SUN_Y * H;
      const sg = ctx.createRadialGradient(sx, sy, 10, sx, sy, SUN_R * 2.2);
      sg.addColorStop(0, "rgba(255,230,120,0.95)");
      sg.addColorStop(0.25, "rgba(255,170,60,0.7)");
      sg.addColorStop(0.6, "rgba(255,90,30,0.2)");
      sg.addColorStop(1, "rgba(255,80,30,0)");
      ctx.fillStyle = sg;
      ctx.beginPath(); ctx.arc(sx, sy, SUN_R * 2.2, 0, Math.PI * 2); ctx.fill();
      // 太阳核
      const coreGrad = ctx.createRadialGradient(sx - 15, sy - 15, 5, sx, sy, SUN_R);
      coreGrad.addColorStop(0, "#fff7d6");
      coreGrad.addColorStop(0.6, "#fbbf24");
      coreGrad.addColorStop(1, "#f97316");
      ctx.fillStyle = coreGrad;
      ctx.beginPath(); ctx.arc(sx, sy, SUN_R, 0, Math.PI * 2); ctx.fill();

      // 行星
      for (const pl of PLANETS) {
        const px = pl.x * W, py = pl.y * H;
        // 辉光
        const gl = ctx.createRadialGradient(px, py, pl.size * 0.5, px, py, pl.size * 2.2);
        gl.addColorStop(0, pl.glow);
        gl.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = gl;
        ctx.beginPath(); ctx.arc(px, py, pl.size * 2.2, 0, Math.PI * 2); ctx.fill();
        // 行星
        const planetGrad = ctx.createRadialGradient(px - pl.size * 0.3, py - pl.size * 0.3, 2, px, py, pl.size);
        planetGrad.addColorStop(0, "#fff");
        planetGrad.addColorStop(0.3, pl.color);
        planetGrad.addColorStop(1, "#000");
        ctx.fillStyle = planetGrad;
        ctx.beginPath(); ctx.arc(px, py, pl.size, 0, Math.PI * 2); ctx.fill();
        // 土星环
        if (pl.hasRing) {
          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(-0.4);
          ctx.scale(1, 0.32);
          ctx.strokeStyle = pl.ringColor || "#fde68a";
          ctx.lineWidth = 2.5;
          ctx.globalAlpha = 0.85;
          ctx.beginPath(); ctx.arc(0, 0, pl.size * 1.7, 0, Math.PI * 2); ctx.stroke();
          ctx.globalAlpha = 0.4;
          ctx.beginPath(); ctx.arc(0, 0, pl.size * 2.0, 0, Math.PI * 2); ctx.stroke();
          ctx.globalAlpha = 1;
          ctx.restore();
        }
        // 已访问标记
        if (visited.has(pl.id)) {
          ctx.save();
          ctx.strokeStyle = "rgba(34,197,94,0.6)";
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.beginPath(); ctx.arc(px, py, pl.size + 8, 0, Math.PI * 2); ctx.stroke();
          ctx.setLineDash([]);
          ctx.restore();
        }
        // 名称
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.font = "bold 11px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(pl.name, px, py + pl.size + 14);
      }

      // 飞船
      const shipX = shipRef.current.x * W, shipY = shipRef.current.y * H;
      const ang = shipRef.current.angle || 0;
      ctx.save();
      ctx.translate(shipX, shipY);
      ctx.rotate(ang);
      // 尾光
      const tg = ctx.createLinearGradient(-22, 0, 0, 0);
      tg.addColorStop(0, "rgba(168,85,247,0.9)");
      tg.addColorStop(1, "rgba(168,85,247,0)");
      ctx.fillStyle = tg;
      ctx.beginPath();
      ctx.moveTo(-22, -3); ctx.lineTo(0, 0); ctx.lineTo(-22, 3);
      ctx.closePath(); ctx.fill();
      // 船体
      ctx.fillStyle = "#e9d5ff";
      ctx.beginPath();
      ctx.moveTo(10, 0); ctx.lineTo(-6, 6); ctx.lineTo(-3, 0); ctx.lineTo(-6, -6);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "#a855f7";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // 引擎粒子
      for (const p of particlesRef.current) {
        const a = 1 - p.life / p.maxLife;
        ctx.globalAlpha = a;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * a, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;

      // 流星
      for (const m of meteorsRef.current) {
        const a = 1 - m.life / m.maxLife;
        const len = 60;
        const grad = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 0.3, m.y - m.vy * 0.3);
        grad.addColorStop(0, "rgba(255,255,255," + a + ")");
        grad.addColorStop(1, "rgba(168,85,247,0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x - m.vx * 0.15, m.y - m.vy * 0.15);
        ctx.stroke();
      }

      // 点击波纹
      for (const r of ripplesRef.current) {
        const rad = r.t * 80;
        const a = 1 - r.t / 1.2;
        ctx.strokeStyle = r.color;
        ctx.globalAlpha = a * 0.7;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(r.x, r.y, rad, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = 1;
      }

      // 反馈闪屏
      if (feedback) {
        const fbg = ctx.createRadialGradient(feedback.x * W, feedback.y * H, 0, feedback.x * W, feedback.y * H, 200);
        fbg.addColorStop(0, feedback.kind === "ok" ? "rgba(34,197,94,0.35)" : "rgba(244,63,94,0.35)");
        fbg.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = fbg;
        ctx.beginPath(); ctx.arc(feedback.x * W, feedback.y * H, 200, 0, Math.PI * 2); ctx.fill();
      }

      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [visited, feedback]);

  return (
    <div ref={containerRef} className="relative w-full h-[calc(100vh-72px)] overflow-hidden bg-[#02010a]">
      {/* 顶部 HUD */}
      <div className="absolute top-0 left-0 right-0 z-40 px-5 py-4 flex items-center justify-between gap-4 backdrop-blur-md bg-black/30 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Link href="/" className="px-3 py-1.5 rounded-lg text-xs glass hover:bg-white/10 transition flex items-center gap-1.5">
            <span>←</span> {zh.game.back}
          </Link>
          <div>
            <div className="font-display text-base gradient-text leading-none">{zh.game.title}</div>
            <div className="text-[10px] text-white/40 mt-1">{zh.game.hint}</div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <button onClick={() => setShowRules(true)} className="text-white/60 hover:text-white transition">{zh.game.rules}</button>
          <div className="glass px-3 py-1.5 rounded-lg">
            <span className="text-white/50">{zh.game.bestScore}</span>
            <span className="ml-2 font-mono text-amber-300 font-bold">{bestScore}</span>
          </div>
          <div className="glass px-3 py-1.5 rounded-lg">
            <span className="text-white/50">{zh.game.progress}</span>
            <span className="ml-2 font-mono text-emerald-300 font-bold">{visited.size}/{total}</span>
          </div>
          <div className="glass px-3 py-1.5 rounded-lg">
            <span className="text-white/50">{zh.game.score}</span>
            <span className="ml-2 font-mono text-fuchsia-300 font-bold">{score}</span>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 pt-[72px]">
        <div className="relative w-full h-full">
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            className="w-full h-full block cursor-crosshair"
            style={{ imageRendering: "auto" }}
          />

          <AnimatePresence>
            {showQuiz && currentQ && activePlanetData && (
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                className="absolute right-4 top-4 bottom-4 w-80 z-20 glass-strong rounded-2xl p-5 overflow-y-auto"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-full"
                    style={{ background: "radial-gradient(circle at 30% 30%, #fff, " + activePlanetData.color + " 60%, #000)", boxShadow: "0 0 16px " + activePlanetData.glow }}
                  />
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-white/50">{zh.game.targetPlanet}</div>
                    <div className="font-display text-lg">{activePlanetData.name}</div>
                  </div>
                </div>
                <div className="text-sm font-medium text-white/90 mb-4 leading-relaxed">{currentQ.q}</div>
                <div className="space-y-2">
                  {currentQ.options.map((opt, i) => {
                    const isCorrect = i === currentQ.a;
                    const isPicked = selectedAnswer === i;
                    let cls = "w-full text-left px-3 py-2.5 rounded-xl text-sm transition border ";
                    if (!answered) cls += "bg-white/5 hover:bg-white/10 border-white/10 text-white/80";
                    else if (isCorrect) cls += "bg-emerald-500/20 border-emerald-400/50 text-emerald-100";
                    else if (isPicked) cls += "bg-rose-500/20 border-rose-400/50 text-rose-100";
                    else cls += "bg-white/5 border-white/5 text-white/40";
                    return (
                      <button key={i} disabled={answered} onClick={() => handleAnswer(i)} className={cls}>
                        {String.fromCharCode(65 + i)}. {opt}
                      </button>
                    );
                  })}
                </div>
                {answered && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
                    <div className={"text-sm font-medium mb-2 " + (selectedAnswer === currentQ.a ? "text-emerald-300" : "text-rose-300")}>
                      {selectedAnswer === currentQ.a ? zh.game.correct : zh.game.wrong}
                    </div>
                    <div className="text-xs text-white/60 leading-relaxed mb-3">{currentQ.fact}</div>
                    {visited.size === total ? (
                      <button onClick={() => setFinished(true)} className="btn-primary w-full text-sm py-2">{zh.game.finished}</button>
                    ) : (
                      <button onClick={handleNext} className="btn-primary w-full text-sm py-2">{zh.game.next}</button>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showRules && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm"
                onClick={() => setShowRules(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 10 }}
                  className="glass-strong rounded-2xl p-6 max-w-sm mx-4"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display text-lg gradient-text">{zh.game.rules}</h3>
                    <button onClick={() => setShowRules(false)} className="text-white/50 hover:text-white text-lg leading-none">×</button>
                  </div>
                  <p className="text-sm text-white/70 leading-relaxed">{zh.game.rulesList}</p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {finished && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-strong rounded-3xl p-8 max-w-md text-center mx-4">
              <div className="text-5xl mb-3">{"\ud83c\udf1f"}</div>
              <h2 className="font-display text-3xl gradient-text mb-2">{zh.game.finished}</h2>
              <p className="text-white/70 text-sm mb-2">{zh.game.finishedDesc}</p>
              {newRecord && <div className="text-amber-300 text-sm font-bold mb-2 animate-pulse">{zh.game.newRecord}</div>}
              <div className="text-sm text-white/50 mb-1">{zh.game.finalScore}</div>
              <div className="font-display text-5xl gradient-text mb-1">{score}</div>
              <div className="text-xs text-white/40 mb-6">{zh.game.bestScore}: {Math.max(score, bestScore)}</div>
              <div className="flex flex-col gap-2">
                <button onClick={handleRestart} className="btn-primary w-full">{zh.game.restart}</button>
                <Link href="/" className="btn-ghost w-full">{zh.game.back}</Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
