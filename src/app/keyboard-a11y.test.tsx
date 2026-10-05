import { readFileSync } from "node:fs";
import { join } from "node:path";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { createMemoryRouter, RouterProvider, type RouteObject } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Layout } from "./components/Layout";
import { ContactFoot } from "./concept/ContactFoot";
import { WorkIndex } from "./concept/WorkIndex";
import { CV } from "./pages/CV";

// A stand-in for the captcha widget: one button that "solves" it.
vi.mock("@hcaptcha/react-hcaptcha", async () => {
  const React = await import("react");
  const Mock = React.forwardRef(function Mock(
    props: { onVerify: (token: string) => void },
    ref: React.Ref<{ resetCaptcha: () => void }>,
  ) {
    React.useImperativeHandle(ref, () => ({ resetCaptcha: () => {} }));
    return React.createElement(
      "button",
      { type: "button", onClick: () => props.onVerify("token") },
      "Solve captcha",
    );
  });
  return { default: Mock };
});

function renderRoutes(url: string, routes: RouteObject[] = [{ path: "/", Component: WorkIndex }]) {
  const router = createMemoryRouter(routes, { initialEntries: [url] });
  render(<RouterProvider router={router} />);
  return router;
}

afterEach(() => vi.unstubAllGlobals());

describe("keyboard and screen reader fixes (WP-11)", () => {
  it("returns focus to the thumbnail when the image lightbox closes (C-2)", () => {
    renderRoutes("/?study=quiver");
    const thumb = screen.getAllByRole("button", { name: /view larger/i })[0];
    thumb.focus();
    fireEvent.click(thumb);
    const lightbox = screen.getByRole("dialog", { name: "Quiver gallery" });
    fireEvent.click(within(lightbox).getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog", { name: "Quiver gallery" })).not.toBeInTheDocument();
    expect(thumb).toHaveFocus();
  });

  it("returns focus to the thumbnail when Escape closes the lightbox (C-2)", () => {
    renderRoutes("/?study=quiver");
    const thumb = screen.getAllByRole("button", { name: /view larger/i })[0];
    thumb.focus();
    fireEvent.click(thumb);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(thumb).toHaveFocus();
  });

  it("announces a contact error with role=alert (C-3)", async () => {
    render(<ContactFoot />);
    fireEvent.submit(document.querySelector("form")!);
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Please complete the captcha.");
  });

  it("announces contact success with role=status (C-3)", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ json: async () => ({ success: true }) })));
    vi.stubEnv("VITE_EMAIL_ACCESS_KEY", "test-key");
    render(<ContactFoot />);
    fireEvent.click(screen.getByRole("button", { name: "Solve captcha" }));
    fireEvent.submit(document.querySelector("form")!);
    const status = await screen.findByRole("status");
    expect(status).toHaveTextContent("Message sent");
    vi.unstubAllEnvs();
  });

  it("keeps a visible focus outline on form fields (C-8)", () => {
    render(<ContactFoot />);
    for (const field of document.querySelectorAll("input[name]:not([name=website]), textarea")) {
      expect(field.className).not.toMatch(/(^|\s)outline-none(\s|$)/);
      expect(field.className).toMatch(/focus-visible:outline/);
    }
  });

  it("renders no banner landmark inside the study overlay (C-9)", () => {
    renderRoutes("/?study=quiver");
    const dialog = screen.getByRole("dialog", { name: "Quiver" });
    expect(dialog.querySelector("header")).toBeNull();
    expect(within(dialog).queryByRole("banner")).toBeNull();
  });

  it("makes each gallery scroller focusable and labelled (C-9)", () => {
    renderRoutes("/?study=quiver");
    const scrollers = document.querySelectorAll(".gallery-scroll");
    expect(scrollers.length).toBeGreaterThan(0);
    for (const el of scrollers) {
      expect(el).toHaveAttribute("tabindex", "0");
      expect(el.getAttribute("aria-label")).toBeTruthy();
    }
  });

  it("wraps the CV controls in a labelled nav landmark (C-9)", () => {
    renderRoutes("/cv", [{ path: "/cv", Component: CV }]);
    const nav = screen.getByRole("navigation", { name: "CV actions" });
    expect(within(nav).getByRole("button", { name: /Print/ })).toBeInTheDocument();
    expect(within(nav).getByRole("link", { name: /Back to portfolio/ })).toBeInTheDocument();
  });

  it("closes the study on Escape even when a video's controls swallow the event (C-10)", async () => {
    const router = renderRoutes("/?study=quiver");
    const dialog = screen.getByRole("dialog", { name: "Quiver" });
    const video = dialog.querySelector("video")!;
    // Chromium's native controls stop keydown before it reaches the window.
    video.addEventListener("keydown", (e) => e.stopPropagation());
    video.focus();
    fireEvent.keyDown(video, { key: "Escape" });
    await waitFor(() => expect(router.state.location.search).toBe(""));
    expect(screen.queryByRole("dialog", { name: "Quiver" })).not.toBeInTheDocument();
  });

  it("closes the study once, not twice, on a plain Escape (C-10)", () => {
    const router = renderRoutes("/");
    fireEvent.click(screen.getAllByRole("button", { name: /Quiver/ })[0]);
    expect(router.state.location.search).toBe("?study=quiver");
    const spy = vi.spyOn(router, "navigate");
    act(() => {
      fireEvent.keyDown(screen.getByRole("button", { name: "Close" }), { key: "Escape" });
    });
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("puts a skip link to #main-content first in the layout (C-10)", () => {
    renderRoutes("/", [{ path: "/", Component: Layout, children: [{ index: true, element: <p>Home</p> }] }]);
    const first = document.querySelector<HTMLElement>("a[href], button");
    expect(first).toHaveAttribute("href", "#main-content");
    expect(first).toHaveTextContent(/skip to (main )?content/i);
    expect(document.getElementById("main-content")?.tagName).toBe("MAIN");
  });

  it("does not leave outline-none on form fields in the source (C-8)", () => {
    const source = readFileSync(join(__dirname, "concept", "ContactFoot.tsx"), "utf8");
    expect(source).not.toMatch(/\boutline-none\b/);
  });
});
