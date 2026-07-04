"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { zh } from "@/i18n/zh";
import { GameWorld, BODIES } from "./GameWorld";

type PlanetId = "mercury" | "venus" | "earth" | "mars" | "jupiter" | "saturn" | "uranus" | "neptune";
type Scene = "INTRO" | "SOLAR" | "APPROACH" | "PLAY" | "FINISHED";

const PLANET_ORDER: PlanetId[] = ["mercury", "venus", "earth", "mars", "jupiter", "saturn", "uranus", "neptune"];

const QUESTIONS: Record<PlanetId, { q: string; options: string[]; a: number; fact: string }> = {
  mercury: { q: "水星的一太阳日约多长？", options: ["176 地球日", "88 地球日", "365 地球日", "58 地球日"], a: 1, fact: "水星是太阳系中轨道周期最短的行星，只需 88 地球日即绕太阳一圈。" },
  venus:   { q: "以下哪个描述不适用于金星？", options: ["最热的行星", "反向自转", "在地球轨道内", "有厚厚二氧化碳大气"], a: 2, fact: "金星是太阳系最热的行星，反向自转，大气中 96% 是二氧化碳。" },
  earth:   { q: "地球大气中氧气的份额约为？", options: ["21%", "78%", "1%", "58%"], a: 0, fact: "地球大气中氮气约 78%，氧气约 21%，是复杂生命的关键。" },
  mars:    { q: "火星的“奥林匹斯山”是什么？", options: ["一座活火山", "太阳系最高的山", "飞船着陆点", "干涸的河床"], a: 1, fact: "奥林匹斯山高 22 公里，是太阳系已知最高的山，是珠穆朗玛峰的近 3 倍。" },
  jupiter: { q: "木星的“大红斑”是什么？", options: ["一颗卫星", "一场持续数百年的风暴", "超级火山", "一颗新生星"], a: 1, fact: "大红斑是木星上持续了 350 多年的反气旋风暴，直径比地球还大。" },
  saturn:  { q: "土星环主要由什么组成？", options: ["冰与岩石碎片", "气体与尘埃", "金属与石头", "河流与沙丘"], a: 0, fact: "土星环由数以亿计的冰粒、岩石碎片与尘埃组成，颗粒从微米到数百米不等。" },
  uranus:  { q: "天王星最独特之处是？", options: ["最热的行星", "以约 98° 倾角侧身自转", "有生命", "没有大气"], a: 1, fact: "天王星自转轴几乎与公转面平行（倾角 98°），是太阳系唯一“躺着”自转的行星。" },
  neptune: { q: "海王星的“大黑斑”是什么？", options: ["火山口", "反气旋风暴", "深色大陆", "黑色卫星"], a: 1, fact: "大黑斑是一个反气旋风暴，风速超过 2000 公里/小时，是太阳系最快风。" }
};

const STORAGE_KEY = "marble_quest_best_v1";
const COLLECT_KIND_LABEL: Record<string, string> = { star: "星核样本", crystal: "水晶样本", ankh: "安卡样本", ruby: "红宝石样本", apple: "果实样本" };

function useSound() {
  const ctxRef = useRef<AudioContext | null>(null);
  useEffect(() => {
    if (typeof window !== "undefined" && !ctxRef.current) {
      const Ctx = (window.AudioContext || (window as any).webkitAudioContext);
      if (Ctx) ctxRef.current = new Ctx();
    }
  }, []);
  const play = useCallback((freq: number, dur: number, type: OscillatorType = "sine", vol = 0.15) => {
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
    collect: () => { play(880, 0.08, "sine", 0.18); setTimeout(() => play(1320, 0.1, "sine", 0.15), 50); },
    hazard: () => { play(180, 0.18, "sawtooth", 0.2); },
    jump: () => { play(440, 0.06, "sine", 0.1); },
    win: () => { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => play(f, 0.2, "sine", 0.2), i * 100)); },
    lose: () => { [400, 300, 200, 100].forEach((f, i) => setTimeout(() => play(f, 0.3, "sawtooth", 0.15), i * 120)); },
    click: () => { play(660, 0.05, "sine", 0.1); }
  };
}

export function GameClient() {
  const [webglOK, setWebglOK] = useState(true);
  const [scene, setScene] = useState<Scene>("INTRO");
  const [activeIdx, setActiveIdx] = useState(0);
  const activePlanet = PLANET_ORDER[activeIdx];
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [shields, setShields] = useState(100);
  const [lives, setLives] = useState(3);
  const [collectedItems, setCollectedItems] = useState(0);
  const [distance, setDistance] = useState(0);
  const [showQ, setShowQ] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [samples, setSamples] = useState<Set<PlanetId>>(new Set());
  const [newRecord, setNewRecord] = useState(false);
  const [missionLog, setMissionLog] = useState<string[]>(["[任务] 探索太阳系全部 8 颗行星"]);
  const [hint] = useState<string>("WASD / 方向键 操控 · 躲避陨石 · 收集能量样本");
  const [flashRed, setFlashRed] = useState(false);
  const [flashGreen, setFlashGreen] = useState(false);
  const [floatScore, setFloatScore] = useState<{ id: number; x: number; y: number; text: string; color: string }[]>([]);
  const [combo, setCombo] = useState(0);
  const [approachStart, setApproachStart] = useState(0);
  const [playPaused, setPlayPaused] = useState(false);
  const sound = useSound();
  const comboTimer = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const c = document.createElement("canvas");
      const gl = c.getContext("webgl2") || c.getContext("webgl");
      if (!gl) setWebglOK(false);
    } catch (e) { setWebglOK(false); }
  }, []);

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
      const t = setTimeout(() => setScene("SOLAR"), 2400);
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

  const handlePlanetClick = useCallback((id: string) => {
    if (scene !== "SOLAR") return;
    const idx = PLANET_ORDER.indexOf(id as PlanetId);
    if (idx < 0) return;
    sound.click();
    // 点击直接进入超光速跳迁, 不卡预览卡
    setActiveIdx(idx);
    setApproachStart(Date.now());
    setScene("APPROACH");
    log("[接近] 飞向 " + BODIES.find((b) => b.id === id)?.name);
    setTimeout(() => {
      setScene("PLAY");
      setPlayPaused(false);
      log("[着陆] " + BODIES.find((b) => b.id === id)?.name + " 表面已到达");
    }, 2600);
  }, [scene, sound, log]);

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
            log("[警报] 超出生命上限");
            setTimeout(() => { sound.lose(); setScene("FINISHED"); }, 800);
          } else {
            log("[警报] 护盾破损 · 剩余生命 " + ln);
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
    log("[完成] 着陆航线到达 " + BODIES.find((b) => b.id === activePlanet)?.name);
    sound.win();
    setPlayPaused(true);
    setTimeout(() => setShowQ(true), 700);
  }, [scene, activePlanet, log, sound]);

  const handleAnswer = useCallback((i: number) => {
    if (answered || !activePlanet) return;
    setSelectedAnswer(i);
    setAnswered(true);
    const q = QUESTIONS[activePlanet];
    if (i === q.a) {
      setScore((s) => s + 200);
      setSamples((s) => { const n = new Set(s); n.add(activePlanet); return n; });
      log("[正确] 获得 " + BODIES.find((b) => b.id === activePlanet)?.name + " 核心样本 +200");
      sound.collect();
    } else {
      log("[错误] 正确答案： " + q.options[q.a]);
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
    if (activeIdx + 1 >= PLANET_ORDER.length) {
      setScene("FINISHED");
      log("[完成] 全部 8 颗行星探索完成");
      sound.win();
      return;
    }
    setActiveIdx((i) => i + 1);
    setScene("SOLAR");
    log("[返航] 回到太阳系, 下一个目标");
  }, [activeIdx, log, sound]);

  const handleRestart = useCallback(() => {
    setScene("INTRO");
    setActiveIdx(0);
    setScore(0);
    setSamples(new Set());
    setShields(100);
    setLives(3);
    setCollectedItems(0);
    setShowQ(false);
    setAnswered(false);
    setSelectedAnswer(null);
    setNewRecord(false);
    setCombo(0);
    setDistance(0);
    setPlayPaused(false);
    setMissionLog(["[任务] 探索太阳系全部 8 颗行星"]);
  }, []);

  const handlePosition = useCallback((z: number) => {
    setDistance(Math.max(0, 0 - z));
  }, []);

  const body = BODIES.find((b) => b.id === activePlanet);
  const isPerfect = samples.size === 8;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#02010a] select-none">
      <AnimatePresence>
        {flashRed && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} className="absolute inset-0 z-40 pointer-events-none bg-rose-500" />}
        {flashGreen && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.25 }} exit={{ opacity: 0 }} className="absolute inset-0 z-40 pointer-events-none bg-emerald-400" />}
      </AnimatePresence>

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

      {!webglOK && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#02010a]">
          <div className="text-center max-w-md px-6">
            <div className="text-6xl mb-3">{"🛸"}</div>
            <h2 className="font-display text-2xl gradient-text mb-2">{"需要 WebGL 加速"}</h2>
            <p className="text-white/70 text-sm leading-relaxed mb-3">{"此游戏需要你的浏览器启用 WebGL 加速。请使用带 GPU 加速的现代浏览器（Chrome / Edge / Firefox）重试。"}</p>
            <Link href="/" className="btn-ghost inline-block mt-3">{zh.game.back}</Link>
          </div>
        </div>
      )}

      {webglOK && (
        <div className="absolute inset-0">
          <GameWorld
            scene={scene}
            targetId={activePlanet}
            onPlanetClick={handlePlanetClick}
            startTime={approachStart}
            shields={shields}
            paused={playPaused || showQ}
            onCollect={handleCollect}
            onHazard={handleHazard}
            onComplete={handleComplete}
            onPosition={handlePosition}

          />
        </div>
      )}

      {/* 顶部栏 */}
      {scene !== "INTRO" && (
        <div className="absolute top-0 left-0 z-30 p-3 flex flex-col gap-2 pointer-events-none max-w-[320px]">
          <div className="pointer-events-auto flex items-center gap-2">
            <Link href="/" className="px-3 py-1.5 rounded-lg text-xs glass-strong hover:bg-white/10 transition flex items-center gap-1.5">
              <span>{"←"}</span> {zh.game.back}
            </Link>
            <div className="glass-strong px-3 py-1.5 rounded-lg">
              <div className="font-display text-sm gradient-text leading-none">{zh.game.title}</div>
            </div>
          </div>

          {scene === "PLAY" && (
            <>
              <div className="pointer-events-auto glass-strong rounded-xl p-3 space-y-1.5">
                <div className="flex items-center justify-between mb-0.5">
                  <div className="text-[10px] text-cyan-300 uppercase tracking-widest">{zh.game.score}</div>
                  <div className="font-mono text-fuchsia-300 text-base font-bold">{score}</div>
                </div>
                <Bar label={zh.game.shields} value={shields} color="#22d3ee" />
                <Bar label={zh.game.oxygen} value={Math.max(0, lives * 33)} color="#10b981" countText={lives + "x"} />
                <div className="flex items-center justify-between text-[10px] text-white/60">
                  <span>{zh.game.samples}</span>
                  <span className="font-mono">{collectedItems}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-white/60">
                  <span>{zh.game.distance}</span>
                  <span className="font-mono">{Math.round(distance)} m</span>
                </div>
                {combo > 1 && (
                  <div className="text-amber-300 text-[10px] font-bold animate-pulse">COMBO ×{combo}</div>
                )}
              </div>

              <div className="pointer-events-auto glass-strong rounded-xl p-2.5 max-h-32 overflow-hidden">
                <div className="text-[10px] text-cyan-300 uppercase tracking-widest mb-1">{zh.game.missionLog}</div>
                <div className="space-y-0.5">
                  {missionLog.slice(-5).map((m, i) => (
                    <div key={i} className="text-[10px] text-white/70 leading-tight">{m}</div>
                  ))}
                </div>
              </div>
            </>
          )}

          {scene === "SOLAR" && (
            <div className="pointer-events-auto glass-strong rounded-xl p-3">
              <div className="text-[10px] text-cyan-300 uppercase tracking-widest mb-1">任务进度</div>
              <div className="text-white/85 text-sm">已探索 <span className="text-emerald-300 font-mono font-bold">{samples.size}</span> / 8 颗行星</div>
              <div className="text-amber-300 font-mono mt-1">总分 {score}</div>
              {newRecord && <div className="text-amber-300 text-[10px] mt-0.5 animate-pulse">新纪录！</div>}
            </div>
          )}

          {scene === "APPROACH" && (
            <div className="pointer-events-auto glass-strong rounded-xl p-3">
              <div className="text-[10px] text-amber-300 uppercase tracking-widest mb-1">飞行中</div>
              <div className="text-white/85 text-sm">正在接近 <span className="text-amber-200 font-mono font-bold">{body?.name}</span></div>
              <div className="text-[10px] text-white/60 mt-1">准备进入轨道 · 着陆准备</div>
            </div>
          )}
        </div>
      )}

      {/* 右侧 8 行星进度 */}
      {scene !== "INTRO" && (
        <div className="absolute top-3 right-3 z-30 pointer-events-none">
          <div className="glass-strong rounded-xl p-2.5 space-y-1.5">
            <div className="text-[10px] text-cyan-300 uppercase tracking-widest mb-1">航路图</div>
            {PLANET_ORDER.map((id, i) => {
              const b = BODIES.find((x) => x.id === id);
              const got = samples.has(id);
              const isActive = activeIdx === i;
              return (
                <div key={id} className="flex items-center gap-1.5 text-[10px]" style={{ opacity: isActive ? 1 : 0.7 }}>
                  <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: b?.glow, boxShadow: "0 0 4px " + b?.glow }} />
                  <span className={"relative " + (got ? "text-emerald-300" : isActive ? "text-amber-300" : "text-white/55")}>
                    {got ? "✓" : isActive ? "→" : i + 1}. {b?.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* INTRO 序章 */}
      <AnimatePresence>
        {scene === "INTRO" && (
          <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-md pointer-events-none">
            <div className="text-center max-w-3xl px-6">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1, duration: 0.5 }} className="text-amber-200/80 text-xs tracking-[0.5em] uppercase mb-3">{"· 宇航传送中 ·"}</motion.div>
              <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3, duration: 0.5 }} className="font-display text-5xl md:text-7xl font-semibold gradient-text mb-4 glow-text">{zh.game.title}</motion.h1>
              <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5, duration: 0.5 }} className="text-white/85 text-base md:text-lg leading-relaxed mb-2">{zh.game.subtitle}</motion.p>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.5 }} className="text-white/55 text-xs">{"参考 Marble Quest · 3D 滚动跑酷 · 8 行星探险"}</motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SOLAR 提示 */}
      <AnimatePresence>
        {scene === "SOLAR" && (
          <motion.div key="solar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-strong rounded-full px-5 py-2.5 text-center">
              <div className="text-[10px] text-amber-200/80 tracking-[0.4em] uppercase mb-0.5">点击太阳系中的行星</div>
              <div className="text-white/90 text-sm">太阳系巡航中 · 选定目标开始探索</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* APPROACH 接近提示 */}
      <AnimatePresence>
        {scene === "APPROACH" && (
          <motion.div key="approach" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm pointer-events-none">
            <div className="text-center">
              <motion.div animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }} transition={{ duration: 1.2, repeat: Infinity }} className="text-5xl mb-3">{"🚀"}</motion.div>
              <div className="font-display text-3xl gradient-text mb-1">超光速跳迁中</div>
              <div className="text-white/80 text-sm">目的地 <span className="text-amber-200 font-bold">{body?.name}</span> · {body?.distance} AU</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PLAY HUD 底部 */}
      {scene === "PLAY" && (
        <>
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
            <motion.div key={activePlanet} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-strong rounded-full px-5 py-2 flex items-center gap-3">
              <span className="inline-block w-2 h-2 rounded-full" style={{ background: body?.glow || "#a855f7", boxShadow: "0 0 8px " + (body?.glow || "#a855f7") }} />
              <span className="text-white/90 font-display text-sm tracking-wider">{body?.name}</span>
              <span className="text-white/40 text-[10px]">{"·"}</span>
              <span className="text-white/60 text-[11px]">{"· "} {body?.distance} AU {"·"}</span>
            </motion.div>
          </div>

          {collectedItems < 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 glass-strong rounded-full px-4 py-1.5 text-[11px] pointer-events-none text-white/70">
              {hint}
            </motion.div>
          )}
        </>
      )}

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
                  <div className="text-[10px] text-white/40">{body?.distance} AU · {activeIdx + 1}/8</div>
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
                    <div className={"text-sm font-medium mb-2 " + (selectedAnswer === q.a ? "text-emerald-300" : "text-rose-300")}>{selectedAnswer === q.a ? "✓ " + zh.game.correct : "✗ " + zh.game.wrong}</div>
                    <div className="text-xs text-white/65 leading-relaxed mb-4">{q.fact}</div>
                    <button onClick={handleNext} className="btn-primary w-full">
                      {activeIdx + 1 >= PLANET_ORDER.length ? zh.game.finished + " ✓" : "→ 返回太阳系 · " + BODIES.find((b) => b.id === PLANET_ORDER[activeIdx + 1])?.name}
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
              <motion.div animate={{ rotate: [0, 8, -8, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-7xl mb-3">{isPerfect ? "🌌" : "🎯"}</motion.div>
              <h2 className="font-display text-3xl gradient-text mb-2">{isPerfect ? zh.game.perfectEnding : zh.game.finished}</h2>
              <p className="text-white/70 text-sm mb-3">{isPerfect ? zh.game.perfectDesc : zh.game.finishedDesc}</p>
              {newRecord && <div className="text-amber-300 text-sm font-bold mb-2 animate-pulse">{"✓ " + zh.game.newRecord}</div>}
              <div className="grid grid-cols-3 gap-2 my-5 text-xs">
                <div className="glass rounded-lg p-2"><div className="text-white/50">{zh.game.samples}</div><div className="text-emerald-300 font-mono text-lg">{samples.size}/8</div></div>
                <div className="glass rounded-lg p-2"><div className="text-white/50">{zh.game.score}</div><div className="text-fuchsia-300 font-mono text-lg">{score}</div></div>
                <div className="glass rounded-lg p-2"><div className="text-white/50">{zh.game.bestScore}</div><div className="text-amber-300 font-mono text-lg">{Math.max(score, bestScore)}</div></div>
              </div>
              <div className="text-[10px] text-white/50 mb-3 space-y-0.5">
                <div>已探索行星 {samples.size}/8</div>
                <div>总航路距离 {Math.round(distance)} m</div>
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
