import { HalfFloatType, Vector2, WebGLRenderTarget, type Camera, type Scene, type WebGLRenderer } from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

export type PortraitPost = {
  setSize: (width: number, height: number, ratio: number) => void;
  setGlow: (on: boolean) => void;
  render: () => void;
  dispose: () => void;
};

// The scene is drawn into a half-float buffer, so released dust can be
// brighter than white, and that excess is what the bloom spreads into glow.
// The photograph never exceeds white, so only its few brightest highlights
// reach the threshold and the opening frame stays a photograph.
export const createPortraitPost = (renderer: WebGLRenderer, scene: Scene, camera: Camera): PortraitPost => {
  const target = new WebGLRenderTarget(1, 1, { type: HalfFloatType });
  const composer = new EffectComposer(renderer, target);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new Vector2(1, 1), 0.62, 0.72, 0.8);
  composer.addPass(bloom);
  const output = new OutputPass();
  composer.addPass(output);
  return {
    setSize: (width, height, ratio) => {
      renderer.setPixelRatio(ratio);
      renderer.setSize(width, height, false);
      composer.setPixelRatio(ratio);
      composer.setSize(width, height);
    },
    setGlow: (on) => { bloom.enabled = on; },
    render: () => composer.render(),
    // The composer disposes its own two buffers (the first is `target`) but
    // not the passes added to it.
    dispose: () => { bloom.dispose(); output.dispose(); composer.dispose(); },
  };
};
