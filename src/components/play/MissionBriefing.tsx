"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { MissionDefinition } from "@/lib/play/missionData";

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

export default function MissionBriefing({
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
            className="w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(5,10,24,0.96),rgba(16,23,42,0.92))] shadow-[0_30px_120px_rgba(2,6,23,0.62)]"
          >
            <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="relative overflow-hidden p-7 md:p-9">
                <div
                  className="pointer-events-none absolute inset-0 opacity-70"
                  style={{
                    background: `radial-gradient(circle at 20% 20%, ${accent}22, transparent 42%), radial-gradient(circle at 85% 18%, ${accent}14, transparent 32%), linear-gradient(180deg, transparent, rgba(2,6,23,0.35))`,
                  }}
                />
                <div className="relative">
                  <div className="mb-3 flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.38em] text-cyan-300/80">
                    <span>任务简报</span>
                    <span className="rounded-full border border-white/10 px-3 py-1 text-white/55">{mission.codename}</span>
                    <span className="rounded-full border border-white/10 px-3 py-1 text-white/55">{progressText}</span>
                  </div>
                  <h2 className="font-display text-3xl font-semibold text-white md:text-4xl">{mission.title}</h2>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-white/65">
                    <span>{planetName}</span>
                    <span className="text-white/25">·</span>
                    <span>{planetDistance} AU</span>
                    <span className="text-white/25">·</span>
                    <span>{mission.reward}</span>
                  </div>

                  <p className="mt-5 max-w-2xl text-sm leading-7 text-white/78">{mission.briefing}</p>

                  <div className="mt-7 grid gap-4 md:grid-cols-3">
                    <Card title="飞行目标" desc={mission.flightGoal} accent={accent} />
                    <Card title="降落目标" desc={mission.landingGoal} accent={accent} />
                    <Card title="地表目标" desc={mission.surfaceGoal} accent={accent} />
                  </div>

                  <div className="mt-7 grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                      <div className="text-xs uppercase tracking-[0.3em] text-amber-300/80">任务摘要</div>
                      <p className="mt-3 text-sm leading-7 text-white/76">{mission.summary}</p>
                      <div className="mt-5 flex flex-wrap gap-2">
                        {mission.highlights.map((item) => (
                          <span key={item} className="rounded-full border border-white/10 bg-black/18 px-3 py-1 text-xs text-white/70">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                      <div className="text-xs uppercase tracking-[0.3em] text-rose-300/80">预计风险</div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {mission.hazards.map((item) => (
                          <span key={item} className="rounded-full border border-rose-300/20 bg-rose-500/10 px-3 py-1 text-xs text-rose-100/82">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-l border-white/10 bg-black/18 p-7 md:p-9">
                <div className="rounded-[28px] border border-white/10 bg-black/22 p-5">
                  <div className="text-xs uppercase tracking-[0.35em] text-fuchsia-300/80">启航前确认</div>
                  <div className="mt-4 space-y-4 text-sm leading-7 text-white/74">
                    <p>1. 点击“启动任务”后，先进入 3D 接近与飞行挑战。</p>
                    <p>2. 通过陨石缓降后，会切入地表探索，不再直接答题。</p>
                    <p>3. 地表样本回收完成后，才会开启最后的知识考验。</p>
                  </div>
                </div>

                <div className="mt-5 rounded-[28px] border border-white/10 bg-black/22 p-5">
                  <div className="text-xs uppercase tracking-[0.35em] text-cyan-300/80">本次奖励</div>
                  <div className="mt-3 text-2xl font-semibold text-white">{mission.reward}</div>
                  <p className="mt-2 text-sm leading-7 text-white/68">完成完整流程后，将在航路图中永久点亮该行星进度。</p>
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
                    启动任务
                  </button>
                  <button
                    type="button"
                    onClick={onBack}
                    className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm text-white/82 transition hover:bg-white/10"
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

function Card({ title, desc, accent }: { title: string; desc: string; accent: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: accent, boxShadow: `0 0 12px ${accent}` }} />
        <div className="text-xs uppercase tracking-[0.3em] text-white/58">{title}</div>
      </div>
      <p className="text-sm leading-7 text-white/74">{desc}</p>
    </div>
  );
}
