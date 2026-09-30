import variants from "../data/image-variants.json";

/** Size and pre-generated widths of one image, from scripts/build-thumbs.mjs. */
export type ImageVariants = { w: number; h: number; v: number[] };

const table = variants as Record<string, ImageVariants>;

export function imageVariants(src: string): ImageVariants | undefined {
  const path = src.split(/[?#]/)[0];
  return table[path] ?? table[safeDecode(path)];
}

function safeDecode(value: string) {
  try {
    return decodeURI(value);
  } catch {
    return value;
  }
}

/** URL of the `width`-wide copy of `src` in its sibling `thumbs/` folder. */
export function variantUrl(src: string, width: number) {
  const slash = src.lastIndexOf("/");
  const dot = src.lastIndexOf(".");
  return `${src.slice(0, slash)}/thumbs/${src.slice(slash + 1, dot)}-${width}.webp`;
}

// srcset separates candidates with spaces and commas, so file names that
// contain them must be escaped.
const escapeUrl = (url: string) => encodeURI(safeDecode(url)).replace(/,/g, "%2C");

/** Every copy of `src` as a `srcset`, the original last as the widest. */
export function srcSetFor(src: string): string | undefined {
  const meta = imageVariants(src);
  if (!meta) return undefined;
  return [...meta.v.map((w) => `${escapeUrl(variantUrl(src, w))} ${w}w`), `${escapeUrl(src)} ${meta.w}w`].join(
    ", ",
  );
}

/**
 * CSS pixels of image width needed to fill a box, given how the image is
 * fitted. `cover` crops, so a wide image in a tall box needs more than the
 * box width; `contain` and the rest never need more than the box.
 */
export function neededWidth(
  box: { width: number; height: number },
  image: { w: number; h: number },
  fit: string,
) {
  const aspect = image.w / image.h;
  if (!box.height) return box.width;
  if (fit === "cover") return Math.max(box.width, box.height * aspect);
  return Math.min(box.width, box.height * aspect);
}
