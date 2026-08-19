"use client";

import { publicUrl } from "@/lib/assetPath";
import dynamic from "next/dynamic";
import Link from "next/link";
import { LiquidGlassPanel } from "@/components/fx/LiquidGlassPanel";

const SingleModelViewer = dynamic(
  () => import("@/components/fx/SingleModelViewer").then((m) => m.SingleModelViewer),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex items-center justify-center text-white/60">
        正在加载模型...
      </div>
    ),
  },
);

interface Entry {
  slug: string;
  title: string;
  description: string;
  image: string;
  glbLocal?: string;
  href: string;
}

export default function SpacecraftDetailClient({ slug, entries }: { slug: string; entries: Entry[] }) {
  const entry = entries.find((e) => e.slug === slug);
  if (!entry) {
    return (
      <div className="pt-32 text-center text-white/70">
        未找到该飞行器。{" "}
        <Link href="/spacecrafts/" className="text-cyan-300 underline">
          返回展廊
        </Link>
      </div>
    );
  }
  return (
    <div className="relative pt-24 pb-12">
      <section className="px-6">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/spacecrafts/"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-cyan-200/80 hover:text-white"
          >
            <span aria-hidden>&#8592;</span> 返回展廊
          </Link>
          <h1 className="mt-3 font-display text-3xl md:text-5xl font-semibold gradient-text">
            {entry.title}
          </h1>
          <p className="mt-3 max-w-3xl text-white/70 leading-relaxed">{entry.description}</p>
        </div>
      </section>
      <section className="px-6 pt-8">
        <div className="max-w-6xl mx-auto relative h-[60vh] overflow-hidden rounded-3xl border border-white/10 bg-black/40">
          {entry.glbLocal ? (
            <SingleModelViewer url={publicUrl(entry.glbLocal)} />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white/60">
              当前模型暂无本地 GLB 资源。
            </div>
          )}
          <div className="pointer-events-none absolute bottom-4 left-4 z-10">
            <LiquidGlassPanel tone="cyan" className="rounded-2xl">
              <div className="px-4 py-2 text-xs text-white/80">
                拖动旋转，滚轮缩放。已启用自动环绕。
              </div>
            </LiquidGlassPanel>
          </div>
        </div>
      </section>
      <section className="px-6 pt-8">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <a
            href={entry.href}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/85 hover:bg-white/10"
          >
            查看原始资料
          </a>
          <Link
            href="/spacecrafts/fleet/"
            className="rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-2 text-sm text-white shadow-[0_0_20px_rgba(34,211,238,0.35)] transition hover:shadow-[0_0_30px_rgba(34,211,238,0.55)]"
          >
            查看完整飞行器场景
          </Link>
        </div>
      </section>
    </div>
  );
}

