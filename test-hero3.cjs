const puppeteer = require("puppeteer-core");
(async () => {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--disable-dev-shm-usage"]
  });
  const page = await browser.newPage();
  const requests = [];
  const failures = [];
  page.on("request", r => {
    if (r.url().includes("chunks") || r.url().includes("Hero") || r.url().includes(".glb") || r.url().includes(".jpg")) {
      requests.push({ url: r.url(), method: r.method() });
    }
  });
  page.on("requestfailed", r => failures.push({ url: r.url(), error: r.failure().errorText, resourceType: r.resourceType() }));
  page.on("response", r => {
    if (r.url().includes("chunks") || r.url().includes("Hero") || r.url().includes(".glb") || r.url().includes(".jpg")) {
      requests.push({ url: r.url(), status: r.status() });
    }
  });
  page.on("console", m => console.log("[" + m.type() + "]", m.text()));
  page.on("pageerror", e => console.log("[pageerror]", e.message));
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto("https://ac0b45df.world-website.pages.dev/", { waitUntil: "networkidle2", timeout: 60000 });
  await new Promise(r => setTimeout(r, 12000));
  // Try to fetch chunk via window
  const chunkInfo = await page.evaluate(async () => {
    try {
      const m = await import("/_next/static/chunks/291.386bde44b9bb4191.js");
      return { keys: Object.keys(m), hasHero3DScene: "Hero3DScene" in m, hero3DSceneType: typeof m.Hero3DScene };
    } catch (e) {
      return { error: e.message };
    }
  });
  console.log("\n=== Chunk import test ===");
  console.log(JSON.stringify(chunkInfo, null, 2));
  console.log("\n=== Requested chunks/files ===");
  requests.forEach(r => console.log(JSON.stringify(r)));
  console.log("\n=== Failed requests ===");
  failures.forEach(f => console.log(JSON.stringify(f)));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
