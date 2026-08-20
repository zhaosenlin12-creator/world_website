const puppeteer = require("puppeteer-core");
const fs = require("fs");

(async () => {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  page.on("console", msg => console.log("PAGE [" + msg.type() + "]:", msg.text().slice(0, 250)));
  page.on("pageerror", err => console.log("PAGE-ERROR:", err.message.slice(0, 250)));
  page.on("requestfailed", req => console.log("REQ-FAIL:", req.url(), req.failure().errorText));
  await page.goto("https://world-website.pages.dev/resources/", { waitUntil: "domcontentloaded", timeout: 30000 });
  await new Promise(r => setTimeout(r, 20000));
  await browser.close();
})();