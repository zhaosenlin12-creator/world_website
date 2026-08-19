"""Download NASA 3D Resources GLB + image assets referenced in data/nasa3d.json.

Usage:
    python scripts/fetch_nasa_3d.py [--json PATH] [--out-dir DIR]
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from urllib.parse import unquote, urlparse

import requests

DEFAULT_TIMEOUT = 60


def safe_filename(url: str, suffix: str) -> str:
    parsed = urlparse(url)
    name = unquote(Path(parsed.path).name)
    if not name:
        name = "model"
    name = re.sub(r"\s+", "-", name)
    if not name.lower().endswith("." + suffix.lstrip(".")):
        name = name + "." + suffix.lstrip(".")
    return name


def download(url: str, dest: Path, label: str) -> bool:
    if dest.exists():
        print(f"  - exists {dest.name}")
        return True
    try:
        with requests.get(url, stream=True, timeout=DEFAULT_TIMEOUT, allow_redirects=True) as resp:
            resp.raise_for_status()
            with dest.open("wb") as fh:
                for chunk in resp.iter_content(chunk_size=8192):
                    if chunk:
                        fh.write(chunk)
        size_kb = dest.stat().st_size // 1024
        print(f"  + {dest.name} ({size_kb} KB)")
        return True
    except Exception as exc:
        print(f"  ! {label}: {exc}", file=sys.stderr)
        return False


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--json", type=str, default="data/nasa3d.json")
    parser.add_argument("--out-dir", type=str, default="public/assets/models/nasa")
    args = parser.parse_args()

    json_path = Path(args.json)
    if not json_path.exists():
        print(f"Missing {json_path}; run scripts/scrape_nasa_3d.py first.", file=sys.stderr)
        return 1
    entries = json.loads(json_path.read_text(encoding="utf-8"))
    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    print(f"Downloading {len(entries)} entries into {out_dir}")
    failures = 0
    for entry in entries:
        slug = entry["slug"]
        slug_dir = out_dir / slug
        slug_dir.mkdir(parents=True, exist_ok=True)
        print(f"[{slug}]")
        glb_url = entry.get("glb", "")
        if glb_url:
            name = safe_filename(glb_url, "glb")
            if not download(glb_url, slug_dir / name, "glb"):
                failures += 1
        image_url = entry.get("image", "")
        if image_url:
            suffix = Path(urlparse(image_url).path).suffix.lstrip(".") or "png"
            name = safe_filename(image_url, suffix)
            if not download(image_url, slug_dir / name, "image"):
                failures += 1
    if failures:
        print(f"{failures} download failure(s).", file=sys.stderr)
        return 1
    print("All downloads complete.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
