import { PlanetDetail } from "@/components/PlanetDetail";
import { ALL_BODIES } from "@/data/bodies";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { loadArticles } from "@/lib/articles";

export function generateStaticParams() {
  return ALL_BODIES.map((b) => ({ slug: b.id }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const b = ALL_BODIES.find((x) => x.id === params.slug);
  if (!b) return { title: "Not found" };
  return { title: `${b.name} — Cosmos`, description: b.tagline };
}

export default function Page({ params }: { params: { slug: string } }) {
  const body = ALL_BODIES.find((b) => b.id === params.slug);
  if (!body) notFound();
  const articles = loadArticles()
    .filter((a) => a.slug === body.id || a.slug.startsWith(body.id + "/"))
    .filter((a) => !/Page not found/i.test(a.title));
  return <PlanetDetail body={body} articles={articles} />;
}