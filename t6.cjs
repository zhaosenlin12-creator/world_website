const puppeteer = require("puppeteer-core");
(async () => {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    headless: "new",
    timeout: 30000,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--use-gl=swiftshader", "--disable-dev-shm-usage"]
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(20000);
  page.on("pageerror", e => console.log("[pageerror]", e.message));
  page.on("console", m => console.log("[" + m.type() + "]", m.text().slice(0, 300)));
  page.on("response", r => {
    if (r.url().includes("Hero3D") || r.url().includes("chunks/b536a0f1") || r.url().includes("chunks/291") || r.url().includes("chunks/283") || r.url().includes("chunks/574")) {
      console.log("[response]", r.status(), r.url().slice(-80));
    }
  });
  page.on("requestfailed", r => console.log("[reqfail]", r.url().slice(-80), r.failure().errorText));
  await page.goto("https://466292bc.world-website.pages.dev/", { waitUntil: "domcontentloaded", timeout: 30000 });
  await new Promise(r => setTimeout(r, 15000));
  await browser.close();
})().catch(e => { console.error("ERR:", e.message); process.exit(1); });
