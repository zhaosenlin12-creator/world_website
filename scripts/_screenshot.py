import asyncio, sys, time
from pathlib import Path
from puppeteer_core import launch

OUT_DIR = Path("verify_screens")
OUT_DIR.mkdir(exist_ok=True)

PAGES = [
    ("home", "http://localhost:3010/"),
    ("resources", "http://localhost:3010/resources/"),
    ("stories", "http://localhost:3010/stories/"),
    ("planets_earth", "http://localhost:3010/planets/earth/"),
    ("explore", "http://localhost:3010/explore/"),
]

async def main():
    browser = await launch(
        executablePath=r"C:\Program Files (x86)\Microsoft\Edge\Application\ms",
        headless=True,
        args=["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    )
    page = await browser.newPage()
    await page.setViewport({"width": 1440, "height": 900})
    for name, url in PAGES:
        try:
            t0 = time.time()
            await page.goto(url, waitUntil="networkidle0", timeout=30000)
            await page.waitForTimeout(2000)
            path = OUT_DIR / f"{name}.png"
            await page.screenshot({"path": str(path), "fullPage": False})
            print(f"OK {name:18} {time.time()-t0:.1f}s {path}")
        except Exception as e:
            print(f"ERR {name}: {type(e).__name__}: {str(e)[:80]}")
    await browser.close()

asyncio.run(main())