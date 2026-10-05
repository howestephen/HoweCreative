import { useRef, useState, type FormEvent } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { ArrowUpRight } from "lucide-react";

import { siteProfile } from "../data/portfolio";
import {
  MAX_BRIEF_LENGTH,
  MAX_NAME_LENGTH,
  WEB3FORMS_HCAPTCHA_SITEKEY,
  createContactRequest,
  resolvePublicAccessKey,
  type ContactTransport,
} from "./contact-request";

type Status = "idle" | "sending" | "success" | "error";

const inputClasses =
  "w-full border border-border bg-card px-4 py-3 text-sm text-foreground transition-colors focus:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
const labelClasses =
  "mb-2 block font-mono text-[11px] sm:text-[10px] uppercase tracking-[0.16em] text-muted-foreground";

export function ContactFoot() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [projectType, setProjectType] = useState("");
  const [brief, setBrief] = useState("");
  const [website, setWebsite] = useState(""); // honeypot - must stay empty
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const captchaRef = useRef<HCaptcha>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!captchaToken) {
      setErrorMsg("Please complete the captcha.");
      setStatus("error");
      return;
    }
    setStatus("sending");
    setErrorMsg("");

    try {
      const transport = (import.meta.env.VITE_CONTACT_TRANSPORT ?? "client") as ContactTransport;
      const publicAccessKey = await resolvePublicAccessKey(
        transport,
        import.meta.env.VITE_EMAIL_ACCESS_KEY as string | undefined,
      );
      const request = createContactRequest(transport, publicAccessKey, {
        name,
        email,
        projectType,
        brief,
        website,
        captchaToken,
      });
      // A token is single-use, so every attempt needs a fresh solve.
      captchaRef.current?.resetCaptcha();
      setCaptchaToken("");
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
          : error instanceof DOMException && error.name === "TimeoutError"
            ? "That took too long. Please try again."
            : "Network error. Please try again.",
      );
      setStatus("error");
    }
  }

  return (
    <section id="contact" className="scroll-mt-24 border-t border-border bg-card/60">
      <div className="mx-auto max-w-6xl px-6 pb-10 pt-20 md:pt-28">
        <div className="grid gap-12 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="mb-3 font-mono text-[11px] sm:text-[10px] uppercase tracking-[0.18em] text-accent">
              Contact
            </div>
            <h2 className="mb-6 text-4xl md:text-5xl">
              Let&rsquo;s talk<span className="text-accent">.</span>
            </h2>
            <p className="mb-8 max-w-md text-base leading-relaxed text-muted-foreground">
              Open to creative technologist, AI designer, and design engineer roles -
              permanent or contract, remote from the UK with EU and US-East overlap.
            </p>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <a
                href="/cv"
                className="inline-flex min-h-11 items-center gap-2 border border-foreground/25 px-5 py-3 text-sm font-medium text-foreground transition-colors hover:border-foreground"
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
                  className="inline-flex min-h-11 items-center gap-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-accent"
                >
                  {link.label} <ArrowUpRight className="h-3 w-3" />
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3">
            {status === "success" ? (
              <div role="status" className="flex h-full flex-col justify-center border border-border bg-card p-8">
                <div className="mb-2 font-mono text-[11px] sm:text-[10px] uppercase tracking-[0.18em] text-accent">
                  Message sent
                </div>
                <p className="headline-font text-2xl text-foreground">
                  Thanks for reaching out. I&rsquo;ll be in touch soon.
                </p>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  My reply comes from a howecreative.co.uk address. If it hasn&rsquo;t arrived,
                  please check your spam folder.
                </p>
                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  className="-mb-3.5 mt-2.5 inline-flex min-h-11 w-fit items-center font-mono text-[11px] sm:text-[10px] uppercase tracking-[0.16em] text-muted-foreground underline underline-offset-4 transition-colors hover:text-accent"
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
                    maxLength={MAX_NAME_LENGTH}
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
                    maxLength={MAX_BRIEF_LENGTH}
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

                <div className="md:col-span-2">
                  <HCaptcha
                    ref={captchaRef}
                    sitekey={WEB3FORMS_HCAPTCHA_SITEKEY}
                    reCaptchaCompat={false}
                    onVerify={setCaptchaToken}
                    onExpire={() => setCaptchaToken("")}
                    onError={() => setCaptchaToken("")}
                  />
                </div>

                <div className="flex flex-col gap-3 md:col-span-2 md:flex-row md:items-center md:justify-between">
                  <span className="font-mono text-[11px] sm:text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
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

        <footer className="mt-20 flex flex-col justify-between gap-3 border-t border-border pt-6 pb-2 font-mono text-[11px] sm:text-[10px] uppercase tracking-[0.16em] text-muted-foreground md:flex-row">
          <span>© 2026 Stephen Howe · Norwich, UK - remote worldwide</span>
          <a href="#work" className="-my-3 flex min-h-11 items-center transition-colors hover:text-accent">
            This site was built by my agentic pipeline - the case study is above ↑
          </a>
        </footer>
      </div>
    </section>
  );
}
