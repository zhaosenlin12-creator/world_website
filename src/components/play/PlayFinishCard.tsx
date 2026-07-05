"use client";

import { motion } from "framer-motion";
import Link from "next/link";

type RouteItem = { id: string; name: string; glow?: string; completed: boolean };

type Props = {
  isPerfect: boolean;
  samples: Set<string>;
  totalPlanets: number;
  score: number;
  bestScore: number;
  newRecord: boolean;
  distance: number;
  hazardsAvoided: number;
  startedAt: number;
  onRestart: () => void;
  zh: {
    finished: string;
    finishedDesc: string;
    perfectEnding: string;
    perfectDesc: string;
    newRecord: string;
    samples: string;
    score: string;
    bestScore: string;
    restart: string;
    back: string;
  };
};

export default function PlayFinishCard({
  isPerfect,
  samples,
  totalPlanets,
  score,
  bestScore,
  newRecord,
  distance,
  hazardsAvoided,
  startedAt,
  onRestart,
  zh
}: Props) {
  const collected = samples.size;
  const elapsedSec = Math.max(0, Math.round((Date.now() - startedAt) / 1000));
  const minutes = Math.floor(elapsedSec / 60);
  const seconds = elapsedSec % 60;
  const collectedList = Array.from(samples);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/72 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 22 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 22 }}
        className="console-panel cyan relative mx-4 w-full max-w-3xl overflow-hidden p-7 md:p-9"
      >
        <div aria-hidden className="absolute inset-0 console-grid opacity-40" />
        <motion.span
          aria-hidden
          className="absolute -top-32 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full"
          style={{ background: isPerfect ? "radial-gradient(circle, rgba(232,121,249,0.45), transparent 70%)" : "radial-gradient(circle, rgba(34,211,238,0.35), transparent 70%)" }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
        />

        <div className="relative grid gap-6 md:grid-cols-[0.9fr_1.1fr]">
          <div className="flex flex-col items-center text-center">
            <motion.div
              animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.05, 1] }}
              transition={{ duration: 2.4, repeat: Infinity }}
              className="mb-3 text-7xl drop-shadow-[0_0_24px_rgba(232,121,249,0.4)]"
            >
              {isPerfect ? "🛰️" : "🪐"}
            </motion.div>
            <div className="console-eyebrow text-cyan-200/85">任务总结</div>
            <h2 className="mt-2 font-display text-3xl font-semibold text-white text-shimmer">
              {isPerfect ? zh.perfectEnding : zh.finished}
            </h2>
            <p className="mt-2 max-w-xs text-sm text-white/65">{isPerfect ? zh.perfectDesc : zh.finishedDesc}</p>

            {newRecord ? (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="combo-badge mt-3 inline-block rounded-full px-4 py-1 text-xs font-bold"
              >
                ⭐ {zh.newRecord}
              </motion.div>
            ) : null}

            <div className="mt-6 flex w-full flex-col gap-2">
              <button type="button" onClick={onRestart} className="rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-5 py-2.5 text-sm font-medium text-slate-950 shadow-[0_0_24px_rgba(34,211,238,0.45)] transition hover:scale-[1.01]">
                {zh.restart}
              </button>
              <Link href="/" className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-center text-sm text-white/82 transition hover:bg-white/10">
                {zh.back}
              </Link>
            </div>
          </div>

          <div>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <Stat label={zh.samples} value={`${collected}/${totalPlanets}`} color="#10b981" />
              <Stat label={zh.score} value={`${score}`} color="#e879f9" />
              <Stat label={zh.bestScore} value={`${Math.max(score, bestScore)}`} color="#fbbf24" />
              <Stat label="航段耗时" value={`${minutes}m ${seconds}s`} color="#22d3ee" />
              <Stat label="进航里程" value={`${Math.round(distance)} m`} color="#f59e0b" />
              <Stat label="规避危害" value={`${hazardsAvoided}`} color="#fb7185" />
            </div>

            <div className="console-divider my-5" />

            <div className="console-eyebrow text-cyan-200/85">样本回收清单</div>
            {collectedList.length > 0 ? (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {collectedList.map((name) => (
                  <div
                    key={name}
                    className="rounded-2xl border border-emerald-300/25 bg-emerald-400/5 px-2 py-2 text-center text-[11px] text-emerald-200"
                    title={name}
                  >
                    <div className="font-mono">✓</div>
                    <div className="mt-1 capitalize">{name}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-3 rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-xs text-white/55">
                本次航段未回收任何样本 ——下次记得击中行星表面的样本节点。
              </div>
            )}

            <div className="console-divider my-5" />

            <div className="flex items-center justify-between text-[11px] text-white/55">
              <span>· 完整遥测数据写入本地存储 ·</span>
              <span className="text-cyan-200/80">SOL /// HELIOS</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/32 px-3 py-2">
      <div className="text-[10px] uppercase tracking-[0.28em] text-white/45">{label}</div>
      <div className="mt-1 font-mono text-base" style={{ color }}>
        {value}
      </div>
    </div>
  );
}
