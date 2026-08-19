const puppeteer = require("puppeteer-core");
(async () => {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    headless: "new",
    timeout: 20000,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--use-gl=swiftshader"]
  });
  const page = await browser.newPage();
  page.on("pageerror", e => console.log("[pageerror]", e.message.slice(0, 500)));
  page.on("console", m => console.log("[" + m.type() + "]", m.text().slice(0, 400)));
  await page.goto("https://zhaosenlin12-creator.github.io/world_website/", { waitUntil: "load", timeout: 30000 });
  await new Promise(r => setTimeout(r, 5000));
  await browser.close();
})().catch(e => { console.error("ERR:", e.message); process.exit(1); });
