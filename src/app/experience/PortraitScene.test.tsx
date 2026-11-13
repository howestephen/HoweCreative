import { act, cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Color, SRGBColorSpace, type Points, type Scene, type ShaderMaterial } from "three";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  acceptsPortraitPress, fragmentShader, HERO_HEIGHT, isPortraitSurface, LENS_DISTANCE, PLATE_SCALE, PORTRAIT_CROP,
  PORTRAIT_POINTS_SOURCE, portraitAgeShader, portraitCamera, portraitFraming, portraitJourneyShader,
  portraitLinearColour, portraitRelief, portraitSource, portraitSource1x, portraitTravelShader, RELEASE_LENGTH,
  samplePortrait, scrollState, vertexShader,
} from "./portrait-particles";
import PortraitScene from "./PortraitScene";

// Execute the actual scalar blocks interpolated into the GPU shader, not a
// separately maintained imitation. These GLSL expressions are also valid JS
// once scalar declarations and standard maths functions have been supplied.
const scalarPrelude = `
  const sin = Math.sin, max = Math.max, exp = Math.exp;
  const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
  const smoothstep = (a, b, value) => {
    const t = Math.max(0, Math.min(1, (value - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };
`;
const scalar = (block: string) => block.replace(/\bfloat\b/g, "const");
type Point = { u: number; depth: number; grain: number; r: number; s: number };
type Scroll = { release: number; ending: number; drift: number; time: number; press: number };
// One point's whole journey: age, then how loose it is, where the page has
// taken it, and how far it has walked and spread.
const journeyAt = new Function("u", "aDepth", "grain", "r", "s", "uRelease", "uEnding", "uDrift", "uTime", "press", `
  ${scalarPrelude}
  ${scalar(portraitAgeShader)}
  const loose = smoothstep(0.0, 0.28, age);
  ${scalar(portraitJourneyShader)}
  ${scalar(portraitTravelShader)}
  return { order, age, loose, onward, total, rise, walk, reach, spread };
`) as (...values: number[]) => Record<"order" | "age" | "loose" | "onward" | "total" | "rise" | "walk" | "reach" | "spread", number>;
const journey = (point: Partial<Point>, scroll: Partial<Scroll>) => {
  const p = { u: 0.6, depth: 0.5, grain: 0, r: 0.5, s: 0.5, ...point };
  const at = { release: 0, ending: 0, drift: (scroll.release ?? 0) * RELEASE_LENGTH, time: 0, press: 0, ...scroll };
  return journeyAt(p.u, p.depth, p.grain, p.r, p.s, at.release, at.ending, at.drift, at.time, at.press);
};
// The head occupies source u = 0.29 to 0.99: the back of the hair to the nose.
const hair = { u: 0.32, depth: 0.1 };
const face = { u: 0.95, depth: 1 };

const rendererFactory = vi.hoisted(() => vi.fn());
const postFactory = vi.hoisted(() => vi.fn());
vi.mock("three", async (original) => ({
  ...await original<typeof import("three")>(),
  WebGLRenderer: class { constructor() {
    const renderer = rendererFactory();
    if (!renderer) throw new Error("WebGL disabled");
    return renderer;
  } },
}));
vi.mock("./portrait-post", () => ({ createPortraitPost: postFactory }));

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); rendererFactory.mockReset(); postFactory.mockReset(); });

// Exercise the mounted scene and its real frame scheduler. The post double
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
  let scene: Scene | undefined;
  const renderer = { domElement: document.createElement("canvas"), debug: {}, toneMapping: 0, dispose: vi.fn(), forceContextLoss: vi.fn() };
  const post = {
    setSize: vi.fn(() => events.push("clear")),
    setGlow: vi.fn((on: boolean) => events.push(on ? "glow" : "no glow")),
    render: vi.fn(() => events.push("paint")),
    dispose: vi.fn(),
  };
  rendererFactory.mockReturnValue(renderer);
  postFactory.mockImplementation((_renderer: unknown, drawn: Scene) => { scene = drawn; return post; });
  vi.stubGlobal("devicePixelRatio", 2);
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => { callbacks.set(++nextId, cb); return nextId; });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => callbacks.delete(id));
  vi.stubGlobal("ResizeObserver", class {
    constructor(callback: () => void) { notifyResize = callback; }
    observe() {} disconnect() {}
  });
  vi.stubGlobal("Image", class {
    naturalWidth = PORTRAIT_CROP.width * PLATE_SCALE * 2;
    naturalHeight = PORTRAIT_CROP.height * PLATE_SCALE;
    onload: (() => void) | null = null;
    set src(_src: string) { loadImage = () => this.onload?.(); }
  });
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(() => ({ width, height: 720 }) as DOMRect);
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation((() => ({
    drawImage: () => {},
    getImageData: (_x: number, _y: number, w: number, h: number) => ({ data: new Uint8ClampedArray(w * h * 4) }),
  })) as unknown as typeof HTMLCanvasElement.prototype.getContext);
  const motion = { current: { release: 0, travel: 0, drift: 0, ending: 0, pointerX: 0, pointerY: 0, velocity: 0, paused: false, invalidate: undefined as (() => void) | undefined } };
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
  const material = () => {
    if (!scene) throw new Error("The scene was never handed to the post chain");
    return (scene.children[0] as Points).material as ShaderMaterial;
  };
  return { ...mounted, renderer, post, events, motion, onReady, onUnavailable, tick, callbacks, material,
    scene: () => scene,
    resize: (newWidth = width) => { width = newWidth; act(notifyResize); } };
};

describe("frame-safe portrait renderer", () => {
  it("paints a single blended cloud and waits for two completed frames before ready", () => {
    const fixture = mountRenderer();
    expect(fixture.events).toEqual([]);
    fixture.tick();
    expect(fixture.events).toEqual(["clear", "paint"]);
    expect(fixture.onReady).not.toHaveBeenCalled();
    expect(fixture.scene()?.children).toHaveLength(1);
    const material = fixture.material();
    expect(material.depthWrite).toBe(false);
    expect(material.depthTest).toBe(false);
    // One premultiplied draw lays the photograph and adds the dust's light.
    expect(material.premultipliedAlpha).toBe(true);
    expect((fixture.scene()?.background as Color).getHexString()).toBe("060707");
    fixture.tick();
    expect(fixture.onReady).toHaveBeenCalledOnce();
    expect(fixture.onUnavailable).not.toHaveBeenCalled();
  });

  it("keeps the field alive at rest and goes idle only while paused", () => {
    const fixture = mountRenderer();
    for (let i = 0; i < 8; i++) fixture.tick();
    // The fringe breathes and the dust drifts with no scroll at all.
    expect(fixture.callbacks.size).toBe(1);
    const moving = fixture.material().uniforms.uTime?.value as number;
    expect(moving).toBeGreaterThan(0);
    fixture.motion.current.paused = true;
    for (let i = 0; i < 8; i++) fixture.tick();
    expect(fixture.callbacks.size).toBe(0);
    // A paused field holds its last frame: time stands still.
    expect(fixture.material().uniforms.uTime?.value).toBe(moving);
    fixture.motion.current.paused = false;
    act(() => fixture.motion.current.invalidate?.());
    expect(fixture.callbacks.size).toBe(1);
  });

  it("does not clear the canvas on repeated observer notifications", () => {
    const fixture = mountRenderer();
    for (let i = 0; i < 5; i++) fixture.tick();
    fixture.events.length = 0;
    fixture.resize(); fixture.resize();
    expect(fixture.events).toEqual([]);
    fixture.tick();
    expect(fixture.events).toEqual(["paint"]);
  });

  it("orders a real resize immediately before the paint in the same callback", () => {
    const fixture = mountRenderer();
    fixture.tick();
    fixture.events.length = 0;
    fixture.resize(390);
    expect(fixture.events).toEqual([]);
    fixture.tick();
    expect(fixture.events).toEqual(["clear", "paint"]);
    expect(fixture.post.setSize).toHaveBeenLastCalledWith(390, 720, 1.75);
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

  it("gives up the glow first, then resolution, under sustained slow frames", () => {
    const fixture = mountRenderer();
    fixture.tick();
    fixture.events.length = 0;
    for (let i = 0; i < 50; i++) {
      fixture.tick(40);
      expect(fixture.events[fixture.events.length - 1]).toBe("paint");
    }
    expect(fixture.events.filter(event => event === "no glow")).toHaveLength(1);
    expect(fixture.events).not.toContain("clear");
    for (let i = 0; i < 50; i++) fixture.tick(40);
    expect(fixture.events.filter(event => event === "no glow")).toHaveLength(1);
    expect(fixture.events.filter(event => event === "clear")).toHaveLength(1);
    expect(fixture.post.setSize).toHaveBeenLastCalledWith(1280, 720, 1);
    fixture.unmount();
    expect(fixture.callbacks.size).toBe(0);
    expect(fixture.post.dispose).toHaveBeenCalledOnce();
    expect(fixture.renderer.dispose).toHaveBeenCalledOnce();
  });

  it("drives the shader from scroll and re-forms the head to one side at the end", () => {
    const fixture = mountRenderer();
    fixture.tick();
    const uniforms = fixture.material().uniforms;
    const home = () => (uniforms.uHome?.value as { x: number; y: number; z: number });
    expect(home().x).toBeCloseTo(0.32, 6);
    expect(home().z).toBe(1);
    expect(uniforms.uFocus?.value).toBe(LENS_DISTANCE);
    Object.assign(fixture.motion.current, { release: 1, drift: 3.4, ending: 0 });
    fixture.tick();
    expect(uniforms.uRelease?.value).toBe(1);
    expect(uniforms.uDrift?.value).toBe(3.4);
    expect(uniforms.uFocus?.value).toBeCloseTo(portraitCamera(1, 1280 / 720).distance, 6);
    Object.assign(fixture.motion.current, { ending: 1 });
    fixture.tick();
    expect(uniforms.uEnding?.value).toBe(1);
    expect(home().x).toBeGreaterThan(1.5);
    expect(home().z).toBeLessThan(0.85);
    expect(uniforms.uFocus?.value).toBe(LENS_DISTANCE);
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

it("falls back when the glow chain cannot be built", () => {
  const renderer = { domElement: document.createElement("canvas"), debug: {}, dispose: vi.fn(), forceContextLoss: vi.fn() };
  rendererFactory.mockReturnValue(renderer);
  postFactory.mockImplementation(() => { throw new Error("No float buffers"); });
  const onUnavailable = vi.fn();
  const motion = { current: { release: 0, travel: 0, ending: 0, pointerX: 0, pointerY: 0, velocity: 0, paused: false } };
  const { container } = render(<PortraitScene motion={motion} onReady={vi.fn()} onUnavailable={onUnavailable} />);
  expect(onUnavailable).toHaveBeenCalledOnce();
  expect(container.querySelector("canvas")).toBeNull();
  // The renderer that was created gives its context back.
  expect(renderer.dispose).toHaveBeenCalledOnce();
  expect(renderer.forceContextLoss).toHaveBeenCalledOnce();
});

describe("erosion and the journey down the page", () => {
  it("holds the head together at rest, bar the loosest fringe", () => {
    for (const time of [0, 3.5, 7, 20]) {
      // The face and the body of the hair are part of the photograph.
      expect(journey(face, { time }).age).toBe(0);
      expect(journey({ u: 0.45, depth: 0.3 }, { time }).age).toBe(0);
      expect(journey({ u: 0.6, depth: 0.6, grain: -1, r: 0 }, { time }).age).toBe(0);
    }
    // The outer constellation breathes: loose at one moment, home at another.
    const fringe = { u: 0.1, depth: 0, grain: 0, r: 0.2 };
    const ages = [0, 2, 4, 6, 8, 10, 12].map(time => journey(fringe, { time }).age);
    expect(Math.max(...ages)).toBeGreaterThan(0);
    expect(Math.max(...ages)).toBeLessThan(0.12);
  });

  it("erodes from the back of the head to the face, never all at once", () => {
    for (const grain of [-1, 0, 1]) {
      for (const r of [0, 1]) {
        expect(journey({ ...face, grain, r }, {}).order).toBeGreaterThan(journey({ ...hair, grain, r }, {}).order);
        let previousHair = 0;
        let previousFace = 0;
        let faceLeft = 0;
        for (let step = 0; step <= 40; step++) {
          const release = step / 40;
          const hairNow = journey({ ...hair, grain, r }, { release });
          const faceNow = journey({ ...face, grain, r }, { release });
          expect(hairNow.age).toBeGreaterThanOrEqual(faceNow.age);
          expect(hairNow.age).toBeGreaterThanOrEqual(previousHair);
          expect(faceNow.age).toBeGreaterThanOrEqual(previousFace);
          if (!faceLeft && faceNow.age > 0) faceLeft = release;
          previousHair = hairNow.age;
          previousFace = faceNow.age;
        }
        // The face holds until the release is well under way and is gone by the end.
        expect(faceLeft).toBeGreaterThan(0.45);
        expect(journey({ ...face, grain, r }, { release: 1 }).loose).toBe(1);
        expect(journey({ ...hair, grain, r }, { release: 0.5 }).loose).toBe(1);
      }
    }
  });

  it("starts each point climbing from where it let go, without a jump", () => {
    for (const point of [hair, face, { u: 0.6, depth: 0.5 }]) {
      let previous = journey(point, { release: 0 });
      expect(previous.rise).toBe(0);
      for (let step = 1; step <= 400; step++) {
        const release = step / 400;
        const now = journey(point, { release });
        // 1/400 of the release is 0.004 viewports of scroll.
        expect(now.rise - previous.rise).toBeLessThan(0.006);
        expect(now.rise).toBeGreaterThanOrEqual(previous.rise);
        if (now.age === 0) expect(now.rise).toBe(0);
        previous = now;
      }
      // Further down the page it climbs one for one with the scroll.
      const far = journey(point, { release: 1, drift: 4 });
      const further = journey(point, { release: 1, drift: 5 });
      expect(further.rise - far.rise).toBeCloseTo(1, 6);
    }
  });

  it("goes on dispersing with the page, with a walk that saturates", () => {
    for (const point of [hair, face]) {
      const released = journey(point, { release: 1 });
      const below = journey(point, { release: 1, drift: 2.6 });
      const deep = journey(point, { release: 1, drift: 9 });
      expect(below.total).toBeGreaterThan(released.total);
      expect(below.spread).toBe(1);
      expect(deep.spread).toBe(1);
      // However far the page goes, the walk stays bounded, so a pixel of
      // scroll never throws a point about.
      expect(deep.walk).toBeLessThan(1.5);
      expect(deep.walk - below.walk).toBeLessThan(0.45);
      for (const s of [0, 1]) expect(journey({ ...point, s }, { release: 1, drift: 50 }).reach).toBeLessThan(4);
    }
    // The last of the face has taken its place before the work fills the screen.
    expect(journey({ u: 0.99, depth: 1, grain: 1, r: 1 }, { release: 1, drift: HERO_HEIGHT + 0.3 }).spread).toBe(1);
  });

  it("walks every point home again as the page ends", () => {
    for (const point of [hair, face, { u: 0.6, depth: 0.5 }]) {
      for (const drift of [3, 6, 12]) {
        let previous = journey(point, { release: 1, drift, ending: 0 });
        expect(previous.loose).toBe(1);
        for (let step = 1; step <= 50; step++) {
          const now = journey(point, { release: 1, drift, ending: step / 50 });
          expect(now.total).toBeLessThanOrEqual(previous.total + 1e-9);
          previous = now;
        }
        expect(previous.age).toBe(0);
        expect(previous.total).toBe(0);
        expect(previous.rise).toBe(0);
        expect(previous.reach).toBe(0);
        expect(previous.spread).toBe(0);
      }
    }
  });

  it("never carries off the fringe that only breathes, at rest or at the end of a long page", () => {
    const fringe = { u: 0.1, depth: 0, grain: 0, r: 0.2 };
    for (const time of [0, 3, 7, 300, 3600]) {
      const resting = journey(fringe, { time });
      expect(resting.rise).toBe(0);
      expect(resting.spread).toBe(0);
      // Home again after the whole page has gone by: still loose with the
      // breath, but not lifted by the page's travel.
      const ended = journey(fringe, { release: 1, drift: 9, ending: 1, time });
      expect(ended.rise).toBe(0);
      expect(ended.spread).toBe(0);
      expect(ended.reach).toBeLessThan(0.05);
    }
    // Time moves only points that have dispersed.
    expect(vertexShader).toContain("uTime * 0.05 * spread");
    expect(vertexShader).toContain("uTime * 0.025 * spread");
    expect(vertexShader).not.toMatch(/uTime \* 0\.0\d+ \* loose/);
  });

  it("loosens the surface under a held press and nowhere else", () => {
    // Anywhere on the head, face included: a press lifts the points under it
    // a little way, and they settle when it is let go.
    for (const point of [face, hair, { u: 0.6, depth: 0.5 }]) {
      expect(journey(point, { press: 0 }).age).toBe(0);
      const pressed = journey(point, { press: 1 });
      expect(pressed.age).toBeCloseTo(0.22, 9);
      expect(pressed.loose).toBeGreaterThan(0.5);
      expect(pressed.spread).toBe(0);
      expect(pressed.reach).toBeLessThan(0.2);
    }
  });

  it("uses each block once, in a divergence-free field, with no second destination", () => {
    for (const block of [portraitAgeShader, portraitJourneyShader, portraitTravelShader]) {
      expect(vertexShader.split(block)).toHaveLength(2);
    }
    // Each component of the flow is independent of its own coordinate.
    const flow = vertexShader.slice(vertexShader.indexOf("vec3 flow("), vertexShader.indexOf("void main()"));
    const components = [...flow.matchAll(/vec3 [ab] = vec3\(\s*([^\n]+),\s*([^\n]+),\s*([^\n]+)\s*\);/g)];
    expect(components).toHaveLength(2);
    for (const [, x, y, z] of components) {
      expect(x).not.toMatch(/[pq]\.x/);
      expect(y).not.toMatch(/[pq]\.y/);
      expect(z).not.toMatch(/[pq]\.z/);
    }
    // No ring, no orbit: the released points become the field and nothing else.
    expect(vertexShader).not.toMatch(/orbit|ring|tube/i);
    // The wrap keeps the dust about the lens however far the page travels.
    expect(vertexShader).toContain("mod(p - FIELD_CENTRE + FIELD_HALF, FIELD_HALF * 2.0) - FIELD_HALF");
    expect(fragmentShader).toContain("gl_FragColor = vec4(vColour * alpha, alpha * (1.0 - vAdd));");
  });

  it("keeps a point's light when it goes out of focus", () => {
    // Size grows with the circle of confusion and opacity falls with the
    // square of it, so a soft disc is never brighter than the point it was.
    expect(vertexShader).toContain("float energy = pow(clamp(core / shown, 0.0, 1.0), 2.0);");
    expect(vertexShader).toContain("float size = min(core + coc, 72.0);");
    expect(vertexShader).toContain("float nearLens = smoothstep(0.5, 3.0, depth);");
  });
});

describe("page geometry and the lens", () => {
  it("matches the hero's scroll range to the stylesheet", () => {
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
    // The journey block's 1.6 is the release length in viewports.
    expect(RELEASE_LENGTH).toBe(1.6);
    expect(portraitJourneyShader).toContain("max(0.0, uDrift - 1.6)");
    expect(portraitJourneyShader).toContain("/ 1.62, 0.0, 1.0) * 1.6;");
  });

  it("starts the travelling volume only after the hero release has completed", () => {
    for (const [height, work, end] of [[720, 720, 1524], [844, 844, 2900], [1440, 1440, 2180]] as const) {
      for (let y = 0; y <= end; y += 1) {
        const state = scrollState(y, height, work, end);
        if (state.travel > 0 || state.ending > 0) expect(state.release).toBe(1);
      }
    }
  });

  it("retains the opening pace independently of where work is placed", () => {
    const h = 800;
    const work = h * HERO_HEIGHT;
    const end = 3400;
    expect(scrollState(0, h, work, end)).toEqual({ release: 0, travel: 0, drift: 0, ending: 0, intro: 1 });
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
    // Drift is the page travel in viewports, and is release times its length
    // for as long as the release runs.
    expect(scrollState(h * 0.8, h, work, end).drift).toBeCloseTo(0.8, 9);
    expect(scrollState(h * 0.8, h, work, end).drift).toBeCloseTo(scrollState(h * 0.8, h, work, end).release * RELEASE_LENGTH, 9);
    expect(scrollState(h * 5, h, work, end).drift).toBeCloseTo(5, 9);
  });

  it("bounds every state on overscroll and short mobile layouts", () => {
    for (const height of [375, 844, 1080]) {
      for (const y of [-900, 0, 150, 700, 4000, 9000]) {
        const { drift, ...unit } = scrollState(y, height, height * 1.65, height * 4.3);
        for (const value of Object.values(unit)) {
          expect(value).toBeGreaterThanOrEqual(0);
          expect(value).toBeLessThanOrEqual(1);
          expect(Number.isFinite(value)).toBe(true);
        }
        expect(drift).toBeGreaterThanOrEqual(0);
        expect(Number.isFinite(drift)).toBe(true);
      }
    }
  });

  it("orbits and closes on the head over the release, and returns as the page ends", () => {
    const opening = portraitCamera(0, 16 / 9);
    expect(opening.x).toBeCloseTo(0, 12);
    expect(opening.z).toBe(LENS_DISTANCE);
    expect(opening.yaw).toBe(0);
    expect(opening.distance).toBe(LENS_DISTANCE);
    // The first wheel-sized step is gentle, so nothing can present as a flash.
    expect(portraitCamera(0.03, 16 / 9).yaw).toBeLessThan(0.001);
    expect(portraitCamera(0.03, 16 / 9).distance).toBeGreaterThan(5.99);
    let previous = opening;
    for (let step = 1; step <= 40; step++) {
      const now = portraitCamera(step / 40, 16 / 9);
      expect(now.yaw).toBeGreaterThanOrEqual(previous.yaw);
      expect(now.distance).toBeLessThanOrEqual(previous.distance);
      expect(Math.hypot(now.x, now.z)).toBeCloseTo(now.distance, 9);
      previous = now;
    }
    const complete = portraitCamera(1, 16 / 9);
    expect(complete.yaw).toBeCloseTo(0.34, 6);
    expect(complete.distance).toBeCloseTo(4.85, 6);
    // A narrow screen turns less, so the face cannot swing out of frame.
    expect(portraitCamera(1, 390 / 844).yaw).toBeCloseTo(0.2, 6);
    // The ending brings the lens back to the opening eye for the re-formed head.
    let returning = complete;
    for (let step = 1; step <= 20; step++) {
      const now = portraitCamera(1, 16 / 9, step / 20);
      expect(now.yaw).toBeLessThanOrEqual(returning.yaw);
      expect(now.distance).toBeGreaterThanOrEqual(returning.distance);
      returning = now;
    }
    expect(returning.yaw).toBe(0);
    expect(returning.distance).toBe(LENS_DISTANCE);
  });

  it.each([[320, 900], [390, 844], [768, 1024]])("fits the physical head on a %i by %i viewport", (width, height) => {
    const { pixelHeight, pixelOffset } = portraitFraming(width, height);
    const pixelWidth = pixelHeight * 700 / 650;
    const left = width / 2 + pixelOffset + (0.29 - 0.5) * pixelWidth;
    const right = width / 2 + pixelOffset + (0.99 - 0.5) * pixelWidth;
    expect(left).toBeGreaterThan(0);
    expect(right).toBeLessThan(width);
  });
});

describe("portrait source", () => {
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
    // The fourth seed is the point's place across the plate, which orders
    // the erosion: it must run left to right with x.
    for (let i = 0; i < a.depths.length; i++) {
      const x = a.positions[i * 3] ?? 0;
      const u = a.seeds[i * 4 + 3] ?? 0;
      expect(Math.sign(x)).toBe(Math.sign(u - 0.5));
    }
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

  it("takes relief from the depth half of the plate, never from brightness", () => {
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
    const left = depths.filter((_, index) => (positions[index * 3] ?? 0) < 0);
    const right = depths.filter((_, index) => (positions[index * 3] ?? 0) > 0);
    expect(left.length).toBeGreaterThan(0);
    expect(right.length).toBeGreaterThan(0);
    expect(new Set(left).size).toBe(1);
    expect(new Set(right).size).toBe(1);
    expect(left[0]).toBeLessThan(right[0] ?? 0);
    expect(left[0]).toBeCloseTo(portraitRelief(140 / 255), 5);
    expect(right[0]).toBeCloseTo(portraitRelief(250 / 255), 5);
  });
});

describe("portrait press interaction", () => {
  it("leaves touch scrolling, secondary clicks, dispersed state and paused/reduced mode alone", () => {
    expect(acceptsPortraitPress("mouse", 0, 0, false)).toBe(true);
    expect(acceptsPortraitPress("touch", 0, 0, false)).toBe(false);
    expect(acceptsPortraitPress("mouse", 2, 0, false)).toBe(false);
    expect(acceptsPortraitPress("mouse", 0, 0.5, false)).toBe(false);
    expect(acceptsPortraitPress("mouse", 0, 0, true)).toBe(false);
  });
  it("only accepts the portrait surface and leaves controls alone", () => {
    const hero = document.createElement("section");
    hero.className = "particle-hero";
    const button = document.createElement("button");
    const icon = document.createElement("span");
    button.append(icon); hero.append(button);
    expect(isPortraitSurface(hero)).toBe(true);
    expect(isPortraitSurface(icon)).toBe(false);
    expect(isPortraitSurface(document.body)).toBe(false);
  });
});

describe("portrait files", () => {
  it("ships the packed colour and depth plate the scene fetches at runtime", () => {
    // The scene loads this from public/ with new Image(), which no build
    // check follows, so this is the only gate that notices a missing plate.
    expect(PORTRAIT_POINTS_SOURCE.endsWith("/portrait/portrait-source.webp")).toBe(true);
    const plate = readFileSync(resolve(process.cwd(), "public/portrait/portrait-source.webp"));
    expect(plate.subarray(0, 4).toString("ascii")).toBe("RIFF");
    expect(plate.subarray(8, 16).toString("ascii")).toBe("WEBPVP8 ");
    // VP8 key frame: start code 9d 01 2a, then 14-bit width and height.
    expect([...plate.subarray(23, 26)]).toEqual([0x9d, 0x01, 0x2a]);
    expect(plate.readUInt16LE(26) & 0x3fff).toBe(PORTRAIT_CROP.width * PLATE_SCALE * 2);
    expect(plate.readUInt16LE(28) & 0x3fff).toBe(PORTRAIT_CROP.height * PLATE_SCALE);
    // Two points for every pixel a 1x plate held, at under half its weight.
    expect(plate.length).toBeLessThan(300_000);
  });

  it("ships the static portrait from public/, where the build can always find it", () => {
    for (const source of [portraitSource, portraitSource1x]) {
      expect(source.startsWith("/portrait/")).toBe(true);
      expect(existsSync(resolve(process.cwd(), "public", source.slice(1)))).toBe(true);
    }
  });
});
