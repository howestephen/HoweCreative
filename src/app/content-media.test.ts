import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";

import siteContent from "../../site-content.json";
import earlierWork from "./data/earlier-work.json";
import { imageVariants, variantUrl } from "./lib/responsive-image";

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

describe("gallery images", () => {
  const images = projects
    .flatMap((p) => p.media ?? [])
    .filter((m) => m.type === "image" && !m.src.endsWith(".svg"));

  it("has every image and its retina variants on disk", () => {
    for (const { src } of images) {
      expect(existsSync(resolve(root, "public", src.slice(1))), src).toBe(true);
      const variants = imageVariants(src);
      expect(variants, `${src} has no responsive variants`).toBeTruthy();
      for (const width of variants?.v ?? [])
        expect(existsSync(resolve(root, "public", variantUrl(src, width).slice(1))), variantUrl(src, width)).toBe(true);
    }
  });

  // The srcset and the budget below read sizes from the manifest, so it must
  // describe the files as they are.
  it("records each image's real pixel size in the manifest", async () => {
    for (const { src } of images) {
      const { width, height } = await sharp(resolve(root, "public", src.slice(1))).metadata();
      expect([imageVariants(src)?.w, imageVariants(src)?.h], src).toEqual([width, height]);
    }
  });

  // The original is the widest srcset candidate and what the lightbox opens,
  // so it is capped at 4096px wide (srcset picks by width) and 1 MB on disk.
  it("keeps every full-size image within the loading budget", () => {
    for (const { src } of images) {
      expect(imageVariants(src)?.w ?? Infinity, src).toBeLessThanOrEqual(4096);
      expect(statSync(resolve(root, "public", src.slice(1))).size, src).toBeLessThanOrEqual(1024 * 1024);
    }
  });
});

describe("study videos", () => {
  const videos = [
    ...projects.flatMap((p) => p.media ?? []),
    ...(earlierWork as { media: Media[] }[]).flatMap((entry) => entry.media),
  ].filter((m) => m.type === "video");

  // H.265 plays only where the device decodes it (Safari, and Chrome on most
  // Macs); H.264 plays in every browser. The index (moov) must come before the
  // media data so a film starts streaming at once.
  it("encodes every video as H.264 with its index at the front", () => {
    expect(videos.length).toBeGreaterThan(0);
    for (const { src } of videos) {
      const file = readFileSync(resolve(root, "public", src.slice(1)));
      const head = file.subarray(0, Math.min(file.length, 4 * 1024 * 1024));
      expect(head.includes("avc1"), `${src} is not H.264`).toBe(true);
      expect(head.includes("hvc1") || head.includes("hev1"), `${src} is H.265`).toBe(false);
      const moov = file.indexOf("moov");
      const mdat = file.indexOf("mdat");
      expect(moov, `${src} has no index`).toBeGreaterThan(-1);
      expect(moov < mdat, `${src} keeps its index after the media`).toBe(true);
    }
  });
});
