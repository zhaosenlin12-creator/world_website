"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { LiquidGlassPanel } from "./LiquidGlassPanel";

export interface TopicCard {
  tag: string;
  title: string;
  description: string;
  href: string;
  tone?: "neutral" | "cyan" | "fuchsia" | "amber";
  // Inline SVG / image media to render on top of the card.
  mediaType?: "video" | "image";
  mediaUrl?: string;
  poster?: string;
}

interface Props {
  title: string;
  eyebrow?: string;
  cards: TopicCard[];
}

export function TopicsGrid({ title, eyebrow, cards }: Props) {
  return (
    <section className="relative py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10"
        >
          {eyebrow ? (
            <div className="eyebrow mb-3">{eyebrow}</div>
          ) : null}
          <h2 className="h-section gradient-text">{title}</h2>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card, i) => (
            <motion.div
              key={`${card.tag}-${i}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: i * 0.05 }}
            >
              <LiquidGlassPanel
                tone={card.tone ?? "neutral"}
                interactive
                delay={0.05 * i}
                className="h-full rounded-3xl"
              >
                <Link href={card.href} target="_blank" rel="noreferrer" className="block h-full">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    {card.mediaType === "video" && card.mediaUrl ? (
                      <video
                        className="absolute inset-0 h-full w-full object-cover opacity-90 transition-transform duration-700 hover:scale-105"
                        src={card.mediaUrl}
                        poster={card.poster}
                        muted
                        loop
                        autoPlay
                        playsInline
                        preload="metadata"
                      />
                    ) : card.mediaUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={card.mediaUrl}
                        alt={card.title}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(168,85,247,0.4),transparent_60%)]" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                    <span className="absolute left-3 top-3 inline-flex items-center rounded-full border border-white/20 bg-black/40 px-2.5 py-1 text-[10px] uppercase tracking-[0.28em] text-white/85 backdrop-blur">
                      {card.tag}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-lg leading-snug text-white">{card.title}</h3>
                    <p className="mt-2 text-sm text-white/70 line-clamp-3">{card.description}</p>
                    <div className="mt-4 inline-flex items-center gap-1 text-xs tracking-[0.28em] text-cyan-200/90">
                      <span>继续探索</span>
                      <span aria-hidden>&#8594;</span>
                    </div>
                  </div>
                </Link>
              </LiquidGlassPanel>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

