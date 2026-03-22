import { Activity, Database, FolderArchive, Mail, MapPin, Menu } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

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
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <aside className="fixed right-0 top-0 z-40 hidden h-full w-20 flex-col items-center border-l border-[#ff003c]/10 bg-[#050505] py-24 lg:flex">
        <div className="flex flex-1 flex-col items-center gap-7">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <motion.button
                key={item.id}
                type="button"
                onClick={() => {
                  jumpToSection(item.id);
                  setActiveSection(item.id);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                className={`group relative p-2 transition-colors ${
                  isActive ? "bg-[#8b0020] text-[#ff003c]" : "text-zinc-600 hover:text-[#ff003c]"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="mt-1 block text-center font-mono text-[8px] uppercase tracking-wider">
                  {item.label}
                </span>
                {isActive ? (
                  <div className="absolute -right-1 top-1/2 h-8 w-1 -translate-y-1/2 bg-[#ff003c]" />
                ) : null}
              </motion.button>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-[#ff003c] shadow-[0_0_8px_#ff003c]" />
          <span className="[writing-mode:vertical-rl] rotate-180 font-mono text-[7px] uppercase text-zinc-600">
            one_page_mode
          </span>
        </div>
      </aside>

      <div className="fixed right-4 top-4 z-[60] lg:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center border border-[#ff003c]/30 bg-black/80 text-[#ff003c] backdrop-blur-sm"
            >
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="border-l border-[#ff003c]/25 bg-[#050505] p-0 text-zinc-300"
          >
            <div className="border-b border-[#ff003c]/15 px-5 py-5 font-mono text-[11px] uppercase tracking-[0.22em] text-[#ff003c]">
              Navigation
            </div>
            <div className="flex flex-col gap-2 px-5 py-5">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      jumpToSection(item.id);
                      setActiveSection(item.id);
                      setMobileOpen(false);
                    }}
                    className="flex items-center gap-3 border border-[#ff003c]/15 bg-black/50 px-4 py-4 text-left font-mono text-xs uppercase tracking-[0.18em] text-zinc-300"
                  >
                    <Icon className="h-4 w-4 text-[#ff003c]" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
