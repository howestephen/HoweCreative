export type ContactPayload = {
  name: string;
  email: string;
  projectType: string;
  brief: string;
  website: string;
};

export type ContactTransport = "client" | "server";

export function createContactRequest(
  transport: ContactTransport,
  publicAccessKey: string | undefined,
  payload: ContactPayload,
): { url: string; init: RequestInit } {
  const { name, email, projectType, brief, website } = payload;

  if (transport === "client") {
    if (!publicAccessKey) {
      throw new Error("Contact form is not configured.");
    }

    return {
      url: "https://api.web3forms.com/submit",
      init: {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: publicAccessKey,
          name,
          email,
          subject: `Portfolio enquiry from ${name}${projectType ? ` - ${projectType}` : ""}`,
          message: `Role or project: ${projectType || "-"}\n\n${brief}`,
          botcheck: website || undefined,
        }),
      },
    };
  }

  return {
    url: "/api/contact",
    init: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  };
}
