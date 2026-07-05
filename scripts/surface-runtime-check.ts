import assert from "node:assert/strict";
import {
  SURFACE_WORLD,
  advanceCheckpoint,
  advanceProjectiles,
  buildRuntimeHazards,
  buildRuntimeDefense,
  buildRuntimeNodes,
  createProtectedZones,
  distance,
  fireEmitterProjectiles,
  type CheckpointState,
  updateGuardians,
} from "../src/lib/play/surfaceMissionRuntime";

const nodes = buildRuntimeNodes([
  { id: "a", label: "云暴边缘", x: 20, y: 52 },
  { id: "b", label: "酸雾脊线", x: 52, y: 30 },
  { id: "c", label: "闪电回波点", x: 76, y: 66 },
]);

const protectedZones = createProtectedZones(nodes);
const hazards = buildRuntimeHazards([
  { id: "h1", label: "酸雾团", x: 35, y: 68, radius: 6, amplitude: 14, speed: 1.2, axis: "x" },
  { id: "h2", label: "热浪剪切", x: 72, y: 36, radius: 7, amplitude: 9, speed: 0.85, axis: "y" },
], protectedZones);
for (const hazard of hazards) {
  for (const zone of protectedZones) {
    assert.ok(
      distance(hazard.x, hazard.y, zone.x, zone.y) > hazard.radius + zone.radius,
      `hazard ${hazard.id} overlaps protected zone`
    );
  }
}

const previous: CheckpointState = {
  x: 220,
  y: SURFACE_WORLD.height - 240,
  safeElapsed: 0,
};

const advanced = advanceCheckpoint(
  previous,
  {
    x: 920,
    y: 510,
    vx: 120,
    vy: 16,
  },
  hazards,
  0.6
);

assert.ok(
  distance(advanced.x, advanced.y, 920, 510) < 80,
  "checkpoint should advance toward the player's latest safe position"
);

const threatened = advanceCheckpoint(
  advanced,
  {
    x: hazards[0].x,
    y: hazards[0].y,
    vx: 40,
    vy: 0,
  },
  hazards,
  0.6
);

assert.equal(
  threatened.x,
  advanced.x,
  "checkpoint should not update while the player is inside a hazard"
);

const defense = buildRuntimeDefense(nodes);

assert.ok(defense.emitters.length >= 2, "should create emitter defenses for later beacons");
assert.ok(defense.guardians.length >= 2, "should create guardian patrols for later beacons");
assert.ok(
  defense.emitters.some((emitter) => emitter.activeFrom >= 1),
  "emitters should ramp up after the first scanned beacon"
);

updateGuardians(defense.guardians, 0.6);
assert.ok(
  defense.guardians.some((guardian) => distance(guardian.x, guardian.y, guardian.anchorX, guardian.anchorY) > 8),
  "guardians should orbit away from their anchor points"
);

const fired = fireEmitterProjectiles(
  defense.emitters,
  [],
  {
    x: defense.emitters[0].x + 40,
    y: defense.emitters[0].y + 12,
  },
  1.2,
  3
);

assert.ok(fired.length > 0, "active emitters should launch electromagnetic projectiles");

const projectileStart = { x: fired[0].x, y: fired[0].y };
const advancedProjectiles = advanceProjectiles(fired, 0.5);

assert.ok(advancedProjectiles.length > 0, "fresh projectiles should stay alive after a short time");
assert.ok(
  distance(advancedProjectiles[0].x, advancedProjectiles[0].y, projectileStart.x, projectileStart.y) > 10,
  "projectiles should advance through the mission space"
);

console.log("surface-runtime-check passed");
