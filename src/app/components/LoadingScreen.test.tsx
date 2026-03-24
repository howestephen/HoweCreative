import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoadingScreen } from "./LoadingScreen";

describe("LoadingScreen accessibility", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Default matchMedia — no reduced motion
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("has a visually-hidden label describing the loading state", () => {
    render(<LoadingScreen onComplete={vi.fn()} />);
    expect(screen.getByText(/loading portfolio/i)).toBeInTheDocument();
  });

  it("has an aria-live polite region for log lines", () => {
    render(<LoadingScreen onComplete={vi.fn()} />);
    const liveRegion = document.querySelector("[aria-live='polite']");
    expect(liveRegion).not.toBeNull();
  });

  it("has a progressbar role with aria-valuenow, aria-valuemin, aria-valuemax", () => {
    render(<LoadingScreen onComplete={vi.fn()} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
    expect(bar).toHaveAttribute("aria-valuenow");
  });

  it("calls onComplete quickly when prefers-reduced-motion is set", () => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === "(prefers-reduced-motion: reduce)",
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    const onComplete = vi.fn();
    render(<LoadingScreen onComplete={onComplete} />);
    vi.advanceTimersByTime(200);
    expect(onComplete).toHaveBeenCalled();
  });
});
