import { existsSync } from "node:fs";
import { join } from "node:path";
import { cleanup, render } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";

import { portfolioProjects } from "./data/portfolio";
import { WorkIndex } from "./concept/WorkIndex";

describe("video tracks (WP-13)", () => {
  it("renders no track without a src that exists under public/", () => {
    let videos = 0;
    for (const project of portfolioProjects) {
      const router = createMemoryRouter([{ path: "/", Component: WorkIndex }], {
        initialEntries: [`/?study=${project.slug}`],
      });
      render(<RouterProvider router={router} />);
      videos += document.querySelectorAll("video").length;
      for (const track of document.querySelectorAll("track")) {
        const src = track.getAttribute("src");
        expect(src, `empty track in ${project.slug}`).toBeTruthy();
        expect(existsSync(join(process.cwd(), "public", src!)), src!).toBe(true);
      }
      cleanup();
    }
    expect(videos).toBeGreaterThan(0);
  });
});
