import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider, type RouteObject } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Layout } from "./components/Layout";
import { Capabilities } from "./concept/Capabilities";
import { ContactFoot } from "./concept/ContactFoot";
import { Masthead } from "./concept/Masthead";
import { Method } from "./concept/Method";
import { WorkIndex } from "./concept/WorkIndex";
import { portfolioProjects } from "./data/portfolio";
import { imageVariants } from "./lib/responsive-image";
import { CV } from "./pages/CV";

// jsdom has no layout, so these assert the classes and rules that produce it.
// The measured widths are in handoffs/2026-10-13-a11y-and-layout-refinements.md.
const SRC = join(process.cwd(), "src");
const THEME = readFileSync(join(SRC, "styles/theme.css"), "utf8");
const has = (cls: string) => new RegExp(`(^|\\s)${cls.replace(/[[\]().+*/:%,-]/g, "\\$&")}(\\s|$)`);

function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sources(path);
    return /\.(tsx?|css)$/.test(name) && !/\.test\./.test(name) ? [path] : [];
  });
}

function renderRoutes(url: string, routes: RouteObject[]) {
  const router = createMemoryRouter(routes, { initialEntries: [url] });
  render(<RouterProvider router={router} />);
}

beforeEach(() => {
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});
afterEach(() => vi.unstubAllGlobals());

describe("accessibility refinements", () => {
  it("A2: draws one 2px ink focus ring with a 2px offset for keyboard focus only", () => {
    const rule = THEME.match(/(^|\n)\s*:focus-visible\s*\{([^}]*)\}/);
    expect(rule, "a bare :focus-visible rule").not.toBeNull();
    expect(rule![2]).toMatch(/outline:\s*2px solid var\(--foreground\)/);
    expect(rule![2]).toMatch(/outline-offset:\s*2px/);
    expect(THEME).not.toMatch(/(^|\n)\s*:focus\s*\{/);
  });

  it("A3: never sets on-screen text below 11px", () => {
    for (const file of sources(SRC)) {
      const text = readFileSync(file, "utf8");
      expect(text, file).not.toMatch(/(?<!print:)text-\[(?:[0-9]|10)(?:\.\d+)?px\]/);
      expect(text, file).not.toMatch(/font-size:\s*(?:[0-9]|10)(?:\.\d+)?px/);
      expect(text, file).not.toMatch(/fontSize:\s*["']?(?:[0-9]|10)(?:\.\d+)?(?:px)?\b/);
    }
    // The CV's print output keeps its 10px labels.
    const cv = readFileSync(join(SRC, "app/pages/CV.tsx"), "utf8");
    expect(cv.match(/text-\[11px\] uppercase print:text-\[10px\]/g)).toHaveLength(3);
    expect(THEME).toMatch(/@utility label-mono \{[^}]*font-size:\s*11px/);
    expect(THEME).toMatch(/@utility meta-mono \{[^}]*font-size:\s*11px/);
  });
});

describe("label styles (R1)", () => {
  it("defines the label and meta styles once and uses no other mono tracking on the site", () => {
    expect(THEME.match(/@utility label-mono/g)).toHaveLength(1);
    expect(THEME.match(/@utility meta-mono/g)).toHaveLength(1);
    let uses = 0;
    for (const file of sources(SRC)) {
      // The CV is a print document with its own type scale.
      if (file.endsWith("pages/CV.tsx")) continue;
      const text = readFileSync(file, "utf8");
      expect(text, file).not.toMatch(/tracking-\[/);
      expect(text, file).not.toMatch(/font-mono text-\[/);
      uses += (text.match(/(^|[\s"'`])(label|meta)-mono(?=[\s"'`])/g) ?? []).length;
    }
    expect(uses).toBeGreaterThanOrEqual(30);
  });
});

describe("tablet layout", () => {
  it("L1: puts the hero stats in two columns in the lg band and four from xl", () => {
    renderRoutes("/", [{ path: "/", Component: Masthead }]);
    const dl = document.querySelector("#top dl")!;
    // xl:gap-x-4 leaves the widest value 6px of room in its 1280px cell.
    for (const cls of ["grid-cols-2", "sm:grid-cols-4", "lg:grid-cols-2", "xl:grid-cols-4", "xl:gap-x-4"]) {
      expect(dl.className).toMatch(has(cls));
    }
  });

  it("L2: shows the header brand suffix only from lg", () => {
    renderRoutes("/", [{ path: "/", Component: Layout, children: [{ index: true, element: null }] }]);
    const suffix = screen.getByText(/- Creative Technologist/);
    expect(suffix.className).toMatch(has("hidden"));
    expect(suffix.className).toMatch(has("lg:inline"));
    expect(suffix.className).not.toMatch(/(^|\s)(sm|md):inline/);
  });

  it("L3 and R6: keeps What I do in one column until lg and lets the tool line wrap", () => {
    render(<Capabilities />);
    const headings = screen.getAllByRole("heading", { level: 3 });
    const grid = headings[0]!.parentElement!.parentElement!;
    expect(grid.className).toMatch(has("lg:grid-cols-3"));
    expect(grid.className).not.toMatch(/(^|\s)(sm|md):grid-cols-/);
    for (const h3 of headings) {
      expect(h3.className).toMatch(has("lg:min-h-[2.75em]"));
      expect(h3.className).not.toMatch(/(^|\s)min-h-/);
      expect(h3.parentElement!.lastElementChild!.className).not.toMatch(has("whitespace-nowrap"));
    }
  });

  it("L4: spans only an odd last card across both tablet columns", () => {
    renderRoutes("/", [{ path: "/", Component: WorkIndex }]);
    const cards = [...document.querySelectorAll("#work ol > li")];
    expect(cards).toHaveLength(portfolioProjects.length);
    const last = cards[cards.length - 1]!;
    const spanning = cards.filter((li) => has("lg:col-span-1").test(li.className));
    const oddTail = (portfolioProjects.length - 1) % 2 === 1;
    expect(spanning).toEqual(oddTail ? [last] : []);
    if (oddTail) {
      expect(last.className).toMatch(has("sm:col-span-2"));
      const button = last.querySelector("button")!;
      // Side by side in the tablet band, back to a stacked card on desktop.
      for (const cls of ["flex", "flex-col", "sm:grid", "sm:grid-cols-5", "lg:flex"]) {
        expect(button.className, cls).toMatch(has(cls));
      }
      const [image, text] = [...button.children];
      expect(image!.className).toMatch(has("sm:col-span-3"));
      expect(text!.className).toMatch(has("sm:col-span-2"));
    }
    for (const li of cards.slice(1, -1)) {
      expect(li.querySelector("button")!.className).not.toMatch(/(^|\s)sm:grid/);
    }
  });
});

describe("refinements", () => {
  it("R2: gives every section intro the same gap to its content", () => {
    render(<Capabilities />);
    renderRoutes("/", [{ path: "/", Component: WorkIndex }]);
    const intros = [
      screen.getByText(/Different outputs, same approach/),
      screen.getByText(/Every project is shown as a system/),
    ];
    for (const p of intros) expect(p.className).toMatch(has("mb-12"));
  });

  it("R3: sets the education institution lines at the relaxed body line-height", () => {
    render(<Method />);
    for (const name of [/University of Portsmouth/, /Tech Educators/]) {
      expect(screen.getByText(name).className).toMatch(has("leading-relaxed"));
    }
  });

  it("R4: balances h1 and h2 and keeps the place name on one line", () => {
    expect(THEME).toMatch(/h1,\s*h2\s*\{\s*text-wrap:\s*balance;/);
    renderRoutes("/", [{ path: "/", Component: Masthead }]);
    expect(screen.getByText(/Open to roles/).textContent).toContain("remote, UK");
  });

  it("R5: starts the phone link row at the column edge and keeps the contact links on one row", () => {
    renderRoutes("/", [{ path: "/", Component: Masthead }]);
    const row = screen.getByRole("link", { name: /LinkedIn/ }).parentElement!;
    expect(row.className).not.toMatch(/(^|\s)pl-/);
    render(<ContactFoot />);
    const contact = document.getElementById("contact")!;
    const links = ["LinkedIn", "GitHub", "Dribbble"].map(
      (name) => [...contact.querySelectorAll("a")].find((a) => a.textContent?.includes(name))!,
    );
    const parent = links[0]!.parentElement!;
    for (const link of links) expect(link.parentElement).toBe(parent);
    expect(parent.className).not.toMatch(has("flex-wrap"));
    // 24px gaps overflow a 320px phone; 16px fits.
    expect(parent.className).toMatch(has("gap-x-4"));
    expect(parent.className).toMatch(has("sm:gap-x-6"));
    expect(parent.querySelector('a[href="/cv"]')).toBeNull();
  });

  it("R7: sizes the study banner to the card image's own ratio", () => {
    const project = portfolioProjects.find((p) => p.slug === "uncx-rebrand")!;
    const meta = imageVariants(project.image)!;
    expect(meta).toBeDefined();
    renderRoutes("/?study=uncx-rebrand", [{ path: "/", Component: WorkIndex }]);
    const banner = screen.getByTestId("study-banner");
    expect(banner.style.aspectRatio).toBe(`${meta.w} / ${meta.h}`);
    expect(banner.style.getPropertyValue("--banner-ratio")).toBe(String(meta.w / meta.h));
    expect(banner.className).not.toMatch(/aspect-\[/);
    // Never taller than the old banner: 16:10, 5:2 and 3:1 of the column.
    for (const cls of [
      "max-w-[calc(100%*var(--banner-ratio)/1.6)]",
      "sm:max-w-[calc(100%*var(--banner-ratio)/2.5)]",
      "lg:max-w-[calc(100%*var(--banner-ratio)/3)]",
      "mx-auto",
    ]) {
      expect(banner.className, cls).toMatch(has(cls));
    }
  });

  it("R8: sets the CV actions on the CV column, scrolling with it, and keeps them out of print", () => {
    renderRoutes("/cv", [{ path: "/cv", Component: CV }]);
    const nav = screen.getByRole("navigation", { name: "CV actions" });
    const main = document.querySelector(".cv-page main")!;
    // Same width and padding as the column, so the buttons end on its edge.
    for (const cls of ["absolute", "inset-x-0", "mx-auto", "max-w-[780px]", "px-6", "justify-end", "print:hidden"]) {
      expect(nav.className, cls).toMatch(has(cls));
    }
    for (const cls of ["max-w-[780px]", "px-6", "mx-auto"]) expect(main.className, cls).toMatch(has(cls));
    // Fixed controls covered the CV's right-aligned dates when scrolled.
    expect(nav.className).not.toMatch(has("fixed"));
    expect(nav.parentElement!.className).toMatch(has("relative"));
  });
});
