import { describe, expect, it } from "vitest";

import { resolveContactBuildConfig } from "./app/lib/contact-build-config";

describe("contact build configuration", () => {
  it("embeds the public form identifier in the default client mode", () => {
    expect(
      resolveContactBuildConfig({ EMAIL_ACCESS_KEY: "public-form-key" }),
    ).toEqual({
      contactTransport: "client",
      publicEmailAccessKey: "public-form-key",
    });
  });

  it("excludes public and server keys from server-mode client configuration", () => {
    const config = resolveContactBuildConfig({
      CONTACT_TRANSPORT: "server",
      EMAIL_ACCESS_KEY: "public-form-key",
      WEB3FORMS_SERVER_ACCESS_KEY: "private-server-key",
    });

    expect(config).toEqual({
      contactTransport: "server",
      publicEmailAccessKey: "",
    });
    expect(JSON.stringify(config)).not.toContain("public-form-key");
    expect(JSON.stringify(config)).not.toContain("private-server-key");
  });

  it("fails safe to the supported client mode for unknown values", () => {
    expect(
      resolveContactBuildConfig({
        CONTACT_TRANSPORT: "unexpected",
        VITE_EMAIL_ACCESS_KEY: "legacy-public-key",
      }),
    ).toEqual({
      contactTransport: "client",
      publicEmailAccessKey: "legacy-public-key",
    });
  });
});
