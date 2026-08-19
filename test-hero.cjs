const puppeteer = require("puppeteer-core");
(async () => {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--disable-dev-shm-usage"]
  });
  const page = await browser.newPage();
  const errors = [];
  page.on("console", m => console.log("[console]", m.type(), m.text()));
  page.on("pageerror", e => errors.push("PAGEERROR: " + e.message));
  page.on("requestfailed", r => errors.push("REQFAIL: " + r.url() + " - " + r.failure().errorText));
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto("https://ac0b45df.world-website.pages.dev/", { waitUntil: "networkidle2", timeout: 60000 });
  await new Promise(r => setTimeout(r, 8000));
  const stats = await page.evaluate(() => {
    const canvases = Array.from(document.querySelectorAll("canvas"));
    const hero = document.querySelector("section");
    return {
      canvasCount: canvases.length,
      canvases: canvases.map((c, i) => ({ idx: i, w: c.width, h: c.height, css: c.getBoundingClientRect(), parent: c.parentElement && c.parentElement.tagName + (c.parentElement.className ? "." + c.parentElement.className.split(" ").slice(0,2).join(".") : ""), className: c.className, ariaHidden: c.getAttribute("aria-hidden") })),
      heroSection: hero ? hero.getBoundingClientRect() : null,
      docTitle: document.title,
      bodyClasses: document.body.className,
      h1Text: document.querySelector("h1") && document.querySelector("h1").innerText
    };
  });
  console.log(JSON.stringify(stats, null, 2));
  console.log("\nERRORS:");
  errors.forEach(e => console.log(" ", e));
  await page.screenshot({ path: "C:\\kaifa\\world_website\\hero-test.png", fullPage: false });
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
