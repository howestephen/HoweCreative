import { AnimatePresence, motion } from "motion/react";
import { X, ScanLine, FolderOpenDot, ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { ImageWithFallback } from "./figma/ImageWithFallback";
import { MediaGallery } from "./MediaGallery";
import { caseStudiesContent, portfolioProjects, tagToolLookup, type ProjectMediaItem } from "../data/portfolio";

function CaseStudyFile({
  project,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: {
  project: (typeof portfolioProjects)[number];
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrev) onPrev();
      if (e.key === "ArrowRight" && hasNext) onNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, onPrev, onNext, hasPrev, hasNext]);

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-stretch bg-black/86 backdrop-blur-md"
      onClick={onClose}
    >
      {/* ── Prev button ────────────────────────────────────────────── */}
      <div className="hidden items-center justify-center md:flex md:w-20">
        <AnimatePresence>
          {hasPrev && (
            <motion.button
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              onClick={(e) => { e.stopPropagation(); onPrev(); }}
              className="group flex h-12 w-12 items-center justify-center border border-accent/30 bg-card/95 text-muted-foreground transition-colors hover:border-accent hover:text-foreground"
              aria-label="Previous case study"
            >
              <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* ── Main panel ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        transition={{ duration: 0.26 }}
        onClick={(e) => e.stopPropagation()}
        className="relative flex min-w-0 flex-1 flex-col overflow-hidden border-accent/35 bg-card md:my-4 md:border md:shadow-[0_0_0_1px_rgba(255,0,60,0.16),0_30px_120px_rgba(0,0,0,0.55)]"
      >
        {/* scan-line overlays */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.18) 3px, rgba(255,255,255,0.18) 4px)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(color-mix(in srgb, var(--accent) 28%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--accent) 20%, transparent) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* header */}
        <div className="relative z-10 flex items-center justify-between border-b border-accent/38 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground md:px-6">
          <div className="flex items-center gap-2 md:gap-3">
            {/* Mobile prev/next */}
            <div className="flex items-center gap-1 md:hidden">
              <button
                onClick={(e) => { e.stopPropagation(); onPrev(); }}
                disabled={!hasPrev}
                className="flex h-7 w-7 items-center justify-center border border-accent/30 bg-card/95 text-muted-foreground disabled:opacity-20"
                aria-label="Previous case study"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onNext(); }}
                disabled={!hasNext}
                className="flex h-7 w-7 items-center justify-center border border-accent/30 bg-card/95 text-muted-foreground disabled:opacity-20"
                aria-label="Next case study"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <FolderOpenDot className="h-4 w-4 text-accent" />
            <span className="hidden sm:inline">{caseStudiesContent.openFileLabel}</span>
            <span className="hidden text-muted-foreground/80 sm:inline">{project.slug}</span>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-2 border border-accent/38 px-3 py-1 text-foreground/85 transition-colors hover:border-accent hover:text-foreground"
          >
            <X className="h-4 w-4" />
            {caseStudiesContent.closeLabel}
          </button>
        </div>

        {/* body */}
        <div className="relative z-10 min-h-0 flex-1 overflow-y-auto lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:overflow-hidden">
          <div className="border-b border-accent/28 p-5 lg:border-b-0 lg:border-r lg:p-8 lg:overflow-y-auto">
            <div className="mb-4 flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              <span className="border border-accent/32 bg-accent/8 px-2 py-1 text-accent">
                {project.category}
              </span>
              <span>{project.year}</span>
              <span>{project.status}</span>
            </div>

            <h2 className="max-w-xl text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
              {project.title}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground/85 md:text-base">
              {project.fullDescription}
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                [caseStudiesContent.metaLabels.role, project.role],
                [caseStudiesContent.metaLabels.client, project.client],
                [caseStudiesContent.metaLabels.status, project.status],
              ].map(([label, value]) => (
                <div key={label} className="border border-accent/30 bg-card/95 p-4">
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {label}
                  </div>
                  <div className="mt-2 text-sm text-foreground">{value}</div>
                </div>
              ))}
            </div>

            {/* Media gallery */}
            {(() => {
              const mediaItems: ProjectMediaItem[] =
                project.media && project.media.length > 0
                  ? project.media
                  : [{ type: "image", src: project.image, alt: project.title }];
              return <MediaGallery items={mediaItems} gradient={project.gradient} />;
            })()}

            {/* Tool badges */}
            <div className="mt-6">
              <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Tools Used
              </div>
              {(() => {
                const withIcon = project.tags.filter((t) => tagToolLookup[t]);
                const withoutIcon = project.tags.filter((t) => !tagToolLookup[t]);
                return (
                  <div className="flex flex-col gap-2">
                    {withIcon.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {withIcon.map((tag) => {
                          const tool = tagToolLookup[tag];
                          const Icon = tool.icon;
                          return (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1.5 border border-accent/35 bg-accent/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-accent"
                            >
                              <Icon className="h-3 w-3 shrink-0" style={{ color: tool.color }} />
                              {tag}
                            </span>
                          );
                        })}
                      </div>
                    )}
                    {withoutIcon.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {withoutIcon.map((tag) => (
                          <span
                            key={tag}
                            className="border border-accent/35 bg-accent/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-accent"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

          </div>

          <div className="min-h-0 p-5 lg:overflow-y-auto lg:p-8">
            <div className="mb-4 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
              <ScanLine className="h-4 w-4" />
              {caseStudiesContent.sectionsLabel}
            </div>
            <div className="grid gap-4">
              {project.overlaySections.map((section) => (
                <div key={section.title} className="border border-accent/30 bg-card/95 p-4 md:p-5">
                  <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    {section.title}
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/85">{section.body}</p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </motion.div>

      {/* ── Next button ────────────────────────────────────────────── */}
      <div className="hidden items-center justify-center md:flex md:w-20">
        <AnimatePresence>
          {hasNext && (
            <motion.button
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              onClick={(e) => { e.stopPropagation(); onNext(); }}
              className="group flex h-12 w-12 items-center justify-center border border-accent/30 bg-card/95 text-muted-foreground transition-colors hover:border-accent hover:text-foreground"
              aria-label="Next case study"
            >
              <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>,
    document.body,
  );
}

export function CaseStudies() {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const savedScrollY = useRef<number>(0);

  const activeIndex = useMemo(
    () => portfolioProjects.findIndex((p) => p.slug === activeSlug),
    [activeSlug],
  );
  const activeProject = activeIndex >= 0 ? portfolioProjects[activeIndex] : null;

  const handleOpen = useCallback(
    (slug: string) => {
      savedScrollY.current = window.scrollY;
      setActiveSlug(slug);
    },
    [],
  );

  const handleClose = useCallback(() => {
    setActiveSlug(null);
    // Restore the scroll position the user was at before opening
    setTimeout(() => window.scrollTo(0, savedScrollY.current), 280);
  }, []);

  const handlePrev = useCallback(() => {
    if (activeIndex > 0) setActiveSlug(portfolioProjects[activeIndex - 1].slug);
  }, [activeIndex]);

  const handleNext = useCallback(() => {
    if (activeIndex < portfolioProjects.length - 1)
      setActiveSlug(portfolioProjects[activeIndex + 1].slug);
  }, [activeIndex]);

  return (
    <section ref={sectionRef} id="case-studies" className="relative z-[20] border-t border-accent/28 px-6 py-24 md:py-28">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65 }}
          className="mx-auto mb-12 max-w-3xl text-center"
        >
          <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.25em] text-accent">
            {caseStudiesContent.eyebrow}
          </div>
          <h2 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            {caseStudiesContent.title}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
            {caseStudiesContent.description}
          </p>
        </motion.div>

        <div className="grid justify-center gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {portfolioProjects.map((project, index) => (
            <motion.button
              key={project.slug}
              type="button"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.05 }}
              whileHover={{ y: -6 }}
              onClick={() => handleOpen(project.slug)}
              className="group relative flex min-h-[360px] flex-col overflow-hidden border border-accent/32 bg-card/95 text-left backdrop-blur-sm transition-colors hover:border-accent/60"
            >
              <div className="relative h-44 overflow-hidden border-b border-accent/28">
                <ImageWithFallback
                  src={project.image}
                  alt={project.title}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>

              <div className="flex flex-1 flex-col p-5">
                <div className="mb-3 flex items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.16em]">
                  <span className="text-accent">{project.category}</span>
                  <span className="text-muted-foreground">{project.year}</span>
                </div>
                <h3 className="text-xl font-medium text-foreground">{project.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {project.shortDescription}
                </p>
                <div className="mt-auto pt-5">
                  <div className="flex flex-wrap gap-2">
                    {project.tags.slice(0, 3).map((tag) => {
                      const tool = tagToolLookup[tag];
                      return (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1.5 border border-accent/30 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-foreground/85"
                        >
                          {tool && <tool.icon className="h-3 w-3 shrink-0" style={{ color: tool.color }} />}
                          {tag}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {activeProject ? (
          <CaseStudyFile
            key={activeProject.slug}
            project={activeProject}
            onClose={handleClose}
            onPrev={handlePrev}
            onNext={handleNext}
            hasPrev={activeIndex > 0}
            hasNext={activeIndex < portfolioProjects.length - 1}
          />
        ) : null}
      </AnimatePresence>
    </section>
  );
}
