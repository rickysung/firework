import { LetterFire } from "./letters.js";
import {
  STYLES,
  choose,
  sphereDirection,
  smileDirections,
  effectDuration,
} from "./pyrotechnics.js";
export const LAUNCH_SITES = Array.from({ length: 9 }, (_, i) => [
  (i - 4) * 65,
  4,
  0,
]);
export const PATTERNS = ["basic", "massive", "willow", "galaxy"];
export const LABELS = {
  basic: "구형 · 빛의 합주",
  massive: "겹구형 · 다중 코어",
  willow: "황금 커튼 · 금빛 비",
  galaxy: "갤럭시 · 별의 물결",
  message: "하늘에 남길 말",
};
export const PROGRAM_ALIASES = {
  smile: "basic",
  strobe: "basic",
  palm: "willow",
  crossette: "massive",
};
export const LAYER_VARIANTS = [
  "double",
  "triple",
  "echo",
  "goldCore",
  "satellites",
];
export function chooseProgram(previous, rng = Math.random) {
  return choose(
    [
      "basic",
      "basic",
      "basic",
      "massive",
      "massive",
      "massive",
      "massive",
      "massive",
      "willow",
      "willow",
      "galaxy",
      "galaxy",
    ].filter((p) => p !== previous),
    rng,
  );
}
export const PALETTE = ["#ffd394", "#f56b80", "#87d8ff", "#b9ffa2", "#c498ff"];
export const random = (min, max, rng = Math.random) =>
  min + (max - min) * rng();
export function directions(type, div = 22, rng = Math.random) {
  if (type === "smile") return smileDirections(div);
  return Array.from({ length: 2 * div * (div - 1) }, () =>
    sphereDirection(rng),
  );
}
export function trailDuration(spec) {
  return (spec.tail ?? STYLES[spec.style || spec.type]?.tail ?? 0.7) * 1.5;
}
export function makeShell(type, overrides = {}, rng = Math.random) {
  const style =
    overrides.style ||
    choose(
      type === "basic"
        ? ["peony", "chrysanthemum", "chrysanthemum"]
        : type === "massive"
          ? ["peony", "chrysanthemum"]
          : type === "galaxy"
            ? ["galaxy"]
            : [type],
      rng,
    );
  const profile = STYLES[style] || STYLES.chrysanthemum;
  const launch = overrides.launch || choose(LAUNCH_SITES, rng),
    gold = ["willow", "palm", "horsetail"].includes(style);
  return {
    type,
    style,
    layerVariant: type === "massive" ? choose(LAYER_VARIANTS, rng) : undefined,
    seed: Math.floor(rng() * 4294967296),
    launch,
    position: [
      launch[0] + random(-85, 85, rng),
      random(200, 340, rng),
      random(-185, 155, rng),
    ],
    color: gold
      ? choose(["#ffc781", "#ffe3a6", "#efb179"], rng)
      : choose(PALETTE, rng),
    accentColor: gold
      ? "#ffedc0"
      : choose(["#ffe4ac", "#ffd5ed", "#bcecff"], rng),
    speed: profile.speed * random(0.96, 1.08, rng),
    life: profile.life * random(0.85, 1.12, rng),
    drag: profile.drag * random(0.86, 1.15, rng),
    tail: profile.tail * random(0.75, 1.25, rng),
    count: Math.round(profile.count * random(0.98, 1.08, rng)),
    trails: profile.trails,
    flight: random(1.45, 2.35, rng),
    rocketTail: random(0.2, 0.55, rng),
    launchBend: [random(-28, 28, rng), random(-40, 40, rng)],
    wind: [random(1.2, 3.8, rng), 0.1, random(-1.5, 1.5, rng)],
    rocket: true,
    ...overrides,
  };
}
export const GROUND_PROGRAMS = ["fan", "vertical", "cross", "chase"];
export function groundProgram(mode = "auto", rng = Math.random) {
  const program = mode === "auto" ? choose(GROUND_PROGRAMS, rng) : mode;
  const shells = [],
    reverse = rng() < 0.5;
  const gesture = choose(["sweep", "inward", "alternating", "scattered"], rng);
  if (program === "fan")
    for (let i = 0; i < LAUNCH_SITES.length; i++) {
      if (gesture === "scattered" && rng() < 0.23) continue;
      const order = reverse ? 8 - i : i;
      const at =
        gesture === "sweep"
          ? 0.35 + order * 0.17
          : gesture === "inward"
            ? 0.35 + Math.min(i, 8 - i) * 0.28
            : gesture === "alternating"
              ? 0.4 + (i % 2) * 0.75 + random(0, 0.14, rng)
              : random(0.2, 2.6, rng);
      const narrow = rng() < 0.35,
        lean = gesture === "inward" ? (4 - i) * 0.09 : random(-0.25, 0.25, rng);
      shells.push(
        makeShell(
          "fan",
          {
            launch: LAUNCH_SITES[i],
            position: LAUNCH_SITES[i],
            at,
            rocket: false,
            secondary: false,
            color: choose(["#ffcc87", "#ffe5b3", "#f1c59e"], rng),
            spread: narrow ? random(0.35, 0.85, rng) : random(1.3, 2.25, rng),
            lean,
            yaw: random(-0.5, 0.5, rng),
            jets: Math.floor(random(5, 12, rng)),
            sweep: random(0.12, 0.85, rng),
            emission: random(0.18, 0.7, rng),
            speed: random(42, 76, rng),
            life: random(2.1, 3.4, rng),
            tail: random(0.35, 1.1, rng),
          },
          rng,
        ),
      );
    }

  if (program !== "fan") {
    const waves = program === "vertical" ? 3 : program === "cross" ? 2 : 2;
    const palette = ["#ffe2b2", "#acdfff", "#ffcb82"];
    for (let wave = 0; wave < waves; wave++)
      for (let i = 0; i < 9; i++) {
        const order = reverse !== (wave % 2 === 1) ? 8 - i : i;
        const lean =
          program === "cross"
            ? wave % 2
              ? -0.5
              : 0.5
            : program === "chase"
              ? wave % 2
                ? -0.24
                : 0.24
              : 0;
        const at =
          0.3 +
          wave * (program === "chase" ? 1.35 : 0.95) +
          (program === "vertical"
            ? (i % 3) * 0.12
            : program === "cross"
              ? Math.abs(4 - i) * 0.08
              : order * 0.14);
        shells.push(
          makeShell(
            "fan",
            {
              style: "comet",
              launch: LAUNCH_SITES[i],
              position: LAUNCH_SITES[i],
              at,
              rocket: false,
              secondary: false,
              color: palette[wave % palette.length],
              spread: 0.06,
              jets: 3,
              lean,
              yaw: i % 2 ? -0.15 : 0.15,
              sweep: 0.07,
              emission: program === "vertical" ? 0.4 : 0.18,
              speed:
                (program === "vertical" ? 106 + wave * 8 : 112) *
                random(0.96, 1.04, rng),
              life: 3.1,
              tail: program === "chase" ? 1.65 : 1.35,
              count: 75,
              trails: 38,
            },
            rng,
          ),
        );
      }
  }
  return { program, gesture, shells };
}

export function createSequence(type, rng = Math.random, groundMode = "auto") {
  type = PROGRAM_ALIASES[type] || type;
  const shells = [],
    galaxy = type === "galaxy",
    massive = type === "massive";
  const volleySize = massive
    ? 3 + Math.floor(rng() * 2)
    : type === "willow"
      ? 4
      : 5 + Math.floor(rng() * 2);
  const count = galaxy ? Math.floor(random(4200, 4600, rng)) : volleySize * 4;
  const volleyGap = massive ? 3.8 : type === "willow" ? 3.3 : 2.55;
  const rareAccent =
    !galaxy && !massive && rng() < 0.2 ? Math.floor(rng() * count) : -1;
  const rhythm = choose(["chase", "pairs", "scatter", "crescendo"], rng);
  const reverse = rng() < 0.5,
    palette = choose(PALETTE, rng);
  const galaxySpan = 32;
  const clusters = galaxy
    ? Array.from({ length: 13 }, (_, i) => ({
        x: (i - 6) * 90,
        z: [-230, -20, 190][i % 3],
      }))
    : [];

  const styles = ["peony", "chrysanthemum", "chrysanthemum", "strobe"];
  const styleOffset = Math.floor(rng() * styles.length);
  for (let i = 0; i < count; i++) {
    const volley = Math.floor(i / volleySize),
      lane = i % volleySize;
    let station = galaxy
      ? Math.round((i * 8) / Math.max(1, count - 1))
      : Math.round((lane * 8) / (volleySize - 1));
    if (reverse) station = 8 - station;
    const launch = LAUNCH_SITES[station],
      cluster = galaxy ? clusters[(i * 5) % clusters.length] : null;
    const spec = makeShell(
      type,
      {
        launch,
        ...(type === "basic"
          ? { style: styles[(i + styleOffset) % styles.length] }
          : {}),
      },
      rng,
    );
    spec.at = 2.4 + volley * volleyGap + lane * 0.055 + random(0, 0.025, rng);
    if (!galaxy) {
      spec.position = [
        (lane / (volleySize - 1) - 0.5) * 760 + random(-25, 25, rng),
        255 +
          (volley % 2) * 38 +
          Math.sin((lane / (volleySize - 1)) * Math.PI) * 65,
        (lane % 2 ? -130 : 80) + random(-40, 40, rng),
      ];
      if (reverse) spec.position[0] *= -1;
      spec.secondary = massive;
      if (massive)
        spec.layerVariant =
          LAYER_VARIANTS[(volley + lane) % LAYER_VARIANTS.length];
      if (type === "willow") {
        spec.color = ["#ffd394", "#ffe3a6", "#ffc781", "#ffeac6"][volley];
        spec.life *= 0.88;
      }
      if (i === rareAccent) {
        const style =
          type === "willow" ? choose(["palm", "crossette"], rng) : "smile";
        Object.assign(spec, STYLES[style], {
          style,
          secondary: style === "crossette",
        });
      }
    }
    if (galaxy) {
      spec.style = "galaxy";
      // Stratified times sustain a dense 32-second show without simultaneous spikes.
      const phase = ((i + rng()) / count) * galaxySpan;
      spec.at = 2.1 + phase;
      spec.position = [
        cluster.x + random(-48, 48, rng) + Math.sin(phase * 0.6) * 25,
        [155, 280, 405][i % 3] + random(-45, 45, rng),
        cluster.z + random(-60, 60, rng) + Math.sin(phase * 0.4) * 20,
      ];
      const station = Math.max(
        0,
        Math.min(8, Math.round(spec.position[0] / 65 + 4)),
      );
      spec.launch = LAUNCH_SITES[station];
      spec.color = rng() < 0.8 ? palette : choose(PALETTE, rng);
      spec.rocket = i % 23 === 0;
      spec.secondary = false;
    }
    if (massive) spec.speed *= 1.05;
    spec.flight = Math.min(spec.flight, spec.at - 0.1);
    shells.push(spec);
  }
  const ground = groundProgram(groundMode, rng);
  shells.push(...ground.shells);
  if (galaxy) {
    // Keep the firing platform active beneath each new wave of the extended sky show.
    for (const offset of [8, 16, 24]) {
      const accompaniment = groundProgram(groundMode, rng);
      shells.push(
        ...accompaniment.shells.map((s) => ({ ...s, at: s.at + offset })),
      );
    }
  }
  if (!galaxy) {
    const accompaniment = groundProgram(groundMode, rng);
    shells.push(
      ...accompaniment.shells.map((s) => ({ ...s, at: s.at + volleyGap * 2 })),
    );
  }
  shells.sort((a, b) => a.at - b.at);
  const launches = shells
    .filter((s) => s.rocket)
    .sort((a, b) => a.at - a.flight - (b.at - b.flight));
  return {
    type,
    rhythm,
    gesture: ground.gesture,
    groundProgram: ground.program,
    shells,
    launches,
    duration: Math.max(...shells.map((s) => s.at + effectDuration(s))) + 0.8,
    // Start the next launch cue while the previous shells are still glowing.
    transitionAt: Math.max(
      shells.at(-1).at + 0.1,
      Math.max(...shells.filter((s) => s.type !== "fan").map((s) => s.at)) +
        0.9,
    ),
  };
}
export function messageShells(text) {
  const clean = text
    .toUpperCase()
    .replace(/[^A-Z0-9 +]/g, "")
    .trim()
    .slice(0, 24);
  const words = clean.split(/[\s+]+/).filter(Boolean);
  let at = 0.15;
  const shells = [];
  for (const word of words) {
    const spacing = Math.min(115, 580 / (word.length + 1));
    for (let k = 0; k < word.length; k++) {
      for (const p of LetterFire[word[k]] || []) {
        shells.push({
          type: "letter",
          at,
          position: [
            (k - (word.length - 1) / 2) * spacing + (p.X * spacing) / 550,
            230 - (p.Y * spacing) / 550,
            p.Z * 0.08,
          ],
          color: "#ffdeb0",
          speed: 1.8,
          life: 2.2,
          div: 3,
          trails: 2,
          rocket: false,
        });
        at += 0.014;
      }
      at += 0.15;
    }
    at += 3.4;
  }
  return { type: "message", shells, launches: [], duration: Math.max(at, 1) };
}
