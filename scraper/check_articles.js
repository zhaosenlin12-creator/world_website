const fs = require("fs");
const s = fs.readFileSync("D:/kaifa_stu/world_website/data/articles.json", "utf8");
try {
  const arr = JSON.parse(s);
  console.log("total articles:", arr.length);
  const valid = arr.filter(a => a.title && !/Page not found/i.test(a.title));
  console.log("valid (non-404):", valid.length);
  const bySlug = {};
  for (const a of valid) {
    const root = a.slug.split("/")[0];
    bySlug[root] = (bySlug[root] || 0) + 1;
  }
  console.log("by slug root:", bySlug);
} catch (e) {
  console.log("parse error:", e.message);
}
