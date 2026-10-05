import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cleanup, render } from "@testing-library/react";
import { createMemoryRouter, RouterProvider, type RouteObject } from "react-router";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { portfolioProjects } from "./data/portfolio";
import { WorkIndex } from "./concept/WorkIndex";
import { Archive } from "./pages/Archive";
import { CV } from "./pages/CV";

const root = resolve(__dirname, "../..");
const read = (file: string) => readFileSync(resolve(root, file), "utf8");
const ORIGIN = "https://howecreative.co.uk";
// En dash and em dash, built from code points so this file holds neither.
const DASHES = new RegExp(`[${String.fromCharCode(0x2013)}${String.fromCharCode(0x2014)}]`);

const routes: RouteObject[] = [
  { path: "/", Component: WorkIndex },
  { path: "/archive", Component: Archive },
  { path: "/cv", Component: CV },
];

function renderAt(url: string) {
  render(<RouterProvider router={createMemoryRouter(routes, { initialEntries: [url] })} />);
}

const meta = (selector: string) =>
  document.head.querySelector<HTMLMetaElement | HTMLLinkElement>(selector);
const canonical = () => meta('link[rel="canonical"]')?.getAttribute("href");
const description = () => meta('meta[name="description"]')?.getAttribute("content");

describe("static files (WP-7)", () => {
  it("serves a robots.txt that names the sitemap and keeps the redesign out", () => {
    const robots = read("public/robots.txt");
    expect(robots).toMatch(/^Sitemap: https:\/\/howecreative\.co\.uk\/sitemap\.xml$/m);
    expect(robots).toMatch(/^Disallow: \/particle-redesign$/m);
    expect(robots).toMatch(/^Allow: \/$/m);
  });

  it("serves a sitemap listing the pages and every study, and no redesign URL", () => {
    expect(existsSync(resolve(root, "public/sitemap.xml"))).toBe(true);
    const sitemap = read("public/sitemap.xml");
    const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].split("&amp;").join("&"));
    for (const path of ["/", "/archive", "/cv"]) expect(locs).toContain(ORIGIN + path);
    for (const p of portfolioProjects) expect(locs).toContain(`${ORIGIN}/?study=${p.slug}`);
    expect(locs.some((l) => l.includes("particle-redesign"))).toBe(false);
  });

  it("links the touch icon, a PNG favicon and the manifest from index.html", () => {
    const html = read("index.html");
    expect(html).toMatch(/rel="apple-touch-icon"[^>]*href="\/apple-touch-icon\.png"/);
    expect(html).toMatch(/rel="icon"[^>]*href="\/favicon-32\.png"/);
    expect(html).toMatch(/rel="manifest"[^>]*href="\/site\.webmanifest"/);
    for (const file of ["apple-touch-icon.png", "favicon-32.png", "site.webmanifest"]) {
      expect(existsSync(resolve(root, "public", file)), file).toBe(true);
    }
  });

  it("drops trailing slashes in vercel.json", () => {
    expect(JSON.parse(read("vercel.json")).trailingSlash).toBe(false);
  });
});

describe("per-route metadata (WP-7)", () => {
  beforeEach(() => {
    document.title = "Home title";
  });
  afterEach(() => {
    cleanup();
  });

  it("titles an open study and points its canonical at the study URL", () => {
    renderAt("/?study=quiver");
    expect(document.title).toContain("Quiver");
    expect(canonical()).toBe(`${ORIGIN}/?study=quiver`);
    expect(meta('meta[property="og:url"]')?.getAttribute("content")).toBe(`${ORIGIN}/?study=quiver`);
    expect(meta('meta[property="og:title"]')?.getAttribute("content")).toContain("Quiver");
    expect(description()).toBeTruthy();
  });

  it("gives every study its own title", () => {
    for (const project of portfolioProjects) {
      renderAt(`/?study=${project.slug}`);
      expect(document.title, project.slug).toContain(project.title);
      expect(canonical(), project.slug).toBe(`${ORIGIN}/?study=${project.slug}`);
      cleanup();
    }
  });

  it("restores the home metadata when the study closes", () => {
    renderAt("/?study=quiver");
    cleanup();
    expect(document.title).toBe("Home title");
    expect(canonical() ?? "").not.toContain("study=");
  });

  it("sets the archive's title, description and canonical", () => {
    renderAt("/archive");
    expect(document.title).toBe("Work archive - Stephen Howe");
    expect(canonical()).toBe(`${ORIGIN}/archive`);
    expect(description()).toBeTruthy();
  });

  it("sets the CV's description and canonical, without contact details", () => {
    renderAt("/cv");
    expect(document.title).toBe("Stephen Howe - CV");
    expect(canonical()).toBe(`${ORIGIN}/cv`);
    expect(description()).toBeTruthy();
    const all = [...document.head.querySelectorAll("meta, link")].map((n) => n.outerHTML).join("\n");
    expect(all).not.toMatch(/@|mailto:|\+?\d[\d\s]{9,}/);
  });

  it("uses no em or en dashes in metadata", () => {
    for (const url of ["/archive", "/cv", ...portfolioProjects.map((p) => `/?study=${p.slug}`)]) {
      renderAt(url);
      const all = document.title + [...document.head.querySelectorAll("meta, link")].map((n) => n.outerHTML).join("");
      expect(all, url).not.toMatch(DASHES);
      cleanup();
    }
  });
});
