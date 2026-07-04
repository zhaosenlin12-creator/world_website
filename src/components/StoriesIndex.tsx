"use client";
import { zh } from "@/i18n/zh";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";

interface Article {
  url: string;
  slug: string;
  title: string;
  description: string;
  hero: string | null;
  body: string[];
  images: { src: string; alt: string }[];
  accent?: string;
  tag?: string;
}

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
          {filtered.map((a, i) => {
            const accent = a.accent || "#a855f7";
            return (
              <motion.article
                key={a.url}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: Math.min(i, 12) * 0.04 }}
                className="group"
              >
                <a
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block relative h-full rounded-2xl overflow-hidden border border-white/10 bg-black/30 backdrop-blur-sm transition-all duration-500 group-hover:scale-[1.02] group-hover:border-white/30"
                  style={{ boxShadow: "inset 0 1px 0 " + accent + "22" }}
                >
                  <div className="aspect-[16/10] relative overflow-hidden">
                    {a.hero ? (
                      <img src={a.hero} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                    ) : (
                      <div className="w-full h-full relative" style={{ background: "linear-gradient(135deg, " + accent + "33 0%, " + accent + "11 50%, #000 100%)" }}>
                        <div className="absolute inset-0 bg-stars opacity-60" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-6xl font-display font-bold tracking-tight" style={{ color: accent, textShadow: "0 0 30px " + accent + "88" }}>{a.title.charAt(0)}</div>
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    {a.tag && (
                      <div
                        className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-medium tracking-wider uppercase"
                        style={{ background: accent + "33", color: accent, border: "1px solid " + accent + "55" }}
                      >
                        {a.tag}
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h2 className="font-display text-lg leading-snug text-white">{a.title}</h2>
                    <p className="text-sm text-white/65 mt-2 line-clamp-3">{a.description || (a.body[0] || "").slice(0, 200)}</p>
                    <div className="mt-4 text-xs group-hover:text-white transition" style={{ color: accent }}>
                      {zh.stories.readMore} →
                    </div>
                  </div>
                </a>
              </motion.article>
            );
          })}
        </div>
        {filtered.length === 0 && (
          <div className="text-center text-white/50 py-20">未找到匹配 "{q}" 的故事。</div>
        )}
      </div>
    </div>
  );
}
