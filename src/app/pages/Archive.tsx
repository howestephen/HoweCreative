import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { ArrowUpRight, Plus } from "lucide-react";

import earlierWork from "../data/earlier-work.json";
import { portfolioProjects, type ProjectMediaItem } from "../data/portfolio";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Lightbox } from "../concept/WorkIndex";
import { ContactFoot } from "../concept/ContactFoot";

// A discipline line per study, so the index reads across practices.
const DISCIPLINES: Record<string, string> = {
  quiver: "Creative direction / Film and motion / AI production",
  "solana-diary": "Brand systems / Code and systems / AI production",
  "uncx-menu": "Product design / Brand systems",
  "uncx-rebrand": "Creative direction / Brand systems",
  "badger-club": "Product design / Code and systems",
  "uncx-video-system": "Film and motion / Brand systems",
  "uncx-academy": "Product design / Film and motion",
  "noticia-lingo": "Product design / Code and systems",
  "uncx-app-concepts": "Product design / Prototyping",
  "ai-portfolio-system": "Creative direction / AI production",
};

const PROFILE = [
  ["Direct the idea", "Turn an open brief into a visual language, a narrative and a clear standard for the work."],
  ["Prototype the experience", "Use Figma, motion and interactive code to make decisions tangible before a full build."],
  ["Build the system", "Connect interfaces, data, APIs and reusable components so the idea can operate repeatedly."],
  ["Finish the output", "Produce the film, graphics, sound and final interaction with the craft needed to publish it."],
] as const;

type Viewer = { title: string; images: ProjectMediaItem[]; index: number } | null;

const eyebrow = "font-mono text-[10px] uppercase tracking-[0.18em]";

function Thumbs({ title, images, onOpen }: { title: string; images: ProjectMediaItem[]; onOpen: (index: number) => void }) {
  return (
    <div className="grid grid-cols-3 content-start items-start gap-1.5 self-start sm:grid-cols-4 lg:grid-cols-6">
      {images.map((media, index) => (
        <button
          key={media.src}
          type="button"
          onClick={() => onOpen(index)}
          aria-label={`View larger: ${media.alt ?? title}`}
          className="group/thumb block border border-border bg-card transition-colors hover:border-accent"
        >
          <ImageWithFallback
            src={media.src}
            alt={media.alt ?? title}
            loading="lazy"
            decoding="async"
            className="aspect-square w-full object-cover transition-opacity group-hover/thumb:opacity-85"
          />
        </button>
      ))}
    </div>
  );
}

function Row({ year, title, disciplines, children }: { year: string; title: string; disciplines: string; children: React.ReactNode }) {
  return (
    <details className="group/row border-t border-border last:border-b">
      <summary className="group/summary grid cursor-pointer list-none grid-cols-[4.5rem_minmax(0,1fr)_auto] items-baseline gap-x-4 gap-y-1 py-5 sm:grid-cols-[6rem_minmax(0,1fr)_minmax(0,1.2fr)_auto] [&::-webkit-details-marker]:hidden">
        <span className={`${eyebrow} text-muted-foreground`}>{year}</span>
        <h3 className="text-lg leading-snug text-foreground transition-colors group-hover/summary:text-accent sm:text-xl">{title}</h3>
        <span className="col-start-2 text-sm text-muted-foreground sm:col-start-auto">{disciplines}</span>
        <Plus
          aria-hidden="true"
          className="col-start-3 row-start-1 h-4 w-4 text-muted-foreground transition-transform group-open/row:rotate-45 sm:col-start-4"
        />
      </summary>
      <div className="grid gap-6 pb-8 sm:pl-[7rem] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">{children}</div>
    </details>
  );
}

export function Archive() {
  const [viewer, setViewer] = useState<Viewer>(null);
  // The thumbnail that opened the viewer, so focus returns to it on close.
  const opener = useRef<HTMLElement | null>(null);
  const open = useCallback((title: string, images: ProjectMediaItem[], index: number) => {
    opener.current = document.activeElement as HTMLElement | null;
    setViewer({ title, images, index });
  }, []);

  useEffect(() => {
    const previous = document.title;
    document.title = "Work archive - Stephen Howe";
    window.scrollTo(0, 0);
    return () => {
      document.title = previous;
    };
  }, []);

  // The viewer covers the page, so hold the page still behind it. iOS Safari
  // ignores overflow on body alone, so the root element is locked as well.
  const isOpen = viewer !== null;
  useEffect(() => {
    if (!isOpen) return;
    const root = document.documentElement;
    const previous = [root.style.overflow, document.body.style.overflow];
    root.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      [root.style.overflow, document.body.style.overflow] = previous;
    };
  }, [isOpen]);

  const close = useCallback(() => {
    setViewer(null);
    opener.current?.focus();
  }, []);
  const step = useCallback(
    (delta: number) =>
      setViewer((v) => (v ? { ...v, index: (v.index + delta + v.images.length) % v.images.length } : v)),
    [],
  );

  return (
    <div className="w-full">
      <header className="mx-auto max-w-6xl px-6 pb-14 pt-32 md:pb-20 md:pt-40">
        <p className={`${eyebrow} mb-4 text-accent`}>Archive · Selected and earlier work</p>
        <h1 className="max-w-3xl text-4xl leading-tight md:text-6xl">
          Different disciplines.
          <br />
          One working practice.
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
          Art direction, product design, moving image and code. Every project here, current and earlier, with the
          detail one level down.
        </p>
      </header>

      <section aria-labelledby="current-title" className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <div className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
            <h2 id="current-title" className="text-3xl md:text-4xl">
              Current work
            </h2>
            <span className={`${eyebrow} text-muted-foreground`}>2021 to now · {portfolioProjects.length} projects</span>
          </div>
          {portfolioProjects.map((project) => {
            // Stills only: the films belong in the case study.
            const stills = (project.media ?? []).filter((m) => m.type === "image").slice(0, 6);
            return (
              <Row key={project.slug} year={project.year} title={project.title} disciplines={DISCIPLINES[project.slug] ?? ""}>
                <div className="space-y-3">
                  <p className="text-sm leading-relaxed text-foreground/90">{project.fullDescription}</p>
                  <p className={`${eyebrow} text-muted-foreground`}>
                    {project.role} / {project.client} / {project.status}
                  </p>
                  <Link
                    to={`/?study=${project.slug}`}
                    // Marked as opened from a list, so closing the study returns here.
                    state={{ studyFromGrid: true }}
                    className={`${eyebrow} inline-flex items-center gap-1.5 text-foreground transition-colors hover:text-accent`}
                  >
                    Read the full case study <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
                {stills.length > 0 && (
                  <Thumbs
                    title={project.title}
                    images={stills}
                    onOpen={(index) => open(project.title, stills, index)}
                  />
                )}
              </Row>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="profile-title" className="border-t border-border bg-card/60">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <p className={`${eyebrow} mb-3 text-accent`}>How the disciplines connect</p>
          <h2 id="profile-title" className="mb-10 max-w-2xl text-3xl md:text-4xl">
            The value is in the handover between skills.
          </h2>
          <div className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {PROFILE.map(([title, body]) => (
              <article key={title} className="bg-background p-5">
                <h3 className="mb-2 text-lg">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="earlier-title" className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
            <h2 id="earlier-title" className="text-3xl md:text-4xl">
              Earlier work
            </h2>
            <span className={`${eyebrow} text-muted-foreground`}>2009 to 2018</span>
          </div>
          <p className="mb-8 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Music, culture, hospitality and the early web, shown with its original context and credits.
          </p>
          {earlierWork.map((entry) => {
            const media = entry.media as ProjectMediaItem[];
            const images = media.filter((m) => m.type === "image");
            const videos = media.filter((m) => m.type === "video");
            return (
              <Row key={entry.slug} year={entry.era} title={entry.title} disciplines={entry.disciplines}>
                <div className="space-y-3">
                  <p className="text-sm leading-relaxed text-foreground/90">{entry.summary}</p>
                  <p className={`${eyebrow} text-muted-foreground`}>{entry.credit}</p>
                </div>
                <div className="space-y-3 self-start">
                  {videos.map((video) => (
                    <video
                      key={video.src}
                      src={video.src}
                      poster={video.poster}
                      controls
                      playsInline
                      preload="none"
                      aria-label={video.alt ?? entry.title}
                      className="aspect-video w-full border border-border bg-black"
                    />
                  ))}
                  {images.length > 0 && (
                    <Thumbs
                      title={entry.title}
                      images={images}
                      onOpen={(index) => open(entry.title, images, index)}
                    />
                  )}
                </div>
              </Row>
            );
          })}
        </div>
      </section>

      <ContactFoot />

      {viewer && (
        <Lightbox title={viewer.title} images={viewer.images} index={viewer.index} onClose={close} onStep={step} />
      )}
    </div>
  );
}
