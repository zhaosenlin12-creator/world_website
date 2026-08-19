"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { zh } from "@/i18n/zh";

interface Props {
  paused: boolean;
  onPause: () => void;
  speed: number;
  onSpeed: (n: number) => void;
  showOrbits: boolean;
  onOrbits: () => void;
  showLabels: boolean;
  onLabels: () => void;
  onReset: () => void;
}

export function ControlBar({
  paused,
  onPause,
  speed,
  onSpeed,
  showOrbits,
  onOrbits,
  showLabels,
  onLabels,
  onReset,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="flex max-w-[calc(100vw-32px)] flex-wrap items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/42 px-3 py-2 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.28)]"
    >
      <button onClick={onPause} className="btn-ghost px-3 py-1.5" title={paused ? zh.explorer.play : zh.explorer.paused}>
        {paused ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
          </svg>
        )}
        <span className="text-xs">{paused ? zh.explorer.play : zh.explorer.paused}</span>
      </button>

      <div className="flex items-center gap-1.5 border-l border-white/10 px-2">
        <span className="text-[10px] tracking-widest text-white/50">{zh.explorer.speed}</span>
        {[0.5, 1, 2, 5].map((s) => (
          <button
            key={s}
            onClick={() => onSpeed(s)}
            className={`rounded px-2 py-0.5 text-xs ${speed === s ? "bg-purple-600 text-white" : "text-white/60 hover:bg-white/5"}`}
          >
            {s}x
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1.5 border-l border-white/10 px-2">
        <button
          onClick={onOrbits}
          className={`rounded px-2 py-1 text-xs ${showOrbits ? "bg-white/10" : "text-white/60 hover:bg-white/5"}`}
        >
          轨道
        </button>
        <button
          onClick={onLabels}
          className={`rounded px-2 py-1 text-xs ${showLabels ? "bg-white/10" : "text-white/60 hover:bg-white/5"}`}
        >
          标签
        </button>
      </div>

      <Link
        href="/spacecrafts/fleet/"
        className="btn-ghost ml-1 inline-flex items-center gap-2 border-l border-white/10 px-3 py-1.5 text-xs text-cyan-200 hover:bg-white/5"
      >
        <span aria-hidden>&#8594;</span>飞行器场景
      </Link>

      <button onClick={onReset} className="btn-ghost ml-1 border-l border-white/10 px-3 py-1.5">
        <span className="text-xs">{zh.buttons.reset}</span>
      </button>
    </motion.div>
  );
}
