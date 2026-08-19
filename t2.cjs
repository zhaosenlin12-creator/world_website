const puppeteer = require("puppeteer-core");
(async () => {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    headless: "new",
    timeout: 30000,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--use-gl=swiftshader", "--disable-dev-shm-usage"]
  });
  const page = await browser.newPage();
  const errors = [];
  const warnings = [];
  page.on("pageerror", e => errors.push("PAGEERROR: " + e.message + " | " + (e.stack || "").split("\n").slice(0, 3).join("\n")));
  page.on("console", m => {
    if (m.type() === "error") errors.push("ERROR: " + m.text());
    if (m.type() === "warning" && /chunk|Hero|module/i.test(m.text())) warnings.push("WARN: " + m.text());
  });
  page.on("requestfailed", r => errors.push("REQFAIL: " + r.url() + " " + r.failure().errorText));
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto("https://ac0b45df.world-website.pages.dev/", { waitUntil: "networkidle2", timeout: 60000 });
  await new Promise(r => setTimeout(r, 15000));
  const info = await page.evaluate(() => {
    return {
      totalCanvases: document.querySelectorAll("canvas").length,
      chunkLoaded: !!window.__NEXT_DATA__,
    };
  });
  console.log("INFO:", JSON.stringify(info));
  console.log("\n=== ERRORS ===");
  errors.forEach(e => console.log(e));
  console.log("\n=== WARNINGS ===");
  warnings.forEach(w => console.log(w));
  await browser.close();
})().catch(e => { console.error("ERR:", e.message); process.exit(1); });
