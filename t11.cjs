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
  page.on("console", m => { if (m.type() === "error") console.log("[error]", m.text()); });
  await page.goto("https://646ba263.world-website.pages.dev/", { waitUntil: "domcontentloaded", timeout: 30000 });
  console.log("loaded");
  await new Promise(r => setTimeout(r, 18000));
  const info = await page.evaluate(() => {
    const canvases = Array.from(document.querySelectorAll("canvas"));
    return {
      canvases: canvases.length,
      detail: canvases.map((c, i) => ({
        idx: i,
        className: c.className,
        attrW: c.width,
        attrH: c.height,
        clientW: c.clientWidth,
        clientH: c.clientHeight,
        parentClass: c.parentElement?.className,
        grandClass: c.parentElement?.parentElement?.className
      }))
    };
  });
  console.log("INFO:", JSON.stringify(info, null, 2));
  await page.screenshot({ path: "C:\\kaifa\\world_website\\hero-fix2.png", fullPage: false });
  await browser.close();
  console.log("DONE");
})().catch(e => { console.error("ERR:", e.message); process.exit(1); });
