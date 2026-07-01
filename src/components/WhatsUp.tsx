"use client";
import { motion } from "framer-motion";
import { zh } from "@/i18n/zh";
import { GradientBlob } from "@/components/fx/GradientBlob";

export function WhatsUp() {
  return (
    <section className="relative py-24 px-6 overflow-hidden">
      <GradientBlob colors={["#a855f7", "#ec4899", "#3b82f6"]} size={500} speed={26} className="-top-32 left-1/2 -translate-x-1/2" opacity={0.3} />
      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="glass-strong rounded-3xl p-8 md:p-14 relative overflow-hidden"
        >
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-indigo-500/30 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-purple-500/30 blur-3xl" />
          <div className="relative z-10">
            <div className="eyebrow mb-3">{zh.whatsup.eyebrow}</div>
            <h2 className="h-section gradient-text">{zh.whatsup.title}</h2>
            <p className="mt-4 text-white/70 max-w-2xl">{zh.whatsup.desc}</p>
            <div className="mt-10 grid md:grid-cols-3 gap-4">
              {[
                { date: zh.whatsup.cards.tonight.date, title: zh.whatsup.cards.tonight.title, body: zh.whatsup.cards.tonight.body },
                { date: zh.whatsup.cards.july4.date, title: zh.whatsup.cards.july4.title, body: zh.whatsup.cards.july4.body },
                { date: zh.whatsup.cards.july21.date, title: zh.whatsup.cards.july21.title, body: zh.whatsup.cards.july21.body }
              ].map((c, i) => (
                <motion.div
                  key={c.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="glass rounded-2xl p-5"
                >
                  <div className="text-xs tracking-widest text-purple-300/80">{c.date}</div>
                  <div className="mt-2 font-display text-lg">{c.title}</div>
                  <p className="text-sm text-white/65 mt-2 leading-relaxed">{c.body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
