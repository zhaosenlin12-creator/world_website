"use client";

import Link from "next/link";
import { motion } from "framer-motion";

type Scene =
  | "INTRO"
  | "SOLAR_IDLE"
  | "MISSION_CONFIRM"
  | "APPROACH"
  | "DESCENT"
  | "SURFACE"
  | "QUIZ"
  | "FINISHED";

type RouteItem = {
  id: string;
  name: string;
  glow?: string;
  completed: boolean;
  active: boolean;
};

type Props = {
  scene: Scene;
  title: string;
  backLabel: string;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
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
  exploredPlanets: number;
  totalPlanets: number;
  missionLog: string[];
  routeItems: RouteItem[];
  onRouteSelect?: (id: string) => void;
};

export default function PlayHud({
  scene,
  title,
  backLabel,
  voiceEnabled,
  onToggleVoice,
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
  exploredPlanets,
  totalPlanets,
  missionLog,
  routeItems,
  onRouteSelect,
}: Props) {
  if (scene === "INTRO" || scene === "FINISHED") return null;

  const inMission =
    scene === "MISSION_CONFIRM" ||
    scene === "APPROACH" ||
    scene === "DESCENT" ||
    scene === "SURFACE" ||
    scene === "QUIZ";

  const inPlayfield = scene === "DESCENT" || scene === "SURFACE" || scene === "QUIZ";
  const compactRoute = inMission && scene !== "MISSION_CONFIRM";
  const activeRouteIndex = Math.max(0, routeItems.findIndex((item) => item.active));
  const latestLogs = missionLog.slice(-3).reverse();

  return (
    <>
      <div className="pointer-events-none absolute left-3 top-3 z-30 flex max-w-[320px] flex-col gap-2 md:left-5 md:top-5">
        <div className="pointer-events-auto flex items-center gap-2">
          <Link
            href="/"
            className="rounded-full border border-white/10 bg-black/28 px-4 py-2 text-xs text-white/82 backdrop-blur-md transition hover:bg-white/10"
          >
            ← {backLabel}
          </Link>
          <button
            type="button"
            onClick={onToggleVoice}
            className="rounded-full border border-white/10 bg-black/28 px-4 py-2 text-xs text-white/82 backdrop-blur-md transition hover:bg-white/10"
          >
            {voiceEnabled ? "语音开" : "语音关"}
          </button>
          <div className="rounded-full border border-cyan-400/20 bg-black/28 px-4 py-2 text-xs text-cyan-200 backdrop-blur-md">
            {title}
          </div>
        </div>

        <div className="pointer-events-auto rounded-3xl border border-white/10 bg-black/30 px-4 py-3 backdrop-blur-md shadow-[0_0_30px_rgba(34,211,238,0.08)]">
          <div className="text-[10px] uppercase tracking-[0.32em] text-cyan-300/80">
            {inMission ? "当前目标" : "任务总览"}
          </div>
          <div className="mt-2 text-lg font-semibold text-white">
            {inMission ? activePlanetName : `已探索 ${exploredPlanets}/${totalPlanets} 颗行星`}
          </div>
          <div className="mt-1 text-sm text-white/68">
            {inMission ? `${activeDistance} AU · ${stageLabel || "任务准备"}` : `最高分 ${bestScore} · 总分 ${score}`}
          </div>
          {stageHint ? (
            <div className="mt-2 line-clamp-2 text-xs leading-5 text-white/60">{stageHint}</div>
          ) : null}
        </div>

        {inPlayfield ? (
          <div className="pointer-events-auto flex flex-wrap gap-2">
            <StatusChip label="护盾" value={`${Math.round(shields)}%`} color="#22d3ee" />
            <StatusChip label="生命" value={`${lives}×`} color="#10b981" />
            <StatusChip label="距离" value={`${Math.round(distance)}m`} color="#f59e0b" />
            <StatusChip label="样本" value={`${collectedItems}`} color="#a78bfa" />
            {combo > 1 ? <StatusChip label="连击" value={`×${combo}`} color="#fbbf24" /> : null}
          </div>
        ) : null}
      </div>

      <div className="pointer-events-none absolute right-3 top-3 z-30 md:right-5 md:top-5">
        {compactRoute ? (
          <div className="rounded-3xl border border-white/10 bg-black/28 px-4 py-3 backdrop-blur-md shadow-[0_0_24px_rgba(59,130,246,0.08)]">
            <div className="text-[10px] uppercase tracking-[0.3em] text-cyan-300/80">航路进度</div>
            <div className="mt-1 text-sm font-medium text-white">
              第 {activeRouteIndex + 1} / {totalPlanets} 站
            </div>
            <div className="mt-1 text-xs text-white/64">{activePlanetName || "目标锁定中"}</div>
            <div className="mt-3 flex items-center gap-1.5">
              {routeItems.map((item) => (
                <span
                  key={item.id}
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{
                    background: item.completed ? "#34d399" : item.active ? item.glow || "#fbbf24" : "rgba(255,255,255,0.2)",
                    boxShadow: item.active ? `0 0 10px ${item.glow || "#fbbf24"}` : "none",
                    opacity: item.active || item.completed ? 1 : 0.55,
                  }}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-black/30 p-4 backdrop-blur-md shadow-[0_0_24px_rgba(59,130,246,0.08)]">
            <div className="mb-2 text-[10px] uppercase tracking-[0.32em] text-cyan-300/80">航路图</div>
            <div className="space-y-1.5">
              {routeItems.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onRouteSelect?.(item.id)}
                  className="pointer-events-auto flex w-full items-center gap-2 rounded-full px-2 py-1 text-left text-xs transition hover:bg-white/6"
                  style={{ opacity: item.active ? 1 : 0.72 }}
                >
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ background: item.glow || "#94a3b8", boxShadow: `0 0 10px ${item.glow || "#94a3b8"}` }}
                  />
                  <span className={item.completed ? "text-emerald-300" : item.active ? "text-amber-200" : "text-white/58"}>
                    {item.completed ? "✓" : item.active ? "→" : `${index + 1}.`} {item.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {inPlayfield ? (
        <div className="pointer-events-none absolute bottom-4 left-3 z-20 max-w-[320px] md:bottom-5 md:left-5">
          <div className="rounded-2xl border border-white/10 bg-black/24 px-4 py-3 backdrop-blur-md shadow-[0_0_24px_rgba(34,211,238,0.06)]">
            <div className="mb-2 text-[10px] uppercase tracking-[0.3em] text-cyan-300/75">任务播报</div>
            <div className="space-y-1.5">
              {latestLogs.map((item, index) => (
                <div key={`${item}-${index}`} className="text-[11px] leading-5 text-white/72">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {inPlayfield && activePlanetName ? (
        <div className="pointer-events-none absolute bottom-20 left-1/2 z-20 -translate-x-1/2">
          <motion.div
            key={`${activePlanetName}-${scene}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-full border border-white/10 bg-black/36 px-5 py-2.5 text-center backdrop-blur-md"
          >
            <div className="text-[10px] uppercase tracking-[0.3em] text-white/50">
              {scene === "SURFACE" ? "地表探索" : scene === "QUIZ" ? "知识考验" : "飞行进场"}
            </div>
            <div className="mt-1 text-sm text-white/88">
              {activePlanetName} · {stageLabel}
            </div>
          </motion.div>
        </div>
      ) : null}
    </>
  );
}

function StatusChip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      className="rounded-full border border-white/10 bg-black/28 px-3 py-2 backdrop-blur-md shadow-[0_0_18px_rgba(15,23,42,0.28)]"
      style={{ boxShadow: `0 0 16px ${color}18` }}
    >
      <div className="text-[10px] uppercase tracking-[0.28em] text-white/48">{label}</div>
      <div className="mt-1 text-sm font-semibold" style={{ color }}>
        {value}
      </div>
    </div>
  );
}
