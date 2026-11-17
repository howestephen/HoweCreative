import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it, vi } from "vitest";

import earlierWork from "../data/earlier-work.json";
import { imageVariants, variantUrl } from "../lib/responsive-image";
import { portfolioProjects } from "../data/portfolio";
import { WorkIndex } from "../concept/WorkIndex";
import { Archive } from "./Archive";

function renderAt(url: string) {
  const router = createMemoryRouter(
    [
      { path: "/", Component: WorkIndex },
      { path: "/archive", Component: Archive },
    ],
    { initialEntries: [url] },
  );
  render(<RouterProvider router={router} />);
  return router;
}

describe("Archive", () => {
  it("lists every current study and every earlier project", () => {
    renderAt("/archive");
    for (const project of portfolioProjects) expect(screen.getByRole("heading", { name: project.title })).toBeInTheDocument();
    for (const entry of earlierWork) expect(screen.getByRole("heading", { name: entry.title })).toBeInTheDocument();
  });

  it("links each study to its full case study on the home page", () => {
    const router = renderAt("/archive");
    const links = screen.getAllByRole("link", { name: /read the full case study/i });
    expect(links).toHaveLength(portfolioProjects.length);
    fireEvent.click(links[0]);
    expect(router.state.location.pathname).toBe("/");
    expect(router.state.location.search).toBe(`?study=${portfolioProjects[0].slug}`);
  });

  it("opens the clicked earlier-work image in the viewer", () => {
    renderAt("/archive");
    const entry = earlierWork.find((e) => e.media.some((m) => m.type === "image"))!;
    const image = entry.media.filter((m) => m.type === "image")[1] ?? entry.media.find((m) => m.type === "image")!;
    fireEvent.click(screen.getAllByRole("button", { name: `View larger: ${image.alt}` })[0]);
    const viewer = screen.getByRole("dialog", { name: `${entry.title} gallery` });
    expect(within(viewer).getByRole("img", { name: image.alt })).toBeInTheDocument();
  });

  it("returns focus to the thumbnail when the viewer closes", () => {
    renderAt("/archive");
    const entry = earlierWork.find((e) => e.media.some((m) => m.type === "image"))!;
    const image = entry.media.find((m) => m.type === "image")!;
    const thumb = screen.getAllByRole("button", { name: `View larger: ${image.alt}` })[0];
    thumb.focus();
    fireEvent.click(thumb);
    expect(document.documentElement.style.overflow).toBe("hidden");
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.activeElement).toBe(thumb);
    expect(document.documentElement.style.overflow).toBe("");
  });

  it("closes a study opened from the archive back to the archive", () => {
    const router = renderAt("/archive");
    fireEvent.click(screen.getAllByRole("link", { name: /read the full case study/i })[0]);
    const study = screen.getByRole("dialog", { name: portfolioProjects[0].title });
    fireEvent.click(within(study).getAllByRole("button", { name: /^close$/i })[0]);
    return new Promise<void>((done) => setTimeout(() => {
      expect(router.state.location.pathname).toBe("/archive");
      done();
    }, 0));
  });

  it("is reached from a Full archive link under the selected work", () => {
    const router = renderAt("/");
    fireEvent.click(screen.getByRole("link", { name: /full archive/i }));
    expect(router.state.location.pathname).toBe("/archive");
  });

  it("has every earlier-work image and its retina sizes on disk", () => {
    for (const entry of earlierWork)
      for (const media of entry.media) {
        expect(existsSync(resolve("public", media.src.slice(1))), media.src).toBe(true);
        if (media.type !== "image") {
          if ("poster" in media && media.poster) expect(existsSync(resolve("public", media.poster.slice(1))), media.poster).toBe(true);
          continue;
        }
        for (const width of imageVariants(media.src)?.v ?? [])
          expect(existsSync(resolve("public", variantUrl(media.src, width).slice(1))), media.src).toBe(true);
        expect(imageVariants(media.src), media.src).toBeTruthy();
      }
  });

  it("keeps the scroll position when Back returns to the archive", async () => {
    const router = renderAt("/archive");
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    try {
      await act(async () => {
        await router.navigate("/?study=quiver");
      });
      await act(async () => {
        await router.navigate(-1);
      });
      expect(router.state.location.pathname).toBe("/archive");
      expect(scrollTo).not.toHaveBeenCalled();
    } finally {
      scrollTo.mockRestore();
    }
  });
});
