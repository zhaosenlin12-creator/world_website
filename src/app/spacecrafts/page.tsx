import fleet from "../../../data/nasa3d.json";
import { SpacecraftCard } from "@/components/SpacecraftCard";
import { AsciiTitle } from "@/components/fx/AsciiTitle";
import { LiquidGlassPanel } from "@/components/fx/LiquidGlassPanel";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "飞行器展廊 - NASA 3D 模型",
  description: "浏览并探索 NASA 3D 资源中的飞行器模型，进入共享宇宙场景自由观看。",
};

interface Entry {
  slug: string;
  title: string;
  description: string;
  glb: string;
  image: string;
  href: string;
}

export default function SpacecraftsPage() {
  const items = fleet as Entry[];
  return (
    <div className="relative pt-28 pb-24">
      <section className="px-6">
        <div className="max-w-6xl mx-auto">
          <div className="eyebrow mb-3 text-center">NASA 3D 资源库</div>
          <div className="flex justify-center mb-6">
            <AsciiTitle text="FLEET" size={84} caption="自由漂浮飞行器宇宙场景" />
          </div>
          <LiquidGlassPanel
            tone="cyan"
            interactive
            className="mx-auto max-w-3xl rounded-3xl"
          >
            <div className="p-5 md:p-6 text-center">
              <p className="text-sm md:text-base text-white/80 leading-relaxed">
                下方展廊收录了从 NASA Science 3D Resources 抓取并整理的 {items.length} 个
                GLB 模型。进入宇宙场景后，你可以在同一片星空中观看这些飞行器自由漂浮，
                并通过点击逐个收听介绍。
              </p>
              <div className="mt-4 flex items-center justify-center gap-3 text-xs">
                <Link
                  href="/spacecrafts/fleet/"
                  className="rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-2 font-medium text-white shadow-[0_0_20px_rgba(34,211,238,0.35)] transition hover:shadow-[0_0_30px_rgba(34,211,238,0.55)]"
                >
                  进入飞行器宇宙场景
                </Link>
                <a
                  href="https://science.nasa.gov/3d-resources/"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-white/20 px-4 py-2 text-white/80 hover:bg-white/10"
                >
                  NASA 官方来源
                </a>
              </div>
            </div>
          </LiquidGlassPanel>
        </div>
      </section>

      <section className="px-6 pt-12">
        <div className="max-w-7xl mx-auto grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((entry) => (
            <SpacecraftCard key={entry.slug} entry={entry} />
          ))}
        </div>
      </section>
    </div>
  );
}
