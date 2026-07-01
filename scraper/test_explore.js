const puppeteer = require("puppeteer");
(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto("http://localhost:3000/explore", { waitUntil: "networkidle0" });
  await new Promise(r => setTimeout(r, 5000));
  // Click "Earth" in the side list
  const clicked = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const earth = buttons.find(b => b.textContent.includes("Earth"));
    if (earth) { earth.click(); return true; }
    return false;
  });
  console.log("clicked earth:", clicked);
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: "D:/kaifa_stu/world_website/scraper/screenshots/11-explore-earth-panel.png" });
  // Check if panel opened
  const panel = await page.evaluate(() => {
    const aside = document.querySelector("aside");
    return aside ? aside.textContent.substring(0, 200) : "no aside";
  });
  console.log("panel:", panel);
  await browser.close();
})();
