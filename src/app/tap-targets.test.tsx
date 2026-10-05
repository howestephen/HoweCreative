import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { createMemoryRouter, RouterProvider, type RouteObject } from "react-router";
import { describe, expect, it } from "vitest";

import { Layout } from "./components/Layout";
import { ContactFoot } from "./concept/ContactFoot";
import { Masthead } from "./concept/Masthead";
import { WorkIndex } from "./concept/WorkIndex";
import { CV } from "./pages/CV";

// jsdom has no layout, so the 44px minimum is asserted through the classes that give it.
const MIN_44 = /(^|\s)(min-h-11|h-11)(\s|$)/;

function renderRoutes(url: string, routes: RouteObject[] = [{ path: "/", Component: WorkIndex }]) {
  const router = createMemoryRouter(routes, { initialEntries: [url] });
  render(<RouterProvider router={router} />);
}

describe("tap targets on phones (WP-4)", () => {
  it("gives every header link and button a 44px minimum", () => {
    renderRoutes("/", [{ path: "/", Component: Layout, children: [{ index: true, element: null }] }]);
    const header = screen.getByRole("banner");
    const targets = [...header.querySelectorAll("a, button")];
    expect(targets.length).toBeGreaterThanOrEqual(3);
    for (const el of targets) expect(el.className, el.textContent ?? "").toMatch(MIN_44);
  });

  it("gives the contact block links and the footer link a 44px minimum", () => {
    render(<ContactFoot />);
    for (const name of ["View CV", /LinkedIn/, /GitHub/, /Dribbble/]) {
      expect(screen.getByRole("link", { name }).className).toMatch(MIN_44);
    }
    const footer = screen.getByRole("contentinfo");
    for (const link of within(footer).getAllByRole("link")) expect(link.className).toMatch(MIN_44);
  });

  it("gives the gallery strip buttons padding of p-2.5", () => {
    renderRoutes("/?study=quiver");
    const buttons = screen.getAllByRole("button", { name: /^Scroll .* (left|right)$/ });
    expect(buttons.length).toBeGreaterThan(0);
    for (const b of buttons) expect(b.className).toMatch(/(^|\s)p-2\.5(\s|$)/);
  });

  it("makes the lightbox arrows 44px square", () => {
    renderRoutes("/?study=quiver");
    fireEvent.click(screen.getAllByRole("button", { name: /view larger/i })[0]);
    const lightbox = screen.getByRole("dialog", { name: "Quiver gallery" });
    for (const name of ["Previous image", "Next image"]) {
      const arrow = within(lightbox).getByRole("button", { name });
      expect(arrow.className).toMatch(/(^|\s)h-11(\s|$)/);
      expect(arrow.className).toMatch(/(^|\s)w-11(\s|$)/);
    }
  });

  it("does not set CV labels at 8px", () => {
    renderRoutes("/cv", [{ path: "/cv", Component: CV }]);
    const label = screen.getAllByText("LinkedIn")[0];
    expect(label.className).not.toMatch(/text-\[8px\]/);
    expect(label.className).toMatch(/text-\[10px\]/);
    expect(label.className).toMatch(/text-neutral-500/);
  });

  it("keeps the open-to-roles dot still under reduced motion", () => {
    render(<Masthead />);
    const dot = screen.getByText(/Open to roles/).querySelector("span")!;
    expect(dot.className).toMatch(/motion-safe:animate-pulse/);
    expect(dot.className).not.toMatch(/(^|\s)animate-pulse/);
  });

  it("sets concept eyebrows at 11px on phones and 10px from sm up", () => {
    const dir = join(__dirname, "concept");
    for (const file of readdirSync(dir).filter((f) => f.endsWith(".tsx") && !f.includes(".test."))) {
      const source = readFileSync(join(dir, file), "utf8");
      const bare = source.match(/(?<![\w:-])text-\[10px\]/g) ?? [];
      expect(bare, `${file} has unprefixed text-[10px]`).toHaveLength(0);
    }
  });
});
