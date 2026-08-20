const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");

const OUT_DIR = "verify_screens_live";
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const PAGES = [
  ["home_v2", "https://world-website.pages.dev/"],
  ["resources_v2", "https://world-website.pages.dev/resources/"]
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
      // Just goto without waiting for full load
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
      // Wait until loader hides (or 20s timeout)
      const maxWait = Date.now() + 25000;
      while (Date.now() < maxWait) {
        const hasLoader = await page.evaluate(() => {
          const loaders = document.querySelectorAll(".fixed.inset-0.z-\\[100\\]");
          for (const el of loaders) {
            const op = el.style.opacity || getComputedStyle(el).opacity;
            if (op && parseFloat(op) > 0.1) return true;
          }
          return false;
        });
        if (!hasLoader) break;
        await new Promise(r => setTimeout(r, 500));
      }
      // Final settle
      await new Promise(r => setTimeout(r, 2000));
      const outPath = path.join(OUT_DIR, name + ".png");
      await page.screenshot({ path: outPath, fullPage: false });
      console.log("OK " + name.padEnd(20) + ((Date.now() - t0) / 1000).toFixed(1) + "s");
    } catch (e) {
      console.log("ERR " + name + ": " + e.message.slice(0, 100));
    }
  }
  await browser.close();
})();