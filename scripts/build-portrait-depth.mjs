#!/usr/bin/env node
// Builds a per-pixel depth map for the homepage particle portrait and packs
// it beside the colour crop in a single PNG: public/portrait/portrait-source.png.
//
// What it does:
// 1. Loads docs/reviews/2026-09-07-design-reset/portrait-reference.png and
//    crops it to PORTRAIT_CROP below, which must match PORTRAIT_CROP in
//    src/app/experience/portrait-particles.ts.
// 2. Upscales the crop so its long side is at least 1036px, then runs
//    monocular depth estimation on it with @huggingface/transformers
//    (Depth Anything V2, small variant, ONNX, CPU).
// 3. Resizes the predicted depth back down to the crop's native 700x650
//    with bilinear filtering, then normalises it to 0..255 using the 1st and
//    99th percentiles of the raw depth, computed only over pixels whose crop
//    luma is >= BACKGROUND_LUMA_THRESHOLD (that threshold only ever chooses
//    which pixels contribute to the percentile range; it never removes or
//    zeroes an output pixel). The convention is 255 = nearest the camera.
//    This is verified rather than assumed: mean depth is sampled in a box on
//    the nose/cheek and a box on the hair at the back of the head, and the
//    map is inverted if the nose does not come out nearer.
// 4. Every pixel of the crop gets a written depth value; there is no
//    background masking of the depth channel itself. A small Gaussian blur
//    (sigma about 1.5px at 700x650) is applied to the depth channel to stop
//    per-pixel model noise turning into z jitter, then
//    public/portrait/portrait-source.png is written: 1400x650, 8-bit RGB,
//    no alpha. Left half (700x650) is the crop's colour pixels unchanged;
//    right half (700x650) is the depth as grey (R=G=B=depth).
// 5. Copies the same image to a review sheet under the OS temp directory
//    (printed at the end) for a human to check.
//
// Re-run with: node scripts/build-portrait-depth.mjs
// (or: npm run build:portrait-depth)
//
// Written in British English. No em-dashes or en-dashes, plain hyphens only.

import { pipeline, RawImage } from '@huggingface/transformers';
import sharp from 'sharp';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

const SOURCE_IMAGE = path.join(
  REPO_ROOT,
  'docs/reviews/2026-09-07-design-reset/portrait-reference.png',
);
const OUTPUT_IMAGE = path.join(REPO_ROOT, 'public/portrait/portrait-source.png');
const WORK_DIR = path.join(os.tmpdir(), 'howe-portrait-depth');
const REVIEW_SHEET = path.join(WORK_DIR, 'depth-review.png');

// Must match PORTRAIT_CROP in src/app/experience/portrait-particles.ts.
const CROP = { x: 440, y: 8, width: 700, height: 650 };

// Rec.709 luma, 0..1. Pixels below this are treated as background.
const BACKGROUND_LUMA_THRESHOLD = 0.027;

// Upscale target (long side, px) fed to the model so facial relief resolves.
const MIN_LONG_SIDE = 1036;

// Percentile range used to normalise raw depth to 0..255.
const LOW_PERCENTILE = 1;
const HIGH_PERCENTILE = 99;

// Gaussian blur applied to the depth channel before writing, in px, at the
// crop's native 700x650 resolution.
const DEPTH_BLUR_SIGMA = 1.5;

// Verification boxes, in crop-local pixel coordinates (0..700, 0..650).
// Nose/cheek: the most forward-facing point on this right-facing profile.
const NOSE_BOX = { x: 560, y: 260, width: 90, height: 110 };
// Hair at the top/back of the head: the furthest-back point in this crop.
const HAIR_BOX = { x: 360, y: 15, width: 120, height: 80 };

// Depth Anything V2, small. There is deliberately no fallback: an older
// model loading silently would make the documented provenance false.
const MODEL_ID = 'onnx-community/depth-anything-v2-small';

function luma(r, g, b) {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

async function loadDepthEstimator() {
  console.log(`Loading depth-estimation pipeline: ${MODEL_ID} ...`);
  const estimator = await pipeline('depth-estimation', MODEL_ID, {
    dtype: 'fp32',
    device: 'cpu',
  });
  console.log(`Loaded ${MODEL_ID}.`);
  return { estimator, modelId: MODEL_ID };
}

// Manual bilinear resize of a single-channel float map. This keeps full
// float precision through the resize; sharp's raw pixel pipeline only
// carries integer sample formats, and normalisation happens afterwards.
function resizeBilinear(src, srcWidth, srcHeight, dstWidth, dstHeight) {
  const dst = new Float32Array(dstWidth * dstHeight);
  const xRatio = (srcWidth - 1) / (dstWidth - 1 || 1);
  const yRatio = (srcHeight - 1) / (dstHeight - 1 || 1);
  for (let y = 0; y < dstHeight; y++) {
    const sy = y * yRatio;
    const y0 = Math.floor(sy);
    const y1 = Math.min(y0 + 1, srcHeight - 1);
    const fy = sy - y0;
    for (let x = 0; x < dstWidth; x++) {
      const sx = x * xRatio;
      const x0 = Math.floor(sx);
      const x1 = Math.min(x0 + 1, srcWidth - 1);
      const fx = sx - x0;
      const v00 = src[y0 * srcWidth + x0];
      const v01 = src[y0 * srcWidth + x1];
      const v10 = src[y1 * srcWidth + x0];
      const v11 = src[y1 * srcWidth + x1];
      const top = v00 * (1 - fx) + v01 * fx;
      const bottom = v10 * (1 - fx) + v11 * fx;
      dst[y * dstWidth + x] = top * (1 - fy) + bottom * fy;
    }
  }
  return dst;
}

function boxMean(values, width, box) {
  let sum = 0;
  let n = 0;
  for (let y = box.y; y < box.y + box.height; y++) {
    for (let x = box.x; x < box.x + box.width; x++) {
      sum += values[y * width + x];
      n++;
    }
  }
  return sum / n;
}

// Linear-interpolation percentile over a pre-sorted ascending array.
function percentileOfSorted(sorted, p) {
  const idx = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(idx);
  const upper = Math.ceil(idx);
  if (upper >= sorted.length) return sorted[sorted.length - 1];
  const frac = idx - lower;
  return sorted[lower] * (1 - frac) + sorted[upper] * frac;
}

function clamp01(v) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

async function main() {
  await fs.mkdir(path.dirname(OUTPUT_IMAGE), { recursive: true });
  await fs.mkdir(path.dirname(REVIEW_SHEET), { recursive: true });

  console.log(`Reading source image: ${SOURCE_IMAGE}`);
  const { data: cropRgb, info: cropInfo } = await sharp(SOURCE_IMAGE)
    .extract({ left: CROP.x, top: CROP.y, width: CROP.width, height: CROP.height })
    .toColorspace('srgb')
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  if (cropInfo.channels !== 3) {
    throw new Error(`Expected a 3-channel RGB crop, got ${cropInfo.channels} channels.`);
  }
  if (cropInfo.width !== CROP.width || cropInfo.height !== CROP.height) {
    throw new Error(
      `Crop came out as ${cropInfo.width}x${cropInfo.height}, expected ${CROP.width}x${CROP.height}.`,
    );
  }

  // Background mask at the crop's native resolution.
  const isPortrait = new Uint8Array(CROP.width * CROP.height);
  let portraitPixelCount = 0;
  for (let i = 0, p = 0; i < cropRgb.length; i += 3, p++) {
    const l = luma(cropRgb[i], cropRgb[i + 1], cropRgb[i + 2]);
    if (l >= BACKGROUND_LUMA_THRESHOLD) {
      isPortrait[p] = 1;
      portraitPixelCount++;
    }
  }
  console.log(
    `Portrait pixels: ${portraitPixelCount} / ${CROP.width * CROP.height} (luma >= ${BACKGROUND_LUMA_THRESHOLD})`,
  );

  // Upscale the crop for the model so facial relief is resolved.
  const scale = MIN_LONG_SIDE / Math.max(CROP.width, CROP.height);
  const upWidth = Math.round(CROP.width * scale);
  const upHeight = Math.round(CROP.height * scale);
  const upscaledPngBuffer = await sharp(cropRgb, {
    raw: { width: CROP.width, height: CROP.height, channels: 3 },
  })
    .resize(upWidth, upHeight, { kernel: 'lanczos3' })
    .png()
    .toBuffer();

  const upscaledTmpPath = path.join(path.dirname(REVIEW_SHEET), 'portrait-upscaled-for-model.png');
  await fs.writeFile(upscaledTmpPath, upscaledPngBuffer);
  console.log(`Upscaled crop for the model: ${upWidth}x${upHeight} -> ${upscaledTmpPath}`);

  try {
    const { estimator, modelId } = await loadDepthEstimator();

    console.log('Running depth estimation ...');
    const inputImage = await RawImage.read(upscaledTmpPath);
    const output = await estimator(inputImage);
    const predictedDepth = output.predicted_depth;

    // predicted_depth is a Tensor shaped [1, h, w] (relative depth, model-native
    // resolution, not necessarily the same as the input image).
    const dims = predictedDepth.dims;
    const modelHeight = dims[dims.length - 2];
    const modelWidth = dims[dims.length - 1];
    const rawDepth = Float32Array.from(predictedDepth.data);
    console.log(`Model depth map resolution: ${modelWidth}x${modelHeight}`);

    const resizedDepth = resizeBilinear(rawDepth, modelWidth, modelHeight, CROP.width, CROP.height);

    // Percentile range computed only over portrait-luma pixels. Luma is used
    // here purely to pick which pixels contribute to the range; it never
    // touches an output pixel value.
    const portraitDepthValues = [];
    for (let p = 0; p < resizedDepth.length; p++) {
      if (isPortrait[p]) portraitDepthValues.push(resizedDepth[p]);
    }
    if (portraitDepthValues.length === 0) {
      throw new Error('No portrait pixels found to compute a depth range from.');
    }
    portraitDepthValues.sort((a, b) => a - b);
    const p1 = percentileOfSorted(portraitDepthValues, LOW_PERCENTILE);
    const p50 = percentileOfSorted(portraitDepthValues, 50);
    const p99 = percentileOfSorted(portraitDepthValues, HIGH_PERCENTILE);
    console.log(
      `Raw depth percentiles over portrait pixels: p${LOW_PERCENTILE}=${p1.toFixed(4)}, p50=${p50.toFixed(4)}, p${HIGH_PERCENTILE}=${p99.toFixed(4)}`,
    );
    if (!Number.isFinite(p1) || !Number.isFinite(p99) || p99 === p1) {
      throw new Error('Could not compute a valid percentile depth range over portrait pixels.');
    }
    const min = p1;
    const max = p99;

    const noseMeanRaw = boxMean(resizedDepth, CROP.width, NOSE_BOX);
    const hairMeanRaw = boxMean(resizedDepth, CROP.width, HAIR_BOX);
    console.log('Raw model depth (before normalisation, direction not yet known):');
    console.log(`  nose/cheek box mean = ${noseMeanRaw.toFixed(4)}`);
    console.log(`  hair box mean       = ${hairMeanRaw.toFixed(4)}`);

    // Depth Anything's usual convention is larger raw value = nearer the
    // camera. Verify rather than assume: the nose should read nearer than the
    // hair at the back of the head. Invert the mapping if it does not.
    const inverted = noseMeanRaw <= hairMeanRaw;
    console.log(
      inverted
        ? 'Nose is not nearer than hair in the raw output -> inverting so 255 = nearest.'
        : 'Nose is nearer than hair in the raw output, as expected -> no inversion needed.',
    );

    // Every pixel of the crop gets a written depth value, no background
    // masking of the output. Values outside the p1..p99 range are clamped.
    const depth8 = new Uint8ClampedArray(CROP.width * CROP.height);
    for (let p = 0; p < resizedDepth.length; p++) {
      let t = clamp01((resizedDepth[p] - min) / (max - min)); // 0..1, larger raw = larger t
      if (inverted) t = 1 - t;
      depth8[p] = Math.round(t * 255);
    }

    const depth8Float = Float32Array.from(depth8);
    const noseMeanFinal = boxMean(depth8Float, CROP.width, NOSE_BOX);
    const hairMeanFinal = boxMean(depth8Float, CROP.width, HAIR_BOX);
    console.log('Final normalised depth (0..255, 255 = nearest the camera):');
    console.log(`  nose/cheek box mean = ${noseMeanFinal.toFixed(2)}`);
    console.log(`  hair box mean       = ${hairMeanFinal.toFixed(2)}`);
    if (noseMeanFinal <= hairMeanFinal) {
      throw new Error('Sanity check failed: nose is still not nearer than hair after normalisation.');
    }

    // Small Gaussian blur on the depth channel so per-pixel model noise does
    // not become z jitter in the point cloud.
    const { data: blurredDepth8, info: blurredInfo } = await sharp(Buffer.from(depth8), {
      raw: { width: CROP.width, height: CROP.height, channels: 1 },
    })
      .blur(DEPTH_BLUR_SIGMA)
      // Without this, sharp's raw() output silently widens to 3 channels
      // after blur() even though metadata() still reports 1 channel/b-w -
      // forcing the colourspace back to greyscale keeps it a true 1-channel
      // buffer so the indexing below stays aligned.
      .toColourspace('b-w')
      .raw()
      .toBuffer({ resolveWithObject: true });
    if (blurredInfo.channels !== 1 || blurredDepth8.length !== CROP.width * CROP.height) {
      throw new Error(
        `Blurred depth buffer came out as ${blurredInfo.channels} channels / ${blurredDepth8.length} bytes, expected 1 channel / ${CROP.width * CROP.height} bytes.`,
      );
    }
    console.log(`Applied Gaussian blur to depth channel: sigma=${DEPTH_BLUR_SIGMA}px`);

    // Pack: left half = colour crop (RGB), right half = depth (grey, R=G=B=depth).
    const packedWidth = CROP.width * 2;
    const packed = Buffer.alloc(packedWidth * CROP.height * 3);
    for (let y = 0; y < CROP.height; y++) {
      for (let x = 0; x < CROP.width; x++) {
        const srcIdx = (y * CROP.width + x) * 3;
        const leftIdx = (y * packedWidth + x) * 3;
        packed[leftIdx] = cropRgb[srcIdx];
        packed[leftIdx + 1] = cropRgb[srcIdx + 1];
        packed[leftIdx + 2] = cropRgb[srcIdx + 2];

        const d = blurredDepth8[y * CROP.width + x];
        const rightIdx = (y * packedWidth + (x + CROP.width)) * 3;
        packed[rightIdx] = d;
        packed[rightIdx + 1] = d;
        packed[rightIdx + 2] = d;
      }
    }

    await sharp(packed, { raw: { width: packedWidth, height: CROP.height, channels: 3 } })
      .png()
      .toFile(OUTPUT_IMAGE);
    console.log(`Wrote ${OUTPUT_IMAGE}`);

    // Review sheet: the packed image is already about 1400x650, so it is
    // copied as-is rather than resized again.
    await fs.copyFile(OUTPUT_IMAGE, REVIEW_SHEET);
    console.log(`Wrote review sheet: ${REVIEW_SHEET}`);

    // Verify the written PNG's dimensions and channel count by reading it back.
    const check = await sharp(OUTPUT_IMAGE).metadata();
    console.log(
      `Verification: ${OUTPUT_IMAGE} is ${check.width}x${check.height}, ${check.channels} channels, hasAlpha=${check.hasAlpha}, format=${check.format}`,
    );
    if (check.width !== 1400 || check.height !== 650 || check.channels !== 3 || check.hasAlpha) {
      throw new Error('Output PNG does not match the required 1400x650, 8-bit RGB, no-alpha spec.');
    }

    console.log(`Model used: ${modelId}`);
  } finally {
    await fs.unlink(upscaledTmpPath).catch(() => {});
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
