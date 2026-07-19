// @vitest-environment node
import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("./_lib/rate-limit", () => ({
  checkRateLimit: vi.fn(),
}));

import { checkRateLimit } from "./_lib/rate-limit";
import handler from "./contact";

function makeReq(body: Record<string, unknown> = {}, ip = "1.1.1.1") {
  return { method: "POST", body, headers: { "x-forwarded-for": ip } };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFn = (...args: any[]) => any;
type MockRes = { status: AnyFn; json: AnyFn; setHeader: AnyFn };

function makeRes(): MockRes {
  const res = {} as MockRes;
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  res.setHeader = vi.fn(() => res);
  return res;
}

describe("contact handler rate limiting", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.EMAIL_ACCESS_KEY;
    process.env.WEB3FORMS_SERVER_ACCESS_KEY = "test-key";
  });

  it("returns 429 when rate limit exceeded", async () => {
    vi.mocked(checkRateLimit).mockReturnValue({ allowed: false, retryAfter: 300 });
    const res = makeRes();
    await handler(makeReq(), res);
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

  it("sets Retry-After header when rate limited", async () => {
    vi.mocked(checkRateLimit).mockReturnValue({ allowed: false, retryAfter: 300 });
    const res = makeRes();
    await handler(makeReq(), res);
    expect(res.setHeader).toHaveBeenCalledWith("Retry-After", "300");
  });

  it("proceeds to validation when under limit (missing fields → 400)", async () => {
    vi.mocked(checkRateLimit).mockReturnValue({ allowed: true });
    const res = makeRes();
    await handler(makeReq({ name: "", email: "", brief: "" }), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("does not call rate limiter for non-POST methods", async () => {
    const req = { method: "GET", body: {}, headers: {} };
    const res = makeRes();
    await handler(req, res);
    expect(checkRateLimit).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(405);
  });

  it("does not accept the public client key as a server credential", async () => {
    vi.mocked(checkRateLimit).mockReturnValue({ allowed: true });
    delete process.env.WEB3FORMS_SERVER_ACCESS_KEY;
    process.env.EMAIL_ACCESS_KEY = "public-form-key";
    const res = makeRes();

    await handler(
      makeReq({ name: "Ada", email: "ada@example.com", brief: "Hello" }),
      res,
    );

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Email service not configured." }),
    );
  });
});
