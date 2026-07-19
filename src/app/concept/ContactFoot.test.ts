import { describe, expect, it } from "vitest";

import { createContactRequest } from "./contact-request";

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
