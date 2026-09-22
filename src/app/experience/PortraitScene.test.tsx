import { act, cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Scene, ShaderMaterial } from "three";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { acceptsPortraitPress, isPortraitSurface, PORTRAIT_CROP, PORTRAIT_POINTS_SOURCE, portraitCamera, portraitFraming, portraitPhases, portraitRelief, samplePortrait, scrollState, vertexShader } from "./portrait-particles";
import PortraitScene from "./PortraitScene";

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

  it("releases the head completely before the work viewport and finishes the closing form", () => {
    const h = 800;
    const work = 1440;
    const end = 2400;
    expect(scrollState(0, h, work, end)).toEqual({ release: 0, travel: 0, ending: 0, intro: 1 });
    // Separation answers the first scroll. The release is linear because the
    // scroll follower already supplies the easing.
    const firstScroll = scrollState(h * 0.1, h, work, end);
    const secondScroll = scrollState(h * 0.2, h, work, end);
    expect(firstScroll.release).toBeGreaterThan(0);
    expect(secondScroll.release).toBeCloseTo(firstScroll.release * 2, 6);
    expect(scrollState(work - h * 0.6, h, work, end).release).toBe(1);
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
    expect(portraitPhases(0)).toEqual({ loosen: 0, disperse: 0, turn: 0 });

    // Separation begins on the first scroll: the head is already coming
    // apart well before anything is carried off.
    expect(portraitPhases(0.1).loosen).toBeGreaterThan(0);
    expect(portraitPhases(0.1).disperse).toBeGreaterThan(0);

    // There is no dead zone followed by a threshold on the first movement.
    expect(portraitPhases(0.001).disperse).toBeGreaterThan(0);

    const firstMovement = portraitPhases(0.03);
    expect(firstMovement.loosen).toBeGreaterThan(0);
    expect(firstMovement.disperse).toBeGreaterThan(0);
    expect(firstMovement.turn).toBe(0);
    const firstCamera = portraitCamera(firstMovement.disperse, 0, 16 / 9);
    expect(firstCamera.x).toBeLessThan(0.001);
    expect(firstCamera.z).toBeGreaterThan(5.99);

    const early = portraitPhases(0.2);
    expect(early.loosen).toBeGreaterThan(0);
    expect(early.disperse).toBeGreaterThan(0);

    // By halfway all three are running. Loosening still leads dispersal, so a
    // point is released before it is carried into the wider field.
    const middle = portraitPhases(0.5);
    expect(middle.loosen).toBeGreaterThan(0);
    expect(middle.disperse).toBeGreaterThan(0);
    expect(middle.turn).toBeGreaterThan(0);
    expect(middle.disperse).toBeLessThan(middle.loosen);

    const complete = portraitPhases(1);
    expect(complete.loosen).toBe(1);
    expect(complete.disperse).toBeCloseTo(1);
    expect(complete.turn).toBe(1);

    // The response has no dead zone, but its first wheel-sized step is gentler
    // than the middle of the breakup so it cannot present as a flash.
    const openingStep = portraitPhases(0.08).loosen - portraitPhases(0).loosen;
    const middleStep = portraitPhases(0.48).loosen - portraitPhases(0.4).loosen;
    expect(openingStep).toBeGreaterThan(0);
    expect(openingStep).toBeLessThan(middleStep);
  });

  it('keeps camera travel shallow while the particles create the depth', () => {
    const early = portraitPhases(0.03);
    const opening = portraitCamera(early.disperse, 0, 16 / 9);
    expect(opening.x).toBeLessThan(0.001);
    expect(opening.z).toBeGreaterThan(5.99);

    const complete = portraitCamera(1, 1, 16 / 9);
    expect(complete.x).toBeGreaterThan(0);
    expect(complete.z).toBeGreaterThanOrEqual(5.1);
    expect(complete.z).toBeLessThan(6);
  });

  it('varies size only after flight starts and keeps the cloud through the work handoff', () => {
    expect(vertexShader).toContain('scatter < 0.72');
    expect(vertexShader).toContain('mix(0.24, 0.62');
    expect(vertexShader).toContain('mix(0.85, 1.55');
    expect(vertexShader).toContain('mix(2.0, 3.1');
    expect(vertexShader).toContain('smoothstep(0.08, 0.78, flight)');
    expect(vertexShader).toContain('smoothstep(0.04, 0.72, uTravel)');
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
