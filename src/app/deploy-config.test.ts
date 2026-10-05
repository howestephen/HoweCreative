import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import siteContent from "../../site-content.json";

type Rewrite = { source: string; destination: string };
const vercel = JSON.parse(readFileSync(resolve(process.cwd(), "vercel.json"), "utf8")) as {
  rewrites: Rewrite[];
};
const slugs = (siteContent as { caseStudies: { projects: { slug: string }[] } }).caseStudies.projects.map(
  (project) => project.slug,
);

// Vercel sources use path-to-regexp; these two shapes are all this file uses.
const matches = (source: string, path: string) => {
  const named = source.match(/^\/work\/:slug\((.+)\)$/);
  if (named) return new RegExp(`^/work/(${named[1]})$`).test(path);
  const raw = source.match(/^\/\((.+)\)$/);
  if (raw) return new RegExp(`^/(${raw[1]})$`).test(path);
  return source === path;
};
const firstRewrite = (path: string) => vercel.rewrites.find((rule) => matches(rule.source, path));

describe("redesign deploy config", () => {
  it("serves each prerendered study from its own page", () => {
    for (const slug of slugs) {
      expect(firstRewrite(`/work/${slug}`)?.destination, slug).toBe("/work/:slug/index.html");
    }
  });

  it("sends unknown pages to the app, which shows its not-found page", () => {
    for (const path of ["/work/no-such-project", "/nope", "/archive/old"]) {
      expect(firstRewrite(path)?.destination, path).toBe("/index.html");
    }
  });

  it("keeps missing assets as real 404s", () => {
    for (const path of ["/assets/x.js", "/case-studies/x.webp", "/earlier-work/x.webp", "/portrait/x.webp", "/models/x.glb", "/cv/x.pdf"]) {
      expect(firstRewrite(path), path).toBeUndefined();
    }
  });
});
