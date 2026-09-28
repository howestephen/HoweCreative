import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";

import { portfolioProjects } from "../data/portfolio";
import { WorkIndex } from "./WorkIndex";

function renderAt(url: string) {
  const router = createMemoryRouter([{ path: "/", Component: WorkIndex }], {
    initialEntries: [url],
  });
  render(<RouterProvider router={router} />);
  return router;
}

function cards() {
  return within(screen.getByRole("list")).getAllByRole("button");
}

describe("WorkIndex", () => {
  it("shows every study as a card, with Quiver first", () => {
    renderAt("/");
    expect(cards()).toHaveLength(portfolioProjects.length);
    expect(cards()[0]).toHaveTextContent("Quiver");
    // Quiver is the featured, full-width card and the only one offering the film.
    expect(cards()[0].closest("li")).toHaveClass("lg:col-span-3");
    expect(screen.getAllByText("Watch the film")).toHaveLength(1);
    expect(cards()[0]).toHaveTextContent("Watch the film");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens a study in a dialog and records it in the URL", () => {
    const router = renderAt("/");
    fireEvent.click(cards()[0]);

    const dialog = screen.getByRole("dialog", { name: "Quiver" });
    expect(router.state.location.search).toBe("?study=quiver");
    expect(document.body.style.overflow).toBe("hidden");
    expect(document.documentElement.style.overflow).toBe("hidden");
    expect(within(dialog).getByRole("button", { name: "Close" })).toHaveFocus();
  });

  it("features the Quiver advanced film at the top of its study", () => {
    renderAt("/?study=quiver");
    const dialog = screen.getByRole("dialog", { name: "Quiver" });
    const featured = dialog.querySelector("video.aspect-video");
    expect(featured).toHaveAttribute("src", "/case-studies/quiver/advanced.mp4");
    // Featured once, not repeated in the strip: the other three finals plus
    // three process clips.
    expect(dialog.querySelectorAll('video[src$="/advanced.mp4"]')).toHaveLength(1);
    expect(dialog.querySelectorAll("video")).toHaveLength(7);
  });

  it("does not feature a video for studies that lead with an image", () => {
    renderAt("/?study=solana-diary");
    const dialog = screen.getByRole("dialog");
    expect(dialog.querySelector("video.aspect-video")).toBeNull();
  });

  it("closes on Escape, steps back in history and returns focus to the card", async () => {
    const router = renderAt("/");
    fireEvent.click(cards()[2]);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await act(async () => {
      fireEvent.keyDown(window, { key: "Escape" });
    });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(router.state.location.search).toBe("");
    expect(router.state.historyAction).toBe("POP");
    expect(document.body.style.overflow).toBe("");
    expect(document.documentElement.style.overflow).toBe("");
    expect(cards()[2]).toHaveFocus();
  });

  it("closes a shared link in place instead of leaving the page", async () => {
    const router = renderAt("/?study=quiver");
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Close" }));
    });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/");
    expect(router.state.location.search).toBe("");
    expect(router.state.historyAction).toBe("REPLACE");
  });

  it("keeps the study open when Escape closes the image lightbox above it", () => {
    renderAt("/?study=quiver");
    fireEvent.click(screen.getAllByRole("button", { name: /view larger/i })[0]);
    expect(screen.getByRole("dialog", { name: "Quiver gallery" })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });

    expect(screen.queryByRole("dialog", { name: "Quiver gallery" })).not.toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "Quiver" })).toBeInTheDocument();
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("keeps Tab focus inside the lightbox while it covers the study", () => {
    renderAt("/?study=quiver");
    fireEvent.click(screen.getAllByRole("button", { name: /view larger/i })[0]);
    const lightbox = screen.getByRole("dialog", { name: "Quiver gallery" });
    // Park focus on a control of the study underneath, as native Tab could.
    within(screen.getByRole("dialog", { name: "Quiver" }))
      .getByRole("button", { name: "Close" })
      .focus();

    fireEvent.keyDown(window, { key: "Tab" });
    expect(lightbox.contains(document.activeElement)).toBe(true);
  });

  it("gives each card a short accessible name with the teaser as its description", () => {
    renderAt("/");
    expect(cards()[0]).toHaveAccessibleName("Quiver, Creative Direction, 2026");
    expect(cards()[0]).toHaveAccessibleDescription(/Four launch films/);
  });

  it("shows every written section of every study, in order", () => {
    for (const project of portfolioProjects) {
      const { unmount } = render(
        <RouterProvider
          router={createMemoryRouter([{ path: "/", Component: WorkIndex }], {
            initialEntries: [`/?study=${project.slug}`],
          })}
        />,
      );
      const text = screen.getByRole("dialog").textContent ?? "";
      let from = 0;
      for (const section of project.overlaySections) {
        const at = text.indexOf(section.title, from);
        expect(at, `${project.slug}: ${section.title}`).toBeGreaterThanOrEqual(from);
        from = at + section.title.length;
      }
      unmount();
    }
  });

  it("renders a section written as '- ' lines as a list", () => {
    const project = portfolioProjects.find((p) => p.overlaySections.length > 0)!;
    const original = project.overlaySections;
    project.overlaySections = [{ title: "Constraints", body: "- First limit\n- Second limit" }];
    try {
      renderAt(`/?study=${project.slug}`);
      const items = within(screen.getByRole("dialog")).getAllByRole("listitem");
      expect(items.map((item) => item.textContent)).toEqual(
        expect.arrayContaining(["First limit", "Second limit"]),
      );
    } finally {
      project.overlaySections = original;
    }
  });

  it("ignores an unknown study slug", () => {
    renderAt("/?study=not-a-study");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(cards()).toHaveLength(portfolioProjects.length);
  });

  it("wraps Tab focus inside the open study", () => {
    renderAt("/?study=solana-diary");
    const dialog = screen.getByRole("dialog");
    const close = within(dialog).getByRole("button", { name: "Close" });
    close.focus();

    fireEvent.keyDown(window, { key: "Tab", shiftKey: true });
    expect(dialog.contains(document.activeElement)).toBe(true);
    expect(document.activeElement).not.toBe(close);
  });
});

describe("case study copy", () => {
  it("contains no em or en dashes", () => {
    const text = JSON.stringify(portfolioProjects);
    const dashes = [0x2013, 0x2014].map((code) => String.fromCharCode(code));
    for (const dash of dashes) expect(text).not.toContain(dash);
  });
});
