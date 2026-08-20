const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");

const OUT_DIR = "verify_screens_live";
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const PAGES = [
  ["home_final", "https://world-website.pages.dev/"],
  ["stories_final", "https://world-website.pages.dev/stories/"],
  ["planets_earth_final", "https://world-website.pages.dev/planets/earth/"],
  ["planets_jupiter_final", "https://world-website.pages.dev/planets/jupiter/"],
  ["planets_saturn_final", "https://world-website.pages.dev/planets/saturn/"],
  ["explore_final", "https://world-website.pages.dev/explore/"]
];

(async () => {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  for (const [name, url] of PAGES) {
    try {
      const t0 = Date.now();
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
      // Wait for loader to clear (max 40s)
      const maxWait = Date.now() + 40000;
      while (Date.now() < maxWait) {
        const hidden = await page.evaluate(() => {
          const els = document.querySelectorAll(".fixed.inset-0.z-\\[100\\]");
          for (const el of els) {
            const op = el.style.opacity || getComputedStyle(el).opacity;
            if (op && parseFloat(op) > 0.1) return false;
          }
          return true;
        });
        if (hidden) break;
        await new Promise(r => setTimeout(r, 500));
      }
      await new Promise(r => setTimeout(r, 3000));
      const outPath = path.join(OUT_DIR, name + ".png");
      await page.screenshot({ path: outPath, fullPage: false });
      console.log("OK " + name.padEnd(28) + ((Date.now() - t0) / 1000).toFixed(1) + "s");
    } catch (e) {
      console.log("ERR " + name + ": " + e.message.slice(0, 100));
    }
  }
  await browser.close();
})();