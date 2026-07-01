import { NextResponse } from "next/server";
import { loadArticles } from "@/lib/articles";
import { ALL_BODIES } from "@/data/bodies";
export const dynamic = "force-dynamic";
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const body = ALL_BODIES.find((b) => b.id === id);
  if (!body) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const arts = loadArticles().filter((a) => a.slug === id || a.slug.startsWith(id + "/"));
  const candidates = arts.filter((a) => !/Page not found/i.test(a.title));
  const best = candidates[0] || arts[0] || null;
  if (!best) return NextResponse.json({ ...body, article: null });
  return NextResponse.json({
    ...body,
    article: { url: best.url, title: best.title, description: best.description, hero: best.hero, body: best.body, images: best.images }
  });
}