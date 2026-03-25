import { ArrowUpRight, Dribbble, Github, Linkedin, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

import { navItems, navigationContent, siteProfile } from "../data/portfolio";

function jumpToSection(sectionId: string) {
  document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

const socialLinks = [
  {
    label: "LinkedIn",
    handle: "/en/howestephen",
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
] as const;

export function SideNav() {
  const [activeSection, setActiveSection] = useState("hero");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const observers = navItems
      .map((item) => {
        const element = document.getElementById(item.id);
        if (!element) {
          return null;
        }

        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                setActiveSection(item.id);
              }
            });
          },
          {
            rootMargin: "-20% 0px -55% 0px",
            threshold: 0.2,
          },
        );

        observer.observe(element);
        return observer;
      })
      .filter(Boolean) as IntersectionObserver[];

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className="relative z-[70]">
      <motion.button
        type="button"
        onClick={() => setOpen((value) => !value)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="inline-flex h-[58px] items-center gap-4 border border-[#ff003c]/35 bg-black/84 px-5 text-white shadow-[0_18px_45px_rgba(0,0,0,0.34)] backdrop-blur-md"
      >
        <span className="headline-font text-[12px] uppercase tracking-[0.32em]">
          {navigationContent.menuButtonLabel}
        </span>
        <span className="flex h-8 items-center border-l border-[#ff003c]/38 pl-4 text-[#ff003c]">
          <Menu className="h-4.5 w-4.5" />
        </span>
      </motion.button>

      <AnimatePresence>
        {open ? (
          <>
            <motion.button
              type="button"
              aria-label="Close menu overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[84] bg-black/55 backdrop-blur-[3px]"
            />

            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.22 }}
              className="fixed right-4 top-4 z-[85] hidden w-[372px] overflow-hidden border border-[#ff003c]/35 bg-[#050505]/96 shadow-[0_30px_90px_rgba(0,0,0,0.58)] backdrop-blur-md md:block md:right-6 md:top-6"
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.08]"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,0,60,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,0,60,0.12) 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
              />

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04, duration: 0.2 }}
                className="relative border-b border-[#ff003c]/30 px-5 py-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="headline-font text-lg uppercase tracking-[0.14em] text-white">
                    Menu
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="inline-flex h-11 items-center gap-3 border border-[#ff003c]/30 bg-black/75 px-3.5 text-[#ff003c] transition-colors hover:border-[#ff003c] hover:text-white"
                  >
                    <span className="flex h-6 items-center pl-1">
                      <X className="h-4 w-4" />
                    </span>
                  </button>
                </div>
                <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[#ff003c]">
                  {siteProfile.navVersion}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.22 }}
                className="relative grid gap-3 p-4"
              >
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        jumpToSection(item.id);
                        setActiveSection(item.id);
                        setOpen(false);
                      }}
                      className={`group flex items-center justify-between gap-4 border px-4 py-4 text-left transition-all ${
                        isActive
                          ? "border-[#ff003c]/55 bg-[#1a0007] text-white shadow-[0_0_0_1px_rgba(255,0,60,0.18)]"
                          : "border-[#ff003c]/14 bg-black/55 text-zinc-300 hover:border-[#ff003c]/35 hover:bg-[#120008]/60"
                      }`}
                    >
                      <span className="flex items-center gap-4">
                        <span className="flex h-11 w-11 items-center justify-center border border-current/15 bg-black/35">
                          <Icon className={`h-5 w-5 ${isActive ? "text-[#ff003c]" : "text-zinc-500 group-hover:text-[#ff003c]"}`} />
                        </span>
                        <span>
                          <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                            Route {item.indexLabel}
                          </span>
                          <span className="mt-1 block headline-font text-sm uppercase tracking-[0.18em]">
                            {item.label}
                          </span>
                        </span>
                      </span>
                      <ArrowUpRight className={`h-4 w-4 ${isActive ? "text-[#ff003c]" : "text-zinc-600 group-hover:text-white"}`} />
                    </button>
                  );
                })}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.16, duration: 0.24 }}
                className="relative grid gap-2 border-t border-[#ff003c]/30 px-4 py-4"
              >
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                  External Links
                </div>
                <div className="grid gap-2">
                  {socialLinks.map((item) => {
                    const Icon = item.icon;
                    return (
                      <motion.a
                        key={item.label}
                        href={item.href}
                        target="_blank"
                        rel="noreferrer"
                        whileHover={{ x: 2 }}
                        className="flex items-center justify-between border border-[#ff003c]/14 bg-black/55 px-4 py-3 text-zinc-300 transition-colors hover:border-[#ff003c]/35 hover:text-white"
                      >
                        <span className="flex items-center gap-3">
                          <Icon className="h-4 w-4 text-[#ff003c]" />
                          <span>
                            <span className="block font-mono text-[11px] uppercase tracking-[0.2em]">
                              {item.label}
                            </span>
                            <span className="block font-mono text-[10px] text-zinc-500">{item.handle}</span>
                          </span>
                        </span>
                        <ArrowUpRight className="h-4 w-4 text-zinc-600" />
                      </motion.a>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[85] overflow-y-auto md:hidden"
            >
              <div className="absolute inset-0 bg-[#030303]/98" />
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.08]"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,0,60,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,0,60,0.12) 1px, transparent 1px)",
                  backgroundSize: "22px 22px",
                }}
              />
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.06]"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.18) 2px, rgba(255,255,255,0.18) 3px)",
                }}
              />

              <motion.div
                initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)", y: -24 }}
                animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)", y: 0 }}
                exit={{ opacity: 0, clipPath: "inset(0 0 100% 0)", y: -24 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="relative min-h-full border-b border-[#ff003c]/22 bg-black/72 px-4 pb-6 pt-0"
              >
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06, duration: 0.2 }}
                  className="border border-[#ff003c]/22 bg-black/58 px-4 py-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="headline-font text-2xl uppercase tracking-[0.16em] text-white">
                      Menu
                    </div>
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="inline-flex h-11 items-center gap-3 border border-[#ff003c]/30 bg-black/75 px-3.5 text-[#ff003c] transition-colors hover:border-[#ff003c] hover:text-white"
                    >
                      <span className="flex h-6 items-center pl-1">
                        <X className="h-4 w-4" />
                      </span>
                    </button>
                  </div>
                  <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[#ff003c]">
                    {siteProfile.navVersion}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12, duration: 0.24 }}
                  className="mt-4 grid gap-3"
                >
                  {navItems.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;

                    return (
                      <motion.button
                        key={item.id}
                        type="button"
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.12 + index * 0.04, duration: 0.22 }}
                        onClick={() => {
                          jumpToSection(item.id);
                          setActiveSection(item.id);
                          setOpen(false);
                        }}
                        className={`flex items-center justify-between gap-4 border px-4 py-4 text-left transition-colors ${
                          isActive
                            ? "border-[#ff003c]/55 bg-[#180007] text-white"
                            : "border-[#ff003c]/16 bg-black/55 text-zinc-300"
                        }`}
                      >
                        <span className="flex items-center gap-4">
                          <span className="flex h-12 w-12 items-center justify-center border border-current/15 bg-black/40">
                            <Icon className={`h-5 w-5 ${isActive ? "text-[#ff003c]" : "text-zinc-500"}`} />
                          </span>
                          <span>
                            <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                              Route {item.indexLabel}
                            </span>
                            <span className="mt-1 block headline-font text-base uppercase tracking-[0.16em]">
                              {item.label}
                            </span>
                          </span>
                        </span>
                        <ArrowUpRight className={`h-4 w-4 ${isActive ? "text-[#ff003c]" : "text-zinc-600"}`} />
                      </motion.button>
                    );
                  })}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.22, duration: 0.26 }}
                  className="mt-auto border border-[#ff003c]/30 bg-black/60 p-4"
                >
                  <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                    External Links
                  </div>
                  <div className="grid gap-3">
                    {socialLinks.map((item) => {
                      const Icon = item.icon;
                      return (
                        <a
                          key={item.label}
                          href={item.href}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between border border-[#ff003c]/14 bg-black/55 px-4 py-3 text-zinc-300"
                        >
                          <span className="flex items-center gap-3">
                            <Icon className="h-4 w-4 text-[#ff003c]" />
                            <span>
                              <span className="block font-mono text-[11px] uppercase tracking-[0.18em]">
                                {item.label}
                              </span>
                              <span className="block font-mono text-[10px] text-zinc-500">{item.handle}</span>
                            </span>
                          </span>
                          <ArrowUpRight className="h-4 w-4 text-zinc-600" />
                        </a>
                      );
                    })}
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
