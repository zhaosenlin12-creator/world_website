#!/usr/bin/env python3
"""下载真实NASA行星/天体图片, 作为 public/assets/textures/*.jpg 替换占位图.

所有图片来源均为 NASA / JPL Photojournal 公开域, 通过 images-assets.nasa.gov CDN 拉取.
"""
import urllib.request, socket, time, os, sys
from pathlib import Path

socket.setdefaulttimeout(45)
OUT = Path("public/assets/textures")
OUT.mkdir(parents=True, exist_ok=True)

# 图片URL清单 (NASA/JPL Photojournal 公开域) 与目标文件名.
# 优先原图; 失败回退 medium.
TARGETS = [
    # (output_filename, url_primary, url_fallback)
    ("sun.jpg",          "https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e001516/GSFC_20171208_Archive_e001516~large.jpg", "https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e001516/GSFC_20171208_Archive_e001516~medium.jpg"),
    ("mercury.jpg",      "https://images-assets.nasa.gov/image/PIA19450/PIA19450~orig.jpg", "https://images-assets.nasa.gov/image/PIA19450/PIA19450~medium.jpg"),
    ("venus.jpg",        "https://images-assets.nasa.gov/image/PIA00072/PIA00072~orig.jpg", "https://images-assets.nasa.gov/image/PIA00072/PIA00072~medium.jpg"),
    ("earth.jpg",        "https://images-assets.nasa.gov/image/PIA00342/PIA00342~orig.jpg", "https://images-assets.nasa.gov/image/PIA00342/PIA00342~medium.jpg"),
    ("moon.jpg",         "https://images-assets.nasa.gov/image/as17-148-22727/as17-148-22727~orig.jpg", "https://images-assets.nasa.gov/image/as17-148-22727/as17-148-22727~medium.jpg"),
    ("mars.jpg",         "https://images-assets.nasa.gov/image/PIA23764/PIA23764~orig.jpg", "https://images-assets.nasa.gov/image/PIA23764/PIA23764~medium.jpg"),
    ("jupiter.jpg",      "https://images-assets.nasa.gov/image/PIA22946/PIA22946~orig.jpg", "https://images-assets.nasa.gov/image/PIA22946/PIA22946~medium.jpg"),
    ("saturn.jpg",       "https://images-assets.nasa.gov/image/PIA17474/PIA17474~orig.jpg", "https://images-assets.nasa.gov/image/PIA17474/PIA17474~medium.jpg"),
    ("saturn_ring.jpg",  "https://images-assets.nasa.gov/image/PIA17474/PIA17474~orig.jpg", "https://images-assets.nasa.gov/image/PIA17474/PIA17474~medium.jpg"),
    ("uranus.jpg",       "https://images-assets.nasa.gov/image/PIA18182/PIA18182~orig.jpg", "https://images-assets.nasa.gov/image/PIA18182/PIA18182~medium.jpg"),
    ("neptune.webp",     "https://images-assets.nasa.gov/image/PIA01492/PIA01492~orig.jpg", "https://images-assets.nasa.gov/image/PIA01492/PIA01492~medium.jpg"),
    ("pluto.jpg",        "https://images-assets.nasa.gov/image/PIA19873/PIA19873~orig.jpg", "https://images-assets.nasa.gov/image/PIA19873/PIA19873~medium.jpg"),
    ("ceres.jpg",        "https://images-assets.nasa.gov/image/PIA20308/PIA20308~orig.jpg", "https://images-assets.nasa.gov/image/PIA20308/PIA20308~medium.jpg"),
]

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 world_website/1.0"

def fetch(url, out):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept":"image/*,*/*"})
    t0 = time.time()
    with urllib.request.urlopen(req, timeout=60) as r:
        ct = r.headers.get("Content-Type", "")
        if r.status != 200 or ("image" not in ct and "octet" not in ct and "jpeg" not in ct and "webp" not in ct and "jpg" not in ct and "png" not in ct):
            raise RuntimeError(f"non-image content-type={ct} status={r.status}")
        data = r.read()
    dt = time.time() - t0
    Path(out).write_bytes(data)
    return len(data), dt

ok, fail = [], []
for name, primary, fallback in TARGETS:
    out = OUT / name
    if out.exists() and out.stat().st_size > 5000:
        # 已经存在且大于5KB, 跳过
        ok.append((name, out.stat().st_size, "cached"))
        continue
    last_err = None
    for url in (primary, fallback):
        try:
            sz, dt = fetch(url, out)
            ok.append((name, sz, f"{dt:.1f}s"))
            last_err = None
            break
        except Exception as e:
            last_err = e
            continue
    if last_err is not None:
        fail.append((name, str(last_err)[:80]))

print("=== 下载结果 ===")
for n, s, t in ok:
    print(f"  OK  {n:18} {s:>10} bytes  {t}")
for n, e in fail:
    print(f"  ERR {n:18} {e}")
print(f"\nOK={len(ok)} FAIL={len(fail)}")