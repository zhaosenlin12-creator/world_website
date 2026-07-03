"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { zh } from "@/i18n/zh";

type Planet = {
  id: string;
  name: string;
  x: number; y: number;
  distance: number;
  size: number;
  color: string;
  glow: string;
  ringColor?: string;
  hasRing?: boolean;
  surface: "rocky" | "venus" | "earth" | "mars" | "gas" | "ringed" | "ice";
  question: { q: string; options: string[]; a: number; fact: string };
  mission: string;
};

type Scene = "INTRO" | "CRUISE" | "APPROACH" | "LANDED" | "MISSION" | "LAUNCH" | "FINISHED";

const CANVAS_W = 1280;
const CANVAS_H = 720;
const SUN_X = 0.05;
const SUN_Y = 0.50;
const SUN_R = 55;
const BEST_KEY = "cosmic-voyage-best";
const VISITED_KEY = "cosmic-voyage-visited";

const PLANETS: Planet[] = [
  { id: "mercury", name: "\u6c34\u661f", x: 0.18, y: 0.30, distance: 0.5, size: 12, color: "#a8a29e", glow: "rgba(168,162,158,0.4)", surface: "rocky", mission: "\u5728\u6c34\u661f\u8868\u9762\u91c7\u96c6\u9ed1\u8272\u53cd\u5c04\u7269\u8d28", question: { q: "\u6c34\u661f\u4e00\u592a\u9633\u65e5\u7ea6\u591a\u957f\uff1f", options: ["176 \u5730\u7403\u65e5", "88 \u5730\u7403\u65e5", "365 \u5730\u7403\u65e5", "58 \u5730\u7403\u65e5"], a: 1, fact: "\u6c34\u661f\u8f68\u9053\u5468\u671f\u6700\u77ed\uff0c\u4ec5 88 \u5730\u7403\u65e5\u5373\u8d70\u5b8c\u4e00\u5708\u3002" } },
  { id: "venus",   name: "\u91d1\u661f", x: 0.30, y: 0.65, distance: 0.6, size: 20, color: "#fcd34d", glow: "rgba(252,211,77,0.6)", surface: "venus", mission: "\u7a7f\u8fc7\u91d1\u661f\u539a\u91cd\u7684\u4e8c\u6c27\u5316\u78b3\u4e91\u5c42", question: { q: "\u4ee5\u4e0b\u54ea\u4e2a\u63cf\u8ff0\u4e0d\u9002\u7528\u4e8e\u91d1\u661f\uff1f", options: ["\u6700\u70ed\u7684\u884c\u661f", "\u53cd\u5411\u81ea\u8f6c", "\u8865\u592a\u9633\u8f68\u9053", "\u539a\u539a\u4e8c\u6c27\u5316\u78b3\u5927\u6c14"], a: 2, fact: "\u91d1\u661f\u662f\u6700\u70ed\u7684\u884c\u661f\uff0c\u81ea\u8f6c\u4e0e\u5176\u4ed6\u884c\u661f\u76f8\u53cd\uff0c\u88ab\u539a\u539a\u4e8c\u6c27\u5316\u78b3\u4e91\u5c42\u8986\u76d6\u3002" } },
  { id: "earth",   name: "\u5730\u7403", x: 0.42, y: 0.28, distance: 0.7, size: 22, color: "#3b82f6", glow: "rgba(59,130,246,0.7)", surface: "earth", mission: "\u5728\u5730\u7403\u8fd1\u5730\u8f68\u9053\u4e0a\u4fdd\u62a4\u751f\u547d\u793a\u4f8b", question: { q: "\u5730\u7403\u5927\u6c14\u4e2d\u6c27\u6c14\u7684\u4efd\u989d\u7ea6\u4e3a\uff1f", options: ["21%", "78%", "1%", "58%"], a: 0, fact: "\u5730\u7403\u5927\u6c14\u4e2d\u6c2e\u6c14 (N\u2082) \u7ea6 78%\uff0c\u6c27\u6c14 (O\u2082) \u7ea6 21%\u3002" } },
  { id: "mars",    name: "\u706b\u661f", x: 0.52, y: 0.70, distance: 0.8, size: 16, color: "#dc2626", glow: "rgba(220,38,38,0.6)", surface: "mars", mission: "\u7e22\u8d8a\u706b\u661f\u5965\u6797\u5339\u65af\u5c71\u9876\u90e8\u7684\u5ca9\u77f3", question: { q: "\u706b\u661f\u7684\u201c\u5965\u6797\u5339\u65af\u5c71\u201d\u662f\u4ec0\u4e48\uff1f", options: ["\u4e00\u5ea7\u706b\u5c71", "\u592a\u9633\u7cfb\u6700\u9ad8\u7684\u5c71", "\u4e00\u4e2a\u8f7d\u4eba\u98de\u8239\u9057\u5740", "\u4e00\u6761\u5e72\u57cb\u7684\u6cb3\u6d41"], a: 1, fact: "\u5965\u6797\u5339\u65af\u5c71\u9ad8\u8fbe 22 \u516c\u91cc\uff0c\u662f\u592a\u9633\u7cfb\u4e2d\u6700\u9ad8\u7684\u5c71\u8109\u3002" } },
  { id: "jupiter", name: "\u6728\u661f", x: 0.66, y: 0.32, distance: 1.1, size: 56, color: "#d97706", glow: "rgba(217,119,6,0.55)", surface: "gas", mission: "\u7a7f\u8fc7\u6728\u661f\u5927\u7ea2\u6597\u98ce\u66b4", question: { q: "\u6728\u661f\u7684\u201c\u5927\u7ea2\u6597\u201d\u662f\u4ec0\u4e48\uff1f", options: ["\u4e00\u9897\u536b\u661f", "\u4e00\u573a\u6c38\u6052\u7684\u98ce\u66b4", "\u4e00\u4e2a\u8d85\u7ea7\u706b\u5c71", "\u4e00\u9897\u8d85\u65b0\u661f"], a: 1, fact: "\u5927\u7ea2\u6597\u662f\u4e00\u573a\u5df2\u6301\u7eed\u6570\u767e\u5e74\u7684\u53cd\u6c14\u65cb\uff0c\u76f4\u5f84\u6bd4\u5730\u7403\u8fd8\u5927\u3002" } },
  { id: "saturn",  name: "\u571f\u661f", x: 0.78, y: 0.68, distance: 1.4, size: 50, color: "#eab308", glow: "rgba(234,179,8,0.5)", ringColor: "#fde68a", hasRing: true, surface: "ringed", mission: "\u7a7f\u8fc7\u571f\u661f\u73af\u5e26\u7684\u51b0\u96ea\u788e\u7247", question: { q: "\u571f\u661f\u7684\u73af\u4e3b\u8981\u7531\u4ec0\u4e48\u7ec4\u6210\uff1f", options: ["\u51b0\u4e0e\u5ca9\u77f3\u788e\u7247", "\u6c14\u4f53\u4e0e\u5c18\u57c3", "\u91d1\u5c5e\u4e0e\u77f3\u5934", "\u6cb3\u6d41\u4e0e\u6c99\u6f20"], a: 0, fact: "\u571f\u661f\u73af\u7531\u6570\u4ee5\u4ebf\u8ba1\u7684\u51b0\u3001\u5ca9\u77f3\u788e\u7247\u4e0e\u5c18\u57c3\u7ec4\u6210\u3002" } },
  { id: "uranus",  name: "\u5929\u738b\u661f", x: 0.87, y: 0.30, distance: 1.6, size: 32, color: "#22d3ee", glow: "rgba(34,211,238,0.6)", surface: "ice", mission: "\u7a7f\u8d8a\u5929\u738b\u661f\u7684\u504f\u8f74\u578b\u78c1\u5708", question: { q: "\u5929\u738b\u661f\u7684\u4e00\u4e2a\u72ec\u7279\u4e4b\u5904\u662f\uff1f", options: ["\u6700\u70ed\u7684\u884c\u661f", "\u4ee5 98\u00b0 \u89d2\u5ea6\u503e\u659c\u81ea\u8f6c", "\u6709\u751f\u547d", "\u6ca1\u6709\u592a\u9633\u7cfb\u5927\u6c14"], a: 1, fact: "\u5929\u738b\u661f\u7684\u81ea\u8f6c\u8f74\u4e0e\u8f68\u9053\u9762\u63a5\u8fd1 98\u00b0\uff0c\u662f\u552f\u4e00\u4e00\u9897\u201c\u8eba\u7740\u201d\u7684\u884c\u661f\u3002" } },
  { id: "neptune", name: "\u6d77\u738b\u661f", x: 0.93, y: 0.66, distance: 1.8, size: 30, color: "#1d4ed8", glow: "rgba(29,78,216,0.7)", surface: "ice", mission: "\u5b9d\u85cf\u5728\u6d77\u738b\u661f\u201c\u5927\u9ed1\u6597\u201d\u4e2d\u7684\u9ed1\u8272\u5c01\u95ed\u70b9", question: { q: "\u6d77\u738b\u661f\u4e0a\u7684\u201c\u5927\u9ed1\u6597\u201d\u662f\u4ec0\u4e48\uff1f", options: ["\u4e00\u4e2a\u706b\u5c71\u53e3", "\u4e00\u573a\u98ce\u66b4\u53cd\u6c14\u65cb", "\u4e00\u5757\u6df1\u8272\u5927\u9646", "\u4e00\u9897\u9ed1\u8272\u536b\u661f"], a: 1, fact: "\u5927\u9ed1\u6597\u662f\u4e00\u4e2a\u53cd\u6c14\u65cb\u98ce\u66b4\uff0c\u98ce\u901f\u8d85\u8fc7 2000 \u516c\u91cc/\u5c0f\u65f6\uff0c\u662f\u592a\u9633\u7cfb\u4e2d\u6700\u5feb\u7684\u98ce\u3002" } }
];

export function GameClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scene, setScene] = useState<Scene>("INTRO");
  const [activePlanet, setActivePlanet] = useState<string | null>(null);
  const [approachStart, setApproachStart] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [showApproachConfirm, setShowApproachConfirm] = useState(false);
  const [launchTime, setLaunchTime] = useState(0);
  const [dialogText, setDialogText] = useState<string>("");
  const [showBadge, setShowBadge] = useState(false);
  const [newRecord, setNewRecord] = useState(false);

  const shipRef = useRef({ x: 0.5, y: 0.5, vx: 0, vy: 0, angle: 0, dragging: false });
  const knowledgeOrbsRef = useRef<{ x: number; y: number; t: number; collected: boolean }[]>([]);
  const bgStarsFarRef = useRef<{ x: number; y: number; r: number; phase: number }[]>([]);
  const bgStarsMidRef = useRef<{ x: number; y: number; r: number; phase: number }[]>([]);
  const particlesRef = useRef<{ x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: string; size: number }[]>([]);
  const ripplesRef = useRef<{ x: number; y: number; t: number; color: string }[]>([]);
  const meteorsRef = useRef<{ x: number; y: number; vx: number; vy: number; life: number; maxLife: number }[]>([]);
  const cameraShakeRef = useRef<{ x: number; y: number; decay: number }>({ x: 0, y: 0, decay: 0 });
  const keysRef = useRef<Record<string, boolean>>({});
  const introStartRef = useRef<number>(0);

  useEffect(() => { try { const v = parseInt(localStorage.getItem(BEST_KEY) || "0", 10); if (!Number.isNaN(v)) setBestScore(v); const sv = localStorage.getItem(VISITED_KEY); if (sv) setVisited(new Set(JSON.parse(sv))); } catch {} }, []);

  useEffect(() => { const mk = (count: number, maxR: number) => Array.from({ length: count }, () => ({ x: Math.random() * CANVAS_W, y: Math.random() * CANVAS_H, r: Math.random() * maxR + 0.3, phase: Math.random() * Math.PI * 2 })); bgStarsFarRef.current = mk(280, 0.8); bgStarsMidRef.current = mk(120, 1.4); }, []);

  useEffect(() => {
    const dn = (e: KeyboardEvent) => { const k = e.key.toLowerCase(); if (["arrowup","arrowdown","arrowleft","arrowright","w","a","s","d"," "].includes(k)) { e.preventDefault(); keysRef.current[k] = true; } if (e.key === "Escape") { if (showApproachConfirm) setShowApproachConfirm(false); } };
    const up = (e: KeyboardEvent) => { keysRef.current[e.key.toLowerCase()] = false; };
    window.addEventListener("keydown", dn); window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", dn); window.removeEventListener("keyup", up); };
  }, [showApproachConfirm]);

  useEffect(() => { if (scene === "INTRO") { introStartRef.current = performance.now(); const t = setTimeout(() => { setDialogText("\u63a5\u4e0b\u6765\u9009\u62e9\u4e00\u4e2a\u884c\u661f\uff0c\u5f00\u59cb\u63a2\u9669\u3002"); setTimeout(() => setScene("CRUISE"), 3500); }, 4000); return () => clearTimeout(t); } }, [scene]);

  useEffect(() => { try { localStorage.setItem(VISITED_KEY, JSON.stringify(Array.from(visited))); } catch {} }, [visited]);
  useEffect(() => { if (scene === "FINISHED" && score > bestScore) { setBestScore(score); setNewRecord(true); try { localStorage.setItem(BEST_KEY, String(score)); } catch {} } }, [scene, score, bestScore]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const getPos = (e: MouseEvent | TouchEvent) => { const rect = canvas.getBoundingClientRect(); const cx = "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX; const cy = "touches" in e ? e.touches[0].clientY : (e as MouseEvent).clientY; return { x: (cx - rect.left) / rect.width, y: (cy - rect.top) / rect.height }; };
    const onDown = (e: MouseEvent) => { const p = getPos(e); if (scene === "CRUISE") { for (const pl of PLANETS) { const dx = (p.x - pl.x) * CANVAS_W; const dy = (p.y - pl.y) * CANVAS_H; if (Math.hypot(dx, dy) <= pl.size + 14) { setActivePlanet(pl.id); setShowApproachConfirm(true); ripplesRef.current.push({ x: pl.x * CANVAS_W, y: pl.y * CANVAS_H, t: 0, color: pl.color }); return; } } shipRef.current.x = p.x; shipRef.current.y = p.y; shipRef.current.dragging = true; } };
    const onMove = (e: MouseEvent) => { if (!shipRef.current.dragging) return; if (scene !== "CRUISE") return; const p = getPos(e); shipRef.current.x = p.x; shipRef.current.y = p.y; };
    const onUp = () => { shipRef.current.dragging = false; };
    canvas.addEventListener("mousedown", onDown); window.addEventListener("mousemove", onMove); window.addEventListener("mouseup", onUp);
    return () => { canvas.removeEventListener("mousedown", onDown); window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [scene]);

  const handleApproach = useCallback(() => { if (!activePlanet) return; setShowApproachConfirm(false); setApproachStart(performance.now()); setScene("APPROACH"); setTimeout(() => { const pl = PLANETS.find(p => p.id === activePlanet)!; setDialogText("\u00b7 \u63a5\u4e0b\u6765\uff1a" + pl.mission); setScene("LANDED"); knowledgeOrbsRef.current = Array.from({ length: 3 }, () => ({ x: 0.2 + Math.random() * 0.6, y: 0.3 + Math.random() * 0.45, t: 0, collected: false })); }, 2500); }, [activePlanet]);

  const handleCollectOrb = useCallback((idx: number) => { const orbs = knowledgeOrbsRef.current; if (orbs[idx].collected) return; orbs[idx].collected = true; ripplesRef.current.push({ x: orbs[idx].x * CANVAS_W, y: orbs[idx].y * CANVAS_H, t: 0, color: "#a855f7" }); cameraShakeRef.current = { x: 0, y: 0, decay: 0.6 }; if (orbs.every(o => o.collected)) { setTimeout(() => { setDialogText("\u4f60\u5df2\u83b7\u5f97\u8db3\u591f\u7684\u80fd\u91cf\uff0c\u73b0\u5728\u53ef\u4ee5\u542f\u52a8\u63a2\u9669\u4efb\u52a1\u3002"); setTimeout(() => setScene("MISSION"), 1500); }, 800); } }, []);

  const handleAnswer = useCallback((i: number) => { if (answered || !activePlanet) return; setSelectedAnswer(i); setAnswered(true); const pl = PLANETS.find(p => p.id === activePlanet)!; const ok = i === pl.question.a; if (ok) { setScore(s => s + 200); setVisited(v => { const next = new Set(v); next.add(activePlanet); return next; }); cameraShakeRef.current = { x: 0, y: 0, decay: 0.8 }; } else { cameraShakeRef.current = { x: 6, y: 6, decay: 0.5 }; } }, [answered, activePlanet]);

  const handleLaunchFromPlanet = useCallback(() => { if (!activePlanet) return; setLaunchTime(performance.now()); setScene("LAUNCH"); setTimeout(() => { setActivePlanet(null); setSelectedAnswer(null); setAnswered(false); setDialogText(""); if (visited.size === PLANETS.length) { setShowBadge(true); setTimeout(() => setScene("FINISHED"), 1500); } else { setDialogText("\u4f60\u5df2\u83b7\u5f97\u8be5\u884c\u661f\u7684\u6838\u5fc3\u6837\u672c\u3002\u5f80\u4e0b\u4e00\u4e2a\u76ee\u6807\u51fa\u53d1\u3002"); setTimeout(() => setScene("CRUISE"), 1500); } }, 2200); }, [activePlanet, visited.size]);

  const handleRestart = useCallback(() => { setScore(0); setVisited(new Set()); setActivePlanet(null); setSelectedAnswer(null); setAnswered(false); setShowBadge(false); setNewRecord(false); setDialogText(""); introStartRef.current = performance.now(); setScene("INTRO"); }, []);

  const currentPlanet = activePlanet ? PLANETS.find(p => p.id === activePlanet) : null;

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    let raf = 0; let lastSpawn = 0; let lastMeteor = 0;
    const render = (now: number) => {
      const t = now / 1000;
      const dt = 1 / 60;
      const W = canvas.width, H = canvas.height;

      if (scene === "CRUISE") {
        const k = keysRef.current; const sp = 0.0012; let dx = 0, dy = 0;
        if (k["arrowup"] || k["w"]) dy -= sp;
        if (k["arrowdown"] || k["s"]) dy += sp;
        if (k["arrowleft"] || k["a"]) dx -= sp;
        if (k["arrowright"] || k["d"]) dx += sp;
        if (dx || dy) { shipRef.current.x = Math.max(0.03, Math.min(0.97, shipRef.current.x + dx)); shipRef.current.y = Math.max(0.03, Math.min(0.97, shipRef.current.y + dy)); shipRef.current.vx = dx * 60; shipRef.current.vy = dy * 60; shipRef.current.angle = Math.atan2(dy, dx); } else { shipRef.current.vx *= 0.92; shipRef.current.vy *= 0.92; }
      }

      if ((scene === "CRUISE" || scene === "APPROACH" || scene === "LAUNCH") && now - lastSpawn > 28) {
        lastSpawn = now;
        const sx = shipRef.current.x * W, sy = shipRef.current.y * H;
        const speed = (scene === "APPROACH" || scene === "LAUNCH") ? 4 : 1;
        const ang = shipRef.current.angle + Math.PI + (Math.random() - 0.5) * 0.5;
        const pSpeed = (80 + Math.random() * 80) * speed;
        particlesRef.current.push({ x: sx, y: sy, vx: Math.cos(ang) * pSpeed, vy: Math.sin(ang) * pSpeed, life: 0, maxLife: 0.5 + Math.random() * 0.4, color: Math.random() < 0.5 ? "#a855f7" : "#22d3ee", size: 1.5 + Math.random() * 2.5 });
      }

      if (scene === "CRUISE" && now - lastMeteor > 2500) { lastMeteor = now; if (Math.random() < 0.6) { const sx2 = Math.random() * W; meteorsRef.current.push({ x: sx2, y: -20, vx: 100 + Math.random() * 100, vy: 200 + Math.random() * 150, life: 0, maxLife: 2.0 }); } }

      for (const p of particlesRef.current) { p.life += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.98; p.vy *= 0.98; }
      particlesRef.current = particlesRef.current.filter(p => p.life < p.maxLife);
      for (const m of meteorsRef.current) { m.life += dt; m.x += m.vx * dt; m.y += m.vy * dt; }
      meteorsRef.current = meteorsRef.current.filter(m => m.life < m.maxLife && m.y < H + 50);
      for (const r of ripplesRef.current) { r.t += dt; }
      ripplesRef.current = ripplesRef.current.filter(r => r.t < 1.2);
      cameraShakeRef.current.decay = Math.max(0, cameraShakeRef.current.decay - dt * 2);
      cameraShakeRef.current.x *= 0.9; cameraShakeRef.current.y *= 0.9;

      ctx.save();
      const sx0 = cameraShakeRef.current.x; const sy0 = cameraShakeRef.current.y;
      ctx.translate(sx0, sy0);

      const grad = ctx.createRadialGradient(W * 0.5, H * 0.5, 0, W * 0.5, H * 0.5, W * 0.7);
      grad.addColorStop(0, "#0a0820"); grad.addColorStop(0.5, "#050414"); grad.addColorStop(1, "#02010a");
      ctx.fillStyle = grad; ctx.fillRect(-20, -20, W + 40, H + 40);

      for (const s of bgStarsFarRef.current) { const a = 0.3 + 0.4 * Math.sin(t * 0.6 + s.phase); ctx.globalAlpha = a; ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill(); }
      for (const s of bgStarsMidRef.current) { const a = 0.5 + 0.5 * Math.sin(t * 0.9 + s.phase); ctx.globalAlpha = a; ctx.fillStyle = "#dbe9ff"; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill(); }
      ctx.globalAlpha = 1;

      for (let i = 0; i < 60; i++) { const ang = t * 0.04 + i * 0.7; const r = 380 + (i % 3) * 12; const ax = W * 0.5 + Math.cos(ang) * r; const ay = H * 0.5 + Math.sin(ang) * r * 0.4; ctx.fillStyle = "rgba(180,170,150,0.35)"; ctx.beginPath(); ctx.arc(ax, ay, 1.3, 0, Math.PI * 2); ctx.fill(); }

      if (scene === "INTRO" || scene === "CRUISE" || scene === "FINISHED") {
        renderSpaceScene(ctx, W, H, t, scene);
      } else if (scene === "APPROACH") {
        renderApproach(ctx, W, H, t, currentPlanet);
      } else if (scene === "LANDED" || scene === "MISSION") {
        renderSurface(ctx, W, H, t, currentPlanet, scene === "MISSION");
      } else if (scene === "LAUNCH") {
        renderLaunch(ctx, W, H, t, currentPlanet);
      }

      for (const m of meteorsRef.current) { const a = 1 - m.life / m.maxLife; const grad2 = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 0.3, m.y - m.vy * 0.3); grad2.addColorStop(0, "rgba(255,255,255," + a + ")"); grad2.addColorStop(1, "rgba(168,85,247,0)"); ctx.strokeStyle = grad2; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(m.x - m.vx * 0.15, m.y - m.vy * 0.15); ctx.stroke(); }

      for (const r of ripplesRef.current) { const rad = r.t * 80; const a = 1 - r.t / 1.2; ctx.strokeStyle = r.color; ctx.globalAlpha = a * 0.7; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(r.x, r.y, rad, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1; }

      for (const p of particlesRef.current) { const a = 1 - p.life / p.maxLife; ctx.globalAlpha = a; ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.size * a, 0, Math.PI * 2); ctx.fill(); }
      ctx.globalAlpha = 1; ctx.restore(); raf = requestAnimationFrame(render);
    };

    function renderSpaceScene(ctx: CanvasRenderingContext2D, W: number, H: number, t: number, s: Scene) {
      const sunX = SUN_X * W, sunY = SUN_Y * H;
      const sg = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, SUN_R * 2.2);
      sg.addColorStop(0, "rgba(255,230,120,0.95)"); sg.addColorStop(0.25, "rgba(255,170,60,0.7)"); sg.addColorStop(0.6, "rgba(255,90,30,0.2)"); sg.addColorStop(1, "rgba(255,80,30,0)");
      ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(sunX, sunY, SUN_R * 2.2, 0, Math.PI * 2); ctx.fill();
      const cg = ctx.createRadialGradient(sunX - 12, sunY - 12, 4, sunX, sunY, SUN_R);
      cg.addColorStop(0, "#fff7d6"); cg.addColorStop(0.6, "#fbbf24"); cg.addColorStop(1, "#f97316");
      ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(sunX, sunY, SUN_R, 0, Math.PI * 2); ctx.fill();

      for (const pl of PLANETS) {
        const orbitAng = (s === "CRUISE" || s === "FINISHED") ? t * 0.05 * pl.distance : 0;
        const baseX = pl.x * W, baseY = pl.y * H;
        const wx = Math.cos(orbitAng) * 4; const wy = Math.sin(orbitAng * 1.2) * 3;
        const px = baseX + wx, py = baseY + wy;
        ctx.strokeStyle = "rgba(255,255,255,0.05)"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(W * 0.5, H * 0.5, Math.hypot(baseX - W * 0.5, baseY - H * 0.5), 0, Math.PI * 2); ctx.stroke();
        const gl = ctx.createRadialGradient(px, py, pl.size * 0.5, px, py, pl.size * 2.2);
        gl.addColorStop(0, pl.glow); gl.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(px, py, pl.size * 2.2, 0, Math.PI * 2); ctx.fill();
        const pg = ctx.createRadialGradient(px - pl.size * 0.3, py - pl.size * 0.3, 2, px, py, pl.size);
        pg.addColorStop(0, "#fff"); pg.addColorStop(0.3, pl.color); pg.addColorStop(1, "#000");
        ctx.fillStyle = pg; ctx.beginPath(); ctx.arc(px, py, pl.size, 0, Math.PI * 2); ctx.fill();
        if (pl.hasRing) { ctx.save(); ctx.translate(px, py); ctx.rotate(-0.4); ctx.scale(1, 0.32); ctx.strokeStyle = pl.ringColor || "#fde68a"; ctx.lineWidth = 2.5; ctx.globalAlpha = 0.85; ctx.beginPath(); ctx.arc(0, 0, pl.size * 1.7, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 0.4; ctx.beginPath(); ctx.arc(0, 0, pl.size * 2.0, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1; ctx.restore(); }
        if (visited.has(pl.id)) { ctx.save(); ctx.strokeStyle = "rgba(34,197,94,0.7)"; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.arc(px, py, pl.size + 9, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]); ctx.restore(); }
        ctx.fillStyle = "rgba(255,255,255,0.85)"; ctx.font = "bold 11px sans-serif"; ctx.textAlign = "center"; ctx.fillText(pl.name, px, py + pl.size + 14);
      }

      if (s === "CRUISE" || s === "FINISHED") {
        const sx2 = shipRef.current.x * W, sy2 = shipRef.current.y * H;
        const ang = shipRef.current.angle || 0;
        ctx.save(); ctx.translate(sx2, sy2); ctx.rotate(ang);
        const tg = ctx.createLinearGradient(-22, 0, 0, 0); tg.addColorStop(0, "rgba(168,85,247,0.9)"); tg.addColorStop(1, "rgba(168,85,247,0)");
        ctx.fillStyle = tg; ctx.beginPath(); ctx.moveTo(-22, -3); ctx.lineTo(0, 0); ctx.lineTo(-22, 3); ctx.closePath(); ctx.fill();
        ctx.fillStyle = "#e9d5ff"; ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(-6, 6); ctx.lineTo(-3, 0); ctx.lineTo(-6, -6); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = "#a855f7"; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
      }
    }

    function renderApproach(ctx: CanvasRenderingContext2D, W: number, H: number, t: number, pl: Planet | null) {
      if (!pl) return;
      const grad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.7);
      grad.addColorStop(0, "#0a0820"); grad.addColorStop(1, "#02010a");
      ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
      const elapsed = (performance.now() - approachStart) / 1000;
      const scale = 1 + elapsed * 4;
      const px = W / 2, py = H / 2;
      const gl = ctx.createRadialGradient(px, py, pl.size * scale, px, py, pl.size * scale * 3);
      gl.addColorStop(0, pl.glow); gl.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(px, py, pl.size * scale * 3, 0, Math.PI * 2); ctx.fill();
      const pg = ctx.createRadialGradient(px - pl.size * scale * 0.3, py - pl.size * scale * 0.3, 2, px, py, pl.size * scale);
      pg.addColorStop(0, "#fff"); pg.addColorStop(0.3, pl.color); pg.addColorStop(1, "#000");
      ctx.fillStyle = pg; ctx.beginPath(); ctx.arc(px, py, pl.size * scale, 0, Math.PI * 2); ctx.fill();
      if (pl.hasRing) { ctx.save(); ctx.translate(px, py); ctx.rotate(-0.4); ctx.scale(scale, scale * 0.32); ctx.strokeStyle = pl.ringColor || "#fde68a"; ctx.lineWidth = 2.5; ctx.globalAlpha = 0.85; ctx.beginPath(); ctx.arc(0, 0, pl.size * 1.7, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
      const lineAlpha = Math.min(1, elapsed * 0.8);
      ctx.globalAlpha = lineAlpha;
      for (let i = 0; i < 40; i++) { const a = (i / 40) * Math.PI * 2; ctx.strokeStyle = "rgba(168,85,247,0.4)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(W / 2 + Math.cos(a) * 50, H / 2 + Math.sin(a) * 50); ctx.lineTo(W / 2 + Math.cos(a) * (W * 0.6), H / 2 + Math.sin(a) * (H * 0.6)); ctx.stroke(); }
      ctx.globalAlpha = 1;
    }

    function renderSurface(ctx: CanvasRenderingContext2D, W: number, H: number, t: number, pl: Planet | null, isMission: boolean) {
      if (!pl) return;
      const sky = getSkyColor(pl.surface);
      const skyG = ctx.createLinearGradient(0, 0, 0, H); skyG.addColorStop(0, sky[0]); skyG.addColorStop(1, sky[1]);
      ctx.fillStyle = skyG; ctx.fillRect(0, 0, W, H);
      const horizonY = H * 0.55;
      const gc = getGroundColor(pl.surface);
      const gg = ctx.createLinearGradient(0, horizonY, 0, H); gg.addColorStop(0, gc[0]); gg.addColorStop(1, gc[1]);
      ctx.fillStyle = gg; ctx.fillRect(0, horizonY, W, H - horizonY);
      ctx.strokeStyle = "rgba(0,0,0,0.15)"; ctx.lineWidth = 1;
      for (let i = 0; i < 25; i++) { const by = horizonY + (i / 25) * (H - horizonY); ctx.beginPath(); for (let x = 0; x < W; x += 8) { const yy = by + Math.sin(x * 0.04 + i * 0.3) * 2 * (i / 25); if (x === 0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy); } ctx.stroke(); }
      for (let i = 0; i < 30; i++) { const rx = ((i * 73) % 1000) / 1000; const ry = horizonY + ((i * 41) % 100) / 100 * (H - horizonY); const rr = 4 + ((i * 17) % 12); ctx.fillStyle = gc[1]; ctx.globalAlpha = 0.7; ctx.beginPath(); ctx.arc(rx * W, ry, rr, 0, Math.PI * 2); ctx.fill(); }
      ctx.globalAlpha = 1;

      const pX = W * 0.85; const pY = H * 0.18;
      ctx.save(); ctx.translate(pX, pY);
      const cgrad = ctx.createRadialGradient(-6, -6, 2, 0, 0, 22);
      cgrad.addColorStop(0, "#fff"); cgrad.addColorStop(0.4, pl.color); cgrad.addColorStop(1, "#000");
      ctx.fillStyle = cgrad; ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI * 2); ctx.fill();
      const rgrad = ctx.createRadialGradient(0, 0, 22, 0, 0, 50); rgrad.addColorStop(0, pl.glow); rgrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = rgrad; ctx.beginPath(); ctx.arc(0, 0, 50, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      if (!isMission) {
        const sx2 = W * 0.4, sy2 = H * 0.75;
        ctx.save(); ctx.translate(sx2, sy2); ctx.rotate(-0.2);
        ctx.fillStyle = "#e9d5ff"; ctx.beginPath(); ctx.moveTo(20, 0); ctx.lineTo(-12, 12); ctx.lineTo(-6, 0); ctx.lineTo(-12, -12); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = "#a855f7"; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.strokeStyle = "rgba(168,85,247,0.5)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(-12, 18); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, 12); ctx.lineTo(0, 18); ctx.stroke();
        const fg = ctx.createLinearGradient(0, 18, 0, 36); fg.addColorStop(0, "rgba(168,85,247,0.9)"); fg.addColorStop(1, "rgba(168,85,247,0)");
        ctx.fillStyle = fg; ctx.beginPath(); ctx.moveTo(-12, 18); ctx.lineTo(-8, 36); ctx.lineTo(-4, 18); ctx.moveTo(0, 18); ctx.lineTo(4, 36); ctx.lineTo(8, 18); ctx.fill();
        ctx.restore();
      }

      if (!isMission) {
        for (let i = 0; i < knowledgeOrbsRef.current.length; i++) {
          const orb = knowledgeOrbsRef.current[i]; if (orb.collected) continue;
          const x = orb.x * W, y = orb.y * H;
          const pulse = 1 + Math.sin(t * 3 + i) * 0.15;
          ctx.save(); ctx.shadowColor = "#a855f7"; ctx.shadowBlur = 20;
          const og = ctx.createRadialGradient(x, y, 0, x, y, 18 * pulse); og.addColorStop(0, "#fff"); og.addColorStop(0.4, "#d8b4fe"); og.addColorStop(1, "rgba(168,85,247,0)");
          ctx.fillStyle = og; ctx.beginPath(); ctx.arc(x, y, 18 * pulse, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
          ctx.strokeStyle = "rgba(168,85,247,0.3)"; ctx.lineWidth = 1.5; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.arc(x, y, 28, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
          ctx.fillStyle = "#1a0a2e"; ctx.font = "bold 14px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("?", x, y);
        }
      }
    }

    function renderLaunch(ctx: CanvasRenderingContext2D, W: number, H: number, t: number, pl: Planet | null) {
      if (!pl) return;
      const elapsed = (performance.now() - launchTime) / 1000;
      const alpha = Math.max(0, 1 - elapsed / 2.2);
      const sky = getSkyColor(pl.surface);
      ctx.fillStyle = sky[0]; ctx.globalAlpha = alpha; ctx.fillRect(0, 0, W, H);
      const sx2 = W * 0.4, sy2 = H * 0.75 - elapsed * 200;
      ctx.save(); ctx.translate(sx2, sy2); ctx.rotate(-0.2);
      ctx.fillStyle = "#e9d5ff"; ctx.beginPath(); ctx.moveTo(20, 0); ctx.lineTo(-12, 12); ctx.lineTo(-6, 0); ctx.lineTo(-12, -12); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "#a855f7"; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
      const fg = ctx.createLinearGradient(sx2, sy2 + 20, sx2, sy2 + 100); fg.addColorStop(0, "rgba(255,200,100,0.95)"); fg.addColorStop(0.4, "rgba(255,90,30,0.8)"); fg.addColorStop(1, "rgba(168,85,247,0)");
      ctx.fillStyle = fg; ctx.beginPath(); ctx.moveTo(sx2 - 14, sy2 + 20); ctx.lineTo(sx2 - 8, sy2 + 80); ctx.lineTo(sx2 - 4, sy2 + 20); ctx.moveTo(sx2, sy2 + 20); ctx.lineTo(sx2 + 6, sy2 + 100); ctx.lineTo(sx2 + 12, sy2 + 20); ctx.fill();
      ctx.globalAlpha = 1;
    }

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [scene, currentPlanet, approachStart, launchTime, visited]);

  return (
    <div className="relative w-full h-[calc(100vh-72px)] overflow-hidden bg-[#02010a]">
      <div className="absolute top-0 left-0 right-0 z-40 px-5 py-4 flex items-center justify-between gap-4 backdrop-blur-md bg-black/30 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Link href="/" className="px-3 py-1.5 rounded-lg text-xs glass hover:bg-white/10 transition flex items-center gap-1.5"><span>{"\u2190"}</span> {zh.game.back}</Link>
          <div><div className="font-display text-base gradient-text leading-none">{zh.game.title}</div><div className="text-[10px] text-white/40 mt-1">{zh.game.hint}</div></div>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="glass px-3 py-1.5 rounded-lg"><span className="text-white/50">{zh.game.bestScore}</span><span className="ml-2 font-mono text-amber-300 font-bold">{bestScore}</span></div>
          <div className="glass px-3 py-1.5 rounded-lg"><span className="text-white/50">{zh.game.progress}</span><span className="ml-2 font-mono text-emerald-300 font-bold">{visited.size}/{PLANETS.length}</span></div>
          <div className="glass px-3 py-1.5 rounded-lg"><span className="text-white/50">{zh.game.score}</span><span className="ml-2 font-mono text-fuchsia-300 font-bold">{score}</span></div>
        </div>
      </div>

      <div className="absolute inset-0 pt-[72px]"><div className="relative w-full h-full">
        <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H}
          className={"w-full h-full block " + (scene === "CRUISE" ? "cursor-crosshair" : "cursor-default")}
          onClick={(e) => { if (scene === "LANDED") { const rect = (e.target as HTMLCanvasElement).getBoundingClientRect(); const mx = ((e.clientX - rect.left) / rect.width); const my = ((e.clientY - rect.top) / rect.height); for (let i = 0; i < knowledgeOrbsRef.current.length; i++) { const o = knowledgeOrbsRef.current[i]; if (o.collected) continue; const dx = (mx - o.x) * CANVAS_W; const dy = (my - o.y) * CANVAS_H; if (Math.hypot(dx, dy) < 40) { handleCollectOrb(i); break; } } } }}
        />

        <AnimatePresence>{scene === "INTRO" && (
          <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
            <div className="text-center max-w-3xl px-6">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3, duration: 0.8 }} className="text-amber-200/80 text-sm tracking-[0.4em] uppercase mb-4">{"\u00b7 \u5b87\u822a\u4f20\u9001\u4e2d \u00b7"}</motion.div>
              <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6, duration: 0.8 }} className="font-display text-4xl md:text-6xl font-semibold gradient-text mb-6">{zh.game.title}</motion.h1>
              <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.0, duration: 0.8 }} className="text-white/80 text-base md:text-lg leading-relaxed">{zh.game.subtitle}</motion.p>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6, duration: 0.8 }} className="mt-8 text-white/40 text-xs tracking-widest">{zh.game.loading}</motion.div>
            </div>
          </motion.div>
        )}</AnimatePresence>

        <AnimatePresence>{showApproachConfirm && currentPlanet && (
          <motion.div key="confirm" initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 glass-strong rounded-2xl p-6 max-w-sm mx-4 text-center">
            <div className="text-3xl mb-2">{"\ud83d\ude80"}</div>
            <h3 className="font-display text-2xl gradient-text mb-2">{currentPlanet.name}</h3>
            <p className="text-white/70 text-sm leading-relaxed mb-4">{zh.game.confirmDesc.replace("{planet}", currentPlanet.name)}</p>
            <p className="text-white/50 text-xs mb-5 italic">{"\u00b7 " + currentPlanet.mission + " \u00b7"}</p>
            <div className="flex gap-2">
              <button onClick={() => { setShowApproachConfirm(false); setActivePlanet(null); }} className="btn-ghost flex-1 py-2 text-sm">{zh.game.cancel}</button>
              <button onClick={handleApproach} className="btn-primary flex-1 py-2 text-sm">{zh.game.launchShip}</button>
            </div>
          </motion.div>
        )}</AnimatePresence>

        <AnimatePresence>{dialogText && (scene === "LANDED" || scene === "LAUNCH" || scene === "MISSION" || (scene === "CRUISE" && dialogText && visited.size > 0)) && (
          <motion.div key="dialog" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="absolute left-1/2 -translate-x-1/2 bottom-6 z-30 max-w-2xl mx-4">
            <div className="glass-strong rounded-2xl px-5 py-3 text-center"><div className="text-sm text-white/90">{dialogText}</div></div>
          </motion.div>
        )}</AnimatePresence>

        <AnimatePresence>{scene === "MISSION" && currentPlanet && (
          <motion.div key="quiz" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} className="absolute right-4 top-4 bottom-4 w-80 glass-strong rounded-2xl p-5 overflow-y-auto z-20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full" style={{ background: "radial-gradient(circle at 30% 30%, #fff, " + currentPlanet.color + " 60%, #000)", boxShadow: "0 0 16px " + currentPlanet.glow }} />
              <div><div className="text-[10px] uppercase tracking-widest text-white/50">{zh.game.targetPlanet}</div><div className="font-display text-lg">{currentPlanet.name}</div></div>
            </div>
            <div className="text-xs text-purple-300 mb-3 font-medium">{"\u4efb\u52a1\uff1a" + currentPlanet.mission}</div>
            <div className="text-sm font-medium text-white/90 mb-4 leading-relaxed">{currentPlanet.question.q}</div>
            <div className="space-y-2">
              {currentPlanet.question.options.map((opt, i) => {
                const isCorrect = i === currentPlanet.question.a; const isPicked = selectedAnswer === i;
                let cls = "w-full text-left px-3 py-2.5 rounded-xl text-sm transition border ";
                if (!answered) cls += "bg-white/5 hover:bg-white/10 border-white/10 text-white/80";
                else if (isCorrect) cls += "bg-emerald-500/20 border-emerald-400/50 text-emerald-100";
                else if (isPicked) cls += "bg-rose-500/20 border-rose-400/50 text-rose-100";
                else cls += "bg-white/5 border-white/5 text-white/40";
                return <button key={i} disabled={answered} onClick={() => handleAnswer(i)} className={cls}>{String.fromCharCode(65 + i)}. {opt}</button>;
              })}
            </div>
            {answered && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
                <div className={"text-sm font-medium mb-2 " + (selectedAnswer === currentPlanet.question.a ? "text-emerald-300" : "text-rose-300")}>{selectedAnswer === currentPlanet.question.a ? zh.game.correct : zh.game.wrong}</div>
                <div className="text-xs text-white/60 leading-relaxed mb-3">{currentPlanet.question.fact}</div>
                <button onClick={handleLaunchFromPlanet} className="btn-primary w-full text-sm py-2">{zh.game.takeoff} {"\u2192"}</button>
              </motion.div>
            )}
          </motion.div>
        )}</AnimatePresence>
      </div></div>

      <AnimatePresence>{scene === "FINISHED" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-strong rounded-3xl p-8 max-w-md text-center mx-4">
            <div className="text-6xl mb-3">{showBadge ? "\ud83c\udfc5" : "\ud83c\udf1f"}</div>
            <h2 className="font-display text-3xl gradient-text mb-2">{zh.game.finished}</h2>
            <p className="text-white/70 text-sm mb-2">{zh.game.finishedDesc}</p>
            {newRecord && <div className="text-amber-300 text-sm font-bold mb-2 animate-pulse">{zh.game.newRecord}</div>}
            <div className="text-sm text-white/50 mb-1">{zh.game.finalScore}</div>
            <div className="font-display text-5xl gradient-text mb-1">{score}</div>
            <div className="text-xs text-white/40 mb-6">{zh.game.bestScore}: {Math.max(score, bestScore)}</div>
            <div className="flex flex-col gap-2"><button onClick={handleRestart} className="btn-primary w-full">{zh.game.restart}</button><Link href="/" className="btn-ghost w-full">{zh.game.back}</Link></div>
          </motion.div>
        </motion.div>
      )}</AnimatePresence>
    </div>
  );
}

function getSkyColor(s: Planet["surface"]): [string, string] { switch (s) { case "rocky": return ["#1a0f0a", "#3a2418"]; case "venus": return ["#3d2812", "#6b4015"]; case "earth": return ["#0a1a3a", "#1a3060"]; case "mars": return ["#3d1a0a", "#6b2c15"]; case "gas": return ["#1a1a3a", "#3a2815"]; case "ringed": return ["#1a1a2a", "#2d2515"]; case "ice": return ["#0a1a2a", "#1a3548"]; } }
function getGroundColor(s: Planet["surface"]): [string, string] { switch (s) { case "rocky": return ["#5a4530", "#2a1f15"]; case "venus": return ["#8b5a25", "#4a2a10"]; case "earth": return ["#2d4a25", "#1a2a15"]; case "mars": return ["#8b3a1a", "#4a1f0a"]; case "gas": return ["#5a4525", "#2a2015"]; case "ringed": return ["#5a4825", "#2a2215"]; case "ice": return ["#3a4a5a", "#1a2a35"]; } }
