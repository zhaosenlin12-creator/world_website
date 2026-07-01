const fs = require("fs");
const p = "D:/kaifa_stu/world_website/src/data/bodies.ts";
const buf = fs.readFileSync(p);
const u8 = new Uint8Array(buf);
let em = 0, sun = 0, ea = 0, sat = 0;
for (let i = 0; i < u8.length - 2; i++) {
  if (u8[i] === 0xE2 && u8[i+1] === 0x80 && u8[i+2] === 0x94) em++;
  if (u8[i] === 0xE2 && u8[i+1] === 0x98 && u8[i+2] === 0x89) sun++;
  if (u8[i] === 0xE2 && u8[i+1] === 0x9A && u8[i+2] === 0x91) ea++;
  if (u8[i] === 0xE2 && u8[i+1] === 0x99 && u8[i+2] === 0x80) sat++;
}
console.log({em, sun, ea, sat});
// Find positions of unusual single bytes (>= 0x80)
const sus = [];
for (let i = 0; i < u8.length; i++) {
  if (u8[i] >= 0x80) {
    sus.push({pos: i, byte: u8[i]});
  }
}
console.log("high bytes:", sus.length);
if (sus.length > 0) {
  const grouped = {};
  for (const s of sus) {
    grouped[s.byte] = (grouped[s.byte] || 0) + 1;
  }
  console.log("top bytes:", Object.entries(grouped).sort((a,b) => b[1] - a[1]).slice(0, 8));
}
