import { ResourcesView } from "@/components/ResourcesView";
import { loadArticles } from "@/lib/articles";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Resources — Cosmos" };

export default function Page() {
  const articles = loadArticles().filter((a) => a.slug.startsWith("solar-system/resources/"));
  return <ResourcesView articles={articles} />;
}
