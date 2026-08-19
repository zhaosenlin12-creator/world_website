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
  await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded", timeout: 30000 });
  await new Promise(r => setTimeout(r, 12000));
  await page.screenshot({ path: "C:\\kaifa\\world_website\\hero-dev.png", fullPage: false });
  await browser.close();
})().catch(e => { console.error("ERR:", e.message); process.exit(1); });
