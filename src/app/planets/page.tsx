import { PlanetsIndex } from "@/components/PlanetsIndex";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Planets — Cosmos",
  description: "All eight planets, the dwarf planets, and the major bodies in our solar system."
};

export default function PlanetsPage() {
  return <PlanetsIndex />;
}
