import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { projects, projectEditorial } from "./project-index";
import { projectStories } from "./project-stories";
import { portfolioProjects } from "./portfolio";
import earlier from "./earlier-work.json";
import cv from "./cv.json";
import { imageVariants, variantUrl } from "../lib/responsive-image";

describe("portfolio evidence and asset coverage", () => {
  it("shows every current project exactly once", () => {
    expect(new Set(projects.map((project) => project.slug)).size).toBe(
      portfolioProjects.length,
    );
    expect(projects.map((project) => project.slug).sort()).toEqual(
      portfolioProjects.map((project) => project.slug).sort(),
    );
    for (const project of projects)
      expect(projectEditorial[project.slug].credit).toBeTruthy();
  });
  it("has every linked image, retina variant, video and poster on disk", () => {
    const media = [
      ...projects.flatMap((project) => project.media ?? []),
      ...earlier.flatMap((entry) => entry.media),
    ];
    for (const item of media) {
      expect(existsSync(resolve("public", item.src.slice(1))), item.src).toBe(
        true,
      );
      expect(item.alt, item.src).toBeTruthy();
      // SVGs are resolution independent; every raster image needs its variants.
      if (item.type === "image" && !item.src.endsWith(".svg")) {
        const variants = imageVariants(item.src);
        expect(variants, `${item.src} has no responsive variants`).toBeTruthy();
        for (const width of variants?.v ?? [])
          expect(
            existsSync(resolve("public", variantUrl(item.src, width).slice(1))),
            variantUrl(item.src, width),
          ).toBe(true);
      }
      if (item.type === "video")
        expect(
          "poster" in item &&
            item.poster &&
            existsSync(resolve("public", item.poster.slice(1))),
          item.src,
        ).toBeTruthy();
    }
  });
  it("finds every story lead and chapter image in its project's gallery", () => {
    // Project.tsx drops a chapter image it cannot match, so a renamed file
    // would vanish from the case study without failing anything else.
    for (const [slug, story] of Object.entries(projectStories)) {
      const project = projects.find((item) => item.slug === slug);
      expect(project, slug).toBeTruthy();
      const names = [story.lead, ...story.chapters.flatMap((chapter) => chapter.images)];
      for (const name of names.filter(Boolean))
        expect(
          project?.media?.some((item) => item.src.endsWith(`/${name}`)) ||
            (name === story.lead && project?.image.endsWith(`/${name}`)),
          `${slug}: ${name}`,
        ).toBe(true);
    }
  });
  it("leads the rebrand on the card that shows the old mark becoming the new", () => {
    expect(projectStories["uncx-rebrand"].lead).toBe("card.webp");
    expect(projects.find((item) => item.slug === "uncx-rebrand")?.image).toBe(
      "/case-studies/uncx-rebrand/card.webp",
    );
  });
  it("records each image's real pixel size in the manifest", async () => {
    // The srcset and the budget below read sizes from the manifest, so it must
    // describe the files as they are.
    const media = [
      ...projects.flatMap((project) => project.media ?? []),
      ...earlier.flatMap((entry) => entry.media),
    ].filter((item) => item.type === "image" && !item.src.endsWith(".svg"));
    for (const item of media) {
      const { width, height } = await sharp(resolve("public", item.src.slice(1))).metadata();
      expect([imageVariants(item.src)?.w, imageVariants(item.src)?.h], item.src).toEqual([width, height]);
    }
  });
  it("keeps every full-size image within the loading budget", () => {
    // The original is the widest srcset candidate and what the lightbox opens,
    // so it is capped at 4096px wide (srcset picks by width) and 1 MB on disk.
    const media = [
      ...projects.flatMap((project) => project.media ?? []),
      ...earlier.flatMap((entry) => entry.media),
    ].filter((item) => item.type === "image" && !item.src.endsWith(".svg"));
    for (const item of media) {
      const size = imageVariants(item.src);
      expect(size?.w ?? Infinity, item.src).toBeLessThanOrEqual(4096);
      expect(statSync(resolve("public", item.src.slice(1))).size, item.src).toBeLessThanOrEqual(
        1024 * 1024,
      );
    }
  });
  it("encodes every video as H.264 with its index at the front", () => {
    // H.265 plays only where the device decodes it (Safari, and Chrome on most
    // Macs); H.264 plays in every browser. The index (moov) must come before
    // the media data so a film starts streaming at once.
    const videos = [
      ...projects.flatMap((project) => project.media ?? []),
      ...earlier.flatMap((entry) => entry.media),
    ].filter((item) => item.type === "video");
    expect(videos.length).toBeGreaterThan(0);
    for (const { src } of videos) {
      const file = readFileSync(resolve("public", src.slice(1)));
      const head = file.subarray(0, Math.min(file.length, 4 * 1024 * 1024));
      expect(head.includes("avc1"), `${src} is not H.264`).toBe(true);
      expect(head.includes("hvc1") || head.includes("hev1"), `${src} is H.265`).toBe(false);
      const moov = file.indexOf("moov");
      expect(moov, `${src} has no index`).toBeGreaterThan(-1);
      expect(moov < file.indexOf("mdat"), `${src} keeps its index after the media`).toBe(true);
    }
  });
  it("preserves archive credits and keeps restricted work out of the public archive", () => {
    expect(
      earlier.find((entry) => entry.slug === "burger-theory")?.credit,
    ).toContain("founder's father");
    expect(
      earlier.find((entry) => entry.slug === "chalet-chardons")?.credit,
    ).toContain("Maciek");
    expect(
      earlier.some((entry) => /derivco|corporate|switch/i.test(entry.slug)),
    ).toBe(false);
  });
  it("uses plain hyphens in the CV and new project copy", () => {
    expect(
      JSON.stringify([cv, earlier, projectEditorial, projects]),
    ).not.toMatch(/[—–]/);
  });
  it("keeps home metadata free of personal contact details", () => {
    const html = readFileSync("index.html", "utf8");
    expect(html).not.toContain(cv.email);
    expect(html).not.toMatch(/mailto:|tel:/);
  });
});
