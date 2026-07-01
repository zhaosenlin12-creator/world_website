const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = "D:\\kaifa_stu\\world_website";
const procId = process.argv[2];

console.log("PID " + procId + " still alive? " + (function(){
  try { execSync(`tasklist /FI "PID eq ${procId}" /FO CSV /NH`, {stdio:"pipe"}); return "yes"; }
  catch(e) { return "no"; }
})());

const data = path.join(ROOT, "data");
const files = fs.readdirSync(data);
for (const f of files) {
  const stat = fs.statSync(path.join(data, f));
  console.log(f + "\t" + stat.size);
}
const imgs = path.join(ROOT, "public\\assets\\images");
if (fs.existsSync(imgs)) {
  const ic = fs.readdirSync(imgs);
  console.log("images downloaded: " + ic.length);
}
