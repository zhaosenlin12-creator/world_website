"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { zh } from "@/i18n/zh";
import { ScrollReveal } from "@/components/fx/ScrollReveal";

interface Article {
  url: string;
  slug: string;
  title: string;
  description: string;
  hero: string | null;
  body: string[];
  images: { src: string; alt: string }[];
}

const FALLBACK_STORIES: Article[] = [
  {
    url: "#",
    slug: "psyche",
    title: "NASA 的灵神星任务",
    description: "一艘航天器造访了一颗由金属构成的小行星——一颗远古原行星裸露的金属核心。",
    hero: null,
    body: [],
    images: []
  },
  {
    url: "#",
    slug: "jwst",
    title: "詹姆斯·韦伯太空望远镜",
    description: "在红外波段观测最早的星系、系外行星大气层，以及恒星的诞生。",
    hero: null,
    body: [],
    images: []
  },
  {
    url: "#",
    slug: "artemis",
    title: "阿尔忒弥斯与重返月球",
    description: "人类迈向深空的下一大步——让足迹再次踏上月球表面的计划。",
    hero: null,
    body: [],
    images: []
  }
];

export function FeaturedStories() {
  const [stories, setStories] = useState<Article[]>(FALLBACK_STORIES);

  useEffect(() => {
    fetch("/api/stories")
      .then((r) => r.ok ? r.json() : [])
      .then((data) => {
        if (Array.isArray(data) && data.length >= 3) setStories(data.slice(0, 6));
      })
      .catch(() => {});
  }, []);

  return (
    <section className="relative py-24 px-6">
      <ScrollReveal>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="flex items-end justify-between flex-wrap gap-4 mb-10"
        >
          <div>
            <div className="eyebrow mb-3">NASA 最新动态</div>
            <h2 className="h-section gradient-text">精选故事</h2>
          </div>
          <Link href="/stories" className="btn-ghost">全部故事</Link>
        </motion.div>
        <ScrollReveal delay={0.15}>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {stories.slice(0, 6).map((s, i) => (
            <motion.article
              key={(s.slug || s.url) + i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="group"
            >
              <div className="relative h-full rounded-2xl overflow-hidden border border-white/10 bg-black/30 backdrop-blur-sm transition-all duration-500 group-hover:scale-[1.02] group-hover:border-white/30 group-hover:shadow-[0_0_50px_rgba(168,85,247,0.15)]">
                <div className="aspect-[16/10] relative overflow-hidden bg-gradient-to-br from-indigo-900/40 to-purple-900/30">
                  {s.hero ? (
                    <img src={s.hero} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full bg-stars" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                </div>
                <div className="p-5">
                  <div className="text-xs tracking-widest text-purple-300/80 mb-2">{(s.slug || "").split("/")[0] || "精选"}</div>
                  <div className="font-display text-lg leading-snug" dangerouslySetInnerHTML={{ __html: s.title }} />
                  <p className="text-sm text-white/65 mt-2 line-clamp-3" dangerouslySetInnerHTML={{ __html: s.description || (s.body[0] || "").slice(0, 200) }} />
                  <div className="mt-4 text-xs text-purple-300 group-hover:text-white transition">阅读更多 →</div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
        </ScrollReveal>
      </div>
      </ScrollReveal>
    </section>
  );
}
