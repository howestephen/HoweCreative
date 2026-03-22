import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, ImageIcon, Play, Youtube } from "lucide-react";

import type { ProjectMediaItem } from "../data/portfolio";

// ── YouTube helpers ────────────────────────────────────────────────────────────

function extractYouTubeId(src: string): string {
  const watchMatch = src.match(/[?&]v=([^&#]+)/);
  if (watchMatch) return watchMatch[1];
  const shortMatch = src.match(/youtu\.be\/([^?&#]+)/);
  if (shortMatch) return shortMatch[1];
  return src; // assume bare ID
}

function youTubeThumbnail(src: string, quality: "default" | "hqdefault" = "hqdefault") {
  return `https://img.youtube.com/vi/${extractYouTubeId(src)}/${quality}.jpg`;
}

// ── Individual media renderers ─────────────────────────────────────────────────

function MediaItem({ item }: { item: ProjectMediaItem }) {
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
      className="h-full w-full object-cover"
      draggable={false}
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
          ? "border-[#ff003c] ring-1 ring-[#ff003c]/40"
          : "border-[#ff003c]/20 opacity-60 hover:border-[#ff003c]/50 hover:opacity-100"
      }`}
      aria-label={item.alt ?? item.type}
    >
      {item.type === "image" && (
        <img src={item.src} alt="" className="h-full w-full object-cover" />
      )}

      {item.type === "youtube" && (
        <>
          <img
            src={youTubeThumbnail(item.src, "default")}
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Youtube className="h-3.5 w-3.5 text-red-500" />
          </div>
        </>
      )}

      {item.type === "video" && (
        <>
          {item.poster ? (
            <img src={item.poster} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-zinc-900">
              <ImageIcon className="h-3 w-3 text-zinc-600" />
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <Play className="h-3.5 w-3.5 fill-white text-white" />
          </div>
        </>
      )}
    </button>
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

  return (
    <div className="flex flex-col gap-2">
      {/* ── Main viewer ── */}
      <div className="relative overflow-hidden border border-[#ff003c]/25 bg-black" style={{ height: 320 }}>
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
            <MediaItem item={current} />
            {/* colour overlay matching card gradient */}
            <div
              className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${gradient} opacity-20 mix-blend-screen`}
            />
          </motion.div>
        </AnimatePresence>

        {/* Prev arrow */}
        {multi && index > 0 && (
          <button
            onClick={() => go(index - 1)}
            className="absolute left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center border border-white/20 bg-black/65 text-white/70 transition-colors hover:border-white/50 hover:text-white"
            aria-label="Previous"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}

        {/* Next arrow */}
        {multi && index < items.length - 1 && (
          <button
            onClick={() => go(index + 1)}
            className="absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center border border-white/20 bg-black/65 text-white/70 transition-colors hover:border-white/50 hover:text-white"
            aria-label="Next"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}

        {/* Counter badge */}
        {multi && (
          <div className="absolute bottom-2 right-2 z-10 bg-black/65 px-2 py-0.5 font-mono text-[10px] text-zinc-400">
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
    </div>
  );
}
