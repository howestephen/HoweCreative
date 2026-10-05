import { createElement } from "react";
import { act, render } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Layout } from "./Layout";

describe("Layout scroll", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("restores the archive position on Back instead of jumping to the top", async () => {
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
    const router = createMemoryRouter(
      [
        {
          element: createElement(Layout),
          children: [
            { path: "/archive", element: createElement("p", null, "archive") },
            { path: "/work/:slug", element: createElement("p", null, "study") },
          ],
        },
      ],
      { initialEntries: ["/archive"] },
    );
    render(createElement(RouterProvider, { router }));

    Object.defineProperty(window, "scrollY", { configurable: true, value: 1500 });
    await act(() => router.navigate("/work/quiver"));
    scrollTo.mockClear();
    await act(() => router.navigate(-1));

    const toTop = scrollTo.mock.calls.filter((call) => {
      const [first, second] = call as unknown[];
      return (typeof first === "object" && (first as ScrollToOptions)?.top === 0) || second === 0;
    });
    expect(toTop).toHaveLength(0);
    expect(scrollTo).toHaveBeenCalledWith(0, 1500);
  });
});
