import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const sourcePath = path.resolve("src/components/SurfaceMission.tsx");
const source = fs.readFileSync(sourcePath, "utf8");

assert.match(
  source,
  /callbackRefs?\s*=\s*useRef|collectRef\s*=\s*useRef|callbacksRef\s*=\s*useRef/,
  "SurfaceMission should keep latest callbacks in refs so runtime loop does not remount on parent re-render"
);

assert.match(
  source,
  /onCollect:\s*callbackRefs?\.current\.onCollect|onCollect:\s*callbacksRef\.current\.onCollect/,
  "runtime loop should call onCollect through a stable callback ref"
);

assert.match(
  source,
  /onHazard:\s*callbackRefs?\.current\.onHazard|onHazard:\s*callbacksRef\.current\.onHazard/,
  "runtime loop should call onHazard through a stable callback ref"
);

assert.match(
  source,
  /onComplete:\s*callbackRefs?\.current\.onComplete|onComplete:\s*callbacksRef\.current\.onComplete/,
  "runtime loop should call onComplete through a stable callback ref"
);

assert.match(
  source,
  /onVoiceCue:\s*callbackRefs?\.current\.onVoiceCue|onVoiceCue:\s*callbacksRef\.current\.onVoiceCue/,
  "runtime loop should call onVoiceCue through a stable callback ref"
);

assert.doesNotMatch(
  source,
  /\[active,\s*accent,\s*decor,\s*goal,\s*hazards,\s*nodes,\s*onCollect,\s*onComplete,\s*onHazard,\s*onVoiceCue,\s*planetId\]/,
  "runtime initialization effect must not depend on unstable callback props"
);

console.log("surface-component-stability-check passed");
