const puppeteer = require("puppeteer-core");
const fs = require("fs");

(async () => {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto("https://world-website.pages.dev/resources/", { waitUntil: "domcontentloaded", timeout: 30000 });
  // Wait until loader hides, max 45s
  const maxWait = Date.now() + 45000;
  let captured = false;
  while (Date.now() < maxWait) {
    const hasLoader = await page.evaluate(() => {
      const els = document.querySelectorAll(".fixed.inset-0.z-\\[100\\]");
      for (const el of els) {
        const op = el.style.opacity || getComputedStyle(el).opacity;
        if (op && parseFloat(op) > 0.1) return true;
      }
      return false;
    });
    if (!hasLoader) {
      captured = true;
      break;
    }
    await new Promise(r => setTimeout(r, 500));
  }
  await new Promise(r => setTimeout(r, 3000));
  await page.screenshot({ path: "verify_screens_live/resources_final.png", fullPage: false });
  console.log("DONE captured=" + captured + " time=" + Date.now());
  await browser.close();
})();