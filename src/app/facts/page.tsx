import { FactsView } from "@/components/FactsView";
import type { Metadata } from "next";
import { BODIES, SUN, BELT, KUIPER, OORT } from "@/data/bodies";

export const metadata: Metadata = {
  title: "Facts &amp; Figures — Cosmos",
  description: "By the numbers: the scale, size, and stats of our solar system."
};

export default function Page() {
  return <FactsView bodies={[SUN, ...BODIES, BELT, KUIPER, OORT]} />;
}
