import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { acceptsPortraitPress, isPortraitSurface, PORTRAIT_CROP, portraitFraming, portraitPhases, portraitSectionDepth, samplePortrait, scrollState } from "./portrait-particles";
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
    expect(scrollState(work - h * 0.62, h, work, end).release).toBe(1);
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

  it('finishes the sectional expansion before beginning the particle dissolve', () => {
    expect(portraitPhases(0)).toEqual({ separate: 0, dissolve: 0 });
    expect(portraitPhases(0.35).separate).toBeGreaterThan(0.5);
    expect(portraitPhases(0.5).dissolve).toBe(0);
    expect(portraitPhases(0.61)).toEqual({ separate: 1, dissolve: 0 });
    expect(portraitPhases(0.82).dissolve).toBeGreaterThan(0.5);
    expect(portraitPhases(1)).toEqual({ separate: 1, dissolve: 1 });
    expect(portraitPhases(0)).toEqual({ separate: 0, dissolve: 0 });
  });

  it('keeps the profile on one section instead of inflating the nose', () => {
    expect(portraitSectionDepth(0.91, 0.42)).toBeCloseTo(portraitSectionDepth(0.72, 0.435));
    expect(portraitSectionDepth(0.77, 0.48)).toBeGreaterThan(portraitSectionDepth(0.34, 0.3));
    expect(portraitSectionDepth(0.34, 0.3)).toBeGreaterThan(portraitSectionDepth(0.5, 0.9));
    const pixels = new Uint8ClampedArray(80 * 80 * 4);
    for (let y = 0; y < 80; y++) for (let x = 0; x < 80; x++) {
      const i = (y * 80 + x) * 4;
      pixels[i + 3] = 255;
      if (x >= 12 && x <= 67 && y >= 9 && y <= 70) {
        pixels[i] = pixels[i + 1] = pixels[i + 2] = 150;
      }
    }
    const { depths } = samplePortrait(pixels, 80, 80);
    expect(Math.min(...depths)).toBeGreaterThan(0);
    expect(Math.max(...depths)).toBeLessThan(1);
    expect(new Set(depths).size).toBeGreaterThan(4);
    expect(Math.max(...depths) - Math.min(...depths)).toBeGreaterThan(0.3);
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
