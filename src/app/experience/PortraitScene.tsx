import { useEffect, useRef, type RefObject } from "react";
import {
  BufferGeometry, Float32BufferAttribute, NoToneMapping, PerspectiveCamera,
  Points, Scene, ShaderMaterial, Vector2, WebGLRenderer,
} from "three";
import {
  fragmentShader, PORTRAIT_CROP, portraitFraming, portraitPhases, portraitSource, samplePortrait, vertexShader,
  type ParticleMotion,
} from "./portrait-particles";

type Props = {
  motion: RefObject<ParticleMotion>;
  onReady: () => void;
  onUnavailable: () => void;
};

export default function PortraitScene({ motion, onReady, onUnavailable }: Props) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ alpha: true, antialias: false, powerPreference: "high-performance" });
    } catch {
      onUnavailable();
      return;
    }
    const canvas = renderer.domElement;
    element.appendChild(canvas);
    renderer.setClearColor(0x060707, 0);
    renderer.toneMapping = NoToneMapping;
    const scene = new Scene();
    const camera = new PerspectiveCamera(40, 1, 0.1, 40);
    camera.position.z = 6;
    const geometry = new BufferGeometry();
    const uniforms = {
      uRelease: { value: 0 }, uTravel: { value: 0 }, uEnding: { value: 0 },
      uTime: { value: 0 }, uDpr: { value: 1 }, uScale: { value: 1 },
      uAspect: { value: 1 }, uPixel: { value: 2 }, uPointer: { value: new Vector2() },
      uSeparate: { value: 0 }, uDissolve: { value: 0 }, uPress: { value: 0 }, uHover: { value: 0 },
    };
    const material = new ShaderMaterial({
      uniforms, vertexShader, fragmentShader, transparent: true,
      depthWrite: false, depthTest: true,
    });
    const cores = new ShaderMaterial({ uniforms, vertexShader, fragmentShader, defines: { CORE_PASS: "" }, depthWrite: true, depthTest: true });
    const corePoints = new Points(geometry, cores);
    corePoints.frustumCulled = false;
    scene.add(corePoints);
    const points = new Points(geometry, material);
    points.renderOrder = 1;
    const pointer = new Vector2();
    points.frustumCulled = false;
    scene.add(points);
    let disposed = false;
    let loaded = false;
    let frame = 0;
    let previous = 0;
    let sampleHeight = 594;
    let quality = window.innerWidth < 700 ? 1.35 : 1.75;
    let slowFrames = 0;
    let measuredFrames = 0;
    let totalFrameTime = 0;
    let ready = false;
    let wasPressed = false;
    const fail = () => {
      if (disposed) return;
      loaded = false;
      cancelAnimationFrame(frame);
      onUnavailable();
    };
    renderer.debug.onShaderError = () => fail();
    const resize = () => {
      const { width, height } = element.getBoundingClientRect();
      if (!width || !height) return;
      const ratio = Math.min(window.devicePixelRatio || 1, quality);
      renderer.setPixelRatio(ratio);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      const framing = portraitFraming(width, height);
      uniforms.uAspect.value = camera.aspect;
      uniforms.uDpr.value = ratio;
      // Fit the physical head (source u=0.29..0.99) on tall, narrow screens.
      // The peripheral constellation may extend off-screen; the face may not.
      uniforms.uScale.value = framing.scale;
      uniforms.uPixel.value = Math.max(1.25, framing.pixelHeight / sampleHeight * 1.55);
      wake();
    };
    const render = (now: number) => {
      frame = 0;
      if (disposed || !loaded || document.hidden) return;
      const elapsed = previous ? (now - previous) / 1000 : 0;
      const dt = Math.min(elapsed, 0.05);
      previous = now;
      const state = motion.current;
      uniforms.uRelease.value = state.release;
      const phase = portraitPhases(state.release);
      uniforms.uSeparate.value = phase.separate;
      uniforms.uDissolve.value = phase.dissolve;
      uniforms.uTravel.value = state.travel;
      uniforms.uEnding.value = state.ending;
      const cameraT = Math.min(1, Math.max(0, (phase.separate - 0.58) / 0.42));
      const cameraEase = cameraT * cameraT * (3 - 2 * cameraT);
      const advance = cameraEase * (1 - phase.dissolve);
      camera.position.z = 6 - advance * 0.88 - state.travel * 0.35;
      camera.position.x = advance * 0.24;
      camera.position.y = -state.travel * 0.18 * (1 - state.ending);
      if (!state.paused) uniforms.uTime.value += dt;
      pointer.set(state.pointerX, state.pointerY);
      const pressTarget = state.pressed && !state.paused && state.release < 0.18 ? 1 : 0;
      const hoverTarget = state.pointerActive && !state.paused && state.release < 0.22 ? 1 : 0;
      if (pressTarget && !wasPressed) uniforms.uPointer.value.copy(pointer);
      else uniforms.uPointer.value.lerp(pointer, 1 - Math.exp(-dt * 10));
      wasPressed = Boolean(pressTarget);
      uniforms.uPress.value += (pressTarget - uniforms.uPress.value) * (1 - Math.exp(-dt * 10));
      uniforms.uHover.value += (hoverTarget - uniforms.uHover.value) * (1 - Math.exp(-dt * 7));
      renderer.render(scene, camera);
      if (!loaded) return; // A shader error can occur synchronously in render.
      if (!ready) {
        ready = true;
        onReady();
      }
      // Expose a small diagnostic on the actual rendered canvas for review.
      // No per-frame React updates or particle-buffer uploads are required.
      measuredFrames++;
      totalFrameTime += elapsed;
      if (measuredFrames === 120) {
        canvas.dataset.fps = String(Math.round(120 / Math.max(0.001, totalFrameTime)));
        measuredFrames = 0;
        totalFrameTime = 0;
      }
      slowFrames = dt > 0.032 ? slowFrames + 1 : Math.max(0, slowFrames - 1);
      if (slowFrames > 45 && quality > 1) {
        quality = 1;
        resize();
        slowFrames = 0;
      }
      if ((!state.paused && state.release > 0.001)
        || Math.abs(pressTarget - uniforms.uPress.value) > 0.001
        || Math.abs(hoverTarget - uniforms.uHover.value) > 0.001
        || uniforms.uPointer.value.distanceToSquared(pointer) > 0.00001) {
        frame = requestAnimationFrame(render);
      }
    };
    const wake = () => {
      if (!frame && loaded && !disposed && !document.hidden) {
        previous = 0;
        frame = requestAnimationFrame(render);
      }
    };
    motion.current.invalidate = wake;
    const visibility = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      previous = 0;
      if (document.hidden) { uniforms.uPress.value = 0; uniforms.uHover.value = 0; wasPressed = false; }
      if (!document.hidden && loaded) frame = requestAnimationFrame(render);
    };
    const contextLost = (event: Event) => { event.preventDefault(); fail(); };
    canvas.addEventListener("webglcontextlost", contextLost);
    document.addEventListener("visibilitychange", visibility);
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    resize();
    const image = new Image();
    image.onload = () => {
      if (disposed) return;
      try {
        const width = window.innerWidth < 700 ? 400 : 640;
        sampleHeight = Math.round(width * PORTRAIT_CROP.height / PORTRAIT_CROP.width);
        const sample = document.createElement("canvas");
        sample.width = width;
        sample.height = sampleHeight;
        const context = sample.getContext("2d", { willReadFrequently: true });
        if (!context) throw new Error("Portrait sampling unavailable");
        const { x, y, width: cropWidth, height: cropHeight } = PORTRAIT_CROP;
        context.drawImage(image, x, y, cropWidth, cropHeight, 0, 0, width, sampleHeight);
        const data = samplePortrait(context.getImageData(0, 0, width, sampleHeight).data, width, sampleHeight);
        geometry.setAttribute("position", new Float32BufferAttribute(data.positions, 3));
        geometry.setAttribute("aColour", new Float32BufferAttribute(data.colours, 3));
        geometry.setAttribute("aSeed", new Float32BufferAttribute(data.seeds, 4));
        geometry.setAttribute("aDepth", new Float32BufferAttribute(data.depths, 1));
        canvas.dataset.particles = String(data.positions.length / 3);
        loaded = true;
        resize();
        wake();
      } catch { fail(); }
    };
    image.onerror = fail;
    image.src = portraitSource;
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      image.onload = null;
      image.onerror = null;
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      canvas.removeEventListener("webglcontextlost", contextLost);
      geometry.dispose();
      material.dispose();
      cores.dispose();
      if (motion.current.invalidate === wake) delete motion.current.invalidate;
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    };
  }, [motion, onReady, onUnavailable]);
  return <div className="particle-renderer" ref={host} aria-hidden="true" />;
}
