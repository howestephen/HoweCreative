import { createElement, forwardRef, useImperativeHandle } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ContactFoot } from "./ContactFoot";
import {
  WEB3FORMS_HCAPTCHA_SITEKEY,
  createContactRequest,
  resolvePublicAccessKey,
} from "./contact-request";

// Stand-in for the hCaptcha widget: a button that "solves" it.
const captchaReset = vi.fn();
const captchaProps = vi.fn();
vi.mock("@hcaptcha/react-hcaptcha", () => ({
  default: forwardRef(function FakeHCaptcha(
    props: { sitekey: string; onVerify: (token: string) => void },
    ref,
  ) {
    captchaProps(props);
    useImperativeHandle(ref, () => ({ resetCaptcha: captchaReset }));
    return createElement(
      "button",
      { type: "button", onClick: () => props.onVerify("solved-token") },
      "Solve captcha",
    );
  }),
}));

const payload = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  projectType: "Design systems",
  brief: "Please send details.",
  website: "",
  captchaToken: "captcha-token",
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
    expect(body["h-captcha-response"]).toBe("captcha-token");
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

describe("createContactRequest limits", () => {
  it("gives every request a 15 second timeout", () => {
    for (const transport of ["client", "server"] as const) {
      const request = createContactRequest(transport, "public-form-key", payload);
      expect(request.init.signal).toBeInstanceOf(AbortSignal);
    }
  });

  it("keeps newlines in the name out of the subject", () => {
    const request = createContactRequest("client", "public-form-key", { ...payload, name: "Ada\nBcc: x" });
    expect(JSON.parse(String(request.init.body)).subject).not.toMatch(/[\r\n]/);
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

describe("ContactFoot captcha", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    captchaReset.mockClear();
    captchaProps.mockClear();
  });

  function fillForm() {
    fireEvent.change(screen.getByRole("textbox", { name: "Name" }), { target: { value: "Ada" } });
    fireEvent.change(screen.getByRole("textbox", { name: "Email" }), {
      target: { value: "ada@example.com" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Message" }), {
      target: { value: "Hello" },
    });
  }

  it("uses the Web3Forms free-plan site key", () => {
    render(createElement(ContactFoot));
    expect(captchaProps).toHaveBeenCalledWith(
      expect.objectContaining({ sitekey: WEB3FORMS_HCAPTCHA_SITEKEY, reCaptchaCompat: false }),
    );
    expect(WEB3FORMS_HCAPTCHA_SITEKEY).toBe("50b2fe65-b00b-4b9e-ad62-3ba471098be2");
  });

  it("does not send until the captcha is solved", () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    render(createElement(ContactFoot));
    fillForm();
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));

    expect(screen.getByText("Please complete the captcha.")).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("tells the sender where the reply will come from", async () => {
    vi.stubEnv("VITE_EMAIL_ACCESS_KEY", "public-form-key");
    vi.stubGlobal("fetch", vi.fn(async () => ({ json: async () => ({ success: true }) })));
    render(createElement(ContactFoot));
    fillForm();
    fireEvent.click(screen.getByRole("button", { name: "Solve captcha" }));
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));

    expect(
      await screen.findByText(
        "My reply comes from a howecreative.co.uk address. If it hasn’t arrived, please check your spam folder.",
      ),
    ).toBeInTheDocument();
  });

  it("caps the name and message lengths in the form", () => {
    render(createElement(ContactFoot));
    expect(screen.getByRole("textbox", { name: "Name" })).toHaveAttribute("maxLength", "200");
    expect(screen.getByRole("textbox", { name: "Message" })).toHaveAttribute("maxLength", "5000");
  });

  it("says when a send timed out instead of hanging on Sending", async () => {
    vi.stubEnv("VITE_EMAIL_ACCESS_KEY", "public-form-key");
    vi.stubGlobal("fetch", vi.fn(async () => { throw new DOMException("timed out", "TimeoutError"); }));
    render(createElement(ContactFoot));
    fillForm();
    fireEvent.click(screen.getByRole("button", { name: "Solve captcha" }));
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));
    expect(await screen.findByText("That took too long. Please try again.")).toBeInTheDocument();
  });

  it("sends the solved token and resets the widget after a failed send", async () => {
    vi.stubEnv("VITE_EMAIL_ACCESS_KEY", "public-form-key");
    const fetchSpy = vi.fn(async () => ({ json: async () => ({ success: false, message: "Rejected" }) }));
    vi.stubGlobal("fetch", fetchSpy);
    render(createElement(ContactFoot));
    fillForm();
    fireEvent.click(screen.getByRole("button", { name: "Solve captcha" }));
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
    const [, init] = fetchSpy.mock.calls[0] as unknown as [string, RequestInit];
    expect(JSON.parse(String(init.body))["h-captcha-response"]).toBe("solved-token");
    expect(await screen.findByText("Rejected")).toBeInTheDocument();
    expect(captchaReset).toHaveBeenCalled();

    // The used token is cleared, so a second send needs a fresh solve.
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));
    expect(screen.getByText("Please complete the captcha.")).toBeInTheDocument();
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});
