"use client";

import { motion } from "framer-motion";

export type StageKey = "WARP" | "APPROACH" | "ENTRY" | "ATMOSPHERE" | "LANDING";

const STAGES: StageKey[] = ["WARP", "APPROACH", "ENTRY", "ATMOSPHERE", "LANDING"];

const STAGE_LABEL: Record<StageKey, string> = {
  WARP: "超光速",
  APPROACH: "引力接近",
  ENTRY: "轨道切入",
  ATMOSPHERE: "穿越大气",
  LANDING: "终端着陆"
};

type Props = {
  stage: StageKey;
  hint?: string;
};

export default function StageTicker({ stage, hint }: Props) {
  const activeIdx = STAGES.indexOf(stage);

  return (
    <div className="console-panel cyan pointer-events-none mx-auto flex w-fit min-w-[420px] max-w-[80vw] flex-col items-center gap-1 px-5 py-2.5">
      <div className="console-eyebrow text-cyan-200/85">阶段航标</div>
      <div className="flex items-center gap-2">
        {STAGES.map((s, idx) => (
          <div key={s} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <div className={`stage-seg ${idx < activeIdx ? "done" : idx === activeIdx ? "active" : "upcoming"}`} />
              <span
                className={`text-[10px] uppercase tracking-[0.18em] ${
                  idx < activeIdx
                    ? "text-emerald-300/80"
                    : idx === activeIdx
                      ? "text-cyan-200 text-shimmer"
                      : "text-white/35"
                }`}
              >
                {STAGE_LABEL[s]}
              </span>
            </div>
            {idx < STAGES.length - 1 ? (
              <div className="mb-5 h-px w-5 bg-white/15" />
            ) : null}
          </div>
        ))}
      </div>
      {hint ? (
        <motion.div
          key={hint}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-[60vw] truncate text-[11px] text-white/55"
        >
          {hint}
        </motion.div>
      ) : null}
    </div>
  );
}
