import type { Metadata } from "next";
import { AboutView } from "@/components/AboutView";

export const metadata: Metadata = { title: "About — Cosmos" };

export default function Page() {
  return <AboutView />;
}
