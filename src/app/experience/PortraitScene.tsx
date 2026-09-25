import { useEffect, useRef, type RefObject } from "react";
import {
  BufferGeometry, Float32BufferAttribute, NoToneMapping, PerspectiveCamera,
  Points, Scene, ShaderMaterial, Vector2, WebGLRenderer,
} from "three";
import {
  fragmentShader, PORTRAIT_CROP, PORTRAIT_POINTS_SOURCE, portraitCamera, portraitFraming, portraitPhases, samplePortrait, vertexShader,
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
      renderer = new WebGLRenderer({ alpha: false, antialias: false, powerPreference: "high-performance" });
    } catch {
      onUnavailable();
      return;
    }
    const canvas = renderer.domElement;
    element.appendChild(canvas);
    renderer.setClearColor(0x060707, 1);
    renderer.toneMapping = NoToneMapping;
    const scene = new Scene();
    const camera = new PerspectiveCamera(40, 1, 0.1, 40);
    camera.position.z = 6;
    const geometry = new BufferGeometry();
    const uniforms = {
      uRelease: { value: 0 }, uEnding: { value: 0 },
      uTime: { value: 0 }, uDpr: { value: 1 }, uScale: { value: 1 },
      uAspect: { value: 1 }, uPixel: { value: 2 }, uPointer: { value: new Vector2() },
      uTurn: { value: 0 }, uSeparate: { value: 0 }, uLoosen: { value: 0 }, uDisperse: { value: 0 }, uFocus: { value: 6 },
      uPress: { value: 0 },
    };
    const material = new ShaderMaterial({
      uniforms, vertexShader, fragmentShader, transparent: true,
      // A translucent cloud, not an opaque surface. Depth-writing cores made
      // neighbouring samples switch occlusion as soon as the relief moved.
      depthWrite: false, depthTest: false,
    });
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
    let paintedFrames = 0;
    let warmFrames = 0;
    let wasPressed = false;
    let sizeDirty = true;
    let drawnWidth = 0;
    let drawnHeight = 0;
    let drawnRatio = 0;
    const fail = () => {
      if (disposed) return;
      loaded = false;
      cancelAnimationFrame(frame);
      onUnavailable();
    };
    renderer.debug.onShaderError = () => fail();
    const applySize = () => {
      if (!sizeDirty) return true;
      const { width, height } = element.getBoundingClientRect();
      if (!width || !height) return false;
      sizeDirty = false;
      const ratio = Math.min(window.devicePixelRatio || 1, quality);
      // Three clears the drawing buffer even for an unchanged setSize call.
      // Allocate only when necessary, and only immediately BEFORE painting.
      if (width !== drawnWidth || height !== drawnHeight || ratio !== drawnRatio) {
        renderer.setDrawingBufferSize(width, height, ratio);
        drawnWidth = width;
        drawnHeight = height;
        drawnRatio = ratio;
      }
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      const framing = portraitFraming(width, height);
      uniforms.uAspect.value = camera.aspect;
      uniforms.uDpr.value = ratio;
      // Fit the physical head (source u=0.29..0.99) on tall, narrow screens.
      // The peripheral constellation may extend off-screen; the face may not.
      uniforms.uScale.value = framing.scale;
      uniforms.uPixel.value = Math.max(1.25, framing.pixelHeight / sampleHeight * 1.8);
      return true;
    };
    const render = (now: number) => {
      frame = 0;
      if (disposed || !loaded || document.hidden) return;
      const elapsed = previous ? (now - previous) / 1000 : 0;
      const dt = Math.min(elapsed, 0.05);
      previous = now;
      slowFrames = dt > 0.032 ? slowFrames + 1 : Math.max(0, slowFrames - 1);
      if (slowFrames > 45 && quality > 1) {
        quality = 1;
        sizeDirty = true;
        slowFrames = 0;
      }
      if (!applySize()) return; // Wait for a measurable ResizeObserver update.
      const state = motion.current;
      uniforms.uRelease.value = state.release;
      const phase = portraitPhases(state.release);
      // The portrait turns on its own axis. It stays exactly where it is in
      // frame, so nothing can slide out of a narrow viewport, and the total
      // angle stays well short of showing the relief edge-on. The turn and the
      // dolly are what make the slices and relief read as parallax.
      uniforms.uTurn.value = phase.turn * 0.62;
      uniforms.uSeparate.value = phase.separate;
      uniforms.uLoosen.value = phase.loosen;
      uniforms.uDisperse.value = phase.disperse;
      uniforms.uEnding.value = state.ending;
      // The opening camera settles once. Page travel does not add another
      // movement while the circle gathers around the closing text.
      const cameraPosition = portraitCamera(state.release, camera.aspect);
      camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
      // The focal plane sits at the face pivot (z = 0) throughout the dolly.
      uniforms.uFocus.value = cameraPosition.z;
      if (!state.paused) uniforms.uTime.value += dt;
      pointer.set(state.pointerX, state.pointerY);
      const pressTarget = state.pressed && !state.paused && state.release < 0.18 ? 1 : 0;
      if (pressTarget && !wasPressed) uniforms.uPointer.value.copy(pointer);
      else uniforms.uPointer.value.lerp(pointer, 1 - Math.exp(-dt * 10));
      wasPressed = Boolean(pressTarget);
      uniforms.uPress.value += (pressTarget - uniforms.uPress.value) * (1 - Math.exp(-dt * 10));
      renderer.render(scene, camera);
      if (!loaded) return; // A shader error can occur synchronously in render.
      if (!ready) {
        paintedFrames++;
        // Do not remove the loading cover in the same frame that first paints
        // the canvas. A second complete frame gives the browser one compositor
        // turn to promote the WebGL surface before any scroll can wake it.
        if (paintedFrames >= 2) {
          ready = true;
          onReady();
        }
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
      warmFrames = Math.max(0, warmFrames - 1);
      if (!ready
        || warmFrames > 0
        || (!state.paused && state.release > 0.001)
        || Math.abs(pressTarget - uniforms.uPress.value) > 0.001
        || uniforms.uPointer.value.distanceToSquared(pointer) > 0.00001) {
        frame = requestAnimationFrame(render);
      }
    };
    const wake = () => {
      // Keep the WebGL surface active across the first wheel or touch frames.
      // A single invalidated frame can be composited after the page has moved,
      // which presents as a flash even though no poster is being swapped in.
      warmFrames = Math.max(warmFrames, 4);
      if (!frame && loaded && !disposed && !document.hidden) {
        previous = 0;
        frame = requestAnimationFrame(render);
      }
    };
    const resize = () => {
      const { width, height } = element.getBoundingClientRect();
      if (!sizeDirty && width === drawnWidth && height === drawnHeight
        && Math.min(window.devicePixelRatio || 1, quality) === drawnRatio) return;
      sizeDirty = true;
      wake();
    };
    motion.current.invalidate = wake;
    const visibility = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      previous = 0;
      if (document.hidden) { uniforms.uPress.value = 0; wasPressed = false; }
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
        const { width: cropWidth, height: cropHeight } = PORTRAIT_CROP;
        // The plate must be colour and depth side by side, or the depth
        // half would be sampled from the wrong region without complaint.
        if (image.naturalWidth !== cropWidth * 2 || image.naturalHeight !== cropHeight) {
          throw new Error("Portrait plate is not colour and depth side by side");
        }
        // One plate, two halves: colour on the left, depth on the right. Both
        // are resampled to the same grid so a point's colour and its relief
        // come from the same source pixel.
        const plane = (sourceX: number) => {
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = sampleHeight;
          const context = canvas.getContext("2d", { willReadFrequently: true });
          if (!context) throw new Error("Portrait sampling unavailable");
          context.drawImage(image, sourceX, 0, cropWidth, cropHeight, 0, 0, width, sampleHeight);
          return context.getImageData(0, 0, width, sampleHeight).data;
        };
        const data = samplePortrait(plane(0), plane(cropWidth), width, sampleHeight);
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
    image.src = PORTRAIT_POINTS_SOURCE;
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
      if (motion.current.invalidate === wake) delete motion.current.invalidate;
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    };
  }, [motion, onReady, onUnavailable]);
  return <div className="particle-renderer" ref={host} aria-hidden="true" />;
}
