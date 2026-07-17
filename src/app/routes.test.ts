import { createElement, type ComponentType } from "react";
import { act, render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AppErrorBoundary } from "./components/AppErrorBoundary";
import { createCVRoute } from "./cv-route";

describe("CV lazy route", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  function renderCVRoute(Component: ComponentType) {
    const router = createMemoryRouter(
      [{ path: "/cv", Component, ErrorBoundary: AppErrorBoundary }],
      { initialEntries: ["/cv"] },
    );
    return render(createElement(RouterProvider, { router }));
  }

  it("renders pending UI until the CV chunk resolves", async () => {
    let resolveImport!: (module: { CV: ComponentType }) => void;
    const importCV = vi.fn(
      () =>
        new Promise<{ CV: ComponentType }>((resolve) => {
          resolveImport = resolve;
        }),
    );
    const Route = createCVRoute(importCV);

    renderCVRoute(Route);

    expect(screen.getByRole("status")).toHaveTextContent("Loading CV");

    await act(async () => {
      resolveImport({
        CV: () => createElement("h1", null, "Stephen Howe CV"),
      });
    });

    expect(await screen.findByRole("heading", { name: "Stephen Howe CV" })).toBeInTheDocument();
  });

  it("reaches the route error boundary when the CV chunk fails", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const Route = createCVRoute(() => Promise.reject(new Error("CV chunk failed")));

    renderCVRoute(Route);

    expect(await screen.findByRole("heading", { name: "Interface Error" })).toBeInTheDocument();
    expect(screen.getByText("CV chunk failed")).toBeInTheDocument();
    expect(consoleError).toHaveBeenCalled();
  });
});
