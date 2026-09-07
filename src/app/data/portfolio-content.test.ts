import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { projects, projectEditorial } from "./project-index";
import { portfolioProjects } from "./portfolio";
import earlier from "./earlier-work.json";
import cv from "./cv.json";
import { thumbnail } from "../components/ProjectGallery";

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
  it("has every linked image, thumbnail, video and poster on disk", () => {
    const media = [
      ...projects.flatMap((project) => project.media ?? []),
      ...earlier.flatMap((entry) => entry.media),
    ];
    for (const item of media) {
      expect(existsSync(resolve("public", item.src.slice(1))), item.src).toBe(
        true,
      );
      expect(item.alt, item.src).toBeTruthy();
      if (item.type === "image")
        expect(
          existsSync(resolve("public", thumbnail(item.src).slice(1))),
          thumbnail(item.src),
        ).toBe(true);
      if (item.type === "video")
        expect(
          "poster" in item &&
            item.poster &&
            existsSync(resolve("public", item.poster.slice(1))),
          item.src,
        ).toBeTruthy();
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
