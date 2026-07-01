"use client";
import { zh } from "@/i18n/zh";
import { motion } from "framer-motion";

interface Article { url: string; slug: string; title: string; description: string; hero: string | null; body: string[]; images: { src: string; alt: string }[] }

export function ResourcesView({ articles }: { articles: Article[] }) {
  return (
    <div className="pt-32 pb-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-center mb-10">
          <div className="eyebrow mb-3">{zh.resources.eyebrow}</div>
          <h1 className="h-section gradient-text">{zh.resources.title}</h1>
          <p className="mt-4 text-white/65 max-w-2xl mx-auto">{zh.resources.desc}</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map((a, i) => (
            <motion.article
              key={a.url}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: (i % 6) * 0.05 }}
              className="group"
            >
              <a href={a.url} target="_blank" rel="noopener noreferrer" className="block h-full rounded-2xl border border-white/10 bg-white/5 p-5 transition-all duration-500 group-hover:scale-[1.02] group-hover:border-white/30 group-hover:shadow-[0_0_40px_rgba(168,85,247,0.15)]">
                <div className="text-[10px] uppercase tracking-widest text-purple-300/80 mb-2">{(a.slug || "").split("/").slice(-2, -1).join("") || "资源"}</div>
                <h2 className="font-display text-lg leading-snug">{a.title}</h2>
                {a.description && <p className="text-sm text-white/65 mt-2 line-clamp-2">{a.description}</p>}
                <div className="mt-4 text-xs text-purple-300 group-hover:text-white transition">在 NASA.gov 上打开 →</div>
              </a>
            </motion.article>
          ))}
        </div>
        {articles.length === 0 && (
          <div className="text-center text-white/50 py-20">暂未加载到资源。请尝试运行爬虫。</div>
        )}
      </div>
    </div>
  );
}
