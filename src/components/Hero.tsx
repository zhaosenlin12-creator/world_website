"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";
import { zh } from "@/i18n/zh";
import { Aurora } from "@/components/fx/Aurora";
import { WarpField } from "@/components/fx/WarpField";
import { GradientBlob } from "@/components/fx/GradientBlob";
import { TextSplitReveal } from "@/components/fx/TextSplitReveal";
import { MagneticButton } from "@/components/fx/MagneticButton";
import { CountUp } from "@/components/fx/CountUp";

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const opacity = useTransform(scrollYProgress, [0, 0.6, 1], [1, 0.5, 0]);

  return (
    <section ref={ref} className="relative min-h-screen overflow-hidden flex items-center justify-center pt-24 pb-12 bg-[#05060f]">
      <WarpField speed={1.6} density={260} />
      <Aurora opacity={0.32} />
      <GradientBlob size={700} speed={28} className="-top-40 -left-40" opacity={0.28} colors={["#a855f7", "#ec4899", "#f59e0b", "#3b82f6"]} />
      <GradientBlob size={500} speed={36} className="-bottom-32 -right-32" opacity={0.22} colors={["#22d3ee", "#a855f7", "#ec4899"]} />

      <motion.div style={{ opacity, scale }} className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="eyebrow mb-6 inline-block"
        >
          <span className="relative">
            {zh.hero.eyebrow}
            <motion.span
              className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 2.2, duration: 1 }}
            />
          </span>
        </motion.div>

        <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.15] tracking-tight glow-text">
          <span className="block">
            <TextSplitReveal text={zh.hero.titleA} delay={1.5} stagger={0.025} />
          </span>
          <span className="block gradient-text">
            <TextSplitReveal text={zh.hero.titleB} delay={1.8} stagger={0.025} />
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.2, duration: 0.8 }}
          className="mt-8 max-w-2xl mx-auto text-lg md:text-xl text-white/70 leading-relaxed"
        >
          {zh.hero.desc}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.4, duration: 0.8 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <MagneticButton strength={0.4} className="inline-block">
            <Link href="/explore" className="btn-primary text-base px-6 py-3 inline-flex">
              <span>{zh.buttons.launch3d}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14m0 0-6-6m6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
          </MagneticButton>
          <MagneticButton strength={0.4} className="inline-block">
            <Link href="/planets" className="btn-ghost text-base px-6 py-3 inline-flex">
              {zh.buttons.browsePlanets}
            </Link>
          </MagneticButton>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.8, duration: 0.8 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
        >
          {[
            { to: 8, v: zh.hero.stats.planets },
            { to: 5, v: zh.hero.stats.dwarfs },
            { to: 290, suffix: "+", v: zh.hero.stats.moons },
            { to: 1.3, format: (n: number) => n.toFixed(1) + "M+", v: zh.hero.stats.asteroids }
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.9 + i * 0.1, duration: 0.6 }}
              whileHover={{ y: -4, scale: 1.04 }}
              className="glass px-4 py-3 cursor-default transition-shadow hover:shadow-[0_0_40px_rgba(168,85,247,0.3)]"
            >
              <div className="font-display text-2xl gradient-text">
                <CountUp to={s.to} duration={1.8} format={s.format} />
              </div>
              <div className="text-xs tracking-widest text-white/60">{s.v}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white/40 text-xs tracking-[0.4em] flex flex-col items-center gap-2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <span>向下滚动探索</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 13l5 5 5-5M7 7l5 5 5-5"/></svg>
      </motion.div>
    </section>
  );
}