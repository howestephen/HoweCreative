import { existsSync, readFileSync } from "node:fs";
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

  // The narrated videos, found by transcribing every published video with
  // an audio stream on 29 October 2026; the rest carry music only.
  const NARRATED = [
    "uncx-academy/blockchains-explained-ethereum",
    "uncx-academy/chain-spotlight-sei",
    "uncx-academy/flash-loans-defi",
    "uncx-academy/impermanent-loss",
    "uncx-academy/promo-video",
    "uncx-academy/slippage-in-defi",
    "uncx-academy/tutorial-lp-locking",
    "uncx-video-system/hyperswap-integration",
    "uncx-video-system/meteora-launch",
    "uncx-video-system/token-minter-launch",
    "uncx-video-system/vesting-app-release",
  ].map((name) => `/case-studies/${name}`);

  it("gives every narrated video a captions file and no other video one", () => {
    const captioned = portfolioProjects
      .flatMap((p) => p.media ?? [])
      .filter((m) => m.captions)
      .map((m) => {
        expect(m.type, m.src).toBe("video");
        expect(m.captions, m.src).toBe(m.src.replace(/\.mp4$/, ".vtt"));
        return m.src.replace(/\.mp4$/, "");
      });
    expect(captioned.sort()).toEqual([...NARRATED].sort());
  });

  it("keeps every captions file valid WebVTT with plain hyphens", () => {
    for (const name of NARRATED) {
      const text = readFileSync(join(process.cwd(), "public", `${name}.vtt`), "utf8");
      expect(text.startsWith("WEBVTT"), name).toBe(true);
      expect(text, name).toMatch(/\d{2}:\d{2}:\d{2}\.\d{3} --> \d{2}:\d{2}:\d{2}\.\d{3}/);
      expect(text, name).not.toMatch(/[\u2013\u2014]/);
    }
  });

  it("renders the captions as the default English track of each captioned video", () => {
    let tracks = 0;
    for (const project of portfolioProjects) {
      const router = createMemoryRouter([{ path: "/", Component: WorkIndex }], {
        initialEntries: [`/?study=${project.slug}`],
      });
      render(<RouterProvider router={router} />);
      for (const track of document.querySelectorAll("video track")) {
        tracks += 1;
        expect(track.getAttribute("kind")).toBe("captions");
        expect(track.getAttribute("srclang")).toBe("en");
        expect(track.hasAttribute("default")).toBe(true);
      }
      cleanup();
    }
    expect(tracks).toBe(NARRATED.length);
  });
});
