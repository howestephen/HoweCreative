import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import siteContent from "../../site-content.json";

const root = resolve(__dirname, "../..");
type Media = { type: string; src: string };
const projects = (siteContent as unknown as { caseStudies: { projects: { slug: string; media?: Media[] }[] } })
  .caseStudies.projects;

describe("gallery logotypes", () => {
  // White-on-transparent logotypes vanish on the cream lightbox and thumbnails.
  it("uses the grounded and black-text versions", () => {
    const sources = projects.flatMap((p) => (p.media ?? []).map((m) => m.src));
    expect(sources).not.toContain("/case-studies/uncx-rebrand/uncx-logotype.svg");
    expect(sources).not.toContain("/case-studies/uncx-academy/logotype.webp");
    for (const src of ["/case-studies/uncx-rebrand/uncx-logotype.webp", "/case-studies/uncx-academy/logotype-black.webp"]) {
      expect(sources).toContain(src);
      expect(existsSync(resolve(root, "public", src.slice(1))), src).toBe(true);
    }
  });
});

describe("video posters", () => {
  // A video without a poster renders as a black rectangle until played.
  it("gives every video a poster that exists on disk", () => {
    for (const p of projects) {
      for (const m of (p.media ?? []) as (Media & { poster?: string })[]) {
        if (m.type !== "video") continue;
        expect(m.poster, m.src).toBeTruthy();
        expect(existsSync(resolve(root, "public", m.poster!.slice(1))), m.poster).toBe(true);
      }
    }
  });
});
