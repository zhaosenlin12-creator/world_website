const fs = require("fs");
const p = "D:/kaifa_stu/world_website/src/data/bodies.ts";
let s = fs.readFileSync(p, "utf8");
// belt/kuiper/oort symbol fix
const sym2 = { "asteroid-belt": "•", "kuiper-belt": "•", "oort-cloud": "•" };
s = s.replace(/(id:\s*"(asteroid-belt|kuiper-belt|oort-cloud)"[\s\S]*?symbol:\s*)[^\n,]+,/g, function(m, prefix) {
  const id = m.match(/id:\s*"([^"]+)"/)[1];
  return prefix + '"' + sym2[id] + '",';
});
fs.writeFileSync(p, s, "utf8");
console.log("done");
