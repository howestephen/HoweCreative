import portraitSource from "../../../docs/reviews/2026-09-07-design-reset/portrait-reference.png";

export { portraitSource };
// This crop deliberately stops above the navigation baked into the concept.
// The source is an approved 2D likeness. Its shallow relief is art-directed,
// not a claim to reconstruct Stephen's actual facial geometry.
export const PORTRAIT_CROP = { x: 440, y: 8, width: 700, height: 650 };
export const clamp = (value: number) => Math.min(1, Math.max(0, value));
export const smooth = (start: number, end: number, value: number) => {
  const t = clamp((value - start) / (end - start));
  return t * t * (3 - 2 * t);
};

export const portraitFraming = (width: number, height: number) => {
  const aspect = width / Math.max(1, height);
  const viewHeight = Math.tan(Math.PI / 9) * 12;
  const scale = Math.min(viewHeight * (aspect < 0.8 ? 0.6 : 0.95) / 4.6, viewHeight * aspect * 0.91 / (4.6 * 700 / 650 * 0.7));
  return {
    scale,
    pixelHeight: scale * 4.6 / viewHeight * height,
    pixelOffset: (aspect > 1.1 ? 0.32 : -0.7 * scale) / viewHeight * height,
  };
};

export const scrollState = (y: number, height: number, workTop: number, endTop: number) => ({
  release: smooth(height * 0.08, workTop - height * 0.55, y),
  travel: smooth(workTop - height * 0.55, endTop - height * 0.7, y),
  ending: smooth(endTop - height * 0.7, endTop + height * 0.12, y),
  intro: 1 - smooth(height * 0.06, height * 0.45, y),
});

const random = (seed: number) => {
  const n = Math.sin(seed * 127.1 + 311.7) * 43758.5453123;
  return n - Math.floor(n);
};

// The view enters a layered portrait before opening into the ambient field.
export const portraitPhases = (progress: number) => ({
  separate: smooth(0.015, 0.55, progress),
  dissolve: smooth(0.55, 1, progress),
});

export const isPortraitSurface = (target: EventTarget | null) => target instanceof HTMLElement
  && Boolean(target.closest('.particle-hero'))
  && !target.closest('a, button, input, textarea, select, [role="dialog"], [contenteditable]');

export const acceptsPortraitPress = (pointerType: string, button: number, release: number, paused: boolean) =>
  pointerType === 'mouse' && button === 0 && release < 0.18 && !paused;

export const samplePortrait = (pixels: Uint8ClampedArray, width: number, height: number) => {
  const positions: number[] = [];
  const colours: number[] = [];
  const seeds: number[] = [];
  const depths: number[] = [];
  // A summed-area table smooths source grain into coherent contour surfaces.
  // This is an image-derived relief, not inferred physical facial geometry.
  const stride = width + 1;
  const integral = new Float64Array(stride * (height + 1));
  for (let y = 0; y < height; y++) {
    let row = 0;
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      row += (pixels[i] * 0.2126 + pixels[i + 1] * 0.7152 + pixels[i + 2] * 0.0722) / 255;
      integral[(y + 1) * stride + x + 1] = integral[y * stride + x + 1] + row;
    }
  }
  const radius = Math.max(1, Math.round(width * 0.035));
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const light = (pixels[i] * 0.2126 + pixels[i + 1] * 0.7152 + pixels[i + 2] * 0.0722) / 255;
      const u = x / (width - 1);
      const v = y / (height - 1);
      const edge = smooth(0, 0.035, u) * (1 - smooth(0.965, 1, u)) * (1 - smooth(0.85, 1, v));
      if (light < 0.027 || edge < 0.005 || pixels[i + 3] === 0) continue;
      const seed = y * width + x;
      const r = random(seed);
      // Jitter is less than half a source pixel; tonal detail stays resolved.
      const px = (u - 0.5 + (r - 0.5) / width * 0.65) * (700 / 650) * 4.6;
      const py = (0.5 - v + (random(seed + 2) - 0.5) / height * 0.65) * 4.6;
      const z = light * 0.19 + Math.sin(u * Math.PI) * 0.12;
      const correction = (6 - z) / 6;
      positions.push(px * correction, py * correction, z);
      colours.push(
        Math.pow(pixels[i] / 255, 2.2) * edge,
        Math.pow(pixels[i + 1] / 255, 2.2) * edge,
        Math.pow(pixels[i + 2] / 255, 2.2) * edge,
      );
      seeds.push(r, random(seed + 17), random(seed + 71), u);
      const x0 = Math.max(0, x - radius), x1 = Math.min(width, x + radius + 1);
      const y0 = Math.max(0, y - radius), y1 = Math.min(height, y + radius + 1);
      const blurred = (integral[y1 * stride + x1] - integral[y0 * stride + x1] - integral[y1 * stride + x0] + integral[y0 * stride + x0]) / ((x1 - x0) * (y1 - y0));
      const relief = clamp(0.18 + Math.sqrt(blurred) * 0.7 + (light - blurred) * 0.05);
      // Continuous contour sheets avoid artificial terraces across skin detail.
      depths.push(relief);
    }
  }
  return { positions: new Float32Array(positions), colours: new Float32Array(colours), seeds: new Float32Array(seeds), depths: new Float32Array(depths) };
};

export type ParticleMotion = {
  release: number;
  travel: number;
  ending: number;
  pointerX: number;
  pointerY: number;
  velocity: number;
  paused: boolean;
  pressed?: boolean;
  invalidate?: () => void;
};

export const vertexShader = /* glsl */ `
  attribute vec3 aColour;
  attribute vec4 aSeed;
  attribute float aDepth;
  uniform float uRelease;
  uniform float uSeparate;
  uniform float uDissolve;
  uniform float uTravel;
  uniform float uEnding;
  uniform float uTime;
  uniform float uDpr;
  uniform float uScale;
  uniform float uAspect;
  uniform float uPixel;
  uniform vec2 uPointer;
  uniform float uPress;
  varying vec3 vColour;
  varying float vOpacity;
  varying float vBlur;
  const float TAU = 6.28318530718;
  void main() {
    float r = aSeed.x;
    float s = aSeed.y;
    float t = aSeed.z;
    float threshold = (1.0 - aDepth) * 0.24 + s * 0.1;
    float release = smoothstep(threshold, 0.75 + threshold * 0.6, uDissolve);
    float angle = s * TAU;
    float ribbon = floor(s * 5.0);
    vec3 p = position * uScale;
    p.x += uAspect > 1.1 ? 0.32 : -0.7 * uScale;
    p.y += 0.06;
    vec3 original = p;
    vec3 layered = original;
    float contourDepth = ((aDepth - 0.28) * 3.8 + (t - 0.5) * 0.1) * uScale * uSeparate;
    layered.z += contourDepth;
    // Keep facial proportions at the initial camera plane. The camera advance
    // then reveals differential scale without inflating every bright cheek.
    layered.xy *= (6.0 - layered.z) / (6.0 - original.z);
    // Most movement is in depth. A small lateral offset makes its sheets visible.
    layered.x += contourDepth * 0.13;
    layered.y += contourDepth * 0.035;
    // Continuous, coherent filaments, not independent radial explosions.
    vec3 plume = vec3(
      p.x - 2.8 - r * 5.8,
      p.y * 0.3 + sin(r * 4.0 + position.y * 0.6) * 1.3,
      cos(r * 4.0 + position.y * 0.6) * 1.6 + (s - 0.5) * 0.5
    );
    vec3 field = vec3(
      (r - 0.5) * 19.0,
      sin(r * 8.0 + ribbon * 0.38) * 1.35 + (s - 0.5) * 2.8,
      cos(r * 7.0 + ribbon * 0.7) * 2.4 - 1.6 + (t - 0.5) * 4.0
    );
    field.y += sin(angle + uTime * 0.09) * 0.13;
    field.x += uTravel * (1.5 + t * 1.3);
    field.z += uTravel * 1.0;
    vec3 flowing = mix(plume, field, smoothstep(0.42, 1.0, uRelease));
    p = mix(layered, flowing, release);
    // The closing form is a tilted, diffuse arc with space for readable type.
    float arc = r * TAU;
    float radius = 2.2 + pow(s, 2.0) * 1.4;
    vec3 ending = vec3(
      cos(arc) * radius * min(1.65, uAspect * 0.92),
      sin(arc) * radius * 0.56,
      sin(arc) * 1.3 + (t - 0.5) * 1.25 - 0.8
    );
    ending.y += sin(arc * 3.0 + uTime * 0.1) * 0.11;
    p = mix(p, ending, uEnding);
    // Only a held press parts the points. Passive hover leaves the photo intact.
    p.x += uPointer.x * (p.z + 0.3) * 0.11 * release;
    p.y += uPointer.y * (p.z + 0.3) * 0.08 * release;
    vec2 plane = vec2(2.18382 * uAspect, 2.18382) * ((6.0 - original.z) / 6.0);
    float interactive = 1.0 - smoothstep(0.08, 0.4, uRelease);
    vec2 away = original.xy - uPointer * plane;
    float influence = 1.0 - smoothstep(0.0, 0.48 * uScale, length(away));
    float pressure = influence * uPress * interactive;
    p.xy += normalize(away + vec2(0.001)) * pressure * 0.23 * uScale;
    p.z -= pressure * 0.18 * uScale;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float depth = -mv.z;
    float focus = abs(depth - 6.0);
    vBlur = smoothstep(0.7, 3.8, focus) * max(release, uSeparate * 0.7);
    float sparsity = 1.0 - smoothstep(0.025, 0.055, t);
    float fieldAlpha = mix(0.002, 0.72, sparsity) * (0.35 + s * 0.65);
    vOpacity = mix(0.97, fieldAlpha, release) * smoothstep(0.3, 1.5, depth);
    vOpacity *= mix(1.0, 0.46, uEnding);
    vColour = mix(aColour * 1.08, vec3(0.62, 0.65, 0.67) * (0.45 + r * 0.55), release);
    float portraitSize = uPixel * 6.0 / max(1.0, depth) + vBlur * 3.0;
    float fieldSize = (0.012 + pow(s, 16.0) * 0.072) * 520.0 / max(0.5, depth);
    gl_PointSize = min(42.0, mix(portraitSize, fieldSize + vBlur * 8.0, release)) * uDpr;
    gl_Position = projectionMatrix * mv;
  }
`;

export const fragmentShader = /* glsl */ `
  varying vec3 vColour;
  varying float vOpacity;
  varying float vBlur;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    if (d > 1.0) discard;
    float sharp = 1.0 - smoothstep(0.65, 1.0, d);
    float soft = exp(-d * d * 5.0) * 0.5;
    float alpha = mix(sharp, soft, vBlur) * vOpacity;
    #ifdef CORE_PASS
      // Solid in-focus centres write depth; soft optical halos remain blended.
      if (alpha < 0.3 || d > 0.55 || vBlur > 0.35) discard;
      gl_FragColor = vec4(vColour, 1.0);
    #else
      gl_FragColor = vec4(vColour, alpha);
    #endif
    #include <colorspace_fragment>
  }
`;
