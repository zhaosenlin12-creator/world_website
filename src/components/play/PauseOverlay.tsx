"use client";

import { AnimatePresence, motion } from "framer-motion";

type Props = {
  open: boolean;
  onResume: () => void;
  onRestart: () => void;
  onBack: () => void;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  sceneHint?: string;
};

const KEYS: Array<{ combo: string; desc: string }> = [
  { combo: "WASD / 方向键", desc: "驾驶飞船 / 操控地面探车" },
  { combo: "Space", desc: "互动 / 跳跃（任务阶段）" },
  { combo: "鼠标拖动", desc: "调整镜头视角" },
  { combo: "ESC / P", desc: "暂停 / 继续任务" },
  { combo: "R", desc: "重新开始当前行星任务" }
];

export default function PauseOverlay({ open, onResume, onRestart, onBack, voiceEnabled, onToggleVoice, sceneHint }: Props) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="pause-scrim fixed inset-0 z-50 flex items-center justify-center px-4"
        >
          <motion.div
            initial={{ y: 22, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 18, opacity: 0 }}
            transition={{ type: "spring", stiffness: 240, damping: 22 }}
            className="console-panel cyan w-full max-w-3xl p-7 md:p-9"
          >
            <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
              <div>
                <div className="console-eyebrow text-cyan-200/85">任务控制 · 暂停</div>
                <h2 className="mt-2 font-display text-3xl font-semibold text-white md:text-4xl text-shimmer">操作员，请指示</h2>
                <p className="mt-3 max-w-md text-sm leading-7 text-white/70">
                  飞船已切入待命模式，遥测数据仍在写入。等你确认是否继续任务，或切换到控制台的其他面板。
                </p>
                {sceneHint ? (
                  <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/5 px-4 py-3 text-xs text-amber-100/82">
                    <span className="font-semibold uppercase tracking-wider">任务提示 ·</span> {sceneHint}
                  </div>
                ) : null}

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <ActionButton label="继续任务" accent="cyan" onClick={onResume} primary>
                    推进航向
                  </ActionButton>
                  <ActionButton label="重新启动" accent="amber" onClick={onRestart}>
                    从起点开始
                  </ActionButton>
                  <ActionButton label={voiceEnabled ? "关闭语音" : "开启语音"} accent="fuchsia" onClick={onToggleVoice}>
                    {voiceEnabled ? "TTS：开" : "TTS：关"}
                  </ActionButton>
                  <ActionButton label="返回太阳系" accent="rose" onClick={onBack}>
                    取消任务
                  </ActionButton>
                </div>
              </div>

              <div>
                <div className="console-eyebrow text-cyan-200/85">操作参考</div>
                <div className="console-divider my-2" />
                <ul className="space-y-2">
                  {KEYS.map((k) => (
                    <li key={k.combo} className="flex items-start gap-3 rounded-2xl bg-white/4 px-3 py-2 text-xs text-white/72">
                      <kbd className="min-w-[120px] rounded-lg border border-white/10 bg-black/30 px-2 py-1 font-mono text-[10px] text-cyan-200">
                        {k.combo}
                      </kbd>
                      <span className="leading-5">{k.desc}</span>
                    </li>
                  ))}
                </ul>

                <div className="console-divider my-4" />
                <div className="text-[11px] text-white/45">
                  · 当前会话所有遥测数据持续写入本地存储，关闭页面不会丢失进度。
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function ActionButton({
  label,
  accent,
  onClick,
  primary,
  children
}: {
  label: string;
  accent: "cyan" | "amber" | "fuchsia" | "rose";
  onClick: () => void;
  primary?: boolean;
  children?: React.ReactNode;
}) {
  const palette: Record<typeof accent, { fg: string; border: string; bg: string; glow: string }> = {
    cyan:    { fg: "#22d3ee", border: "rgba(34,211,238,0.3)",  bg: "rgba(34,211,238,0.06)",  glow: "rgba(34,211,238,0.35)" },
    amber:   { fg: "#fbbf24", border: "rgba(251,191,36,0.3)",  bg: "rgba(251,191,36,0.06)",  glow: "rgba(251,191,36,0.35)" },
    fuchsia: { fg: "#e879f9", border: "rgba(232,121,249,0.3)", bg: "rgba(232,121,249,0.06)", glow: "rgba(232,121,249,0.35)" },
    rose:    { fg: "#fb7185", border: "rgba(251,113,133,0.3)", bg: "rgba(251,113,133,0.06)", glow: "rgba(251,113,133,0.35)" }
  };
  const p = palette[accent];
  return (
    <button
      type="button"
      onClick={onClick}
      className="group rounded-2xl border px-4 py-3 text-left transition"
      style={{
        borderColor: p.border,
        background: p.bg,
        boxShadow: primary ? `0 0 24px ${p.glow}` : undefined
      }}
    >
      <div className="text-xs uppercase tracking-[0.28em]" style={{ color: p.fg }}>
        {label}
      </div>
      <div className="mt-1 text-sm text-white/84">{children}</div>
    </button>
  );
}
