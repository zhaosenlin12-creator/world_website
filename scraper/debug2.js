const puppeteer = require("puppeteer");
(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle0" });
  await new Promise(r => setTimeout(r, 5000));
  // Check loader
  const loader = await page.evaluate(() => {
    const el = document.querySelector(".fixed.inset-0.z-\\[100\\]");
    if (!el) return "no loader element";
    return { display: getComputedStyle(el).display, opacity: getComputedStyle(el).opacity, html: el.outerHTML.substring(0, 200) };
  });
  console.log("loader:", loader);
  // Check main content
  const main = await page.evaluate(() => {
    const el = document.querySelector("main");
    return el ? el.outerHTML.substring(0, 500) : "no main";
  });
  console.log("main:", main);
  // Check body html size
  const h1 = await page.evaluate(() => {
    const h = document.querySelector("h1");
    return h ? h.textContent : "no h1";
  });
  console.log("h1:", h1);
  await browser.close();
})();
