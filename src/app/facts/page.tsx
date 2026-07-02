import { FactsView } from "@/components/FactsView";
import type { Metadata } from "next";
import { BODIES, SUN, BELT, KUIPER, OORT } from "@/data/bodies";

export const metadata: Metadata = {
  title: "数据与数字 — 宇宙探索者",
  description: "太阳系各天体的关键参数：质量、距离、轨道与原子组成。"
};

export default function Page() {
  return <FactsView bodies={[SUN, ...BODIES, BELT, KUIPER, OORT]} />;
}
