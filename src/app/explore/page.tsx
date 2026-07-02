import { Explorer } from "@/components/Explorer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "3D 探索 — 宇宙探索者",
  description: "点击任意行星、随体驱动的实时 3D 太阳系模拟。"
};

export default function ExplorePage() {
  return <Explorer />;
}
