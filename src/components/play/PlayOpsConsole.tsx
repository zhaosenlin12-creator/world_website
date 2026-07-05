"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useMemo } from "react";
import SectorMap, { type SectorRouteItem } from "./SectorMap";

type Scene =
  | "INTRO"
  | "SOLAR_IDLE"
  | "MISSION_CONFIRM"
  | "APPROACH"
  | "DESCENT"
  | "SURFACE"
  | "QUIZ"
  | "FINISHED";

type Props = {
  scene: Scene;
  title: string;
  backLabel: string;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  onTogglePause: () => void;
  activePlanetName?: string;
  activeDistance?: number;
  stageLabel?: string;
  stageHint?: string;
  score: number;
  bestScore: number;
  shields: number;
  lives: number;
  combo: number;
  distance: number;
  collectedItems: number;
  hazardsAvoided: number;
  exploredPlanets: number;
  totalPlanets: number;
  missionLog: string[];
  routeItems: SectorRouteItem[];
  onRouteSelect?: (id: string) => void;
};

export default function PlayOpsConsole(props: Props) {
  const {
    scene,
    title,
    backLabel,
    voiceEnabled,
    onToggleVoice,
    onTogglePause,
    activePlanetName,
    activeDistance,
    stageLabel,
    stageHint,
    score,
    bestScore,
    shields,
    lives,
    combo,
    distance,
    collectedItems,
    hazardsAvoided,
    exploredPlanets,
    totalPlanets,
    missionLog,
    routeItems,
    onRouteSelect
  } = props;

  const latestLogs = useMemo(() => missionLog.slice(-3).reverse(), [missionLog]);
  if (scene === "INTRO" || scene === "FINISHED") return null;

  const inMission =
    scene === "MISSION_CONFIRM" ||
    scene === "APPROACH" ||
    scene === "DESCENT" ||
    scene === "SURFACE" ||
    scene === "QUIZ";

  const inPlayfield = scene === "DESCENT" || scene === "SURFACE" || scene === "QUIZ";
  const compactMap = inMission && scene !== "MISSION_CONFIRM";

  return (
    <>
      <div className="pointer-events-none absolute left-3 top-3 z-30 flex max-w-[360px] flex-col gap-2 md:left-5 md:top-5">
        <div className="pointer-events-auto flex items-center gap-2">
          <Link href="/" className="rounded-full border border-white/10 bg-black/28 px-4 py-2 text-xs text-white/84 backdrop-blur-md transition hover:bg-white/10">
            ← {backLabel}
          </Link>
          <button
            type="button"
            onClick={onTogglePause}
            className="rounded-full border border-white/10 bg-black/28 px-4 py-2 text-xs text-white/84 backdrop-blur-md transition hover:bg-white/10"
            title="ESC / P"
          >
            ⏸ 暂停
          </button>
          <button
            type="button"
            onClick={onToggleVoice}
            className="rounded-full border border-white/10 bg-black/28 px-4 py-2 text-xs text-white/84 backdrop-blur-md transition hover:bg-white/10"
          >
            {voiceEnabled ? "🔊 语音开" : "🔇 语音关"}
          </button>
          <div className="rounded-full border border-cyan-400/25 bg-black/28 px-4 py-2 text-xs text-cyan-200 backdrop-blur-md">
            {title}
          </div>
        </div>

        <div className="console-panel cyan relative overflow-hidden px-5 py-4">
          <div aria-hidden className="absolute inset-0 console-grid opacity-40" />
          <div className="relative">
            <div className="console-eyebrow text-cyan-200/85">{inMission ? "当前目标" : "任务总览"}</div>
            <div className="mt-2 font-display text-2xl font-semibold leading-tight text-white">
              {inMission ? (activePlanetName ?? "目标锁定") : `已探索 ${exploredPlanets}/${totalPlanets} 颗行星`}
            </div>
            <div className="mt-1 text-sm text-white/65">
              {inMission
                ? `${activeDistance ?? 0} AU · ${stageLabel ?? "准备起飞"}`
                : `最高分 ${bestScore} · 当前分 ${score}`}
            </div>
            {stageHint ? (
              <div className="console-divider my-3" />
            ) : null}
            {stageHint ? (
              <div className="line-clamp-2 text-xs leading-5 text-white/65">{stageHint}</div>
            ) : null}

            {combo > 1 ? (
              <motion.div
                key={`combo-${combo}`}
                initial={{ scale: 0.4, opacity: 0, rotate: -8 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                className="combo-badge mt-4 inline-block rounded-2xl px-3 py-1.5 text-xs font-bold"
              >
                🔥 连击 × {combo}
              </motion.div>
            ) : null}
          </div>
        </div>

        {inPlayfield ? (
          <div className="pointer-events-auto flex flex-wrap gap-3">
            <RingGauge label="护盾" value={shields} max={100} rgb={[34, 211, 238]} danger={shields < 30} />
            <LivesGauge label="生命" lives={lives} max={3} />
            <Mini label="样本" value={`${collectedItems}`} color="#a78bfa" />
            <Mini label="危害" value={`${hazardsAvoided}`} color="#fb7185" />
            <Mini label="航段" value={`${Math.round(distance)} m`} color="#f59e0b" />
            <Mini label="分数" value={`${score}`} color="#e879f9" />
          </div>
        ) : null}
      </div>

      <div className="pointer-events-none absolute right-3 top-3 z-30 md:right-5 md:top-5">
        <AnimatePresence initial={false} mode="wait">
          {compactMap ? (
            <motion.div
              key="mini"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
            >
              <MiniRouteCard routeItems={routeItems} activePlanetName={activePlanetName} totalPlanets={totalPlanets} />
            </motion.div>
          ) : (
            <motion.div
              key="full"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
            >
              <SectorMap
                routeItems={routeItems}
                exploredPlanets={exploredPlanets}
                totalPlanets={totalPlanets}
                bestScore={bestScore}
                onRouteSelect={onRouteSelect}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {inPlayfield ? (
        <div className="pointer-events-none absolute bottom-4 left-3 z-20 max-w-[360px] md:bottom-5 md:left-5">
          <motion.div
            initial={{ y: 6, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="console-panel amber relative overflow-hidden px-5 py-3"
          >
            <div aria-hidden className="absolute inset-0 console-grid opacity-30" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="console-eyebrow text-amber-200/85">任务播报</div>
                <span className="font-mono text-[10px] text-white/40">CH · {String(latestLogs.length).padStart(2, "0")}</span>
              </div>
              <div className="mt-2 space-y-1.5">
                {latestLogs.map((item, idx) => (
                  <div key={`${item}-${idx}`} className="text-[11px] leading-5 text-white/78">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      ) : null}

      {inPlayfield && activePlanetName ? (
        <div className="pointer-events-none absolute bottom-20 left-1/2 z-20 -translate-x-1/2 md:bottom-24">
          <motion.div
            key={`${activePlanetName}-${scene}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="console-panel cyan rounded-full px-6 py-2.5 text-center"
          >
            <div className="console-eyebrow text-white/45">
              {scene === "SURFACE" ? "地表探索" : scene === "QUIZ" ? "知识考验" : "飞行进场"}
            </div>
            <div className="mt-1 text-sm text-white/88">
              <span className="text-shimmer">{activePlanetName}</span> · {stageLabel ?? "—"}
            </div>
          </motion.div>
        </div>
      ) : null}
    </>
  );
}

function Mini({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      className="rounded-2xl border border-white/10 bg-black/32 px-3 py-2 backdrop-blur-md"
      style={{ boxShadow: `0 0 14px ${color}1f` }}
    >
      <div className="console-eyebrow text-white/45">{label}</div>
      <div className="mt-1 font-mono text-sm" style={{ color }}>
        {value}
      </div>
    </div>
  );
}

function RingGauge({ label, value, max, rgb, danger }: { label: string; value: number; max: number; rgb: [number, number, number]; danger?: boolean }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/32 px-3 py-2 backdrop-blur-md">
      <div
        className={danger ? "low" : ""}
        style={
          {
            ["--pct" as string]: pct.toFixed(0),
            ["--rgb" as string]: rgb.join(",")
          } as React.CSSProperties
        }
      >
        <div className="ring-gauge" style={{ width: 52, height: 52 }}>
          <div className="relative z-10 text-center">
            <div className="text-[10px] uppercase tracking-[0.2em] text-white/45">护盾</div>
            <div className="font-mono text-xs text-cyan-200" style={{ color: `rgb(${rgb.join(",")})` }}>{Math.round(value)}</div>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <div className="console-eyebrow text-white/45">{label}</div>
        <div className="font-mono text-xs text-white/70">{Math.round(value)} / {max}</div>
        <div className="neon-bar mt-1.5 w-20" style={{ color: `rgb(${rgb.join(",")})` }}>
          <span style={{ width: `${pct}%`, background: `linear-gradient(90deg, rgb(${rgb.join(",")}) 0%, rgba(255,255,255,0.85) 100%)` }} />
        </div>
      </div>
    </div>
  );
}

function LivesGauge({ label, lives, max }: { label: string; lives: number; max: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/32 px-3 py-2 backdrop-blur-md">
      <div className="console-eyebrow text-white/45">{label}</div>
      <div className="mt-1 flex items-center gap-1">
        {Array.from({ length: max }).map((_, idx) => (
          <motion.span
            key={idx}
            initial={false}
            animate={{ scale: idx < lives ? 1.18 : 1, opacity: idx < lives ? 1 : 0.25 }}
            transition={{ type: "spring", stiffness: 320, damping: 14 }}
            className="inline-flex h-3 w-3 items-center justify-center rounded-full"
            style={{ background: idx < lives ? "linear-gradient(135deg, #34d399, #22d3ee)" : "rgba(255,255,255,0.18)" }}
          />
        ))}
      </div>
      <div className="mt-1 font-mono text-[11px] text-emerald-200">{lives} / {max}</div>
    </div>
  );
}

function MiniRouteCard({ routeItems, activePlanetName, totalPlanets }: { routeItems: SectorRouteItem[]; activePlanetName: string | undefined; totalPlanets: number }) {
  const activeIndex = Math.max(0, routeItems.findIndex((item) => item.active));
  return (
    <div className="console-panel fuchsia w-[260px] px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="console-eyebrow text-fuchsia-200/85">航路进度</div>
        <span className="font-mono text-[10px] text-white/45">第 {activeIndex + 1}/{totalPlanets} 站</span>
      </div>
      <div className="mt-1 text-sm font-medium text-white">{activePlanetName ?? "目标锁定中"}</div>
      <div className="mt-3 flex items-center gap-1.5">
        {routeItems.map((item) => (
          <span
            key={item.id}
            className="inline-block h-2.5 rounded-full transition-all"
            style={{
              width: item.active ? 22 : item.completed ? 14 : 8,
              background: item.completed ? "#34d399" : item.active ? item.glow || "#fbbf24" : "rgba(255,255,255,0.2)",
              boxShadow: item.active ? `0 0 12px ${item.glow || "#fbbf24"}` : "none",
              opacity: item.active || item.completed ? 1 : 0.5
            }}
            title={item.name}
          />
        ))}
      </div>
    </div>
  );
}
