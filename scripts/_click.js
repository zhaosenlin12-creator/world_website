const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");
fs.mkdirSync("scraper/screenshots", { recursive: true });
const OUT = path.join("scraper", "screenshots");

async function clickByText(page, text) {
  for (let i = 0; i < 15; i++) {
    try {
      const handle = await page.evaluateHandle((t) => {
        const buttons = Array.from(document.querySelectorAll("button"));
        return buttons.find((b) => b.textContent && b.textContent.includes(t));
      }, text);
      const el = handle.asElement();
      if (el) {
        await el.click();
        return true;
      }
    } catch (e) { /* ignore */ }
    await new Promise(r => setTimeout(r, 400));
  }
  return false;
}

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--use-gl=swiftshader", "--enable-webgl"]
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  page.on("pageerror", e => console.log("ERR:", e.message.slice(0, 200)));
  page.on("requestfailed", req => console.log("FAIL:", req.url().slice(0, 100), req.failure()?.errorText));
  await page.goto("http://localhost:3000/explore", { waitUntil: "domcontentloaded", timeout: 60000 });
  await new Promise(r => setTimeout(r, 4500));
  await page.screenshot({ path: path.join(OUT, "02-explore.png") });
  console.log("--- click 火星");
  if (await clickByText(page, "火星")) {
    await new Promise(r => setTimeout(r, 3500));
    await page.screenshot({ path: path.join(OUT, "11-mars-panel.png") });
    console.log("ok mars");
  } else {
    console.log("FAIL: 火星 button not found");
  }
  console.log("--- click 木星");
  if (await clickByText(page, "木星")) {
    await new Promise(r => setTimeout(r, 3500));
    await page.screenshot({ path: path.join(OUT, "12-jupiter-panel.png") });
    console.log("ok jupiter");
  } else {
    console.log("FAIL: 木星 button not found");
  }
  console.log("--- click 太阳");
  if (await clickByText(page, "太阳")) {
    await new Promise(r => setTimeout(r, 3500));
    await page.screenshot({ path: path.join(OUT, "13-sun-panel.png") });
    console.log("ok sun");
  }
  console.log("--- click 土星");
  if (await clickByText(page, "土星")) {
    await new Promise(r => setTimeout(r, 3500));
    await page.screenshot({ path: path.join(OUT, "14-saturn-panel.png") });
    console.log("ok saturn");
  }
  console.log("--- click 地球");
  if (await clickByText(page, "地球")) {
    await new Promise(r => setTimeout(r, 3500));
    await page.screenshot({ path: path.join(OUT, "15-earth-panel.png") });
    console.log("ok earth");
  }
  await browser.close();
  console.log("done");
})();