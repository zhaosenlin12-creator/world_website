"use client";

import { FeaturedVideoPanel } from "@/components/fx/FeaturedVideoPanel";
import { AsciiTitle } from "@/components/fx/AsciiTitle";
import { LiquidGlassPanel } from "@/components/fx/LiquidGlassPanel";
import { heroDiscovery } from "@/data/nasaContent";

export function DiscoverySection() {
  return (
    <section className="relative px-6 pb-20 pt-8 md:pt-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-end gap-10 md:grid-cols-[2fr_3fr]">
          <div className="flex flex-col gap-6">
            <span className="eyebrow">{heroDiscovery.eyebrow}</span>
            <AsciiTitle text="宇宙观测" size={72} caption="空间站与深空探索" />
            <LiquidGlassPanel tone="cyan" interactive delay={0.1} className="max-w-xl rounded-2xl">
              <div className="p-5 md:p-6">
                <p className="text-sm leading-relaxed text-white/82 md:text-base">{heroDiscovery.body}</p>
              </div>
            </LiquidGlassPanel>
          </div>

          <FeaturedVideoPanel
            src={heroDiscovery.video}
            poster={heroDiscovery.poster}
            eyebrow={heroDiscovery.eyebrow}
            title={heroDiscovery.title}
            body=""
            href={heroDiscovery.href}
            ctaLabel="前往来源站点"
            tone="cyan"
            height="h-[320px] md:h-[440px]"
          />
        </div>
      </div>
    </section>
  );
}

