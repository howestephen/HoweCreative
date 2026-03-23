import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("./_lib/rate-limit", () => ({
  checkRateLimit: vi.fn(),
}));

import { checkRateLimit } from "./_lib/rate-limit";
import handler from "./contact";

function makeReq(body: object = {}, ip = "1.1.1.1") {
  return { method: "POST", body, headers: { "x-forwarded-for": ip } };
}
function makeRes() {
  const res: any = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  res.setHeader = vi.fn(() => res);
  return res;
}

describe("contact handler rate limiting", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.EMAIL_ACCESS_KEY = "test-key";
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
});
