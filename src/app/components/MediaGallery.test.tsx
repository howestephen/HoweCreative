import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MediaGallery } from "./MediaGallery";

import type { ProjectMediaItem } from "../data/portfolio";

// Mock createPortal so the Lightbox doesn't break in jsdom
vi.mock("react-dom", async () => {
  const actual = await vi.importActual<typeof import("react-dom")>("react-dom");
  return { ...actual, createPortal: (node: React.ReactNode) => node };
});

const singleImage: ProjectMediaItem[] = [
  { type: "image", src: "/case-studies/example/cover.png", alt: "Cover image" },
];

const multipleItems: ProjectMediaItem[] = [
  { type: "image", src: "/case-studies/example/cover.png", alt: "Cover image" },
  { type: "image", src: "/case-studies/example/detail.png", alt: "Detail view" },
  { type: "video", src: "/case-studies/example/demo.mp4", poster: "/poster.png" },
];

describe("MediaGallery", () => {
  it("renders nothing for an empty items array", () => {
    const { container } = render(<MediaGallery items={[]} gradient="from-red-500 to-orange-500" />);
    expect(container.innerHTML).toBe("");
  });

  it("renders a 16:9 aspect ratio viewer", () => {
    const { container } = render(
      <MediaGallery items={singleImage} gradient="from-red-500 to-orange-500" />,
    );
    const viewer = container.querySelector("[style*='aspect-ratio']") as HTMLElement;
    expect(viewer).not.toBeNull();
    expect(viewer.style.aspectRatio).toBe("16 / 9");
  });

  it("renders a thumbnail strip when multiple items are provided", () => {
    render(<MediaGallery items={multipleItems} gradient="from-red-500 to-orange-500" />);
    // Each thumbnail is a button with an aria-label
    const thumbnailButtons = screen.getAllByRole("button", { name: /cover image|detail view|video/i });
    expect(thumbnailButtons.length).toBeGreaterThanOrEqual(multipleItems.length);
  });

  it("does not render a thumbnail strip for a single item", () => {
    render(<MediaGallery items={singleImage} gradient="from-red-500 to-orange-500" />);
    // With a single item there should be no thumbnail buttons
    const buttons = screen.queryAllByRole("button");
    expect(buttons).toHaveLength(0);
  });

  it("renders an image with object-contain class", () => {
    const { container } = render(
      <MediaGallery items={singleImage} gradient="from-red-500 to-orange-500" />,
    );
    const img = container.querySelector("img") as HTMLImageElement;
    expect(img).not.toBeNull();
    expect(img.className).toContain("object-contain");
  });
});
