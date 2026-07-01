const puppeteer = require("puppeteer");
(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle0", timeout: 30000 });
  await new Promise((r) => setTimeout(r, 5000));
  await page.screenshot({ path: "D:/kaifa_stu/world_website/scraper/screenshots/debug.png", fullPage: false });
  // Get the body HTML
  const html = await page.content();
  console.log("len html:", html.length);
  // Check title
  const title = await page.title();
  console.log("title:", title);
  await browser.close();
  console.log("DONE");
})();
