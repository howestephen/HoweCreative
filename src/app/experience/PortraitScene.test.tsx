import { act, cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Color, SRGBColorSpace, type Scene, type ShaderMaterial } from "three";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { acceptsPortraitPress, HERO_HEIGHT, isPortraitSurface, particleFlowShader, particleFrameShader, PORTRAIT_CROP, PORTRAIT_POINTS_SOURCE, portraitCamera, portraitFraming, portraitLinearColour, portraitOrderShader, portraitPhases, portraitRelief, portraitSliceShader, RELEASE_LENGTH, samplePortrait, scrollState, vertexShader } from "./portrait-particles";
import PortraitScene from "./PortraitScene";

// Execute the actual scalar block interpolated into the GPU shader, not a
// separately maintained imitation. These GLSL expressions are also valid JS
// once scalar declarations and standard maths functions have been supplied.
const scalarPrelude = `
  const TAU = 6.28318530718;
  const PI = 3.14159265359;
  const sin = Math.sin, cos = Math.cos, min = Math.min, sqrt = Math.sqrt, floor = Math.floor;
  const atan = (y, x) => Math.atan2(y, x);
  const fract = value => value - Math.floor(value);
  const mod = (a, b) => a - b * Math.floor(a / b);
  const mix = (a, b, t) => a * (1 - t) + b * t;
  const smoothstep = (a, b, value) => {
    const t = Math.max(0, Math.min(1, (value - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };
`;
const scalar = (block: string) => block.replace(/\bfloat\b/g, "const");
// The ring at e = 1 is independent of where the point came from.
const flowAt = new Function("angle", "s", "t", "uTime", "uEnding", "uAspect", `
  ${scalarPrelude}
  const e = 1, rL = 0, aL = 0, zL = 0;
  ${scalar(particleFlowShader)}
  return { orbit, localX, localY, x: flowX, y: flowY, z: flowZ };
`) as (angle: number, s: number, t: number, time: number, ending: number, aspect: number) => {
  orbit: number; localX: number; localY: number; x: number; y: number; z: number;
};
// The full route: a world point through the ring frame and back at flight e.
const routeAt = new Function("liftedX", "liftedY", "liftedZ", "e", "angle", "s", "t", "uTime", "uEnding", "uAspect", `
  ${scalarPrelude}
  ${scalar(particleFrameShader)}
  ${scalar(particleFlowShader)}
  return { x: flowX, y: flowY, z: flowZ, rL, aL, zL, pathRadial, pathAngle };
`) as (x: number, y: number, z: number, e: number, angle: number, s: number, t: number, time: number, ending: number, aspect: number) => {
  x: number; y: number; z: number; rL: number; aL: number; zL: number; pathRadial: number; pathAngle: number;
};
const sliceAt = new Function("column", "aDepth", "uSeparate", "uScale", `
  ${scalarPrelude}
  ${scalar(portraitSliceShader)}
  return { slice, relief };
`) as (column: number, depth: number, separate: number, scale: number) => { slice: number; relief: number };
const orderAt = new Function("aDepth", "s", "ripple", "uLoosen", "uDisperse", `
  ${scalarPrelude}
  ${scalar(portraitOrderShader)}
  return { order, loose, flight };
`) as (depth: number, s: number, ripple: number, loosen: number, disperse: number) => { order: number; loose: number; flight: number };

const rendererFactory = vi.hoisted(() => vi.fn());
vi.mock("three", async (original) => ({
  ...await original<typeof import("three")>(),
  WebGLRenderer: class { constructor() {
    const renderer = rendererFactory();
    if (!renderer) throw new Error("WebGL disabled");
    return renderer;
  } },
}));

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); rendererFactory.mockReset(); });

// Exercise the mounted scene and its real frame scheduler. The renderer double
// records buffer clears as well as paints: checking uniforms alone missed a
// real blank frame caused by resizing AFTER a completed render.
const mountRenderer = () => {
  const events: string[] = [];
  const callbacks = new Map<number, FrameRequestCallback>();
  let nextId = 0;
  let now = 100;
  let notifyResize = () => {};
  let loadImage = () => {};
  let width = 1280;
  const renderer = {
    domElement: document.createElement("canvas"), debug: {},
    setClearColor: vi.fn(),
    setDrawingBufferSize: vi.fn(() => events.push("clear")),
    setPixelRatio: vi.fn(() => events.push("clear")),
    setSize: vi.fn(() => events.push("clear")),
    render: vi.fn((_scene: Scene) => events.push("paint")),
    dispose: vi.fn(), forceContextLoss: vi.fn(),
  };
  rendererFactory.mockReturnValue(renderer);
  vi.stubGlobal("devicePixelRatio", 2);
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => { callbacks.set(++nextId, cb); return nextId; });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => callbacks.delete(id));
  vi.stubGlobal("ResizeObserver", class {
    constructor(callback: () => void) { notifyResize = callback; }
    observe() {} disconnect() {}
  });
  vi.stubGlobal("Image", class {
    naturalWidth = PORTRAIT_CROP.width * 2;
    naturalHeight = PORTRAIT_CROP.height;
    onload: (() => void) | null = null;
    set src(_src: string) { loadImage = () => this.onload?.(); }
  });
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(() => ({ width, height: 720 }) as DOMRect);
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation((() => ({
    drawImage: () => {},
    getImageData: (_x: number, _y: number, w: number, h: number) => ({ data: new Uint8ClampedArray(w * h * 4) }),
  })) as unknown as typeof HTMLCanvasElement.prototype.getContext);
  const motion = { current: { release: 0, travel: 0, ending: 0, pointerX: 0, pointerY: 0, velocity: 0, paused: false, invalidate: undefined as (() => void) | undefined } };
  const onReady = vi.fn();
  const onUnavailable = vi.fn();
  const mounted = render(<PortraitScene motion={motion} onReady={onReady} onUnavailable={onUnavailable} />);
  act(loadImage);
  const tick = (milliseconds = 16) => {
    now += milliseconds;
    const pending = [...callbacks.values()];
    callbacks.clear();
    act(() => pending.forEach(cb => cb(now)));
    // In particular, resizing from inside render must not create two loops.
    expect(callbacks.size).toBeLessThanOrEqual(1);
  };
  return { ...mounted, renderer, events, motion, onReady, onUnavailable, tick, callbacks,
    resize: (newWidth = width) => { width = newWidth; act(notifyResize); } };
};

describe("frame-safe portrait renderer", () => {
  it("paints a single blended cloud and waits for two completed frames before ready", () => {
    const fixture = mountRenderer();
    expect(fixture.events).toEqual([]);
    fixture.tick();
    expect(fixture.events).toEqual(["clear", "paint"]);
    expect(fixture.onReady).not.toHaveBeenCalled();
    const scene = fixture.renderer.render.mock.calls[0][0];
    expect(scene.children).toHaveLength(1);
    const material = (scene.children[0] as import("three").Points).material as ShaderMaterial;
    expect(material.depthWrite).toBe(false);
    expect(material.depthTest).toBe(false);
    expect(material.fragmentShader).not.toContain("CORE_PASS");
    fixture.tick();
    expect(fixture.onReady).toHaveBeenCalledOnce();
    expect(fixture.onUnavailable).not.toHaveBeenCalled();
  });

  it("does not clear an idle canvas on repeated observer notifications", () => {
    const fixture = mountRenderer();
    for (let i = 0; i < 5; i++) fixture.tick();
    expect(fixture.callbacks.size).toBe(0);
    fixture.events.length = 0;
    fixture.resize(); fixture.resize();
    expect(fixture.events).toEqual([]);
    fixture.tick();
    expect(fixture.events).toEqual([]);
    expect(fixture.callbacks.size).toBe(0);
  });

  it("orders a real resize immediately before the paint in the same callback", () => {
    const fixture = mountRenderer();
    fixture.tick();
    fixture.events.length = 0;
    fixture.resize(390);
    expect(fixture.events).toEqual([]);
    fixture.tick();
    expect(fixture.events).toEqual(["clear", "paint"]);
    expect(fixture.renderer.setDrawingBufferSize).toHaveBeenLastCalledWith(390, 720, 1.75);
  });

  it("keeps a zero-size resize pending until the host is measurable", () => {
    const fixture = mountRenderer();
    fixture.resize(0);
    fixture.tick();
    expect(fixture.events).toEqual([]);
    expect(fixture.onReady).not.toHaveBeenCalled();
    expect(fixture.callbacks.size).toBe(0);
    fixture.resize(390);
    fixture.tick();
    expect(fixture.events).toEqual(["clear", "paint"]);
    fixture.tick();
    expect(fixture.onReady).toHaveBeenCalledOnce();
  });

  it("reduces quality before painting under sustained slow frames without duplicating the loop", () => {
    const fixture = mountRenderer();
    fixture.motion.current.release = 0.1;
    fixture.tick();
    fixture.events.length = 0;
    for (let i = 0; i < 50; i++) {
      fixture.tick(40);
      expect(fixture.events[fixture.events.length - 1]).toBe("paint");
    }
    expect(fixture.events.filter(event => event === "clear")).toHaveLength(1);
    expect(fixture.renderer.setDrawingBufferSize).toHaveBeenLastCalledWith(1280, 720, 1);
    fixture.unmount();
    expect(fixture.callbacks.size).toBe(0);
    expect(fixture.renderer.dispose).toHaveBeenCalledOnce();
  });
});

it("reports unavailable WebGL without leaving a blank canvas attached", () => {
  const onUnavailable = vi.fn();
  const onReady = vi.fn();
  const motion = { current: { release: 0, travel: 0, ending: 0, pointerX: 0, pointerY: 0, velocity: 0, paused: false } };
  const { container } = render(<PortraitScene motion={motion} onReady={onReady} onUnavailable={onUnavailable} />);
  expect(onUnavailable).toHaveBeenCalledOnce();
  expect(onReady).not.toHaveBeenCalled();
  expect(container.querySelector("canvas")).toBeNull();
});

describe("portrait source and reversible choreography", () => {
  it("keeps the opening frame and feathers the slices into one corrugated sheet", () => {
    for (const depth of [0, 0.3, 0.7, 1]) {
      for (const column of [0, 2.5, 6.99, 12.4]) {
        // Unseparated, the relief is the accepted per-point relief alone.
        expect(sliceAt(column, depth, 0, 0.9).relief).toBeCloseTo((depth - 0.5) * 1.8 * 0.9, 9);
      }
    }
    for (let column = 0; column < 12; column++) {
      // No step between neighbouring columns: the feathered end of one slice
      // meets the start of the next.
      const end = sliceAt(column + 0.9999, 0.5, 1, 1).slice;
      const next = sliceAt(column + 1, 0.5, 1, 1).slice;
      expect(Math.abs(end - next)).toBeLessThan(0.002);
      for (let within = 0; within < 1; within += 0.05) {
        expect(Math.abs(sliceAt(column + within, 0.5, 1, 1).slice)).toBeLessThanOrEqual(1);
      }
    }
    // Separation opens the slices along depth and deepens the relief, and
    // the slices are a real corrugation, not a flat sheet.
    let widest = 0;
    for (let column = 0; column < 13; column += 0.5) {
      const flat = sliceAt(column, 1, 0, 1);
      const open = sliceAt(column, 1, 1, 1);
      expect(open.relief - flat.relief).toBeCloseTo(open.slice * 1.25 + 0.5 * 1.8 * 0.5, 9);
      expect(Math.abs(open.relief - flat.relief)).toBeLessThan(2.2);
      widest = Math.max(widest, Math.abs(open.slice));
    }
    expect(widest).toBeGreaterThan(0.5);
  });

  it("releases hair and the back of the head before the features, and lifts before it flies", () => {
    for (const s of [0, 0.5, 1]) {
      for (const ripple of [0, 1]) {
        const hair = orderAt(0, s, ripple, 0, 0);
        const face = orderAt(1, s, ripple, 0, 0);
        expect(face.order).toBeGreaterThan(hair.order);
        expect(hair.loose).toBe(0);
        expect(hair.flight).toBe(0);
        expect(face.loose).toBe(0);
        expect(face.flight).toBe(0);
        expect(orderAt(0, s, ripple, 1, 1).loose).toBe(1);
        expect(orderAt(1, s, ripple, 1, 1).loose).toBe(1);
        expect(orderAt(0, s, ripple, 1, 1).flight).toBe(1);
        expect(orderAt(1, s, ripple, 1, 1).flight).toBe(1);
        let previousHair = 0;
        let previousFace = 0;
        for (let step = 0; step <= 40; step++) {
          const progress = step / 40;
          const hairNow = orderAt(0, s, ripple, progress, progress);
          const faceNow = orderAt(1, s, ripple, progress, progress);
          // Loosening leads flight for every point, and hair leads the face.
          expect(hairNow.loose).toBeGreaterThanOrEqual(hairNow.flight);
          expect(faceNow.loose).toBeGreaterThanOrEqual(faceNow.flight);
          expect(hairNow.loose).toBeGreaterThanOrEqual(faceNow.loose);
          expect(hairNow.flight).toBeGreaterThanOrEqual(faceNow.flight);
          expect(hairNow.loose).toBeGreaterThanOrEqual(previousHair);
          expect(faceNow.flight).toBeGreaterThanOrEqual(previousFace);
          previousHair = hairNow.loose;
          previousFace = faceNow.flight;
        }
        // The features are still in flight as the release ends, not gone early.
        expect(orderAt(1, s, ripple, 0.75, 0.75).flight).toBeLessThan(1);
        expect(orderAt(1, s, ripple, 0.75, 0.75).flight).toBeGreaterThan(0);
      }
    }
  });

  it("routes each point through the ring frame and back without moving it at e = 0", () => {
    for (const aspect of [390 / 844, 1280 / 720, 2.5]) {
      for (const ending of [0, 0.5, 1]) {
        for (let i = 0; i < 40; i++) {
          const x = Math.sin(i * 1.7) * 2.4;
          const y = Math.cos(i * 2.3) * 2.1;
          const z = Math.sin(i * 0.9) * 1.6;
          const route = routeAt(x, y, z, 0, i / 40, (i * 7 % 40) / 40, (i * 13 % 40) / 40, 12, ending, aspect);
          expect(route.x).toBeCloseTo(x, 6);
          expect(route.y).toBeCloseTo(y, 6);
          expect(route.z).toBeCloseTo(z, 6);
          const arrived = routeAt(x, y, z, 1, i / 40, (i * 7 % 40) / 40, (i * 13 % 40) / 40, 12, ending, aspect);
          const ring = flowAt(i / 40, (i * 7 % 40) / 40, (i * 13 % 40) / 40, 12, ending, aspect);
          expect(arrived.x).toBeCloseTo(ring.x, 6);
          expect(arrived.y).toBeCloseTo(ring.y, 6);
          expect(arrived.z).toBeCloseTo(ring.z, 6);
          // The angle turns the short way round: never more than half a turn.
          const half = routeAt(x, y, z, 0.5, i / 40, (i * 7 % 40) / 40, (i * 13 % 40) / 40, 12, ending, aspect);
          expect(Math.abs(half.pathAngle - half.aL)).toBeLessThanOrEqual(Math.PI / 2 + 1e-6);
          const ringRadius = Math.hypot(ring.localX, ring.localY);
          expect(half.pathRadial).toBeGreaterThanOrEqual(Math.min(half.rL, ringRadius) - 1e-6);
          expect(half.pathRadial).toBeLessThanOrEqual(Math.max(half.rL, ringRadius) + 1e-6);
        }
      }
    }
  });

  it("uses one phase and basis from release through the closing hold", () => {
    expect(vertexShader.split(particleFlowShader)).toHaveLength(2);
    expect(vertexShader.split(particleFrameShader)).toHaveLength(2);
    expect(vertexShader.match(/float orbit =/g)).toHaveLength(1);
    expect(vertexShader).toContain("vec3 p = vec3(flowX, flowY, flowZ);");
    expect(vertexShader).not.toMatch(/uTravel|closingFlow|mix\(p,|vec3 stream|vec3 circular|vec3 control/);
  });

  it("cannot collapse or rotate the circle when scroll progress changes, regardless of dwell time", () => {
    for (const aspect of [390 / 844, 1280 / 720, 2.5]) {
      for (const time of [0, 15, 30, 60, 300]) {
        for (let i = 0; i < 64; i++) {
          const s = i / 64;
          const t = ((i * 17) % 63) / 63;
          const start = flowAt(s - 0.5, s, t, time, 0, aspect);
          let previous = start;
          for (let step = 0; step <= 20; step++) {
            const point = flowAt(s - 0.5, s, t, time, step / 20, aspect);
            expect(point.orbit).toBe(start.orbit);
            expect(Math.hypot(point.localX, point.localY)).toBeGreaterThan(1.04);
            expect(Math.hypot(point.localX, point.localY)).toBeLessThan(2.44);
            expect(Math.hypot(point.x - previous.x, point.y - previous.y, point.z - previous.z)).toBeLessThan(0.06);
            expect(5.25 - point.z).toBeGreaterThan(3.1);
            previous = point;
          }
        }
      }
    }
  });

  it("restores the work circle gathering around the closing text without removing contact", () => {
    expect(particleFlowShader).toContain("float tube = mix(0.36, 0.12, uEnding);");
    expect(particleFlowShader).toContain("mix(-0.05, -0.4, uEnding)");
    expect(particleFlowShader).toContain("float orbit = angle * TAU");
    const css = readFileSync(resolve("src/styles/portrait.css"), "utf8");
    expect(css).toContain(`.particle-hero { height: ${Math.round(HERO_HEIGHT * 100)}svh;`);
    expect(HERO_HEIGHT).toBeGreaterThan(RELEASE_LENGTH);
    // The work heading reaches the bottom of the screen at three quarters of
    // the release and the release ends with it in the middle of the screen.
    expect((HERO_HEIGHT - 1) / RELEASE_LENGTH).toBeCloseTo(0.75, 6);
    expect(HERO_HEIGHT - RELEASE_LENGTH).toBeLessThan(1);
    expect(css).toContain(".particle-ending { position: relative; min-height: 138svh;");
    expect(css).toContain(".particle-ending-inner { position: sticky; top: 33svh;");
    expect(css).toContain(".particle-ending { min-height: 130svh; padding-top: 34svh;");
  });

  it.each([0, 8, 16, 32, 64, 128, 255])("preserves sRGB tone %i instead of crushing the portrait shadows", (byte) => {
    const value = byte / 255;
    const reference = new Color().setRGB(value, value, value, SRGBColorSpace);
    expect(portraitLinearColour(value)).toBeCloseTo(reference.r, 7);
  });

  it("applies shadow-preserving conversion to the actual uploaded portrait colours", () => {
    const pixels = new Uint8ClampedArray(20 * 20 * 4).fill(16);
    for (let i = 3; i < pixels.length; i += 4) pixels[i] = 255;
    const depth = new Uint8ClampedArray(20 * 20 * 4).fill(180);
    const sampled = samplePortrait(pixels, depth, 20, 20);
    const expected = new Color().setRGB(16 / 255, 16 / 255, 16 / 255, SRGBColorSpace).r;
    for (const channel of [0, 1, 2]) {
      const peak = Math.max(...sampled.colours.filter((_value, index) => index % 3 === channel));
      expect(peak).toBeCloseTo(expected, 7);
      expect(peak).toBeGreaterThan(Math.pow(16 / 255, 2.2));
    }
  });

  it("starts the new travelling volume only after the hero release has completed", () => {
    for (const [height, work, end] of [[720, 720, 1524], [844, 844, 2900], [1440, 1440, 2180]]) {
      for (let y = 0; y <= end; y += 1) {
        const state = scrollState(y, height, work, end);
        if (state.travel > 0 || state.ending > 0) expect(state.release).toBe(1);
      }
    }
  });

  it.each([[320, 900], [390, 844], [768, 1024]])("fits the physical head on a %i by %i viewport", (width, height) => {
    const { pixelHeight, pixelOffset } = portraitFraming(width, height);
    const pixelWidth = pixelHeight * 700 / 650;
    const left = width / 2 + pixelOffset + (0.29 - 0.5) * pixelWidth;
    const right = width / 2 + pixelOffset + (0.99 - 0.5) * pixelWidth;
    expect(left).toBeGreaterThan(0);
    expect(right).toBeLessThan(width);
  });
  it("keeps the sampled region above the concept's baked-in navigation", () => {
    expect(PORTRAIT_CROP.y + PORTRAIT_CROP.height).toBeLessThan(670);
    expect(PORTRAIT_CROP.x).toBeGreaterThan(410);
    expect(PORTRAIT_CROP.x + PORTRAIT_CROP.width).toBeLessThan(1160);
  });

  it("retains identical source points on repeated sampling without a random remount", () => {
    const pixels = new Uint8ClampedArray(20 * 20 * 4).fill(180);
    for (let i = 3; i < pixels.length; i += 4) pixels[i] = 255;
    const depth = new Uint8ClampedArray(20 * 20 * 4).fill(200);
    const a = samplePortrait(pixels, depth, 20, 20);
    const b = samplePortrait(pixels, depth, 20, 20);
    expect(a.positions).toEqual(b.positions);
    expect(a.seeds).toEqual(b.seeds);
    expect(a.depths).toEqual(b.depths);
    expect(a.depths.length).toBe(a.positions.length / 3);
    expect(a.positions.length).toBeGreaterThan(0);
    expect(a.positions.length / 3).toBe(a.seeds.length / 4);
    expect(a.positions.length).toBe(a.colours.length);
    expect([...a.positions, ...a.colours, ...a.seeds, ...a.depths].every(Number.isFinite)).toBe(true);
  });

  it("does not scatter the black background or transparent pixels as a rectangle", () => {
    const black = new Uint8ClampedArray(20 * 20 * 4);
    for (let i = 3; i < black.length; i += 4) black[i] = 255;
    const depth = new Uint8ClampedArray(20 * 20 * 4).fill(200);
    expect(samplePortrait(black, depth, 20, 20).positions).toHaveLength(0);
    const invisible = new Uint8ClampedArray(20 * 20 * 4).fill(255);
    for (let i = 3; i < invisible.length; i += 4) invisible[i] = 0;
    expect(samplePortrait(invisible, depth, 20, 20).positions).toHaveLength(0);
  });

  it("retains the opening pace independently of where work is placed", () => {
    const h = 800;
    const work = h * HERO_HEIGHT;
    const end = 3400;
    expect(scrollState(0, h, work, end)).toEqual({ release: 0, travel: 0, ending: 0, intro: 1 });
    // Separation answers the first scroll. The release is linear because the
    // scroll follower already supplies the easing.
    const firstScroll = scrollState(h * 0.1, h, work, end);
    const secondScroll = scrollState(h * 0.2, h, work, end);
    expect(firstScroll.release).toBeGreaterThan(0);
    expect(secondScroll.release).toBeCloseTo(firstScroll.release * 2, 6);
    expect(scrollState(h * RELEASE_LENGTH, h, work, end).release).toBe(1);
    expect(scrollState(h * 1.1, h, work, end).release).toBeLessThan(1);
    for (const workPosition of [h, h * 1.15, h * 2.2]) {
      expect(scrollState(h * 0.3, h, workPosition, end).release).toBeCloseTo(0.3 / RELEASE_LENGTH);
      expect(scrollState(h * 0.6, h, workPosition, end).release).toBeLessThan(1);
    }
    // When the work heading reaches the bottom of the screen the head has
    // come three quarters of the way apart, and it is mid-screen at the end.
    expect(scrollState(work - h, h, work, end).release).toBeCloseTo(0.75, 6);
    expect(scrollState(end + h * 0.12, h, work, end).ending).toBe(1);
    expect(scrollState(0, h, work, end).release).toBe(0);
  });

  it("bounds every state on overscroll and short mobile layouts", () => {
    for (const height of [375, 844, 1080]) {
      for (const y of [-900, 0, 150, 700, 4000, 9000]) {
        const state = scrollState(y, height, height * 1.65, height * 4.3);
        for (const value of Object.values(state)) {
          expect(value).toBeGreaterThanOrEqual(0);
          expect(value).toBeLessThanOrEqual(1);
          expect(Number.isFinite(value)).toBe(true);
        }
      }
    }
  });

  it('opens continuously from the first scroll without a separate stipple stage', () => {
    expect(portraitPhases(0)).toEqual({ separate: 0, turn: 0, loosen: 0, disperse: 0 });

    // Separation, turn, loosening and dispersal all begin on the first
    // scroll; there is no dead zone followed by a threshold.
    for (const key of ['separate', 'turn', 'loosen', 'disperse'] as const) {
      expect(portraitPhases(0.001)[key]).toBeGreaterThan(0);
      expect(portraitPhases(0.1)[key]).toBeGreaterThan(0);
    }
    // The first wheel-sized step of the turn and separation is gentler than
    // the middle of the passage, so nothing can present as a flash.
    expect(portraitPhases(0.08).turn - portraitPhases(0).turn).toBeLessThan(portraitPhases(0.48).turn - portraitPhases(0.4).turn);
    expect(portraitPhases(0.08).separate - portraitPhases(0).separate).toBeLessThan(portraitPhases(0.38).separate - portraitPhases(0.3).separate);

    // Every phase is monotonic and complete at the end of the release.
    let previous = portraitPhases(0);
    for (let step = 1; step <= 50; step++) {
      const now = portraitPhases(step / 50);
      for (const key of ['separate', 'turn', 'loosen', 'disperse'] as const) {
        expect(now[key]).toBeGreaterThanOrEqual(previous[key]);
        expect(now[key]).toBeLessThanOrEqual(1);
      }
      previous = now;
    }
    expect(portraitPhases(1)).toEqual({ separate: 1, turn: 1, loosen: 1, disperse: 1 });
    // The slices are fully open before the release ends, while the last
    // features are still leaving.
    expect(portraitPhases(0.7).separate).toBe(1);
    expect(portraitPhases(0.7).disperse).toBeLessThan(1);
  });

  it('dollies the lens in and across over the release, from the opening eye', () => {
    const opening = portraitCamera(0, 16 / 9);
    expect(opening).toEqual({ x: 0, y: -0, z: 6 });
    expect(portraitCamera(0.03, 16 / 9).x).toBeLessThan(0.002);
    expect(portraitCamera(0.03, 16 / 9).z).toBeGreaterThan(5.99);
    let previous = opening;
    for (let step = 1; step <= 40; step++) {
      const now = portraitCamera(step / 40, 16 / 9);
      expect(now.x).toBeGreaterThanOrEqual(previous.x);
      expect(now.z).toBeLessThanOrEqual(previous.z);
      previous = now;
    }
    const complete = portraitCamera(1, 16 / 9);
    expect(complete.x).toBeCloseTo(0.55, 6);
    expect(complete.z).toBeCloseTo(4.9, 6);
    // The ring's nearest point stays well in front of the settled lens.
    for (const aspect of [390 / 844, 16 / 9]) {
      for (let i = 0; i < 64; i++) {
        const point = flowAt(i / 64 - 0.5, i / 64, (i * 17 % 63) / 63, 30, 0, aspect);
        expect(portraitCamera(1, aspect).z - point.z).toBeGreaterThan(2.6);
      }
    }
    expect(portraitCamera(1, 390 / 844).x).toBeCloseTo(0.2, 6);
  });

  it('varies size only after flight starts and keeps the cloud through the work handoff', () => {
    expect(vertexShader).toContain('scatter < 0.72');
    expect(vertexShader).toContain('mix(0.24, 0.62');
    expect(vertexShader).toContain('mix(0.85, 1.55');
    expect(vertexShader).toContain('mix(2.0, 3.1');
    expect(vertexShader).toContain('smoothstep(0.08, 0.78, flight)');
    expect(vertexShader).toContain('float thinning = smoothstep(0.1, 0.6, flight)');
    expect(vertexShader).not.toContain('smoothstep(0.04, 0.72, uTravel)');
    expect(vertexShader).toContain('min(48.0');
    expect(vertexShader).not.toContain('mix(1.0, 2.4, loose * keep)');
    expect(vertexShader).not.toContain('smoothstep(0.55, 0.62, loose)');
  });

  it('takes relief from the depth half of the plate, never from brightness', () => {
    // The remap flattens everything at or behind the estimator's mid range and
    // puts the nearest surface at 1.
    expect(portraitRelief(0.45)).toBe(0);
    expect(portraitRelief(0.2)).toBe(0);
    expect(portraitRelief(1)).toBe(1);

    const width = 20;
    const height = 20;
    const pixels = new Uint8ClampedArray(width * height * 4);
    const depth = new Uint8ClampedArray(width * height * 4);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        // One flat tone everywhere: brightness carries no depth information.
        pixels[i] = pixels[i + 1] = pixels[i + 2] = 180;
        pixels[i + 3] = 255;
        const near = x >= width / 2 ? 250 : 140;
        depth[i] = depth[i + 1] = depth[i + 2] = near;
        depth[i + 3] = 255;
      }
    }
    const { positions, depths } = samplePortrait(pixels, depth, width, height);
    expect(depths.length).toBeGreaterThan(20);
    const left = depths.filter((_, index) => positions[index * 3] < 0);
    const right = depths.filter((_, index) => positions[index * 3] > 0);
    expect(left.length).toBeGreaterThan(0);
    expect(right.length).toBeGreaterThan(0);
    expect(new Set(left).size).toBe(1);
    expect(new Set(right).size).toBe(1);
    expect(left[0]).toBeLessThan(right[0]);
    expect(left[0]).toBeCloseTo(portraitRelief(140 / 255), 5);
    expect(right[0]).toBeCloseTo(portraitRelief(250 / 255), 5);
  });
});

describe('portrait press interaction', () => {
  it('leaves touch scrolling, secondary clicks, dispersed state and paused/reduced mode alone', () => {
    expect(acceptsPortraitPress('mouse', 0, 0, false)).toBe(true);
    expect(acceptsPortraitPress('touch', 0, 0, false)).toBe(false);
    expect(acceptsPortraitPress('mouse', 2, 0, false)).toBe(false);
    expect(acceptsPortraitPress('mouse', 0, 0.5, false)).toBe(false);
    expect(acceptsPortraitPress('mouse', 0, 0, true)).toBe(false);
  });
  it('only accepts the portrait surface and leaves controls alone', () => {
    const hero = document.createElement('section');
    hero.className = 'particle-hero';
    const button = document.createElement('button');
    const icon = document.createElement('span');
    button.append(icon); hero.append(button);
    expect(isPortraitSurface(hero)).toBe(true);
    expect(isPortraitSurface(icon)).toBe(false);
    expect(isPortraitSurface(document.body)).toBe(false);
  });
});

describe("portrait plate asset", () => {
  it("ships the packed colour and depth plate the scene fetches at runtime", () => {
    // The scene loads this from public/ with new Image(), which no build
    // check follows, so this is the only gate that notices a missing plate.
    expect(PORTRAIT_POINTS_SOURCE.endsWith("/portrait/portrait-source.png")).toBe(true);
    const plate = readFileSync(resolve(process.cwd(), "public/portrait/portrait-source.png"));
    expect(plate.subarray(1, 4).toString("ascii")).toBe("PNG");
    expect(plate.readUInt32BE(16)).toBe(PORTRAIT_CROP.width * 2);
    expect(plate.readUInt32BE(20)).toBe(PORTRAIT_CROP.height);
    expect(plate[24]).toBe(8);
    expect(plate[25]).toBe(2);
  });
});
