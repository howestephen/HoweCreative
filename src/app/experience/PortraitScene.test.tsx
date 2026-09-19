import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { acceptsPortraitPress, isPortraitSurface, PILLAR_FEATHER, PORTRAIT_CROP, PORTRAIT_PILLARS, portraitFraming, portraitPhases, portraitPillarDepth, portraitSurfaceDepth, samplePortrait, scrollState } from "./portrait-particles";
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
    expect(scrollState(0, h, work, end)).toEqual({ release: 0, approach: 0, travel: 0, ending: 0, intro: 1 });
    // The camera arc answers the first scroll; the portrait still holds.
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

  it('atomises the surfaces while the pillars are still separating, then drifts gradually', () => {
    expect(portraitPhases(0)).toEqual({ separate: 0, atomise: 0, disperse: 0 });
    const opening = portraitPhases(0.35);
    expect(opening.separate).toBeGreaterThan(0);
    expect(opening.separate).toBeLessThan(1);
    expect(opening.atomise).toBeGreaterThan(0);
    expect(opening.disperse).toBeGreaterThan(0);
    expect(opening.disperse).toBeLessThan(opening.atomise);
    const middle = portraitPhases(0.7);
    expect(middle.separate).toBeGreaterThan(middle.atomise);
    expect(middle.atomise).toBeGreaterThan(middle.disperse);
    expect(middle.disperse).toBeGreaterThan(0);
    expect(portraitPhases(0.5).disperse).toBeGreaterThan(0.2);
    expect(portraitPhases(0.85).disperse).toBeLessThan(0.8);
    const complete = portraitPhases(1);
    expect(complete.separate).toBe(1);
    expect(complete.atomise).toBe(1);
    expect(complete.disperse).toBeCloseTo(1);
  });

  it('assigns one shared depth per vertical pillar instead of using facial brightness', () => {
    expect(portraitPillarDepth(0.5)).toBe(portraitPillarDepth(0.53));
    expect(portraitPillarDepth(0.46)).not.toBe(portraitPillarDepth(0.5));
    // Away from a seam the surface depth is the rigid pillar depth.
    expect(portraitSurfaceDepth(0.5)).toBe(portraitPillarDepth(0.5));
    // Inside the feathered seam it sits between the two neighbouring pillars
    // and meets the neighbour halfway exactly at the boundary.
    const boundary = 7 / PORTRAIT_PILLARS;
    const left = portraitPillarDepth(boundary - PILLAR_FEATHER * 2);
    const right = portraitPillarDepth(boundary + PILLAR_FEATHER * 2);
    const seam = portraitSurfaceDepth(boundary + PILLAR_FEATHER * 0.25);
    expect(seam).not.toBe(left);
    expect(seam).not.toBe(right);
    expect((seam - left) * (seam - right)).toBeLessThan(0);
    expect(portraitSurfaceDepth(boundary)).toBeCloseTo((left + right) / 2, 10);
    expect(portraitSurfaceDepth(boundary + PILLAR_FEATHER)).toBe(right);
    expect(portraitSurfaceDepth(0)).toBe(portraitPillarDepth(0));
    expect(portraitSurfaceDepth(1)).toBe(portraitPillarDepth(1));
    const pixels = new Uint8ClampedArray(320 * 40 * 4);
    for (let y = 0; y < 40; y++) for (let x = 0; x < 320; x++) {
      const i = (y * 320 + x) * 4;
      pixels[i + 3] = 255;
      if (x >= 48 && x <= 270 && y >= 4 && y <= 34) {
        pixels[i] = pixels[i + 1] = pixels[i + 2] = 150;
      }
    }
    const { depths } = samplePortrait(pixels, 320, 40);
    expect(Math.min(...depths)).toBeGreaterThan(0);
    expect(Math.max(...depths)).toBeLessThan(1);
    const rigid = new Set(Array.from({ length: PORTRAIT_PILLARS }, (_, i) => Math.fround(portraitPillarDepth((i + 0.5) / PORTRAIT_PILLARS))));
    const onPillar = depths.filter((depth) => rigid.has(depth)).length;
    expect(new Set(depths.filter((depth) => rigid.has(depth))).size).toBeGreaterThan(6);
    // Seams are narrow: most sampled points still sit on a rigid pillar depth.
    expect(onPillar / depths.length).toBeGreaterThan(0.6);
    expect(Math.max(...depths) - Math.min(...depths)).toBeGreaterThan(0.4);
    // Across the whole portrait the field still uses its full depth range.
    const all = Array.from({ length: PORTRAIT_PILLARS }, (_, i) => portraitPillarDepth((i + 0.5) / PORTRAIT_PILLARS));
    expect(Math.max(...all) - Math.min(...all)).toBeGreaterThan(0.6);
    // Neighbouring pillars stay close, which is what stops the seam between
    // them tearing open into a vertical line as they separate through depth.
    // An earlier ordering put 0.77 against 0.19 and that gap was the line.
    const jumps = all.slice(1).map((depth, i) => Math.abs(depth - all[i]));
    expect(Math.max(...jumps)).toBeLessThan(0.15);
    // The sweep is monotonic, so the middle can never sit forward of both
    // edges: a bulging face was a rejected direction.
    expect(all.every((depth, i) => i === 0 || depth >= all[i - 1] - 0.05)).toBe(true);
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
