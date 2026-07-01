// Helpers to load scraped articles and merge with our curated bodies data.
import path from "path";
import fs from "fs";
import { BODIES, SolarBody } from "@/data/bodies";

const DATA = path.join(process.cwd(), "data");

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

export function loadArticles(): ScrapedArticle[] {
  if (cache) return cache;
  try {
    const fp = path.join(DATA, "articles.json");
    if (!fs.existsSync(fp)) return (cache = []);
    const raw = fs.readFileSync(fp, "utf-8");
    const arr = JSON.parse(raw) as ScrapedArticle[];
    cache = arr.filter((a) => a.title && !/Page not found/i.test(a.title));
    return cache;
  } catch {
    return (cache = []);
  }
}

export function articlesForBody(body: SolarBody): ScrapedArticle[] {
  return loadArticles().filter((a) => a.slug.startsWith(body.id));
}

export function allStories(): ScrapedArticle[] {
  return loadArticles().filter((a) => !BODIES.some((b) => a.slug.startsWith(b.id)) && a.body.length > 1);
}
