import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { FolioSceneProps } from "./FolioScene";
import { PortfolioExperience } from "./PortfolioExperience";
import { disciplines } from "./disciplines";

const preferences = vi.hoisted(() => ({ reducedMotion: false }));
const renderer = vi.hoisted(() => ({ render: vi.fn() }));

vi.mock("motion/react", () => ({
  useReducedMotion: () => preferences.reducedMotion,
}));

vi.mock("./FolioScene", async () => {
  const { useState } = await import("react");
  return {
    default: function TestScene(props: FolioSceneProps) {
      const [crashed, setCrashed] = useState(false);
      renderer.render(props);
      if (crashed) throw new Error("Simulated WebGL failure");
      return (
        <div data-testid="test-scene">
          <button
            onClick={() => props.onReady?.(props.items[props.activeIndex].id)}
          >
            Load selected artwork
          </button>
          <button onClick={() => props.onReady?.("film")}>
            Report previous artwork ready
          </button>
          <button onClick={() => props.onUnavailable?.()}>
            Renderer unavailable
          </button>
          <button onClick={() => setCrashed(true)}>Crash renderer</button>
        </div>
      );
    },
  };
});

function renderExperience() {
  const result = render(
    <MemoryRouter>
      <PortfolioExperience />
    </MemoryRouter>,
  );
  const stage = result.container.querySelector(".folio-stage")!;
  const poster = stage.querySelector(".folio-poster img")!;
  return { ...result, stage, poster };
}

describe("portfolio presentation fallback and navigation", () => {
  beforeEach(() => {
    preferences.reducedMotion = false;
    renderer.render.mockClear();
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        observe() {}
        disconnect() {}
      },
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it.each(["Renderer unavailable", "Crash renderer"])(
    "restores the selected HTML poster after an already ready scene fails through %s",
    async (failureAction) => {
      // React reports the deliberately thrown renderer error before the boundary handles it.
      if (failureAction === "Crash renderer")
        vi.spyOn(console, "error").mockImplementation(() => {});
      const { stage, poster } = renderExperience();
      await screen.findByTestId("test-scene");
      fireEvent.click(screen.getByRole("button", { name: /Product & code/ }));
      fireEvent.click(
        screen.getByRole("button", { name: "Load selected artwork" }),
      );
      expect(stage).toHaveClass("scene-ready");

      fireEvent.click(screen.getByRole("button", { name: failureAction }));
      expect(stage).toHaveAttribute("data-presentation", "fallback");
      expect(stage).not.toHaveClass("scene-ready");
      expect(poster).toHaveAttribute(
        "src",
        disciplines.find((item) => item.id === "product")!.image,
      );
      expect(screen.queryByTestId("test-scene")).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Pause motion" }),
      ).not.toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Badger Club" })).toHaveAttribute(
        "href",
        "/work/badger-club",
      );

      fireEvent.click(screen.getByRole("button", { name: /Creative systems/ }));
      expect(poster).toHaveAttribute(
        "src",
        disciplines.find((item) => item.id === "systems")!.image,
      );
      expect(
        screen.getByRole("link", { name: "Solana Diary" }),
      ).toHaveAttribute("href", "/work/solana-diary");
    },
  );

  it("keeps the selected poster until that artwork is ready, ignoring a previous image's late callback", async () => {
    const { stage } = renderExperience();
    await screen.findByTestId("test-scene");
    expect(stage).not.toHaveClass("scene-ready");
    fireEvent.click(
      screen.getByRole("button", { name: "Load selected artwork" }),
    );
    expect(stage).toHaveClass("scene-ready");

    fireEvent.click(screen.getByRole("button", { name: /Product & code/ }));
    expect(stage).not.toHaveClass("scene-ready");
    fireEvent.click(
      screen.getByRole("button", { name: "Report previous artwork ready" }),
    );
    expect(stage).not.toHaveClass("scene-ready");
    fireEvent.click(
      screen.getByRole("button", { name: "Load selected artwork" }),
    );
    expect(stage).toHaveClass("scene-ready");
  });

  it("keeps discipline navigation and project links usable in the manually selected still view", async () => {
    const { stage, poster } = renderExperience();
    await screen.findByTestId("test-scene");
    fireEvent.click(
      screen.getByRole("button", { name: "Load selected artwork" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Still view" }));
    expect(stage).toHaveAttribute("data-presentation", "still");
    expect(stage).not.toHaveClass("scene-ready");
    expect(screen.queryByTestId("test-scene")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Next discipline" }));
    expect(screen.getByRole("button", { name: /3D & motion/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(poster).toHaveAttribute(
      "src",
      disciplines.find((item) => item.id === "motion")!.image,
    );
    fireEvent.click(screen.getByRole("button", { name: /Product & code/ }));
    expect(screen.getByRole("link", { name: "Badger Club" })).toHaveAttribute(
      "href",
      "/work/badger-club",
    );
    expect(stage).toHaveAttribute("data-presentation", "still");

    fireEvent.click(screen.getByRole("button", { name: "3D view" }));
    await screen.findByTestId("test-scene");
    expect(stage).toHaveAttribute("data-presentation", "interactive");
    expect(stage).not.toHaveClass("scene-ready");
  });

  it("does not mount the renderer when reduced motion is requested and still navigates the work", async () => {
    preferences.reducedMotion = true;
    const { stage, poster } = renderExperience();
    expect(stage).toHaveAttribute("data-presentation", "reduced-motion");
    expect(renderer.render).not.toHaveBeenCalled();
    expect(
      screen.queryByRole("button", { name: "Still view" }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Brand & experience/ }));
    expect(poster).toHaveAttribute(
      "src",
      disciplines.find((item) => item.id === "brand")!.image,
    );
    expect(
      screen.getByRole("link", { name: "UNCX Brand Evolution" }),
    ).toHaveAttribute("href", "/work/uncx-rebrand");
    await waitFor(() => expect(stage).not.toHaveClass("scene-ready"));
    expect(renderer.render).not.toHaveBeenCalled();
  });
});
