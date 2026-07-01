"use client";
import { zh } from "@/i18n/zh";
const stats = [
  zh.marquee.sunMercury,
  zh.marquee.sunEarth,
  zh.marquee.sunNeptune,
  zh.marquee.voyager1,
  zh.marquee.andromeda,
  zh.marquee.observable,
  zh.marquee.milkyway,
  zh.marquee.sunLight
];
export function StatsMarquee() {
  return (
    <section className="relative border-y border-white/10 bg-black/30 backdrop-blur-sm py-4 overflow-hidden">
      <div className="marquee">
        {[...stats, ...stats, ...stats].map((s, i) => (
          <div key={i} className="flex items-center gap-3 px-8 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            <span className="text-sm text-white/70">{s}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
