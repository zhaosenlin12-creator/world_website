import assert from "node:assert/strict";
import {
  SURFACE_PLAYER_TUNING,
  stepSurfacePlayerVelocity,
  triggerSurfaceBoost,
  type SurfacePlayerMotionState,
} from "../src/lib/play/surfaceMissionRuntime";

function simulateTravel(state: SurfacePlayerMotionState, seconds: number) {
  let next = { ...state };
  let traveled = 0;
  const dt = 1 / 60;

  for (let elapsed = 0; elapsed < seconds; elapsed += dt) {
    next = stepSurfacePlayerVelocity(next, { x: 1, y: 0 }, dt);
    traveled += next.vx * dt;
  }

  return { next, traveled };
}

const baselineState: SurfacePlayerMotionState = {
  vx: SURFACE_PLAYER_TUNING.maxSpeed * 0.82,
  vy: 0,
  heading: 0,
  boostTimer: 0,
  boostCooldown: 0,
};

const boostedState = triggerSurfaceBoost(baselineState, { x: 1, y: 0 });

assert.equal(
  boostedState.boostTimer,
  SURFACE_PLAYER_TUNING.boostDuration,
  "boost should immediately enter active state"
);
assert.equal(
  boostedState.boostCooldown,
  SURFACE_PLAYER_TUNING.boostCooldown,
  "boost should immediately enter cooldown"
);
assert.ok(
  boostedState.vx - baselineState.vx >= SURFACE_PLAYER_TUNING.boostImpulse * 0.85,
  "boost should add a strong forward impulse as soon as it triggers"
);

const baselineRun = simulateTravel({ ...baselineState }, SURFACE_PLAYER_TUNING.boostDuration);
const boostedRun = simulateTravel({ ...boostedState }, SURFACE_PLAYER_TUNING.boostDuration);

assert.ok(
  boostedRun.traveled - baselineRun.traveled >= 60,
  "boost window should create a clearly longer travel distance than standard thrust"
);
assert.ok(
  boostedRun.next.vx > baselineRun.next.vx,
  "boosted state should end the burst with more forward speed"
);

console.log("surface-boost-check passed");
