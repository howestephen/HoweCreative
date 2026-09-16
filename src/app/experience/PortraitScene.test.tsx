import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PORTRAIT_CROP, portraitFraming, samplePortrait, scrollState } from "./portrait-particles";
import PortraitScene from "./PortraitScene";

vi.mock("three", async (original) => ({
  ...await original<typeof import("three")>(),
  WebGLRenderer: class { constructor() { throw new Error("WebGL disabled"); } },
}));

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
    const a = samplePortrait(pixels, 20, 20);
    const b = samplePortrait(pixels, 20, 20);
    expect(a.positions).toEqual(b.positions);
    expect(a.seeds).toEqual(b.seeds);
    expect(a.positions.length).toBeGreaterThan(0);
    expect(a.positions.length / 3).toBe(a.seeds.length / 4);
    expect(a.positions.length).toBe(a.colours.length);
    expect([...a.positions, ...a.colours, ...a.seeds].every(Number.isFinite)).toBe(true);
  });

  it("does not scatter the black background or transparent pixels as a rectangle", () => {
    const black = new Uint8ClampedArray(20 * 20 * 4);
    for (let i = 3; i < black.length; i += 4) black[i] = 255;
    expect(samplePortrait(black, 20, 20).positions).toHaveLength(0);
    const invisible = new Uint8ClampedArray(20 * 20 * 4).fill(255);
    for (let i = 3; i < invisible.length; i += 4) invisible[i] = 0;
    expect(samplePortrait(invisible, 20, 20).positions).toHaveLength(0);
  });

  it("releases the head completely before the work viewport and finishes the closing form", () => {
    const h = 800;
    const work = 1440;
    const end = 2400;
    expect(scrollState(0, h, work, end)).toEqual({ release: 0, travel: 0, ending: 0, intro: 1 });
    expect(scrollState(work - h * 0.55, h, work, end).release).toBe(1);
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
});
