"use client";

import { motion } from "framer-motion";
import { LiquidGlassPanel } from "@/components/fx/LiquidGlassPanel";
import { quickFacts } from "@/data/nasaContent";

export function QuickFactsGrid() {
  return (
    <section className="px-6 pt-12 md:pt-16">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 text-center"
        >
          <div className="eyebrow mb-3">太阳系快速事实</div>
          <h2 className="h-section gradient-text">用数据快速认识宇宙尺度</h2>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {quickFacts.map((fact, i) => (
            <LiquidGlassPanel
              key={fact.label}
              tone={i % 2 === 0 ? "cyan" : "amber"}
              interactive
              delay={0.05 * i}
              className="h-full rounded-3xl"
            >
              <a href={fact.href} target="_blank" rel="noreferrer" className="flex h-full flex-col gap-3 p-6">
                <span className="font-display text-3xl text-white">{fact.value}</span>
                <span className="text-xs tracking-[0.28em] text-cyan-200/85">{fact.label}</span>
                <p className="text-sm leading-relaxed text-white/72">{fact.description}</p>
              </a>
            </LiquidGlassPanel>
          ))}
        </div>
      </div>
    </section>
  );
}

