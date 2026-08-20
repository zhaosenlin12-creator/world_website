import { BODIES, SolarBody } from "@/data/bodies";

export interface ScrapedArticle {
  url: string;
  slug: string;
  title: string;
  description: string;
  hero: string | null;
  body: string[];
  headings: { level: number; text: string }[];
  images: { src: string; alt: string }[];
}

let cache: ScrapedArticle[] | null = null;
let inflight: Promise<ScrapedArticle[]> | null = null;

// 从 /public/data/articles.json 运行时拉取, 不参与 build bundle, 让 stories 页首屏轻量化.
async function loadFromPublic(): Promise<ScrapedArticle[]> {
  const url = "/data/articles.json";
  try {
    const r = await fetch(url, { cache: "force-cache" });
    if (!r.ok) return [];
    const arr = (await r.json()) as ScrapedArticle[];
    return arr.filter((a) => a.title && !/Page not found/i.test(a.title));
  } catch {
    return [];
  }
}

export async function loadArticlesAsync(): Promise<ScrapedArticle[]> {
  if (cache) return cache;
  if (!inflight) {
    inflight = loadFromPublic().then((arr) => {
      cache = arr;
      return arr;
    });
  }
  return inflight;
}

// 同步接口: 返回已缓存数据 (空数组若尚未加载)
export function loadArticles(): ScrapedArticle[] {
  if (cache) return cache;
  // 在客户端异步加载 (仅 stories 页 fallback 使用, 主路径走 zh.stories.items)
  if (typeof window !== "undefined") {
    void loadArticlesAsync();
  }
  return cache || [];
}

export function articlesForBody(body: SolarBody): ScrapedArticle[] {
  return loadArticles().filter((a) => a.slug.startsWith(body.id));
}

export function allStories(): ScrapedArticle[] {
  return loadArticles().filter(
    (a) => !BODIES.some((b) => a.slug.startsWith(b.id)) && a.body.length > 1
  );
}