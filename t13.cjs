const puppeteer = require("puppeteer-core");
(async () => {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    headless: "new",
    timeout: 30000,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--use-gl=swiftshader", "--disable-dev-shm-usage"]
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  page.on("pageerror", e => console.log("[pageerror]", e.message));
  page.on("console", m => console.log("[" + m.type() + "]", m.text().slice(0, 250)));
  page.on("requestfailed", r => { if (!r.url().includes(".mp4")) console.log("[reqfail]", r.url().slice(-80), r.failure().errorText); });
  await page.goto("https://646ba263.world-website.pages.dev/", { waitUntil: "load", timeout: 30000 });
  console.log("loaded");
  await new Promise(r => setTimeout(r, 15000));
  await browser.close();
})().catch(e => { console.error("ERR:", e.message); process.exit(1); });
