"""Scrape the NASA 3D Resources index using Scrapling.

Outputs data/nasa3d.json with one entry per model:
  { slug, title, description, glb, image, href }

Usage:
    python scripts/scrape_nasa_3d.py [--limit N] [--out PATH]
"""
from __future__ import annotations

import argparse
import html
import json
import re
import sys
import time
from pathlib import Path
from urllib.parse import urljoin

from scrapling.fetchers import Fetcher

INDEX_URL = "https://science.nasa.gov/3d-resources/"
BASE_URL = "https://science.nasa.gov"
SLUG_PATTERN = re.compile(r'href="(https://science\.nasa\.gov/3d-resources/[a-z0-9\-]+/)"')


def collect_slugs(html_text: str) -> list:
    seen: set = set()
    out: list = []
    for match in SLUG_PATTERN.finditer(html_text):
        slug = match.group(1)
        if slug.endswith("/3d-resources/"):
            continue
        if slug in seen:
            continue
        seen.add(slug)
        out.append(slug)
    return out


def fetch_detail(slug: str):
    url = slug  # already an absolute URL
    try:
        page = Fetcher.get(url)
    except Exception as exc:
        print(f"  ! failed {slug}: {exc}", file=sys.stderr)
        return None
    if page.status != 200:
        return None
    content = page.content if hasattr(page, "content") else page.body
    html_text = content.decode("utf-8", "ignore")

    title_match = re.search(r"<title>([^<]+)</title>", html_text)
    if title_match:
        title = re.sub(r"\s*-\s*NASA Science\s*$", "", title_match.group(1)).strip()
    else:
        title = slug.rstrip("/").split("/")[-1].replace("-", " ").title()
    if not title:
        title = slug.rstrip("/").split("/")[-1].replace("-", " ").title()

    desc_match = re.search(r'<meta name="description" content="([^"]+)"', html_text)
    description = html.unescape(desc_match.group(1).strip()) if desc_match else ""

    glb_match = re.search(r'href="([^"]+\.glb(?:\?[^"]*)?)"', html_text)
    glb = glb_match.group(1) if glb_match else ""

    image_match = re.search(r'<meta property="og:image" content="([^"]+)"', html_text)
    image = image_match.group(1) if image_match else ""

    if not glb:
        return None

    return {
        "slug": slug.rstrip("/").split("/")[-1],
        "title": title,
        "description": description,
        "glb": glb,
        "image": image,
        "href": slug,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=80)
    parser.add_argument("--out", type=str, default="data/nasa3d.json")
    parser.add_argument("--delay", type=float, default=0.4)
    args = parser.parse_args()

    print(f"Fetching index: {INDEX_URL}")
    index = Fetcher.get(INDEX_URL)
    if index.status != 200:
        print(f"Index request failed: {index.status}", file=sys.stderr)
        return 1
    index_html = (index.content if hasattr(index, "content") else index.body).decode("utf-8", "ignore")
    slugs = collect_slugs(index_html)
    print(f"Found {len(slugs)} unique slugs; processing up to {args.limit}")
    slugs = slugs[: args.limit]

    results: list = []
    for idx, slug in enumerate(slugs, 1):
        entry = fetch_detail(slug)
        if entry is None:
            print(f"  [{idx}/{len(slugs)}] skip {slug}")
            continue
        print(f"  [{idx}/{len(slugs)}] {entry['title']}")
        results.append(entry)
        time.sleep(args.delay)

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(results, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Wrote {len(results)} entries -> {out_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
