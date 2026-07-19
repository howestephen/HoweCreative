type ContactBuildEnvironment = Record<string, string | undefined>;

export function resolveContactBuildConfig(environment: ContactBuildEnvironment) {
  const configuredTransport = environment.CONTACT_TRANSPORT;
  const contactTransport =
    configuredTransport?.toLowerCase() === "server" ? "server" : "client";
  const publicEmailAccessKey =
    contactTransport === "client"
      ? environment.EMAIL_ACCESS_KEY ?? environment.VITE_EMAIL_ACCESS_KEY ?? ""
      : "";

  return { contactTransport, publicEmailAccessKey };
}
