import { PlanetsIndex } from "@/components/PlanetsIndex";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "行星 — 宇宙探索者",
  description: "八颗大行星、五颗官方矮行星，以及太阳系中的主要天体。"
};

export default function PlanetsPage() {
  return <PlanetsIndex />;
}
