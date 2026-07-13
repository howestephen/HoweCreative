import { AnimatePresence, motion } from "motion/react";
import { FolderArchive, ScanSearch, X } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { ImageWithFallback } from "./figma/ImageWithFallback";
import { archiveContent, archiveEntries, archiveTools } from "../data/portfolio";

export function ArchiveSection() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTool, setActiveTool] = useState<(typeof archiveTools)[number]>("All");
  const sectionRef = useRef<HTMLElement>(null);

  const scrollToSection = useCallback(() => {
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    setTimeout(scrollToSection, 0);
  }, [scrollToSection]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setTimeout(scrollToSection, 280);
  }, [scrollToSection]);

  const filteredEntries = useMemo(() => {
    return archiveEntries.filter((entry) =>
      activeTool === "All" ? true : entry.tools.includes(activeTool),
    );
  }, [activeTool]);

  return (
    <section ref={sectionRef} id="archive" className="relative z-[20] border-t border-accent/32 px-6 py-24 md:py-28">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65 }}
          className="grid gap-8 lg:grid-cols-[1fr_auto]"
        >
          <div className="max-w-3xl">
            <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-accent">
              {archiveContent.eyebrow}
            </div>
            <h2 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              {archiveContent.title}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">{archiveContent.description}</p>
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleOpen}
              className="inline-flex items-center gap-2 border border-accent bg-accent px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-foreground transition-colors hover:bg-accent-hover"
            >
              <FolderArchive className="h-4 w-4" />
              {archiveContent.openButtonLabel}
            </button>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {isOpen
          ? createPortal(
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] bg-black/88 p-4 backdrop-blur-md md:p-8"
                onClick={handleClose}
              >
            <motion.div
              initial={{ opacity: 0, y: 26, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.985 }}
              onClick={(event) => event.stopPropagation()}
              className="relative mx-auto flex h-full max-w-7xl flex-col overflow-hidden border border-accent/30 bg-card"
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.08]"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.18) 3px, rgba(255,255,255,0.18) 4px)",
                }}
              />

              <div className="relative z-10 flex items-center justify-between border-b border-accent/32 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground md:px-6">
                <h2 className="flex items-center gap-3 text-[11px] font-normal">
                  <ScanSearch className="h-4 w-4 text-accent" />
                  {archiveContent.browserTitle}
                </h2>
                <button
                  onClick={handleClose}
                  className="flex items-center gap-2 border border-accent/32 px-3 py-1 text-foreground transition-colors hover:border-accent hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                  {archiveContent.closeLabel}
                </button>
              </div>


              <div className="relative z-10 border-b border-accent/28 px-4 py-4 md:px-6">
                <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {archiveContent.filterLabel}
                </div>
                <div className="flex flex-wrap gap-2">
                  {archiveTools.map((tool) => (
                    <button
                      key={tool}
                      type="button"
                      onClick={() => setActiveTool(tool)}
                      className={`border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors ${
                        activeTool === tool
                          ? "border-accent bg-accent text-accent-foreground"
                          : "border-accent/30 bg-card/95 text-foreground/85 hover:border-accent/50"
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
                      <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                        {archiveContent.timelineLabel}
                      </div>
                      <div className="relative ml-4 border-l border-accent/32 pl-4">
                        {filteredEntries.map((entry) => (
                          <div key={entry.id} className="relative pb-6 font-mono text-[11px] text-muted-foreground">
                            <span className="absolute -left-[22px] top-1 h-2 w-2 rounded-full bg-accent" />
                            {entry.year}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    {filteredEntries.map((entry) => (
                      <div key={entry.id} className="grid gap-4 border border-accent/30 bg-card/95 p-4 md:grid-cols-[220px_1fr]">
                        <div className="overflow-hidden border border-accent/28">
                          <ImageWithFallback
                            src={entry.preview}
                            alt={entry.title}
                            className="h-40 w-full object-cover md:h-full"
                          />
                        </div>
                        <div>
                          <div className="mb-2 flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                            <span className="text-accent">{entry.date}</span>
                            <span>{entry.kind}</span>
                          </div>
                          <h3 className="text-xl font-medium text-foreground">{entry.title}</h3>
                          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                            {entry.description}
                          </p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            {entry.tools.map((tool) => (
                              <span
                                key={tool}
                                className="border border-accent/30 bg-accent/8 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-foreground"
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
          </motion.div>,
              document.body,
            )
          : null}
      </AnimatePresence>
    </section>
  );
}
