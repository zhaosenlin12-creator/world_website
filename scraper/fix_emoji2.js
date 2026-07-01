const fs = require("fs");
const path = "D:/kaifa_stu/world_website/src/data/bodies.ts";
let s = fs.readFileSync(path, "utf8");
// Restore commas lost. Match: emoji: "X"#xxx", -> emoji: "X", color: "#xxx",
s = s.replace(/emoji: ("[^"]*")#([0-9a-fA-F]+)",/g, function(m, em, col) {
  return "emoji: " + em + ",\n  color: \"#" + col + "\",";
});
fs.writeFileSync(path, s, "utf8");
console.log("done");
