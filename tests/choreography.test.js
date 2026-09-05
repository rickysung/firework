import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import {
  createSequence,
  directions,
  makeShell,
  messageShells,
  LAUNCH_SITES,
  PATTERNS,
  GROUND_PROGRAMS,
  groundProgram,
  chooseProgram,
  LAYER_VARIANTS,
} from "../src/choreography.js";
import {
  buildStars,
  seededRandom,
  particleEnd,
  effectDuration,
  sampleStar,
  secondaryBursts,
  rocketPosition,
} from "../src/pyrotechnics.js";
import { Fireworks } from "../src/fireworks.js";
import { LetterFire } from "../src/letters.js";
const spread = (values) => Math.max(...values) - Math.min(...values);
const near = (a, b, epsilon = 1e-7) =>
  assert.ok(Math.abs(a - b) < epsilon, `${a} differs from ${b}`);

test("all launch gestures remain on the straight platform, with varied firing times and dimensions", () => {
  assert.equal(LAUNCH_SITES.length, 9);
  assert.ok(LAUNCH_SITES.every((p) => p[1] === 4 && p[2] === 0));
  const gestures = new Set();
  for (let seed = 0; seed < 20; seed++) {
    const seq = createSequence("basic", seededRandom(seed), "fan");
    gestures.add(seq.gesture);
    const fans = seq.shells.filter((s) => s.type === "fan" && s.at < 3);
    assert.ok(fans.length >= 3 && fans.length <= 9);
    assert.ok(fans.every((s) => LAUNCH_SITES.includes(s.position)));
    assert.ok(spread(fans.map((s) => s.at)) > 0.1);
    assert.ok(spread(fans.map((s) => s.speed)) > 4);
    assert.ok(spread(fans.map((s) => s.spread)) > 0.1);
  }
  assert.equal(gestures.size, 4);
});
test("sequence populations and the extended galaxy show have ordered complete lifetimes", () => {
  const ranges = {
    basic: [20, 24],
    smile: [7, 11],
    galaxy: [4200, 4599],
    massive: [12, 16],
    willow: [16, 16],
    palm: [3, 5],
    crossette: [3, 5],
    strobe: [3, 5],
  };
  for (const type of PATTERNS)
    for (let seed = 0; seed < 10; seed++) {
      const seq = createSequence(type, seededRandom(seed)),
        shells = seq.shells.filter((s) => s.type === type);
      assert.ok(
        shells.length >= ranges[type][0] && shells.length <= ranges[type][1],
      );
      assert.ok(
        seq.shells.every(
          (s, i) =>
            s.position.every(Number.isFinite) &&
            s.at + effectDuration(s) < seq.duration &&
            (i === 0 || s.at >= seq.shells[i - 1].at),
        ),
      );
      assert.ok(
        seq.launches.every(
          (s, i) =>
            LAUNCH_SITES.includes(s.launch) &&
            s.at >= s.flight &&
            (i === 0 ||
              s.at - s.flight >=
                seq.launches[i - 1].at - seq.launches[i - 1].flight),
        ),
      );
    }
});
test("uniform sphere has no latitude bands and real depth", () => {
  const dirs = directions("basic", 22, seededRandom(42));
  assert.equal(dirs.length, 924);
  assert.ok(dirs.every((d) => Math.abs(Math.hypot(...d) - 1) < 1e-10));
  for (let axis = 0; axis < 3; axis++) {
    near(
      dirs.reduce((sum, d) => sum + d[axis] * d[axis], 0) / dirs.length,
      1 / 3,
      0.04,
    );
    assert.ok(
      dirs.some((d) => d[axis] > 0.95) && dirs.some((d) => d[axis] < -0.95),
    );
  }
});
test("round shells keep a dense, clean spherical envelope while tails and combustion vary", () => {
  const spec = makeShell("basic", { style: "chrysanthemum" }, seededRandom(17)),
    stars = buildStars(spec);
  assert.deepEqual(stars, buildStars(spec));
  assert.ok(stars.length >= 1200);
  assert.ok(
    spread(stars.map((s) => s.mass)) > 0.04 &&
      spread(stars.map((s) => s.mass)) < 0.11,
  );
  assert.ok(spread(stars.map((s) => s.drag)) < 0.04);
  assert.ok(spread(stars.map((s) => s.life)) > 0.4);
  assert.ok(spread(stars.map((s) => s.tail)) > 0.4);
  const radii = stars.map((s) => Math.hypot(...s.velocity));
  assert.ok(Math.max(...radii) / Math.min(...radii) < 1.03);
  assert.ok(spread(stars.map((s) => s.velocity[2])) > 150);
  assert.ok(stars.every((s) => particleEnd(s) <= effectDuration(spec)));
});
test("fan jets have depth, delayed emissions and different velocities", () => {
  const spec = makeShell(
      "fan",
      { sweep: 0.6, emission: 0.6, yaw: 0.4 },
      seededRandom(42),
    ),
    stars = buildStars(spec);
  assert.ok(spread(stars.map((s) => s.delay)) > 0.6);
  assert.ok(spread(stars.map((s) => s.velocity[2])) > 15);
  assert.ok(spread(stars.map((s) => Math.hypot(...s.velocity))) > 10);
});
test("shaped smile and all original glyphs remain legible", () => {
  const face = directions("smile", 40);
  assert.ok(face.every((d) => d[2] === 0));
  assert.ok(face.some((d) => d[1] === 0.35 && d[0] < 0));
  assert.ok(face.some((d) => d[1] === 0.35 && d[0] > 0));
  assert.ok(face.some((d) => d[1] < -0.45 && Math.abs(d[0]) < 0.1));
  for (const ch of "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")
    assert.ok(LetterFire[ch].length > 0);
  assert.equal(messageShells("<안녕>").shells.length, 0);
  assert.deepEqual(
    messageShells("A".repeat(100)),
    messageShells("A".repeat(24)),
  );
  const seq = messageShells("SEOUL 2026");
  assert.ok(seq.shells.length > 100);
  assert.deepEqual(seq.launches, []);
  assert.ok(
    seq.shells.every(
      (s) => s.at + Math.max(...buildStars(s).map(particleEnd)) < seq.duration,
    ),
  );
});
test("linear-drag physics is continuous, frame independent and has the correct derivative", () => {
  const spec = makeShell("willow", {}, seededRandom(3)),
    star = buildStars(spec)[0];
  assert.deepEqual(sampleStar(star, 0, spec).position, [0, 0, 0]);
  for (const t of [0.1, 1, 3, 6]) {
    const h = 1e-5,
      a = sampleStar(star, t - h, spec),
      b = sampleStar(star, t + h, spec),
      state = sampleStar(star, t, spec);
    for (let j = 0; j < 3; j++)
      near((b.position[j] - a.position[j]) / (2 * h), state.velocity[j], 1e-5);
  }
  const light = { ...star, velocity: [90, 0, 0], drag: 0.9, flutter: 0 },
    heavy = { ...light, drag: 0.2 };
  assert.ok(
    sampleStar(heavy, 3).position[0] > sampleStar(light, 3).position[0],
  );
  assert.ok(sampleStar(heavy, 5).position[1] < 0);
});
test("secondary explosions split at the moving parent position and inherit its velocity", () => {
  const spec = makeShell("crossette", {}, seededRandom(93)),
    stars = buildStars(spec),
    children = secondaryBursts(spec, stars);
  assert.equal(children.length, 12);
  assert.ok(children.every((c) => c.speed >= 65 && c.count >= 150));
  assert.ok(spread(children.map((c) => c.at)) > 0.3);
  children.forEach((c) => {
    assert.ok(c.generation === 1 && c.secondary === false);
    const parent = stars.find((s) => {
      const p = sampleStar(s, c.at - s.delay, spec).position;
      return p.every(
        (v, j) => Math.abs(v + spec.position[j] - c.position[j]) < 1e-6,
      );
    });
    assert.ok(parent);
    const state = sampleStar(parent, c.at - parent.delay, spec);
    state.velocity.forEach((v, j) => near(v * 0.55, c.inheritedVelocity[j]));
  });
});
test("every rocket starts at its launch station and arrives exactly at its own 3D explosion", () => {
  for (let seed = 0; seed < 20; seed++) {
    const spec = makeShell("basic", {}, seededRandom(seed));
    assert.deepEqual(rocketPosition(spec, 0), spec.launch);
    rocketPosition(spec, 1).forEach((v, j) => near(v, spec.position[j]));
    assert.ok(rocketPosition(spec, 0.5).every(Number.isFinite));
  }
});
test("GPU geometry, secondary scheduling and disposal stay bounded throughout repeated shows", () => {
  const scene = new THREE.Scene(),
    fireworks = new Fireworks(scene, { smoke: false });
  let disposed = 0;
  for (let cycle = 0; cycle < 3; cycle++) {
    fireworks.burst(makeShell("crossette", {}, seededRandom(cycle)));
    const parent = fireworks.bursts[0];
    parent.points.geometry.addEventListener("dispose", () => disposed++);
    const uniforms = parent.points.material.uniforms;
    assert.equal(uniforms, parent.points.customDepthMaterial.uniforms);
    fireworks.update(1.8);
    assert.ok(fireworks.bursts.some((b) => b.spec.generation === 1));
    for (let t = 0; t < 45; t++) fireworks.update(0.25);
    assert.equal(fireworks.particleCount, 0);
    assert.equal(scene.children.length, 0);
  }
  assert.equal(disposed, 3);
  fireworks.maxVertices = 100;
  assert.equal(fireworks.burst(makeShell("massive")), false);
  assert.equal(fireworks.particleCount, 0);
  fireworks.maxVertices = 280000;
  fireworks.burst(makeShell("willow"));
  fireworks.clear();
  fireworks.update(15);
  assert.equal(scene.children.length, 0);
  fireworks.dispose();
});

test("galaxy sustains thousands of dense, bright microbursts and large two-stage shells have substantial children", () => {
  const galaxy = createSequence("galaxy", seededRandom(34));
  const shells = galaxy.shells.filter((s) => s.type === "galaxy");
  assert.ok(shells.length >= 4200);
  assert.ok(
    shells.every((s) => s.count >= 120 && s.speed >= 30 && s.trails >= 8),
  );
  const massive = makeShell(
    "massive",
    { style: "chrysanthemum", layerVariant: "satellites" },
    seededRandom(4),
  );
  const children = secondaryBursts(massive, buildStars(massive));
  assert.ok(children.some((c) => c.type === "core" && c.count >= 600));
  assert.ok(children.filter((c) => c.type === "flower").length >= 5);
  assert.ok(
    children
      .filter((c) => c.type === "flower")
      .every((c) => c.count >= 250 && c.speed >= 60),
  );
});
test("platform supports distinct fan, vertical, crossing and traveling comet programs", () => {
  for (const name of GROUND_PROGRAMS) {
    const program = groundProgram(name, seededRandom(33));
    assert.equal(program.program, name);
    assert.ok(program.shells.every((s) => LAUNCH_SITES.includes(s.position)));
    if (name === "vertical")
      assert.ok(
        program.shells.every((s) => s.lean === 0 && s.style === "comet"),
      );
    if (name === "cross") {
      assert.ok(program.shells.some((s) => s.lean > 0.4));
      assert.ok(program.shells.some((s) => s.lean < -0.4));
    }
    if (name === "chase")
      assert.ok(new Set(program.shells.map((s) => s.at)).size >= 12);
    const seq = createSequence("basic", seededRandom(7), name);
    assert.equal(seq.groundProgram, name);
  }
});

test("extended galaxy sustains full-width coverage for 32 seconds without exhausting particle capacity", () => {
  const limits = new Fireworks(new THREE.Scene(), { smoke: false });
  for (const seed of [0, 19, 91]) {
    const seq = createSequence("galaxy", seededRandom(seed), "vertical");
    const sky = seq.shells.filter((s) => s.type === "galaxy");
    assert.ok(sky.at(-1).at - sky[0].at > 31.9);
    assert.ok(seq.duration > 37 && seq.duration < 40);
    for (let at = 2.1; at < 33; at += 4) {
      const wave = sky.filter((s) => s.at >= at && s.at < at + 4);
      assert.ok(wave.length >= 500);
      assert.ok(spread(wave.map((s) => s.position[0])) > 1100);
      assert.ok(spread(wave.map((s) => s.position[1])) > 320);
      assert.ok(spread(wave.map((s) => s.position[2])) > 530);
    }
    const events = [];
    for (const s of seq.shells) {
      // Conservative bounds for the round-family burn and tail ranges, plus launch delay.
      const life =
        s.type === "galaxy"
          ? s.life * 1.1 + s.tail * 1.3 + 0.075
          : effectDuration(s);
      events.push(
        [s.at, 1, s.count * s.trails],
        [s.at + life, -1, -s.count * s.trails],
      );
    }
    events.sort((a, b) => a[0] - b[0]);
    let live = 0,
      vertices = 0;
    for (const [, delta, cost] of events) {
      live += delta;
      vertices += cost;
      assert.ok(live < limits.maxBursts);
      assert.ok(vertices < limits.maxVertices);
    }
    assert.equal(live, 0);
    assert.equal(vertices, 0);
    assert.ok(seq.shells.some((s) => s.type === "fan" && s.at > 24));
  }
  limits.dispose();
});

test("merged shows favor spherical shells, fire large volleys and cue the next show before their tails end", () => {
  assert.deepEqual(PATTERNS, ["basic", "massive", "willow", "galaxy"]);
  let previous = "basic",
    roundPrograms = 0;
  const rng = seededRandom(48);
  for (let i = 0; i < 1000; i++) {
    const p = chooseProgram(previous, rng);
    assert.notEqual(p, previous);
    if (p === "basic" || p === "massive") roundPrograms++;
    previous = p;
  }
  assert.ok(roundPrograms > 600);
  for (const type of ["basic", "massive", "willow"])
    for (let seed = 0; seed < 16; seed++) {
      const seq = createSequence(type, seededRandom(seed)),
        sky = seq.shells.filter((s) => s.type !== "fan");
      const rootsPerVolley = sky.length / 4;
      assert.ok(rootsPerVolley >= 3);
      for (let i = 0; i < sky.length; i += rootsPerVolley)
        assert.ok(sky[i + rootsPerVolley - 1].at - sky[i].at < 0.4);
      assert.ok(
        sky.filter((s) => ["palm", "smile", "crossette"].includes(s.style))
          .length <= 1,
      );
      assert.ok(seq.transitionAt > seq.shells.at(-1).at);
      assert.ok(seq.transitionAt < seq.duration - 2);
      assert.ok(seq.transitionAt + 2.4 - sky.at(-1).at < 3.5);
    }
});
test("all five layered variants keep dense spherical cores and bound their late explosions", () => {
  for (const variant of LAYER_VARIANTS) {
    const spec = makeShell(
      "massive",
      { layerVariant: variant },
      seededRandom(32),
    );
    const children = secondaryBursts(spec, buildStars(spec));
    const cores = children.filter((c) => c.type === "core");
    assert.ok(cores.length >= 1 && cores.length <= 2);
    assert.ok(cores.every((c) => c.style === "peony" && c.count >= 480));
    assert.ok(
      children.every(
        (c) =>
          c.generation === 1 &&
          c.at + Math.max(...buildStars(c).map(particleEnd)) <
            effectDuration(spec),
      ),
    );
    if (variant === "echo") assert.ok(cores.every((c) => c.at >= 0.6));
    if (variant === "triple") assert.ok(cores[0].speed > cores[1].speed);
    if (variant !== "satellites")
      assert.ok(children.every((c) => c.type === "core"));
  }
});
