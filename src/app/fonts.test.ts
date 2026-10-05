import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(__dirname, "../..");
const css = readFileSync(resolve(root, "src/styles/fonts.css"), "utf8");
const html = readFileSync(resolve(root, "index.html"), "utf8");

describe("self-hosted fonts (B-6)", () => {
  it("makes no request to Google Fonts", () => {
    expect(css).not.toMatch(/googleapis|gstatic/);
    expect(html).not.toMatch(/googleapis|gstatic/);
  });

  it("imports the same families, weights and axes from installed Fontsource packages", () => {
    const imports = [...css.matchAll(/@import "(@fontsource[^"]+)"/g)].map((m) => m[1]);
    for (const spec of imports) expect(existsSync(resolve(root, "node_modules", spec))).toBe(true);
    // Fraunces: variable wght + opsz axes, upright and italic (old URL: 400-600 and italic 400-500).
    expect(imports).toContain("@fontsource-variable/fraunces/opsz.css");
    expect(imports).toContain("@fontsource-variable/fraunces/opsz-italic.css");
    for (const w of ["400", "500", "600"]) {
      expect(imports).toContain(`@fontsource/instrument-sans/latin-${w}.css`);
      expect(imports).toContain(`@fontsource/ibm-plex-mono/latin-${w}.css`);
    }
    expect(imports).toContain("@fontsource/instrument-sans/latin-400-italic.css");
    expect(imports.length).toBe(9);
    // Fontsource sets font-display: swap.
    for (const spec of imports) {
      const file = readFileSync(resolve(root, "node_modules", spec), "utf8");
      expect(file).toContain("font-display: swap");
    }
    expect(css).toContain('--font-headline: "Fraunces Variable"');
  });

  it("preloads the two body faces", () => {
    const preloads = [...html.matchAll(/<link[^>]*rel="preload"[^>]*>/g)].map((m) => m[0]);
    expect(preloads.length).toBe(2);
    for (const tag of preloads) {
      expect(tag).toContain('as="font"');
      expect(tag).toContain('type="font/woff2"');
      expect(tag).toContain("crossorigin");
      const href = tag.match(/href="([^"]+)"/)![1];
      expect(existsSync(resolve(root, href.slice(1)))).toBe(true);
    }
  });
});
