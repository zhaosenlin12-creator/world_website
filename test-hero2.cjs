const puppeteer = require("puppeteer-core");
(async () => {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--disable-dev-shm-usage"]
  });
  const page = await browser.newPage();
  const logs = [];
  page.on("console", m => logs.push({ type: m.type(), text: m.text() }));
  page.on("pageerror", e => logs.push({ type: "pageerror", text: e.message + " | " + e.stack }));
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto("https://ac0b45df.world-website.pages.dev/", { waitUntil: "networkidle2", timeout: 60000 });
  await new Promise(r => setTimeout(r, 10000));
  // Look for Hero3DScene chunk info
  const heroState = await page.evaluate(() => {
    const section = document.querySelector("section");
    if (!section) return { section: null };
    const html = section.innerHTML.slice(0, 4000);
    return {
      sectionExists: !!section,
      sectionHTML: html,
      absoluteCanvas: Array.from(document.querySelectorAll("div.absolute.inset-0")).map(d => ({ html: d.outerHTML.slice(0, 300) }))
    };
  });
  console.log("=== Hero section HTML ===");
  console.log(heroState.sectionHTML);
  console.log("\n=== absolute inset-0 divs ===");
  console.log(JSON.stringify(heroState.absoluteCanvas, null, 2));
  console.log("\n=== All logs ===");
  logs.forEach(l => console.log("[" + l.type + "]", l.text));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
