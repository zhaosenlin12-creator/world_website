"use client";
import { zh } from "@/i18n/zh";
import { motion } from "framer-motion";
import Link from "next/link";
import { Aurora } from "@/components/fx/Aurora";
import { GradientBlob } from "@/components/fx/GradientBlob";
import { MagneticButton } from "@/components/fx/MagneticButton";

function Icon({ name }: { name: string }) {
  const s = "w-7 h-7";
  const common = { fill: "none" as const, stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "globe":
      return <svg viewBox="0 0 24 24" className={s} {...common}><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><ellipse cx="12" cy="12" rx="9" ry="4"/></svg>;
    case "cube":
      return <svg viewBox="0 0 24 24" className={s} {...common}><path d="M12 3 3 8l9 5 9-5-9-5z"/><path d="m3 13 9 5 9-5"/><path d="m3 18 9 5 9-5"/></svg>;
    case "sparkle":
      return <svg viewBox="0 0 24 24" className={s} {...common}><path d="M12 2v6m0 8v6M2 12h6m8 0h6M5 5l4 4m6 6 4 4M5 19l4-4m6-6 4-4"/></svg>;
    case "book":
      return <svg viewBox="0 0 24 24" className={s} {...common}><path d="M4 4h12a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4V4z"/><path d="M4 16a4 4 0 0 1 4-4h12"/></svg>;
    case "responsive":
      return <svg viewBox="0 0 24 24" className={s} {...common}><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg>;
    case "speed":
      return <svg viewBox="0 0 24 24" className={s} {...common}><path d="M12 22a10 10 0 1 0-10-10"/><path d="M12 12 16 8"/><circle cx="12" cy="12" r="1.5"/></svg>;
    default:
      return null;
  }
}

export function AboutView() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <Aurora opacity={0.25} />
        <GradientBlob size={520} speed={32} className="-top-40 -left-40" opacity={0.18} colors={["#a855f7", "#ec4899", "#22d3ee"]} />
        <GradientBlob size={460} speed={28} className="-bottom-32 -right-32" opacity={0.15} colors={["#22d3ee", "#3b82f6", "#a855f7"]} />
      </div>
      <div className="pt-32 pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <div className="eyebrow mb-3">{zh.about.eyebrow}</div>
            <h1 className="h-section gradient-text mb-4">{zh.about.title}</h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">{zh.about.subtitle}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="glass-strong rounded-3xl p-8 md:p-12 mb-20"
          >
            <p className="text-lg text-white/85 leading-relaxed max-w-3xl mx-auto text-center">
              {zh.about.intro}
            </p>
          </motion.div>

          <section className="mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              className="text-center mb-8"
            >
              <div className="eyebrow mb-2">使命</div>
              <h2 className="font-display text-3xl md:text-4xl gradient-text inline-block">{zh.about.missionTitle}</h2>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="text-lg text-white/75 leading-relaxed text-center max-w-3xl mx-auto"
            >
              {zh.about.mission}
            </motion.p>
          </section>

          <section className="mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              className="text-center mb-10"
            >
              <div className="eyebrow mb-2">为什么</div>
              <h2 className="font-display text-3xl md:text-4xl gradient-text inline-block">{zh.about.featuresTitle}</h2>
            </motion.div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {zh.about.features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.4, delay: (i % 6) * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="glass rounded-2xl p-6 transition-all duration-500 hover:border-white/30 hover:shadow-[0_0_40px_rgba(168,85,247,0.15)]"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/30 to-cyan-500/20 flex items-center justify-center text-purple-200 mb-4">
                    <Icon name={f.icon} />
                  </div>
                  <h3 className="font-display text-lg text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-white/65 leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </section>

          <section className="grid md:grid-cols-2 gap-6 mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5 }}
              className="glass-strong rounded-3xl p-8"
            >
              <div className="eyebrow mb-3">原则</div>
              <h3 className="font-display text-2xl gradient-text mb-6 inline-block">{zh.about.principlesTitle}</h3>
              <ul className="space-y-3">
                {zh.about.principles.map((p, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="flex items-start gap-3"
                  >
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-400 to-cyan-300 flex-shrink-0" />
                    <div>
                      <div className="text-white font-medium text-sm">{p.k}</div>
                      <div className="text-white/55 text-sm leading-relaxed">{p.v}</div>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="glass-strong rounded-3xl p-8"
            >
              <div className="eyebrow mb-3">技术</div>
              <h3 className="font-display text-2xl gradient-text mb-6 inline-block">{zh.about.stackTitle}</h3>
              <dl className="space-y-3">
                {zh.about.stack.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="flex items-baseline gap-3"
                  >
                    <dt className="text-white/55 text-sm w-20 flex-shrink-0">{s.k}</dt>
                    <dd className="text-white text-sm flex-1">{s.v}</dd>
                  </motion.div>
                ))}
              </dl>
            </motion.div>
          </section>

          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
            className="text-center glass-strong rounded-3xl p-10 md:p-14 mb-20"
          >
            <h2 className="font-display text-3xl md:text-4xl gradient-text inline-block mb-4">准备好了吗？</h2>
            <p className="text-white/70 mb-8 max-w-xl mx-auto">
              点击下方按钮，立即进入 3D 太阳系，亲手转动、点击、探索每一颗行星。
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <MagneticButton strength={0.4} className="inline-block">
                <Link href="/explore" className="btn-primary text-base px-6 py-3 inline-flex">
                  <span>启动 3D 体验</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14m0 0-6-6m6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </Link>
              </MagneticButton>
              <MagneticButton strength={0.4} className="inline-block">
                <Link href="/planets" className="btn-ghost text-base px-6 py-3 inline-flex">
                  浏览行星
                </Link>
              </MagneticButton>
            </div>
          </motion.section>

          <section className="mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              className="text-center mb-6"
            >
              <div className="eyebrow mb-2">来源</div>
              <h2 className="font-display text-2xl md:text-3xl gradient-text inline-block">{zh.about.dataTitle}</h2>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              className="text-white/70 text-center max-w-3xl mx-auto leading-relaxed"
            >
              {zh.about.data}
            </motion.p>
          </section>

          <section className="text-center text-white/50 text-sm">
            <p>{zh.about.creditsText}</p>
          </section>
        </div>
      </div>
    </div>
  );
}