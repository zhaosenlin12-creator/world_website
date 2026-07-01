const s = require("fs").readFileSync("D:/kaifa_stu/world_website/src/data/bodies.ts", "utf8");
const n = s.match(/symbol: "[^"]*"/g);
console.log(n.join("\n"));
