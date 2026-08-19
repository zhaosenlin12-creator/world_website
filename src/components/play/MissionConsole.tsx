"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { MissionDefinition } from "@/lib/play/missionData";

const MISSION_TYPE_LABEL: Record<string, string> = {
  thermalSurvey: "热区测绘采样",
  atmosphericDrill: "大气钻探侦测",
  orbitalScan: "轨道环扫",
  dustCrossing: "尘暴穿越",
  gravitySlingshot: "引力借力机动",
  ringTraversal: "环带穿梭",
  rollLanding: "侧风滚降着陆",
  windRun: "高速风场突进",
};

const STAGES = [
  { id: "APPROACH", title: "飞行接近", desc: "在 3D 宇宙中驾驶飞船，绕开碎石、乱流与能量扰动。" },
  { id: "DESCENT", title: "大气穿越", desc: "切入目标行星近空区域，完成减速与姿态修正。" },
  { id: "SURFACE", title: "地表采样", desc: "执行地表探索与样本回收，保持设备与生命值稳定。" },
  { id: "QUIZ", title: "知识校验", desc: "完成该行星科学问答，解锁正式采样记录与节点高亮。" },
];

const CHECKLIST = [
  { id: "shield", label: "护盾校准完成" },
  { id: "voice", label: "语音播报在线" },
  { id: "camera", label: "镜头锁定正常" },
  { id: "telemetry", label: "遥测链路稳定" },
  { id: "escape", label: "紧急返航可用" },
];

type Props = {
  open: boolean;
  planetName: string;
  planetDistance: number;
  accent: string;
  mission: MissionDefinition | null;
  progressText: string;
  onStart: () => void;
  onBack: () => void;
};

export default function MissionConsole({
  open,
  planetName,
  planetDistance,
  accent,
  mission,
  progressText,
  onStart,
  onBack,
}: Props) {
  if (!mission) return null;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-40 flex items-center justify-center bg-black/55 px-4 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ type: "spring", damping: 22, stiffness: 220 }}
            className="console-panel cyan relative w-full max-w-5xl overflow-hidden"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background: `radial-gradient(circle at 18% 18%, ${accent}22, transparent 45%), radial-gradient(circle at 86% 12%, ${accent}14, transparent 35%), linear-gradient(180deg, transparent, rgba(2,6,23,0.35))`,
              }}
            />
            <div aria-hidden className="absolute inset-0 console-grid opacity-40" />

            <div className="relative grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="p-7 md:p-9">
                <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.38em] text-cyan-200/85">
                  <span>任务简报</span>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-white/55">{mission.codename}</span>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-white/55">{progressText}</span>
                  <span className="rounded-full px-3 py-1" style={{ borderColor: `${accent}66`, borderWidth: 1, color: accent }}>
                    {planetName}
                  </span>
                </div>
                <h2 className="mt-3 font-display text-3xl font-semibold text-white md:text-4xl text-shimmer">
                  {mission.title}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/78">{mission.briefing}</p>

                <div className="console-divider my-6" />

                <div className="grid gap-3 md:grid-cols-3">
                  <GoalCard title="飞行目标" desc={mission.flightGoal} accent={accent} />
                  <GoalCard title="着陆目标" desc={mission.landingGoal} accent={accent} />
                  <GoalCard title="地表目标" desc={mission.surfaceGoal} accent={accent} />
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                    <div className="console-eyebrow text-amber-200/85">任务概览</div>
                    <p className="mt-3 text-sm leading-7 text-white/76">{mission.summary}</p>
                    {mission.environment ? (
                      <div
                        className="mt-4 rounded-2xl border px-4 py-3 text-xs"
                        style={{
                          borderColor: `${mission.environment.atmosphereColor || accent}66`,
                          background: `${mission.environment.atmosphereColor || accent}10`,
                        }}
                      >
                        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.28em] text-white/55">
                          <span>{MISSION_TYPE_LABEL[mission.environment.missionType]}</span>
                          <span className="font-mono text-cyan-200">{Math.round(mission.environment.fogDensity * 100)}% 雾密度</span>
                        </div>
                        <div className="mt-2 text-sm leading-6 text-white/82">{mission.environment.hint}</div>
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] text-white/55">
                          <span className="rounded-full border border-emerald-300/30 bg-emerald-500/10 px-2 py-0.5 text-emerald-200">
                            主样本 · {mission.environment.primarySample}
                          </span>
                          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5">重力 ×{mission.environment.gravity.toFixed(2)}</span>
                          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5">风速 {mission.environment.wind.toFixed(2)}</span>
                          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5">危速 ×{mission.environment.hazardSpeed.toFixed(2)}</span>
                        </div>
                      </div>
                    ) : null}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {mission.highlights.map((item) => (
                        <span key={item} className="rounded-full border border-white/10 bg-black/18 px-3 py-1 text-xs text-white/72">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-rose-300/15 bg-rose-500/5 p-5">
                    <div className="console-eyebrow text-rose-200/85">预测风险</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {mission.hazards.map((item) => (
                        <span key={item} className="rounded-full border border-rose-300/20 bg-rose-500/10 px-3 py-1 text-xs text-rose-100/82">
                          {item}
                        </span>
                      ))}
                    </div>
                    <div className="console-divider my-4" />
                    <div className="text-[11px] text-white/55">
                      若出现预测外危害，主视图会自动触发减速处理，并临时增强镜头锁定来帮助你修正航向。
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-l border-white/10 bg-black/22 p-7 md:p-9">
                <div>
                  <div className="console-eyebrow text-fuchsia-200/85">航段链路</div>
                  <div className="console-divider my-3" />
                  <ol className="relative space-y-3 pl-4">
                    <span aria-hidden className="absolute bottom-1 left-1 top-1 w-px bg-gradient-to-b from-cyan-300/40 via-fuchsia-300/40 to-transparent" />
                    {STAGES.map((stage, idx) => (
                      <li key={stage.id} className="relative">
                        <span className="absolute -left-3 top-1.5 h-2 w-2 rounded-full bg-cyan-300 orbit-pulse" />
                        <div className="flex items-baseline gap-2">
                          <span className="font-mono text-[11px] text-white/40">0{idx + 1}</span>
                          <span className="text-sm font-medium text-white">{stage.title}</span>
                        </div>
                        <p className="ml-6 text-[11px] leading-5 text-white/55">{stage.desc}</p>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="mt-6 rounded-[24px] border border-white/10 bg-black/22 p-5">
                  <div className="console-eyebrow text-cyan-200/85">舰船预飞检查</div>
                  <ul className="mt-3 space-y-2">
                    {CHECKLIST.map((item) => (
                      <li key={item.id} className="flex items-center gap-2 text-xs text-white/72">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-emerald-300/40 bg-emerald-500/10 text-emerald-300">
                          ✓
                        </span>
                        <span>{item.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 rounded-[24px] border p-5" style={{ borderColor: `${accent}55` }}>
                  <div className="console-eyebrow text-amber-200/85">本次奖励</div>
                  <div className="mt-2 text-2xl font-semibold text-white">{mission.reward}</div>
                  <p className="mt-2 text-xs leading-6 text-white/65">
                    完成完整流程后，该行星节点会在航路图中永久高亮，并同步解锁专属样本记录与知识说明。
                  </p>
                </div>

                <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/65">
                  当前目标距离太阳约 {planetDistance} AU，建议先阅读风险说明，再启动任务。
                </div>

                <div className="mt-7 flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={onStart}
                    className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-medium text-slate-950 transition hover:scale-[1.01]"
                    style={{
                      background: `linear-gradient(135deg, ${accent}, #ffffff)`,
                      boxShadow: `0 0 32px ${accent}55`,
                    }}
                  >
                    启动本次任务
                  </button>
                  <button
                    type="button"
                    onClick={onBack}
                    className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm text-white/84 transition hover:bg-white/10"
                  >
                    返回太阳系
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function GoalCard({ title, desc, accent }: { title: string; desc: string; accent: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/4 p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: accent, boxShadow: `0 0 12px ${accent}` }} />
        <div className="console-eyebrow text-white/58">{title}</div>
      </div>
      <p className="text-sm leading-6 text-white/74">{desc}</p>
    </div>
  );
}
