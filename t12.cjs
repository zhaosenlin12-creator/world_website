const puppeteer = require("puppeteer-core");
(async () => {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    headless: "new",
    timeout: 30000,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--use-gl=swiftshader", "--disable-dev-shm-usage"]
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });
  page.setDefaultTimeout(20000);
  page.on("pageerror", e => console.log("[pageerror]", e.message));
  page.on("console", m => console.log("[" + m.type() + "]", m.text().slice(0, 200)));
  await page.goto("https://646ba263.world-website.pages.dev/", { waitUntil: "domcontentloaded", timeout: 30000 });
  for (const t of [3, 5, 8, 12, 18]) {
    await new Promise(r => setTimeout(r, t === 3 ? 3000 : 3000));
    const info = await page.evaluate(() => ({
      canvases: document.querySelectorAll("canvas").length,
      section: document.querySelector("section")?.firstElementChild?.outerHTML?.slice(0, 200)
    }));
    console.log(`t=${t}s`, JSON.stringify(info));
  }
  await page.screenshot({ path: "C:\\kaifa\\world_website\\hero-fix3.png", fullPage: false });
  await browser.close();
})().catch(e => { console.error("ERR:", e.message); process.exit(1); });
