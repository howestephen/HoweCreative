import { describe, it, expect, beforeEach, vi } from "vitest";
import { checkRateLimit, _resetStore } from "./rate-limit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    _resetStore();
  });

  it("allows requests under the limit", () => {
    const ip = "1.2.3.4";
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit(ip)).toEqual({ allowed: true });
    }
  });

  it("blocks the 6th request from the same IP", () => {
    const ip = "2.2.2.2";
    for (let i = 0; i < 5; i++) checkRateLimit(ip);
    const result = checkRateLimit(ip);
    expect(result.allowed).toBe(false);
    expect((result as { allowed: false; retryAfter: number }).retryAfter).toBeGreaterThan(0);
  });

  it("allows requests again after the window expires", () => {
    const ip = "3.3.3.3";
    for (let i = 0; i < 5; i++) checkRateLimit(ip);
    expect(checkRateLimit(ip).allowed).toBe(false);
    vi.advanceTimersByTime(15 * 60 * 1000 + 1); // 15 min + 1ms
    expect(checkRateLimit(ip).allowed).toBe(true);
  });

  it("treats different IPs independently", () => {
    for (let i = 0; i < 5; i++) checkRateLimit("10.0.0.1");
    expect(checkRateLimit("10.0.0.1").allowed).toBe(false);
    expect(checkRateLimit("10.0.0.2").allowed).toBe(true);
  });
});
