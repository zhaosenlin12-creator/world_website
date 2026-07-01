const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

const OUT = path.join(__dirname, "screenshots");
fs.mkdirSync(OUT, { recursive: true });

const pages = [
  { url: "http://localhost:3000/", name: "01-home", wait: 3000 },
  { url: "http://localhost:3000/explore", name: "02-explore", wait: 6000 },
  { url: "http://localhost:3000/planets", name: "03-planets", wait: 2000 },
  { url: "http://localhost:3000/planets/earth", name: "04-planet-earth", wait: 3000 },
  { url: "http://localhost:3000/planets/jupiter", name: "05-planet-jupiter", wait: 3000 },
  { url: "http://localhost:3000/planets/saturn", name: "06-planet-saturn", wait: 3000 },
  { url: "http://localhost:3000/facts", name: "07-facts", wait: 2000 },
  { url: "http://localhost:3000/missions", name: "08-missions", wait: 2000 },
  { url: "http://localhost:3000/stories", name: "09-stories", wait: 2000 },
  { url: "http://localhost:3000/about", name: "10-about", wait: 2000 }
];

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--use-gl=swiftshader", "--enable-webgl"]
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  for (const p of pages) {
    console.log("loading", p.url);
    try {
      await page.goto(p.url, { waitUntil: "networkidle0", timeout: 30000 });
      await new Promise((r) => setTimeout(r, p.wait));
      await page.screenshot({ path: path.join(OUT, p.name + ".png"), fullPage: false });
      console.log("  ok");
    } catch (e) {
      console.log("  !", e.message);
    }
  }
  await browser.close();
  console.log("DONE");
})();
