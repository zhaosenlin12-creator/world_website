import { NextResponse } from "next/server";
import { allStories } from "@/lib/articles";
export const dynamic = "force-dynamic";
export async function GET() {
  const items = allStories().slice(0, 30).map((a) => ({
    url: a.url, slug: a.slug, title: a.title, description: a.description,
    hero: a.hero, body: a.body.slice(0, 1), images: a.images.slice(0, 1)
  }));
  return NextResponse.json(items);
}
