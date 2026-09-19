import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { acceptsPortraitPress, isPortraitSurface, PORTRAIT_CROP, PORTRAIT_POINTS_SOURCE, portraitFraming, portraitPhases, portraitRelief, samplePortrait, scrollState } from "./portrait-particles";
import PortraitScene from "./PortraitScene";

vi.mock("three", async (original) => ({
  ...await original<typeof import("three")>(),
  WebGLRenderer: class { constructor() { throw new Error("WebGL disabled"); } },
}));

it("reports unavailable WebGL without leaving a blank canvas attached", () => {
  const onUnavailable = vi.fn();
  const onReady = vi.fn();
  const motion = { current: { release: 0, approach: 0, travel: 0, ending: 0, pointerX: 0, pointerY: 0, velocity: 0, paused: false } };
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
    expect(scrollState(0, h, work, end)).toEqual({ release: 0, approach: 0, travel: 0, ending: 0, intro: 1 });
    // The turn answers the first scroll; the portrait still holds together.
    expect(scrollState(h * 0.1, h, work, end).approach).toBeGreaterThan(0);
    expect(scrollState(h * 0.1, h, work, end).release).toBe(0);
    expect(scrollState(work - h * 0.25, h, work, end).release).toBe(1);
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

  it('approaches and turns first, loosens through the middle, then disperses', () => {
    expect(portraitPhases(0)).toEqual({ approach: 0, loosen: 0, disperse: 0 });

    // Separation begins on the first scroll: the head is already coming
    // apart well before anything is carried off.
    expect(portraitPhases(0.1).loosen).toBeGreaterThan(0);
    expect(portraitPhases(0.1).disperse).toBe(0);

    const early = portraitPhases(0.2);
    expect(early.loosen).toBeGreaterThan(0);
    expect(early.disperse).toBe(0);

    // By halfway all three are running, and dispersal trails the loosening
    // that feeds it: a point is always released before anything carries it away.
    const middle = portraitPhases(0.5);
    expect(middle.approach).toBeGreaterThan(0);
    expect(middle.loosen).toBeGreaterThan(0);
    expect(middle.disperse).toBeGreaterThan(0);
    expect(middle.disperse).toBeLessThan(middle.loosen);

    const complete = portraitPhases(1);
    expect(complete.approach).toBe(1);
    expect(complete.loosen).toBe(1);
    expect(complete.disperse).toBeCloseTo(1);

    // Loosen is linear in progress: the scroll is already eased once, and a
    // second easing held the whole head together for the first third.
    const step = (a: number, b: number) => portraitPhases(b).loosen - portraitPhases(a).loosen;
    expect(step(0.1, 0.2)).toBeCloseTo(step(0.2, 0.3), 6);
    expect(step(0.3, 0.4)).toBeCloseTo(step(0.5, 0.6), 6);
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
