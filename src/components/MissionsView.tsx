"use client";
import { zh } from "@/i18n/zh";
import { motion } from "framer-motion";
import { BODIES } from "@/data/bodies";
import Link from "next/link";

interface Mission { name: string; agency: string; status: string; year: number; target: string; body: string; desc: string; color: string }

function nameOf(id: string) {
  const b = BODIES.find((x) => x.id === id);
  return b ? (b.nameZh || b.name) : "";
}

export function MissionsView({ missions }: { missions: Mission[] }) {
  const active = missions.filter((m) => m.status === "active");
  const ended = missions.filter((m) => m.status === "ended");
  const upcoming = missions.filter((m) => m.status === "upcoming");

  const sectionLabel = (s: string) => {
    if (s === "active") return { title: zh.missions.active, badge: zh.missions.live };
    if (s === "upcoming") return { title: zh.missions.upcoming, badge: zh.missions.future };
    return { title: zh.missions.ended, badge: zh.missions.past };
  };

  return (
    <div className="pt-32 pb-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-center mb-10">
          <div className="eyebrow mb-3">{zh.missions.eyebrow}</div>
          <h1 className="h-section gradient-text">{zh.missions.title}</h1>
          <p className="mt-4 text-white/65 max-w-2xl mx-auto">{zh.missions.desc}</p>
        </motion.div>

        <Section items={active} accent="from-emerald-600/30 to-green-600/30" status="active" />
        <Section items={upcoming} accent="from-amber-600/30 to-yellow-600/30" status="upcoming" />
        <Section items={ended} accent="from-purple-600/30 to-indigo-600/30" status="ended" />
      </div>
    </div>
  );
}

function Section({ items, accent, status }: { items: Mission[]; accent: string; status: string }) {
  const meta = status === "active" ? { title: zh.missions.active, badge: zh.missions.live } : status === "upcoming" ? { title: zh.missions.upcoming, badge: zh.missions.future } : { title: zh.missions.ended, badge: zh.missions.past };
  return (
    <section className="mb-12">
      <h2 className="font-display text-2xl mb-4 flex items-center gap-3">
        {meta.title}
        <span className="text-sm text-white/40 font-normal">({items.length})</span>
        <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/10">{meta.badge}</span>
      </h2>
      <div className="grid md:grid-cols-2 gap-4">
        {items.map((m, i) => {
          const body = BODIES.find((b) => b.id === m.body);
          return (
            <motion.div
              key={m.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: (i % 6) * 0.05 }}
              className={`relative rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br ${accent} p-5`}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full flex-shrink-0" style={{ background: `radial-gradient(circle at 30% 30%, ${m.color}, ${m.color}80 50%, #000)`, boxShadow: `0 0 20px ${m.color}80` }} />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h3 className="font-display text-lg leading-tight">{m.name}</h3>
                    <span className="text-[10px] uppercase tracking-widest text-white/50">{m.year}</span>
                  </div>
                  <div className="text-xs text-purple-300 mt-0.5">{m.agency} · {m.target}</div>
                  <p className="text-sm text-white/75 mt-3 leading-relaxed">{m.desc}</p>
                  {body && <Link href={`/planets/${body.id}`} className="inline-flex items-center gap-1 mt-3 text-xs text-purple-300 hover:text-white">打开 {nameOf(m.body)} →</Link>}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
