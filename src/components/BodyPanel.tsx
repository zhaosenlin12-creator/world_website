"use client";
import { motion, AnimatePresence } from "framer-motion";
import { SolarBody, ALL_BODIES } from "@/data/bodies";
import { useEffect, useState } from "react";
import { zh } from "@/i18n/zh";

interface Props { body: SolarBody; onClose: () => void }

interface Article {
  url: string;
  title: string;
  description: string;
  hero: string | null;
  body: string[];
  images: { src: string; alt: string }[];
}

function kindLabel(k: string) {
  if (k === "star") return zh.type.star;
  if (k === "planet") return zh.type.planet;
  if (k === "dwarf") return zh.type.dwarf;
  if (k === "belt") return zh.type.belt;
  return k;
}

function planetName(b: SolarBody): string {
  return (b as any).nameZh || b.name;
}

export function BodyPanel({ body, onClose }: Props) {
  const [article, setArticle] = useState<Article | null>(null);

  useEffect(() => {
    setArticle(null);
    fetch(`/api/bodies/${body.id}`).then((r) => r.ok ? r.json() : null).then((d) => {
      if (d) setArticle(d);
    }).catch(() => {});
  }, [body.id]);

  const linked = ALL_BODIES.filter((b) => b.kind === body.kind && b.id !== body.id).slice(0, 4);

  return (
    <AnimatePresence>
      <motion.aside
        key={body.id}
        initial={{ x: "-100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "-100%", opacity: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 26 }}
        className="absolute left-0 top-16 bottom-0 w-full max-w-md z-40 glass-strong overflow-y-auto p-6 md:p-8"
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-white/60 hover:text-white" title={zh.panel.close}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-16 h-16 rounded-full flex-shrink-0" style={{ background: `radial-gradient(circle at 30% 30%, ${body.color}, ${body.color}80 50%, #000)`, boxShadow: `0 0 40px ${body.color}80` }} />
              <div>
                <div className="eyebrow">{kindLabel(body.kind)}</div>
                <div className="font-display text-3xl">{planetName(body)}</div>
                <div className="text-xs text-white/40">{body.symbol}</div>
              </div>
            </div>
            <p className="text-white/70 italic mt-4">{(body as any).taglineZh || body.tagline}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <Stat label={zh.stat.diameter} value={`${body.diameterKm.toLocaleString()} km`} />
            <Stat label={zh.stat.mass} value={body.massKg} />
            <Stat label={zh.stat.surfaceGravity} value={body.gravity} />
            <Stat label={zh.stat.day} value={formatHours(body.rotationHours)} />
            <Stat label={zh.stat.year} value={formatDays(body.orbitPeriodDays)} />
            <Stat label={zh.stat.distance} value={body.orbitAu > 0 ? `${body.orbitAu} AU` : "—"} />
            <Stat label={zh.stat.axialTilt} value={`${body.axialTiltDeg}°`} />
            <Stat label={zh.stat.temperature} value={`${body.temperatureC.min}°C 至 ${body.temperatureC.max}°C`} />
          </div>

          <div>
            <div className="eyebrow mb-2">{zh.panel.about}</div>
            <p className="text-sm text-white/75 leading-relaxed">{(body as any).descriptionZh || body.description}</p>
          </div>

          {body.atmosphere && (
            <div>
              <div className="eyebrow mb-2">{zh.panel.atmosphere}</div>
              <p className="text-sm text-white/70 leading-relaxed">{body.atmosphere}</p>
            </div>
          )}

          <div>
            <div className="eyebrow mb-3">{zh.panel.didYouKnow}</div>
            <ul className="space-y-2">
              {(body.funFactsZh || body.funFacts).map((f, i) => (
                <li key={i} className="text-sm text-white/75 flex gap-2">
                  <span className="text-purple-300">·</span>
                  <span dangerouslySetInnerHTML={{ __html: f }} />
                </li>
              ))}
            </ul>
          </div>

          {article && article.body && article.body.length > 0 && (
            <div>
              <div className="eyebrow mb-3">{zh.panel.fromNasa}</div>
              <div className="space-y-3 text-sm text-white/80 leading-relaxed">
                {article.body.slice(0, 4).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
                <a href={article.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-purple-300 hover:text-white text-xs">
                  在 NASA.gov 上阅读 →
                </a>
              </div>
            </div>
          )}

          {linked.length > 0 && (
            <div>
              <div className="eyebrow mb-3">相关世界</div>
              <div className="grid grid-cols-2 gap-2">
                {linked.map((b) => (
                  <a key={b.id} href={`/planets/${b.id}`} className="glass rounded-xl p-3 hover:border-white/30 transition">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full" style={{ background: `radial-gradient(circle at 30% 30%, ${b.color}, ${b.color}80 50%, #000)` }} />
                      <div>
                        <div className="text-sm">{planetName(b)}</div>
                        <div className="text-[10px] text-white/50">{kindLabel(b.kind)}</div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-xl p-3">
      <div className="text-[10px] tracking-widest text-white/40">{label}</div>
      <div className="text-sm text-white mt-1">{value}</div>
    </div>
  );
}

function formatHours(h: number) {
  if (!h) return "—";
  if (Math.abs(h) < 48) return `${h} 小时`;
  const d = h / 24;
  return `${d.toFixed(2)} 地球日`;
}
function formatDays(d: number) {
  if (!d) return "—";
  if (d < 365) return `${d} 地球日`;
  const y = d / 365.25;
  return `${y.toFixed(2)} 地球年`;
}