"use client";
import { zh } from "@/i18n/zh";
import { motion } from "framer-motion";
import { Aurora } from "@/components/fx/Aurora";
import { GradientBlob } from "@/components/fx/GradientBlob";
import { useMemo, useState } from "react";

const ICONS = [
  <svg key="0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h12a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4V4z"/><path d="M4 16a4 4 0 0 1 4-4h12"/></svg>,
  <svg key="1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3 3 8l9 5 9-5-9-5z"/><path d="m3 13 9 5 9-5"/><path d="m3 18 9 5 9-5"/></svg>,
  <svg key="2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>,
  <svg key="3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/></svg>,
  <svg key="4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="m9 12 2 2 4-4"/><path d="M12 2 4 6v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V6l-8-4z"/></svg>,
  <svg key="5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="6" width="14" height="12" rx="2"/><path d="m17 10 4-3v10l-4-3"/></svg>,
  <svg key="6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 8h18M8 3v18"/></svg>,
  <svg key="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M9 18h6"/></svg>,
  <svg key="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><ellipse cx="12" cy="12" rx="9" ry="4"/></svg>
];

const GRADIENTS = [
  "from-purple-500/35 to-pink-500/20",
  "from-cyan-500/35 to-blue-500/20",
  "from-amber-500/35 to-orange-500/20",
  "from-emerald-500/35 to-teal-500/20",
  "from-rose-500/35 to-fuchsia-500/20",
  "from-sky-500/35 to-indigo-500/20",
  "from-violet-500/35 to-purple-500/20",
  "from-lime-500/35 to-green-500/20",
  "from-orange-500/35 to-red-500/20"
];

const FILTERS = [
  { key: "all", label: "全部" },
  { key: "教学", label: "教学" },
  { key: "数据", label: "数据" },
  { key: "图像", label: "图像" },
  { key: "活动", label: "活动" },
  { key: "应用", label: "应用" }
];

export function ResourcesView() {
  const [filter, setFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    const cards = zh.resources.cards || [];
    if (filter === "all") return cards;
    return cards.filter((c: any) => c.tag.includes(filter));
  }, [filter]);

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <Aurora opacity={0.22} />
        <GradientBlob size={520} speed={32} className="-top-40 -left-40" opacity={0.15} colors={["#a855f7", "#ec4899", "#22d3ee"]} />
        <GradientBlob size={460} speed={28} className="-bottom-32 -right-32" opacity={0.12} colors={["#22d3ee", "#3b82f6", "#a855f7"]} />
      </div>
      <div className="pt-32 pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12"
          >
            <div className="eyebrow mb-3">{zh.resources.eyebrow}</div>
            <h1 className="h-section gradient-text">{zh.resources.title}</h1>
            <p className="mt-4 text-white/65 max-w-2xl mx-auto">{zh.resources.desc}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-2 mb-8"
          >
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3.5 py-1.5 rounded-full text-xs tracking-wider transition ${filter === f.key ? "bg-white/15 text-white" : "text-white/55 hover:text-white hover:bg-white/5"}`}
              >
                {f.label}
              </button>
            ))}
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((c: any, i: number) => (
              <motion.a
                key={c.url + i}
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4, delay: (i % 9) * 0.04 }}
                whileHover={{ y: -4 }}
                className="group block h-full rounded-2xl border border-white/10 bg-white/5 overflow-hidden transition-all duration-500 group-hover:border-white/30 group-hover:shadow-[0_0_40px_rgba(168,85,247,0.18)]"
              >
                <div className={`relative h-32 bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]}`}>
                  <div className="absolute inset-0 flex items-center justify-center text-white/85 group-hover:text-white transition">
                    <div className="w-14 h-14">{ICONS[i % ICONS.length]}</div>
                  </div>
                  <div className="absolute top-3 left-3 text-[10px] uppercase tracking-widest text-white/95 bg-black/45 backdrop-blur px-2 py-0.5 rounded-full">
                    {c.tag}
                  </div>
                </div>
                <div className="p-5">
                  <h2 className="font-display text-lg leading-snug text-white">{c.title}</h2>
                  <p className="text-sm text-white/65 mt-2 leading-relaxed">{c.desc}</p>
                  <div className="mt-4 inline-flex items-center gap-1 text-xs text-purple-300 group-hover:text-white transition">
                    <span>前往 NASA</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center text-white/50 py-12">该分类暂无资源</div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="mt-16 glass-strong rounded-3xl p-8 text-center"
          >
            <h2 className="font-display text-2xl mb-3 gradient-text inline-block">数据来源</h2>
            <p className="text-white/70 max-w-2xl mx-auto leading-relaxed">
              所有文本、图像和结构化数据均来自 NASA 开放科学文库。3D 太阳系数据——包括物理参数、轨道根数和大气的组成——源自 NASA 公开的事实清单。
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
