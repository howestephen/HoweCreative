/**
 * Generate responsive WebP variants for every case-study and Earlier Work image.
 *
 * Each image gets smaller copies in a sibling `thumbs/` folder, named
 * `<name>-<width>.webp`, at the standard widths below that are narrower than
 * the original. `src/app/data/image-variants.json` records each image's size
 * and variants, so components can offer the browser a `srcset`: phones fetch a
 * small copy and retina screens get enough pixels to stay sharp. The original
 * file is always the largest candidate.
 *
 * Safe to re-run: variants newer than their source are skipped, and variants
 * whose source has gone are removed.
 *
 *   node scripts/build-thumbs.mjs
 */
import { existsSync, mkdirSync, readdirSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const PUBLIC = path.resolve(import.meta.dirname, "..", "public");
const MANIFEST = path.resolve(import.meta.dirname, "..", "src", "app", "data", "image-variants.json");
const WIDTHS = [480, 960, 1440, 1920, 2560];
const SOURCE_EXT = new Set([".png", ".jpg", ".jpeg", ".webp"]);
// A variant within 10% of the original's width adds weight without detail.
const MIN_STEP = 0.9;

const manifest = {};
let made = 0;
let skipped = 0;
let removed = 0;

async function walk(dir) {
  const entries = readdirSync(dir).sort();
  const files = entries.filter((name) => SOURCE_EXT.has(path.extname(name).toLowerCase()));
  const thumbDir = path.join(dir, "thumbs");
  const expected = new Set();

  for (const file of files) {
    const source = path.join(dir, file);
    const { width, height } = await sharp(source).metadata();
    const name = path.parse(file).name;
    const widths = WIDTHS.filter((w) => w < width * MIN_STEP);

    for (const w of widths) {
      const target = path.join(thumbDir, `${name}-${w}.webp`);
      expected.add(target);
      if (existsSync(target) && statSync(target).mtimeMs >= statSync(source).mtimeMs) {
        skipped += 1;
        continue;
      }
      mkdirSync(thumbDir, { recursive: true });
      await sharp(source).resize({ width: w }).webp({ quality: 82, effort: 5 }).toFile(target);
      made += 1;
    }

    const url = "/" + path.relative(PUBLIC, source).split(path.sep).join("/");
    manifest[url] = { w: width, h: height, v: widths };
  }

  if (existsSync(thumbDir)) {
    for (const old of readdirSync(thumbDir)) {
      const full = path.join(thumbDir, old);
      if (old.endsWith(".webp") && !expected.has(full)) {
        unlinkSync(full);
        removed += 1;
      }
    }
  }

  for (const name of entries) {
    if (name === "thumbs") continue;
    const child = path.join(dir, name);
    if (statSync(child).isDirectory()) await walk(child);
  }
}

for (const folder of ["case-studies", "earlier-work"]) {
  const dir = path.join(PUBLIC, folder);
  if (existsSync(dir)) await walk(dir);
}

const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(MANIFEST, JSON.stringify(sorted, null, 0).replace(/},"/g, '},\n"') + "\n");
console.log(`variants written: ${made}, up to date: ${skipped}, removed: ${removed}, images: ${Object.keys(sorted).length}`);
