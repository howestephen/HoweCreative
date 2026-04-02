import { ArrowUpRight, Dribbble, Github, Linkedin, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { createPortal } from "react-dom";

import { footerContent, siteProfile } from "../data/portfolio";

const MODEL_ATTRIBUTIONS = [
  { label: "Creative Systems", title: "HeadRef", author: "Christian Venables", url: "https://poly.pizza/m/9c-7mribNvi" },
  { label: "Design", title: "Painting", author: "Nick Slough", url: "https://poly.pizza/m/rsZqX75a8x" },
  { label: "Prototyping", title: "Computer", author: "Poly by Google", url: "https://poly.pizza/m/eCQBPXzmq1C" },
  { label: "Motion Graphics", title: "VHS", author: "Guillaume Brette", url: "https://poly.pizza/m/8vBswoRHx8o" },
  { label: "3D Generalist", title: "Robot", author: "Poly by Google", url: "https://poly.pizza/m/9A6cuitiB_4" },
  { label: "Audio Production", title: "Headphones", author: "J-Toastie", url: "https://poly.pizza/m/EwlPidEswV" },
];

const SOCIAL_LINKS = [
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

function AttributionsPopup({ onClose }: { onClose: () => void }) {
  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.97 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md border border-[#ff003c]/30 bg-[#050505] p-6"
      >
        <div className="mb-5 flex items-center justify-between">
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#ff003c]">
            3D Model Attributions
          </span>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center border border-[#ff003c]/38 text-zinc-400 transition-colors hover:border-[#ff003c] hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {MODEL_ATTRIBUTIONS.map((item) => (
            <div key={item.label} className="border border-[#ff003c]/12 bg-black/95 px-4 py-3">
              <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                {item.label}
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm text-white">{item.title}</span>
                <span className="shrink-0 font-mono text-[10px] text-zinc-500">by {item.author}</span>
              </div>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block font-mono text-[10px] text-zinc-600 transition-colors hover:text-[#ff003c]"
              >
                poly.pizza ↗
              </a>
            </div>
          ))}
        </div>

        <p className="mt-4 font-mono text-[10px] leading-relaxed text-zinc-600">
          All models used under Creative Commons Attribution 3.0 (CC BY 3.0).
        </p>
      </motion.div>
    </motion.div>,
    document.body,
  );
}

export function Footer() {
  const [showAttributions, setShowAttributions] = useState(false);

  return (
    <footer className="w-full py-12 px-8 bg-[#050505] border-t border-[#ff003c]/32 relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255, 0, 60, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 0, 60, 0.5) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <h3 className="headline-font mb-4 flex items-center gap-2 text-sm uppercase tracking-widest text-white">
              <span className="w-1 h-1 bg-[#ff003c] rounded-full" />
              {siteProfile.name}
            </h3>
            <p className="text-zinc-500 text-sm font-mono leading-relaxed">
              {siteProfile.summary}
            </p>
          </div>

          <div>
            <h3 className="headline-font mb-4 flex items-center gap-2 text-sm uppercase tracking-widest text-white">
              <span className="w-1 h-1 bg-[#ff003c] rounded-full" />
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
                    className="block text-zinc-600 hover:text-[#ff003c] transition-colors hover:translate-x-1 transform duration-200"
                  >
                    {`> ${item.label}`}
                  </button>
                ) : (
                  <a
                    key={item.label}
                    href={item.href ?? siteProfile.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-zinc-600 hover:text-[#ff003c] transition-colors hover:translate-x-1 transform duration-200"
                  >
                    {`> ${item.label}`}
                  </a>
                ),
              )}
            </nav>
          </div>

          <div>
            <h3 className="headline-font mb-4 flex items-center gap-2 text-sm uppercase tracking-widest text-white">
              <span className="w-1 h-1 bg-[#ff003c] rounded-full" />
              {footerContent.currentStateTitle}
            </h3>
            <div className="space-y-3 text-zinc-500 text-xs font-mono leading-relaxed">
              {footerContent.currentStateLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-[#ff003c]/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="font-mono text-[10px] tracking-widest text-zinc-600 uppercase">
              {footerContent.copyright}
            </div>
            <button
              onClick={() => setShowAttributions(true)}
              className="font-mono text-[10px] tracking-widest text-zinc-600 uppercase transition-colors hover:text-[#ff003c]"
            >
              Attributions
            </button>
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
                  className="group flex min-w-[180px] items-center justify-between border border-[#ff003c]/30 bg-black/95 px-4 py-3 transition-all hover:border-[#ff003c]/60"
                  title={title}
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center border border-[#ff003c]/16 bg-[#120008]/97">
                      <Icon className="h-4 w-4 text-[#ff003c]" />
                    </span>
                    <span>
                      <span className="block font-mono text-[11px] uppercase tracking-[0.18em] text-white">
                        {item.label}
                      </span>
                      <span className="block font-mono text-[10px] text-zinc-500">{item.handle}</span>
                    </span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-zinc-600 transition-colors group-hover:text-white" />
                </motion.a>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <div className="text-center md:text-right">
              <div className="flex items-center justify-center md:justify-end gap-2">
                <div className="w-2 h-2 bg-[#ff003c] animate-pulse rounded-full shadow-[0_0_8px_#ff003c]" />
                <span className="font-mono text-[10px] tracking-widest text-[#ff003c] uppercase">
                  {footerContent.statusLabel}
                </span>
              </div>
              <a
                href={siteProfile.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600 transition-colors hover:text-[#ff003c]"
              >
                Source Repo
              </a>
            </div>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {showAttributions && <AttributionsPopup key="attributions" onClose={() => setShowAttributions(false)} />}
      </AnimatePresence>
    </footer>
  );
}
