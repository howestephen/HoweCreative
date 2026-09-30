import { forwardRef, useCallback, useLayoutEffect, useRef, useState, type ImgHTMLAttributes } from "react";

import { imageVariants, neededWidth, srcSetFor } from "../lib/responsive-image";

type ResponsiveImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
  /** Extra magnification, such as pinch zoom, so the sharper copy loads. */
  zoom?: number;
};

/**
 * An image that offers the browser every pre-generated width of its source
 * and tells it how wide the image really renders. The box is measured after
 * layout, allowing for `object-fit`, so retina screens get enough pixels and
 * phones never download more than they show. Browsers only ever step up to a
 * larger copy, so resizing never re-downloads a smaller one.
 */
export const ResponsiveImage = forwardRef<HTMLImageElement, ResponsiveImageProps>(function ResponsiveImage(
  { src, zoom = 1, sizes: sizesHint, ...rest },
  forwardedRef,
) {
  const meta = imageVariants(src);
  const srcSet = srcSetFor(src);
  const local = useRef<HTMLImageElement | null>(null);
  const [measuredFor, setMeasuredFor] = useState<{ src: string; width: number } | null>(null);
  const measured = measuredFor?.src === src ? measuredFor.width : null;

  const setRef = useCallback(
    (node: HTMLImageElement | null) => {
      local.current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    [forwardedRef],
  );

  useLayoutEffect(() => {
    const node = local.current;
    if (!node || !meta) return;
    const measure = () => {
      // Layout size, before any transform; zoom is applied explicitly.
      const box = { width: node.offsetWidth, height: node.offsetHeight };
      if (!box.width) return;
      const fit = getComputedStyle(node).objectFit;
      const width = Math.ceil(neededWidth(box, meta, fit) * zoom);
      // Only ever grow for one source, so the browser never swaps back down.
      setMeasuredFor((current) =>
        current?.src === src && current.width >= width ? current : { src, width },
      );
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [meta, zoom, src]);

  if (!meta || !srcSet) return <img ref={setRef} src={src} sizes={sizesHint} {...rest} />;

  return (
    <img
      ref={setRef}
      src={src}
      srcSet={srcSet}
      sizes={measured !== null ? `${measured}px` : (sizesHint ?? "100vw")}
      {...rest}
    />
  );
});
