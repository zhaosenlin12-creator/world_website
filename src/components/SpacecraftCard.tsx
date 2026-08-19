"use client";

import Link from "next/link";
import { LiquidGlassPanel } from "@/components/fx/LiquidGlassPanel";

interface Entry {
  slug: string;
  title: string;
  description: string;
  image: string;
}

export function SpacecraftCard({ entry }: { entry: Entry }) {
  return (
    <LiquidGlassPanel tone="cyan" interactive className="h-full rounded-3xl">
      <Link href={`/spacecrafts/${entry.slug}/`} className="flex h-full flex-col">
        <div className="relative aspect-[16/10] overflow-hidden">
          {entry.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={entry.image}
              alt={entry.title}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(34,211,238,0.35),transparent_60%)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
          <span className="absolute left-3 top-3 inline-flex items-center rounded-full border border-white/20 bg-black/40 px-2.5 py-1 text-[10px] uppercase tracking-[0.28em] text-white/85 backdrop-blur">
            {entry.slug.split("-").slice(0, 2).join(" ")}
          </span>
        </div>
        <div className="p-5">
          <h3 className="font-display text-lg leading-snug text-white">{entry.title}</h3>
          <p className="mt-2 text-sm text-white/70 line-clamp-3">{entry.description}</p>
          <div className="mt-4 inline-flex items-center gap-1 text-xs uppercase tracking-[0.28em] text-cyan-200/90">
            <span>查看 3D</span>
            <span aria-hidden>&#8594;</span>
          </div>
        </div>
      </Link>
    </LiquidGlassPanel>
  );
}
