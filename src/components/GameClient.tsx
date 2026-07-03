"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { zh } from "@/i18n/zh";
import { GameWorld, BODIES } from "./GameWorld";

type Scene = "INTRO" | "CRUISE" | "APPROACH" | "WARP" | "TUNNEL" | "LANDING" | "LANDED" | "CLUE" | "MISSION" | "LAUNCH" | "EVENT" | "FINISHED";
type PlanetId = "mercury" | "venus" | "earth" | "mars" | "jupiter" | "saturn" | "uranus" | "neptune";

const QUESTIONS: Record<PlanetId, { q: string; options: string[]; a: number; fact: string; mission: string }> = {
  mercury: { q: "\u6c34\u661f\u4e00\u592a\u9633\u65e5\u7ea6\u591a\u957f\uff1f", options: ["176 \u5730\u7403\u65e5", "88 \u5730\u7403\u65e5", "365 \u5730\u7403\u65e5", "58 \u5730\u7403\u65e5"], a: 1, fact: "\u6c34\u661f\u8f68\u9053\u5468\u671f\u6700\u77ed\uff0c\u4ec5 88 \u5730\u7403\u65e5\u5373\u8d70\u5b8c\u4e00\u5708\u3002", mission: "\u91c7\u6837\u6c34\u661f\u8868\u9762\u9ed1\u8272\u53cd\u5c04\u7269\u8d28" },
  venus:   { q: "\u4ee5\u4e0b\u54ea\u4e2a\u63cf\u8ff0\u4e0d\u9002\u7528\u4e8e\u91d1\u661f\uff1f", options: ["\u6700\u70ed\u7684\u884c\u661f", "\u53cd\u5411\u81ea\u8f6c", "\u8865\u592a\u9633\u8f68\u9053", "\u539a\u539a\u4e8c\u6c27\u5316\u78b3\u5927\u6c14"], a: 2, fact: "\u91d1\u661f\u662f\u6700\u70ed\u7684\u884c\u661f\uff0c\u81ea\u8f6c\u4e0e\u5176\u4ed6\u884c\u661f\u76f8\u53cd\uff0c\u88ab\u539a\u539a\u4e8c\u6c27\u5316\u78b3\u4e91\u5c42\u8986\u76d6\u3002", mission: "\u7a7f\u8fc7\u91d1\u661f\u539a\u91cd\u7684\u4e8c\u6c27\u5316\u78b3\u4e91\u5c42" },
  earth:   { q: "\u5730\u7403\u5927\u6c14\u4e2d\u6c27\u6c14\u7684\u4efd\u989d\u7ea6\u4e3a\uff1f", options: ["21%", "78%", "1%", "58%"], a: 0, fact: "\u5730\u7403\u5927\u6c14\u4e2d\u6c2e\u6c14 (N\u2082) \u7ea6 78%\uff0c\u6c27\u6c14 (O\u2082) \u7ea6 21%\u3002", mission: "\u5728\u5730\u7403\u8fd1\u5730\u8f68\u9053\u4e0a\u4fdd\u62a4\u751f\u547d\u793a\u4f8b" },
  mars:    { q: "\u706b\u661f\u7684\u201c\u5965\u6797\u5339\u65af\u5c71\u201d\u662f\u4ec0\u4e48\uff1f", options: ["\u4e00\u5ea7\u706b\u5c71", "\u592a\u9633\u7cfb\u6700\u9ad8\u7684\u5c71", "\u4e00\u4e2a\u8f7d\u4eba\u98de\u8239\u9057\u5740", "\u4e00\u6761\u5e72\u57cb\u7684\u6cb3\u6d41"], a: 1, fact: "\u5965\u6797\u5339\u65af\u5c71\u9ad8\u8fbe 22 \u516c\u91cc\uff0c\u662f\u592a\u9633\u7cfb\u4e2d\u6700\u9ad8\u7684\u5c71\u8109\u3002", mission: "\u7e22\u8d8a\u706b\u661f\u5965\u6797\u5339\u65af\u5c71\u9876\u90e8\u7684\u5ca9\u77f3" },
  jupiter: { q: "\u6728\u661f\u7684\u201c\u5927\u7ea2\u6597\u201d\u662f\u4ec0\u4e48\uff1f", options: ["\u4e00\u9897\u536b\u661f", "\u4e00\u573a\u6c38\u6052\u7684\u98ce\u66b4", "\u4e00\u4e2a\u8d85\u7ea7\u706b\u5c71", "\u4e00\u9897\u8d85\u65b0\u661f"], a: 1, fact: "\u5927\u7ea2\u6597\u662f\u4e00\u573a\u5df2\u6301\u7eed\u6570\u767e\u5e74\u7684\u53cd\u6c14\u65cb\uff0c\u76f4\u5f84\u6bd4\u5730\u7403\u8fd8\u5927\u3002", mission: "\u7a7f\u8fc7\u6728\u661f\u5927\u7ea2\u6597\u98ce\u66b4" },
  saturn:  { q: "\u571f\u661f\u7684\u73af\u4e3b\u8981\u7531\u4ec0\u4e48\u7ec4\u6210\uff1f", options: ["\u51b0\u4e0e\u5ca9\u77f3\u788e\u7247", "\u6c14\u4f53\u4e0e\u5c18\u57c3", "\u91d1\u5c5e\u4e0e\u77f3\u5934", "\u6cb3\u6d41\u4e0e\u6c99\u6f20"], a: 0, fact: "\u571f\u661f\u73af\u7531\u6570\u4ee5\u4ebf\u8ba1\u7684\u51b0\u3001\u5ca9\u77f3\u788e\u7247\u4e0e\u5c18\u57c3\u7ec4\u6210\u3002", mission: "\u7a7f\u8fc7\u571f\u661f\u73af\u5e26\u7684\u51b0\u96ea\u788e\u7247" },
  uranus:  { q: "\u5929\u738b\u661f\u7684\u4e00\u4e2a\u72ec\u7279\u4e4b\u5904\u662f\uff1f", options: ["\u6700\u70ed\u7684\u884c\u661f", "\u4ee5 98\u00b0 \u89d2\u5ea6\u503e\u659c\u81ea\u8f6c", "\u6709\u751f\u547d", "\u6ca1\u6709\u592a\u9633\u7cfb\u5927\u6c14"], a: 1, fact: "\u5929\u738b\u661f\u7684\u81ea\u8f6c\u8f74\u4e0e\u8f68\u9053\u9762\u63a5\u8fd1 98\u00b0\uff0c\u662f\u552f\u4e00\u4e00\u9897\u201c\u8eba\u7740\u201d\u7684\u884c\u661f\u3002", mission: "\u7a7f\u8d8a\u5929\u738b\u661f\u7684\u504f\u8f74\u578b\u78c1\u5708" },
  neptune: { q: "\u6d77\u738b\u661f\u4e0a\u7684\u201c\u5927\u9ed1\u6597\u201d\u662f\u4ec0\u4e48\uff1f", options: ["\u4e00\u4e2a\u706b\u5c71\u53e3", "\u4e00\u573a\u98ce\u66b4\u53cd\u6c14\u65cb", "\u4e00\u5757\u6df1\u8272\u5927\u9646", "\u4e00\u9897\u9ed1\u8272\u536b\u661f"], a: 1, fact: "\u5927\u9ed1\u6597\u662f\u4e00\u4e2a\u53cd\u6c14\u65cb\u98ce\u66b4\uff0c\u98ce\u901f\u8d85\u8fc7 2000 \u516c\u91cc/\u5c0f\u65f6\uff0c\u662f\u592a\u9633\u7cfb\u4e2d\u6700\u5feb\u7684\u98ce\u3002", mission: "\u5b9d\u85cf\u5728\u6d77\u738b\u661f\u201c\u5927\u9ed1\u6597\u201d\u4e2d\u7684\u9ed1\u8272\u5c01\u95ed\u70b9" }
};

const PROBES = [
  { id: "voyager", name: "旅行者 1 号", dist: 50, fact: "1977 年发射,已飞越太阳风顶层进入星际空间" },
  { id: "cassini", name: "卡西尼号", dist: 18, fact: "1997-2017 年环绕土星,最终坠入土星大气" },
  { id: "mariner", name: "水手 10 号", dist: 7, fact: "1974 年飞越水星和金星,首次近距离探测类地行星" }
];

const BEST_KEY = "cosmic-voyage-3d-best";
const SAVE_KEY = "cosmic-voyage-3d-save";

export function GameClient() {
  const [scene, setScene] = useState<Scene>("INTRO");
  const [activePlanet, setActivePlanet] = useState<PlanetId | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [samples, setSamples] = useState<Set<string>>(new Set());
  const [tunnelProgress, setTunnelProgress] = useState(0);
  const [landingProgress, setLandingProgress] = useState(0);
  const [clueProgress, setClueProgress] = useState(0);
  const [dangerMsg, setDangerMsg] = useState<string | null>(null);
  const [energy, setEnergy] = useState(100);
  const [fuel, setFuel] = useState(100);
  const [shields, setShields] = useState(100);
  const [oxygen, setOxygen] = useState(100);
  const [startTime, setStartTime] = useState(0);
  const [hoveredPlanet, setHoveredPlanet] = useState<PlanetId | null>(null);
  const [showIntro, setShowIntro] = useState(true);
  const [missionLog, setMissionLog] = useState<string[]>(["[\u4efb\u52a1] \u63a2\u7d22\u592a\u9633\u7cfb\u5168\u90e8 8 \u9897\u884c\u661f"]);
  const [newRecord, setNewRecord] = useState(false);
  const [showConfirm, setShowConfirm] = useState<PlanetId | null>(null);
  const [asteroidReached, setAsteroidReached] = useState(false);
  const [kuiperReached, setKuiperReached] = useState(false);
  const [probesFound, setProbesFound] = useState<Set<string>>(new Set());
  const [crystals, setCrystals] = useState(0);
  const [eventMsg, setEventMsg] = useState<string | null>(null);
  const [eventEndAt, setEventEndAt] = useState(0);
  const [distance, setDistance] = useState(0);
  const introStartRef = useRef(0);
  // === 持久化加载 ===
  useEffect(() => {
    try {
      const v = parseInt(localStorage.getItem(BEST_KEY) || "0", 10);
      if (!Number.isNaN(v)) setBestScore(v);
      const s = localStorage.getItem(SAVE_KEY);
      if (s) {
        const data = JSON.parse(s);
        if (data.samples) setSamples(new Set(data.samples));
        if (data.probes) setProbesFound(new Set(data.probes));
        if (typeof data.crystals === "number") setCrystals(data.crystals);
        if (typeof data.asteroidReached === "boolean") setAsteroidReached(data.asteroidReached);
        if (typeof data.kuiperReached === "boolean") setKuiperReached(data.kuiperReached);
      }
    } catch {}
    setStartTime(performance.now() / 1000);
    introStartRef.current = performance.now() / 1000;
  }, []);

  // === INTRO 自动结束 ===
  useEffect(() => {
    if (scene === "INTRO") {
      const t = setTimeout(() => { setShowIntro(false); setScene("CRUISE"); }, 5500);
      return () => clearTimeout(t);
    }
  }, [scene]);

  // === 持久化自动保存 ===
  useEffect(() => {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        samples: Array.from(samples),
        probes: Array.from(probesFound),
        crystals,
        asteroidReached,
        kuiperReached,
      }));
    } catch {}
  }, [samples, probesFound, crystals, asteroidReached, kuiperReached]);

  useEffect(() => {
    if (scene === "FINISHED" && score > bestScore) {
      setBestScore(score);
      setNewRecord(true);
      try { localStorage.setItem(BEST_KEY, String(score)); } catch {}
    }
  }, [scene, score, bestScore]);

  // === 资源持续消耗 + 穿越/降落/线索进度跟踪 ===
  useEffect(() => {
    const t = setInterval(() => {
      if (scene === "CRUISE") {
        setFuel((f) => Math.max(0, f - 0.05));
        setOxygen((o) => Math.max(0, o - 0.03));
      }
      if (scene === "LANDED") {
        setEnergy((e) => Math.max(0, e - 0.2));
        setOxygen((o) => Math.max(0, o - 0.15));
      }
      if (scene === "TUNNEL") {
        setFuel((f) => Math.max(0, f - 0.15));
        setShields((s) => s);
        setTunnelProgress((p) => Math.min(1, p + 1 / 12));
      }
      if (scene === "LANDING") {
        setShields((s) => s);
        setLandingProgress((p) => Math.min(1, p + 1 / 10));
      }
      if (scene === "CLUE") {
        setClueProgress((c) => c);
      }
    }, 1000);
    return () => clearInterval(t);
  }, [scene]);

  // === 随机事件调度 ===
  useEffect(() => {
    if (scene !== "CRUISE") return;
    const interval = setInterval(() => {
      const r = Math.random();
      if (r < 0.35) {
        setEventMsg(zh.game.eventFlare); setEventEndAt(performance.now() + 8000);
        setMissionLog((l) => [...l.slice(-9), "[\u8b66\u62a5] " + zh.game.eventFlare]);
        setTimeout(() => setEventMsg(null), 8000);
        setShields((s) => Math.max(0, s - 20));
      } else if (r < 0.7) {
        setEventMsg(zh.game.eventMeteors); setEventEndAt(performance.now() + 5000);
        setMissionLog((l) => [...l.slice(-9), "[\u8b66\u62a5] " + zh.game.eventMeteors]);
        setTimeout(() => setEventMsg(null), 5000);
        setShields((s) => Math.max(0, s - 10));
      } else {
        setEventMsg(zh.game.eventOxygen); setEventEndAt(performance.now() + 6000);
        setMissionLog((l) => [...l.slice(-9), "[\u8b66\u62a5] " + zh.game.eventOxygen]);
        setTimeout(() => setEventMsg(null), 6000);
      }
    }, 25000);
    return () => clearInterval(interval);
  }, [scene]);

  const handlePlanetClick = useCallback((id: string) => {
    if (scene !== "CRUISE") return;
    setShowConfirm(id as PlanetId);
  }, [scene]);

  const handleApproachConfirm = useCallback(() => {
    if (!showConfirm) return;
    const id = showConfirm;
    setShowConfirm(null);
    setActivePlanet(id);
    setScene("APPROACH");
    setMissionLog((l) => [...l.slice(-9), "[\u70b9\u4eae] \u542f\u52a8\u5f15\u64ce\uff0c\u8d70\u8fd1" + BODIES.find((b) => b.id === id)?.name]);
  }, [showConfirm]);

  const handleApproachComplete = useCallback(() => {
    if (!activePlanet) return;
    // 新流程: APPROACH -> TUNNEL -> LANDING -> CLUE -> MISSION
    if (scene === "APPROACH") {
      setScene("TUNNEL");
      setTunnelProgress(0);
      setMissionLog((l) => [...l.slice(-9), "[\u7a7f\u8d8a] \u8d70\u8fdb\u5c0f\u884c\u661f\u5e26 \u00b7 \u542f\u52a8\u8eb2\u907f\u7cfb\u7edf"]);
      return;
    }
    if (scene === "TUNNEL") {
      setScene("LANDING");
      setLandingProgress(0);
      const dangerKey = ({ mercury: "Lava", venus: "Lava", earth: "Sand", mars: "Sand", jupiter: "Storm", saturn: "Ice", uranus: "Ice", neptune: "Storm" } as any)[activePlanet] || "Gas";
      setDangerMsg(zh.game.landingTitle + " \u00b7 " + ((zh.game as any)["landingDanger" + dangerKey] || ""));
      return;
    }
    if (scene === "LANDING") {
      setScene("CLUE");
      setClueProgress(0);
      setDangerMsg(null);
      return;
    }
    if (scene === "CLUE") {
      setScene("MISSION");
      return;
    }
    // 兜底
    setScene("LANDED");
    setMissionLog((l) => [...l.slice(-9), "[\u4e0b\u964d] \u5b89\u5168\u7740\u9646" + BODIES.find((b) => b.id === activePlanet)?.name]);
    setEnergy(100);
    setFuel((f) => Math.max(0, f - 8));
    setOxygen(100);
  }, [activePlanet, scene]);

  const handleAnswer = useCallback((i: number) => {
    if (answered || !activePlanet) return;
    setSelectedAnswer(i);
    setAnswered(true);
    const q = QUESTIONS[activePlanet];
    const ok = i === q.a;
    if (ok) {
      setScore((s) => s + 200);
      setSamples((s) => { const n = new Set(s); n.add(activePlanet); return n; });
      setMissionLog((l) => [...l.slice(-9), "[\u4efb\u52a1\u5b8c\u6210] \u83b7\u5f97\u201c" + BODIES.find((b) => b.id === activePlanet)?.name + "\u6838\u5fc3\u6837\u672c\u201d +200"]);
    } else {
      setEnergy((e) => Math.max(0, e - 15));
      setMissionLog((l) => [...l.slice(-9), "[\u4efb\u52a1\u5931\u8d25] \u6d88\u8017\u80fd\u91cf -15"]);
    }
  }, [answered, activePlanet]);
  const handleLaunch = useCallback(() => {
    if (!activePlanet) return;
    setScene("LAUNCH");
    setSelectedAnswer(null);
    setAnswered(false);
    setTimeout(() => {
      if (samples.size === 8) {
        setScene("FINISHED");
      } else {
        setActivePlanet(null);
        setScene("CRUISE");
        setMissionLog((l) => [...l.slice(-9), "[\u8d77\u98de] \u8fd4\u56de\u822a\u9053\uff0c\u5f80\u4e0b\u4e00\u4e2a\u76ee\u6807"]);
      }
    }, 1500);
  }, [activePlanet, samples.size]);

  const handleRestart = useCallback(() => {
    setScore(0); setSamples(new Set()); setActivePlanet(null);
    setSelectedAnswer(null); setAnswered(false);
    setNewRecord(false); setShowIntro(true);
    setEnergy(100); setFuel(100); setShields(100); setOxygen(100);
    setCrystals(0); setProbesFound(new Set());
    setAsteroidReached(false); setKuiperReached(false);
    setMissionLog(["[\u4efb\u52a1] \u63a2\u7d22\u592a\u9633\u7cfb\u5168\u90e8 8 \u9897\u884c\u661f"]);
    introStartRef.current = performance.now() / 1000;
    setStartTime(performance.now() / 1000);
    setScene("INTRO");
  }, []);

  // === HUD 触发探索/收集事件 ===
  const handleWorldEvent = useCallback((event: { kind: string; payload?: any }) => {
    if (event.kind === "enterAsteroidBelt" && !asteroidReached) {
      setAsteroidReached(true);
      setScore((s) => s + 150);
      setMissionLog((l) => [...l.slice(-9), "[\u652f\u7ebf] \u63a2\u7d22\u5c0f\u884c\u661f\u5e26 +150"]);
    } else if (event.kind === "enterKuiperBelt" && !kuiperReached) {
      setKuiperReached(true);
      setScore((s) => s + 200);
      setMissionLog((l) => [...l.slice(-9), "[\u652f\u7ebf] \u62b5\u8fbe\u67ef\u4f0a\u4f2f\u5e26 +200"]);
    } else if (event.kind === "collectCrystal") {
      setCrystals((c) => c + 1);
      setFuel((f) => Math.min(100, f + 5));
      setScore((s) => s + 10);
      setMissionLog((l) => [...l.slice(-9), "[\u6536\u96c6] " + zh.game.energyCollected]);
      if (crystals + 1 >= 5) {
        setScore((s) => s + 300);
        setMissionLog((l) => [...l.slice(-9), "[\u652f\u7ebf\u5b8c\u6210] " + zh.game.questComplete + " +300"]);
      }
    } else if (event.kind === "pickProbe") {
      const probeId = event.payload?.id;
      if (probeId && !probesFound.has(probeId)) {
        setProbesFound((s) => { const n = new Set(s); n.add(probeId); return n; });
        setScore((s) => s + 500);
        setMissionLog((l) => [...l.slice(-9), "[\u9690\u85cf] " + zh.game.probePicked + " (" + (PROBES.find((p) => p.id === probeId)?.name || "") + ")"]);
        if (probesFound.size + 1 >= 3) {
          setMissionLog((l) => [...l.slice(-9), "[\u9690\u85cf\u5b8c\u6210] " + zh.game.questComplete + " +1500"]);
          setScore((s) => s + 1500);
        }
      }
    } else if (event.kind === "distance") {
      setDistance(event.payload?.value || 0);
    } else if (event.kind === "tunnelHit") {
      setShields((s) => Math.max(0, s - (event.payload?.dmg || 0)));
      setMissionLog((l) => [...l.slice(-9), "[\u8b66\u62a5] " + zh.game.tunnelHit]);
    } else if (event.kind === "tunnelPickup") {
      setFuel((f) => Math.min(100, f + (event.payload?.fuel || 0)));
      setMissionLog((l) => [...l.slice(-9), "[\u56de\u6536] " + zh.game.tunnelPickup]);
    } else if (event.kind === "landingHit") {
      setShields((s) => Math.max(0, s - (event.payload?.dmg || 0)));
      setMissionLog((l) => [...l.slice(-9), "[\u8b66\u62a5] " + zh.game.landingHit]);
    } else if (event.kind === "landingDestroy") {
      setScore((s) => s + 30);
      setMissionLog((l) => [...l.slice(-9), "[\u51fb\u6bc1] " + zh.game.landingDestroy]);
    } else if (event.kind === "cluePickup") {
      setClueProgress((c) => Math.min(3, c + 1));
      setMissionLog((l) => [...l.slice(-9), "[\u7ebf\u7d22] " + zh.game.cluePickup]);
    }
  }, [asteroidReached, kuiperReached, crystals, probesFound]);

  const currentPlanetData = activePlanet ? BODIES.find((b) => b.id === activePlanet) : null;
  const isPerfectEnding = samples.size === 8 && asteroidReached && kuiperReached && crystals >= 5 && probesFound.size >= 3;

  return (
    <div className="relative w-full h-[calc(100vh-72px)] overflow-hidden bg-[#02010a]">
      {/* 3D \u4e3b\u573a\u666f */}
      <div className="absolute inset-0">
        <GameWorld
          mode={(scene === "INTRO" ? "INTRO" : scene === "APPROACH" ? "APPROACH" : scene === "TUNNEL" ? "TUNNEL" : scene === "LANDING" ? "LANDING" : scene === "CLUE" ? "CLUE" : scene === "LAUNCH" ? "APPROACH" : "CRUISE") as any}
          targetId={activePlanet}
          onApproachComplete={handleApproachComplete}
          onPlanetClick={handlePlanetClick}
          onWorldEvent={handleWorldEvent}
          startTime={startTime}
          selectedId={activePlanet}
          shields={shields}
        />
      </div>
      {/* HUD - \u5de6\u4e0a: \u8d44\u6e90 + \u4efb\u52a1\u6e05\u5355 */}
      <div className="absolute top-0 left-0 z-30 p-2 flex flex-col gap-1.5 pointer-events-none max-w-[240px]">
        <div className="pointer-events-auto flex items-center gap-2">
          <Link href="/" className="px-3 py-1.5 rounded-lg text-xs glass-strong hover:bg-white/10 transition flex items-center gap-1.5">
            <span>{"\u2190"}</span> {zh.game.back}
          </Link>
          <div className="glass-strong px-3 py-1.5 rounded-lg">
            <div className="font-display text-sm gradient-text leading-none">{zh.game.title}</div>
          </div>
        </div>
        {(scene === "TUNNEL" || scene === "LANDING" || scene === "CLUE") && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="pointer-events-auto glass-strong rounded-lg p-2.5 w-full">
            <div className="text-[10px] text-cyan-300 uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1 rounded-full bg-cyan-400 animate-pulse" />
              {scene === "TUNNEL" ? zh.game.tunnelTitle : scene === "LANDING" ? zh.game.landingTitle : zh.game.clueTitle}
              <span className="ml-auto text-white/60 font-mono">
                {scene === "TUNNEL" ? Math.round(tunnelProgress * 100) + "%" : scene === "LANDING" ? Math.round(landingProgress * 100) + "%" : clueProgress + "/3"}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden mb-1.5">
              <motion.div className="h-full" style={{ background: "linear-gradient(90deg,#22d3ee,#a855f7)", boxShadow: "0 0 8px #22d3ee" }} initial={{ width: 0 }} animate={{ width: (scene === "TUNNEL" ? tunnelProgress * 100 : scene === "LANDING" ? landingProgress * 100 : (clueProgress / 3) * 100) + "%" }} transition={{ type: "tween", duration: 0.3 }} />
            </div>
            <div className="text-[10px] text-white/60 leading-relaxed">{scene === "TUNNEL" ? zh.game.tunnelHint : scene === "LANDING" ? zh.game.landingHint : zh.game.clueHint}</div>
          </motion.div>
        )}
        {dangerMsg && (scene === "LANDING") && (
          <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="pointer-events-auto glass-strong rounded-lg p-2 w-full text-[10px] text-rose-300 border border-rose-500/30">
            ⚠ {dangerMsg}
          </motion.div>
        )}
        <div className="pointer-events-auto">
        </div>
        <div className="glass-strong rounded-lg p-2.5 w-full space-y-0.5 pointer-events-auto">
          <Resource label={zh.game.fuel} value={fuel} color="#22d3ee" />
          <Resource label={zh.game.energy} value={energy} color="#a855f7" />
          <Resource label={zh.game.shields} value={shields} color="#3b82f6" />
          <Resource label={zh.game.oxygen} value={oxygen} color="#10b981" />
          <Resource label={zh.game.samples} value={(samples.size / 8) * 100} color="#fbbf24" countText={samples.size + "/8"} />
          <Resource label={zh.game.exploration} value={Math.min(100, (samples.size * 8 + (asteroidReached ? 10 : 0) + (kuiperReached ? 10 : 0) + crystals * 2 + probesFound.size * 5))} color="#f472b6" />
        </div>
        {/* \u4efb\u52a1\u6e05\u5355 */}
        <div className="glass-strong rounded-lg p-2.5 pointer-events-auto text-[11px]">
          <div className="text-[9px] text-purple-300/80 tracking-widest uppercase mb-1">
            <span className="inline-block w-1.5 h-1 rounded-full bg-purple-400 animate-pulse mr-1" />
            {zh.game.mainQuests} {samples.size}/8
          </div>
          <div className="grid grid-cols-4 gap-1">
            {BODIES.filter((b) => b.id !== "sun").map((b) => (
              <div key={b.id} className={"px-1 py-0.5 rounded text-center text-[9px] " + (samples.has(b.id) ? "bg-emerald-500/20 text-emerald-300" : "bg-white/5 text-white/40")}>{b.name}</div>
            ))}
          </div>
          <div className="mt-2 text-[10px] text-cyan-300/80 tracking-widest uppercase mb-1">
            {zh.game.sideQuests} {asteroidReached && kuiperReached && crystals >= 5 ? "3/3" : [asteroidReached, kuiperReached, crystals >= 5].filter(Boolean).length + "/3"}
          </div>
          <div className="text-[10px] text-white/65 leading-relaxed">
            <div>{"\u2022 "} {zh.game.questAsteroid} {asteroidReached ? "\u2713" : ""}</div>
            <div>{"\u2022 "} {zh.game.questKuiper} {kuiperReached ? "\u2713" : ""}</div>
            <div>{"\u2022 "} {zh.game.questCollect} {crystals}/5</div>
          </div>
          <div className="mt-2 text-[10px] text-amber-300/80 tracking-widest uppercase mb-1">
            {zh.game.hiddenQuests} {probesFound.size}/3
          </div>
          <div className="text-[10px] text-white/65 leading-relaxed">
            {PROBES.map((p) => (
              <div key={p.id}>{"\u2022 "} {p.name} {probesFound.has(p.id) ? "\u2713" : ""}</div>
            ))}
          </div>
        </div>
      </div>

      {/* HUD - \u53f3\u4e0a: \u4efb\u52a1\u65e5\u5fd7 + \u5206\u6570 */}
      <div className="absolute top-0 right-0 z-30 p-2 flex flex-col gap-1.5 pointer-events-none items-end">
        <div className="glass-strong rounded-lg p-2.5 w-60 pointer-events-auto">
          <div className="text-[10px] text-amber-300/80 tracking-widest uppercase mb-1.5 flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            {zh.game.missionLog}
          </div>
          <div className="space-y-0.5 max-h-44 overflow-hidden">
            {missionLog.slice(-5).map((line, i) => (
              <motion.div key={i + line} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="text-[11px] text-white/75 font-mono leading-snug">{line}</motion.div>
            ))}
          </div>
        </div>
        <div className="glass-strong rounded-lg p-2.5 pointer-events-auto">
          <div className="flex items-center gap-3 text-[11px]">
            <div><span className="text-white/40">{zh.game.score}</span> <span className="font-mono text-fuchsia-300 font-bold">{score}</span></div>
            <div><span className="text-white/40">{zh.game.bestScore}</span> <span className="font-mono text-amber-300 font-bold">{bestScore}</span></div>
          </div>
        </div>
        {eventMsg && (
          <motion.div initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="glass-strong rounded-lg p-2.5 w-60 pointer-events-auto border border-rose-500/40">
            <div className="text-[10px] text-rose-300 tracking-widest uppercase mb-1 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
              ALERT
            </div>
            <div className="text-[12px] text-white/90 font-medium">{eventMsg}</div>
          </motion.div>
        )}
      </div>
      {/* \u4e2d\u592e\u51c6\u661f (\u5bfc\u822a\u65f6) */}
      {scene === "CRUISE" && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
          <svg width="80" height="80" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="2" fill="#a855f7" />
            <circle cx="40" cy="40" r="14" fill="none" stroke="rgba(168,85,247,0.4)" strokeWidth="1" strokeDasharray="2 3" />
            <line x1="40" y1="2" x2="40" y2="14" stroke="rgba(168,85,247,0.5)" strokeWidth="1" />
            <line x1="40" y1="66" x2="40" y2="78" stroke="rgba(168,85,247,0.5)" strokeWidth="1" />
            <line x1="2" y1="40" x2="14" y2="40" stroke="rgba(168,85,247,0.5)" strokeWidth="1" />
            <line x1="66" y1="40" x2="78" y2="40" stroke="rgba(168,85,247,0.5)" strokeWidth="1" />
          </svg>
        </div>
      )}

      {/* \u884c\u661f\u540d\u79f0\u60ac\u6d6e\u6807\u7b7e */}
      {hoveredPlanet && scene === "CRUISE" && (() => {
        const b = BODIES.find((x) => x.id === hoveredPlanet);
        if (!b) return null;
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20 glass-strong rounded-full px-4 py-2 text-sm pointer-events-none">
            <span className="text-white/90">{b.name}</span> <span className="text-white/40 ml-2 text-xs">{zh.game.clickHint}</span>
          </motion.div>
        );
      })()}

      {/* \u63a7\u5236\u63d0\u793a (\u521d\u59cb) */}
      {scene === "CRUISE" && missionLog.length <= 2 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 glass-strong rounded-full px-4 py-1.5 text-[11px] pointer-events-none text-white/60">
          {zh.game.controlHint}
        </div>
      )}

      {/* INTRO \u5e8f\u7ae0 */}
      <AnimatePresence>
        {showIntro && scene === "INTRO" && (
          <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm pointer-events-none">
            <div className="text-center max-w-3xl px-6">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3, duration: 0.8 }} className="text-amber-200/80 text-xs tracking-[0.5em] uppercase mb-3">{"\u00b7 \u5b87\u822a\u4f20\u9001\u4e2d \u00b7"}</motion.div>
              <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6, duration: 0.8 }} className="font-display text-5xl md:text-7xl font-semibold gradient-text mb-5 glow-text">{zh.game.title}</motion.h1>
              <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.0, duration: 0.8 }} className="text-white/80 text-base md:text-lg leading-relaxed mb-3">{zh.game.subtitle}</motion.p>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4, duration: 0.8 }} className="text-white/50 text-sm">{zh.game.missionDesc}</motion.p>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.0, duration: 0.8 }} className="mt-8 text-white/40 text-xs tracking-widest flex items-center justify-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                {zh.game.loading}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* \u63a5\u8fd1\u786e\u8ba4 */}
      <AnimatePresence>
        {showConfirm && (() => {
          const b = BODIES.find((x) => x.id === showConfirm);
          if (!b) return null;
          const q = QUESTIONS[showConfirm as PlanetId];
          const collected = samples.has(showConfirm as PlanetId);
          return (
            <motion.div key="confirm" initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-40 glass-strong rounded-2xl p-6 max-w-sm mx-4 text-center">
              <div className="text-4xl mb-2">{"\ud83d\ude80"}</div>
              <h3 className="font-display text-2xl gradient-text mb-2">{b.name}</h3>
              <p className="text-white/70 text-sm mb-3">
                {zh.game.confirmDesc.replace("{planet}", b.name)}
              </p>
              <div className="glass rounded-xl p-2.5 mb-3 text-left">
                <div className="text-[10px] text-purple-300/80 tracking-widest uppercase mb-1">{zh.game.targetMission}</div>
                <div className="text-xs text-white/85">{q.mission}</div>
              </div>
              <div className="text-[11px] text-amber-300/80 mb-3">{"\u26a0 \u5f15\u64ce\u5c06\u6d88\u8017 8 \u70b9\u71c3\u6599"}</div>
              <div className="flex gap-2">
                <button onClick={() => setShowConfirm(null)} className="btn-ghost flex-1">{zh.game.cancel}</button>
                <button onClick={handleApproachConfirm} className="btn-primary flex-1">{zh.game.launchShip}</button>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* LANDED \u63d0\u793a\u5361 */}
      <AnimatePresence>
        {scene === "LANDED" && currentPlanetData && (
          <motion.div key="landed" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 glass-strong rounded-2xl p-5 max-w-md mx-4 text-center">
            <div className="text-[10px] text-emerald-300/80 tracking-widest uppercase mb-1">{zh.game.touchdown}</div>
            <h3 className="font-display text-2xl gradient-text mb-1">{currentPlanetData.name}</h3>
            <p className="text-white/70 text-sm mb-3">{QUESTIONS[activePlanet!].mission}</p>
            <button onClick={() => setScene("MISSION")} className="btn-primary w-full">{zh.game.startMission}</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MISSION \u7b54\u9898\u5361 */}
      <AnimatePresence>
        {scene === "MISSION" && currentPlanetData && (() => {
          const q = QUESTIONS[activePlanet!];
          return (
            <motion.div key="mission" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} className="absolute right-4 top-1/2 -translate-y-1/2 z-30 glass-strong rounded-2xl p-5 max-w-sm">
              <div className="text-[10px] text-purple-300/80 tracking-widest uppercase mb-1">{zh.game.knowledgeCheck}</div>
              <h3 className="font-display text-xl gradient-text mb-1">{currentPlanetData.name}</h3>
              <p className="text-white/60 text-xs mb-3">{q.mission}</p>
              <div className="text-white/90 text-sm font-medium mb-3">{q.q}</div>
              <div className="space-y-2 mb-3">
                {q.options.map((opt, i) => {
                  const isCorrect = i === q.a; const isPicked = selectedAnswer === i;
                  let cls = "w-full text-left px-3 py-2.5 rounded-xl text-sm transition border ";
                  if (!answered) cls += "bg-white/5 hover:bg-white/10 border-white/10 text-white/85";
                  else if (isCorrect) cls += "bg-emerald-500/25 border-emerald-400/60 text-emerald-100";
                  else if (isPicked) cls += "bg-rose-500/25 border-rose-400/60 text-rose-100";
                  else cls += "bg-white/5 border-white/5 text-white/35";
                  return <button key={i} disabled={answered} onClick={() => handleAnswer(i)} className={cls}>{String.fromCharCode(65 + i)}. {opt}</button>;
                })}
              </div>
              {answered && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <div className={"text-sm font-medium mb-2 " + (selectedAnswer === q.a ? "text-emerald-300" : "text-rose-300")}>{selectedAnswer === q.a ? "\u2728 " + zh.game.correct : "\u26a0 " + zh.game.wrong}</div>
                  <div className="text-xs text-white/65 leading-relaxed mb-3">{q.fact}</div>
                  <button onClick={handleLaunch} className="btn-primary w-full text-sm py-2">{zh.game.takeoff} {"\u2192"}</button>
                </motion.div>
              )}
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* LAUNCH \u52a8\u753b\u63d0\u793a */}
      <AnimatePresence>
        {scene === "LAUNCH" && (
          <motion.div key="launch" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
            <div className="glass-strong rounded-2xl px-6 py-4 text-center">
              <div className="text-3xl mb-2">{"\ud83d\ude80"}</div>
              <div className="font-display text-xl gradient-text">{zh.game.takingOff}</div>
              <div className="text-xs text-white/60 mt-1">{zh.game.warping}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* FINISHED \u5b8c\u6210\u5f39\u7a97 */}
      <AnimatePresence>
        {scene === "FINISHED" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
            <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring" }} className="glass-strong rounded-3xl p-8 max-w-md text-center mx-4">
              <motion.div animate={{ rotate: [0, 8, -8, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-6xl mb-3">{isPerfectEnding ? "\ud83c\udfc5" : "\ud83c\udf1f"}</motion.div>
              <h2 className="font-display text-3xl gradient-text mb-2">{isPerfectEnding ? zh.game.perfectEnding : zh.game.finished}</h2>
              <p className="text-white/70 text-sm mb-3">{isPerfectEnding ? zh.game.perfectDesc : zh.game.finishedDesc}</p>
              {newRecord && <div className="text-amber-300 text-sm font-bold mb-2 animate-pulse">{"\u2728 " + zh.game.newRecord}</div>}
              <div className="grid grid-cols-3 gap-2 my-5 text-xs">
                <div className="glass rounded-lg p-2"><div className="text-white/50">{zh.game.samples}</div><div className="text-emerald-300 font-mono text-lg">{samples.size}/8</div></div>
                <div className="glass rounded-lg p-2"><div className="text-white/50">{zh.game.score}</div><div className="text-fuchsia-300 font-mono text-lg">{score}</div></div>
                <div className="glass rounded-lg p-2"><div className="text-white/50">{zh.game.bestScore}</div><div className="text-amber-300 font-mono text-lg">{Math.max(score, bestScore)}</div></div>
              </div>
              <div className="text-[10px] text-white/50 mb-3 space-y-0.5">
                <div>{zh.game.questAsteroid} {asteroidReached ? "\u2713" : "\u2717"}</div>
                <div>{zh.game.questKuiper} {kuiperReached ? "\u2713" : "\u2717"}</div>
                <div>{zh.game.questCollect} {crystals}/5</div>
                <div>{zh.game.questProbe} {probesFound.size}/3</div>
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

function Resource({ label, value, color, countText }: { label: string; value: number; color: string; countText?: string }) {
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