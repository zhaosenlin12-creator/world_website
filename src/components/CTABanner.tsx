"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { zh } from "@/i18n/zh";
import { Aurora } from "@/components/fx/Aurora";
import { GradientBlob } from "@/components/fx/GradientBlob";
import { TextSplitReveal } from "@/components/fx/TextSplitReveal";
import { MagneticButton } from "@/components/fx/MagneticButton";

export function CTABanner() {
  return (
    <section className="relative py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="relative rounded-3xl overflow-hidden border border-white/10 p-10 md:p-16 text-center"
        >
          <Aurora opacity={0.5} className="rounded-3xl" />
          <GradientBlob size={500} speed={32} className="-top-32 -left-32" opacity={0.5} colors={["#a855f7", "#ec4899"]} />
          <GradientBlob size={400} speed={40} className="-bottom-32 -right-32" opacity={0.4} colors={["#3b82f6", "#22d3ee"]} />
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-indigo-900/30 to-black/60" />
          <div className="relative z-10">
            <div className="eyebrow mb-4">走进银河</div>
            <h2 className="h-section text-white max-w-3xl mx-auto">
              <TextSplitReveal text="由你掌控的 3D 之旅" stagger={0.02} />
              <br />
              <span className="text-white/70 text-2xl md:text-3xl block mt-2">
                <TextSplitReveal text="—— 如 NASA\u2019s Eyes 般的体验，重新构想" stagger={0.015} />
              </span>
            </h2>
            <p className="mt-6 max-w-2xl mx-auto text-white/70">
              旋转镜头，点击任意世界，跟随探测任务。完整的交互式太阳系——只需一次点击。
            </p>
            <MagneticButton strength={0.4} className="inline-block mt-8">
              <Link href="/explore" className="btn-primary inline-flex text-base px-6 py-3">
                <span>打开 3D 探索</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14m0 0-6-6m6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
            </MagneticButton>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
