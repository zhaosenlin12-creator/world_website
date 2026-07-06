"use client";

import { motion } from "framer-motion";

export type SectorRouteItem = {
  id: string;
  name: string;
  glow?: string;
  completed: boolean;
  active: boolean;
};

type Props = {
  routeItems: SectorRouteItem[];
  exploredPlanets: number;
  totalPlanets: number;
  bestScore: number;
  onRouteSelect?: (id: string) => void;
};

export default function SectorMap({ routeItems, exploredPlanets, totalPlanets, bestScore, onRouteSelect }: Props) {
  const W = 320;
  const H = 168;
  const cx = W / 2;
  const cy = H / 2;

  // Layout the planets along an arc.
  const positioned = routeItems.map((item, idx) => {
    const ratio = (idx + 1) / (routeItems.length + 1);
    const angle = Math.PI * (1 - ratio) - Math.PI / 2;
    const radius = Math.min(W, H) * 0.42;
    return {
      ...item,
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius * 0.85,
      idx
    };
  });

  return (
    <div className="console-panel fuchsia w-[340px] px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="console-eyebrow text-fuchsia-200/85">航路图</div>
        <div className="flex items-center gap-3 text-[10px] text-white/55">
          <span>{exploredPlanets}/{totalPlanets} 颗</span>
          <span className="text-amber-200/85">最佳 {bestScore}</span>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 w-full">
        <defs>
          <radialGradient id="sector-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f0abfc" stopOpacity="0.6" />
            <stop offset="70%" stopColor="#1e1b4b" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="sector-trail" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#a855f7" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#f0abfc" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        <circle cx={cx} cy={cy} r={Math.min(W, H) * 0.42} fill="none" stroke="rgba(167,139,250,0.18)" strokeDasharray="2 5" />
        <circle cx={cx} cy={cy} r={Math.min(W, H) * 0.18} fill="url(#sector-core)" />
        <circle cx={cx} cy={cy} r="2.2" fill="#f0abfc" />

        {positioned.length > 1 ? (
          <motion.path
            d={positioned.map((p) => `${p === positioned[0] ? "M" : "L"} ${p.x} ${p.y}`).join(" ")}
            fill="none"
            stroke="url(#sector-trail)"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        ) : null}

        {positioned.map((item) => (
          <g
            key={item.id}
            transform={`translate(${item.x},${item.y})`}
            onClick={() => onRouteSelect?.(item.id)}
            className="cursor-pointer"
          >
            {item.active ? (
              <circle r="14" fill={item.glow || "#fbbf24"} opacity="0.18">
                <animate attributeName="r" from="10" to="16" dur="1.4s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.4" to="0" dur="1.4s" repeatCount="indefinite" />
              </circle>
            ) : null}
            <circle
              r={item.active ? 7 : item.completed ? 5 : 4}
              fill={item.completed ? "#34d399" : item.active ? item.glow || "#fbbf24" : "rgba(255,255,255,0.4)"}
              stroke={item.active ? "#fff" : "rgba(255,255,255,0.4)"}
              strokeWidth="1"
            />
            <text
              x="10"
              y="3"
              fontSize="9"
              fill={item.active ? "#fde68a" : item.completed ? "#a7f3d0" : "rgba(255,255,255,0.55)"}
              className="font-mono"
            >
              {item.completed ? "✓" : item.active ? "→" : ""} {item.name}
            </text>
          </g>
        ))}
      </svg>

      <div className="console-divider mt-1" />
      <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] text-white/55">
        <div>· 待探索 {positioned.filter((p) => !p.completed && !p.active).length} 颗</div>
        <div className="text-right">· 当前位置已标记</div>
      </div>
    </div>
  );
}
