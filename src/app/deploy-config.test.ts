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

describe("content (D-3, B-9)", () => {
  it("never gives two different images the same alt", () => {
    const media = (siteContent as unknown as { caseStudies: { projects: { media?: { src: string; alt?: string }[] }[] } })
      .caseStudies.projects.flatMap((project) => project.media ?? []);
    const byAlt = new Map<string, Set<string>>();
    for (const item of media) if (item.alt) byAlt.set(item.alt, (byAlt.get(item.alt) ?? new Set()).add(item.src));
    expect([...byAlt].filter(([, srcs]) => srcs.size > 1).map(([alt]) => alt)).toEqual([]);
  });

  it("links the repository at its current name", () => {
    expect((siteContent as unknown as { profile: { repoUrl: string } }).profile.repoUrl).toBe(
      "https://github.com/howestephen/HoweCreative",
    );
  });
});
