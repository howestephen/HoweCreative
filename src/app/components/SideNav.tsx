import { Activity, Database, FolderArchive, Mail, MapPin, Menu } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

const navItems = [
  { id: "hero", icon: MapPin, label: "Intro" },
  { id: "case-studies", icon: Activity, label: "Case Files" },
  { id: "tools-skills", icon: Database, label: "Tools" },
  { id: "contact", icon: Mail, label: "Contact" },
  { id: "archive", icon: FolderArchive, label: "Archive" },
];

function jumpToSection(sectionId: string) {
  document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

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

  return (
    <div className="fixed right-4 top-4 z-[70]">
      <motion.button
        type="button"
        onClick={() => setOpen((value) => !value)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="inline-flex items-center gap-3 border border-[#ff003c]/35 bg-black/82 px-4 py-3 text-[#ff003c] shadow-[0_12px_30px_rgba(0,0,0,0.28)] backdrop-blur-md"
      >
        <span className="font-mono text-[11px] uppercase tracking-[0.3em]">Menu</span>
        <span className="flex h-7 items-center border-l border-[#ff003c]/25 pl-3">
          <Menu className="h-4 w-4" />
        </span>
      </motion.button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-[calc(100%+0.75rem)] w-[260px] overflow-hidden border border-[#ff003c]/30 bg-[#050505]/96 shadow-[0_24px_60px_rgba(0,0,0,0.45)] backdrop-blur-md"
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,0,60,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,0,60,0.18) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />

            <div className="relative border-b border-[#ff003c]/18 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">
              Navigation Box
            </div>

            <div className="relative grid gap-2 p-3">
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
                    className={`flex items-center justify-between gap-4 border px-3 py-3 text-left transition-colors ${
                      isActive
                        ? "border-[#ff003c]/55 bg-[#1a0007] text-white"
                        : "border-[#ff003c]/14 bg-black/55 text-zinc-300 hover:border-[#ff003c]/35"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className={`h-4 w-4 ${isActive ? "text-[#ff003c]" : "text-zinc-500"}`} />
                      <span className="font-mono text-[11px] uppercase tracking-[0.22em]">
                        {item.label}
                      </span>
                    </span>
                    <span className={`font-mono text-[10px] ${isActive ? "text-[#ff003c]" : "text-zinc-600"}`}>
                      0{navItems.indexOf(item) + 1}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
