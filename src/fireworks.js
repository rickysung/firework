import * as THREE from "three";
import {
  buildStars,
  secondaryBursts,
  profileFor,
  particleEnd,
  rocketPosition,
  seededRandom,
} from "./pyrotechnics.js";
// All render passes use this exact motion, including the mirrored river and the particle depth pass.
const motion = `
  attribute vec3 velocity;
  attribute vec4 dynamics;
  attribute vec4 appearance;
  attribute vec2 chroma;
  attribute float trailIndex;
  uniform float age;
  uniform float gravity;
  uniform float pixelScale;
  uniform vec3 wind;
  varying float vAlpha;
  varying float vCooling;
  varying float vColorMix;
  varying float vTail;
  vec3 getPosition() {
    float drag=dynamics.x, life=dynamics.y, tail=dynamics.z, delay=dynamics.w;
    float seed=appearance.x, flutter=appearance.w;
    float lag=trailIndex*tail;
    float t=max(0.0,age-delay-lag);
    float travel=(1.0-exp(-drag*t))/drag;
    vec3 point=position+velocity*travel+wind*(t-travel);
    point.y-=gravity/drag*(t-travel);
    point.x+=(sin(t*1.7+seed*20.)-sin(seed*20.))*flutter*t*.3;
    point.z+=(sin(t*1.3+seed*31.)-sin(seed*31.))*flutter*t*.3;
    // Shed embers continue to sink and drift after leaving the burning pellet.
    point+=wind*lag*lag*.32;
    point.y-=gravity*.12*lag*lag;
    vAlpha=smoothstep(0.,.035,t)*(1.-smoothstep(life*.48,life,t));
    vAlpha*=exp(-trailIndex*2.8)*appearance.z;
    float shimmer=.8+.2*sin(t*(11.+seed*17.)+seed*103.);
    float flash=pow(max(0.,sin(t*(13.+seed*15.)+seed*63.)*sin(t*4.7+seed*20.)),3.);
    vAlpha*=mix(shimmer,.07+flash*2.9,chroma.y)*step(delay+lag,age);
    vCooling=clamp(t/life,0.,1.);
    vColorMix=chroma.x;
    vTail=trailIndex;
    return point;
  }
  float pointSize(float z) {
    return clamp(pixelScale*appearance.y*(1.-trailIndex*.35)/max(20.,-z),.65,9.);
  }
`;
const vertexShader =
  motion +
  `void main(){vec4 mv=modelViewMatrix*vec4(getPosition(),1.);gl_Position=projectionMatrix*mv;gl_PointSize=pointSize(mv.z);}`;
const fragmentShader = `
  uniform vec3 tint;uniform vec3 accent;
  varying float vAlpha;varying float vCooling;varying float vColorMix;varying float vTail;
  void main(){
    float r=length(gl_PointCoord-.5)*2.;if(r>1.||vAlpha<.004)discard;
    float core=exp(-r*r*10.),glow=exp(-r*r*3.)*.22;
    vec3 c=mix(tint,accent,vColorMix);
    c=mix(c,vec3(1.,.42,.12),smoothstep(.55,1.,vCooling)*(.3+vTail*.38));
    c=mix(c,vec3(1.,.89,.68),(1.-smoothstep(0.,.09,vCooling))*.35);
    gl_FragColor=vec4(c*(1.6+core*1.2),vAlpha*(core+glow)*.95);
  }
`;
const depthVertex =
  motion +
  `varying vec2 vHighPrecisionZW;void main(){vec4 mv=modelViewMatrix*vec4(getPosition(),1.);gl_Position=projectionMatrix*mv;gl_PointSize=pointSize(mv.z);vHighPrecisionZW=gl_Position.zw;}`;
const depthFragment = `
  #include <packing>
  varying vec2 vHighPrecisionZW;varying float vAlpha;
  void main(){if(length(gl_PointCoord-.5)>.48||vAlpha<.12)discard;gl_FragColor=packDepthToRGBA(.5*vHighPrecisionZW.x/vHighPrecisionZW.y+.5);}
`;
const rocketVertex = `attribute float alpha;attribute float size;attribute vec3 tint;uniform float pixelScale;varying float vAlpha;varying vec3 vTint;void main(){vAlpha=alpha;vTint=tint;vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(pixelScale*size/max(20.,-mv.z),.6,8.);}`;
const rocketFragment = `varying float vAlpha;varying vec3 vTint;void main(){float r=length(gl_PointCoord-.5)*2.;if(r>1.)discard;gl_FragColor=vec4(vTint*2.4,exp(-r*r*6.)*vAlpha);}`;
export class Fireworks {
  constructor(scene, { smoke = true } = {}) {
    this.scene = scene;
    this.bursts = [];
    this.rockets = [];
    this.smoke = [];
    this.time = 0;
    this.pixelScale = 1200;
    this.maxBursts = 420;
    this.maxVertices = 580000;
    this.liveVertices = 0;
    this.smokeMap = null;
    if (smoke) {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 128;
      const ctx = canvas.getContext("2d"),
        g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      g.addColorStop(0, "rgba(160,168,190,.20)");
      g.addColorStop(0.35, "rgba(115,129,156,.10)");
      g.addColorStop(1, "rgba(75,89,110,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 128, 128);
      this.smokeMap = new THREE.CanvasTexture(canvas);
    }
  }
  burst(spec, initialAge = 0) {
    if (this.bursts.length >= this.maxBursts) return false;
    const profile = profileFor(spec),
      trails = spec.trails ?? profile.trails;
    const stars = buildStars(spec),
      children = secondaryBursts(spec, stars),
      count = stars.length * trails;
    if (this.liveVertices + count > this.maxVertices) return false;
    const end = Math.max(
      ...stars.map(particleEnd),
      ...children.map((c) => c.at),
    );
    if (initialAge > end) {
      for (const c of children) this.burst(c, initialAge - c.at);
      return false;
    }
    const positions = new Float32Array(count * 3),
      velocities = new Float32Array(count * 3),
      dynamics = new Float32Array(count * 4),
      appearance = new Float32Array(count * 4),
      chroma = new Float32Array(count * 2),
      lags = new Float32Array(count);
    let k = 0;
    for (const star of stars)
      for (let j = 0; j < trails; j++, k++) {
        velocities.set(star.velocity, k * 3);
        dynamics.set([star.drag, star.life, star.tail, star.delay], k * 4);
        appearance.set(
          [star.seed, star.size, star.brightness, star.flutter],
          k * 4,
        );
        chroma.set([star.colorMix, star.strobe], k * 2);
        lags[k] =
          j === 0
            ? 0
            : Math.min(
                1,
                (j + Math.sin(star.seed * 72 + j * 8) * 0.23) / (trails - 1),
              );
      }
    const geometry = new THREE.BufferGeometry();
    for (const [name, data, size] of [
      ["position", positions, 3],
      ["velocity", velocities, 3],
      ["dynamics", dynamics, 4],
      ["appearance", appearance, 4],
      ["chroma", chroma, 2],
      ["trailIndex", lags, 1],
    ])
      geometry.setAttribute(name, new THREE.BufferAttribute(data, size));
    const uniforms = {
      age: { value: initialAge },
      gravity: { value: spec.gravity ?? (spec.type === "letter" ? 0.7 : 9.81) },
      wind: { value: new THREE.Vector3(...(spec.wind || [2.4, 0.1, 0.9])) },
      pixelScale: { value: this.pixelScale },
      tint: { value: new THREE.Color(spec.color) },
      accent: { value: new THREE.Color(spec.accentColor || "#ffe4b9") },
    };
    const points = new THREE.Points(
      geometry,
      new THREE.ShaderMaterial({
        uniforms,
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    points.position.fromArray(spec.position);
    points.frustumCulled = false;
    points.userData.firework = true;
    points.customDepthMaterial = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: depthVertex,
      fragmentShader: depthFragment,
    });
    this.scene.add(points);
    this.liveVertices += count;
    this.bursts.push({
      points,
      spec,
      age: initialAge,
      end,
      children,
      nextChild: 0,
    });
    if (
      this.smokeMap &&
      !["galaxy", "letter", "fan", "branch", "crackle"].includes(spec.type)
    ) {
      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: this.smokeMap,
          color: new THREE.Color(spec.color).lerp(
            new THREE.Color("#637087"),
            0.75,
          ),
          transparent: true,
          opacity: 0.15,
          depthWrite: false,
        }),
      );
      sprite.position.fromArray(spec.position);
      sprite.scale.set(50, 50, 1);
      sprite.userData.skipDepth = true;
      this.scene.add(sprite);
      this.smoke.push({ sprite, age: initialAge });
    }
    return true;
  }
  rocket(spec, remaining) {
    if (!spec.rocket || remaining <= 0 || this.rockets.length >= 48) return;
    const total = spec.flight ?? 1.55,
      rng = seededRandom(spec.seed ?? 42),
      count = 82,
      geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3),
      alphas = new Float32Array(count),
      sizes = new Float32Array(count),
      colors = new Float32Array(count * 3);
    const samples = Array.from({ length: count }, (_, i) => ({
      lag: i === 0 ? 0 : (i / count) ** 1.2 * (spec.rocketTail ?? 0.35),
      seed: rng(),
    }));
    const color = new THREE.Color();
    samples.forEach((s, i) => {
      alphas[i] = Math.exp((-i / count) * 3.1) * (0.7 + s.seed * 0.3);
      sizes[i] = (0.6 + s.seed * 0.8) * (1 - (i / count) * 0.55);
      color.set(i < 5 ? "#ffe6bd" : i < count * 0.5 ? "#f9b966" : "#b85c28");
      colors.set(color.toArray(), i * 3);
    });
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("alpha", new THREE.BufferAttribute(alphas, 1));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute("tint", new THREE.BufferAttribute(colors, 3));
    const points = new THREE.Points(
      geometry,
      new THREE.ShaderMaterial({
        uniforms: { pixelScale: { value: this.pixelScale } },
        vertexShader: rocketVertex,
        fragmentShader: rocketFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    points.frustumCulled = false;
    points.userData.skipDepth = true;
    this.scene.add(points);
    const rocket = { points, spec, remaining, total, samples };
    this.rockets.push(rocket);
    this.updateRocket(rocket);
  }
  updateRocket(r) {
    const a = r.points.geometry.attributes.position;
    r.samples.forEach((sample, j) => {
      const p = (r.total - r.remaining - sample.lag) / r.total,
        point = rocketPosition(r.spec, p);
      const wake = Math.max(0, sample.lag) * Math.min(1, Math.max(0, p) * 12);
      a.setXYZ(
        j,
        point[0] + Math.sin(sample.seed * 53) * wake * 3,
        point[1] - wake * wake * 6,
        point[2] + Math.sin(sample.seed * 32) * wake * 3,
      );
    });
    a.needsUpdate = true;
    r.points.material.uniforms.pixelScale.value = this.pixelScale;
  }
  update(dt) {
    this.time += dt;
    for (let i = this.bursts.length - 1; i >= 0; i--) {
      const b = this.bursts[i];
      b.age += dt;
      b.points.material.uniforms.age.value = b.age;
      b.points.material.uniforms.pixelScale.value = this.pixelScale;
      while (
        b.nextChild < b.children.length &&
        b.children[b.nextChild].at <= b.age
      ) {
        const child = b.children[b.nextChild++];
        this.burst(child, b.age - child.at);
      }
      if (b.age > b.end) {
        this.liveVertices -= b.points.geometry.attributes.position.count;
        this.remove(b.points);
        this.bursts.splice(i, 1);
      }
    }
    for (let i = this.rockets.length - 1; i >= 0; i--) {
      const r = this.rockets[i];
      r.remaining -= dt;
      if (r.remaining <= 0) {
        this.remove(r.points);
        this.rockets.splice(i, 1);
      } else this.updateRocket(r);
    }
    for (let i = this.smoke.length - 1; i >= 0; i--) {
      const s = this.smoke[i];
      s.age += dt;
      s.sprite.position.x += dt * 3;
      s.sprite.position.y += dt * 1.5;
      s.sprite.scale.setScalar(50 + s.age * 26);
      s.sprite.material.opacity = 0.12 * Math.max(0, 1 - s.age / 9);
      if (s.age > 9) {
        this.scene.remove(s.sprite);
        s.sprite.material.dispose();
        this.smoke.splice(i, 1);
      }
    }
  }
  remove(points) {
    this.scene.remove(points);
    points.geometry.dispose();
    points.material.dispose();
    points.customDepthMaterial?.dispose();
  }
  clear() {
    for (const b of this.bursts) this.remove(b.points);
    for (const r of this.rockets) this.remove(r.points);
    for (const s of this.smoke) {
      this.scene.remove(s.sprite);
      s.sprite.material.dispose();
    }
    this.bursts = [];
    this.rockets = [];
    this.smoke = [];
    this.liveVertices = 0;
  }
  dispose() {
    this.clear();
    this.smokeMap?.dispose();
  }
  get particleCount() {
    return this.liveVertices;
  }
}
