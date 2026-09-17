import { useState, type FormEvent } from "react";
import { ArrowUpRight } from "lucide-react";

import { siteProfile } from "../data/portfolio";
import { createContactRequest, type ContactTransport } from "./contact-request";

type Status = "idle" | "sending" | "success" | "error";

const inputClasses =
  "w-full border border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-accent";

type ContactFootProps = {
  // The editorial homepage keeps its mono eyebrows and accent dot. Spatial
  // routes share the dark particle system, so their chrome is quiet sans.
  variant?: "editorial" | "spatial";
  // The particle page already carries "Let's talk." in its closing arc, so
  // its form omits the repeated heading.
  heading?: boolean;
};

export function ContactFoot({ variant = "editorial", heading = true }: ContactFootProps) {
  const spatial = variant === "spatial";
  const labelClasses = spatial
    ? "mb-2 block text-[12px] text-muted-foreground"
    : "mb-2 block font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground";
  const smallClasses = spatial
    ? "text-[12px] text-muted-foreground"
    : "font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground";
  const linkClasses = spatial
    ? "inline-flex items-center gap-1 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
    : "inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-accent";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [projectType, setProjectType] = useState("");
  const [brief, setBrief] = useState("");
  const [website, setWebsite] = useState(""); // honeypot - must stay empty
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    try {
      const transport = (import.meta.env.VITE_CONTACT_TRANSPORT ?? "client") as ContactTransport;
      const publicAccessKey = import.meta.env.VITE_EMAIL_ACCESS_KEY as string | undefined;
      const request = createContactRequest(transport, publicAccessKey, {
        name,
        email,
        projectType,
        brief,
        website,
      });
      const res = await fetch(request.url, request.init);

      const data = await res.json();

      if (data.success) {
        setStatus("success");
        setName("");
        setEmail("");
        setProjectType("");
        setBrief("");
        setWebsite("");
      } else {
        setErrorMsg(data.message ?? "Something went wrong.");
        setStatus("error");
      }
    } catch (error) {
      setErrorMsg(
        error instanceof Error && error.message === "Contact form is not configured."
          ? error.message
          : "Network error. Please try again.",
      );
      setStatus("error");
    }
  }

  return (
    <section id="contact" className="scroll-mt-24 border-t border-border bg-card/60" data-variant={variant}>
      <div className="mx-auto max-w-6xl px-6 pb-10 pt-20 md:pt-28">
        <div className="grid gap-12 lg:grid-cols-5">
          <div className="lg:col-span-2">
            {!spatial && (
              <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
                Contact
              </div>
            )}
            {heading && (
              <h2 className="mb-6 text-4xl md:text-5xl">
                Let&rsquo;s talk{spatial ? "." : <span className="text-accent">.</span>}
              </h2>
            )}
            <p className="mb-8 max-w-md text-base leading-relaxed text-muted-foreground">
              Open to creative technologist, design engineer and product designer roles -
              permanent or contract, remote from the UK with EU and US-East overlap.
            </p>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <a
                href="/cv"
                className="inline-flex items-center gap-2 border border-foreground/25 px-5 py-3 text-sm font-medium text-foreground transition-colors hover:border-foreground"
              >
                View CV
              </a>
              {[
                { label: "LinkedIn", href: siteProfile.linkedinUrl },
                { label: "GitHub", href: siteProfile.githubUrl },
                { label: "Dribbble", href: siteProfile.dribbbleUrl },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className={linkClasses}
                >
                  {link.label} <ArrowUpRight className="h-3 w-3" />
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3">
            {status === "success" ? (
              <div role="status" className="flex h-full flex-col justify-center border border-border bg-card p-8">
                <div className={spatial ? "mb-2 text-[12px] text-muted-foreground" : "mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-accent"}>
                  Message sent
                </div>
                <p className="headline-font text-2xl text-foreground">
                  Thanks for reaching out. I&rsquo;ll be in touch soon.
                </p>
                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  className={`mt-6 w-fit ${smallClasses} underline underline-offset-4 transition-colors hover:text-accent`}
                >
                  Send another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className={labelClasses}>Name</span>
                  <input
                    type="text"
                    name="name"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClasses}
                  />
                </label>
                <label className="block">
                  <span className={labelClasses}>Email</span>
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClasses}
                  />
                </label>
                <label className="block md:col-span-2">
                  <span className={labelClasses}>Role or project</span>
                  <input
                    type="text"
                    name="projectType"
                    placeholder="e.g. Creative technologist role, brand system, pipeline build"
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                    className={`${inputClasses} placeholder:text-muted-foreground/60`}
                  />
                </label>
                <label className="block md:col-span-2">
                  <span className={labelClasses}>Message</span>
                  <textarea
                    name="brief"
                    rows={5}
                    required
                    value={brief}
                    onChange={(e) => setBrief(e.target.value)}
                    className={`${inputClasses} resize-none`}
                  />
                </label>
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="hidden"
                  aria-hidden="true"
                />

                <div className="flex flex-col gap-3 md:col-span-2 md:flex-row md:items-center md:justify-between">
                  <span className={smallClasses}>
                    {status === "error" ? (
                      <span role="alert" className="text-accent">{errorMsg}</span>
                    ) : (
                      "Tell me what you're building"
                    )}
                  </span>
                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="bg-accent px-8 py-3.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover disabled:opacity-50"
                  >
                    {status === "sending" ? "Sending…" : "Send message"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        <footer className={`mt-20 flex flex-col justify-between gap-3 border-t border-border pt-6 pb-2 md:flex-row ${smallClasses}`}>
          <span>© 2026 Stephen Howe {spatial ? "-" : "·"} Norwich, UK - remote worldwide</span>
          <a href={spatial ? "/study#work" : "/#work"} className="transition-colors hover:text-accent">
            {spatial ? "Back to selected work" : "Explore the work ↑"}
          </a>
        </footer>
      </div>
    </section>
  );
}
