import assert from "node:assert/strict";
import {
  computeTargetPlanetState,
  createFlightHazards,
  createFlightOrbs,
  getDescentSpeed,
  getFlightStage,
  getLandingTriggerZ,
} from "../src/lib/play/descentFlight";

const start = computeTargetPlanetState(0, false);
assert.equal(getFlightStage(0), "WARP");
assert.ok(start.worldZ < -150, "起始时目标星球应明显在前方");
assert.ok(start.radius >= 4 && start.radius <= 10, "起始半径应较小");

const mid = computeTargetPlanetState(-220, false);
assert.equal(getFlightStage(-220), "ENTRY");
assert.ok(mid.worldZ < -220, "中段目标星球仍应在飞船前方");
assert.ok(mid.radius > start.radius, "接近后星球应持续变大");

const late = computeTargetPlanetState(-350, true);
assert.equal(getFlightStage(-350), "LANDING");
assert.ok(late.worldZ < -350, "末段仍需保持在镜头前方");
assert.ok(late.radius > 100, "末段星球应接近铺满画面");
assert.ok(late.ringScale > 1, "带环行星末段应同步放大星环");

assert.ok(getDescentSpeed(0) < getDescentSpeed(-260), "后段速度应高于前段");
assert.ok(getLandingTriggerZ() <= -340, "切换到着陆关不应过早");

const hazards = createFlightHazards("mars");
assert.ok(hazards.length >= 24, "障碍数量应足够支撑完整穿越过程");
assert.ok(hazards.some((hazard) => Math.abs(hazard.y) > 2), "障碍需要覆盖上下层空间");
assert.ok(hazards.every((hazard) => hazard.x >= -6 && hazard.x <= 6), "障碍横向应保持在可玩区域内");
assert.ok(hazards.every((hazard) => hazard.y >= -4 && hazard.y <= 4), "障碍纵向应保持在可玩区域内");

const orbs = createFlightOrbs("mars");
assert.ok(orbs.length >= 12, "收集物数量应覆盖多个阶段");
assert.ok(orbs.some((orb) => Math.abs(orb.y) > 1.2), "收集物需要引导上下移动");

console.log("descent-flight checks passed");
