const fs = require("fs");
const p = "D:/kaifa_stu/world_website/src/data/bodies.ts";
const buf = fs.readFileSync(p);
// Find unusual bytes
const u8 = new Uint8Array(buf);
// Em-dash in UTF-8: 0xE2 0x80 0x94
// In GBK, "—" (U+2014) is encoded as 0xA1 0xAA
// So if the file was saved as GBK and re-read as UTF-8:
// 0xA1 alone is invalid UTF-8 leading byte -> replaced with U+FFFD (utf-8 EFBFBD)
// 0xAA alone is continuation -> also replaced
// So we'd see 0xEF 0xBF 0xBD 0xEF 0xBF 0xBD for each em-dash
let count = 0;
for (let i = 0; i < u8.length - 2; i++) {
  if (u8[i] === 0xEF && u8[i+1] === 0xBF && u8[i+2] === 0xBD) count++;
}
console.log("replacement chars (U+FFFD) count:", count);

// Read as utf-8 string
let s = buf.toString("utf8");
const before = s.length;
s = s.replace(/\uFFFD\uFFFD/g, "\u2014"); // em-dash
s = s.replace(/\uFFFD/g, ""); // any other
console.log("size before/after:", before, s.length);
fs.writeFileSync(p, s, "utf8");
console.log("done");
