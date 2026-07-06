"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { missionSubtitleCatalog } from "@/lib/play/assetCatalog";
import { getFlightStage } from "@/lib/play/descentFlight";
import {
  COLLECT_KIND_LABEL,
  PLANET_ORDER,
  missionData,
  type PlanetId,
} from "@/lib/play/missionData";
import { zh } from "@/i18n/zh";
import { useMissionVoice, type MissionVoiceKey } from "@/hooks/useMissionVoice";
import { GameWorld, BODIES } from "./GameWorld";
import LandingPlatformer from "./LandingPlatformer";
import SurfaceMission from "./SurfaceMission";
import AudioSubtitle from "./play/AudioSubtitle";
import MissionConsole from "./play/MissionConsole";
import PauseOverlay from "./play/PauseOverlay";
import PlayBriefingIntro from "./play/PlayBriefingIntro";
import PlayFinishCard from "./play/PlayFinishCard";
import PlayOpsConsole from "./play/PlayOpsConsole";
import StageTicker from "./play/StageTicker";
import { usePlayHotkeys } from "@/hooks/usePlayHotkeys";

type Scene =
  | "INTRO"
  | "SOLAR_IDLE"
  | "MISSION_CONFIRM"
  | "APPROACH"
  | "DESCENT"
  | "SURFACE"
  | "QUIZ"
  | "FINISHED";

type StageKey = "WARP" | "APPROACH" | "ENTRY" | "ATMOSPHERE" | "LANDING";
type LandingVoiceCue =
  | "landingTransition"
  | "fragileWarning"
  | "hazardWarning"
  | "respawn"
  | "sample"
  | "touchdown";

const STAGE_TEXT: Record<StageKey, string> = {
  WARP: "跃迁推进",
  APPROACH: "引力接近",
  ENTRY: "轨道切入",
  ATMOSPHERE: "大气层穿越",
  LANDING: "终端着陆",
};

const STAGE_HINT: Record<StageKey, string> = {
  WARP: "先穿过外层碎石带，保持航向稳定。",
  APPROACH: "障碍密度上升，开始微调航路。",
  ENTRY: "目标行星正在放大，准备进入近轨校正。",
  ATMOSPHERE: "热防护与减速同步进行，注意控制节奏。",
  LANDING: "即将切入缓降流程，准备进入残骸通道。",
};

const STAGE_VOICE: Partial<Record<StageKey, MissionVoiceKey>> = {
  APPROACH: "approach",
  ENTRY: "entry",
  ATMOSPHERE: "atmosphere",
};

const STORAGE_KEY = "marble_quest_best_v2";
const AUDIO_STORAGE_KEY = "marble_quest_voice_v2";

function useSound() {
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && !ctxRef.current) {
      const Ctx = window.AudioContext || (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (Ctx) ctxRef.current = new Ctx();
    }
  }, []);

  const play = useCallback((freq: number, dur: number, type: OscillatorType = "sine", vol = 0.15) => {
    if (!ctxRef.current) return;
    try {
      const ctx = ctxRef.current;
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
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

  return useMemo(() => ({
    collect() {
      play(880, 0.08, "sine", 0.18);
      window.setTimeout(() => play(1280, 0.1, "triangle", 0.14), 60);
    },
    hazard() {
      play(180, 0.18, "sawtooth", 0.2);
    },
    win() {
      [523, 659, 784, 1046].forEach((f, i) => window.setTimeout(() => play(f, 0.2, "sine", 0.2), i * 110));
    },
    lose() {
      [420, 320, 220, 120].forEach((f, i) => window.setTimeout(() => play(f, 0.22, "sawtooth", 0.15), i * 110));
    },
    click() {
      play(660, 0.05, "sine", 0.1);
    },
  }), [play]);
}

export function GameClient() {
  const [webglOK, setWebglOK] = useState(true);
  const [scene, setScene] = useState<Scene>("INTRO");
  const [activeIdx, setActiveIdx] = useState(0);
  const [pendingPlanet, setPendingPlanet] = useState<PlanetId | null>(null);
  const activePlanet = PLANET_ORDER[activeIdx];
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [shields, setShields] = useState(100);
  const [lives, setLives] = useState(3);
  const [collectedItems, setCollectedItems] = useState(0);
  const [distance, setDistance] = useState(0);
  const [stageLabel, setStageLabel] = useState<StageKey>("WARP");
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [samples, setSamples] = useState<Set<PlanetId>>(new Set());
  const [newRecord, setNewRecord] = useState(false);
  const [missionLog, setMissionLog] = useState<string[]>(["[总控] 太阳系任务链已上线，等待锁定目标"]);
  const [flashRed, setFlashRed] = useState(false);
  const [flashGreen, setFlashGreen] = useState(false);
  const [floatScore, setFloatScore] = useState<{ id: number; x: number; y: number; text: string; color: string }[]>([]);
  const [combo, setCombo] = useState(0);
  const [approachStart, setApproachStart] = useState(0);
  const [landing2D, setLanding2D] = useState(false);
  const [playPaused, setPlayPaused] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [lastVoiceText, setLastVoiceText] = useState("");
  const [pauseMenuOpen, setPauseMenuOpen] = useState(false);
  const [startedAt, setStartedAt] = useState<number>(() => Date.now());
  const [hazardsAvoided, setHazardsAvoided] = useState(0);
  const [localDebugEnabled, setLocalDebugEnabled] = useState(false);
  const sound = useSound();
  const voice = useMissionVoice(voiceEnabled);
  const comboTimer = useRef(0);
  const lastStageVoiceRef = useRef<StageKey | null>(null);
  const subtitleTimerRef = useRef<number | null>(null);
  const timeoutsRef = useRef<number[]>([]);

  const body = BODIES.find((item) => item.id === activePlanet);
  const mission = missionData[activePlanet];
  const pendingBody = BODIES.find((item) => item.id === pendingPlanet);
  const pendingMission = pendingPlanet ? missionData[pendingPlanet] : null;
  const isPerfect = samples.size === PLANET_ORDER.length;

  const queueTimeout = useCallback((callback: () => void, delay: number) => {
    const id = window.setTimeout(() => {
      timeoutsRef.current = timeoutsRef.current.filter((item) => item !== id);
      callback();
    }, delay);
    timeoutsRef.current.push(id);
    return id;
  }, []);

  const clearQueuedTimeouts = useCallback(() => {
    timeoutsRef.current.forEach((id) => window.clearTimeout(id));
    timeoutsRef.current = [];
  }, []);

  useEffect(() => clearQueuedTimeouts, [clearQueuedTimeouts]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
      if (!gl) setWebglOK(false);
      if (
        ["localhost", "127.0.0.1"].includes(window.location.hostname) &&
        new URLSearchParams(window.location.search).get("qa") === "1"
      ) {
        setLocalDebugEnabled(true);
      }
    } catch {
      setWebglOK(false);
    }
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setBestScore(Number(stored));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUDIO_STORAGE_KEY);
      if (stored === "off") setVoiceEnabled(false);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(AUDIO_STORAGE_KEY, voiceEnabled ? "on" : "off");
    } catch {}
  }, [voiceEnabled]);

  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
      setNewRecord(true);
      try {
        localStorage.setItem(STORAGE_KEY, String(score));
      } catch {}
    } else {
      setNewRecord(false);
    }
  }, [bestScore, score]);

  useEffect(() => {
    if (scene !== "INTRO") return;
    const id = window.setTimeout(() => setScene("SOLAR_IDLE"), 2400);
    return () => window.clearTimeout(id);
  }, [scene]);

  useEffect(() => {
    const unlockAudio = () => voice.unlock();
    window.addEventListener("pointerdown", unlockAudio, { once: true });
    window.addEventListener("keydown", unlockAudio, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
    };
  }, [voice]);

  useEffect(() => {
    if (scene === "SOLAR_IDLE") {
      lastStageVoiceRef.current = null;
      setLastVoiceText("");
    }
  }, [activePlanet, scene]);

  const log = useCallback((msg: string) => {
    setMissionLog((prev) => [...prev.slice(-8), msg]);
  }, []);

  const addFloat = useCallback((text: string, color: string) => {
    const id = Date.now() + Math.random();
    setFloatScore((prev) => [...prev.slice(-7), { id, x: 30 + Math.random() * 46, y: 28 + Math.random() * 26, text, color }]);
    queueTimeout(() => {
      setFloatScore((prev) => prev.filter((item) => item.id !== id));
    }, 1200);
  }, [queueTimeout]);

  const speakVoice = useCallback((key: MissionVoiceKey, options?: { cooldownMs?: number; interrupt?: boolean; volume?: number }) => {
    voice.speak(key, options);
    if (!voiceEnabled) return;
    if (subtitleTimerRef.current) window.clearTimeout(subtitleTimerRef.current);
    setLastVoiceText(missionSubtitleCatalog[key]);
    subtitleTimerRef.current = window.setTimeout(() => {
      setLastVoiceText("");
      subtitleTimerRef.current = null;
    }, 2600);
  }, [voice, voiceEnabled]);

  useEffect(() => {
    return () => {
      if (subtitleTimerRef.current) window.clearTimeout(subtitleTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (scene !== "DESCENT" || landing2D) return;
    const nextVoice = STAGE_VOICE[stageLabel];
    if (!nextVoice) return;
    if (lastStageVoiceRef.current === stageLabel) return;
    lastStageVoiceRef.current = stageLabel;
    speakVoice(nextVoice, { cooldownMs: 1200, interrupt: true, volume: 0.94 });
  }, [landing2D, scene, speakVoice, stageLabel]);

  const handlePlanetClick = useCallback((id: string) => {
    if (scene !== "SOLAR_IDLE" && scene !== "MISSION_CONFIRM") return;
    const idx = PLANET_ORDER.indexOf(id as PlanetId);
    if (idx < 0) return;
    sound.click();
    voice.unlock();
    setActiveIdx(idx);
    setPendingPlanet(id as PlanetId);
    setScene("MISSION_CONFIRM");
    speakVoice("targetLocked", { cooldownMs: 300, interrupt: true, volume: 0.96 });
    log(`[锁定] 已锁定 ${BODIES.find((item) => item.id === id)?.name}，等待任务确认`);
  }, [log, scene, sound, speakVoice, voice]);

  const handleMissionStart = useCallback(() => {
    if (!pendingPlanet) return;
    clearQueuedTimeouts();
    setApproachStart(Date.now());
    setStartedAt(Date.now());
    setPauseMenuOpen(false);
    setAnswered(false);
    setSelectedAnswer(null);
    setCollectedItems(0);
    setCombo(0);
    setDistance(0);
    setStageLabel("WARP");
    setLanding2D(false);
    setPlayPaused(false);
    setScene("APPROACH");
    log(`[起航] ${missionData[pendingPlanet].title} 已启动`);
    queueTimeout(() => {
      setScene("DESCENT");
      log(`[进场] 已进入 ${BODIES.find((item) => item.id === pendingPlanet)?.name} 接近窗口`);
    }, 2600);
  }, [clearQueuedTimeouts, log, pendingPlanet, queueTimeout]);

  const handleMissionBack = useCallback(() => {
    setPendingPlanet(null);
    setScene("SOLAR_IDLE");
    setLastVoiceText("");
    log("[待命] 已返回太阳系待机视图");
  }, [log]);

  const handleCollect = useCallback((kind: string) => {
    const points = kind === "sample" ? 120 : 50 + Math.min(combo, 5) * 10;
    setCollectedItems((value) => value + 1);
    setCombo((value) => value + 1);
    setHazardsAvoided((value) => value + 1);
    if (comboTimer.current) window.clearTimeout(comboTimer.current);
    comboTimer.current = window.setTimeout(() => setCombo(0), 1800);
    setScore((value) => value + points);
    sound.collect();
    log(`[收集] ${COLLECT_KIND_LABEL[kind] || kind} +${points}`);
    addFloat(`+${points}`, kind === "sample" ? "#22d3ee" : kind === "star" ? "#fbbf24" : kind === "ruby" ? "#fb7185" : "#10b981");
    setFlashGreen(true);
    queueTimeout(() => setFlashGreen(false), 220);
  }, [addFloat, combo, log, queueTimeout, sound]);

  const handleHazard = useCallback(() => {
    setShields((prev) => {
      const next = Math.max(0, prev - 25);
      if (next === 0) {
        setLives((currentLives) => {
          const remaining = currentLives - 1;
          sound.hazard();
          if (remaining <= 0) {
            log("[警报] 生命已耗尽，任务中止");
            queueTimeout(() => {
              sound.lose();
              setScene("FINISHED");
            }, 800);
          } else {
            log(`[警报] 护盾耗尽，剩余生命 ${remaining}`);
            setShields(100);
          }
          return remaining;
        });
      } else {
        sound.hazard();
      }
      return next;
    });
    speakVoice("hazardWarning", { cooldownMs: 2400, interrupt: false, volume: 0.9 });
    setFlashRed(true);
    queueTimeout(() => setFlashRed(false), 220);
  }, [log, queueTimeout, sound, speakVoice]);

  const handleLandingStart = useCallback(() => {
    if (landing2D) return;
    setLanding2D(true);
    setPlayPaused(true);
    if (typeof window !== "undefined") {
      (window as Window & typeof globalThis & { __landingPlanetId?: PlanetId }).__landingPlanetId = activePlanet;
    }
    speakVoice("landingTransition", { cooldownMs: 800, interrupt: true, volume: 0.96 });
    log("[缓降] 大气层穿越完成，切入残骸下降通道");
  }, [activePlanet, landing2D, log, speakVoice]);

  const handleLandingComplete = useCallback(() => {
    setLanding2D(false);
    setPlayPaused(true);
    setScene("SURFACE");
    sound.win();
    speakVoice("touchdown", { cooldownMs: 600, interrupt: true, volume: 0.96 });
    log(`[着陆] 已降落至 ${body?.name}，开始地表探索`);
  }, [body?.name, log, sound, speakVoice]);

  const handleSurfaceCollect = useCallback(() => {
    handleCollect("sample");
  }, [handleCollect]);

  const handleSurfaceComplete = useCallback(() => {
    setScene("QUIZ");
    setPlayPaused(true);
    log("[地表] 样本回收完成，开启最终科学考验");
  }, [log]);

  const handleLandingVoiceCue = useCallback((cue: LandingVoiceCue) => {
    if (cue === "fragileWarning") speakVoice("fragileWarning", { cooldownMs: 2200, interrupt: true, volume: 0.94 });
    if (cue === "hazardWarning") speakVoice("hazardWarning", { cooldownMs: 2400, interrupt: false, volume: 0.9 });
    if (cue === "respawn") speakVoice("respawn", { cooldownMs: 1800, interrupt: true, volume: 0.94 });
    if (cue === "sample") speakVoice("sample", { cooldownMs: 900, interrupt: false, volume: 0.86 });
    if (cue === "touchdown") speakVoice("touchdown", { cooldownMs: 600, interrupt: true, volume: 0.96 });
    if (cue === "landingTransition") speakVoice("landingTransition", { cooldownMs: 800, interrupt: true, volume: 0.96 });
  }, [speakVoice]);

  const handleFlightComplete = useCallback(() => {
    if (scene !== "DESCENT") return;
    if (!landing2D) {
      handleLandingStart();
      log("[同步] 飞行段到达终点，自动切入缓降阶段");
    }
  }, [handleLandingStart, landing2D, log, scene]);

  const handleAnswer = useCallback((index: number) => {
    if (answered) return;
    setSelectedAnswer(index);
    setAnswered(true);
    if (index === mission.quiz.answer) {
      setScore((value) => value + 200);
      setSamples((prev) => {
        const next = new Set(prev);
        next.add(activePlanet);
        return next;
      });
      log(`[正确] ${body?.name} 核心样本已登记 +200`);
      sound.collect();
    } else {
      log(`[错误] 正确答案：${mission.quiz.options[mission.quiz.answer]}`);
      sound.hazard();
    }
  }, [activePlanet, answered, body?.name, log, mission.quiz.answer, mission.quiz.options, sound]);

  const handleNextMission = useCallback(() => {
    setAnswered(false);
    setSelectedAnswer(null);
    setCollectedItems(0);
    setShields(100);
    setCombo(0);
    setDistance(0);
    setPendingPlanet(null);
    setPlayPaused(false);
    setLanding2D(false);
    if (activeIdx + 1 >= PLANET_ORDER.length) {
      setScene("FINISHED");
      log("[完成] 全部 8 颗行星任务已完成");
      sound.win();
      return;
    }
    setActiveIdx((value) => value + 1);
    setScene("SOLAR_IDLE");
    log("[返航] 已返回太阳系，准备下一个目标");
  }, [activeIdx, log, sound]);

  const handleRestart = useCallback(() => {
    clearQueuedTimeouts();
    setPauseMenuOpen(false);
    setStartedAt(Date.now());
    setHazardsAvoided(0);
    setScene("INTRO");
    setActiveIdx(0);
    setPendingPlanet(null);
    setScore(0);
    setBestScore((prev) => prev);
    setShields(100);
    setLives(3);
    setCollectedItems(0);
    setDistance(0);
    setStageLabel("WARP");
    setAnswered(false);
    setSelectedAnswer(null);
    setSamples(new Set());
    setNewRecord(false);
    setMissionLog(["[总控] 太阳系任务链已重置，等待锁定目标"]);
    setLanding2D(false);
    setPlayPaused(false);
    setCombo(0);
    setLastVoiceText("");
    lastStageVoiceRef.current = null;
  }, [clearQueuedTimeouts]);

  const handlePosition = useCallback((z: number) => {
    setDistance(Math.max(0, -z));
    setStageLabel(getFlightStage(z));
  }, []);

  // 绑定键盘拦截
  usePlayHotkeys(
    useMemo(
      () => ({
        onPauseToggle: () => {
          setPauseMenuOpen((value) => {
            const next = !value;
            setPlayPaused(next);
            return next;
          });
        },
        onRestart: () => handleRestart()
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      []
    ),
    scene !== "INTRO"
  );

  const routeItems = useMemo(() => PLANET_ORDER.map((planetId, index) => {
    const planetBody = BODIES.find((item) => item.id === planetId);
    return {
      id: planetId,
      name: planetBody?.name || planetId,
      glow: planetBody?.glow,
      completed: samples.has(planetId),
      active: activeIdx === index,
    };
  }), [activeIdx, samples]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!["localhost", "127.0.0.1"].includes(window.location.hostname)) return;

    const api = {
      getState: () => ({
        scene,
        activePlanet,
        pendingPlanet,
        stageLabel,
        landing2D,
        playPaused,
        answered,
        selectedAnswer,
        samples: Array.from(samples),
        score,
        shields,
        lives,
      }),
      selectPlanet: (planetId: PlanetId) => handlePlanetClick(planetId),
      startMission: () => handleMissionStart(),
      jumpToLanding: () => {
        setScene("DESCENT");
        setPlayPaused(true);
        setLanding2D(true);
      },
      completeLanding: () => handleLandingComplete(),
      jumpToSurface: () => {
        setLanding2D(false);
        setPlayPaused(true);
        setScene("SURFACE");
      },
      completeSurface: () => handleSurfaceComplete(),
      answer: (index: number) => handleAnswer(index),
      next: () => handleNextMission(),
    };

    (window as Window & typeof globalThis & { __playDebug?: typeof api }).__playDebug = api;
    return () => {
      delete (window as Window & typeof globalThis & { __playDebug?: typeof api }).__playDebug;
    };
  }, [
    activePlanet,
    answered,
    handleAnswer,
    handleLandingComplete,
    handleMissionStart,
    handleNextMission,
    handlePlanetClick,
    handleSurfaceComplete,
    landing2D,
    lives,
    pendingPlanet,
    playPaused,
    samples,
    scene,
    score,
    selectedAnswer,
    shields,
    stageLabel,
  ]);

  return (
    <div className="relative h-screen w-full select-none overflow-hidden bg-[#02010a]">
      <AnimatePresence>
        {flashRed ? <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.38 }} exit={{ opacity: 0 }} className="pointer-events-none absolute inset-0 z-40 bg-rose-500" /> : null}
        {(stageLabel === "ATMOSPHERE" || stageLabel === "LANDING") && scene === "DESCENT" ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: stageLabel === "LANDING" ? 0.34 : 0.22 }}
            className="pointer-events-none absolute inset-0 z-30"
            style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(255,140,40,0.46) 90%, rgba(255,80,0,0.68) 100%)" }}
          />
        ) : null}
        {flashGreen ? <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.22 }} exit={{ opacity: 0 }} className="pointer-events-none absolute inset-0 z-40 bg-emerald-400" /> : null}
      </AnimatePresence>

      <AnimatePresence>
        {floatScore.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 0, scale: 0.6 }}
            animate={{ opacity: 1, y: -48, scale: 1.16 }}
            exit={{ opacity: 0, y: -92 }}
            transition={{ duration: 1.2 }}
            className="pointer-events-none absolute z-30 font-mono text-2xl font-bold"
            style={{ left: `${item.x}%`, top: `${item.y}%`, color: item.color, textShadow: `0 0 12px ${item.color}` }}
          >
            {item.text}
          </motion.div>
        ))}
      </AnimatePresence>

      {!webglOK ? (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#02010a]">
          <div className="max-w-md px-6 text-center">
            <div className="mb-3 text-6xl">🛸</div>
            <h2 className="gradient-text mb-2 font-display text-2xl">需要 WebGL 加速</h2>
            <p className="mb-3 text-sm leading-relaxed text-white/70">此游戏依赖浏览器启用 WebGL / GPU 加速。请使用新版 Chrome、Edge 或 Firefox 重试。</p>
            <Link href="/" className="btn-ghost inline-block mt-3">{zh.game.back}</Link>
          </div>
        </div>
      ) : null}

      {webglOK ? (
        <div className="absolute inset-0">
          <GameWorld
            scene={scene}
            targetId={activePlanet}
            onPlanetClick={handlePlanetClick}
            startTime={approachStart}
            paused={playPaused || landing2D || pauseMenuOpen}
            onCollect={handleCollect}
            onHazard={handleHazard}
            onComplete={handleFlightComplete}
            onPosition={handlePosition}
            onLandingStart={handleLandingStart}
          />
        </div>
      ) : null}

      <LandingPlatformer
        active={landing2D}
        accent={body?.accent || body?.glow || "#22d3ee"}
        groundColor={body?.ground || "#0e3b5c"}
        onCollect={() => handleCollect("crystal")}
        onHazard={handleHazard}
        onComplete={handleLandingComplete}
        onVoiceCue={handleLandingVoiceCue}
      />

      <SurfaceMission
        active={scene === "SURFACE"}
        planetId={activePlanet}
        planetName={body?.name || activePlanet}
        accent={body?.accent || body?.glow || "#22d3ee"}
        summary={mission.summary}
        goal={mission.surfaceGoal}
        missionType={mission.environment.missionType}
        nodes={mission.surfaceNodes}
        hazards={mission.surfaceHazards}
        onCollect={handleSurfaceCollect}
        onHazard={handleHazard}
        onComplete={handleSurfaceComplete}
        onVoiceCue={(cue) => handleLandingVoiceCue(cue === "sample" ? "sample" : "hazardWarning")}
      />

      <PlayOpsConsole
        scene={scene}
        title={zh.game.title}
        backLabel={zh.game.back}
        voiceEnabled={voiceEnabled}
        onToggleVoice={() => setVoiceEnabled((value) => !value)}
        activePlanetName={body?.name}
        activeDistance={body?.distance}
        stageLabel={scene === "SURFACE" ? "地表探索" : scene === "QUIZ" ? "知识考验" : STAGE_TEXT[stageLabel]}
        stageHint={scene === "SURFACE" ? mission.surfaceGoal : scene === "MISSION_CONFIRM" ? mission.briefing : scene === "DESCENT" ? STAGE_HINT[stageLabel] : undefined}
        score={score}
        bestScore={bestScore}
        shields={shields}
        lives={lives}
        combo={combo}
        distance={distance}
        collectedItems={collectedItems}
        exploredPlanets={samples.size}
        totalPlanets={PLANET_ORDER.length}
        missionLog={missionLog}
        routeItems={routeItems}
        onRouteSelect={handlePlanetClick}
        hazardsAvoided={hazardsAvoided}
        onTogglePause={() => setPauseMenuOpen((value) => !value)}
      />

      <StageTicker
        stage={stageLabel}
        hint={
          scene === "DESCENT"
            ? STAGE_HINT[stageLabel]
            : scene === "SURFACE"
              ? mission.surfaceGoal
              : scene === "QUIZ"
                ? "知识考验 · 答题获取样本"
                : scene === "APPROACH"
                  ? "进入星际接近窗口"
                  : undefined
        }
      />

      <PauseOverlay
        open={pauseMenuOpen && scene !== "INTRO" && scene !== "FINISHED"}
        voiceEnabled={voiceEnabled}
        onToggleVoice={() => setVoiceEnabled((value) => !value)}
        onResume={() => setPauseMenuOpen(false)}
        onRestart={() => {
          setPauseMenuOpen(false);
          handleRestart();
        }}
        onBack={() => {
          setPauseMenuOpen(false);
          handleMissionBack();
        }}
        sceneHint={
          scene === "DESCENT"
            ? STAGE_HINT[stageLabel]
            : scene === "SURFACE"
              ? mission.surfaceGoal
              : scene === "QUIZ"
                ? "知识考验 · 答题获取样本"
                : undefined
        }
      />

      <PlayBriefingIntro
        open={scene === "INTRO"}
        voiceEnabled={voiceEnabled}
        onToggleVoice={() => setVoiceEnabled((value) => !value)}
        onStart={() => setScene("SOLAR_IDLE")}
        onBack={() => {
          if (typeof window !== "undefined") {
            window.location.href = "/";
          }
        }}
      />

      <AudioSubtitle text={lastVoiceText} />

      <AnimatePresence>
        {scene === "INTRO" ? (
          <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-md">
            <div className="max-w-3xl px-6 text-center">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1, duration: 0.5 }} className="mb-3 text-xs uppercase tracking-[0.5em] text-amber-200/80">· 宇航传送中 ·</motion.div>
              <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3, duration: 0.5 }} className="glow-text gradient-text mb-4 font-display text-5xl font-semibold md:text-7xl">{zh.game.title}</motion.h1>
              <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5, duration: 0.5 }} className="mb-2 text-base leading-relaxed text-white/85 md:text-lg">{zh.game.subtitle}</motion.p>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.5 }} className="text-xs text-white/55">选星 → 飞行接近 → 残骸缓降 → 地表探索 → 科学考验</motion.p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <MissionConsole
        open={scene === "MISSION_CONFIRM" && !!pendingPlanet}
        planetName={pendingBody?.name || ""}
        planetDistance={pendingBody?.distance || 0}
        accent={pendingBody?.accent || pendingBody?.glow || "#22d3ee"}
        mission={pendingMission}
        progressText={`已探索 ${samples.size}/${PLANET_ORDER.length}`}
        onStart={handleMissionStart}
        onBack={handleMissionBack}
      />

      <AnimatePresence>
        {scene === "SOLAR_IDLE" ? (
          <motion.div key="solar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pointer-events-none absolute bottom-6 left-1/2 z-30 -translate-x-1/2">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-strong rounded-full px-5 py-2.5 text-center">
              <div className="mb-0.5 text-[10px] uppercase tracking-[0.4em] text-amber-200/80">点击太阳系中的行星</div>
              <div className="text-sm text-white/90">先看任务简报，再启动完整探索流程</div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {scene === "APPROACH" ? (
          <motion.div key="approach" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="text-center">
              <div className="relative mx-auto mb-4 flex h-28 w-28 items-center justify-center">
                <motion.div
                  animate={{ scale: [0.96, 1.08, 0.96], opacity: [0.24, 0.6, 0.24] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 rounded-full border border-cyan-300/28"
                />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-[14%] rounded-full border border-fuchsia-300/22"
                >
                  <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(34,211,238,0.9)]" />
                </motion.div>
                <motion.div
                  animate={{ scale: [1, 1.14, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  className="absolute inset-[34%] rounded-full border border-white/18"
                />
                <div className="relative h-8 w-8 rounded-full bg-[radial-gradient(circle_at_35%_35%,rgba(255,255,255,0.95),rgba(34,211,238,0.9),rgba(14,116,144,0.22))] shadow-[0_0_30px_rgba(34,211,238,0.45)]" />
              </div>
              <div className="gradient-text mb-1 font-display text-3xl">超光速跳迁中</div>
              <div className="text-sm text-white/80">目的地 <span className="font-bold text-amber-200">{body?.name}</span> · {body?.distance} AU</div>
              <div className="mt-2 text-xs uppercase tracking-[0.32em] text-cyan-200/72">航迹锁定 · 姿态同步 · 推进器稳定</div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {scene === "DESCENT" && collectedItems < 2 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pointer-events-none absolute bottom-6 left-1/2 z-20 -translate-x-1/2 rounded-full border border-white/10 bg-black/30 px-4 py-1.5 text-[11px] text-white/70 backdrop-blur-md">
          WASD / 方向键 驾驶 · 躲避陨石 · 穿入目标行星着陆窗口
        </motion.div>
      ) : null}

      <AnimatePresence>
        {scene === "QUIZ" ? (
          <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pointer-events-auto absolute inset-0 z-40 flex items-center justify-center bg-black/55 px-4 backdrop-blur-md">
            <motion.div initial={{ scale: 0.92, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} className="glass-strong w-full max-w-md rounded-3xl p-7">
              <div className="mb-4 text-center">
                <div className="mb-1 text-[10px] uppercase tracking-widest text-cyan-300/80">{zh.game.knowledgeCheck}</div>
                <div className="gradient-text mb-1 font-display text-2xl">{body?.name}</div>
                <div className="text-[10px] text-white/40">{body?.distance} AU · {activeIdx + 1}/{PLANET_ORDER.length}</div>
              </div>
              <div className="mb-4 text-sm leading-relaxed text-white/90">{mission.quiz.question}</div>
              <div className="mb-4 grid grid-cols-1 gap-2">
                {mission.quiz.options.map((option, index) => {
                  let cls = "w-full rounded-lg border px-3 py-2.5 text-left text-sm transition ";
                  if (!answered) cls += "border-white/10 bg-white/5 text-white/85 hover:bg-white/10";
                  else if (index === mission.quiz.answer) cls += "border-emerald-400/60 bg-emerald-500/20 text-emerald-200";
                  else if (index === selectedAnswer) cls += "border-rose-400/60 bg-rose-500/20 text-rose-200";
                  else cls += "border-white/5 bg-white/5 text-white/30";
                  return (
                    <button key={option} type="button" disabled={answered} onClick={() => handleAnswer(index)} className={cls}>
                      {String.fromCharCode(65 + index)}. {option}
                    </button>
                  );
                })}
              </div>
              {answered ? (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <div className={`mb-2 text-sm font-medium ${selectedAnswer === mission.quiz.answer ? "text-emerald-300" : "text-rose-300"}`}>
                    {selectedAnswer === mission.quiz.answer ? `✓ ${zh.game.correct}` : `✗ ${zh.game.wrong}`}
                  </div>
                  <div className="mb-4 text-xs leading-relaxed text-white/65">{mission.quiz.fact}</div>
                  <button type="button" onClick={handleNextMission} className="btn-primary w-full">
                    {activeIdx + 1 >= PLANET_ORDER.length ? `${zh.game.finished} ✓` : `→ 返回太阳系 · ${BODIES.find((item) => item.id === PLANET_ORDER[activeIdx + 1])?.name}`}
                  </button>
                </motion.div>
              ) : null}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {scene === "FINISHED" ? (
        <PlayFinishCard
          isPerfect={isPerfect}
          samples={samples}
          totalPlanets={PLANET_ORDER.length}
          score={score}
          bestScore={bestScore}
          newRecord={newRecord}
          distance={distance}
          hazardsAvoided={hazardsAvoided}
          startedAt={startedAt}
          onRestart={handleRestart}
          zh={{
            finished: zh.game.finished,
            finishedDesc: zh.game.finishedDesc,
            perfectEnding: zh.game.perfectEnding,
            perfectDesc: zh.game.perfectDesc,
            newRecord: zh.game.newRecord,
            samples: zh.game.samples,
            score: zh.game.score,
            bestScore: zh.game.bestScore,
            restart: zh.game.restart,
            back: zh.game.back
          }}
        />
      ) : null}

      {localDebugEnabled ? (
        <div
          data-testid="play-debug"
          data-scene={scene}
          data-planet={activePlanet}
          className="fixed bottom-3 left-3 z-[70] flex max-w-[420px] flex-wrap gap-2 rounded-2xl border border-white/10 bg-black/55 px-3 py-2 text-[11px] text-white/80 backdrop-blur-md"
        >
          {PLANET_ORDER.map((planetId) => (
            <button key={`debug-select-${planetId}`} data-testid={`debug-select-${planetId}`} type="button" onClick={() => handlePlanetClick(planetId)} className="rounded-full border border-white/10 px-2 py-1 transition hover:bg-white/10">
              {planetId}
            </button>
          ))}
          <button data-testid="debug-start-mission" type="button" onClick={handleMissionStart} className="rounded-full border border-cyan-400/30 px-2 py-1 text-cyan-200 transition hover:bg-cyan-400/10">开始</button>
          <button data-testid="debug-complete-landing" type="button" onClick={handleLandingComplete} className="rounded-full border border-amber-400/30 px-2 py-1 text-amber-200 transition hover:bg-amber-400/10">缓降完成</button>
          <button data-testid="debug-complete-surface" type="button" onClick={handleSurfaceComplete} className="rounded-full border border-emerald-400/30 px-2 py-1 text-emerald-200 transition hover:bg-emerald-400/10">地表完成</button>
          <button data-testid="debug-answer-correct" type="button" onClick={() => handleAnswer(mission.quiz.answer)} className="rounded-full border border-fuchsia-400/30 px-2 py-1 text-fuchsia-200 transition hover:bg-fuchsia-400/10">答对</button>
          <button data-testid="debug-next" type="button" onClick={handleNextMission} className="rounded-full border border-white/10 px-2 py-1 transition hover:bg-white/10">下一步</button>
        </div>
      ) : null}
    </div>
  );
}
