import { describe, expect, it } from "vitest";

import { imageVariants, neededWidth, srcSetFor, variantUrl } from "./responsive-image";

describe("responsive images", () => {
  it("lists every copy in the srcset with the original as the widest", () => {
    const srcSet = srcSetFor("/case-studies/uncx-app-concepts/tg-bot-flow.webp");
    expect(srcSet).toBe(
      [480, 960, 1440, 1920, 2560]
        .map((w) => `/case-studies/uncx-app-concepts/thumbs/tg-bot-flow-${w}.webp ${w}w`)
        .concat("/case-studies/uncx-app-concepts/tg-bot-flow.webp 4266w")
        .join(", "),
    );
  });

  it("escapes spaces so srcset candidates parse", () => {
    const srcSet = srcSetFor("/case-studies/solana-diary/diary weekly schedule.webp") ?? "";
    expect(srcSet).toContain("/case-studies/solana-diary/thumbs/diary%20weekly%20schedule-480.webp 480w");
    expect(srcSet.split(", ").every((candidate) => candidate.split(" ").length === 2)).toBe(true);
  });

  it("finds images whose paths arrive URL-encoded", () => {
    expect(imageVariants("/case-studies/solana-diary/diary%20weekly%20schedule.webp")?.w).toBe(3528);
  });

  it("has no srcset for images without variants", () => {
    expect(srcSetFor("/case-studies/uncx-rebrand/uncx-logotype.svg")).toBeUndefined();
  });

  it("names variants beside the original", () => {
    expect(variantUrl("/earlier-work/qtac/homepage.webp", 960)).toBe("/earlier-work/qtac/thumbs/homepage-960.webp");
  });

  it("asks for the cropped width when a wide image covers a square", () => {
    expect(neededWidth({ width: 128, height: 128 }, { w: 4000, h: 1000 }, "cover")).toBe(512);
    expect(neededWidth({ width: 400, height: 100 }, { w: 1000, h: 1000 }, "cover")).toBe(400);
  });

  it("never asks for more than the box when the image is contained", () => {
    expect(neededWidth({ width: 400, height: 300 }, { w: 4000, h: 1000 }, "contain")).toBe(400);
    expect(neededWidth({ width: 400, height: 300 }, { w: 1000, h: 1000 }, "contain")).toBe(300);
  });
});
