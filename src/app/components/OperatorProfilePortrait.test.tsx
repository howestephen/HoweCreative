import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../data/portfolio", () => ({
  operatorProfileContent: {
    portraitFooterLeft: "Operator Profile",
    portraitFooterRight: "Photo Reference",
  },
}));

import { OperatorProfilePortrait } from "./OperatorProfilePortrait";

describe("OperatorProfilePortrait", () => {
  it("renders an img element with alt 'Stephen Howe'", () => {
    render(<OperatorProfilePortrait />);
    const img = screen.getByAltText("Stephen Howe");
    expect(img).toBeInTheDocument();
    expect(img.tagName).toBe("IMG");
  });

  it("sets img src to /profile-photo.webp", () => {
    render(<OperatorProfilePortrait />);
    const img = screen.getByAltText("Stephen Howe") as HTMLImageElement;
    expect(img.src).toContain("/profile-photo.webp");
  });

  it("renders footer labels from operatorProfileContent", () => {
    render(<OperatorProfilePortrait />);
    expect(screen.getByText("Operator Profile")).toBeInTheDocument();
    expect(screen.getByText("Photo Reference")).toBeInTheDocument();
  });

  it("does NOT render a canvas element", () => {
    const { container } = render(<OperatorProfilePortrait />);
    const canvas = container.querySelector("canvas");
    expect(canvas).toBeNull();
  });
});
