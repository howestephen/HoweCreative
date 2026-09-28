import { afterEach, describe, expect, it, vi } from "vitest";

describe("base path", () => {
  afterEach(() => {
    window.history.pushState({}, "", "/");
    vi.resetModules();
  });

  it("prefixes links when the redesign is served under /particle-redesign", async () => {
    window.history.pushState({}, "", "/particle-redesign/work/quiver");
    const { BASE_PATH, withBase } = await import("./base-path");
    expect(BASE_PATH).toBe("/particle-redesign");
    expect(withBase("/cv")).toBe("/particle-redesign/cv");
  });

  it("leaves links alone at the project's own root address", async () => {
    window.history.pushState({}, "", "/work/quiver");
    const { BASE_PATH, withBase } = await import("./base-path");
    expect(BASE_PATH).toBe("");
    expect(withBase("/cv")).toBe("/cv");
  });
});
