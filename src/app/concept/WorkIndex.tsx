import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Minus, Plus, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { portfolioProjects, type PortfolioProject } from "../data/portfolio";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

/** Outcome-first teasers - the one line a hiring manager reads. */
const TEASERS: Record<string, string> = {
  "solana-diary":
    "Seven services that turned live Solana data and news into designed posts - every one approved from my phone before it hit X.",
  "uncx-rebrand":
    "Two-phase rebrand of a multi-chain DeFi protocol - one visual system across 10+ product pages.",
  "uncx-video-system":
    "The pipeline behind 232 videos at UNCX - templated 3D and motion production at launch cadence.",
  "badger-club":
    "A full-stack badge-tracking platform - design to deployed product, solo, AI-assisted.",
  "ai-portfolio-system": "The agentic build system whose output you're reading right now - spec to phased roadmap to gated build.",
  "uncx-menu":
    "One navigation system for an entire product suite - researched, variable-driven, ready to build.",
  "uncx-academy": "An education platform's brand and design system, fed by the video pipeline.",
  "uncx-app-concepts":
    "Five years of product concepts - validated visually before a line of code was committed.",
  "noticia-lingo": "Language learning driven by live news - lesson types designed as pure functions.",
};

/** Gallery thumbnails are pre-generated at 480px into a sibling `thumbs/`
 *  folder (see scripts/build-thumbs.mjs). Full-resolution originals are only
 *  fetched when an image is opened in the lightbox, which keeps the expanded
 *  row light on mobile connections. */
function thumbSrc(src: string): string {
  const slash = src.lastIndexOf("/");
  const dot = src.lastIndexOf(".");
  if (slash === -1 || dot < slash) return src;
  return `${src.slice(0, slash)}/thumbs/${src.slice(slash + 1, dot)}.jpg`;
}

function sectionBody(project: PortfolioProject, title: string) {
  return project.overlaySections.find((section) => section.title === title)?.body ?? "";
}

function ExpandedRow({
  project,
  onOpenImage,
}: {
  project: PortfolioProject;
  onOpenImage: (index: number) => void;
}) {
  const brief = sectionBody(project, "Brief");
  const system = sectionBody(project, "System Design");
  const outcome = sectionBody(project, "Outcome");
  const images = (project.media ?? []).filter((m) => m.type === "image");

  return (
    // Left padding matches the index-number column plus its gap, so the
    // expanded content aligns with the project title rather than the number.
    <div className="grid gap-10 pb-10 pt-2 pl-[3.6rem] md:pl-16 lg:grid-cols-5">
      <div className="space-y-6 lg:col-span-3">
        <p className="max-w-2xl leading-relaxed text-foreground/90">{project.fullDescription}</p>

        {brief && (
          <div>
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
              Brief
            </div>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{brief}</p>
          </div>
        )}

        {system && (
          <div>
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
              System
            </div>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{system}</p>
          </div>
        )}

        {outcome && (
          <div className="border-l-2 border-accent pl-4">
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
              Outcome
            </div>
            <p className="max-w-2xl text-sm leading-relaxed text-foreground/90">{outcome}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          {[project.role, project.client, project.status].map((chip) => (
            <span
              key={chip}
              className="border border-border bg-card px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground"
            >
              {chip}
            </span>
          ))}
        </div>
      </div>

      <div className="lg:col-span-2">
        {images.length > 0 && (
          <div>
            <div className="mb-2 flex items-baseline justify-between gap-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
                Gallery
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                {images.length} {images.length === 1 ? "image" : "images"} / scroll
              </span>
            </div>
            {/* Two rows scrolling sideways: keeps the gallery the same height as
                the text column instead of running far past it, and means only the
                first few images are ever fetched on load. */}
            <div className="-mx-1 overflow-x-auto px-1 pb-2">
              <div className="grid w-max snap-x snap-mandatory grid-flow-col grid-rows-2 gap-1.5">
                {images.map((media, index) => (
                  <button
                    key={media.src}
                    type="button"
                    onClick={() => onOpenImage(index)}
                    aria-label={`View larger: ${media.alt ?? project.title}`}
                    className="group/thumb block w-28 shrink-0 snap-start border border-border bg-card transition-colors hover:border-accent sm:w-32"
                  >
                    <ImageWithFallback
                      src={thumbSrc(media.src)}
                      alt={media.alt ?? project.title}
                      loading="lazy"
                      decoding="async"
                      className="aspect-square w-full object-cover transition-opacity group-hover/thumb:opacity-85"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

type LightboxState = { slug: string; index: number } | null;

function Lightbox({
  project,
  index,
  onClose,
  onStep,
}: {
  project: PortfolioProject;
  index: number;
  onClose: () => void;
  onStep: (delta: number) => void;
}) {
  const images = (project.media ?? []).filter((m) => m.type === "image");
  const current = images[index];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onStep(1);
      if (e.key === "ArrowLeft") onStep(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      // Restore to the stylesheet default rather than a captured value: this
      // effect can re-run, and capturing "hidden" from a previous run would
      // leave the page permanently unscrollable after closing.
      document.body.style.overflow = "";
    };
  }, [onClose, onStep]);

  if (!current) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-[100] flex flex-col bg-background/97 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`${project.title} gallery`}
    >
      <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3 sm:px-5">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground sm:text-[11px]">
          {project.title} / {index + 1} of {images.length}
        </span>
        {/* Deliberately a large, filled, labelled control: the previous
            10px text link read as a caption, not a way out. */}
        <button
          type="button"
          onClick={onClose}
          autoFocus
          className="inline-flex shrink-0 items-center gap-2 bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
        >
          <X className="h-4 w-4" />
          Close
        </button>
      </div>

      <div className="flex min-h-0 flex-1 items-center gap-2 px-3 py-4 sm:px-5">
        <button
          type="button"
          onClick={() => onStep(-1)}
          aria-label="Previous image"
          className="shrink-0 border border-border bg-card p-2 text-foreground transition-colors hover:border-accent hover:text-accent"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div
          className="flex min-h-0 flex-1 items-center justify-center"
          onClick={(e) => {
            // clicking the empty space around the image also closes
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <ImageWithFallback
            src={current.src}
            alt={current.alt ?? project.title}
            className="max-h-full max-w-full object-contain"
          />
        </div>
        <button
          type="button"
          onClick={() => onStep(1)}
          aria-label="Next image"
          className="shrink-0 border border-border bg-card p-2 text-foreground transition-colors hover:border-accent hover:text-accent"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {current.alt && (
        <p className="border-t border-border px-5 py-3 text-center text-sm text-muted-foreground">
          {current.alt}
        </p>
      )}
    </motion.div>
  );
}

export function WorkIndex() {
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<LightboxState>(null);

  const lightboxProject = lightbox
    ? portfolioProjects.find((p) => p.slug === lightbox.slug)
    : undefined;

  const closeLightbox = useCallback(() => setLightbox(null), []);

  const stepLightbox = useCallback((delta: number) => {
    setLightbox((prev) => {
      if (!prev) return prev;
      const project = portfolioProjects.find((p) => p.slug === prev.slug);
      const total = (project?.media ?? []).filter((m) => m.type === "image").length;
      if (total === 0) return prev;
      return { ...prev, index: (prev.index + delta + total) % total };
    });
  }, []);

  return (
    <section id="work" className="scroll-mt-24 border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
          <h2 className="text-3xl md:text-4xl">Selected work</h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            2021-2026 · {portfolioProjects.length} projects
          </span>
        </div>
        <p className="mb-10 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Every project is shown as a system - the brief, the machinery, the outcome. Open a
          row for the working detail.
        </p>

        <ol>
          {portfolioProjects.map((project, index) => {
            const open = openSlug === project.slug;
            const teaser = TEASERS[project.slug] ?? project.shortDescription;

            return (
              <li
                key={project.slug}
                className="scroll-mt-20 border-b border-border first:border-t"
              >
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={(e) => {
                    const willOpen = !open;
                    setOpenSlug(willOpen ? project.slug : null);
                    // Opening a study collapses the others, which can leave the
                    // reader mid-page; bring the chosen row back to the top.
                    if (willOpen) {
                      const row = e.currentTarget.closest("li");
                      requestAnimationFrame(() =>
                        row?.scrollIntoView({ behavior: "smooth", block: "start" }),
                      );
                    }
                  }}
                  className="group grid w-full grid-cols-[2.6rem_1fr_auto] items-baseline gap-x-4 py-6 text-left transition-colors hover:bg-card md:grid-cols-[3rem_1fr_12rem_4rem_2rem]"
                >
                  <span className="font-mono text-[11px] tracking-[0.14em] text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <span className="block text-xl text-foreground transition-colors group-hover:text-accent md:text-2xl">
                      {project.title}
                    </span>
                    <span className="mt-1.5 block max-w-xl text-sm leading-relaxed text-muted-foreground">
                      {teaser}
                    </span>
                  </span>
                  <span className="hidden font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground md:block">
                    {project.category.split("/")[0].trim()}
                  </span>
                  <span className="hidden font-mono text-[11px] text-muted-foreground md:block">
                    {project.year}
                  </span>
                  <span className="justify-self-end text-muted-foreground transition-colors group-hover:text-accent">
                    {open ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      key="detail"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.25, 0.8, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <ExpandedRow
                        project={project}
                        onOpenImage={(imageIndex) =>
                          setLightbox({ slug: project.slug, index: imageIndex })
                        }
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Rendered outside AnimatePresence deliberately: an exit animation here
          could leave a fully transparent, click-blocking overlay mounted if the
          exit never completed. Mount/unmount is unconditional; only the entry
          is animated. */}
      {lightbox && lightboxProject && (
        <Lightbox
          project={lightboxProject}
          index={lightbox.index}
          onClose={closeLightbox}
          onStep={stepLightbox}
        />
      )}
    </section>
  );
}
