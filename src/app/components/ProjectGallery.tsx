import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { ProjectMediaItem } from "../data/portfolio";

export function thumbnail(src: string) {
  const slash = src.lastIndexOf("/");
  const dot = src.lastIndexOf(".");
  return `${src.slice(0, slash)}/thumbs/${src.slice(slash + 1, dot)}.jpg`;
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
        <img src={images[index].src} alt={images[index].alt ?? title} />
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
  const close = () => {
    setSelected(null);
    trigger.current?.focus();
  };
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
                <img
                  src={thumbnail(item.src)}
                  alt={item.alt ?? title}
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
