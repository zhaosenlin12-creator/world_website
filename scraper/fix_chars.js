const fs = require("fs");
const p = "D:/kaifa_stu/world_website/src/data/bodies.ts";
let s = fs.readFileSync(p, "utf8");

// All replacements: original -> replacement
const fixes = [
  ["\u2026", "\u2014"],   // em-dash: power shell wrote 鈥? actually the broken string is the 3-char sequence "鈥? which is 0x3D 0x9F 0x3F? not 0x2026. Let me check
];

fs.writeFileSync(p, s, "utf8");
console.log("done");
