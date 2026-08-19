import { FactsView } from "@/components/FactsView";
import { QuickFactsGrid } from "@/components/QuickFactsGrid";
import { AsciiTitle } from "@/components/fx/AsciiTitle";
import type { Metadata } from "next";
import { BODIES, SUN, BELT, KUIPER, OORT } from "@/data/bodies";

export const metadata: Metadata = {
  title: "宇宙事实与数据 - Cosmic Discovery",
  description: "汇总太阳系天体的质量、距离、轨道与成分等核心参数，便于快速比较与浏览。",
};

export default function Page() {
  return (
    <div className="relative pt-28">
      <section className="px-6">
        <div className="mx-auto max-w-6xl text-center">
          <div className="eyebrow mb-3">宇宙数据速览</div>
          <div className="flex justify-center">
            <AsciiTitle text="数据总览" size={64} caption="太阳系核心参数" />
          </div>
        </div>
      </section>
      <QuickFactsGrid />
      <FactsView bodies={[SUN, ...BODIES, BELT, KUIPER, OORT]} />
    </div>
  );
}
