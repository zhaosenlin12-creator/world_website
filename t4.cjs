const puppeteer = require("puppeteer-core");
(async () => {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    headless: "new",
    timeout: 20000,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--use-gl=swiftshader", "--disable-dev-shm-usage"]
  });
  console.log("OK launch");
  const page = await browser.newPage();
  page.setDefaultTimeout(15000);
  page.on("pageerror", e => console.log("[pageerror]", e.message));
  page.on("console", m => { if (m.type() === "error") console.log("[error]", m.text()); });
  await page.goto("https://466292bc.world-website.pages.dev/", { waitUntil: "load", timeout: 20000 });
  console.log("OK load");
  await new Promise(r => setTimeout(r, 12000));
  const info = await page.evaluate(() => ({ canvases: document.querySelectorAll("canvas").length, h1: document.querySelector("h1")?.innerText }));
  console.log("INFO:", JSON.stringify(info));
  await page.screenshot({ path: "C:\\kaifa\\world_website\\hero-prod.png", fullPage: false });
  await browser.close();
  console.log("DONE");
})().catch(e => { console.error("ERR:", e.message); process.exit(1); });
