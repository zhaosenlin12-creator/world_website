const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");
fs.mkdirSync("scripts/screenshots", { recursive: true });
const OUT = path.join("scraper", "screenshots");
(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--use-gl=swiftshader", "--enable-webgl"]
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto("http://localhost:3000/explore", { waitUntil: "networkidle0", timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));
  const buttons = await page.$$("button");
  for (let i = 0; i < buttons.length; i++) {
    const txt = await page.evaluate(el => el.textContent, buttons[i]);
    if (txt && txt.includes("火星")) { await buttons[i].click(); break; }
  }
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(OUT, "11-mars-panel.png") });
  for (let i = 0; i < buttons.length; i++) {
    const txt = await page.evaluate(el => el.textContent, buttons[i]);
    if (txt && txt.includes("木星")) { await buttons[i].click(); break; }
  }
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(OUT, "12-jupiter-panel.png") });
  await browser.close();
  console.log("ok");
})();