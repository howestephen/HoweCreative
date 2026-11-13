import { useEffect, useRef, type RefObject } from "react";
import {
  BufferGeometry, Color, Float32BufferAttribute, NoToneMapping, NormalBlending, PerspectiveCamera,
  Points, Scene, ShaderMaterial, Vector2, Vector3, WebGLRenderer,
} from "three";
import {
  fragmentShader, LENS_DISTANCE, LENS_FOV, PLATE_HEIGHT, PLATE_SCALE, PORTRAIT_CROP, PORTRAIT_POINTS_SOURCE,
  portraitCamera, portraitFraming, samplePortrait, smooth, vertexShader,
  type ParticleMotion,
} from "./portrait-particles";
import { createPortraitPost, type PortraitPost } from "./portrait-post";

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
    let created: WebGLRenderer | undefined;
    let renderer: WebGLRenderer;
    let post: PortraitPost;
    const scene = new Scene();
    scene.background = new Color(0x060707);
    const camera = new PerspectiveCamera(LENS_FOV, 1, 0.1, 60);
    camera.position.z = LENS_DISTANCE;
    try {
      renderer = created = new WebGLRenderer({ alpha: false, antialias: false, powerPreference: "high-performance" });
      post = createPortraitPost(renderer, scene, camera);
    } catch {
      // A renderer that exists but cannot glow still holds a live context:
      // give it back, or a few failed mounts exhaust the browser's allowance.
      created?.dispose();
      created?.forceContextLoss();
      onUnavailable();
      return;
    }
    const canvas = renderer.domElement;
    element.appendChild(canvas);
    renderer.toneMapping = NoToneMapping;
    const geometry = new BufferGeometry();
    const uniforms = {
      uRelease: { value: 0 }, uDrift: { value: 0 }, uEnding: { value: 0 },
      uTime: { value: 0 }, uDpr: { value: 1 }, uScale: { value: 1 },
      uAspect: { value: 1 }, uProj: { value: 1000 }, uCell: { value: 0.004 },
      uFocus: { value: LENS_DISTANCE }, uAperture: { value: 0.015 },
      uPointer: { value: new Vector2() }, uPress: { value: 0 },
      uHome: { value: new Vector3(0, 0.06, 1) }, uHomeDim: { value: 0.5 },
    };
    const material = new ShaderMaterial({
      uniforms, vertexShader, fragmentShader, transparent: true,
      // Premultiplied, so one draw call lays the photograph over the dark and
      // adds the released dust's light to it (see the fragment shader).
      blending: NormalBlending, premultipliedAlpha: true,
      // A translucent cloud, not an opaque surface. Depth-writing cores made
      // neighbouring samples switch occlusion as soon as the relief moved.
      depthWrite: false, depthTest: false,
    });
    const points = new Points(geometry, material);
    const pointer = new Vector2();
    const eased = new Vector2();
    const target = new Vector3();
    const offset = new Vector3();
    points.frustumCulled = false;
    scene.add(points);
    let disposed = false;
    let loaded = false;
    let frame = 0;
    let previous = 0;
    let sampleHeight = 1300;
    let quality = window.innerWidth < 700 ? 1.35 : 1.75;
    let glow = true;
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
      // Resizing clears the drawing buffer even when nothing changed.
      // Allocate only when necessary, and only immediately BEFORE painting.
      if (width !== drawnWidth || height !== drawnHeight || ratio !== drawnRatio) {
        post.setSize(width, height, ratio);
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
      // CSS pixels per world unit at a distance of one unit, and the world
      // size of one sampled cell: together they size a point exactly, at any
      // lens distance.
      uniforms.uProj.value = height / (2 * Math.tan(LENS_FOV * Math.PI / 360));
      uniforms.uCell.value = PLATE_HEIGHT * framing.scale / sampleHeight;
      return true;
    };
    const render = (now: number) => {
      frame = 0;
      if (disposed || !loaded || document.hidden) return;
      const elapsed = previous ? (now - previous) / 1000 : 0;
      const dt = Math.min(elapsed, 0.05);
      previous = now;
      slowFrames = dt > 0.032 ? slowFrames + 1 : Math.max(0, slowFrames - 1);
      // Under sustained slow frames give up the glow first, then resolution.
      if (slowFrames > 45 && (glow || quality > 1)) {
        if (glow) { glow = false; post.setGlow(false); }
        else { quality = 1; sizeDirty = true; }
        slowFrames = 0;
      }
      if (!applySize()) return; // Wait for a measurable ResizeObserver update.
      const state = motion.current;
      const wide = camera.aspect > 1.1;
      const closing = smooth(0, 1, state.ending);
      uniforms.uRelease.value = state.release;
      uniforms.uDrift.value = state.drift ?? 0;
      uniforms.uEnding.value = state.ending;
      // The head stands where it opened; at the end of the page it re-forms
      // smaller and to one side, dimmed behind the closing words.
      const scale = uniforms.uScale.value;
      const homeX = wide ? 0.32 : -0.7 * scale;
      uniforms.uHome.value.set(
        homeX + ((wide ? 1.95 : 0.25 * scale) - homeX) * closing,
        0.06 - (wide ? 0.3 : 0.55) * closing,
        1 - (wide ? 0.24 : 0.3) * closing,
      );
      uniforms.uHomeDim.value = wide ? 0.42 : 0.32;
      // The lens orbits the head about its own axis and closes on it. The
      // opening frame is the flat plate exactly; the orbit and the dolly are
      // what make the relief and the lifting dust read as depth. A resting
      // pointer leans the lens a little, so the relief answers the hand.
      const lens = portraitCamera(state.release, camera.aspect, state.ending);
      eased.lerp(pointer.set(state.pointerX, state.pointerY), 1 - Math.exp(-dt * 3));
      const cos = Math.cos(lens.yaw);
      const sin = Math.sin(lens.yaw);
      const reach = lens.distance / LENS_DISTANCE;
      // Opening pose (0, 0, 6) looking at the origin, turned about the head.
      target.set(homeX - homeX * cos, lens.y * 0.4, homeX * sin);
      offset.set(sin * LENS_DISTANCE, 0, cos * LENS_DISTANCE).multiplyScalar(reach);
      camera.position.copy(target).add(offset);
      camera.position.x += eased.x * 0.22 * cos;
      camera.position.z -= eased.x * 0.22 * sin;
      camera.position.y += lens.y + eased.y * 0.14;
      camera.lookAt(target);
      // The plane of focus stays on the head, so dust lifting towards the
      // lens opens into soft discs in front of it.
      uniforms.uFocus.value = lens.distance;
      if (!state.paused) uniforms.uTime.value += dt;
      const pressTarget = state.pressed && !state.paused && state.release < 0.18 ? 1 : 0;
      if (pressTarget && !wasPressed) uniforms.uPointer.value.copy(pointer);
      else uniforms.uPointer.value.lerp(pointer, 1 - Math.exp(-dt * 10));
      wasPressed = Boolean(pressTarget);
      uniforms.uPress.value += (pressTarget - uniforms.uPress.value) * (1 - Math.exp(-dt * 6));
      post.render();
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
      // The field is alive at rest: the fringe breathes and the dust drifts.
      // Only a pause (an open preview) lets the loop go idle.
      if (!ready || warmFrames > 0 || !state.paused
        || Math.abs(pressTarget - uniforms.uPress.value) > 0.001) {
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
        const cropWidth = PORTRAIT_CROP.width * PLATE_SCALE;
        const cropHeight = PORTRAIT_CROP.height * PLATE_SCALE;
        // Every plate pixel is a point on a desktop; a phone takes every
        // second one, which still outresolves its screen.
        const width = window.innerWidth < 700 ? cropWidth / 2 : cropWidth;
        sampleHeight = Math.round(width * cropHeight / cropWidth);
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
        sizeDirty = true;
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
      post.dispose();
      if (motion.current.invalidate === wake) delete motion.current.invalidate;
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    };
  }, [motion, onReady, onUnavailable]);
  return <div className="particle-renderer" ref={host} aria-hidden="true" />;
}
