import { StoriesIndex } from "@/components/StoriesIndex";
import { allStories } from "@/lib/articles";
import { zh } from "@/i18n/zh";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "故事 — 宇宙探索者",
  description: "精选自公开的太阳系观测与探测资料——任务进展、关键发现与前沿故事。"
};

export default function Page() {
  // 优先使用中文故事库 (zh.stories.items)
  const zhItems = (zh.stories as any).items;
  const items = (Array.isArray(zhItems) && zhItems.length > 0)
    ? zhItems.map((it: any, i: number) => ({
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
      }))
    : allStories();
  return <StoriesIndex initial={items} />;
}
