import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Minus, Plus, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import {
  portfolioProjects,
  type PortfolioProject,
  type ProjectMediaItem,
} from "../data/portfolio";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

/** Outcome-first teasers - the one line a hiring manager reads. */
const TEASERS: Record<string, string> = {
  "solana-diary":
    "Seven services that turned live Solana data and news into designed posts - every one approved from my phone before it hit X.",
  "uncx-rebrand":
    "Two-phase rebrand of a multi-chain DeFi protocol - one visual system across 10+ product pages.",
  "uncx-video-system":
    "The pipeline behind 200+ videos at UNCX - templated 3D and motion production at launch cadence.",
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

/** A labelled horizontal scroller with arrow buttons and a visible scrollbar,
 *  shared by the image gallery and the video strip so both behave the same. */
function ScrollStrip({
  label,
  count,
  unit,
  children,
}: {
  label: string;
  count: number;
  unit: string;
  children: ReactNode;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  // Step the arrows by whole items rather than a fixed fraction of the width,
  // so a video (or gallery column) always lands flush against the edge instead
  // of sitting half off it. The stops are each item's left edge as a scrollLeft
  // value relative to the first item; two-row galleries share a column edge, so
  // we dedupe. Combined with scroll-snap on the container, both the arrows and a
  // manual trackpad flick settle on a clean item boundary.
  const scrollByPage = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const wrapper = el.firstElementChild;
    const items = wrapper ? Array.from(wrapper.children) : [];
    if (items.length === 0) {
      el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: "smooth" });
      return;
    }
    const containerLeft = el.getBoundingClientRect().left;
    const stops = Array.from(
      new Set(
        items.map((it) =>
          Math.round(it.getBoundingClientRect().left - containerLeft + el.scrollLeft),
        ),
      ),
    ).sort((a, b) => a - b);
    const step = stops.length > 1 ? stops[1] - stops[0] : el.clientWidth;
    const perPage = Math.max(1, Math.floor(el.clientWidth / step));
    const currentIndex = stops.reduce(
      (best, stop, i) => (stop <= el.scrollLeft + 1 ? i : best),
      0,
    );
    const targetIndex = Math.max(
      0,
      Math.min(stops.length - 1, currentIndex + direction * perPage),
    );

    // scroll-snap-type: mandatory cancels programmatic smooth scrolls in
    // Chromium, so lift snapping for the animation and restore it once the
    // scroll settles. The target is itself a snap point, so restoring causes no
    // visible jump. Restore is idempotent; the timeout is a fallback for when
    // "scrollend" never fires (e.g. the target equals the current position).
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.style.scrollSnapType = "none";
    el.scrollTo({ left: stops[targetIndex], behavior: reduce ? "auto" : "smooth" });
    const restore = () => {
      el.style.scrollSnapType = "";
    };
    if ("onscrollend" in el) el.addEventListener("scrollend", restore, { once: true });
    window.setTimeout(restore, reduce ? 0 : 700);
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">{label}</span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            {count} {count === 1 ? unit : `${unit}s`}
          </span>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => scrollByPage(-1)}
              aria-label={`Scroll ${label.toLowerCase()} left`}
              className="border border-border bg-card p-1 text-foreground transition-colors hover:border-accent hover:text-accent"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => scrollByPage(1)}
              aria-label={`Scroll ${label.toLowerCase()} right`}
              className="border border-border bg-card p-1 text-foreground transition-colors hover:border-accent hover:text-accent"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
      <div
        ref={scrollerRef}
        className="gallery-scroll -mx-1 snap-x snap-mandatory overflow-x-auto px-1 pb-2"
      >
        {children}
      </div>
    </div>
  );
}

function GalleryStrip({
  project,
  images,
  onOpenImage,
}: {
  project: PortfolioProject;
  images: ProjectMediaItem[];
  onOpenImage: (index: number) => void;
}) {
  return (
    <ScrollStrip label="Gallery" count={images.length} unit="image">
      {/* Two rows scrolling sideways so the gallery stays the height of the
          text column. */}
      <div className="grid w-max grid-flow-col grid-rows-2 gap-1.5">
        {images.map((media) => {
          const galleryIndex = (project.media ?? []).indexOf(media);
          return (
            <button
              key={media.src}
              type="button"
              onClick={() => onOpenImage(galleryIndex)}
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
          );
        })}
      </div>
    </ScrollStrip>
  );
}

function VideoStrip({ videos }: { videos: ProjectMediaItem[] }) {
  return (
    <ScrollStrip label="Videos" count={videos.length} unit="video">
      <div className="flex w-max gap-2">
        {videos.map((media) => (
          <video
            key={media.src}
            src={media.src}
            poster={media.poster}
            controls
            preload="none"
            className="w-64 shrink-0 snap-start border border-border bg-black sm:w-72"
          >
            <track kind="captions" />
          </video>
        ))}
      </div>
    </ScrollStrip>
  );
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
  const media = project.media ?? [];
  const allImages = media.filter((m) => m.type === "image");
  const videos = media.filter((m) => m.type === "video");

  // Pull a brand logo out of the gallery and feature it above, for visual
  // interest. Prefer a wordmark ("logotype"), else the first "logo" asset.
  const logo =
    allImages.find((m) => /logotype/i.test(m.src)) ??
    allImages.find((m) => /logo/i.test(m.src));
  const images = allImages.filter((m) => m !== logo);

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

      <div className="space-y-6 lg:col-span-2">
        {logo && (
          <div className="flex w-full items-center justify-center border border-border bg-neutral-900 px-6 py-8">
            <ImageWithFallback
              src={logo.src}
              alt={logo.alt ?? `${project.title} logo`}
              loading="lazy"
              decoding="async"
              className="h-14 w-auto max-w-full object-contain sm:h-16"
            />
          </div>
        )}

        {images.length > 0 && (
          <GalleryStrip project={project} images={images} onOpenImage={onOpenImage} />
        )}

        {videos.length > 0 && <VideoStrip videos={videos} />}
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

  // Rendered through a portal to <body> so it escapes the `main` element's
  // stacking context (z-10). Nested inside main, even z-[200] sat below the
  // fixed site header (z-50), which hid the close button under the menu.
  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-[200] bg-background"
      role="dialog"
      aria-modal="true"
      aria-label={`${project.title} gallery`}
    >
      {/* Full-viewport centering box with padding that reserves room for the
          floating controls: because this box has a definite height (inset-0),
          `max-h-full` on the image resolves correctly and nothing is clipped.
          Clicking the empty area closes. */}
      <div
        className="absolute inset-0 flex items-center justify-center px-4 py-16 sm:px-20"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <ImageWithFallback
          src={current.src}
          alt={current.alt ?? project.title}
          className="max-h-full max-w-full object-contain"
        />
      </div>

      {/* Controls float above the image and never affect its layout. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-4 p-3 sm:p-4">
        <span className="pointer-events-auto bg-background/80 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground sm:text-[11px]">
          {project.title} / {index + 1} of {images.length}
        </span>
        <button
          type="button"
          onClick={onClose}
          autoFocus
          className="pointer-events-auto inline-flex shrink-0 items-center gap-2 bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground shadow-lg transition-colors hover:bg-accent-hover"
        >
          <X className="h-4 w-4" />
          Close
        </button>
      </div>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => onStep(-1)}
            aria-label="Previous image"
            className="absolute left-2 top-1/2 -translate-y-1/2 border border-border bg-card/90 p-2 text-foreground shadow-md transition-colors hover:border-accent hover:text-accent sm:left-4"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => onStep(1)}
            aria-label="Next image"
            className="absolute right-2 top-1/2 -translate-y-1/2 border border-border bg-card/90 p-2 text-foreground shadow-md transition-colors hover:border-accent hover:text-accent sm:right-4"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {current.alt && (
        <p className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent px-5 pb-4 pt-8 text-center text-sm text-muted-foreground">
          {current.alt}
        </p>
      )}
    </motion.div>,
    document.body,
  );
}

export function WorkIndex() {
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<LightboxState>(null);
  const rowRefs = useRef<Record<string, HTMLLIElement | null>>({});

  // When a study opens, bring its row to the top of the viewport. Any other
  // open study collapses at the same time, so the scroll target keeps moving
  // during the animation; scrolling once the collapse has settled lands it
  // cleanly at the top. Respects reduced-motion by jumping instantly.
  useEffect(() => {
    if (!openSlug) return;
    const row = rowRefs.current[openSlug];
    if (!row) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scroll = () => row.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    const id = window.setTimeout(scroll, reduce ? 0 : 360);
    return () => window.clearTimeout(id);
  }, [openSlug]);

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
                ref={(el) => {
                  rowRefs.current[project.slug] = el;
                }}
                className="scroll-mt-20 border-b border-border first:border-t"
              >
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpenSlug(open ? null : project.slug)}
                  className="group grid w-full grid-cols-[2.6rem_1fr_auto] items-baseline gap-x-4 py-6 text-left transition-colors hover:bg-card md:grid-cols-[3rem_1fr_12rem_4rem_2rem]"
                >
                  <span className="font-mono text-[11px] tracking-[0.14em] text-accent">
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
                  <span className="hidden font-mono text-[10px] uppercase tracking-[0.14em] text-accent md:block">
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
