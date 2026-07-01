const fs = require("fs");
const path = "D:/kaifa_stu/world_website/src/data/bodies.ts";
let s = fs.readFileSync(path, "utf8");
const emj = { sun: "☀️", earth: "🌍", makemake: "🪐", haumea: "🪐", eris: "🪐", mercury: "☿", venus: "♀", mars: "♂", jupiter: "♃", saturn: "♄", uranus: "♅", neptune: "♆", pluto: "♇", ceres: "⚶" };
// Match the whole id/emoji block
const re = /(id:\s*"(sun|earth|mercury|venus|mars|jupiter|saturn|uranus|neptune|pluto|ceres|makemake|haumea|eris)"[\s\S]*?emoji:\s*)"[^"]*"/g;
const out = s.replace(re, function(m, prefix, id) {
  return prefix + '"' + emj[id] + '"';
});
fs.writeFileSync(path, out, "utf8");
console.log("done. replacements: ", (s.match(re) || []).length);
