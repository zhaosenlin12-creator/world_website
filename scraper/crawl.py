"""Comprehensive crawler for NASA Solar System (improved with auto-discovered sub-URLs)."""
import re, os, json, time, hashlib, sys
from pathlib import Path
from urllib.parse import urljoin, urlparse, unquote
import urllib.request

ROOT = Path(r"D:\kaifa_stu\world_website")
OUT = ROOT / "scraper"
OUT.mkdir(exist_ok=True, parents=True)
DATA = ROOT / "data"
DATA.mkdir(exist_ok=True, parents=True)
IMG_DIR = ROOT / "scraper" / "cache" / "images"
IMG_DIR.mkdir(parents=True, exist_ok=True)
IMG_DIR.mkdir(exist_ok=True, parents=True)
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"
BASE = "https://science.nasa.gov"

def fetcher():
    from scrapling.fetchers import Fetcher
    return Fetcher

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
    except Exception as e:
        print(f"  ! download fail {url}: {e}")
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

def collect_hrefs(page, base_url, pattern):
    """Extract all hrefs matching pattern from a page."""
    out = set()
    for a in page.css("a"):
        h = a.attrib.get("href") or ""
        if not h: continue
        # convert relative
        full = urljoin(base_url, h).split("#")[0].split("?")[0]
        if re.search(pattern, full):
            out.add(full)
    return out

def fetch_url(url):
    F = fetcher()
    return F.get(url, impersonate="chrome", stealthy_headers=True, timeout=60)

def discover_urls():
    """Discover all relevant sub-URLs by scanning hub pages + planets."""
    F = fetcher()
    hub_pages = [
        BASE + "/solar-system/",
        BASE + "/planets/",
        BASE + "/solar-system/planets/",
        BASE + "/dwarf-planets/",
        BASE + "/solar-system/moons/",
        BASE + "/solar-system/asteroids/",
        BASE + "/solar-system/comets/",
        BASE + "/solar-system/kuiper-belt/",
        BASE + "/solar-system/oort-cloud/",
        BASE + "/solar-system/meteors-meteorites/",
        BASE + "/solar-system/planet-x/",
        BASE + "/solar-system/facts/",
        BASE + "/solar-system/solar-system-facts/",
        BASE + "/solar-system/stories/",
        BASE + "/solar-system/resources/",
        BASE + "/solar-system/resources/resource-packages/",
    ]
    all_urls = set()
    for u in hub_pages:
        try:
            print(f"  hub: {u}")
            p = F.get(u, impersonate="chrome", stealthy_headers=True, timeout=60)
            hrefs = collect_hrefs(p, u, r"science\.nasa\.gov/(solar-system/[^/]+/?$|solar-system/.+/|mercury/?$|venus/?$|earth/?$|mars/?$|jupiter/?$|saturn/?$|uranus/?$|neptune/?$|pluto/?$|ceres/?$|makemake/?$|haumea/?$|eris/?$)")
            all_urls |= hrefs
        except Exception as e:
            print(f"  ! {e}")
    # also discover per-planet via root
    for slug in ["mercury","venus","earth","mars","jupiter","saturn","uranus","neptune","pluto","ceres","makemake","haumea","eris"]:
        all_urls.add(f"{BASE}/{slug}/")
        all_urls.add(f"{BASE}/{slug}/facts/")
        all_urls.add(f"{BASE}/{slug}/exploration/")
        all_urls.add(f"{BASE}/{slug}/moons/")
        all_urls.add(f"{BASE}/{slug}/in-depth/")
    return sorted(all_urls)

def fetch_all(urls):
    out = []
    for i, url in enumerate(urls):
        print(f"  ({i+1}/{len(urls)}) {url}")
        try:
            page = fetch_url(url)
            data = parse_article(page, url)
            data["slug"] = url.replace(BASE+"/","").rstrip("/")
            out.append(data)
            print(f"    ok title='{data['title'][:50]}' body={len(data['body'])} imgs={len(data['images'])}")
        except Exception as e:
            print(f"    ! error: {e}")
        time.sleep(0.25)
    return out

def download_all_images(items):
    print("[4/4] Downloading images...")
    seen = set()
    manifest = []
    # pass 1: heroes
    for it in items:
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
    # pass 2: body images
    for it in items:
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
    (DATA / "images.json").write_text(json.dumps(manifest, indent=2, ensure_ascii=False))
    print(f"  total unique: {len(seen)} indexed: {len(manifest)}")

if __name__ == "__main__":
    print("[1/4] Discovering sub-URLs...")
    urls = discover_urls()
    print(f"  total discovered: {len(urls)}")
    (DATA / "_subpages.json").write_text(json.dumps(urls, indent=2, ensure_ascii=False))
    print("[2/4] Fetching all pages...")
    items = fetch_all(urls)
    (DATA / "articles.json").write_text(json.dumps(items, indent=2, ensure_ascii=False))
    print(f"  items: {len(items)}")
    print("[3/4] Downloading images...")
    download_all_images(items)
    print("==> DONE")
