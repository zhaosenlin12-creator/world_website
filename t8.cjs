const puppeteer = require("puppeteer-core");
(async () => {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    headless: "new",
    timeout: 30000,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--ignore-gpu-blocklist", "--enable-features=Vulkan", "--disable-dev-shm-usage"]
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(20000);
  await page.goto("https://466292bc.world-website.pages.dev/", { waitUntil: "domcontentloaded", timeout: 30000 });
  await new Promise(r => setTimeout(r, 15000));
  const info = await page.evaluate(() => {
    const canvases = Array.from(document.querySelectorAll("canvas"));
    return {
      canvases: canvases.length,
      webgl: (() => {
        const c = document.createElement("canvas");
        const gl = c.getContext("webgl2") || c.getContext("webgl");
        return gl ? gl.getParameter(gl.VERSION) : "no webgl";
      })(),
      rootHtml: document.querySelector("main section")?.outerHTML?.slice(0, 500)
    };
  });
  console.log("INFO:", JSON.stringify(info, null, 2));
  await page.screenshot({ path: "C:\\kaifa\\world_website\\hero-prod2.png", fullPage: false });
  await browser.close();
})().catch(e => { console.error("ERR:", e.message); process.exit(1); });
