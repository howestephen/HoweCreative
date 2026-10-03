import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import siteContent from "../../site-content.json";

const root = resolve(__dirname, "../..");
const vercel = JSON.parse(readFileSync(resolve(root, "vercel.json"), "utf8")) as {
  redirects?: { source: string; destination: string; permanent?: boolean }[];
};

// Slugs linked as https://howecreative.co.uk/work/<slug> from the CV PDFs
// already sent out and from the redesign's CV page.
const CV_LINKED_SLUGS = ["badger-club", "noticia-lingo", "quiver", "solana-diary", "uncx-academy", "uncx-menu", "uncx-video-system"];

const projects = (siteContent as unknown as { caseStudies: { projects: { slug: string }[] } })
  .caseStudies.projects;

describe("deploy config", () => {
  it("forwards /work/<slug> links to the study on the home page", () => {
    for (const source of ["/work/:slug", "/work/:slug/"]) {
      const redirect = vercel.redirects?.find((r) => r.source === source);
      expect(redirect, source).toEqual({ source, destination: "/?study=:slug", permanent: false });
    }
  });

  it("has a study for every slug the CVs link to", () => {
    const slugs = new Set(projects.map((p) => p.slug));
    for (const slug of CV_LINKED_SLUGS) expect(slugs, slug).toContain(slug);
  });

  it("keeps crawlers out of the redesign preview", () => {
    const robots = readFileSync(resolve(root, "public/robots.txt"), "utf8");
    expect(robots).toMatch(/^User-agent: \*$/m);
    expect(robots).toMatch(/^Disallow: \/particle-redesign$/m);
  });
});
