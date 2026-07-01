"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { BODIES, SolarBody } from "@/data/bodies";
import { zh } from "@/i18n/zh";
import { GradientBlob } from "@/components/fx/GradientBlob";

function kindLabel(k: string) {
  if (k === "star") return zh.type.star;
  if (k === "planet") return zh.type.planet;
  if (k === "dwarf") return zh.type.dwarf;
  if (k === "moon") return zh.type.moon;
  if (k === "belt") return zh.type.belt;
  return k;
}

function planetName(p: SolarBody): string {
  return (p as any).nameZh || p.name;
}

export function PlanetGrid() {
  const planets = BODIES.filter((b) => b.kind === "planet");
  return (
    <section className="relative py-32 px-6">
      <GradientBlob colors={["#3b82f6", "#a855f7", "#06b6d4"]} size={550} speed={32} className="-top-40 right-0" opacity={0.3} />
      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="eyebrow mb-3">{zh.planetsSection.eyebrow}</div>
          <h2 className="h-section gradient-text">{zh.planetsSection.title}</h2>
          <p className="mt-4 text-white/60 max-w-2xl mx-auto">{zh.planetsSection.desc}</p>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {planets.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
            >
              <Link href={`/planets/${p.id}`} className="group block relative">
                <div className="relative h-72 rounded-3xl overflow-hidden glass p-6 flex flex-col justify-between transition-all duration-500 group-hover:scale-[1.02] group-hover:border-white/30 group-hover:shadow-[0_0_50px_rgba(168,85,247,0.2)]">
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-black/30 to-black/0 z-10" />
                    <div
                      className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-2xl opacity-50 group-hover:opacity-80 transition-opacity"
                      style={{ background: `radial-gradient(circle, ${p.color}, transparent 70%)` }}
                    />
                    <div
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full shadow-2xl"
                      style={{
                        background: `radial-gradient(circle at 30% 30%, ${p.color}, ${p.color}80 40%, ${p.color}20 80%, transparent 100%)`,
                        boxShadow: `0 0 60px ${p.color}60, inset -10px -10px 30px rgba(0,0,0,0.5)`
                      }}
                    />
                    {p.hasRings && (
                      <div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-12 rounded-full rotate-12"
                        style={{ background: `linear-gradient(90deg, transparent, ${p.ringColor || "#fde68a"} 30%, ${p.ringColor || "#fde68a"} 70%, transparent)`, opacity: 0.7 }}
                      />
                    )}
                  </div>
                  <div className="relative z-20">
                    <div className="text-3xl">{p.emoji}</div>
                  </div>
                  <div className="relative z-20">
                    <div className="text-xs tracking-widest text-white/50">第 {p.order} 颗行星</div>
                    <div className="font-display text-2xl mt-1">{planetName(p)}</div>
                    <p className="text-sm text-white/60 mt-2 line-clamp-2">{(p as any).taglineZh || p.tagline}</p>
                    <div className="mt-3 flex items-center gap-2 text-xs text-purple-300 group-hover:text-white transition">
                      <span>{zh.buttons.explore}</span>
                      <svg className="group-hover:translate-x-1 transition-transform" width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 12h14m0 0-6-6m6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
