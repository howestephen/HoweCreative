import { ArrowUpRight } from "lucide-react";

import { siteProfile } from "../data/portfolio";

export function ContactFoot() {
  return (
    <section id="contact" className="scroll-mt-24 border-t border-border bg-card/60">
      <div className="mx-auto max-w-6xl px-6 pb-10 pt-20 md:pt-28">
        <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
          Contact
        </div>
        <h2 className="mb-6 text-4xl md:text-5xl">
          Let&rsquo;s talk<span className="text-accent">.</span>
        </h2>
        <p className="mb-10 max-w-xl text-base leading-relaxed text-muted-foreground">
          Open to creative technologist, AI designer, and design engineer roles — permanent
          or contract, remote from the UK with EU and US-East overlap.
        </p>

        <a
          href="mailto:howestephen@gmail.com"
          className="headline-font inline-block break-all text-[clamp(1.4rem,4.6vw,3.2rem)] italic text-foreground underline decoration-accent decoration-2 underline-offset-8 transition-colors hover:text-accent"
        >
          howestephen@gmail.com
        </a>

        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
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
              className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-accent"
            >
              {link.label} <ArrowUpRight className="h-3 w-3" />
            </a>
          ))}
        </div>

        <footer className="mt-20 flex flex-col justify-between gap-3 border-t border-border pt-6 pb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground md:flex-row">
          <span>© 2026 Stephen Howe · Norwich, UK — remote worldwide</span>
          <a href="#work" className="transition-colors hover:text-accent">
            This site was built by my agentic pipeline — the case study is above ↑
          </a>
        </footer>
      </div>
    </section>
  );
}
