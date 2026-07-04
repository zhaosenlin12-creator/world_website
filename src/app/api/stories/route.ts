import { NextResponse } from "next/server";
import { zh } from "@/i18n/zh";

export const dynamic = "force-dynamic";

export async function GET() {
  const items = (zh.stories as any).items || [];
  const mapped = items.map((it: any) => ({
    url: "https://science.nasa.gov/" + it.slug + "/",
    slug: it.slug,
    title: it.title,
    description: it.desc,
    hero: it.image,
    body: [it.desc],
    headings: [],
    images: [{ src: it.image, alt: it.title }],
    accent: it.accent,
    tag: it.tag
  }));
  return NextResponse.json(mapped);
}
