"use client";
import { zh } from "@/i18n/zh";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";

interface Article { url: string; slug: string; title: string; description: string; hero: string | null; body: string[]; images: { src: string; alt: string }[] }

export function StoriesIndex({ initial }: { initial: Article[] }) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    if (!ql) return initial;
    return initial.filter((a) => (a.title + " " + a.description + " " + a.body.join(" ")).toLowerCase().includes(ql));
  }, [q, initial]);

  return (
    <div className="pt-32 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-center mb-10">
          <div className="eyebrow mb-3">{zh.stories.eyebrow}</div>
          <h1 className="h-section gradient-text">{zh.stories.title}</h1>
          <p className="mt-4 text-white/65 max-w-2xl mx-auto">{zh.stories.desc}</p>
        </motion.div>
        <div className="max-w-xl mx-auto mb-8">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={zh.stories.searchPlaceholder}
            className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
          />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((a, i) => (
            <motion.article
              key={a.url}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: (i % 6) * 0.05 }}
              className="group"
            >
              <a href={a.url} target="_blank" rel="noopener noreferrer" className="block relative h-full rounded-2xl overflow-hidden border border-white/10 bg-black/30 backdrop-blur-sm transition-all duration-500 group-hover:scale-[1.02] group-hover:border-white/30 group-hover:shadow-[0_0_40px_rgba(168,85,247,0.2)]">
                <div className="aspect-[16/10] relative overflow-hidden bg-gradient-to-br from-indigo-900/40 to-purple-900/30">
                  {a.hero ? (
                    <img src={a.hero} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full bg-stars" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                </div>
                <div className="p-5">
                  <div className="text-[10px] uppercase tracking-widest text-purple-300/80 mb-2">{(a.slug || "").split("/")[0] || "精选"}</div>
                  <h2 className="font-display text-lg leading-snug">{a.title}</h2>
                  <p className="text-sm text-white/65 mt-2 line-clamp-3">{a.description || (a.body[0] || "").slice(0, 200)}</p>
                  <div className="mt-4 text-xs text-purple-300 group-hover:text-white transition">在 NASA.gov 上阅读 →</div>
                </div>
              </a>
            </motion.article>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center text-white/50 py-20">未找到匹配 “{q}” 的故事。</div>
        )}
      </div>
    </div>
  );
}
