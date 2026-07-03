import { GameClient } from "@/components/GameClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "宇宙迷宫 — 宇宙探索者",
  description: "驾驶飞船，逐一探索太阳系的行星。答对所有问题即可获得「宇宙探索者」徽章。"
};

export default function PlayPage() {
  return <GameClient />;
}
