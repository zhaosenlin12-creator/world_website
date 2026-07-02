import type { Metadata } from "next";
import { AboutView } from "@/components/AboutView";

export const metadata: Metadata = { title: "关于 — 宇宙探索者" };

export default function Page() {
  return <AboutView />;
}
