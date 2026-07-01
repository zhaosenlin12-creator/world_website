const fs = require("fs");
const path = "D:/kaifa_stu/world_website/src/data/bodies.ts";
let s = fs.readFileSync(path, "utf8");

// Fix broken strings: "X" -> "X" with X being a single char/emoji that got mangled into "????" or ""x""
function fix(s, regex, replacement) {
  return s.replace(regex, replacement);
}

// Find emoji/symbol values that contain replacement chars or are obviously broken
// 1. emoji field - rebuild
const emj = { sun: "☀️", earth: "🌍", makemake: "🪐", haumea: "🪐", eris: "🪐", mercury: "☿", venus: "♀", mars: "♂", jupiter: "♃", saturn: "♄", uranus: "♅", neptune: "♆", pluto: "♇", ceres: "⚶" };
s = s.replace(/(id:\s*"(sun|earth|mercury|venus|mars|jupiter|saturn|uranus|neptune|pluto|ceres|makemake|haumea|eris)"[\s\S]*?emoji:\s*)[^\n,]+,/g, function(m, prefix) {
  const id = m.match(/id:\s*"([^"]+)"/)[1];
  return prefix + '"' + emj[id] + '",';
});

// 2. symbol field
const sym = { sun: "☉", earth: "⊕", mercury: "☿", venus: "♀", mars: "♂", jupiter: "♃", saturn: "♄", uranus: "♅", neptune: "♆", pluto: "♇", ceres: "⚶", makemake: "🪐", haumea: "🪐", eris: "🪐" };
s = s.replace(/(id:\s*"(sun|earth|mercury|venus|mars|jupiter|saturn|uranus|neptune|pluto|ceres|makemake|haumea|eris)"[\s\S]*?symbol:\s*)[^\n,]+,/g, function(m, prefix) {
  const id = m.match(/id:\s*"([^"]+)"/)[1];
  return prefix + '"' + sym[id] + '",';
});

fs.writeFileSync(path, s, "utf8");
console.log("done");
