import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const voiceHookSource = fs.readFileSync(path.join(repoRoot, "src/hooks/useMissionVoice.ts"), "utf8");
const audioPaths = [...voiceHookSource.matchAll(/"\/audio\/tts\/([^"]+\.(?:mp3|wav))"/g)].map((match) => match[1]);

assert.ok(audioPaths.length > 0, "mission voice hook should declare packaged TTS assets");

for (const audioFile of audioPaths) {
  const fullPath = path.join(repoRoot, "public/audio/tts", audioFile);
  assert.ok(fs.existsSync(fullPath), `missing TTS asset: public/audio/tts/${audioFile}`);
}

const swPath = path.join(repoRoot, "public/sw.js");
assert.ok(fs.existsSync(swPath), "missing public/sw.js compatibility file");

console.log("runtime-asset-check passed");
