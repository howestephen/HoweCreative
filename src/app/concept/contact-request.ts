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

// A build without the key (the redesign builds in its own Vercel project)
// asks the main site for its public Web3Forms key instead of copying it.
export async function resolvePublicAccessKey(
  transport: ContactTransport,
  builtInKey: string | undefined,
  fetchKey: typeof fetch = fetch,
): Promise<string | undefined> {
  if (transport !== "client" || builtInKey) return builtInKey;

  try {
    const res = await fetchKey("/api/contact-key", { headers: { Accept: "application/json" } });
    if (!res.ok) return undefined;
    const data = (await res.json()) as { accessKey?: unknown };
    return typeof data.accessKey === "string" && data.accessKey ? data.accessKey : undefined;
  } catch {
    return undefined;
  }
}
