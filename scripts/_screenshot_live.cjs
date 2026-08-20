const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");

const OUT_DIR = "verify_screens_live";
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const PAGES = [
  ["home", "https://world-website.pages.dev/"],
  ["resources", "https://world-website.pages.dev/resources/"],
  ["stories", "https://world-website.pages.dev/stories/"],
  ["planets_earth", "https://world-website.pages.dev/planets/earth/"],
  ["planets_jupiter", "https://world-website.pages.dev/planets/jupiter/"],
  ["explore", "https://world-website.pages.dev/explore/"],
  ["missions", "https://world-website.pages.dev/missions/"]
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
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
      await new Promise(r => setTimeout(r, 4500));
      const outPath = path.join(OUT_DIR, name + ".png");
      await page.screenshot({ path: outPath, fullPage: false });
      console.log("OK " + name.padEnd(20) + ((Date.now() - t0) / 1000).toFixed(1) + "s " + outPath);
    } catch (e) {
      console.log("ERR " + name + ": " + e.message.slice(0, 100));
    }
  }
  await browser.close();
})();