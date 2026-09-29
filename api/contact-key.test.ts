// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import handler from "./contact-key";

function makeRes() {
  const res = {
    status: vi.fn(() => res),
    json: vi.fn(() => res),
    setHeader: vi.fn(() => res),
  };
  return res;
}

describe("contact key handler", () => {
  afterEach(() => {
    delete process.env.EMAIL_ACCESS_KEY;
    delete process.env.VITE_EMAIL_ACCESS_KEY;
  });

  it("returns the existing EMAIL_ACCESS_KEY", () => {
    process.env.EMAIL_ACCESS_KEY = "public-form-key";
    const res = makeRes();
    handler({ method: "GET" }, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ accessKey: "public-form-key" });
  });

  it("reports 503 when no key is configured", () => {
    const res = makeRes();
    handler({ method: "GET" }, res);
    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).not.toHaveBeenCalledWith(expect.objectContaining({ accessKey: expect.anything() }));
  });

  it("rejects other methods", () => {
    process.env.EMAIL_ACCESS_KEY = "public-form-key";
    const res = makeRes();
    handler({ method: "POST" }, res);
    expect(res.status).toHaveBeenCalledWith(405);
  });
});
