const puppeteer = require("puppeteer-core");
(async () => {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    headless: "new",
    timeout: 30000,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--use-gl=swiftshader", "--disable-dev-shm-usage"]
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(20000);
  page.on("pageerror", e => console.log("[pageerror]", e.message));
  await page.goto("https://646ba263.world-website.pages.dev/", { waitUntil: "domcontentloaded", timeout: 30000 });
  console.log("loaded");
  await new Promise(r => setTimeout(r, 18000));
  const info = await page.evaluate(() => ({
    canvases: document.querySelectorAll("canvas").length,
    h1: document.querySelector("h1")?.innerText
  }));
  console.log("INFO:", JSON.stringify(info));
  await page.screenshot({ path: "C:\\kaifa\\world_website\\hero-fix.png", fullPage: false });
  await browser.close();
  console.log("DONE");
})().catch(e => { console.error("ERR:", e.message); process.exit(1); });
