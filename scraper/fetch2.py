"""Save articles to JSON + download images. Uses --resume from stdout if available."""
import re, os, json, time, hashlib, re as r2
from pathlib import Path
from urllib.parse import urljoin, urlparse, unquote
import urllib.request

ROOT = Path(r"D:\kaifa_stu\world_website")
DATA = ROOT / "data"
IMG_DIR = ROOT / "scraper" / "cache" / "images"
IMG_DIR.mkdir(parents=True, exist_ok=True)
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"
BASE = "https://science.nasa.gov"

urls = json.loads((DATA / "_subpages.json").read_text(encoding="utf-8"))
print(f"Fetching {len(urls)} URLs...")

from scrapling.fetchers import Fetcher

def file_name_for(url):
    p = urlparse(url)
    name = unquote(p.path).rsplit("/", 1)[-1] or "img"
    name = name.split("?")[0]
    name = re.sub(r"[^A-Za-z0-9._-]+", "_", name)[:140]
    if "." not in name: name += ".jpg"
    h = hashlib.md5(url.encode()).hexdigest()[:6]
    return f"{h}_{name}"

def http_get(url, timeout=30):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Referer": BASE + "/"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read(), r.headers.get("content-type", "")

def download(url, dest):
    try:
        data, _ = http_get(url)
        dest.write_bytes(data)
        return True
    except Exception:
        return False

def parse_article(page, url):
    title = None
    og = page.css('meta[property="og:title"]')
    if og: title = og[0].attrib.get("content", "").strip()
    if not title:
        h1 = page.css("h1")
        if h1: title = h1[0].text.strip()
    if not title:
        title = page.css("title")[0].text.strip() if page.css("title") else url
    desc = ""
    md = page.css('meta[name="description"]')
    if md: desc = md[0].attrib.get("content", "").strip()
    hero = None
    ogimg = page.css('meta[property="og:image"]')
    if ogimg: hero = ogimg[0].attrib.get("content", "").strip()
    if not hero:
        for img in page.css("article img, main img, .entry-content img"):
            src = img.attrib.get("src") or img.attrib.get("data-src")
            if src and not src.endswith(".svg"):
                hero = src; break
    body_nodes = page.css("article p, main p, .entry-content p, .smd-content p")
    body = []
    for p in body_nodes:
        t = re.sub(r"\s+", " ", p.text or "").strip()
        if t and len(t) > 25:
            body.append(t)
    body = body[:200]
    headings = []
    for h in page.css("article h2, article h3, main h2, main h3, .entry-content h2, .entry-content h3"):
        ht = re.sub(r"\s+", " ", h.text or "").strip()
        if ht: headings.append({"level": int(h.tag[1]), "text": ht})
    headings = headings[:60]
    imgs = []
    seen = set()
    for img in page.css("article img, main img"):
        for attr in ("src","data-src","srcset"):
            v = img.attrib.get(attr)
            if not v: continue
            first = v.split(",")[0].strip().split(" ")[0]
            if first and first not in seen and not first.startswith("data:"):
                seen.add(first)
                imgs.append({"src": urljoin(url, first), "alt": (img.attrib.get("alt") or "").strip()})
                break
    imgs = imgs[:40]
    return {"url": url, "title": (title or "").strip(), "description": desc, "hero": hero, "body": body, "headings": headings, "images": imgs}

# resume
out_path = DATA / "articles.json"
out = []
done = set()
if out_path.exists():
    try:
        existing = json.loads(out_path.read_text(encoding="utf-8"))
        for it in existing: done.add(it["url"])
        out = existing
        print(f"resuming: {len(done)} already done")
    except Exception:
        pass

for i, url in enumerate(urls):
    if url in done: continue
    print(f"  ({i+1}/{len(urls)}) {url}", flush=True)
    try:
        page = Fetcher.get(url, impersonate="chrome", stealthy_headers=True, timeout=60)
        data = parse_article(page, url)
        data["slug"] = url.replace(BASE+"/","").rstrip("/")
        out.append(data)
        out_path.write_text(json.dumps(out, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"    ok title=\"{data['title'][:50]}\" body={len(data['body'])} imgs={len(data['images'])}", flush=True)
    except Exception as e:
        print(f"    ! error: {e}", flush=True)
    time.sleep(0.2)

print("Downloading images...", flush=True)
seen = set()
manifest = []
for it in out:
    src = it.get("hero")
    if not src or src in seen: continue
    seen.add(src)
    name = file_name_for(src)
    dest = IMG_DIR / name
    if not dest.exists():
        if download(src, dest):
            manifest.append({"src": src, "local": f"/assets/images/{name}"})
    else:
        manifest.append({"src": src, "local": f"/assets/images/{name}"})
for it in out:
    for img in it.get("images", []):
        s = img.get("src")
        if not s or s in seen: continue
        seen.add(s)
        name = file_name_for(s)
        dest = IMG_DIR / name
        if not dest.exists():
            if download(s, dest):
                manifest.append({"src": s, "local": f"/assets/images/{name}"})
        else:
            manifest.append({"src": s, "local": f"/assets/images/{name}"})
(DATA / "images.json").write_text(json.dumps(manifest, indent=2, ensure_ascii=False), encoding="utf-8")
print(f"Total unique: {len(seen)}, indexed: {len(manifest)}", flush=True)
print("DONE", flush=True)
