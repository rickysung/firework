import * as THREE from "three";
import { Pass, FullScreenQuad } from "three/addons/postprocessing/Pass.js";
import { BokehShader } from "three/addons/shaders/BokehShader.js";
// Unlike a scene-wide overrideMaterial, per-object depth materials preserve GPU particle trajectories.
export class DepthOfFieldPass extends Pass {
  constructor(scene, camera) {
    super();
    this.scene = scene;
    this.camera = camera;
    this.target = new THREE.WebGLRenderTarget(1, 1, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
    });
    this.depthMaterial = new THREE.MeshDepthMaterial({
      depthPacking: THREE.RGBADepthPacking,
      blending: THREE.NoBlending,
    });
    this.uniforms = THREE.UniformsUtils.clone(BokehShader.uniforms);
    this.uniforms.tDepth.value = this.target.texture;
    this.uniforms.focus.value = 700;
    this.uniforms.aperture.value = 0.00002;
    this.uniforms.maxblur.value = 0.008;
    this.material = new THREE.ShaderMaterial({
      defines: { ...BokehShader.defines },
      uniforms: this.uniforms,
      vertexShader: BokehShader.vertexShader,
      fragmentShader: BokehShader.fragmentShader,
    });
    this.quad = new FullScreenQuad(this.material);
    this.oldColor = new THREE.Color();
  }
  render(renderer, writeBuffer, readBuffer) {
    const replaced = [],
      hidden = [];
    const background = this.scene.background;
    this.scene.background = null;
    const autoClear = renderer.autoClear;
    renderer.getClearColor(this.oldColor);
    const alpha = renderer.getClearAlpha();
    this.scene.traverse((o) => {
      if (!o.visible) return;
      if (o.userData.skipDepth) {
        hidden.push(o);
        o.visible = false;
      } else if (o.material) {
        replaced.push([o, o.material]);
        o.material = o.customDepthMaterial || this.depthMaterial;
      }
    });
    this.scene.userData.depthPass = true;
    try {
      renderer.setClearColor(0xffffff, 1);
      renderer.setRenderTarget(this.target);
      renderer.clear();
      renderer.render(this.scene, this.camera);
    } finally {
      for (const [o, m] of replaced) o.material = m;
      for (const o of hidden) o.visible = true;
      this.scene.userData.depthPass = false;
      this.scene.background = background;
      renderer.setClearColor(this.oldColor, alpha);
      renderer.autoClear = autoClear;
    }
    this.uniforms.tColor.value = readBuffer.texture;
    this.uniforms.nearClip.value = this.camera.near;
    this.uniforms.farClip.value = this.camera.far;
    renderer.setRenderTarget(this.renderToScreen ? null : writeBuffer);
    if (this.clear) renderer.clear();
    this.quad.render(renderer);
  }
  setSize(w, h) {
    this.target.setSize(w, h);
    this.uniforms.aspect.value = w / h;
  }
  dispose() {
    this.target.dispose();
    this.depthMaterial.dispose();
    this.material.dispose();
    this.quad.dispose();
  }
}
