import { ResourcesView } from "@/components/ResourcesView";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "资源库 · 宇宙探索者" };

export default function Page() {
  return <ResourcesView />;
}