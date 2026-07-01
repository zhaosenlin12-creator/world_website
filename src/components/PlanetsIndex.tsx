"use client";
import { zh } from "@/i18n/zh";
import { motion } from "framer-motion";
import Link from "next/link";
import { BODIES, BELT, KUIPER, OORT, SUN, PLANET_LIST, DWARF_LIST } from "@/data/bodies";

function nameOf(b) {
  return b.nameZh || b.name;
}

export function PlanetsIndex() {
  return (
    <div className="pt-32 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <div className="eyebrow mb-3">{zh.planetsIndex.eyebrow}</div>
          <h1 className="h-section gradient-text">{zh.planetsIndex.title}</h1>
          <p className="mt-4 text-white/65 max-w-2xl mx-auto">
            {zh.planetsIndex.desc}
          </p>
        </motion.div>

        <Section title={zh.planetsIndex.sections.planets} items={PLANET_LIST} />
        <Section title={zh.planetsIndex.sections.dwarfs} items={DWARF_LIST} />
        <Section title={zh.planetsIndex.sections.regions} items={[BELT, KUIPER, OORT]} />
      </div>
    </div>
  );
}

function Section({ title, items }: { title: string; items: any[] }) {
  return (
    <section className="mb-16">
      <motion.h2
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="font-display text-2xl mb-6"
      >
        {title}
        <span className="ml-3 text-sm text-white/40 font-normal">({items.length})</span>
      </motion.h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map((b, i) => (
          <motion.div
            key={b.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
          >
            <Link href={b.kind === "belt" ? `/facts#${b.id}` : `/planets/${b.id}`} className="group block">
              <div className="relative h-64 rounded-2xl overflow-hidden glass p-5 flex flex-col justify-between transition-all duration-500 group-hover:scale-[1.02] group-hover:border-white/30 group-hover:shadow-[0_0_40px_rgba(168,85,247,0.2)]">
                <div
                  className="absolute -top-12 -right-12 w-44 h-44 rounded-full blur-2xl opacity-50 group-hover:opacity-80 transition-opacity"
                  style={{ background: `radial-gradient(circle, ${b.color}, transparent 70%)` }}
                />
                <div className="relative z-10 flex items-center gap-3">
                  <div
                    className="w-14 h-14 rounded-full flex-shrink-0"
                    style={{ background: `radial-gradient(circle at 30% 30%, ${b.color}, ${b.color}80 50%, #000)`, boxShadow: `0 0 24px ${b.color}80` }}
                  />
                  <div>
                    <div className="font-display text-lg leading-tight">{nameOf(b)}</div>
                    <div className="text-xs text-white/50 uppercase tracking-widest">{b.kind === "belt" ? "区域" : b.kind === "dwarf" ? "矮行星" : b.kind === "star" ? "恒星" : "行星"}</div>
                  </div>
                </div>
                <div className="relative z-10">
                  <div className="text-xs text-white/50">{b.orbitAu > 0 ? `距日 ${b.orbitAu} AU` : "系统中心"}</div>
                  <p className="text-sm text-white/70 mt-1 line-clamp-2">{b.taglineZh || b.tagline}</p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
