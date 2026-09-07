/**
 * Generate gallery thumbnails for every case-study image.
 *
 * The originals are full-resolution posts and screenshots (often 1-2 MB each).
 * Loading two dozen of them into an expanded case study is painful on mobile,
 * so the gallery renders 480px JPEG thumbnails from a sibling `thumbs/` folder
 * and only fetches an original when the lightbox opens.
 *
 * Uses macOS `sips`, so there is no image-processing dependency to install.
 * Safe to re-run: existing thumbnails newer than their source are skipped.
 *
 *   node scripts/build-thumbs.mjs
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..", "public");
const MAX_EDGE = 480;
const SOURCE_EXT = new Set([".png", ".jpg", ".jpeg", ".webp"]);

let made = 0;
let skipped = 0;
let failed = 0;

// Walk every case-study directory recursively so nested folders (such as
// uncx-rebrand/website) get thumbnails too; the gallery derives thumb paths
// as `<dir>/thumbs/<name>.jpg` at any depth.
function walk(dir) {
  const entries = readdirSync(dir);

  const files = entries.filter(
    (name) => SOURCE_EXT.has(path.extname(name).toLowerCase()),
  );
  if (files.length > 0) {
    const thumbDir = path.join(dir, "thumbs");
    mkdirSync(thumbDir, { recursive: true });

    for (const file of files) {
      const source = path.join(dir, file);
      const target = path.join(thumbDir, `${path.parse(file).name}.jpg`);

      if (existsSync(target) && statSync(target).mtimeMs >= statSync(source).mtimeMs) {
        skipped += 1;
        continue;
      }

      try {
        execFileSync("sips", [
          "-s", "format", "jpeg",
          "-s", "formatOptions", "72",
          "-Z", String(MAX_EDGE),
          source,
          "--out", target,
        ], { stdio: "ignore" });
        made += 1;
      } catch {
        console.warn(`could not thumbnail: ${path.relative(ROOT, source)}`);
        failed += 1;
      }
    }
  }

  for (const name of entries) {
    if (name === "thumbs") continue;
    const child = path.join(dir, name);
    if (statSync(child).isDirectory()) walk(child);
  }
}

for (const folder of ["case-studies", "earlier-work"]) {
  const dir = path.join(ROOT, folder);
  if (existsSync(dir)) walk(dir);
}

console.log(`thumbnails written: ${made}, up to date: ${skipped}, failed: ${failed}`);
