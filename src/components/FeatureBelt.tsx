"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { zh } from "@/i18n/zh";
import { GradientBlob } from "@/components/fx/GradientBlob";

const features = [
  { title: zh.feature.feat1.title, desc: zh.feature.feat1.desc, cta: { label: zh.buttons.explore, href: "/explore" }, accent: "from-purple-600/30 to-indigo-600/30", visual: "orbit" },
  { title: zh.feature.feat2.title, desc: zh.feature.feat2.desc, cta: { label: zh.buttons.read, href: "/stories" }, accent: "from-pink-600/30 to-rose-600/30", visual: "news" },
  { title: zh.feature.feat3.title, desc: zh.feature.feat3.desc, cta: { label: zh.buttons.discover, href: "/planets?outer=1" }, accent: "from-cyan-600/30 to-blue-600/30", visual: "deep" }
];

function Visual({ kind }: { kind: string }) {
  if (kind === "orbit") {
    return (
      <div className="absolute inset-0 flex items-center justify-center opacity-90">
        <div className="relative w-64 h-64">
          {[60, 100, 140, 180].map((d, i) => (
            <div key={i} className="absolute inset-0 m-auto rounded-full border border-white/10" style={{ width: d * 2, height: d * 2, top: `calc(50% - ${d}px)`, left: `calc(50% - ${d}px)` }} />
          ))}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 shadow-[0_0_40px_rgba(251,191,36,0.6)]" />
          <div className="absolute top-[30px] left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-blue-400 shadow-[0_0_20px_rgba(96,165,250,0.8)] animate-float" />
          <div className="absolute bottom-[20px] right-[40px] w-4 h-4 rounded-full bg-amber-600 shadow-[0_0_20px_rgba(217,119,6,0.6)]" />
          <div className="absolute top-[80px] right-[20px] w-5 h-5 rounded-full bg-yellow-300 shadow-[0_0_20px_rgba(253,224,71,0.6)]" />
        </div>
      </div>
    );
  }
  if (kind === "news") {
    return (
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-purple-900/0" />
        {Array.from({ length: 18 }).map((_, i) => (
          <span
            key={i}
            className="absolute w-1 h-1 rounded-full bg-white animate-twinkle"
            style={{ top: `${(i * 47) % 100}%`, left: `${(i * 73) % 100}%`, animationDelay: `${(i * 0.3) % 4}s` }}
          />
        ))}
      </div>
    );
  }
  if (kind === "deep") {
    return (
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-900/0" />
        <div className="absolute inset-0">
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-[linear-gradient(to_top,#0c4a6e_0%,transparent_100%)]" />
        </div>
      </div>
    );
  }
  return null;
}

export function FeatureBelt() {
  return (
    <section className="relative py-24 px-6 overflow-hidden">
      <GradientBlob colors={["#a855f7", "#3b82f6", "#ec4899"]} size={500} speed={28} className="-top-32 -left-32" opacity={0.35} />
      <GradientBlob colors={["#f59e0b", "#ec4899", "#a855f7"]} size={400} speed={36} className="-bottom-32 -right-32" opacity={0.3} />
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group relative"
            >
              <div className={`relative h-96 rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br ${f.accent} p-6 flex flex-col justify-between transition-all duration-500 group-hover:scale-[1.02] group-hover:border-white/30`}>
                <Visual kind={f.visual} />
                <div className="relative z-10">
                  <div className="eyebrow mb-2">特色</div>
                  <div className="font-display text-2xl" dangerouslySetInnerHTML={{ __html: f.title }} />
                </div>
                <div className="relative z-10">
                  <p className="text-sm text-white/70 leading-relaxed" dangerouslySetInnerHTML={{ __html: f.desc }} />
                  <Link href={f.cta.href} className="mt-4 inline-flex items-center gap-2 text-sm text-purple-300 group-hover:text-white transition">
                    <span>{f.cta.label}</span>
                    <svg className="group-hover:translate-x-1 transition-transform" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14m0 0-6-6m6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
