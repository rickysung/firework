import "./style.css";
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { createEnvironment } from "./environment.js";
import { Fireworks } from "./fireworks.js";
import { DepthOfFieldPass } from "./postprocessing.js";
import {
  createSequence,
  messageShells,
  chooseProgram,
  LABELS,
  makeShell,
} from "./choreography.js";
const $ = (id) => document.getElementById(id);
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
let renderer;
try {
  renderer = new THREE.WebGLRenderer({
    canvas: $("scene"),
    antialias: false,
    powerPreference: "high-performance",
  });
} catch (e) {
  $("loading").hidden = true;
  $("error").hidden = false;
  console.error(e);
}
if (renderer) {
  try {
    start();
  } catch (e) {
    $("loading").hidden = true;
    $("error").hidden = false;
    console.error(e);
  }
}
function start() {
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.setClearColor("#030712");
  const scene = new THREE.Scene(),
    camera = new THREE.PerspectiveCamera(52, innerWidth / innerHeight, 1, 6000);
  const environment = createEnvironment(scene),
    fireworks = new Fireworks(scene);
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const dof = new DepthOfFieldPass(scene, camera);
  composer.addPass(dof);
  const bloom = new UnrealBloomPass(
    new THREE.Vector2(innerWidth, innerHeight),
    0.48,
    0.3,
    1.2,
  );
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  let paused = reducedMotion,
    view = "river",
    mode = "auto",
    groundMode = "auto",
    quality = innerWidth < 600 ? "low" : "balanced",
    elapsed = 0,
    sequenceTime = 0,
    lastPattern = "basic",
    sequence = createSequence("basic"),
    nextShell = 0,
    nextRocket = 0,
    orbit = 0.98,
    noticeTimer,
    immersed = false,
    last = performance.now(),
    frameId;
  let pendingMessage = null,
    manualQueue = [],
    lastManual = -10,
    lastUI = 0,
    dofAmount = 0.12;
  const target = new THREE.Vector3(0, 175, -30),
    desiredTarget = target.clone(),
    desiredPosition = new THREE.Vector3();
  const lookDir = new THREE.Vector3(),
    focusVector = new THREE.Vector3();
  const views = {
    river: {
      position: [290, 18, 650],
      target: [0, 180, -25],
      caption: "강변 산책로 · 수면 위 18 m",
    },
    tower: {
      position: [500, 310, 740],
      target: [0, 130, -15],
      caption: "고층 전망대 · 수면 위 310 m",
    },
    heli: { caption: "헬리콥터 · 수면 위 370 m" },
  };
  camera.position.fromArray(views.river.position);
  camera.lookAt(target);
  $("quality").value = quality;
  function resize() {
    const ratio = Math.min(
      devicePixelRatio,
      quality === "high" ? 2 : quality === "low" ? 1 : 1.5,
    );
    renderer.setPixelRatio(ratio);
    renderer.setSize(innerWidth, innerHeight);
    composer.setPixelRatio(ratio);
    composer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.fov = innerWidth < 600 ? 68 : 52;
    camera.updateProjectionMatrix();
    fireworks.pixelScale = innerHeight * ratio * 1.1;
  }
  function setQuality() {
    quality = $("quality").value;
    environment.setQuality(quality);
    resize();
  }
  setQuality();
  addEventListener("resize", resize);
  function notify(message) {
    $("notice").textContent = message;
    $("notice").classList.add("visible");
    clearTimeout(noticeTimer);
    noticeTimer = setTimeout(
      () => $("notice").classList.remove("visible"),
      2800,
    );
  }
  function selectView(next) {
    view = next;
    document
      .querySelectorAll("[data-view]")
      .forEach((b) =>
        b.setAttribute("aria-pressed", String(b.dataset.view === view)),
      );
    $("view-caption").textContent = views[view].caption;
  }
  document
    .querySelectorAll("[data-view]")
    .forEach((b) =>
      b.addEventListener("click", () => selectView(b.dataset.view)),
    );
  function togglePause() {
    paused = !paused;
    updatePause();
  }
  function updatePause() {
    $("pause").textContent = paused ? "▷" : "Ⅱ";
    $("pause").setAttribute("aria-label", paused ? "재생" : "일시 정지");
  }
  updatePause();
  $("pause").addEventListener("click", togglePause);
  function setSettings(open) {
    $("settings").hidden = !open;
    $("settings-toggle").setAttribute("aria-expanded", String(open));
    if (open) $("settings-close").focus();
    else $("settings-toggle").focus();
  }
  $("settings-toggle").addEventListener("click", () =>
    setSettings($("settings").hidden),
  );
  $("settings-close").addEventListener("click", () => setSettings(false));
  function immersive(value) {
    immersed = value;
    $("app").classList.toggle("immersed", value);
    $("exit-immersive").hidden = !value;
    if (value) {
      $("settings").hidden = true;
      $("settings-toggle").setAttribute("aria-expanded", "false");
      $("exit-immersive").focus();
    } else $("immersive").focus();
  }
  $("immersive").addEventListener("click", () => immersive(true));
  $("exit-immersive").addEventListener("click", () => immersive(false));
  function nextPattern() {
    lastPattern = chooseProgram(lastPattern);
    return lastPattern;
  }
  $("ground-program").addEventListener("change", () => {
    groundMode = $("ground-program").value;
    beginSequence(
      mode === "auto"
        ? sequence.type === "message"
          ? "basic"
          : sequence.type
        : mode,
    );
  });
  $("pattern").addEventListener("change", () => {
    mode = $("pattern").value;
    beginSequence(mode === "auto" ? nextPattern() : mode);
  });
  function range(id, callback) {
    $(id).addEventListener("input", () => {
      const v = Number($(id).value);
      $(id + "-value").value = v + "%";
      callback(v / 100);
    });
  }
  range("bloom", (v) => {
    bloom.strength = v * 0.74;
    bloom.enabled = v > 0;
  });
  range(
    "water",
    (v) => (environment.water.material.uniforms.roughness.value = v),
  );
  range("dof", (v) => {
    dofAmount = v;
    dof.enabled = v > 0;
  });
  $("focus").addEventListener("input", () => {
    $("autofocus").checked = false;
    updateFocusLabel();
  });
  $("autofocus").addEventListener("change", updateFocusLabel);
  function updateFocusLabel() {
    $("focus-value").value = $("autofocus").checked
      ? "자동 · 불꽃"
      : $("focus").value + " m";
  }
  $("quality").addEventListener("change", setQuality);
  function beginSequence(type) {
    sequence =
      typeof type === "string"
        ? createSequence(type, Math.random, groundMode)
        : type;
    sequenceTime = 0;
    nextShell = 0;
    nextRocket = 0;
    $("show-name").textContent = LABELS[sequence.type];
  }
  function queueMessage(text) {
    if (!text.trim()) {
      notify("하늘에 남길 영문 또는 숫자를 입력해 주세요.");
      return;
    }
    if (/[^A-Za-z0-9\s+]/.test(text)) {
      notify("글자 불꽃은 영문과 숫자를 지원합니다.");
      return;
    }
    const show = messageShells(text);
    if (!show.shells.length) return;
    pendingMessage = show;
    notify("다음 시퀀스에 글자 불꽃이 펼쳐집니다.");
  }
  $("message-form").addEventListener("submit", (e) => {
    e.preventDefault();
    queueMessage($("message").value);
  });
  const initialText = new URLSearchParams(location.search).get("text");
  if (initialText) {
    $("message").value = initialText.slice(0, 24);
    const show = messageShells(initialText);
    if (show.shells.length) pendingMessage = show;
  }
  function launch() {
    if (elapsed - lastManual < 0.8 && !paused) return;
    lastManual = elapsed;
    if (paused) {
      paused = false;
      updatePause();
    }
    const spec = makeShell(mode === "auto" ? "massive" : mode);
    fireworks.rocket(spec, spec.flight);
    manualQueue.push({ spec, at: elapsed + spec.flight });
  }
  $("launch").addEventListener("click", launch);
  addEventListener("keydown", (e) => {
    if (e.code === "Escape") {
      if (immersed) immersive(false);
      else if (!$("settings").hidden) setSettings(false);
      return;
    }
    if (/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
    if (e.code === "Space" && e.target.tagName === "BUTTON") return;
    if (e.code === "Space") {
      e.preventDefault();
      togglePause();
    }
    if (["1", "2", "3"].includes(e.key))
      selectView(["river", "tower", "heli"][Number(e.key) - 1]);
    if (e.key.toLowerCase() === "f") immersive(!immersed);
  });
  document.addEventListener("visibilitychange", () => {
    last = performance.now();
  });
  $("scene").addEventListener("webglcontextlost", (e) => {
    e.preventDefault();
    cancelAnimationFrame(frameId);
    $("error-detail").textContent =
      "그래픽 연결이 끊어졌습니다. 다시 시도하면 공연을 새로 시작합니다.";
    $("error").hidden = false;
  });
  // An opening tableau avoids an empty first screen; subsequent shots all rise from the barge line.
  for (const [i, x] of [-200, 20, 220].entries()) {
    fireworks.burst(
      makeShell("basic", {
        style: ["chrysanthemum", "peony", "willow"][i],
        position: [x, 235 + i * 25, [-100, 115, -45][i]],
        color: ["#8fcfff", "#ffdeb0", "#ffd394"][i],
      }),
      [0.8, 1.4, 2.0][i],
    );
  }
  function tick(now) {
    frameId = requestAnimationFrame(tick);
    if (document.hidden) {
      last = now;
      return;
    }
    const raw = Math.max(0, (now - last) / 1000);
    last = now;
    const dt = paused || document.hidden ? 0 : Math.min(raw, 0.05);
    elapsed += dt;
    sequenceTime += dt;
    if (dt > 0) {
      fireworks.update(dt);
      while (
        nextRocket < sequence.launches.length &&
        sequence.launches[nextRocket].at -
          sequence.launches[nextRocket].flight <=
          sequenceTime
      ) {
        const s = sequence.launches[nextRocket++];
        fireworks.rocket(s, s.at - sequenceTime);
      }
      while (
        nextShell < sequence.shells.length &&
        sequence.shells[nextShell].at <= sequenceTime
      ) {
        const s = sequence.shells[nextShell++];
        fireworks.burst(s, Math.max(0, sequenceTime - s.at));
      }
      for (let i = manualQueue.length - 1; i >= 0; i--)
        if (manualQueue[i].at <= elapsed) {
          fireworks.burst(manualQueue[i].spec, elapsed - manualQueue[i].at);
          manualQueue.splice(i, 1);
        }
      if (sequenceTime >= (sequence.transitionAt ?? sequence.duration)) {
        if (pendingMessage) {
          beginSequence(pendingMessage);
          pendingMessage = null;
        } else beginSequence(mode === "auto" ? nextPattern() : mode);
      }
      environment.update(dt, elapsed);
    }
    if (view === "heli") {
      orbit += dt * 0.024;
      desiredPosition.set(
        Math.cos(orbit) * 830,
        370 + Math.sin(orbit * 0.7) * 25,
        Math.sin(orbit) * 760,
      );
      desiredTarget.set(0, 140, 0);
    } else {
      desiredPosition.fromArray(views[view].position);
      desiredTarget.fromArray(views[view].target);
    }
    const blend = reducedMotion ? 1 : 1 - Math.exp(-Math.min(raw, 0.05) * 2.1);
    camera.position.lerp(desiredPosition, blend);
    target.lerp(desiredTarget, blend);
    camera.lookAt(target);
    camera.getWorldDirection(lookDir);
    focusVector.set(0, 230, 0).sub(camera.position);
    const focus = $("autofocus").checked
      ? Math.max(50, focusVector.dot(lookDir))
      : Number($("focus").value);
    dof.uniforms.focus.value = focus;
    dof.uniforms.aperture.value = dofAmount * 0.000095;
    dof.uniforms.maxblur.value = dofAmount * 0.025;
    composer.render(dt);
    if (now - lastUI > 150) {
      lastUI = now;
      $("elapsed").textContent =
        String(Math.floor(elapsed / 60)).padStart(2, "0") +
        ":" +
        String(Math.floor(elapsed % 60)).padStart(2, "0");
      $("progress-fill").style.width =
        Math.min(
          100,
          (sequenceTime / (sequence.transitionAt ?? sequence.duration)) * 100,
        ) + "%";
    }
  }
  environment.update(0, 0);
  frameId = requestAnimationFrame(tick);
  $("loading").style.opacity = "0";
  setTimeout(() => ($("loading").hidden = true), 650);
  if (reducedMotion)
    notify(
      "동작 줄이기 설정에 따라 정지 상태로 시작합니다. 재생 버튼으로 시작하세요.",
    );
}
