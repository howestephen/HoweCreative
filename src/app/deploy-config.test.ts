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

describe("fonts", () => {
  it("are self-hosted, with no request to Google Fonts", () => {
    const css = readFileSync(resolve(process.cwd(), "src/styles/fonts.css"), "utf8");
    expect(css).not.toMatch(/googleapis|gstatic/);
    expect(css).toMatch(/@fontsource\/instrument-sans/);
    expect(css).toMatch(/@fontsource\/ibm-plex-mono/);
  });
});

describe("content", () => {
  const projects = (siteContent as { caseStudies: { projects: { media?: { src: string; alt?: string }[] }[] } })
    .caseStudies.projects;

  it("never gives two different images the same alt", () => {
    const byAlt = new Map<string, Set<string>>();
    for (const item of projects.flatMap((project) => project.media ?? [])) {
      if (!item.alt) continue;
      byAlt.set(item.alt, (byAlt.get(item.alt) ?? new Set()).add(item.src));
    }
    const shared = [...byAlt].filter(([, srcs]) => srcs.size > 1).map(([alt]) => alt);
    expect(shared).toEqual([]);
  });

  it("links the repository at its current name", () => {
    expect((siteContent as { profile: { repoUrl: string } }).profile.repoUrl).toBe(
      "https://github.com/howestephen/HoweCreative",
    );
  });
});

describe("security and cache headers (B-3, B-5)", () => {
  type HeaderRule = { source: string; headers: { key: string; value: string }[] };
  const rules = (JSON.parse(readFileSync(resolve(process.cwd(), "vercel.json"), "utf8")) as { headers?: HeaderRule[] })
    .headers ?? [];
  const headersFor = (source: string) =>
    Object.fromEntries((rules.find((rule) => rule.source === source)?.headers ?? []).map((h) => [h.key.toLowerCase(), h.value]));

  it("sends the security headers on every page", () => {
    const all = headersFor("/(.*)");
    expect(all["x-content-type-options"]).toBe("nosniff");
    expect(all["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(all["x-frame-options"]).toBe("DENY");
    expect(all["permissions-policy"]).toMatch(/camera=\(\)/);
    const csp = all["content-security-policy-report-only"] ?? all["content-security-policy"];
    expect(csp).toMatch(/default-src 'self'/);
    expect(csp).toMatch(/frame-ancestors 'none'/);
    // The contact form's captcha and delivery must stay allowed.
    expect(csp).toMatch(/script-src[^;]*https:\/\/\*\.hcaptcha\.com/);
    expect(csp).toMatch(/frame-src[^;]*https:\/\/\*\.hcaptcha\.com/);
    expect(csp).toMatch(/connect-src[^;]*https:\/\/api\.web3forms\.com/);
    expect(csp).not.toMatch(/unsafe-eval|googleapis|gstatic/);
  });

  it("caches hashed assets for a year and media for a day", () => {
    expect(headersFor("/assets/(.*)")["cache-control"]).toBe("public, max-age=31536000, immutable");
    for (const folder of ["case-studies", "earlier-work", "portrait"]) {
      expect(headersFor(`/${folder}/(.*)`)["cache-control"]).toBe("public, max-age=86400, stale-while-revalidate=604800");
    }
  });
});
