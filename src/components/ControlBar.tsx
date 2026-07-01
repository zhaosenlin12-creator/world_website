"use client";
import { motion } from "framer-motion";
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

export function ControlBar({ paused, onPause, speed, onSpeed, showOrbits, onOrbits, showLabels, onLabels, onReset }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-strong rounded-2xl px-4 py-2 flex items-center gap-2"
    >
      <button onClick={onPause} className="btn-ghost px-3 py-1.5" title={paused ? zh.explorer.play : zh.explorer.paused}>
        {paused ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>
        )}
        <span className="text-xs">{paused ? zh.explorer.play : zh.explorer.paused}</span>
      </button>
      <div className="flex items-center gap-1.5 px-2 border-l border-white/10">
        <span className="text-[10px] tracking-widest text-white/50">{zh.explorer.speed}</span>
        {[0.5, 1, 2, 5].map((s) => (
          <button
            key={s}
            onClick={() => onSpeed(s)}
            className={`px-2 py-0.5 rounded text-xs ${speed === s ? "bg-purple-600 text-white" : "text-white/60 hover:bg-white/5"}`}
          >{s}x</button>
        ))}
      </div>
      <div className="flex items-center gap-1.5 px-2 border-l border-white/10">
        <button onClick={onOrbits} className={`px-2 py-1 rounded text-xs ${showOrbits ? "bg-white/10" : "text-white/60 hover:bg-white/5"}`}>{zh.explorer.orbits}</button>
        <button onClick={onLabels} className={`px-2 py-1 rounded text-xs ${showLabels ? "bg-white/10" : "text-white/60 hover:bg-white/5"}`}>{zh.explorer.labels}</button>
      </div>
      <button onClick={onReset} className="btn-ghost px-3 py-1.5 border-l border-white/10 ml-1">
        <span className="text-xs">{zh.buttons.reset}</span>
      </button>
    </motion.div>
  );
}
