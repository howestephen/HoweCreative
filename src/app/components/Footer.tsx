import { ArrowUpRight, Dribbble, Github, Linkedin, Mail } from "lucide-react";
import { motion } from "motion/react";

import { footerContent, siteProfile } from "../data/portfolio";

const SOCIAL_LINKS = [
  {
    label: "LinkedIn",
    handle: "in/howestephen",
    href: siteProfile.linkedinUrl,
    icon: Linkedin,
  },
  {
    label: "GitHub",
    handle: "howestephen",
    href: siteProfile.githubUrl,
    icon: Github,
  },
  {
    label: "Dribbble",
    handle: "howestephen",
    href: siteProfile.dribbbleUrl,
    icon: Dribbble,
  },
  {
    label: "Email",
    handle: "howestephen@gmail.com",
    href: "mailto:howestephen@gmail.com",
    icon: Mail,
  },
] as const;

export function Footer() {
  return (
    <footer className="w-full py-12 px-8 bg-card border-t border-accent/32 relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(color-mix(in srgb, var(--accent) 50%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--accent) 50%, transparent) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <h3 className="headline-font mb-4 flex items-center gap-2 text-sm uppercase tracking-widest text-foreground">
              <span className="w-1 h-1 bg-accent rounded-full" />
              {siteProfile.name}
            </h3>
            <p className="text-muted-foreground text-sm font-mono leading-relaxed">
              {siteProfile.summary}
            </p>
          </div>

          <div>
            <h3 className="headline-font mb-4 flex items-center gap-2 text-sm uppercase tracking-widest text-foreground">
              <span className="w-1 h-1 bg-accent rounded-full" />
              {footerContent.quickAccessTitle}
            </h3>
            <nav className="space-y-2 font-mono text-sm">
              {footerContent.quickAccessItems.map((item) =>
                item.targetId ? (
                  <button
                    key={item.label}
                    onClick={() =>
                      document.getElementById(item.targetId!)?.scrollIntoView({ behavior: "smooth" })
                    }
                    className="block text-muted-foreground/80 hover:text-accent transition-colors hover:translate-x-1 transform duration-200"
                  >
                    {`> ${item.label}`}
                  </button>
                ) : (
                  <a
                    key={item.label}
                    href={item.href ?? siteProfile.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-muted-foreground/80 hover:text-accent transition-colors hover:translate-x-1 transform duration-200"
                  >
                    {`> ${item.label}`}
                  </a>
                ),
              )}
            </nav>
          </div>

          <div>
            <h3 className="headline-font mb-4 flex items-center gap-2 text-sm uppercase tracking-widest text-foreground">
              <span className="w-1 h-1 bg-accent rounded-full" />
              {footerContent.currentStateTitle}
            </h3>
            <div className="space-y-3 text-muted-foreground text-xs font-mono leading-relaxed">
              {footerContent.currentStateLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-accent/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="font-mono text-[10px] tracking-widest text-muted-foreground/80 uppercase">
              {footerContent.copyright}
            </div>
          </div>

          <div className="grid w-full gap-3 md:w-auto md:grid-cols-3">
            {SOCIAL_LINKS.map((item) => {
              const Icon = item.icon;
              const title =
                item.label === "LinkedIn"
                  ? footerContent.iconTitles.linkedin
                  : item.label === "GitHub"
                    ? footerContent.iconTitles.github
                    : footerContent.iconTitles.dribbble;

              return (
                <motion.a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="group flex min-w-[180px] items-center justify-between border border-accent/30 bg-card/95 px-4 py-3 transition-all hover:border-accent/60"
                  title={title}
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center border border-accent/16 bg-accent/10">
                      <Icon className="h-4 w-4 text-accent" />
                    </span>
                    <span>
                      <span className="block font-mono text-[11px] uppercase tracking-[0.18em] text-foreground">
                        {item.label}
                      </span>
                      <span className="block font-mono text-[10px] text-muted-foreground">{item.handle}</span>
                    </span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground/80 transition-colors group-hover:text-foreground" />
                </motion.a>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <div className="text-center md:text-right">
              <div className="flex items-center justify-center md:justify-end gap-2">
                <div className="w-2 h-2 bg-accent animate-pulse rounded-full shadow-[0_0_8px_var(--accent)]" />
                <span className="font-mono text-[10px] tracking-widest text-accent uppercase">
                  {footerContent.statusLabel}
                </span>
              </div>
              <a
                href={siteProfile.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/80 transition-colors hover:text-accent"
              >
                Source Repo
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
