// Stable, per-shell randomness keeps the same particles in the color, reflection and depth passes.
export function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}
const range = (rng, a, b) => a + (b - a) * rng();
export const choose = (items, rng = Math.random) =>
  items[Math.floor(rng() * items.length)];
export const STYLES = {
  peony: {
    speed: 143,
    life: 3.2,
    drag: 0.5,
    tail: 0.3,
    count: 1200,
    trails: 16,
  },
  chrysanthemum: {
    speed: 148,
    life: 4.2,
    drag: 0.39,
    tail: 0.85,
    count: 1320,
    trails: 24,
  },
  willow: {
    speed: 112,
    life: 5.8,
    drag: 0.24,
    tail: 1.75,
    count: 1050,
    trails: 34,
  },
  palm: {
    speed: 127,
    life: 4.6,
    drag: 0.23,
    tail: 1.35,
    count: 540,
    trails: 32,
  },
  crossette: {
    speed: 110,
    life: 3.6,
    drag: 0.29,
    tail: 0.8,
    count: 540,
    trails: 24,
  },
  strobe: {
    speed: 125,
    life: 4,
    drag: 0.4,
    tail: 0.28,
    count: 1100,
    trails: 12,
  },
  ring: {
    speed: 133,
    life: 3.5,
    drag: 0.35,
    tail: 0.6,
    count: 950,
    trails: 20,
  },
  horsetail: {
    speed: 98,
    life: 5.2,
    drag: 0.2,
    tail: 1.45,
    count: 650,
    trails: 30,
  },
  fan: { speed: 76, life: 3.2, drag: 0.17, tail: 1.1, count: 150, trails: 28 },
  comet: {
    speed: 114,
    life: 3.4,
    drag: 0.16,
    tail: 1.6,
    count: 80,
    trails: 40,
  },
  smile: {
    speed: 82,
    life: 3.7,
    drag: 0.46,
    tail: 0.5,
    count: 262,
    trails: 16,
  },
  galaxy: {
    speed: 32,
    life: 1.85,
    drag: 0.53,
    tail: 0.3,
    count: 130,
    trails: 8,
  },
  letter: {
    speed: 1.8,
    life: 1.8,
    drag: 0.6,
    tail: 0.08,
    count: 12,
    trails: 3,
  },
  crackle: {
    speed: 27,
    life: 0.85,
    drag: 0.9,
    tail: 0.15,
    count: 46,
    trails: 7,
  },
  branch: {
    speed: 78,
    life: 2.6,
    drag: 0.34,
    tail: 0.65,
    count: 150,
    trails: 18,
  },
  flower: {
    speed: 65,
    life: 2.6,
    drag: 0.38,
    tail: 0.48,
    count: 280,
    trails: 16,
  },
};
export function profileFor(spec) {
  return STYLES[spec.style] || STYLES[spec.type] || STYLES.chrysanthemum;
}
export function shellRng(spec) {
  return seededRandom(spec.seed ?? 12345);
}

export function sphereDirection(rng) {
  const y = range(rng, -1, 1),
    angle = rng() * Math.PI * 2,
    radius = Math.sqrt(1 - y * y);
  return [radius * Math.cos(angle), y, radius * Math.sin(angle)];
}
function normalize(v) {
  const n = Math.hypot(...v) || 1;
  return v.map((x) => x / n);
}
function rotate(v, angles) {
  let [x, y, z] = v;
  for (let axis = 0; axis < 3; axis++) {
    const c = Math.cos(angles[axis]),
      s = Math.sin(angles[axis]);
    if (axis === 0) [y, z] = [y * c - z * s, y * s + z * c];
    if (axis === 1) [x, z] = [x * c + z * s, -x * s + z * c];
    if (axis === 2) [x, y] = [x * c - y * s, x * s + y * c];
  }
  return [x, y, z];
}
export function smileDirections(div = 40) {
  const points = [];
  for (let i = 0; i < div * 2; i++) {
    const a = (i * Math.PI) / div;
    points.push([Math.cos(a), Math.sin(a), 0]);
  }
  for (let i = 0; i <= div; i++) {
    const a = (i * Math.PI) / div;
    points.push([Math.cos(a) * 0.5, -Math.sin(a) * 0.5, 0]);
  }
  for (const x of [-0.36, 0.36])
    for (let j = 0; j < 5; j++) points.push([x + (j - 2) * 0.015, 0.35, 0]);
  return points;
}

// A star is a burning pellet. Mass changes drag, not gravitational acceleration.
export function buildStars(spec, rng = shellRng(spec)) {
  const profile = profileFor(spec),
    style = spec.style || spec.type;
  const smile = style === "smile",
    letter = style === "letter",
    fan = style === "fan" || style === "comet";
  const round = [
    "peony",
    "chrysanthemum",
    "willow",
    "strobe",
    "galaxy",
    "flower",
  ].includes(style);
  const count = spec.count ?? profile.count,
    speed = spec.speed ?? profile.speed;
  const life = spec.life ?? profile.life,
    tail = spec.tail ?? profile.tail;
  const angles = spec.orientation || [
    range(rng, -0.5, 0.5),
    range(rng, -Math.PI, Math.PI),
    range(rng, -0.4, 0.4),
  ];
  const shapeScale =
    smile || letter || round
      ? [1, 1, 1]
      : [
          range(rng, 0.97, 1.03),
          range(rng, 0.97, 1.03),
          range(rng, 0.97, 1.03),
        ];
  const lobes = Array.from(
    { length: style === "palm" ? Math.floor(range(rng, 7, 12)) : 5 },
    () => {
      const d = sphereDirection(rng);
      if (style === "palm") d[1] = range(rng, -0.12, 1.05);
      return normalize(d);
    },
  );
  const face = smileDirections(),
    fanWidth = spec.spread ?? 1.9;
  const fanJets = spec.jets ?? Math.floor(range(rng, 6, 12));
  const jets = Array.from({ length: fanJets }, (_, i) => ({
    angle:
      (i / (fanJets - 1) - 0.5) * fanWidth +
      range(rng, -0.08, 0.08) +
      (spec.lean ?? 0),
    yaw: (spec.yaw ?? 0) + range(rng, -0.25, 0.25),
    delay: (i / (fanJets - 1)) * (spec.sweep ?? 0.4) + range(rng, 0, 0.12),
    speed: range(rng, 0.7, 1.18),
  }));
  const stars = [];
  for (let i = 0; i < count; i++) {
    const seed = rng(),
      mass =
        round || smile || letter
          ? range(rng, 0.95, 1.05)
          : range(rng, 0.85, 1.15);
    let d = sphereDirection(rng),
      radial = round ? range(rng, 0.988, 1.012) : range(rng, 0.9, 1.08),
      delay = range(rng, 0, 0.075);
    if (style === "palm" || style === "crossette") {
      const axis = lobes[i % lobes.length],
        scatter = style === "palm" ? 0.065 : 0.18;
      d = normalize(axis.map((v) => v + range(rng, -scatter, scatter)));
      radial = range(rng, 0.9, 1.07);
    }
    if (style === "horsetail") {
      d = normalize([
        range(rng, -0.65, 0.65),
        range(rng, 0.1, 0.75),
        range(rng, -0.55, 0.55),
      ]);
      radial = range(rng, 0.72, 1.06);
    }
    if (style === "ring") {
      const a = rng() * Math.PI * 2;
      d =
        rng() < 0.78
          ? normalize([Math.cos(a), Math.sin(a), range(rng, -0.045, 0.045)])
          : sphereDirection(rng);
      radial = i % 5 === 0 ? range(rng, 0.3, 0.58) : range(rng, 0.93, 1.06);
    }
    if (style === "branch") {
      const a = (i % 4) * Math.PI * 0.5;
      d = normalize([
        Math.cos(a) + range(rng, -0.1, 0.1),
        Math.sin(a) + range(rng, -0.1, 0.1),
        range(rng, -0.23, 0.23),
      ]);
    }
    if (smile) {
      d = [...face[i % face.length]];
      d[2] = range(rng, -0.025, 0.025);
      radial = range(rng, 0.986, 1.014);
    }
    if (letter) radial = range(rng, 0.6, 1.05);
    if (fan) {
      const jet = jets[i % jets.length],
        a = jet.angle + range(rng, -0.018, 0.018);
      d = [
        Math.sin(a) * Math.cos(jet.yaw),
        Math.cos(a),
        Math.sin(a) * Math.sin(jet.yaw) + range(rng, -0.16, 0.16),
      ];
      radial = jet.speed * range(rng, 0.92, 1.06);
      delay = jet.delay + range(rng, 0, spec.emission ?? 0.45);
    } else if (!smile && !letter) d = rotate(d, angles);
    if (smile) d = rotate(d, spec.orientation || [0.08, 0.15, -0.07]);
    const velocity = d.map(
      (v, axis) =>
        v * speed * radial * shapeScale[axis] +
        (spec.inheritedVelocity?.[axis] || 0),
    );
    stars.push({
      velocity,
      mass,
      drag:
        ((spec.drag ?? profile.drag) *
          (round ? range(rng, 0.985, 1.015) : range(rng, 0.94, 1.06))) /
        Math.cbrt(mass),
      life:
        life *
        (round || smile || letter
          ? range(rng, 0.93, 1.1)
          : range(rng, 0.82, 1.2)),
      tail: tail * range(rng, 0.68, 1.3),
      delay,
      seed,
      size: range(rng, 0.9, 1.45) * Math.pow(mass, 0.18),
      brightness: range(rng, 0.88, 1.3),
      flutter:
        smile || letter
          ? 0.05
          : round
            ? range(rng, 0.04, 0.18)
            : range(rng, 0.12, 0.45),
      colorMix: rng() < 0.1 ? range(rng, 0.5, 0.8) : range(rng, 0, 0.06),
      strobe:
        style === "strobe"
          ? range(rng, 0.6, 1)
          : style === "willow" && rng() < 0.3
            ? 0.3
            : 0,
    });
  }
  return stars;
}

// Exact integration of linear drag, with the same wind/flutter terms as the GPU shader.
export function sampleStar(star, t, spec = {}) {
  t = Math.max(0, t);
  const k = star.drag,
    decay = Math.exp(-k * t),
    travel = (1 - decay) / k;
  const gravity = spec.gravity ?? (spec.type === "letter" ? 0.7 : 9.81);
  const wind = spec.wind ?? [2.4, 0.1, 0.9],
    seed = star.seed,
    flutter = star.flutter;
  const position = star.velocity.map(
    (v, axis) => v * travel + wind[axis] * (t - travel),
  );
  position[1] -= (gravity / k) * (t - travel);
  position[0] +=
    (Math.sin(t * 1.7 + seed * 20) - Math.sin(seed * 20)) * flutter * t * 0.3;
  position[2] +=
    (Math.sin(t * 1.3 + seed * 31) - Math.sin(seed * 31)) * flutter * t * 0.3;
  const velocity = star.velocity.map(
    (v, axis) => v * decay + wind[axis] * (1 - decay),
  );
  velocity[1] -= (gravity / k) * (1 - decay);
  velocity[0] +=
    flutter *
    0.3 *
    (Math.sin(t * 1.7 + seed * 20) -
      Math.sin(seed * 20) +
      t * 1.7 * Math.cos(t * 1.7 + seed * 20));
  velocity[2] +=
    flutter *
    0.3 *
    (Math.sin(t * 1.3 + seed * 31) -
      Math.sin(seed * 31) +
      t * 1.3 * Math.cos(t * 1.3 + seed * 31));
  return { position, velocity };
}
function layeredBursts(spec, stars, rng) {
  const variant = spec.layerVariant || "double";
  const definitions =
    variant === "triple"
      ? [
          [0.68, 0.05, 650],
          [0.36, 0.1, 600],
        ]
      : variant === "echo"
        ? [
            [0.78, 0.6, 850],
            [0.48, 1.25, 650],
          ]
        : variant === "goldCore"
          ? [
              [0.62, 0.08, 900],
              [0.25, 0.14, 480],
            ]
          : [[0.62, 0.08, 850]];
  const children = definitions.map(([scale, at, count], i) => {
    const center = sampleStar(
      { velocity: [0, 0, 0], drag: spec.drag ?? 0.4, seed: 0, flutter: 0 },
      at,
      spec,
    );
    return {
      ...STYLES.peony,
      type: "core",
      style: "peony",
      generation: 1,
      secondary: false,
      at,
      position: spec.position.map((p, j) => p + center.position[j]),
      inheritedVelocity: center.velocity,
      drag: spec.drag ?? 0.4,
      color:
        variant === "goldCore"
          ? i
            ? "#fff1d7"
            : "#ffcb7b"
          : i
            ? spec.color || "#a9dfff"
            : spec.accentColor || "#ffe6be",
      accentColor: spec.color,
      seed: Math.floor(rng() * 4294967296),
      speed: (spec.speed ?? 148) * scale,
      count,
      trails: 16,
      life: Math.min(spec.life ?? 3.4, 3.4),
      tail: 0.42,
      wind: spec.wind,
      rocket: false,
    };
  });
  if (variant === "satellites")
    for (let i = 0; i < 5; i++) {
      const star = stars[Math.floor(((i + 0.5) * stars.length) / 5)],
        at = 1.0 + range(rng, 0, 0.22);
      const state = sampleStar(star, at - star.delay, spec);
      children.push({
        ...STYLES.flower,
        type: "flower",
        style: "flower",
        generation: 1,
        secondary: false,
        at,
        position: state.position.map((v, j) => v + spec.position[j]),
        inheritedVelocity: state.velocity.map((v) => v * 0.25),
        color: spec.accentColor || "#ffe4b0",
        accentColor: spec.color,
        seed: Math.floor(rng() * 4294967296),
        count: 400,
        trails: 14,
        speed: 78,
        wind: spec.wind,
        rocket: false,
      });
    }
  return children.sort((a, b) => a.at - b.at);
}
export function secondaryBursts(spec, stars, rng = shellRng(spec)) {
  if (spec.secondary === false || spec.generation) return [];
  if (spec.type === "massive") return layeredBursts(spec, stars, rng);
  const style = spec.style || spec.type;
  const split = style === "crossette",
    crackle = style === "willow" || style === "palm";
  if (!split && !crackle && spec.type !== "massive") return [];
  const children = [],
    count = split ? 12 : crackle ? 14 : 9;
  for (let i = 0; i < count; i++) {
    const star = stars[Math.floor(((i + 0.5) * stars.length) / count)];
    const age = split
      ? range(rng, 0.85, 1.5)
      : Math.min(star.life * 0.8, range(rng, 1.6, 2.8));
    const at = age + star.delay,
      state = sampleStar(star, age, spec);
    if (split) star.life = Math.min(star.life, age + 0.02);
    const childStyle = split
        ? "branch"
        : spec.type === "massive"
          ? "flower"
          : "crackle",
      profile = STYLES[childStyle];
    children.push({
      type: childStyle,
      style: childStyle,
      generation: 1,
      secondary: false,
      at,
      position: state.position.map((v, j) => v + spec.position[j]),
      inheritedVelocity: state.velocity.map((v) => v * (split ? 0.55 : 0.3)),
      color: split ? spec.color : "#ffdb9c",
      accentColor: "#fff0ce",
      seed: Math.floor(rng() * 4294967296),
      ...profile,
      wind: spec.wind,
      gravity: spec.gravity,
      rocket: false,
    });
  }
  return children.sort((a, b) => a.at - b.at);
}
export function particleEnd(star) {
  return star.delay + star.life + star.tail;
}
export function effectDuration(spec) {
  const p = profileFor(spec),
    life = spec.life ?? p.life,
    tail = spec.tail ?? p.tail;
  const delay =
    spec.type === "fan"
      ? (spec.sweep ?? 0.4) + (spec.emission ?? 0.45) + 0.12
      : 0.075;
  return Math.max(
    life * 1.38 + tail * 1.5 + delay,
    spec.secondary === false ? 0 : 6,
  );
}
export function rocketPosition(spec, p) {
  p = Math.max(0, Math.min(1, p));
  const launch = spec.launch || [0, 4, 0],
    bend = spec.launchBend || [5, -12];
  const ease = p * (1.75 - 0.75 * p),
    arc = Math.sin(p * Math.PI);
  return [
    launch[0] + (spec.position[0] - launch[0]) * p + bend[0] * arc,
    launch[1] + (spec.position[1] - launch[1]) * ease,
    launch[2] + (spec.position[2] - launch[2]) * p + bend[1] * arc,
  ];
}
