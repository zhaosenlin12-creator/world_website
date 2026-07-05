"use client";

import { AnimatePresence, motion } from "framer-motion";

const HIGHLIGHTS = [
  {
    tag: "01",
    title: "飞船驾驶与航路规划",
    body: "驾驶飞船抵达 8 颗行星；通过引力区、轨道切入、大气层三段难度递进的航段。"
  },
  {
    tag: "02",
    title: "终端降落到地表",
    body: "穿过大气层后切换至 2D 平台视角，躲避陨石与脆弱平台，回收各行星的样本。"
  },
  {
    tag: "03",
    title: "科学答题点燃徽章",
    body: "每完成一次采样后进入知识检验，答对进入下一站，最终点亮「宇宙探索者」徽章。"
  }
];

const QUICK_KEYS = [
  { key: "WASD / 方向键", desc: "驾驶飞船" },
  { key: "鼠标拖动", desc: "调整视角" },
  { key: "Space", desc: "跳跃 / 互动" },
  { key: "ESC / P", desc: "随时暂停" }
];

type Props = {
  open: boolean;
  onStart: () => void;
  onBack: () => void;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
};

export default function PlayBriefingIntro({ open, onStart, onBack, voiceEnabled, onToggleVoice }: Props) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 z-40 flex items-center justify-center bg-black/58 px-4 backdrop-blur-md"
        >
          <motion.div
            initial={{ y: 30, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 18, opacity: 0 }}
            transition={{ type: "spring", damping: 22, stiffness: 220 }}
            className="console-panel cyan relative w-full max-w-5xl overflow-hidden p-7 md:p-9"
          >
            <div className="absolute inset-0 console-grid opacity-50" aria-hidden />

            <div className="relative grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.38em] text-cyan-200/85">
                  <span>任务启动序列</span>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-white/55">SOL MISSION</span>
                  <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-amber-100/90">操作员：在线</span>
                </div>
                <h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-white md:text-5xl text-shimmer">
                  驾驶飞船 · 逐站点亮<br />八大行星
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-7 text-white/72">
                  从被太阳炙烤的水星，到狂风呼啸的海王星——这条路将由你亲手规划。每颗行星都有独特的危险与样本，采集完成后将进入知识检验，回答正确的题目让整条航线逐步点亮。
                </p>

                <div className="mt-6 grid gap-3">
                  {HIGHLIGHTS.map((h) => (
                    <motion.div
                      key={h.tag}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * Number(h.tag) }}
                      className="flex gap-4 rounded-2xl border border-white/10 bg-white/4 p-4"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-300/30 bg-cyan-400/10 font-mono text-sm text-cyan-200">
                        {h.tag}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{h.title}</div>
                        <p className="mt-1 text-xs leading-6 text-white/65">{h.body}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="console-panel fuchsia p-5">
                  <div className="console-eyebrow text-fuchsia-200/85">任务代号</div>
                  <div className="mt-2 font-mono text-2xl text-white">HELIOS // 8 PLANETS</div>
                  <p className="mt-2 text-xs leading-6 text-white/62">
                    这是你今天唯一的任务。所有遥测数据会写入本地存储，关闭页面再回来可以接着上次的目标继续。
                  </p>
                  <div className="console-divider my-3" />
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <Stat label="航段" value="5" />
                    <Stat label="行星" value="8" />
                    <Stat label="样本" value="24" />
                  </div>
                </div>

                <div className="console-panel amber p-5">
                  <div className="console-eyebrow text-amber-200/85">操作员快速参考</div>
                  <ul className="mt-2 space-y-2 text-xs text-white/72">
                    {QUICK_KEYS.map((k) => (
                      <li key={k.key} className="flex items-center justify-between gap-3 rounded-xl bg-white/4 px-3 py-2">
                        <span className="font-mono text-cyan-200">{k.key}</span>
                        <span className="text-white/72">{k.desc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={onToggleVoice}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-xs text-white/82 transition hover:bg-white/10"
                  >
                    <div className="uppercase tracking-[0.28em] text-fuchsia-200/85">语音</div>
                    <div className="mt-1 text-sm text-white">{voiceEnabled ? "已开启" : "已关闭"}</div>
                  </button>
                  <button
                    type="button"
                    onClick={onBack}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-xs text-white/82 transition hover:bg-white/10"
                  >
                    <div className="uppercase tracking-[0.28em] text-rose-200/85">返回</div>
                    <div className="mt-1 text-sm text-white">回到主控制台</div>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={onStart}
                  className="group relative mt-1 overflow-hidden rounded-2xl px-6 py-4 text-base font-medium text-slate-950 transition hover:scale-[1.01]"
                  style={{
                    background: "linear-gradient(135deg, #22d3ee 0%, #a855f7 55%, #f0abfc 100%)",
                    boxShadow: "0 0 36px rgba(34,211,238,0.45)"
                  }}
                >
                  <span className="relative z-10">启动发射 · 进入太阳系</span>
                  <motion.span
                    aria-hidden
                    className="absolute inset-0 bg-white/30"
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                  />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-center">
      <div className="text-[10px] uppercase tracking-[0.28em] text-white/45">{label}</div>
      <div className="mt-1 font-mono text-base text-cyan-200">{value}</div>
    </div>
  );
}
