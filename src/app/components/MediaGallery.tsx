import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Maximize2,
  Minus,
  Play,
  Plus,
  RotateCcw,
  X,
  Youtube,
} from "lucide-react";
import { createPortal } from "react-dom";

import type { ProjectMediaItem } from "../data/portfolio";

// ── YouTube helpers ────────────────────────────────────────────────────────────

function extractYouTubeId(src: string): string {
  const watchMatch = src.match(/[?&]v=([^&#]+)/);
  if (watchMatch) return watchMatch[1];
  const shortMatch = src.match(/youtu\.be\/([^?&#]+)/);
  if (shortMatch) return shortMatch[1];
  return src;
}

function youTubeThumbnail(src: string, quality: "default" | "hqdefault" = "hqdefault") {
  return `https://img.youtube.com/vi/${extractYouTubeId(src)}/${quality}.jpg`;
}

// ── Individual media renderers ─────────────────────────────────────────────────

function MediaItem({ item, contain }: { item: ProjectMediaItem; contain?: boolean }) {
  if (item.type === "youtube") {
    const id = extractYouTubeId(item.src);
    return (
      <iframe
        key={id}
        src={`https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`}
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title={item.alt ?? "Video"}
      />
    );
  }

  if (item.type === "video") {
    return (
      <video
        key={item.src}
        src={item.src}
        poster={item.poster}
        controls
        className="h-full w-full bg-black object-contain"
      />
    );
  }

  return (
    <img
      src={item.src}
      alt={item.alt ?? ""}
      className={`h-full w-full ${contain ? "object-contain" : "object-contain"}`}
      draggable={false}
      loading="eager"
      decoding="async"
    />
  );
}

// ── Thumbnail strip item ───────────────────────────────────────────────────────

function Thumbnail({
  item,
  active,
  onClick,
}: {
  item: ProjectMediaItem;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative h-11 w-16 shrink-0 overflow-hidden border transition-all ${
        active
          ? "border-accent ring-1 ring-ring/40"
          : "border-accent/32 opacity-60 hover:border-accent/50 hover:opacity-100"
      }`}
      aria-label={item.alt ?? item.type}
    >
      {item.type === "image" && (
        <img src={item.src} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
      )}

      {item.type === "youtube" && (
        <>
          <img
            src={youTubeThumbnail(item.src, "default")}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/95">
            <Youtube className="h-3.5 w-3.5 text-red-500" />
          </div>
        </>
      )}

      {item.type === "video" && (
        <>
          {item.poster ? (
            <img src={item.poster} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <ImageIcon className="h-3 w-3 text-muted-foreground/80" />
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/95">
            <Play className="h-3.5 w-3.5 fill-white text-white" />
          </div>
        </>
      )}
    </button>
  );
}

// ── Zoom levels ───────────────────────────────────────────────────────────────

const ZOOM_LEVELS = [1, 1.5, 2, 3] as const;

// ── Fullscreen lightbox ──────────────────────────────────────────────────────

function Lightbox({
  items,
  initialIndex,
  onClose,
}: {
  items: ProjectMediaItem[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);

  const current = items[index];
  const multi = items.length > 1;

  const resetZoom = useCallback(() => {
    setZoom(1);
    if (scrollRef.current) {
      scrollRef.current.scrollTo(0, 0);
    }
  }, []);

  const go = useCallback(
    (next: number) => {
      if (next < 0 || next >= items.length) return;
      setIndex(next);
      resetZoom();
    },
    [items.length, resetZoom],
  );

  const zoomIn = useCallback(() => {
    setZoom((z) => {
      const idx = ZOOM_LEVELS.indexOf(z as (typeof ZOOM_LEVELS)[number]);
      return idx < ZOOM_LEVELS.length - 1 ? ZOOM_LEVELS[idx + 1] : z;
    });
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((z) => {
      const idx = ZOOM_LEVELS.indexOf(z as (typeof ZOOM_LEVELS)[number]);
      return idx > 0 ? ZOOM_LEVELS[idx - 1] : z;
    });
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          if (zoom > 1) resetZoom();
          else onClose();
          break;
        case "ArrowLeft":
          e.preventDefault();
          go(index - 1);
          break;
        case "ArrowRight":
          e.preventDefault();
          go(index + 1);
          break;
        case "+":
        case "=":
          e.preventDefault();
          zoomIn();
          break;
        case "-":
          e.preventDefault();
          zoomOut();
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, go, index, zoom, resetZoom, zoomIn, zoomOut]);

  // Mouse wheel zoom
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        if (e.deltaY < 0) zoomIn();
        else zoomOut();
      }
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [zoomIn, zoomOut]);

  const isImage = current.type === "image";

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[300] flex flex-col bg-black/95 backdrop-blur-md"
      onClick={onClose}
    >
      {/* ── Top toolbar ── */}
      <div
        className="relative z-20 flex items-center justify-between border-b border-accent/32 px-4 py-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          <span className="text-foreground/85">{current.alt || `Image ${index + 1}`}</span>
          {multi && (
            <span className="text-accent">
              {index + 1} / {items.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Zoom controls - only for images */}
          {isImage && (
            <>
              <button
                onClick={zoomOut}
                disabled={zoom <= ZOOM_LEVELS[0]}
                className="flex h-8 w-8 items-center justify-center border border-accent/32 bg-card/80 text-muted-foreground transition-colors hover:border-accent/50 hover:text-foreground disabled:opacity-30 disabled:hover:border-accent/32 disabled:hover:text-muted-foreground"
                aria-label="Zoom out"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <div className="flex h-8 min-w-[52px] items-center justify-center border border-accent/32 bg-card/80 px-2 font-mono text-[10px] text-muted-foreground">
                {Math.round(zoom * 100)}%
              </div>
              <button
                onClick={zoomIn}
                disabled={zoom >= ZOOM_LEVELS[ZOOM_LEVELS.length - 1]}
                className="flex h-8 w-8 items-center justify-center border border-accent/32 bg-card/80 text-muted-foreground transition-colors hover:border-accent/50 hover:text-foreground disabled:opacity-30 disabled:hover:border-accent/32 disabled:hover:text-muted-foreground"
                aria-label="Zoom in"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
              {zoom > 1 && (
                <button
                  onClick={resetZoom}
                  className="ml-1 flex h-8 w-8 items-center justify-center border border-accent/32 bg-card/80 text-muted-foreground transition-colors hover:border-accent/50 hover:text-foreground"
                  aria-label="Reset zoom"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              )}
            </>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="ml-2 flex h-8 w-8 items-center justify-center border border-accent/38 bg-card/80 text-foreground/85 transition-colors hover:border-accent hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Main content area ── */}
      <div className="relative flex min-h-0 flex-1" onClick={(e) => e.stopPropagation()}>
        {/* Prev button */}
        {multi && index > 0 && (
          <button
            onClick={() => go(index - 1)}
            className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-accent/30 bg-card/90 text-muted-foreground transition-colors hover:border-accent hover:text-foreground"
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        {/* Image/video display */}
        <div
          ref={scrollRef}
          className={`flex flex-1 items-center justify-center ${zoom > 1 ? "cursor-grab overflow-auto active:cursor-grabbing" : "overflow-hidden"}`}
        >
          {isImage ? (
            <img
              src={current.src}
              alt={current.alt ?? ""}
              draggable={false}
              loading="eager"
              decoding="async"
              className="max-h-full max-w-full select-none transition-transform duration-200"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: zoom > 1 ? "top left" : "center",
                ...(zoom > 1
                  ? { maxHeight: "none", maxWidth: "none", width: "100%", height: "auto" }
                  : {}),
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <div className="aspect-video w-full max-w-5xl">
                <MediaItem item={current} contain />
              </div>
            </div>
          )}
        </div>

        {/* Next button */}
        {multi && index < items.length - 1 && (
          <button
            onClick={() => go(index + 1)}
            className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-accent/30 bg-card/90 text-muted-foreground transition-colors hover:border-accent hover:text-foreground"
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* ── Bottom thumbnail strip ── */}
      {multi && (
        <div
          className="relative z-20 border-t border-accent/32 px-4 py-2"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-center gap-1.5 overflow-x-auto">
            {items.map((item, i) => (
              <Thumbnail key={i} item={item} active={i === index} onClick={() => go(i)} />
            ))}
          </div>
        </div>
      )}
    </motion.div>,
    document.body,
  );
}

// ── Main gallery component ─────────────────────────────────────────────────────

export function MediaGallery({
  items,
  gradient,
}: {
  items: ProjectMediaItem[];
  gradient: string;
}) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const go = useCallback(
    (next: number) => {
      if (next < 0 || next >= items.length) return;
      setDirection(next > index ? 1 : -1);
      setIndex(next);
    },
    [index, items.length],
  );

  if (items.length === 0) return null;

  const current = items[index];
  const multi = items.length > 1;
  const isClickable = current.type === "image";

  return (
    <div className="flex flex-col gap-2">
      {/* ── Main viewer - 16:9 aspect ratio ── */}
      <div
        className={`group relative overflow-hidden border border-accent/38 bg-black ${isClickable ? "cursor-pointer" : ""}`}
        style={{ aspectRatio: "16 / 9" }}
        onClick={isClickable ? () => setLightboxOpen(true) : undefined}
      >
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={index}
            custom={direction}
            initial={{ opacity: 0, x: direction * 48 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -48 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute inset-0"
            drag={multi && current.type !== "video" && current.type !== "youtube" ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.18}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60) go(index + 1);
              else if (info.offset.x > 60) go(index - 1);
            }}
          >
            <MediaItem item={current} contain />
            {/* colour overlay matching card gradient */}
            <div
              className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${gradient} opacity-20 mix-blend-screen`}
            />
          </motion.div>
        </AnimatePresence>

        {/* Fullscreen hint */}
        {isClickable && (
          <div className="pointer-events-none absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center border border-foreground/15 bg-card/80 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
            <Maximize2 className="h-3.5 w-3.5" />
          </div>
        )}

        {/* Prev arrow */}
        {multi && index > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              go(index - 1);
            }}
            className="absolute left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center border border-foreground/20 bg-card/95 text-foreground/70 transition-colors hover:border-foreground/50 hover:text-foreground"
            aria-label="Previous"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}

        {/* Next arrow */}
        {multi && index < items.length - 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              go(index + 1);
            }}
            className="absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center border border-foreground/20 bg-card/95 text-foreground/70 transition-colors hover:border-foreground/50 hover:text-foreground"
            aria-label="Next"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}

        {/* Counter badge */}
        {multi && (
          <div className="absolute bottom-2 right-2 z-10 bg-card/95 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
            {index + 1} / {items.length}
          </div>
        )}
      </div>

      {/* ── Thumbnail strip ── */}
      {multi && (
        <div className="flex gap-1.5 overflow-x-auto">
          {items.map((item, i) => (
            <Thumbnail key={i} item={item} active={i === index} onClick={() => go(i)} />
          ))}
        </div>
      )}

      {/* ── Fullscreen lightbox ── */}
      <AnimatePresence>
        {lightboxOpen && (
          <Lightbox
            items={items}
            initialIndex={index}
            onClose={() => setLightboxOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
