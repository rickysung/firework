import { waterFragmentShader } from "./water-shader.js";
import * as THREE from "three";
import { Reflector } from "three/addons/objects/Reflector.js";
import { LAUNCH_SITES } from "./choreography.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

function rng(seed = 921) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
const rand = rng();
const box = new THREE.BoxGeometry(1, 1, 1);
const transform = new THREE.Object3D();
function instances(scene, items, material, geometry = box) {
  const mesh = new THREE.InstancedMesh(geometry, material, items.length);
  items.forEach((item, i) => {
    transform.position.set(...item.p);
    transform.scale.set(...item.s);
    transform.rotation.set(0, item.r || 0, 0);
    transform.updateMatrix();
    mesh.setMatrixAt(i, transform.matrix);
    if (item.c) mesh.setColorAt(i, new THREE.Color(item.c));
  });
  mesh.instanceMatrix.needsUpdate = true;
  scene.add(mesh);
  return mesh;
}
function windowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 256;
  const c = canvas.getContext("2d");
  c.fillStyle = "#050911";
  c.fillRect(0, 0, 128, 256);
  for (let y = 5; y < 256; y += 9)
    for (let x = 4; x < 128; x += 10) {
      const v = rand();
      c.fillStyle =
        v > 0.62
          ? v > 0.91
            ? "#bdb395"
            : v > 0.82
              ? "#758ba0"
              : "#354858"
          : "#080f1a";
      c.fillRect(x, y, 3 + rand() * 3, 3);
    }
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  return t;
}
export function createEnvironment(scene) {
  scene.background = new THREE.Color("#060d1c");
  scene.fog = new THREE.FogExp2("#091222", 0.00048);
  scene.add(new THREE.HemisphereLight("#819bbf", "#101722", 1.1));
  const moonLight = new THREE.DirectionalLight("#829abb", 1.25);
  moonLight.position.set(-500, 900, 100);
  scene.add(moonLight);
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(4200, 32, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {},
      vertexShader:
        "varying vec3 vWorld;void main(){vWorld=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
      fragmentShader: `varying vec3 vWorld;void main(){float h=normalize(vWorld).y;vec3 c=mix(vec3(.008,.015,.033),vec3(.0015,.003,.009),smoothstep(-.05,.65,h));float haze=exp(-abs(h-.015)*13.);c+=vec3(.003,.003,.005)*haze;gl_FragColor=vec4(c,1.);}`,
    }),
  );
  sky.userData.skipDepth = true;
  scene.add(sky);
  const stars = [];
  for (let i = 0; i < 1100; i++) {
    const a = rand() * Math.PI * 2,
      h = 0.15 + rand() * 0.85,
      r = 3100;
    stars.push(
      Math.cos(a) * Math.sqrt(1 - h * h) * r,
      h * r,
      Math.sin(a) * Math.sqrt(1 - h * h) * r,
    );
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute("position", new THREE.Float32BufferAttribute(stars, 3));
  const starField = new THREE.Points(
    starGeo,
    new THREE.PointsMaterial({
      color: "#7f94b4",
      size: 1.4,
      sizeAttenuation: false,
      transparent: true,
      opacity: 0.36,
      depthWrite: false,
    }),
  );
  starField.userData.skipDepth = true;
  scene.add(starField);
  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(16, 24, 16),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color("#c8d5e9").multiplyScalar(1.5),
    }),
  );
  moon.position.set(-1250, 1150, -2300);
  scene.add(moon);
  // Distant ridge is actual geometry, so elevated cameras reveal its silhouette naturally.
  const mountainGeo = new THREE.BufferGeometry(),
    mp = [];
  for (let x = -3000; x < 3000; x += 90) {
    const h = 80 + Math.sin(x * 0.002) * 60 + rand() * 50;
    mp.push(
      x,
      -8,
      -1700,
      x,
      h,
      -1700,
      x + 90,
      -8,
      -1700,
      x,
      h,
      -1700,
      x + 90,
      70 + rand() * 80,
      -1700,
      x + 90,
      -8,
      -1700,
    );
  }
  mountainGeo.setAttribute("position", new THREE.Float32BufferAttribute(mp, 3));
  mountainGeo.computeVertexNormals();
  scene.add(
    new THREE.Mesh(
      mountainGeo,
      new THREE.MeshBasicMaterial({ color: "#0b1423", side: THREE.DoubleSide }),
    ),
  );
  const shoreMat = new THREE.MeshStandardMaterial({
    color: "#17202c",
    roughness: 0.95,
  });
  instances(
    scene,
    [
      { p: [0, -4, -920], s: [5600, 12, 1040] },
      { p: [0, -4, 1120], s: [5600, 12, 1320] },
    ],
    shoreMat,
  );
  instances(
    scene,
    [
      { p: [0, 1, -407], s: [5600, 5, 12] },
      { p: [0, 1, 462], s: [5600, 5, 12] },
    ],
    new THREE.MeshStandardMaterial({ color: "#424854", roughness: 1 }),
  );
  // Instanced buildings reuse geometry and a procedural lit-window texture.
  const tex = windowTexture();
  const buildingMat = new THREE.MeshStandardMaterial({
    map: tex,
    color: "#91a0b6",
    emissiveMap: tex,
    emissive: "#c4d0e0",
    emissiveIntensity: 1.5,
    roughness: 0.83,
    metalness: 0.2,
  });
  const buildings = [],
    roofs = [];
  for (const side of [-1, 1])
    for (let i = 0; i < (side < 0 ? 520 : 180); i++) {
      const x = (rand() - 0.5) * 4200,
        z = side < 0 ? -500 - rand() * 800 : 820 + rand() * 800;
      const h = 22 + Math.pow(rand(), 2.8) * 175,
        w = 20 + rand() * 46,
        d = 20 + rand() * 50;
      buildings.push({
        p: [x, h / 2 + 2, z],
        s: [w, h, d],
        c: side < 0 ? "#aeb7c5" : "#687589",
      });
      if (h > 100) roofs.push({ p: [x, h + 4, z], s: [0.8, 1, 0.8] });
    }
  // A golden landmark and slender glass towers suggest the Han River skyline.
  buildings.push(
    { p: [450, 130, -615], s: [53, 256, 47], c: "#e0b575" },
    { p: [-295, 157, -750], s: [45, 310, 40], c: "#95b3d4" },
    { p: [-230, 129, -750], s: [43, 252, 40], c: "#abc0d6" },
  );
  instances(scene, buildings, buildingMat);
  instances(
    scene,
    roofs,
    new THREE.MeshBasicMaterial({
      color: new THREE.Color("#f34453").multiplyScalar(2),
    }),
  );
  const towerTrim = [];
  for (const x of [-317, -273, -251, -209])
    towerTrim.push({ p: [x, 150, -727], s: [0.45, 265, 0.45] });
  instances(
    scene,
    towerTrim,
    new THREE.MeshBasicMaterial({ color: "#668899" }),
  );
  // Roads, embankment lights, and the foreground pedestrian railing.
  instances(
    scene,
    [
      { p: [0, 2.5, -445], s: [5500, 0.5, 40] },
      { p: [0, 2.5, 509], s: [5500, 0.5, 45] },
    ],
    new THREE.MeshStandardMaterial({ color: "#0d111a", roughness: 0.98 }),
  );
  const markings = [];
  for (let x = -2600; x < 2600; x += 22)
    for (const z of [-445, 509])
      markings.push({ p: [x, 2.8, z], s: [9, 0.08, 0.35] });
  instances(scene, markings, new THREE.MeshBasicMaterial({ color: "#82765a" }));
  const poles = [],
    bulbs = [],
    arms = [],
    pools = [];
  for (const z of [-416, 476])
    for (let x = -2400; x < 2400; x += 55) {
      poles.push({ p: [x, 8, z], s: [0.4, 13, 0.4] });
      arms.push({ p: [x + 2.2, 14.4, z], s: [4.8, 0.3, 0.4] });
      bulbs.push({ p: [x + 4, 14.2, z], s: [1.2, 0.45, 1] });
      pools.push({ p: [x + 4, 2.9, z], s: [17, 0.06, 9] });
    }
  const poleMat = new THREE.MeshStandardMaterial({
    color: "#34404c",
    metalness: 0.7,
    roughness: 0.5,
  });
  instances(scene, poles, poleMat);
  instances(scene, arms, poleMat);
  instances(
    scene,
    bulbs,
    new THREE.MeshBasicMaterial({
      color: new THREE.Color("#ffd89c").multiplyScalar(4),
    }),
  );
  instances(
    scene,
    pools,
    new THREE.MeshBasicMaterial({
      color: "#998267",
      transparent: true,
      opacity: 0.045,
      depthWrite: false,
    }),
  );
  // Real local lighting at the observation bank, without hundreds of shadow maps.
  for (let x = 150; x <= 425; x += 55) {
    const light = new THREE.PointLight("#ffd69b", 70, 43, 1.8);
    light.position.set(x, 13, 476);
    scene.add(light);
  }
  const rails = [];
  for (let x = -1400; x < 1400; x += 12)
    rails.push({ p: [x, 4, 463], s: [0.3, 5, 0.3] });
  for (const y of [4.8, 6.5])
    rails.push({ p: [0, y, 463], s: [2800, 0.22, 0.22] });
  instances(scene, rails, poleMat);
  // A cable-stayed bridge crosses the river to the west.
  const bridgeX = -720;
  instances(
    scene,
    [
      { p: [bridgeX, 24, 0], s: [30, 4, 920] },
      { p: [bridgeX - 9, 61, -190], s: [5, 120, 7] },
      { p: [bridgeX + 9, 61, -190], s: [5, 120, 7] },
      { p: [bridgeX - 9, 61, 190], s: [5, 120, 7] },
      { p: [bridgeX + 9, 61, 190], s: [5, 120, 7] },
    ],
    new THREE.MeshStandardMaterial({ color: "#424a58", roughness: 0.8 }),
  );
  const cables = [];
  for (const z of [-190, 190])
    for (const side of [-1, 1])
      for (let dz = -150; dz <= 150; dz += 22) {
        const a = new THREE.Vector3(bridgeX + side * 12, 26, z + dz),
          b = new THREE.Vector3(bridgeX + side * 9, 115, z),
          dir = b.clone().sub(a);
        const g = new THREE.CylinderGeometry(0.17, 0.17, dir.length(), 3);
        g.applyQuaternion(
          new THREE.Quaternion().setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            dir.normalize(),
          ),
        );
        g.translate(...a.add(b).multiplyScalar(0.5).toArray());
        cables.push(g);
      }
  const merged = mergeGeometries(cables);
  cables.forEach((g) => g.dispose());
  scene.add(
    new THREE.Mesh(merged, new THREE.MeshBasicMaterial({ color: "#717c83" })),
  );
  const bridgeLights = [];
  for (let z = -445; z <= 445; z += 17)
    for (const side of [-1, 1])
      bridgeLights.push({
        p: [bridgeX + side * 15, 27, z],
        s: [0.6, 0.6, 1.4],
      });
  instances(
    scene,
    bridgeLights,
    new THREE.MeshBasicMaterial({
      color: new THREE.Color("#f2c791").multiplyScalar(2.5),
    }),
  );
  // A single aligned firing platform with nine launch stations, as at the Han River festival.
  const barges = [{ p: [0, 1, 0], s: [580, 3, 18] }];
  for (const [x] of LAUNCH_SITES) barges.push({ p: [x, 3, 0], s: [12, 2, 9] });
  instances(
    scene,
    barges,
    new THREE.MeshStandardMaterial({
      color: "#24282b",
      roughness: 0.7,
      metalness: 0.5,
    }),
  );
  const bargeLights = [];
  for (const [x] of LAUNCH_SITES)
    for (const dx of [-22, 22])
      bargeLights.push({ p: [x + dx, 3, 7], s: [0.7, 0.5, 0.7] });
  instances(
    scene,
    bargeLights,
    new THREE.MeshBasicMaterial({
      color: new THREE.Color("#ffba71").multiplyScalar(3),
    }),
  );
  const cars = [];
  for (let i = 0; i < 90; i++)
    cars.push({
      x: (rand() - 0.5) * 5200,
      z: (i % 2 ? -445 : 509) + (i % 4 < 2 ? -6 : 6),
      dir: i % 4 < 2 ? 1 : -1,
      speed: 12 + rand() * 13,
      bridge: false,
    });
  for (let i = 0; i < 18; i++)
    cars.push({
      x: bridgeX + (i % 2 ? 6 : -6),
      z: (rand() - 0.5) * 890,
      dir: i % 2 ? 1 : -1,
      speed: 12 + rand() * 6,
      bridge: true,
    });
  const carBody = instances(
    scene,
    cars.map(() => ({ p: [0, 0, 0], s: [4.5, 1.4, 2] })),
    new THREE.MeshStandardMaterial({
      color: "#263345",
      metalness: 0.55,
      roughness: 0.4,
    }),
  );
  const headlights = instances(
    scene,
    Array.from({ length: cars.length * 4 }, () => ({
      p: [0, 0, 0],
      s: [0.5, 0.4, 0.5],
    })),
    new THREE.MeshBasicMaterial({ color: "white" }),
  );
  const warm = new THREE.Color("#ffedce").multiplyScalar(3),
    red = new THREE.Color("#ff3022").multiplyScalar(2);
  function traffic(dt) {
    cars.forEach((c, i) => {
      if (c.bridge) {
        c.z += c.dir * c.speed * dt;
        if (c.z > 450) c.z = -450;
        if (c.z < -450) c.z = 450;
      } else {
        c.x += c.dir * c.speed * dt;
        if (c.x > 2650) c.x = -2650;
        if (c.x < -2650) c.x = 2650;
      }
      const y = c.bridge ? 27 : 3.6;
      transform.position.set(c.x, y, c.z);
      transform.scale.set(4.5, 1.3, 2);
      transform.rotation.set(0, c.bridge ? Math.PI / 2 : 0, 0);
      transform.updateMatrix();
      carBody.setMatrixAt(i, transform.matrix);
      for (let j = 0; j < 4; j++) {
        const front = j < 2,
          along = (front ? 2.3 : -2.3) * c.dir,
          across = (j % 2 ? 1 : -1) * 0.72;
        transform.position.set(
          c.x + (c.bridge ? across : along),
          y + 0.05,
          c.z + (c.bridge ? along : across),
        );
        transform.scale.set(0.55, 0.38, 0.5);
        transform.rotation.set(0, 0, 0);
        transform.updateMatrix();
        headlights.setMatrixAt(i * 4 + j, transform.matrix);
        headlights.setColorAt(i * 4 + j, front ? warm : red);
      }
    });
    carBody.instanceMatrix.needsUpdate = true;
    headlights.instanceMatrix.needsUpdate = true;
    headlights.instanceColor.needsUpdate = true;
  }
  // Planar reflection rendered from the mirrored camera, then roughened in world-space.
  const waterShader = {
    uniforms: THREE.UniformsUtils.clone(Reflector.ReflectorShader.uniforms),
    vertexShader: `uniform mat4 textureMatrix;varying vec4 vUv;varying vec3 vWorld;void main(){vUv=textureMatrix*vec4(position,1.);vWorld=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: waterFragmentShader,
  };
  waterShader.uniforms.time = { value: 0 };
  waterShader.uniforms.roughness = { value: 0.55 };
  const water = new Reflector(new THREE.PlaneGeometry(7200, 870), {
    textureWidth: 1024,
    textureHeight: 512,
    clipBias: 0.003,
    multisample: 0,
    shader: waterShader,
  });
  water.rotation.x = -Math.PI / 2;
  water.position.set(0, 0, 27);
  scene.add(water);
  const originalReflect = water.onBeforeRender;
  water.onBeforeRender = function (...args) {
    if (!scene.userData.depthPass) originalReflect.apply(this, args);
  };
  return {
    water,
    update(dt, time) {
      traffic(dt);
      water.material.uniforms.time.value = time;
    },
    setQuality(q) {
      const width = q === "high" ? 1536 : q === "low" ? 512 : 1024;
      water.getRenderTarget().setSize(width, width / 2);
    },
  };
}
