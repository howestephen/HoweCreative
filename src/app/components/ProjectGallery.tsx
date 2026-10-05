import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { ProjectMediaItem } from "../data/portfolio";
import { ResponsiveImage } from "./ResponsiveImage";

const MAX_ZOOM = 4;

/** An image the viewer can pinch to zoom (up to 4x), pan while zoomed and
 *  double-tap to toggle, using a CSS transform instead of page zoom. */
function ZoomableImage({ src, alt }: { src: string; alt: string }) {
  const [view, setView] = useState({ scale: 1, x: 0, y: 0 });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ distance: number; scale: number } | null>(null);
  const lastTap = useRef(0);

  // iOS Safari fires its own gesture events for pinch; cancel them so the page
  // never zooms while the viewer is open.
  useEffect(() => {
    const block = (e: Event) => e.preventDefault();
    document.addEventListener("gesturestart", block);
    document.addEventListener("gesturechange", block);
    return () => {
      document.removeEventListener("gesturestart", block);
      document.removeEventListener("gesturechange", block);
    };
  }, []);

  const distance = () => {
    const [a, b] = [...pointers.current.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  };

  return (
    <ResponsiveImage
      src={src}
      alt={alt}
      zoom={view.scale}
      draggable={false}
      style={{
        transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
        touchAction: "none",
        userSelect: "none",
      }}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture?.(e.pointerId);
        pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (pointers.current.size === 2) pinch.current = { distance: distance(), scale: view.scale };
      }}
      onPointerMove={(e) => {
        const previous = pointers.current.get(e.pointerId);
        if (!previous) return;
        pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (pointers.current.size === 2 && pinch.current) {
          const scale = Math.min(MAX_ZOOM, Math.max(1, (pinch.current.scale * distance()) / pinch.current.distance));
          setView((v) => (scale === 1 ? { scale: 1, x: 0, y: 0 } : { ...v, scale }));
        } else if (pointers.current.size === 1 && view.scale > 1) {
          setView((v) => ({ ...v, x: v.x + e.clientX - previous.x, y: v.y + e.clientY - previous.y }));
        }
      }}
      onPointerUp={(e) => {
        pointers.current.delete(e.pointerId);
        if (pointers.current.size < 2) pinch.current = null;
        if (e.pointerType === "touch" && pointers.current.size === 0) {
          const now = Date.now();
          if (now - lastTap.current < 300) setView((v) => (v.scale > 1 ? { scale: 1, x: 0, y: 0 } : { scale: 2.5, x: 0, y: 0 }));
          lastTap.current = now;
        }
      }}
      onPointerCancel={(e) => {
        pointers.current.delete(e.pointerId);
        pinch.current = null;
      }}
    />
  );
}

function ImageDialog({
  images,
  index,
  title,
  onClose,
  onStep,
}: {
  images: ProjectMediaItem[];
  index: number;
  title: string;
  onClose: () => void;
  onStep: (delta: number) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const node = dialog.current;
    const previousOverflow = document.body.style.overflow;
    node?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      node?.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      className="image-dialog"
      // Page pinch-zoom over a full-screen image exhausted memory on iPhones;
      // ZoomableImage zooms the image alone.
      style={{ touchAction: "none" }}
      aria-label={`${title} gallery`}
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") {
          event.preventDefault();
          onStep(1);
        }
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          onStep(-1);
        }
      }}
    >
      <div className="dialog-toolbar">
        <span aria-live="polite">
          {title} / {index + 1} of {images.length}
        </span>
        <button type="button" onClick={onClose} autoFocus>
          <X size={20} /> Close
        </button>
      </div>
      <div className="dialog-image">
        <ZoomableImage key={images[index].src} src={images[index].src} alt={images[index].alt ?? title} />
      </div>
      <div className="dialog-footer">
        <button
          type="button"
          onClick={() => onStep(-1)}
          disabled={images.length < 2}
          aria-label="Previous image"
        >
          <ChevronLeft />
        </button>
        <p>{images[index].alt ?? title}</p>
        <button
          type="button"
          onClick={() => onStep(1)}
          disabled={images.length < 2}
          aria-label="Next image"
        >
          <ChevronRight />
        </button>
      </div>
    </dialog>
  );
}

export function ProjectGallery({
  media,
  title,
}: {
  media: ProjectMediaItem[];
  title: string;
}) {
  // A route can replace the collection without unmounting ProjectGallery.
  // Reset the dialog and media elements together so an open image cannot carry
  // its index or scroll lock into another project's collection.
  return (
    <GalleryContent
      key={JSON.stringify([title, media])}
      media={media}
      title={title}
    />
  );
}

function GalleryContent({
  media,
  title,
}: {
  media: ProjectMediaItem[];
  title: string;
}) {
  const images = media.filter((item) => item.type === "image");
  const videos = media.filter((item) => item.type === "video");
  const [selected, setSelected] = useState<number | null>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const restoreFocus = useRef(false);
  const close = () => {
    restoreFocus.current = true;
    setSelected(null);
  };
  // Focus the thumbnail only after the dialog's own cleanup has called
  // close(); focusing earlier lets the browser's close steps drop focus.
  useEffect(() => {
    if (selected !== null || !restoreFocus.current) return;
    restoreFocus.current = false;
    trigger.current?.focus();
  }, [selected]);
  return (
    <div className="project-gallery">
      {videos.length > 0 && (
        <div className="video-grid">
          {videos.map((video) => (
            <figure key={video.src}>
              <video
                src={video.src}
                controls
                preload="none"
                playsInline
                poster={video.poster}
                aria-label={video.alt ?? title}
              />
              <figcaption>{video.alt ?? title}</figcaption>
            </figure>
          ))}
        </div>
      )}
      {images.length > 0 && (
        <>
          <div className="gallery-heading">
            <h2>Inside the work</h2>
            <span className="eyebrow">{images.length} images</span>
          </div>
          <div className="gallery-grid">
            {images.map((item, index) => (
              <button
                type="button"
                key={item.src}
                onClick={(event) => {
                  trigger.current = event.currentTarget;
                  setSelected(index);
                }}
                aria-label={`View larger: ${item.alt ?? title}`}
              >
                <ResponsiveImage
                  src={item.src}
                  // The button's label and the visible caption already name it.
                  alt=""
                  loading="lazy"
                  decoding="async"
                  width="480"
                  height="360"
                />
                <span>{item.alt ?? title}</span>
              </button>
            ))}
          </div>
        </>
      )}
      {selected !== null && (
        <ImageDialog
          title={title}
          images={images}
          index={selected}
          onClose={close}
          onStep={(delta) =>
            setSelected((index) =>
              index === null
                ? null
                : (index + delta + images.length) % images.length,
            )
          }
        />
      )}
    </div>
  );
}
