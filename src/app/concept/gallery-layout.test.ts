import { describe, expect, it } from "vitest";

import { galleryLayout, videoRatio } from "./WorkIndex";

// The strip header and scroller padding the layout subtracts from the box.
const CHROME = 52;

describe("desktop gallery layout", () => {
  it("stacks with the largest tiles that fill the text's height exactly", () => {
    const layout = galleryLayout(11, { width: 359, height: 887 });
    expect(layout).toMatchObject({ mode: "stack", columns: 2 });
    if (layout.mode !== "stack") throw new Error("expected a stack");
    // Six rows of tiles and five gaps use the whole height below the header.
    expect(6 * layout.height + 5 * 6).toBeCloseTo(887 - CHROME, 5);
  });

  it("adds columns rather than let tiles get flatter than 1.8:1", () => {
    const layout = galleryLayout(11, { width: 543, height: 887 });
    expect(layout).toMatchObject({ mode: "stack", columns: 3 });
    if (layout.mode !== "stack") throw new Error("expected a stack");
    expect(layout.width / layout.height).toBeLessThanOrEqual(1.8);
  });

  it("stops a short gallery at the tallest tile instead of stretching it", () => {
    const layout = galleryLayout(2, { width: 400, height: 1200 });
    expect(layout.mode).toBe("stack");
    if (layout.mode !== "stack") throw new Error("expected a stack");
    expect(layout.width / layout.height).toBeCloseTo(0.8, 5);
  });

  it("scrolls sideways only when even small tiles cannot fit, filling the height", () => {
    const layout = galleryLayout(60, { width: 359, height: 500 });
    expect(layout.mode).toBe("scroll");
    if (layout.mode !== "scroll") throw new Error("expected a scroller");
    // As many rows as the height holds, and no more.
    expect(layout.rows * layout.size + (layout.rows - 1) * 6).toBeLessThanOrEqual(500 - CHROME);
    expect((layout.rows + 1) * layout.size + layout.rows * 6).toBeGreaterThan(500 - CHROME);
  });
});

describe("desktop gallery layout in a squeezed box", () => {
  // A short text column with videos below can leave the gallery little room.
  for (const height of [30, 60, 110, 164]) {
    it(`never yields a negative or overflowing tile at ${height}px`, () => {
      const layout = galleryLayout(11, { width: 359, height });
      const room = Math.max(104, height - CHROME);
      if (layout.mode === "stack") {
        expect(layout.height).toBeGreaterThan(0);
        const rows = Math.ceil(11 / layout.columns);
        expect(rows * layout.height + (rows - 1) * 6).toBeLessThanOrEqual(room + 1e-6);
      } else {
        expect(layout.size).toBeGreaterThan(0);
        expect(layout.rows * layout.size + (layout.rows - 1) * 6).toBeLessThanOrEqual(room + 1e-6);
      }
    });
  }
});

describe("video shape", () => {
  it("reads each film's shape from its poster", () => {
    const wide = { type: "video" as const, src: "/x.mp4", poster: "/case-studies/uncx-video-system/ethcc-2025.poster.jpg" };
    const square = { type: "video" as const, src: "/y.mp4", poster: "/case-studies/uncx-video-system/lock-announcement-rise.poster.jpg" };
    expect(videoRatio(wide)).toBeCloseTo(16 / 9, 2);
    expect(videoRatio(square)).toBe(1);
  });

  it("falls back to 16:9 without a known poster", () => {
    expect(videoRatio({ type: "video", src: "/z.mp4" })).toBeCloseTo(16 / 9, 5);
  });
});
