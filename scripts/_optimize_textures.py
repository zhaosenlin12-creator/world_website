#!/usr/bin/env python3
"""压缩超大NASA图片, 保持画质的同时让 web 加载友好."""
from PIL import Image
from pathlib import Path
import os

OUT = Path("public/assets/textures")
TARGETS = [
    "sun.jpg","mercury.jpg","venus.jpg","earth.jpg","moon.jpg","mars.jpg",
    "jupiter.jpg","saturn.jpg","saturn_ring.jpg","uranus.jpg","neptune.webp",
    "pluto.jpg","ceres.jpg",
]

MAX_DIM = 1024  # 卡片/纹理最大边
JPEG_QUALITY = 78
WEBP_QUALITY = 80

for name in TARGETS:
    p = OUT / name
    if not p.exists():
        print(f"MISSING {name}")
        continue
    try:
        im = Image.open(p)
        if im.mode not in ("RGB", "RGBA"):
            im = im.convert("RGB")
        w, h = im.size
        # 缩放
        if max(w, h) > MAX_DIM:
            ratio = MAX_DIM / max(w, h)
            new_size = (int(w * ratio), int(h * ratio))
            im = im.resize(new_size, Image.LANCZOS)
        # 保存为 JPG 或 WebP
        if name.endswith(".webp"):
            stem = p.with_suffix(".webp")
            tmp = OUT / (name + ".tmp.jpg")
            im.save(tmp, "JPEG", quality=JPEG_QUALITY, optimize=True, progressive=True)
            tmp.replace(stem.with_suffix(".jpg"))  # 改存为 jpg, 避免浏览器不识别 webp
            # 同时输出 webp 版本
            im.save(stem, "WEBP", quality=WEBP_QUALITY, method=6)
            print(f"{name:18} -> jpg+webp")
        else:
            im.save(p, "JPEG", quality=JPEG_QUALITY, optimize=True, progressive=True)
        sz = p.stat().st_size
        print(f"{name:18} -> {im.size} {sz} bytes")
    except Exception as e:
        print(f"ERR {name}: {e}")