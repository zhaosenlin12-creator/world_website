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
  page.on("response", r => {
    const u = r.url();
    if (u.includes("/_next/static/chunks/") && !u.includes("polyfills") && !u.includes("webpack") && !u.includes("main-app") && !u.includes("main-") && !u.includes("framework")) {
      console.log("[chunk]", r.status(), u.split("/").slice(-1)[0]);
    }
  });
  await page.goto("https://466292bc.world-website.pages.dev/", { waitUntil: "load", timeout: 30000 });
  await new Promise(r => setTimeout(r, 15000));
  await browser.close();
})().catch(e => { console.error("ERR:", e.message); process.exit(1); });
