import { AnimatePresence, motion } from "motion/react";
import { FolderArchive, ScanSearch, X } from "lucide-react";
import { useMemo, useState } from "react";

import { ImageWithFallback } from "./figma/ImageWithFallback";
import { archiveEntries, archiveTools } from "../data/portfolio";

export function ArchiveSection() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTool, setActiveTool] = useState<(typeof archiveTools)[number]>("All");

  const filteredEntries = useMemo(() => {
    return archiveEntries.filter((entry) =>
      activeTool === "All" ? true : entry.tools.includes(activeTool),
    );
  }, [activeTool]);

  return (
    <section id="archive" className="relative border-t border-[#ff003c]/20 px-6 py-18 md:py-20">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65 }}
          className="grid gap-8 lg:grid-cols-[1fr_auto]"
        >
          <div className="max-w-3xl">
            <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-[#ff003c]">
              The Archive
            </div>
            <h2 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
              A filtered timeline of older assets and tools.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-zinc-400 md:text-base">
              Open the archive to filter by tool and browse dated output in a vertical timeline.
              This is treated as its own self-contained interface rather than another block on the
              homepage.
            </p>
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="inline-flex items-center gap-2 border border-[#ff003c] bg-[#ff003c] px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-black transition-colors hover:bg-[#ff4466]"
            >
              <FolderArchive className="h-4 w-4" />
              Open Archive
            </button>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[95] bg-black/88 p-4 backdrop-blur-md md:p-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 26, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.985 }}
              onClick={(event) => event.stopPropagation()}
              className="relative mx-auto flex h-full max-w-7xl flex-col overflow-hidden border border-[#ff003c]/30 bg-[#040404]"
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.08]"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.18) 3px, rgba(255,255,255,0.18) 4px)",
                }}
              />

              <div className="relative z-10 flex items-center justify-between border-b border-[#ff003c]/20 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-400 md:px-6">
                <div className="flex items-center gap-3">
                  <ScanSearch className="h-4 w-4 text-[#ff003c]" />
                  Archive Browser
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 border border-[#ff003c]/20 px-3 py-1 text-zinc-200 transition-colors hover:border-[#ff003c] hover:text-white"
                >
                  <X className="h-4 w-4" />
                  Close
                </button>
              </div>

              <div className="relative z-10 border-b border-[#ff003c]/15 px-4 py-4 md:px-6">
                <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                  Filter by Tool
                </div>
                <div className="flex flex-wrap gap-2">
                  {archiveTools.map((tool) => (
                    <button
                      key={tool}
                      type="button"
                      onClick={() => setActiveTool(tool)}
                      className={`border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors ${
                        activeTool === tool
                          ? "border-[#ff003c] bg-[#ff003c] text-black"
                          : "border-[#ff003c]/18 bg-black/45 text-zinc-300 hover:border-[#ff003c]/50"
                      }`}
                    >
                      {tool}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative z-10 min-h-0 flex-1 overflow-y-auto px-4 py-5 md:px-6 md:py-6">
                <div className="grid gap-8 lg:grid-cols-[120px_1fr]">
                  <div className="hidden lg:block">
                    <div className="sticky top-0">
                      <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                        Timeline
                      </div>
                      <div className="relative ml-4 border-l border-[#ff003c]/20 pl-4">
                        {filteredEntries.map((entry) => (
                          <div key={entry.id} className="relative pb-6 font-mono text-[11px] text-zinc-500">
                            <span className="absolute -left-[22px] top-1 h-2 w-2 rounded-full bg-[#ff003c]" />
                            {entry.year}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    {filteredEntries.map((entry) => (
                      <div key={entry.id} className="grid gap-4 border border-[#ff003c]/18 bg-black/45 p-4 md:grid-cols-[220px_1fr]">
                        <div className="overflow-hidden border border-[#ff003c]/15">
                          <ImageWithFallback
                            src={entry.preview}
                            alt={entry.title}
                            className="h-40 w-full object-cover md:h-full"
                          />
                        </div>
                        <div>
                          <div className="mb-2 flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                            <span className="text-[#ff003c]">{entry.date}</span>
                            <span>{entry.kind}</span>
                          </div>
                          <h3 className="text-xl font-medium text-white">{entry.title}</h3>
                          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                            {entry.description}
                          </p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            {entry.tools.map((tool) => (
                              <span
                                key={tool}
                                className="border border-[#ff003c]/18 bg-[#ff003c]/8 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-200"
                              >
                                {tool}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
