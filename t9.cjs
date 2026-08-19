const puppeteer = require("puppeteer-core");
(async () => {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    headless: "new",
    timeout: 30000,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--use-gl=swiftshader", "--disable-dev-shm-usage"]
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(30000);
  page.on("pageerror", e => console.log("[pageerror]", e.message));
  page.on("response", r => {
    const u = r.url();
    if (u.includes("/_next/static/chunks/") && !u.includes("polyfills")) {
      console.log("[chunk]", r.status(), u.replace("https://466292bc.world-website.pages.dev/_next/static/chunks/", ""));
    }
  });
  await page.goto("https://466292bc.world-website.pages.dev/", { waitUntil: "load", timeout: 30000 });
  console.log("=== After load ===");
  // Try dynamic import directly
  const result = await page.evaluate(async () => {
    try {
      // Find webpack require
      const w = window;
      const requireChunks = Object.keys(w).filter(k => k.startsWith("webpackChunk"));
      console.log("webpackChunks:", requireChunks);
      // Try the loadable promise
      const allCanvases = document.querySelectorAll("canvas").length;
      return { webpackChunks: requireChunks.length, canvases: allCanvases };
    } catch (e) { return { error: e.message }; }
  });
  console.log("INFO:", JSON.stringify(result));
  await new Promise(r => setTimeout(r, 5000));
  const after = await page.evaluate(() => ({ canvases: document.querySelectorAll("canvas").length }));
  console.log("After 5s:", JSON.stringify(after));
  await browser.close();
})().catch(e => { console.error("ERR:", e.message); process.exit(1); });
