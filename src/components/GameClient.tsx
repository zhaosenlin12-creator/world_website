"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { zh } from "@/i18n/zh";
import { GameWorld, BODIES } from "./GameWorld";

type PlanetId = "mercury" | "venus" | "earth" | "mars" | "jupiter" | "saturn" | "uranus" | "neptune";
type Scene = "INTRO" | "PLAY" | "FINISHED";

const PLANET_ORDER: PlanetId[] = ["mercury", "venus", "earth", "mars", "jupiter", "saturn", "uranus", "neptune"];

const QUESTIONS: Record<PlanetId, { q: string; options: string[]; a: number; fact: string }> = {
  mercury: { q: "水星一太阳日约多长？", options: ["176 地球日", "88 地球日", "365 地球日", "58 地球日"], a: 1, fact: "水星是太阳系中轨道周期最短的行星,只需 88 地球日即绕太阳一圈。" },
  venus:   { q: "以下哪个描述不适用于金星？", options: ["最热的行星", "反向自转", "在地球轨道内侧", "厚厚二氧化碳大气"], a: 2, fact: "金星是太阳系最热的行星,自转与多数行星相反,被厚厚二氧化碳云层覆盖。" },
  earth:   { q: "地球大气中氧气份额约为？", options: ["21%", "78%", "1%", "58%"], a: 0, fact: "地球大气中氮气 (N₂) 约 78%,氧气 (O₂) 约 21%,这一氧气份额是孕育生命的关键。" },
  mars:    { q: "火星的「奥林匹斯山」是什么？", options: ["一座火山", "太阳系最高的山", "飞船遗址", "干涸的河床"], a: 1, fact: "奥林匹斯山高约 22 公里,是太阳系已知的最高山峰,约是珠穆朗玛峰的 2.5 倍。" },
  jupiter: { q: "木星的「大红斑」是什么？", options: ["一颗卫星", "一场持续数百年的风暴", "超级火山", "一颗超新星"], a: 1, fact: "大红斑是木星上一场已持续 350 多年的反气旋风暴,直径比地球还大。" },
  saturn:  { q: "土星环主要由什么组成？", options: ["冰与岩石碎片", "气体与尘埃", "金属与岩石", "河流与沙漠"], a: 0, fact: "土星环由数以亿计的冰、岩石碎片与尘埃组成,颗粒从微米到数百米不等。" },
  uranus:  { q: "天王星最独特之处是？", options: ["最热的行星", "以约 98° 角倾斜自转", "有生命", "无大气"], a: 1, fact: "天王星自转轴与公转轨道面接近 98°,是太阳系唯一「躺着」自转的行星。" },
  neptune: { q: "海王星的「大黑斑」是什么？", options: ["火山口", "反气旋风暴", "深色大陆", "黑色卫星"], a: 1, fact: "大黑斑是反气旋风暴,风速超过 2000 公里/小时,是太阳系中最快的风。" }
};

const STORAGE_KEY = "marble_quest_best_v1";
const COLLECT_KIND_LABEL: Record<string, string> = { star: "恒星样本", crystal: "水晶样本", ankh: "安卡样本", ruby: "红宝石样本", apple: "果实样本" };

// 简单的 Web Audio API 生成效果声
function useSound() {
  const ctxRef = useRef<AudioContext | null>(null);
  const enabled = useRef(true);
  useEffect(() => {
    if (typeof window !== "undefined" && !ctxRef.current) {
      const Ctx = (window.AudioContext || (window as any).webkitAudioContext);
      if (Ctx) ctxRef.current = new Ctx();
    }
  }, []);
  const play = useCallback((freq: number, dur: number, type: OscillatorType = "sine", vol = 0.15) => {
    if (!enabled.current || !ctxRef.current) return;
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
    collect: () => { play(880, 0.08, "sine", 0.18); setTimeout(() => play(1320, 0.1, "sine", 0.15), 50); },
    hazard: () => { play(180, 0.18, "sawtooth", 0.2); },
    jump: () => { play(440, 0.06, "sine", 0.1); },
    win: () => { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => play(f, 0.2, "sine", 0.2), i * 100)); },
    lose: () => { [400, 300, 200, 100].forEach((f, i) => setTimeout(() => play(f, 0.3, "sawtooth", 0.15), i * 120)); },
    enabled
  };
}

export function GameClient() {
  const [webglOK, setWebglOK] = useState(true);
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const c = document.createElement("canvas");
      const gl = c.getContext("webgl2") || c.getContext("webgl");
      if (!gl) setWebglOK(false);
    } catch (e) { setWebglOK(false); }
  }, []);

  const [scene, setScene] = useState<Scene>("INTRO");
  const [activeIdx, setActiveIdx] = useState(0);
  const activePlanet = PLANET_ORDER[activeIdx];
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [shields, setShields] = useState(100);
  const [lives, setLives] = useState(3);
  const [collectedItems, setCollectedItems] = useState(0);
  const [targetItems, setTargetItems] = useState(3);
  const [distance, setDistance] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [showQ, setShowQ] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [samples, setSamples] = useState<Set<PlanetId>>(new Set());
  const [newRecord, setNewRecord] = useState(false);
  const [missionLog, setMissionLog] = useState<string[]>(["[任务] 探索太阳系全部 8 颗行星"]);
  const [hint, setHint] = useState<string>("WASD/方向键 驾驶 · 空格跳跃 · 收集所有能量样本");
  const [flashRed, setFlashRed] = useState(false);
  const [flashGreen, setFlashGreen] = useState(false);
  const [floatScore, setFloatScore] = useState<{ id: number; x: number; y: number; text: string; color: string }[]>([]);
  const [combo, setCombo] = useState(0);
  const sound = useSound();
  const comboTimer = useRef(0);

  useEffect(() => {
    try { const v = localStorage.getItem(STORAGE_KEY); if (v) setBestScore(Number(v)); } catch {}
  }, []);

  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
      try { localStorage.setItem(STORAGE_KEY, String(score)); } catch {}
      setNewRecord(true);
    } else { setNewRecord(false); }
  }, [score]);

  useEffect(() => {
    if (scene === "INTRO") {
      const t = setTimeout(() => setScene("PLAY"), 2800);
      return () => clearTimeout(t);
    }
  }, [scene]);

  const log = useCallback((msg: string) => {
    setMissionLog((l) => [...l.slice(-9), msg]);
  }, []);

  const addFloat = useCallback((text: string, color: string) => {
    const id = Date.now() + Math.random();
    setFloatScore((arr) => [...arr.slice(-7), { id, x: 30 + Math.random() * 50, y: 30 + Math.random() * 30, text, color }]);
    setTimeout(() => setFloatScore((arr) => arr.filter((f) => f.id !== id)), 1200);
  }, []);

  const handleCollect = useCallback((kind: string) => {
    setCollectedItems((c) => c + 1);
    setCombo((c) => c + 1);
    if (comboTimer.current) clearTimeout(comboTimer.current);
    comboTimer.current = window.setTimeout(() => setCombo(0), 1800);
    const points = 50 + Math.min(combo, 5) * 10;
    setScore((s) => s + points);
    sound.collect();
    log("[收集] " + (COLLECT_KIND_LABEL[kind] || kind) + " +" + points);
    addFloat("+" + points, kind === "star" ? "#fbbf24" : kind === "crystal" ? "#22d3ee" : kind === "ruby" ? "#dc2626" : kind === "ankh" ? "#a855f7" : "#10b981");
    setFlashGreen(true);
    setTimeout(() => setFlashGreen(false), 250);
  }, [log, addFloat, combo, sound]);

  const handleHazard = useCallback(() => {
    setShields((s) => {
      const next = Math.max(0, s - 25);
      if (next === 0) {
        setLives((l) => {
          const ln = l - 1;
          sound.hazard();
          if (ln <= 0) {
            log("[全废] 超出生命上限");
            setTimeout(() => { sound.lose(); setScene("FINISHED"); }, 800);
          } else {
            log("[警报] 护盾被破 · 剩余生命 " + ln);
            setShields(100);
          }
          return ln;
        });
      } else {
        sound.hazard();
      }
      return next;
    });
    setFlashRed(true);
    setTimeout(() => setFlashRed(false), 250);
  }, [log, sound]);

  const handleComplete = useCallback(() => {
    if (scene !== "PLAY") return;
    log("[完成] 航线到达 " + BODIES.find((b) => b.id === activePlanet)?.name);
    sound.win();
    setTimeout(() => setShowQ(true), 600);
  }, [scene, activePlanet, log, sound]);

  const handleAnswer = useCallback((i: number) => {
    if (answered || !activePlanet) return;
    setSelectedAnswer(i);
    setAnswered(true);
    const q = QUESTIONS[activePlanet];
    if (i === q.a) {
      setScore((s) => s + 200);
      setSamples((s) => { const n = new Set(s); n.add(activePlanet); return n; });
      log("[✓] 获得 「" + BODIES.find((b) => b.id === activePlanet)?.name + "核心样本」 +200");
      sound.collect();
    } else {
      log("[✗] 答错 - 正确答案：" + q.options[q.a]);
      sound.hazard();
    }
  }, [answered, activePlanet, log, sound]);

  const handleNext = useCallback(() => {
    setShowQ(false);
    setAnswered(false);
    setSelectedAnswer(null);
    setCollectedItems(0);
    setShields(100);
    setCombo(0);
    setTargetItems(3 + Math.floor(activeIdx / 2));
    if (activeIdx + 1 >= PLANET_ORDER.length) {
      setScene("FINISHED");
      log("[完成] 全部 8 颗行星探索完成");
      sound.win();
      return;
    }
    setActiveIdx((i) => i + 1);
    log("[起飞] 前往 " + BODIES.find((b) => b.id === PLANET_ORDER[activeIdx + 1])?.name);
  }, [activeIdx, log, sound]);

  const handleRestart = useCallback(() => {
    setScene("INTRO");
    setActiveIdx(0);
    setScore(0);
    setSamples(new Set());
    setShields(100);
    setLives(3);
    setCollectedItems(0);
    setTargetItems(3);
    setShowQ(false);
    setAnswered(false);
    setSelectedAnswer(null);
    setNewRecord(false);
    setCombo(0);
    setDistance(0);
    setSpeed(0);
    setMissionLog(["[任务] 探索太阳系全部 8 颗行星"]);
  }, []);

  const handlePosition = useCallback((z: number) => {
    setDistance(Math.max(0, 18 - z));
  }, []);

  const body = BODIES.find((b) => b.id === activePlanet);
  const isPerfect = samples.size === 8;
  const targetName = body?.name || "";

  return (
    <div className="relative w-full h-[calc(100vh-72px)] overflow-hidden bg-[#02010a] select-none">
      {!webglOK && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#02010a]">
          <div className="text-center max-w-md px-6">
            <div className="text-6xl mb-3">{"🌊"}</div>
            <h2 className="font-display text-2xl gradient-text mb-2">{"需要 WebGL 加速"}</h2>
            <p className="text-white/70 text-sm leading-relaxed mb-3">{"本游戏需要你的浏览器启用 WebGL 加速。请使用带 GPU 加速的现代浏览器（Chrome / Edge / Firefox）重试。"}</p>
            <Link href="/" className="btn-ghost inline-block mt-3">{zh.game.back}</Link>
          </div>
        </div>
      )}
      <AnimatePresence>
        {flashRed && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} className="absolute inset-0 z-40 pointer-events-none bg-rose-500" />}
        {flashGreen && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.25 }} exit={{ opacity: 0 }} className="absolute inset-0 z-40 pointer-events-none bg-emerald-400" />}
      </AnimatePresence>

      {/* 飞出加分文字 */}
      <AnimatePresence>
        {floatScore.map((f) => (
          <motion.div
            key={f.id}
            initial={{ opacity: 0, y: 0, scale: 0.6 }}
            animate={{ opacity: 1, y: -50, scale: 1.2 }}
            exit={{ opacity: 0, y: -100 }}
            transition={{ duration: 1.2 }}
            className="absolute z-30 pointer-events-none font-mono font-bold text-2xl"
            style={{ left: f.x + "%", top: f.y + "%", color: f.color, textShadow: "0 0 12px " + f.color }}
          >
            {f.text}
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="absolute inset-0">
        <GameWorld
          mode="CRUISE" as any
          targetId={activePlanet}
          startTime={0}
          selectedId={activePlanet}
          shields={shields}
          onCollect={handleCollect}
          onHazard={handleHazard}
          onComplete={handleComplete}
          onPosition={handlePosition}
        />
      </div>

      {/* HUD 左上 */}
      <div className="absolute top-0 left-0 z-30 p-3 flex flex-col gap-2 pointer-events-none max-w-[280px]">
        <div className="pointer-events-auto flex items-center gap-2">
          <Link href="/" className="px-3 py-1.5 rounded-lg text-xs glass-strong hover:bg-white/10 transition flex items-center gap-1.5">
            <span>{"←"}</span> {zh.game.back}
          </Link>
          <div className="glass-strong px-3 py-1.5 rounded-lg">
            <div className="font-display text-sm gradient-text leading-none">{zh.game.title}</div>
          </div>
        </div>

        {/* 任务溌收条 */}
        <div className="pointer-events-auto glass-strong rounded-xl p-3">
          <div className="flex items-center justify-between mb-1.5">
            <div className="text-[10px] text-cyan-300 uppercase tracking-widest flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1 rounded-full bg-cyan-400 animate-pulse" />
              任务溌收
            </div>
            <div className="text-[10px] text-white/70 font-mono">{collectedItems}/{targetItems}</div>
          </div>
          <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
            <motion.div className="h-full" style={{ background: "linear-gradient(90deg,#22d3ee,#a855f7)", boxShadow: "0 0 8px #22d3ee" }} initial={{ width: 0 }} animate={{ width: Math.min(100, (collectedItems / Math.max(1, targetItems)) * 100) + "%" }} />
          </div>
          <div className="text-[10px] text-white/55 mt-1.5 leading-relaxed">{hint}</div>
          {combo > 1 && (
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="mt-1.5 text-[10px] font-bold text-amber-300 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              COMBO x{combo} · +{Math.min(combo, 5) * 10} 加成
            </motion.div>
          )}
        </div>

        {/* 资源条 */}
        <div className="glass-strong rounded-xl p-2.5 w-full space-y-1 pointer-events-auto">
          <Bar label={zh.game.shields} value={shields} color="#3b82f6" />
          <Bar label={"生命"} value={(lives / 3) * 100} color="#f472b6" countText={lives + " ❤"} />
          <Bar label={zh.game.samples} value={(samples.size / 8) * 100} color="#fbbf24" countText={samples.size + "/8"} />
          <Bar label={"航线距离"} value={Math.min(100, (distance / 250) * 100)} color="#22d3ee" countText={Math.round(distance) + "m"} />
          <div className="flex items-center gap-3 text-[11px] pt-1">
            <div><span className="text-white/40">{zh.game.score}</span> <span className="font-mono text-fuchsia-300 font-bold">{score}</span></div>
            <div><span className="text-white/40">{zh.game.bestScore}</span> <span className="font-mono text-amber-300 font-bold">{bestScore}</span></div>
          </div>
        </div>

        {/* 任务日志 */}
        <div className="glass-strong rounded-xl p-2.5 pointer-events-auto text-[10px] max-h-28 overflow-hidden">
          <div className="text-cyan-300/80 uppercase tracking-widest mb-1">{zh.game.missionLog}</div>
          <div className="space-y-0.5 text-white/70 font-mono leading-snug">
            {missionLog.slice(-5).map((m, i) => <div key={i} className="truncate">{m}</div>)}
          </div>
        </div>
      </div>

      {/* HUD 右上 行星进度 */}
      <div className="absolute top-3 right-3 z-30 glass-strong rounded-xl p-3 pointer-events-auto">
        <div className="text-[10px] text-purple-300/80 uppercase tracking-widest mb-2 flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1 rounded-full bg-purple-400 animate-pulse" />
          航线进度
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {PLANET_ORDER.map((id, i) => {
            const b = BODIES.find((x) => x.id === id);
            const got = samples.has(id);
            const cur = i === activeIdx;
            return (
              <div key={id} className={"w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-mono relative overflow-hidden " + (cur ? "ring-2 ring-cyan-400 bg-cyan-500/20" : got ? "bg-emerald-500/20 text-emerald-300" : "bg-white/5 text-white/40")}>
                {b?.glow && <div className="absolute inset-0 opacity-30" style={{ background: "radial-gradient(circle," + b.glow + ",transparent)" }} />}
                <span className="relative">{got ? "✓" : i + 1}</span>
              </div>
            );
          })}
        </div>
        <div className="text-[10px] text-white/60 mt-2 text-center">
          {targetName} ({activeIdx + 1}/8)
        </div>
        <div className="text-[10px] text-white/40 text-center mt-0.5">
          · {BODIES.find((b) => b.id === activePlanet)?.distance} AU ·
        </div>
      </div>

      {/* HUD 中间底 行星信息 */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <motion.div key={activePlanet} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-strong rounded-full px-5 py-2 flex items-center gap-3">
          <span className="inline-block w-2 h-2 rounded-full" style={{ background: body?.glow || "#a855f7", boxShadow: "0 0 8px " + (body?.glow || "#a855f7") }} />
          <span className="text-white/90 font-display text-sm tracking-wider">{body?.name}</span>
          <span className="text-white/40 text-[10px]">{"·"}</span>
          <span className="text-white/60 text-[11px]">{"· "} {body?.biome === "green" ? "绿色生机" : body?.biome === "sand" ? "黄沙荒漠" : body?.biome === "cloud" ? "云层大气" : body?.biome === "ice" ? "冰雪世界" : body?.biome === "lava" ? "岩浆地貌" : body?.biome === "gas" ? "气态巨行星" : body?.biome === "crystal" ? "水晶世界" : "太阳系深空"} {"·"}</span>
        </motion.div>
      </div>

      {scene === "PLAY" && collectedItems < 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 glass-strong rounded-full px-4 py-1.5 text-[11px] pointer-events-none text-white/70">
          {hint}
        </motion.div>
      )}

      {/* INTRO 序章 */}
      <AnimatePresence>
        {scene === "INTRO" && (
          <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm pointer-events-none">
            <div className="text-center max-w-3xl px-6">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, duration: 0.6 }} className="text-amber-200/80 text-xs tracking-[0.5em] uppercase mb-3">{"· 宇航传送中 ·"}</motion.div>
              <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4, duration: 0.6 }} className="font-display text-5xl md:text-7xl font-semibold gradient-text mb-4 glow-text">{zh.game.title}</motion.h1>
              <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7, duration: 0.6 }} className="text-white/85 text-base md:text-lg leading-relaxed mb-2">{zh.game.subtitle}</motion.p>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0, duration: 0.6 }} className="text-white/55 text-xs">{"参考 Marble Quest · 3D 滚动跑酷 · 8 行星关卡"}</motion.p>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 0.6 }} className="mt-6 text-white/40 text-[10px] tracking-widest flex items-center justify-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                {zh.game.loading}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 答题卡 */}
      <AnimatePresence>
        {showQ && (() => {
          const q = QUESTIONS[activePlanet];
          if (!q) return null;
          return (
            <motion.div key="q" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-md pointer-events-auto">
              <motion.div initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} className="glass-strong rounded-3xl p-7 max-w-md mx-4">
                <div className="text-center mb-4">
                  <div className="text-[10px] text-cyan-300/80 uppercase tracking-widest mb-1">{zh.game.knowledgeCheck}</div>
                  <div className="font-display text-2xl gradient-text mb-1">{body?.name}</div>
                  <div className="text-[10px] text-white/40">{body?.distance} AU {"·"} {activeIdx + 1}/8</div>
                </div>
                <div className="text-white/90 text-sm leading-relaxed mb-4">{q.q}</div>
                <div className="grid grid-cols-1 gap-2 mb-4">
                  {q.options.map((opt, i) => {
                    let cls = "w-full text-left px-3 py-2.5 rounded-lg text-sm transition border ";
                    if (!answered) cls += "bg-white/5 border-white/10 hover:bg-white/10 text-white/85";
                    else if (i === q.a) cls += "bg-emerald-500/20 border-emerald-400/60 text-emerald-200";
                    else if (i === selectedAnswer) cls += "bg-rose-500/20 border-rose-400/60 text-rose-200";
                    else cls += "bg-white/5 border-white/5 text-white/30";
                    return <button key={i} disabled={answered} onClick={() => handleAnswer(i)} className={cls}>{String.fromCharCode(65 + i)}. {opt}</button>;
                  })}
                </div>
                {answered && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    <div className={"text-sm font-medium mb-2 " + (selectedAnswer === q.a ? "text-emerald-300" : "text-rose-300")}>{selectedAnswer === q.a ? "✨ " + zh.game.correct : "⚠ " + zh.game.wrong}</div>
                    <div className="text-xs text-white/65 leading-relaxed mb-4">{q.fact}</div>
                    <button onClick={handleNext} className="btn-primary w-full">
                      {activeIdx + 1 >= PLANET_ORDER.length ? zh.game.finished + " ✨" : zh.game.takeoff + " → " + BODIES.find((b) => b.id === PLANET_ORDER[activeIdx + 1])?.name}
                    </button>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* FINISHED 完成弹窗 */}
      <AnimatePresence>
        {scene === "FINISHED" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md">
            <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring" }} className="glass-strong rounded-3xl p-8 max-w-md text-center mx-4">
              <motion.div animate={{ rotate: [0, 8, -8, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-7xl mb-3">{isPerfect ? "🏅" : "🌟"}</motion.div>
              <h2 className="font-display text-3xl gradient-text mb-2">{isPerfect ? zh.game.perfectEnding : zh.game.finished}</h2>
              <p className="text-white/70 text-sm mb-3">{isPerfect ? zh.game.perfectDesc : zh.game.finishedDesc}</p>
              {newRecord && <div className="text-amber-300 text-sm font-bold mb-2 animate-pulse">{"✨ " + zh.game.newRecord}</div>}
              <div className="grid grid-cols-3 gap-2 my-5 text-xs">
                <div className="glass rounded-lg p-2"><div className="text-white/50">{zh.game.samples}</div><div className="text-emerald-300 font-mono text-lg">{samples.size}/8</div></div>
                <div className="glass rounded-lg p-2"><div className="text-white/50">{zh.game.score}</div><div className="text-fuchsia-300 font-mono text-lg">{score}</div></div>
                <div className="glass rounded-lg p-2"><div className="text-white/50">{zh.game.bestScore}</div><div className="text-amber-300 font-mono text-lg">{Math.max(score, bestScore)}</div></div>
              </div>
              <div className="text-[10px] text-white/50 mb-3 space-y-0.5">
                <div>{"已采集样本"} {samples.size}/8</div>
                <div>{"航线总距离"} {Math.round(distance)} m</div>
                <div>{"任务关卡"} {samples.size}/8</div>
              </div>
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

function Bar({ label, value, color, countText }: { label: string; value: number; color: string; countText?: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[10px] mb-0.5">
        <span className="text-white/50 uppercase tracking-widest">{label}</span>
        {countText ? <span className="font-mono text-white/80">{countText}</span> : <span className="font-mono text-white/80">{Math.round(value)}%</span>}
      </div>
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <motion.div className="h-full" style={{ background: color, boxShadow: "0 0 8px " + color }} initial={{ width: 0 }} animate={{ width: Math.max(0, Math.min(100, value)) + "%" }} transition={{ type: "spring", stiffness: 80, damping: 18 }} />
      </div>
    </div>
  );
}
