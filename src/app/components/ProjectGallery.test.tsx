import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProjectGallery } from "./ProjectGallery";

describe("project gallery navigation", () => {
  beforeEach(() => {
    Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
      configurable: true,
      value: vi.fn(function (this: HTMLDialogElement) {
        this.setAttribute("open", "");
      }),
    });
    Object.defineProperty(HTMLDialogElement.prototype, "close", {
      configurable: true,
      value: vi.fn(function (this: HTMLDialogElement) {
        this.removeAttribute("open");
      }),
    });
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });
  it("zooms the open image with a pinch instead of zooming the page", () => {
    render(
      <ProjectGallery title="Zoom" media={[{ type: "image", src: "/one.webp", alt: "One" }]} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "View larger: One" }));
    const dialog = screen.getByRole("dialog");
    expect(dialog.style.touchAction).toBe("none");
    const image = dialog.querySelector(".dialog-image img") as HTMLImageElement;
    const touch = (type: string, pointerId: number, clientX: number) => {
      const event = new Event(type, { bubbles: true });
      Object.assign(event, { pointerId, clientX, clientY: 300, pointerType: "touch" });
      fireEvent(image, event);
    };
    touch("pointerdown", 1, 100);
    touch("pointerdown", 2, 200);
    touch("pointermove", 2, 300);
    expect(image.style.transform).toContain("scale(2)");
    touch("pointermove", 2, 110);
    expect(image.style.transform).toContain("scale(1)");
  });

  it("uses image indexes even when videos precede images, wraps keyboard navigation and restores focus", () => {
    render(
      <ProjectGallery
        title="Mixed media"
        media={[
          { type: "video", src: "/clip.mp4", alt: "Example clip" },
          { type: "image", src: "/first.webp", alt: "First design" },
          { type: "image", src: "/second.webp", alt: "Second design" },
        ]}
      />,
    );
    const trigger = screen.getByRole("button", {
      name: "View larger: Second design",
    });
    fireEvent.click(trigger);
    const dialog = screen.getByRole("dialog");
    expect(dialog.querySelector(".dialog-image img")).toHaveAttribute(
      "src",
      "/second.webp",
    );
    expect(document.body.style.overflow).toBe("hidden");
    fireEvent.keyDown(dialog, { key: "ArrowRight" });
    expect(dialog.querySelector(".dialog-image img")).toHaveAttribute(
      "src",
      "/first.webp",
    );
    fireEvent.keyDown(dialog, { key: "ArrowLeft" });
    expect(dialog.querySelector(".dialog-image img")).toHaveAttribute(
      "src",
      "/second.webp",
    );
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe("");
    expect(trigger).toHaveFocus();
  });
  it("returns focus to the thumbnail after the dialog has closed", () => {
    // Chromium's dialog close() runs its own focus steps, which drop focus to
    // the body when the trigger was focused before close() ran.
    Object.defineProperty(HTMLDialogElement.prototype, "close", {
      configurable: true,
      value: vi.fn(function (this: HTMLDialogElement) {
        this.removeAttribute("open");
        (document.activeElement as HTMLElement | null)?.blur();
      }),
    });
    render(<ProjectGallery title="Focus" media={[{ type: "image", src: "/one.webp", alt: "One" }]} />);
    const trigger = screen.getByRole("button", { name: "View larger: One" });
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(trigger).toHaveFocus();
  });

  it("does not repeat the visible caption in the thumbnail alt", () => {
    render(<ProjectGallery title="Alt" media={[{ type: "image", src: "/one.webp", alt: "One" }]} />);
    const trigger = screen.getByRole("button", { name: "View larger: One" });
    expect(trigger.querySelector("img")).toHaveAttribute("alt", "");
  });

  it("closes when the browser emits the Escape cancel event", () => {
    render(
      <ProjectGallery
        title="Single"
        media={[{ type: "image", src: "/one.webp", alt: "One" }]}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "View larger: One" }));
    fireEvent(
      screen.getByRole("dialog"),
      new Event("cancel", { bubbles: false }),
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe("");
  });
  it.each(["Previous project", "Original project"])(
    "closes an open image when its collection changes to %s and does not reopen it on return",
    (nextTitle) => {
      const original = (
        <ProjectGallery
          title="Original project"
          media={[
            { type: "image", src: "/first.webp", alt: "First design" },
            { type: "image", src: "/second.webp", alt: "Second design" },
          ]}
        />
      );
      const { rerender } = render(original);
      fireEvent.click(
        screen.getByRole("button", { name: "View larger: Second design" }),
      );
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(document.body.style.overflow).toBe("hidden");

      // Browser Back can replace a project even while its modal is open.
      rerender(
        <ProjectGallery
          title={nextTitle}
          media={[{ type: "image", src: "/other.webp", alt: "Other design" }]}
        />,
      );
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(document.body.style.overflow).toBe("");
      expect(
        screen.getByRole("button", { name: "View larger: Other design" }),
      ).toBeVisible();

      rerender(original);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      fireEvent.click(
        screen.getByRole("button", { name: "View larger: First design" }),
      );
      expect(
        screen.getByRole("dialog").querySelector(".dialog-image img"),
      ).toHaveAttribute("src", "/first.webp");
    },
  );
  it("releases the page scroll lock when the gallery unmounts with an image open", () => {
    const { unmount } = render(
      <ProjectGallery
        title="Leaving the project"
        media={[{ type: "image", src: "/one.webp", alt: "One" }]}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "View larger: One" }));
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).toBe("");
  });
});
