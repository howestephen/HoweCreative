import { describe, expect, it, vi } from "vitest";

import { createContactRequest, resolvePublicAccessKey } from "./contact-request";

const payload = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  projectType: "Design systems",
  brief: "Please send details.",
  website: "",
};

describe("createContactRequest", () => {
  it("uses a browser-side Web3Forms request when an access key is configured", () => {
    const request = createContactRequest("client", "public-form-key", payload);
    const body = JSON.parse(String(request.init.body));

    expect(request.url).toBe("https://api.web3forms.com/submit");
    expect(request.init.method).toBe("POST");
    expect(body).toMatchObject({
      access_key: "public-form-key",
      name: payload.name,
      email: payload.email,
    });
    expect(body.subject).toContain(payload.projectType);
    expect(body.message).toContain(payload.brief);
  });

  it("preserves the honeypot signal in direct submissions", () => {
    const request = createContactRequest("client", "public-form-key", {
      ...payload,
      website: "https://spam.invalid",
    });
    const body = JSON.parse(String(request.init.body));

    expect(body.botcheck).toBe("https://spam.invalid");
  });

  it("uses the protected API in explicit server mode without leaking an access key", () => {
    const request = createContactRequest("server", undefined, payload);
    const body = JSON.parse(String(request.init.body));

    expect(request.url).toBe("/api/contact");
    expect(body).toEqual(payload);
    expect(body).not.toHaveProperty("access_key");
  });

  it("fails closed when client mode has no public form key", () => {
    expect(() => createContactRequest("client", "", payload)).toThrow(
      "Contact form is not configured.",
    );
  });
});

describe("resolvePublicAccessKey", () => {
  const okFetch = (body: unknown, ok = true) =>
    vi.fn(async () => ({ ok, json: async () => body }) as Response) as unknown as typeof fetch;

  it("uses the built-in key without a network request", async () => {
    const fetchKey = okFetch({ accessKey: "other" });
    await expect(resolvePublicAccessKey("client", "built-in", fetchKey)).resolves.toBe("built-in");
    expect(fetchKey).not.toHaveBeenCalled();
  });

  it("asks the main site for the key when the build has none", async () => {
    const fetchKey = okFetch({ accessKey: "from-main" });
    await expect(resolvePublicAccessKey("client", "", fetchKey)).resolves.toBe("from-main");
    expect(fetchKey).toHaveBeenCalledWith("/api/contact-key", expect.anything());
  });

  it("stays unconfigured when the key endpoint fails or returns nothing", async () => {
    await expect(resolvePublicAccessKey("client", "", okFetch({}, false))).resolves.toBeUndefined();
    await expect(resolvePublicAccessKey("client", "", okFetch({ accessKey: "" }))).resolves.toBeUndefined();
    const throwing = vi.fn(async () => {
      throw new Error("offline");
    }) as unknown as typeof fetch;
    await expect(resolvePublicAccessKey("client", "", throwing)).resolves.toBeUndefined();
  });

  it("never fetches a key in server mode", async () => {
    const fetchKey = okFetch({ accessKey: "from-main" });
    await expect(resolvePublicAccessKey("server", "", fetchKey)).resolves.toBe("");
    expect(fetchKey).not.toHaveBeenCalled();
  });
});
