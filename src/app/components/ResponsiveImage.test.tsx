import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ResponsiveImage } from "./ResponsiveImage";

const WIDE = "/case-studies/uncx-app-concepts/tg-bot-flow.webp"; // 4266 x 1598

function layout(width: number, height: number, fit = "fill") {
  vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(width);
  vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(height);
  const real = window.getComputedStyle;
  vi.spyOn(window, "getComputedStyle").mockImplementation(
    (el) => ({ ...real(el), objectFit: fit }) as CSSStyleDeclaration,
  );
}

describe("ResponsiveImage", () => {
  beforeEach(() => vi.restoreAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it("sizes the image to its measured box", () => {
    layout(300, 113);
    const { getByRole } = render(<ResponsiveImage src={WIDE} alt="Flow" />);
    const img = getByRole("img");
    expect(img.getAttribute("srcset")).toContain("4266w");
    expect(img.getAttribute("sizes")).toBe("300px");
  });

  it("allows for cropping when the image covers its box", () => {
    layout(128, 128, "cover");
    const { getByRole } = render(<ResponsiveImage src={WIDE} alt="Flow" />);
    // 128px tall at 4266:1598 is 342px wide once cropped to the square.
    expect(getByRole("img").getAttribute("sizes")).toBe("342px");
  });

  it("asks for a sharper copy while zoomed", () => {
    layout(300, 113);
    const { getByRole, rerender } = render(<ResponsiveImage src={WIDE} alt="Flow" zoom={1} />);
    rerender(<ResponsiveImage src={WIDE} alt="Flow" zoom={4} />);
    expect(getByRole("img").getAttribute("sizes")).toBe("1200px");
  });

  it("never shrinks the request for the same image", () => {
    layout(300, 113);
    const { getByRole, rerender } = render(<ResponsiveImage src={WIDE} alt="Flow" zoom={4} />);
    rerender(<ResponsiveImage src={WIDE} alt="Flow" zoom={1} />);
    expect(getByRole("img").getAttribute("sizes")).toBe("1200px");
  });

  it("starts small, not at full viewport width, when mounted hidden", () => {
    layout(0, 0);
    const { getByRole } = render(<ResponsiveImage src={WIDE} alt="Flow" />);
    expect(getByRole("img").getAttribute("sizes")).toBe("240px");
  });

  it("falls back to a plain image without variants", () => {
    layout(300, 100);
    const { getByRole } = render(<ResponsiveImage src="/case-studies/uncx-rebrand/uncx-logotype.svg" alt="Logo" />);
    const img = getByRole("img");
    expect(img.hasAttribute("srcset")).toBe(false);
    expect(img.getAttribute("src")).toBe("/case-studies/uncx-rebrand/uncx-logotype.svg");
  });
});
