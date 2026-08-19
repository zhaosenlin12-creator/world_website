import { Explorer } from "@/components/Explorer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "3D 探索 - 宇宙探索者",
  description: "实时 3D 太阳系场景，可点击天体、拖拽旋转并自由缩放视角。",
};

export default function ExplorePage() {
  return <Explorer />;
}

