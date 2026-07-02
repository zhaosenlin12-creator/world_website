import { StoriesIndex } from "@/components/StoriesIndex";
import { allStories } from "@/lib/articles";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "故事 — 宇宙探索者",
  description: "Featured stories and articles from across the solar system."
};

export default function Page() {
  const items = allStories();
  return <StoriesIndex initial={items} />;
}
